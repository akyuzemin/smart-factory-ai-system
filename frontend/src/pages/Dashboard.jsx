import { useEffect, useState } from 'react';
import { Toaster, toast } from 'react-hot-toast';
import StatCard from '../components/StatCard';
import DashboardHeader from '../layout/DashboardHeader';
import AlarmTrendChart from '../components/dashboard/AlarmTrendChart';
import RiskDistributionChart from '../components/dashboard/RiskDistributionChart';
import EfficiencyChart from '../components/dashboard/EfficiencyChart';
import SensorHistoryChart from '../components/dashboard/SensorHistoryChart';

const mockNotifications = [
  'Motor-03 analiz edildi.',
  'Yeni alarm oluşturuldu: Pres-01',
  'Risk skoru güncellendi: %65',
  'ESP32 bağlantısı aktif.',
  'AI servisi normal çalışıyor.',
];

const mockRecentAnalyses = [
  { id: 1, machine: 'Motor-01', status: 'Normal', score: 12, color: 'text-emerald-400' },
  { id: 2, machine: 'Pres-03', status: 'Kritik', score: 91, color: 'text-red-400' },
  { id: 3, machine: 'CNC-07', status: 'Uyarı', score: 64, color: 'text-amber-400' },
  { id: 4, machine: 'Robot-02', status: 'Normal', score: 8, color: 'text-emerald-400' },
];

const mockSystemStatus = [
  { name: 'Backend', status: 'online' },
  { name: 'MQTT', status: 'online' },
  { name: 'AI Service', status: 'online' },
  { name: 'PostgreSQL', status: 'error' },
  { name: 'ESP32 Gateway', status: 'online' },
];

function Dashboard() {
  const [sensors, setSensors] = useState([]);
  const [machines, setMachines] = useState([]);

  useEffect(() => {
    const fetchSensorData = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/sensors');
        const data = await response.json();
        setSensors(data);
      } catch (error) {
        console.error('Backend’e bağlanılamadı. Sunucu açık mı?', error);
      }
    };

    fetchSensorData();
    const intervalId = setInterval(fetchSensorData, 2000);

    return () => clearInterval(intervalId);
  }, []);

  useEffect(() => {
    const fetchMachines = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/machines');
        const data = await response.json();
        setMachines(data);
      } catch (error) {
        console.error('Makine verileri alınamadı:', error);
      }
    };

    fetchMachines();
    const machineIntervalId = setInterval(fetchMachines, 10000);

    return () => clearInterval(machineIntervalId);
  }, []);

  useEffect(() => {
    const notificationInterval = setInterval(() => {
      const randomMessage = mockNotifications[Math.floor(Math.random() * mockNotifications.length)];
      toast.success(randomMessage);
    }, 8000); // 8 saniyede bir bildirim göster

    return () => clearInterval(notificationInterval);
  }, []);

  const totalMachines = machines.length;
  const activeMachines = machines.filter((machine) => machine.status === 'Çalışıyor').length;
  const alarmMachines = machines.filter((machine) => machine.status === 'Arızalı').length;
  const totalSensors = sensors.length;

  return (
    <div className="min-h-screen bg-slate-950 p-8 text-slate-100">
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#1e293b', // slate-800
            color: '#e2e8f0', // slate-200
            border: '1px solid #334155', // slate-700
          },
          success: {
            iconTheme: {
              primary: '#34d399', // emerald-400
              secondary: '#1e293b',
            },
          },
        }}
      />
      <DashboardHeader />

      <main className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* Sol Sütun */}
        <div className="space-y-8 lg:col-span-2">
          <section className="grid grid-cols-2 gap-6 md:grid-cols-4">
            <StatCard title="Toplam Makine" value={String(totalMachines)} />
            <StatCard title="Aktif Makine" value={String(activeMachines)} />
            <StatCard title="Toplam Sensör" value={String(totalSensors)} />
            <StatCard title="Bugünkü AI Analizi" value="4" />
            <StatCard title="Kritik Alarm" value={String(alarmMachines)} />
            <StatCard title="Ortalama Risk Skoru" value="%48" />
            <StatCard title="Üretim Verimliliği" value="%92.1" />
            <StatCard title="Sistem Çalışma Süresi" value="%99.8" />
          </section>

          <section className="grid grid-cols-1 gap-6 xl:grid-cols-2">
            <AlarmTrendChart />
            <RiskDistributionChart />
            <EfficiencyChart />
            <SensorHistoryChart />
          </section>
        </div>

        {/* Sağ Sütun */}
        <div className="space-y-8">
          <section className="rounded-2xl border border-slate-800 bg-slate-900/80 p-6 shadow-xl">
            <h2 className="text-lg font-semibold text-white">Son AI Analizleri</h2>
            <div className="mt-4 space-y-3">
              {mockRecentAnalyses.map((item) => (
                <div key={item.id} className="flex items-center justify-between rounded-lg bg-slate-800/50 p-3">
                  <span className="font-medium text-slate-300">{item.machine}</span>
                  <div className="text-right">
                    <span className={`font-semibold ${item.color}`}>{item.status}</span>
                    <span className="ml-2 text-sm font-mono text-slate-400">{`%${item.score}`}</span>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-2xl border border-slate-800 bg-slate-900/80 p-6 shadow-xl">
            <h2 className="text-lg font-semibold text-white">Sistem Durumu</h2>
            <div className="mt-4 space-y-3">
              {mockSystemStatus.map((service) => (
                <div key={service.name} className="flex items-center justify-between rounded-lg bg-slate-800/50 p-3">
                  <span className="font-medium text-slate-300">{service.name}</span>
                  <div className="flex items-center gap-2">
                    <span className={`h-3 w-3 rounded-full ${service.status === 'online' ? 'bg-emerald-500' : 'bg-red-500'}`} />
                    <span className={`text-sm font-semibold ${service.status === 'online' ? 'text-emerald-400' : 'text-red-400'}`}>
                      {service.status === 'online' ? 'Çalışıyor' : 'Çevrimdışı'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}

export default Dashboard;
