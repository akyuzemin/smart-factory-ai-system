const express = require('express');
const cors = require('cors');
const mqtt = require('mqtt');
const pool = require('./db');

const app = express();
const PORT = 5000;

const AI_SERVICE_URLS = [
  process.env.AI_SERVICE_URL,
  'http://ai-service:8000',
  'http://localhost:8000'
].filter(Boolean);

app.use(cors());
app.use(express.json());


// ============================================================
// VARSAYILAN MAKİNELER
// ============================================================

const defaultMachines = [
  ['CNC İşleme Merkezi', 'CNC-01', 'Üretim Hattı A', 'Çalışıyor', '2026-07-12'],
  ['Hidrolik Pres', 'PRS-02', 'Şekillendirme', 'Bakımda', '2026-07-08'],
  ['Robotik Kaynak Ünitesi', 'RBW-03', 'Kaynak Hattı', 'Çalışıyor', '2026-07-16'],
  ['Endüstriyel Paketleme', 'PKG-04', 'Paketleme', 'Arızalı', '2026-07-03'],
  ['Konveyör Sistemi', 'CNV-05', 'Lojistik', 'Çalışıyor', '2026-07-18'],
  ['Enjeksiyon Kalıplama', 'INJ-06', 'Plastik Üretim', 'Bakımda', '2026-07-10'],
];

const machineColumns =
  'id, name, code, department, status, last_maintenance';


// ============================================================
// DATABASE
// ============================================================

async function initializeDatabase() {

  await pool.query(`
    CREATE TABLE IF NOT EXISTS machines (
      id SERIAL PRIMARY KEY,
      name VARCHAR(100) NOT NULL,
      location VARCHAR(100),
      code VARCHAR(50),
      department VARCHAR(100),
      status VARCHAR(20) NOT NULL DEFAULT 'Çalışıyor',
      last_maintenance DATE
    );

    CREATE TABLE IF NOT EXISTS sensors (
      id SERIAL PRIMARY KEY,
      machine_id INTEGER REFERENCES machines(id),
      name VARCHAR(100) NOT NULL,
      sensor_type VARCHAR(50),
      unit VARCHAR(20)
    );

    CREATE TABLE IF NOT EXISTS sensor_logs (
      id SERIAL PRIMARY KEY,
      sensor_id INTEGER REFERENCES sensors(id),
      value NUMERIC(10, 2) NOT NULL,
      timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `);


  // ==========================================================
  // ESKİ DATABASE'LER İÇİN GÜNCELLEME
  // ==========================================================

  await pool.query(`
    ALTER TABLE machines
    ADD COLUMN IF NOT EXISTS code VARCHAR(50);

    ALTER TABLE machines
    ADD COLUMN IF NOT EXISTS department VARCHAR(100);

    ALTER TABLE machines
    ADD COLUMN IF NOT EXISTS status VARCHAR(20)
    NOT NULL DEFAULT 'Çalışıyor';

    ALTER TABLE machines
    ADD COLUMN IF NOT EXISTS last_maintenance DATE;
  `);


  // ==========================================================
  // MAKİNELER YOKSA OLUŞTUR
  // ==========================================================

  const machineCount =
    await pool.query(
      'SELECT COUNT(*) FROM machines'
    );

  if (
    Number(machineCount.rows[0].count) === 0
  ) {

    await pool.query(
      `
      INSERT INTO machines
      (
        name,
        code,
        department,
        status,
        last_maintenance
      )
      VALUES
      ${defaultMachines
        .map(
          (_, index) =>
            `($${index * 5 + 1},
              $${index * 5 + 2},
              $${index * 5 + 3},
              $${index * 5 + 4},
              $${index * 5 + 5})`
        )
        .join(', ')}
      `,
      defaultMachines.flat()
    );

    console.log(
      'Varsayılan makineler oluşturuldu.'
    );
  }


  // ==========================================================
  // SENSÖRLER
  // ==========================================================

  const sensorCount =
    await pool.query(
      'SELECT COUNT(*) FROM sensors'
    );

  const primaryMachine =
    await pool.query(
      'SELECT id FROM machines ORDER BY id LIMIT 1'
    );

  const primaryMachineId =
    primaryMachine.rows[0].id;


  // Eski sistemde sensör yoksa temel sensörleri oluştur.
  if (
    Number(sensorCount.rows[0].count) === 0
  ) {

    await pool.query(
      `
      INSERT INTO sensors
      (
        id,
        machine_id,
        name,
        sensor_type,
        unit
      )
      VALUES
      (1, $1, 'Motor 1 Sıcaklığı', 'temperature', '°C'),
      (2, $1, 'Ana Valf Basıncı', 'pressure', 'Bar'),
      (3, $1, 'Ortam Nemi', 'humidity', '%')
      `,
      [primaryMachineId]
    );

    console.log(
      'Varsayılan sensörler oluşturuldu.'
    );
  }


  // ==========================================================
  // BOŞ MAKİNE ID'LERİNİ DOLDUR
  // ==========================================================

  await pool.query(
    `
    UPDATE sensors
    SET machine_id = $1
    WHERE machine_id IS NULL
    `,
    [primaryMachineId]
  );


  // ==========================================================
  // HER MAKİNE İÇİN 3 SENSÖR OLUŞTUR
  // ==========================================================

  const machineResult =
    await pool.query(
      `
      SELECT
        id,
        name,
        code,
        status
      FROM machines
      ORDER BY id
      `
    );


  for (
    const machine of machineResult.rows
  ) {

    const sensorDefinitions = [

      [
        `${machine.name} Motor Sıcaklığı`,
        'temperature',
        '°C'
      ],

      [
        `${machine.name} Hat Basıncı`,
        'pressure',
        'Bar'
      ],

      [
        `${machine.name} Ortam Nemi`,
        'humidity',
        '%'
      ]

    ];


    for (
      const [
        name,
        sensorType,
        unit
      ] of sensorDefinitions
    ) {

      const existing =
        await pool.query(
          `
          SELECT id
          FROM sensors
          WHERE machine_id = $1
          AND sensor_type = $2
          LIMIT 1
          `,
          [
            machine.id,
            sensorType
          ]
        );


      if (
        existing.rows.length === 0
      ) {

        await pool.query(
          `
          INSERT INTO sensors
          (
            machine_id,
            name,
            sensor_type,
            unit
          )
          VALUES
          ($1, $2, $3, $4)
          `,
          [
            machine.id,
            name,
            sensorType,
            unit
          ]
        );
      }
    }
  }


  console.log(
    'Veritabanı tabloları ve makine sensörleri kontrol edildi/oluşturuldu.'
  );
}


