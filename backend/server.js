const express = require('express');
const cors = require('cors');
const mqtt = require('mqtt');
const pool = require('./db');

const app = express();
const PORT = 5000;
const AI_SERVICE_URLS = [process.env.AI_SERVICE_URL, 'http://ai-service:8000', 'http://localhost:8000'].filter(Boolean);

app.use(cors());

const defaultMachines = [
  ['CNC İşleme Merkezi', 'CNC-01', 'Üretim Hattı A', 'Çalışıyor', '2026-07-12'],
  ['Hidrolik Pres', 'PRS-02', 'Şekillendirme', 'Bakımda', '2026-07-08'],
  ['Robotik Kaynak Ünitesi', 'RBW-03', 'Kaynak Hattı', 'Çalışıyor', '2026-07-16'],
  ['Endüstriyel Paketleme', 'PKG-04', 'Paketleme', 'Arızalı', '2026-07-03'],
  ['Konveyör Sistemi', 'CNV-05', 'Lojistik', 'Çalışıyor', '2026-07-18'],
  ['Enjeksiyon Kalıplama', 'INJ-06', 'Plastik Üretim', 'Bakımda', '2026-07-10'],
];
const machineColumns = 'id, name, code, department, status, last_maintenance';

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

  // Existing databases can receive the new machine-management columns safely.
  await pool.query(`
    ALTER TABLE machines ADD COLUMN IF NOT EXISTS code VARCHAR(50);
    ALTER TABLE machines ADD COLUMN IF NOT EXISTS department VARCHAR(100);
    ALTER TABLE machines ADD COLUMN IF NOT EXISTS status VARCHAR(20) NOT NULL DEFAULT 'Çalışıyor';
    ALTER TABLE machines ADD COLUMN IF NOT EXISTS last_maintenance DATE;
  `);

  const machineCount = await pool.query('SELECT COUNT(*) FROM machines');

  if (Number(machineCount.rows[0].count) === 0) {
    await pool.query(
      `INSERT INTO machines (name, code, department, status, last_maintenance)
       VALUES ${defaultMachines.map((_, index) => `($${index * 5 + 1}, $${index * 5 + 2}, $${index * 5 + 3}, $${index * 5 + 4}, $${index * 5 + 5})`).join(', ')}`,
      defaultMachines.flat(),
    );
    console.log('Varsayılan makineler oluşturuldu.');
  }

  const sensorCount = await pool.query('SELECT COUNT(*) FROM sensors');
  const primaryMachine = await pool.query('SELECT id FROM machines ORDER BY id LIMIT 1');
  const primaryMachineId = primaryMachine.rows[0].id;

  if (Number(sensorCount.rows[0].count) === 0) {
    await pool.query(
      `INSERT INTO sensors (id, machine_id, name, sensor_type, unit) VALUES
      (1, $1, 'Motor 1 Sıcaklığı', 'temperature', '°C'),
      (2, $1, 'Ana Valf Basıncı', 'pressure', 'Bar'),
      (3, $1, 'Ortam Nemi', 'humidity', '%')`,
      [primaryMachineId],
    );
    console.log('Varsayılan sensörler oluşturuldu.');
  }

  await pool.query(
    'UPDATE sensors SET machine_id = $1 WHERE machine_id IS NULL',
    [primaryMachineId],
  );

  console.log('Veritabanı tabloları kontrol edildi/oluşturuldu.');
}

function startMqttIngestion() {
  const mqttClient = mqtt.connect('mqtt://broker.emqx.io');

  mqttClient.on('connect', () => {
    console.log('[Node.js] MQTT Broker ağına bağlandı.');
    mqttClient.subscribe('atasayar_kocaali/motor1/sicaklik', (error) => {
      if (error) {
        console.error('MQTT kanalına abone olunamadı:', error);
        return;
      }

      console.log('[Node.js] Motor 1 sıcaklık kanalına abone olundu.');
    });
  });

  mqttClient.on('message', async (topic, message) => {
    try {
      const payload = JSON.parse(message.toString());
      await pool.query(
        'INSERT INTO sensor_logs (sensor_id, value) VALUES ($1, $2)',
        [payload.sensor_id, payload.value],
      );
      console.log(`[Node.js] Yeni veri alındı (${topic}): ${payload.value}`);
    } catch (error) {
      console.error('MQTT verisi işlenemedi:', error);
    }
  });
}

