// backend/server.js
const express = require('express');
const cors = require('cors');

const app = express();
const PORT = 5000;

// Güvenlik Köprüsü: React (5173) ile Node.js (5000) portlarının konuşmasına izin veriyoruz
app.use(cors());

// backend/server.js içine eklenecek kısım (app.use(cors()); satırının altına)

const pool = require('./db'); // Bağlantı modülümüzü içeri aldık

// Fabrika tablolarını (Schema) oluşturan fonksiyon
const initializeDatabase = async () => {
  const createTablesQuery = `
    CREATE TABLE IF NOT EXISTS machines (
      id SERIAL PRIMARY KEY,
      name VARCHAR(100) NOT NULL,
      location VARCHAR(100)
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
    
  `;
// ... (Mevcut CREATE TABLE kodlarının bittiği yerin hemen altına ekle) ...

    // Veritabanında hiç sensör var mı diye kontrol et
    const checkSensors = await pool.query('SELECT COUNT(*) FROM sensors');
    
    if (parseInt(checkSensors.rows[0].count) === 0) {
      console.log('🌱 Veritabanı boş. Varsayılan fabrika sensörleri ekleniyor...');
      await pool.query(`
        INSERT INTO sensors (id, name, sensor_type, unit) VALUES 
        (1, 'Motor 1 Sıcaklığı', 'temperature', '°C'),
        (2, 'Ana Valf Basıncı', 'pressure', 'Bar'),
        (3, 'Ortam Nemi', 'humidity', '%')
      `);
      console.log('✅ Sensörler başarıyla oluşturuldu!');
    }
  try {
    await pool.query(createTablesQuery);
    console.log('🛠️  Veritabanı tabloları kontrol edildi/oluşturuldu.');
  } catch (err) {
    console.error('❌ Tablo oluşturma hatası:', err);
  }
};

// Sunucu başlarken tabloları kur
initializeDatabase();

// Veri İstasyonu (API Endpoint): Frontend buraya istek attığında sensör verilerini göndereceğiz
// backend/server.js (Alt kısma eklenecek kodlar)

// 1. Veri Tohumlama ve IoT Simülasyonu
// backend/server.js içine eklenecek kısım (eski startIoTSimulation yerine)
const mqtt = require('mqtt');

// 1. MQTT Broker'ına Bağlan (Aynı merkeze bağlanıyoruz)
const mqttClient = mqtt.connect('mqtt://broker.emqx.io');

mqttClient.on('connect', () => {
  console.log('🎧 [Node.js] MQTT Broker ağına bağlandı.');
  
  // 2. İlgili kanala abone ol (Subscribe)
  mqttClient.subscribe('atasayar_kocaali/motor1/sicaklik', (err) => {
    if (!err) {
      console.log('✅ [Node.js] Motor 1 sıcaklık kanalına abone olundu, veriler bekleniyor...');
    }
  });
});

// 3. Kanaldan yeni bir mesaj geldiğinde tetiklenen olay (Event)
mqttClient.on('message', async (topic, message) => {
  try {
    // Gelen ham mesajı JSON'a çeviriyoruz
    const payload = JSON.parse(message.toString());
    console.log(`📥 [Node.js] Yeni Veri Alındı (Kanal: ${topic}): ${payload.value}`);

    // 4. Gelen gerçek cihaz verisini doğrudan PostgreSQL veritabanına kaydet
    await pool.query(
      'INSERT INTO sensor_logs (sensor_id, value) VALUES ($1, $2)',
      [payload.sensor_id, payload.value]
    );

  } catch (error) {
    console.error('❌ Veri işleme hatası:', error);
  }
});

    // IoT Veri Akışı Simülasyonu: Her 2 saniyede bir veritabanına yeni sensör logları yazıyoruz

  
// 2. Yeni Veri İstasyonu (API): Artık veriler veritabanından çekiliyor
app.get('/api/sensors', async (req, res) => {
  try {
    // SQL Büyüsü: Her sensörün bilgilerini ve 'sensor_logs' tablosundaki en son (en güncel) değerini getir
    const query = `
      SELECT 
        s.id, 
        s.name AS title, 
        s.unit, 
        (SELECT value FROM sensor_logs WHERE sensor_id = s.id ORDER BY timestamp DESC LIMIT 1) as value
      FROM sensors s;
    `;
    const result = await pool.query(query);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).send('Veritabanı hatası');
  }
});
// backend/server.js içine eklenecek yeni API Endpoint

// Belirli bir sensörün geçmiş verilerini (Trend) getiren API
app.get('/api/sensors/:id/history', async (req, res) => {
  const { id } = req.params; // URL'den sensör ID'sini alıyoruz
  
  try {
    // SQL Büyüsü: İlgili sensörün son 10 log kaydını, saat/dakika/saniye formatıyla çekiyoruz
    const query = `
      SELECT 
        value, 
        to_char(timestamp, 'HH24:MI:SS') as time 
      FROM sensor_logs 
      WHERE sensor_id = $1 
      ORDER BY timestamp DESC 
      LIMIT 10
    `;
    const result = await pool.query(query, [id]);
    
    // Veriler SQL'den en yeniden en eskiye gelir. Grafikte soldan sağa akması için ters çeviriyoruz (.reverse)
    res.json(result.rows.reverse()); 
  } catch (err) {
    console.error(err);
    res.status(500).send('Geçmiş veri çekilemedi');
  }
});

// Sunucuyu ve simülasyonu başlat
app.listen(PORT, () => {
  console.log(`🚀 Backend sunucusu çalışıyor: http://localhost:${PORT}`);

});