// ============================================================
// MQTT
// ============================================================

function startMqttIngestion() {

  const mqttClient =
    mqtt.connect(
      'mqtt://broker.emqx.io'
    );


  mqttClient.on(
    'connect',
    () => {

      console.log(
        '[Node.js] MQTT Broker ağına bağlandı.'
      );


      mqttClient.subscribe(
        'atasayar_kocaali/motor1/sicaklik',
        (error) => {

          if (error) {

            console.error(
              'MQTT kanalına abone olunamadı:',
              error
            );

            return;
          }


          console.log(
            '[Node.js] Motor 1 sıcaklık kanalına abone olundu.'
          );
        }
      );
    }
  );


  mqttClient.on(
    'message',
    async (
      topic,
      message
    ) => {

      try {

        const payload =
          JSON.parse(
            message.toString()
          );


        await pool.query(
          `
          INSERT INTO sensor_logs
          (
            sensor_id,
            value
          )
          VALUES
          ($1, $2)
          `,
          [
            payload.sensor_id,
            payload.value
          ]
        );


        console.log(
          `[Node.js] Yeni veri alındı (${topic}): ${payload.value}`
        );

      } catch (error) {

        console.error(
          'MQTT verisi işlenemedi:',
          error
        );
      }
    }
  );
}


// ============================================================
// MERKEZİ FABRİKA VERİ SİMÜLATÖRÜ
// ============================================================
//
// Simülatör frontend'de çalışmaz.
//
// Backend tarafında çalışır.
//
// Simülatör
//      ↓
// PostgreSQL sensor_logs
//      ↓
// API
//      ↓
// Frontend
//
// Her 2 saniyede sensör verisi üretir.
// ============================================================

const simulatorState =
  new Map();


// ============================================================
// DEĞER SINIRLAMA
// ============================================================

function clamp(
  value,
  min,
  max
) {

  return Math.min(
    max,
    Math.max(
      min,
      value
    )
  );
}


// ============================================================
// YAVAŞ DEĞİŞEN RANDOM DEĞER
// ============================================================

