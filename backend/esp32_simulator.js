// backend/esp32_simulator.js
const mqtt = require('mqtt');

// Ücretsiz bulut MQTT Broker'ına bağlanıyoruz
const client = mqtt.connect('mqtt://broker.emqx.io');

client.on('connect', () => {
  console.log('📡 [ESP32] Fabrika sensörü MQTT Broker ağına bağlandı!');

  // Her 3 saniyede bir sensör verisi üretip 'YAYINLIYORUZ' (Publish)
  setInterval(() => {
    // 1. Motor Sıcaklığı (ID: 1)
    const temperature = Math.floor(Math.random() * (85 - 70 + 1) + 70);
    client.publish('atasayar_kocaali/motor1/sicaklik', JSON.stringify({
      sensor_id: 1, 
      value: temperature
    }));

    // 2. Ana Valf Basıncı (ID: 2)
    const pressure = Math.floor(Math.random() * (130 - 110 + 1) + 110);
    client.publish('atasayar_kocaali/motor1/sicaklik', JSON.stringify({
      sensor_id: 2, 
      value: pressure
    }));

    // 3. Ortam Nemi (ID: 3)
    const humidity = Math.floor(Math.random() * (60 - 40 + 1) + 40);
    client.publish('atasayar_kocaali/motor1/sicaklik', JSON.stringify({
      sensor_id: 3, 
      value: humidity
    }));
    
    // Terminalde üç veriyi de aynı anda görelim
    console.log(`📤 [ESP32] Veri Gönderildi -> Sıcaklık: ${temperature}°C | Basınç: ${pressure} Bar | Nem: %${humidity}`);
  }, 3000);
});