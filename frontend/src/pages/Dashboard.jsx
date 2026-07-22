import { useEffect, useState } from 'react';
import SensorCard from '../components/SensorCard';
import StatCard from '../components/StatCard';
import AiStatusCard from '../components/dashboard/AiStatusCard';
import SensorChart from '../components/dashboard/SensorChart';
import DashboardHeader from '../layout/DashboardHeader';

function Dashboard() {
  const [sensors, setSensors] = useState([]);
  const [machines, setMachines] = useState([]);
  const [aiStatus, setAiStatus] = useState(null);

  useEffect(() => {
    const checkAI = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/ai/anomaly-summary');
        const data = await response.json();

        if (data.status === 'success' || data.status === 'waiting' || data.status === 'error') {
          setAiStatus(data);
        }
      } catch (error) {
        console.error('AI servisine ulaşılamadı:', error);
      }
    };

    checkAI();
    const intervalId = setInterval(checkAI, 5000);

    return () => clearInterval(intervalId);
  }, []);

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

  const totalMachines = machines.length;
  const activeMachines = machines.filter((machine) => machine.status === 'Çalışıyor').length;
  const alarmMachines = machines.filter((machine) => machine.status === 'Arızalı').length;
  const efficiency = totalMachines > 0 ? Math.round((activeMachines / totalMachines) * 100) : 0;

  return (
    <div className="min-h-screen p-8 max-w-7xl mx-auto">
      <DashboardHeader />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard title="Toplam Makine" value={String(totalMachines)} />
        <StatCard title="Aktif Makine" value={String(activeMachines)} />
        <StatCard title="Bugünkü Alarm" value={String(alarmMachines)} />
        <StatCard title="Verimlilik" value={`%${efficiency}`} />
      </div>

      <AiStatusCard aiStatus={aiStatus} />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
        {sensors.map((sensor) => (
          <SensorCard
            key={sensor.id}
            title={sensor.title}
            value={sensor.value}
            unit={sensor.unit}
            status={sensor.value > 80 ? 'Kritik' : 'Normal'}
          />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SensorChart sensorId={1} title="Motor Sıcaklığı" color="#0ea5e9" />
        <SensorChart sensorId={2} title="Ana Valf Basıncı" color="#10b981" />
      </div>
    </div>
  );
}

export default Dashboard;