function randomWalk(
  previous,
  min,
  max,
  step
) {

  const next =
    previous +
    (Math.random() * 2 - 1) *
    step;


  return Number(
    clamp(
      next,
      min,
      max
    ).toFixed(2)
  );
}


// ============================================================
// İLK SENSÖR DEĞERİ
// ============================================================

function getInitialSensorValue(
  sensorType
) {

  if (
    sensorType ===
    'temperature'
  ) {

    return (
      68 +
      Math.random() * 8
    );
  }


  if (
    sensorType ===
    'pressure'
  ) {

    return (
      82 +
      Math.random() * 10
    );
  }


  if (
    sensorType ===
    'humidity'
  ) {

    return (
      45 +
      Math.random() * 10
    );
  }


  return 50;
}


// ============================================================
// SENSÖR DEĞERİ ÜRET
// ============================================================

function getSensorValue(
  sensor,
  machine
) {

  const key =
    String(sensor.id);


  if (
    !simulatorState.has(
      key
    )
  ) {

    simulatorState.set(
      key,
      getInitialSensorValue(
        sensor.sensor_type
      )
    );
  }


  const previous =
    simulatorState.get(
      key
    );


  let value;


  // ==========================================================
  // SICAKLIK
  // ==========================================================

  if (
    sensor.sensor_type ===
    'temperature'
  ) {

    const min =
      machine.status ===
      'Arızalı'
        ? 76
        : 55;


    const max =
      machine.status ===
      'Arızalı'
        ? 92
        : 82;


    value =
      randomWalk(
        previous,
        min,
        max,
        2.2
      );
  }


  // ==========================================================
  // BASINÇ
  // ==========================================================

  else if (
    sensor.sensor_type ===
    'pressure'
  ) {

    const min =
      machine.status ===
      'Arızalı'
        ? 105
        : 70;


    const max =
      machine.status ===
      'Arızalı'
        ? 140
        : 125;


    value =
      randomWalk(
        previous,
        min,
        max,
        3.5
      );
  }


  // ==========================================================
  // NEM
  // ==========================================================

  else if (
    sensor.sensor_type ===
    'humidity'
  ) {

    value =
      randomWalk(
        previous,
        35,
        75,
        2.5
      );
  }


  else {

    value =
      randomWalk(
        previous,
        0,
        100,
        4
      );
  }


  simulatorState.set(
    key,
    value
  );


  return value;
}


// ============================================================
// FABRİKA VERİSİ ÜRET
// ============================================================

async function simulateFactoryData() {

  try {

    const result =
      await pool.query(
        `
        SELECT
          s.id,
          s.machine_id,
          s.sensor_type,
          s.name,
          s.unit,
          m.name AS machine_name,
          m.code AS machine_code,
          m.status AS machine_status
        FROM sensors s
        JOIN machines m
          ON m.id = s.machine_id
        ORDER BY
          s.machine_id,
          s.id
        `
      );


    // ========================================================
    // HER SENSÖRE YENİ DEĞER
    // ========================================================

    for (
      const sensor
      of result.rows
    ) {

      const value =
        getSensorValue(
          sensor,
          {
            status:
              sensor.machine_status
          }
        );


      await pool.query(
        `
        INSERT INTO sensor_logs
        (
          sensor_id,
          value
        )
        VALUES
        ($1, $2)
        `,
        [
          sensor.id,
          value
        ]
      );


      console.log(
        `[SIM] ${sensor.machine_code} | ${sensor.sensor_type} | ${value}${sensor.unit}`
      );
    }


    // ========================================================
    // SENSÖR DEĞERLERİNE GÖRE MAKİNE DURUMU
    // ========================================================

    await pool.query(
      `
      UPDATE machines m

      SET status =
        CASE

          WHEN EXISTS (

            SELECT 1

            FROM sensors s

            JOIN LATERAL (

              SELECT value

              FROM sensor_logs sl

              WHERE
                sl.sensor_id =
                s.id

              ORDER BY
                sl.timestamp DESC

              LIMIT 1

            ) latest
            ON TRUE

            WHERE
              s.machine_id =
              m.id

            AND (

              (
                s.sensor_type =
                'temperature'

                AND latest.value >
                88
              )

              OR

              (
                s.sensor_type =
                'pressure'

                AND latest.value >
                135
              )

            )

          )

          THEN 'Arızalı'


          WHEN EXISTS (

            SELECT 1

            FROM sensors s

            JOIN LATERAL (

              SELECT value

              FROM sensor_logs sl

              WHERE
                sl.sensor_id =
                s.id

              ORDER BY
                sl.timestamp DESC

              LIMIT 1

            ) latest
            ON TRUE

            WHERE
              s.machine_id =
              m.id

            AND (

              (
                s.sensor_type =
                'temperature'

                AND latest.value >
                80
              )

              OR

              (
                s.sensor_type =
                'pressure'

                AND latest.value >
                130
              )

              OR

              (
                s.sensor_type =
                'humidity'

                AND latest.value >
                70
              )

            )

          )

          THEN 'Bakımda'


          ELSE 'Çalışıyor'

        END
      `
    );


  } catch (
    error
  ) {

    console.error(
      '[SIM] Veri üretimi sırasında hata:',
      error.message
    );
  }
}


