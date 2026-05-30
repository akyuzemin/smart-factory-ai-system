// backend/db.js
const { Pool } = require('pg');

// Docker'da ayağa kaldırdığımız veritabanının kimlik bilgileri
const pool = new Pool({
  user: 'admin',
  host: 'postgres', // Docker Compose'da servis adıyla erişim
  database: 'factory_db',
  password: '1234',
  port: 5432,
});

// Veritabanı bağlantısını test edelim
pool.connect()
  .then(() => console.log('📦 PostgreSQL veritabanına başarıyla bağlanıldı!'))
  .catch(err => console.error('❌ Veritabanı bağlantı hatası:', err.stack));

module.exports = pool;