async function fetchAiAnalysis() {
  let lastError = null;

  for (const baseUrl of AI_SERVICE_URLS) {
    try {
      const response = await fetch(`${baseUrl}/api/analyze/motor1`);
      if (!response.ok) {
        throw new Error(`AI servisi hatalı durum döndürdü: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      lastError = error;
      console.warn(`[Node.js] AI servisi denendi ama ulaşılamadı: ${baseUrl}`, error.message);
    }
  }

  throw lastError || new Error('AI servisi erişilemedi.');
}

function getMachineId(value) {
  const machineId = Number(value);
  return Number.isInteger(machineId) && machineId > 0 ? machineId : null;
}

async function findMachine(machineId) {
  const result = await pool.query(
    `SELECT ${machineColumns} FROM machines WHERE id = $1`,
    [machineId],
  );
  return result.rows[0];
}

app.get('/api/machines', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT ${machineColumns}
      FROM machines
      ORDER BY id
    `);
    res.json(result.rows);
  } catch (error) {
    console.error('Makineler alınamadı:', error);
    res.status(500).json({ message: 'Makine verileri alınamadı.' });
  }
});

app.get('/api/machines/:id', async (req, res) => {
  const machineId = getMachineId(req.params.id);

  if (!machineId) {
    return res.status(400).json({ message: 'Geçersiz makine kimliği.' });
  }

  try {
    const machine = await findMachine(machineId);

    if (!machine) {
      return res.status(404).json({ message: 'Makine bulunamadı.' });
    }

    return res.json(machine);
  } catch (error) {
    console.error('Makine detayı alınamadı:', error);
    return res.status(500).json({ message: 'Makine detayı alınamadı.' });
  }
});

app.get('/api/machines/:id/sensors', async (req, res) => {
  const machineId = getMachineId(req.params.id);

  if (!machineId) {
    return res.status(400).json({ message: 'Geçersiz makine kimliği.' });
  }

  try {
    const machine = await findMachine(machineId);

    if (!machine) {
      return res.status(404).json({ message: 'Makine bulunamadı.' });
    }

    const result = await pool.query(`
      SELECT
        s.id,
        s.name,
        s.unit,
        latest.value AS latest_value,
        CASE
          WHEN latest.value IS NULL THEN 'Veri Yok'
          WHEN s.sensor_type = 'temperature' AND latest.value > 80 THEN 'Kritik'
          WHEN s.sensor_type = 'pressure' AND latest.value > 130 THEN 'Kritik'
          WHEN s.sensor_type = 'humidity' AND latest.value > 70 THEN 'Kritik'
          ELSE 'Normal'
        END AS status
      FROM sensors s
      LEFT JOIN LATERAL (
        SELECT value
        FROM sensor_logs
        WHERE sensor_id = s.id
        ORDER BY timestamp DESC
        LIMIT 1
      ) latest ON TRUE
      WHERE s.machine_id = $1
      ORDER BY s.id
    `, [machineId]);

    return res.json(result.rows);
  } catch (error) {
    console.error('Bağlı sensörler alınamadı:', error);
    return res.status(500).json({ message: 'Bağlı sensörler alınamadı.' });
  }
});

app.get('/api/sensors', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        s.id,
        s.name AS title,
        s.unit,
        (SELECT value FROM sensor_logs WHERE sensor_id = s.id ORDER BY timestamp DESC LIMIT 1) AS value
      FROM sensors s
    `);
    res.json(result.rows);
  } catch (error) {
    console.error('Sensörler alınamadı:', error);
    res.status(500).send('Veritabanı hatası');
  }
});

app.get('/api/ai/anomaly-summary', async (req, res) => {
  try {
    const analysis = await fetchAiAnalysis();
    res.json(analysis);
  } catch (error) {
    console.error('AI analizi alınamadı:', error);
    res.status(503).json({
      status: 'error',
      message: 'AI servisine şu anda ulaşılamıyor.',
    });
  }
});

app.get('/api/sensors/:id/history', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT value, to_char(timestamp, 'HH24:MI:SS') AS time
      FROM sensor_logs
      WHERE sensor_id = $1
      ORDER BY timestamp DESC
      LIMIT 10
    `, [req.params.id]);
    res.json(result.rows.reverse());
  } catch (error) {
    console.error('Sensör geçmişi alınamadı:', error);
    res.status(500).send('Geçmiş veri çekilemedi');
  }
});

async function startServer() {
  try {
    await initializeDatabase();
    startMqttIngestion();
    app.listen(PORT, () => {
      console.log(`Backend sunucusu çalışıyor: http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('Backend başlatılamadı:', error);
    process.exit(1);
  }
}

startServer();