// ============================================================
// SİMÜLATÖRÜ BAŞLAT
// ============================================================

function startFactorySimulator() {

  console.log(
    '🔄 Smart Factory merkezi veri simülatörü başlatıldı.'
  );


  console.log(
    '📡 Sensörler her 2 saniyede PostgreSQL sensor_logs tablosuna veri yazacak.'
  );


  // İlk veriyi hemen üret.

  simulateFactoryData();


  // Sonrasında her 2 saniyede bir.

  setInterval(
    () => {

      simulateFactoryData();

    },
    2000
  );
}


// ============================================================
// AI ANALİZİ
// ============================================================

async function fetchAiAnalysis() {

  let lastError =
    null;


  for (
    const baseUrl
    of AI_SERVICE_URLS
  ) {

    try {

      const response =
        await fetch(
          `${baseUrl}/api/analyze/motor1`
        );


      if (
        !response.ok
      ) {

        throw new Error(
          `AI servisi hatalı durum döndürdü: ${response.status}`
        );
      }


      return await response.json();


    } catch (
      error
    ) {

      lastError =
        error;


      console.warn(
        `[Node.js] AI servisi denendi ama ulaşılamadı: ${baseUrl}`,
        error.message
      );
    }
  }


  throw (
    lastError ||
    new Error(
      'AI servisi erişilemedi.'
    )
  );
}


// ============================================================
// BAKIM GEÇMİŞİ
// ============================================================

function getMachineMaintenanceHistory(
  machineId
) {

  const historyByMachine = {

    1: [
      {
        id: 1,
        title:
          'Motor yağ değişimi',
        date:
          '2026-07-12',
        note:
          'Yıllık bakım planı kapsamında tamamlandı.'
      },

      {
        id: 2,
        title:
          'Kritik sıcaklık kontrolü',
        date:
          '2026-07-08',
        note:
          'Sıcaklık delta analizi yapıldı.'
      }
    ],


    2: [
      {
        id: 3,
        title:
          'Hidrolik filtre değişimi',
        date:
          '2026-07-10',
        note:
          'Basınç düşüşü sonrası bakım yapıldı.'
      }
    ],


    3: [
      {
        id: 4,
        title:
          'Robot kol kalibrasyonu',
        date:
          '2026-07-11',
        note:
          'Hassas hareket testi tamamlandı.'
      }
    ]

  };


  return (
    historyByMachine[
      machineId
    ] ||
    [
      {
        id: 5,
        title:
          'Standart bakım planı',
        date:
          '2026-07-01',
        note:
          'Makine için genel kontrol planı oluşturuldu.'
      }
    ]
  );
}


// ============================================================
// MACHINE ID
// ============================================================

function getMachineId(
  value
) {

  const machineId =
    Number(value);


  return (
    Number.isInteger(
      machineId
    ) &&
    machineId > 0
  )
    ? machineId
    : null;
}


// ============================================================
// SENSOR STATUS
// ============================================================

function getSensorStatus(
  sensorType,
  latestValue
) {

  if (
    latestValue === null ||
    latestValue === undefined
  ) {

    return 'Veri Yok';
  }


  if (
    sensorType ===
      'temperature' &&
    latestValue > 80
  ) {

    return 'Kritik';
  }


  if (
    sensorType ===
      'pressure' &&
    latestValue > 130
  ) {

    return 'Kritik';
  }


  if (
    sensorType ===
      'humidity' &&
    latestValue > 70
  ) {

    return 'Kritik';
  }


  return 'Normal';
}


