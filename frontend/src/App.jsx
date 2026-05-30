// src/App.jsx
import { useState, useEffect } from 'react';
import SensorCard from './components/SensorCard';
import SensorChart from './components/dashboard/SensorChart';
  



function App() {
  // 1. STATE: Artık tek bir sayı değil, backend'den gelecek "sensör listesini" (array) tutacağız. Başlangıçta boş bir liste [].
  const [sensors, setSensors] = useState([]);

  // YENİ: Yapay Zeka Durumu için State
  const [aiStatus, setAiStatus] = useState(null);

  // Mevcut sensör verilerini çeken useEffect (Burası sende zaten var)
  // ...

  // YENİ: Yapay Zeka servisini periyodik olarak dinleyen sistem
  useEffect(() => {
    const checkAI = async () => {
      try {
        const response = await fetch('http://localhost:8000/api/analyze/motor1');
        const data = await response.json();
        if (data.status === 'success') {
          setAiStatus(data);
        }
      } catch (error) {
        console.error("AI servisine ulaşılamadı:", error);
      }
    };

    checkAI(); // Sayfa açılır açılmaz ilk kontrolü yap
    const interval = setInterval(checkAI, 5000); // Sonra her 5 saniyede bir AI'a sor
    
    return () => clearInterval(interval);
  }, []);
  

  // 2. EFFECT: Sayfa açıldığında Node.js ile iletişime geçecek kısım.
  useEffect(() => {
    
    // Asenkron veri çekme fonksiyonumuz
    const fetchSensorData = async () => {
      try {
        // Node.js kapısını çalıyoruz
        const response = await fetch('http://localhost:5000/api/sensors');
        
        // Gelen yanıtı JSON formatına çeviriyoruz
        const data = await response.json();
        
        // React'in hafızasına (state) bu veriyi kaydediyoruz
        setSensors(data);
      } catch (error) {
        console.error("Backend'e bağlanılamadı. Sunucu açık mı?", error);
      }
    };
    
    // Fonksiyonu ilk kez çalıştır
    fetchSensorData();

    // Endüstriyel Dashboard Mantığı (Polling): Her 2 saniyede bir git yeni veriyi al
    const intervalId = setInterval(fetchSensorData, 2000);

    // Temizlik
    return () => clearInterval(intervalId);
  }, []);

  // App.jsx içindeki return kısmını şununla değiştir:
  return (
    <div className="min-h-screen p-8 max-w-7xl mx-auto">
      <header className="mb-10">
        <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">
          Akıllı Fabrika Kontrol Paneli
        </h1>
        <p className="text-slate-400 mt-2">Gerçek zamanlı Node.js verisi akıyor...</p>
      </header>

      {/* --- ADIM 3'TEKİ KOD BURAYA GELECEK --- */}
      {aiStatus && (
        <div className={`mb-8 p-5 rounded-xl border flex items-center justify-between transition-all duration-500 ${
          aiStatus.is_anomaly
            ? 'bg-red-500/20 border-red-500 shadow-[0_0_15px_rgba(239,68,68,0.5)] animate-pulse'
            : 'bg-emerald-500/10 border-emerald-500/30'
        }`}>
           <div className="flex items-center gap-4">
              <span className="text-3xl">{aiStatus.is_anomaly ? '⚠️' : '🧠'}</span>
              <div>
                <h4 className={`font-bold ${aiStatus.is_anomaly ? 'text-red-400' : 'text-emerald-400'}`}>
                  Yapay Zeka Analiz Modülü (Motor 1)
                </h4>
                <p className="text-slate-300 text-sm mt-1">
                  {aiStatus.ai_message} <span className="opacity-75">(Son Değer: {aiStatus.latest_value}°C)</span>
                </p>
              </div>
           </div>
           
           <div className="text-xs font-mono text-slate-500">
             Model: Isolation Forest
           </div>
        </div>
      )}
      {/* --- ADIM 3'TEKİ KODUN SONU --- */}

      {/* Sensör Kartları Grid Alanı */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
        {sensors.map(sensor => (
          <SensorCard 
            key={sensor.id} 
            title={sensor.title} 
            value={sensor.value} 
            unit={sensor.unit}
            status={sensor.value > 80 ? 'Kritik' : 'Normal'} 
          />
        ))}
      </div>

      {/* Grafikler Grid Alanı */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SensorChart sensorId={1} title="Motor Sıcaklığı" color="#0ea5e9" />
        <SensorChart sensorId={2} title="Ana Valf Basıncı" color="#10b981" />
      </div>
    </div>
  );
}

export default App;