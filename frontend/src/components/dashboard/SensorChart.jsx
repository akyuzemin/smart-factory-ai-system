// src/components/dashboard/SensorChart.jsx
import { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

function SensorChart({ sensorId, title, color }) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    // Geçmiş verileri çeken fonksiyon
    const fetchHistory = async (attempt = 1) => {
      try {
        const response = await fetch(`http://localhost:5000/api/sensors/${sensorId}/history`);

        if (!response.ok) {
          throw new Error(`İstek başarısız: ${response.status}`);
        }

        const historyData = await response.json();
        if (isMounted) setData(historyData);
      } catch (error) {
        if (attempt < 3) {
          window.setTimeout(() => fetchHistory(attempt + 1), 1000);
          return;
        }
        if (isMounted) setData([]);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    // İlk yüklemede ve sonrasında her 2 saniyede bir grafiği güncelle
    fetchHistory();
    const intervalId = setInterval(() => fetchHistory(), 2000);
    return () => {
      isMounted = false;
      clearInterval(intervalId);
    };
  }, [sensorId]);

  // SensorChart.jsx içindeki return kısmını şununla değiştir:
  return (
    <div className="bg-slate-800 border border-slate-700 p-6 rounded-xl shadow-lg w-full">
      <h3 className="text-slate-300 text-sm font-semibold uppercase tracking-wider mb-4">{title} Trendi (Son 10 Ölçüm)</h3>
      
      <div style={{ height: '300px', width: '100%', minWidth: 0 }}>
        {loading && <div className="flex h-full items-center justify-center text-slate-400">Grafik verisi yükleniyor...</div>}
        {!loading && data.length === 0 && (
          <div className="flex h-full items-center justify-center text-slate-500">
            Bu sensör için gösterilecek veri bulunamadı.
          </div>
        )}
        {!loading && data.length > 0 && (
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
            <XAxis dataKey="time" stroke="#94a3b8" />
            <YAxis domain={['auto', 'auto']} stroke="#94a3b8" />
            <Tooltip 
              contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#f8fafc' }}
              itemStyle={{ color: '#38bdf8' }}
            />
            <Line 
              type="monotone" 
              dataKey="value" 
              stroke={color} 
              strokeWidth={3}
              dot={{ fill: '#1e293b', strokeWidth: 2 }}
              isAnimationActive={false} 
            />
          </LineChart>
        </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}

export default SensorChart;