// ============================================================
// MAKİNE BUL
// ============================================================

async function findMachine(
  machineId
) {

  const result =
    await pool.query(
      `
      SELECT
        ${machineColumns}
      FROM machines
      WHERE id = $1
      `,
      [machineId]
    );


  return result.rows[0];
}


// ============================================================
// MACHINES
// ============================================================

app.get(
  '/api/machines',
  async (
    req,
    res
  ) => {

    try {

      const result =
        await pool.query(
          `
          SELECT
            ${machineColumns}
          FROM machines
          ORDER BY id
          `
        );


      const machinesWithDetails =
        result.rows.map(
          machine => {

            const efficiencyRanges = {

              'Çalışıyor':
                [85, 98],

              'Bakımda':
                [60, 84],

              'Arızalı':
                [20, 59]

            };


            const [
              minEfficiency,
              maxEfficiency
            ] =
              efficiencyRanges[
                machine.status
              ] ||
              [70, 85];


            const efficiency =
              Math.floor(
                Math.random() *
                (
                  maxEfficiency -
                  minEfficiency +
                  1
                ) +
                minEfficiency
              );


            const nextMaintenance =
              machine.last_maintenance
                ? new Date(
                    machine.last_maintenance
                  )
                : new Date();


            nextMaintenance.setMonth(
              nextMaintenance.getMonth() +
              3
            );


            return {

              ...machine,

              efficiency,

              next_maintenance:
                nextMaintenance
                  .toISOString()
                  .split('T')[0]

            };

          }
        );


      res.json(
        machinesWithDetails
      );


    } catch (
      error
    ) {

      console.error(
        'Makineler alınamadı:',
        error
      );


      res.status(
        500
      ).json({
        message:
          'Makine verileri alınamadı.'
      });
    }
  }
);


// ============================================================
// MACHINE DETAIL
// ============================================================

app.get(
  '/api/machines/:id',
  async (
    req,
    res
  ) => {

    const machineId =
      getMachineId(
        req.params.id
      );


    if (!machineId) {

      return res
        .status(400)
        .json({
          message:
            'Geçersiz makine kimliği.'
        });
    }


    try {

      const machine =
        await findMachine(
          machineId
        );


      if (!machine) {

        return res
          .status(404)
          .json({
            message:
              'Makine bulunamadı.'
          });
      }


      return res.json(
        machine
      );


    } catch (
      error
    ) {

      console.error(
        'Makine detayı alınamadı:',
        error
      );


      return res
        .status(500)
        .json({
          message:
            'Makine detayı alınamadı.'
        });
    }
  }
);


// ============================================================
// MACHINE SENSORS
// ============================================================

app.get(
  '/api/machines/:id/sensors',
  async (
    req,
    res
  ) => {

    const machineId =
      getMachineId(
        req.params.id
      );


    if (!machineId) {

      return res
        .status(400)
        .json({
          message:
            'Geçersiz makine kimliği.'
        });
    }


    try {

      const machine =
        await findMachine(
          machineId
        );


      if (!machine) {

        return res
          .status(404)
          .json({
            message:
              'Makine bulunamadı.'
          });
      }


      const result =
        await pool.query(
          `
          SELECT

            s.id,

            s.name,

            s.unit,

            latest.value
              AS latest_value,

            CASE

              WHEN
                latest.value IS NULL
              THEN
                'Veri Yok'

              WHEN
                s.sensor_type =
                'temperature'
                AND latest.value > 80
              THEN
                'Kritik'

              WHEN
                s.sensor_type =
                'pressure'
                AND latest.value > 130
              THEN
                'Kritik'

              WHEN
                s.sensor_type =
                'humidity'
                AND latest.value > 70
              THEN
                'Kritik'

              ELSE
                'Normal'

            END AS status

          FROM sensors s

          LEFT JOIN LATERAL (

            SELECT value

            FROM sensor_logs

            WHERE
              sensor_id =
              s.id

            ORDER BY
              timestamp DESC

            LIMIT 1

          ) latest
          ON TRUE

          WHERE
            s.machine_id =
            $1

          ORDER BY
            s.id
          `,
          [machineId]
        );


      return res.json(
        result.rows
      );


    } catch (
      error
    ) {

      console.error(
        'Bağlı sensörler alınamadı:',
        error
      );


      return res
        .status(500)
        .json({
          message:
            'Bağlı sensörler alınamadı.'
        });
    }
  }
);


// ============================================================
// ALL SENSORS
// ============================================================

app.get(
  '/api/sensors',
  async (
    req,
    res
  ) => {

    try {

      const result =
        await pool.query(
          `
          SELECT

            s.id,

            s.name,

            s.name AS title,

            s.sensor_type,

            s.unit,

            m.id AS machine_id,

            m.name AS machine_name,

            latest.value AS value,

            CASE

              WHEN
                latest.value IS NULL
              THEN
                'Veri Yok'

              WHEN
                s.sensor_type =
                'temperature'
                AND latest.value > 80
              THEN
                'Kritik'

              WHEN
                s.sensor_type =
                'pressure'
                AND latest.value > 130
              THEN
                'Kritik'

              WHEN
                s.sensor_type =
                'humidity'
                AND latest.value > 70
              THEN
                'Kritik'

              ELSE
                'Normal'

            END AS status

          FROM sensors s

          LEFT JOIN machines m
            ON
              m.id =
              s.machine_id

          LEFT JOIN LATERAL (

            SELECT value

            FROM sensor_logs

            WHERE
              sensor_id =
              s.id

            ORDER BY
              timestamp DESC

            LIMIT 1

          ) latest
          ON TRUE

          ORDER BY
            s.id
          `
        );


      res.json(
        result.rows
      );


    } catch (
      error
    ) {

      console.error(
        'Sensörler alınamadı:',
        error
      );


      res
        .status(500)
        .send(
          'Veritabanı hatası'
        );
    }
  }
);


// ============================================================
// SENSOR DETAIL
// ============================================================

app.get(
  '/api/sensors/:id',
  async (
    req,
    res
  ) => {

    const sensorId =
      Number(
        req.params.id
      );


    if (
      !Number.isInteger(
        sensorId
      ) ||
      sensorId <= 0
    ) {

      return res
        .status(400)
        .json({
          message:
            'Geçersiz sensör kimliği.'
        });
    }


    try {

      const result =
        await pool.query(
          `
          SELECT

            s.id,

            s.name,

            s.sensor_type,

            s.unit,

            s.machine_id,

            m.name AS machine_name,

            latest.value
              AS latest_value,

            CASE

              WHEN
                latest.value IS NULL
              THEN
                'Veri Yok'

              WHEN
                s.sensor_type =
                'temperature'
                AND latest.value > 80
              THEN
                'Kritik'

              WHEN
                s.sensor_type =
                'pressure'
                AND latest.value > 130
              THEN
                'Kritik'

              WHEN
                s.sensor_type =
                'humidity'
                AND latest.value > 70
              THEN
                'Kritik'

              ELSE
                'Normal'

            END AS status

          FROM sensors s

          LEFT JOIN machines m
            ON
              m.id =
              s.machine_id

          LEFT JOIN LATERAL (

            SELECT value

            FROM sensor_logs

            WHERE
              sensor_id =
              s.id

            ORDER BY
              timestamp DESC

            LIMIT 1

          ) latest
          ON TRUE

          WHERE
            s.id =
            $1
          `,
          [sensorId]
        );


      if (
        result.rows.length === 0
      ) {

        return res
          .status(404)
          .json({
            message:
              'Sensör bulunamadı.'
          });
      }


      return res.json(
        result.rows[0]
      );


    } catch (
      error
    ) {

      console.error(
        'Sensör detayı alınamadı:',
        error
      );


      return res
        .status(500)
        .json({
          message:
            'Sensör detayı alınamadı.'
        });
    }
  }
);


// ============================================================
// SENSOR STATISTICS
// ============================================================

app.get(
  '/api/sensors/:id/statistics',
  async (
    req,
    res
  ) => {

    const sensorId =
      Number(
        req.params.id
      );


    if (
      !Number.isInteger(
        sensorId
      ) ||
      sensorId <= 0
    ) {

      return res
        .status(400)
        .json({
          message:
            'Geçersiz sensör kimliği.'
        });
    }


    try {

      const result =
        await pool.query(
          `
          SELECT

            MIN(value)
              AS min_value,

            MAX(value)
              AS max_value,

            ROUND(
              AVG(value),
              2
            )
              AS avg_value

          FROM sensor_logs

          WHERE
            sensor_id =
            $1
          `,
          [sensorId]
        );


      return res.json(
        result.rows[0]
      );


    } catch (
      error
    ) {

      console.error(
        'Sensör istatistikleri alınamadı:',
        error
      );


      return res
        .status(500)
        .json({
          message:
            'Sensör istatistikleri alınamadı.'
        });
    }
  }
);


// ============================================================
// AI SENSOR COMMENT
// ============================================================

app.get(
  '/api/sensors/:id/ai-comment',
  async (
    req,
    res
  ) => {

    const sensorId =
      Number(
        req.params.id
      );


    if (
      !Number.isInteger(
        sensorId
      ) ||
      sensorId <= 0
    ) {

      return res
        .status(400)
        .json({
          message:
            'Geçersiz sensör kimliği.'
        });
    }


    try {

      const sensorResult =
        await pool.query(
          `
          SELECT

            s.name,

            s.sensor_type,

            latest.value
              AS latest_value

          FROM sensors s

          LEFT JOIN LATERAL (

            SELECT value

            FROM sensor_logs

            WHERE
              sensor_id =
              s.id

            ORDER BY
              timestamp DESC

            LIMIT 1

          ) latest
          ON TRUE

          WHERE
            s.id =
            $1
          `,
          [sensorId]
        );


      if (
        sensorResult.rows.length ===
        0
      ) {

        return res
          .status(404)
          .json({
            message:
              'Sensör bulunamadı.'
          });
      }


      const sensor =
        sensorResult.rows[0];


      const status =
        getSensorStatus(
          sensor.sensor_type,
          Number(
            sensor.latest_value
          )
        );


      let aiMessage =
        `AI yorumu: ${sensor.name} için değerler normal aralıkta takip ediliyor.`;


      if (
        sensorId === 1
      ) {

        try {

          const analysis =
            await fetchAiAnalysis();


          if (
            analysis &&
            analysis.ai_message
          ) {

            aiMessage =
              analysis.ai_message;
          }


        } catch (
          error
        ) {

          console.warn(
            'AI servisi yorumu alınamadı, yerel yoruma dönüldü.',
            error
          );
        }
      }


      if (
        status ===
        'Kritik'
      ) {

        aiMessage =
          `AI yorumu: ${sensor.name} kritik seviyeye ulaştı. Öncelikli bakım değerlendirmesi önerilir.`;
      }


      return res.json({

        sensor_id:
          sensorId,

        sensor_name:
          sensor.name,

        ai_message:
          aiMessage

      });


    } catch (
      error
    ) {

      console.error(
        'AI yorumu alınamadı:',
        error
      );


      return res
        .status(500)
        .json({
          message:
            'AI yorumu alınamadı.'
        });
    }
  }
);


// ============================================================
// ALARM HISTORY
// ============================================================

app.get(
  '/api/sensors/:id/alarm-history',
  async (
    req,
    res
  ) => {

    const sensorId =
      Number(
        req.params.id
      );


    if (
      !Number.isInteger(
        sensorId
      ) ||
      sensorId <= 0
    ) {

      return res
        .status(400)
        .json({
          message:
            'Geçersiz sensör kimliği.'
        });
    }


    try {

      const historyBySensor = {

        1: [

          {
            id: 1,
            title:
              'Sıcaklık artışı',
            time:
              '2026-07-22 21:31',
            severity:
              'Orta',
            description:
              'Motor sıcaklığı kısa süreli yükseliş gösterdi.'
          },

          {
            id: 2,
            title:
              'Eşik uyarısı',
            time:
              '2026-07-22 20:45',
            severity:
              'Düşük',
            description:
              'Sistem 80°C sınırını izlemeye aldı.'
          }

        ],


        2: [

          {
            id: 3,
            title:
              'Basınç dalgalanması',
            time:
              '2026-07-22 21:10',
            severity:
              'Orta',
            description:
              'Ana valf basıncında kısa süreli değişim tespit edildi.'
          }

        ],


        3: [

          {
            id: 4,
            title:
              'Nem artışı',
            time:
              '2026-07-22 20:50',
            severity:
              'Düşük',
            description:
              'Ortam neminde hafif artış izlendi.'
          }

        ]

      };


      return res.json(
        historyBySensor[
          sensorId
        ] ||
        [
          {
            id: 5,
            title:
              'Standart izleme',
            time:
              '2026-07-22 20:00',
            severity:
              'Düşük',
            description:
              'Bu sensör için yeni alarm kaydı bulunamadı.'
          }
        ]
      );


    } catch (
      error
    ) {

      console.error(
        'Alarm geçmişi alınamadı:',
        error
      );


      return res
        .status(500)
        .json({
          message:
            'Alarm geçmişi alınamadı.'
        });
    }
  }
);


// ============================================================
// AI ANOMALY SUMMARY
// ============================================================

app.get(
  '/api/ai/anomaly-summary',
  async (
    req,
    res
  ) => {

    try {

      const analysis =
        await fetchAiAnalysis();


      res.json(
        analysis
      );


    } catch (
      error
    ) {

      console.error(
        'AI analizi alınamadı:',
        error
      );


      res
        .status(503)
        .json({

          status:
            'error',

          message:
            'AI servisine şu anda ulaşılamıyor.'

        });
    }
  }
);


// ============================================================
// MACHINE AI ANALYSIS
// ============================================================

app.get(
  '/api/machines/:id/ai-analysis',
  async (
    req,
    res
  ) => {

    const machineId =
      getMachineId(
        req.params.id
      );


    if (!machineId) {

      return res
        .status(400)
        .json({
          message:
            'Geçersiz makine kimliği.'
        });
    }


    try {

      const analysis =
        await fetchAiAnalysis();


      if (
        machineId !== 1
      ) {

        return res.json({

          status:
            'waiting',

          machine_id:
            machineId,

          sensor:
            'Bu makine için AI modeli henüz aktif değil',

          latest_value:
            null,

          is_anomaly:
            false,

          ai_message:
            'Bu makine için özel AI modeli eğitimi henüz hazır değil.'

        });
      }


      return res.json({

        ...analysis,

        machine_id:
          machineId

      });


    } catch (
      error
    ) {

      console.error(
        'Makine AI analizi alınamadı:',
        error
      );


      return res
        .status(503)
        .json({

          status:
            'error',

          message:
            'AI servisine ulaşılamıyor.'

        });
    }
  }
);


// ============================================================
// MACHINE MAINTENANCE HISTORY
// ============================================================

app.get(
  '/api/machines/:id/maintenance-history',
  async (
    req,
    res
  ) => {

    const machineId =
      getMachineId(
        req.params.id
      );


    if (!machineId) {

      return res
        .status(400)
        .json({
          message:
            'Geçersiz makine kimliği.'
        });
    }


    try {

      const history =
        getMachineMaintenanceHistory(
          machineId
        );


      return res.json(
        history
      );


    } catch (
      error
    ) {

      console.error(
        'Bakım geçmişi alınamadı:',
        error
      );


      return res
        .status(500)
        .json({
          message:
            'Bakım geçmişi alınamadı.'
        });
    }
  }
);


// ============================================================
// SENSOR HISTORY
// ============================================================

app.get(
  '/api/sensors/:id/history',
  async (
    req,
    res
  ) => {

    try {

      const result =
        await pool.query(
          `
          SELECT

            value,

            to_char(
              timestamp,
              'HH24:MI:SS'
            ) AS time

          FROM sensor_logs

          WHERE
            sensor_id =
            $1

          ORDER BY
            timestamp DESC

          LIMIT 10
          `,
          [
            req.params.id
          ]
        );


      res.json(
        result.rows.reverse()
      );


    } catch (
      error
    ) {

      console.error(
        'Sensör geçmişi alınamadı:',
        error
      );


      res
        .status(500)
        .send(
          'Geçmiş veri çekilemedi'
        );
    }
  }
);


// ============================================================
// SERVER START
// ============================================================

async function startServer() {

  try {

    await initializeDatabase();


    startMqttIngestion();


    // ========================================================
    // MERKEZİ SİMÜLATÖRÜ BAŞLAT
    // ========================================================

    startFactorySimulator();


    app.listen(
      PORT,
      () => {

        console.log(
          `Backend sunucusu çalışıyor: http://localhost:${PORT}`
        );

      }
    );


  } catch (
    error
  ) {

    console.error(
      'Backend başlatılamadı:',
      error
    );


    process.exit(
      1
    );
  }
}


// ============================================================
// START
// ============================================================

startServer();