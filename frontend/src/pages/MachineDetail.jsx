import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import StatusBadge from '../components/StatusBadge';
import SensorChart from '../components/dashboard/SensorChart';
import formatDate from '../utils/formatDate';

const chartColors = ['#0ea5e9', '#10b981', '#f59e0b', '#fb7185', '#8b5cf6'];

function MachineDetail() {
  const { id } = useParams();
  const [machine, setMachine] = useState(null);
  const [sensors, setSensors] = useState([]);
  const [aiAnalysis, setAiAnalysis] = useState(null);
  const [maintenanceHistory, setMaintenanceHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;

    async function fetchMachineDetail() {
      try {
        const [machineResponse, sensorsResponse, aiResponse, maintenanceResponse] = await Promise.all([
          fetch(`http://localhost:5000/api/machines/${id}`),
          fetch(`http://localhost:5000/api/machines/${id}/sensors`),
          fetch(`http://localhost:5000/api/machines/${id}/ai-analysis`),
          fetch(`http://localhost:5000/api/machines/${id}/maintenance-history`),
        ]);

        if (!machineResponse.ok || !sensorsResponse.ok || !aiResponse.ok || !maintenanceResponse.ok) {
          throw new Error('Makine detayları alınamadı.');
        }

        const [machineData, sensorsData, aiData, maintenanceData] = await Promise.all([
          machineResponse.json(),
          sensorsResponse.json(),
          aiResponse.json(),
          maintenanceResponse.json(),
        ]);

        if (isMounted) {
          setMachine(machineData);
          setSensors(sensorsData);
          setAiAnalysis(aiData);
          setMaintenanceHistory(maintenanceData);
        }
      } catch (fetchError) {
        if (isMounted) {
          setError(fetchError.message);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    fetchMachineDetail();

    return () => {
      isMounted = false;
    };
  }, [id]);

  if (isLoading) {
    return <PageState message="Makine detayları yükleniyor..." />;
  }

  if (error || !machine) {
    return <PageState message={error || 'Makine bulunamadı.'} isError />;
  }

  return (
    <div className="min-h-screen bg-slate-950 p-8 text-slate-100">
      <div className="mx-auto max-w-7xl space-y-8">
        <header className="rounded-2xl border border-slate-800 bg-slate-900/80 p-8 shadow-xl">
          <Link to="/machines" className="inline-flex items-center gap-2 text-sm font-medium text-cyan-400 transition-colors hover:text-cyan-300">
            <span aria-hidden="true">←</span>
            Makinelere Dön
          </Link>
          <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">
                {machine.name}
              </h1>
              <p className="mt-2 text-slate-400">Makine durumu, sensör takibi, AI analizi ve bakım geçmişi tek ekranda.</p>
            </div>
            <StatusBadge status={machine.status} />
          </div>
        </header>

        <section className="rounded-2xl border border-slate-800 bg-slate-900/80 p-8 shadow-xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.3em] text-cyan-400">Makine Bilgileri</p>
              <h2 className="mt-2 text-xl font-semibold text-white">Temel ekipman bilgileri</h2>
            </div>
          </div>
          <dl className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-5">
            <InfoItem label="Makine Adı" value={machine.name} />
            <InfoItem label="Kod" value={machine.code || '—'} mono />
            <InfoItem label="Bölüm" value={machine.department || '—'} />
            <InfoItem label="Durum" value={<StatusBadge status={machine.status} />} />
            <InfoItem label="Son Bakım Tarihi" value={formatDate(machine.last_maintenance)} />
          </dl>
        </section>

        <section className="rounded-2xl border border-slate-800 bg-slate-900/80 p-8 shadow-xl">
          <div className="mb-5">
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-cyan-400">Bağlı Sensörler</p>
            <h2 className="mt-2 text-xl font-semibold text-white">Makineye atanmış sensör kartları</h2>
          </div>

          {sensors.length === 0 ? (
            <div className="rounded-xl border border-slate-700 bg-slate-800 p-8 text-center text-slate-400">Bu makineye bağlı sensör bulunamadı.</div>
          ) : (
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
              {sensors.map((sensor) => <ConnectedSensorCard key={sensor.id} sensor={sensor} />)}
            </div>
          )}
        </section>

        <section className="rounded-2xl border border-slate-800 bg-slate-900/80 p-8 shadow-xl">
          <div className="mb-6">
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-cyan-400">Canlı Grafikler</p>
            <h2 className="mt-2 text-xl font-semibold text-white">Makine sensörlerinin trend grafikleri</h2>
          </div>

          {sensors.length === 0 ? (
            <div className="rounded-xl border border-slate-700 bg-slate-800 p-8 text-center text-slate-400">Grafik gösterecek sensör bulunamadı.</div>
          ) : (
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              {sensors.map((sensor, index) => (
                <SensorChart key={sensor.id} sensorId={sensor.id} title={sensor.name} color={chartColors[index % chartColors.length]} />
              ))}
            </div>
          )}
        </section>

        <section className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-8 shadow-xl">
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-cyan-400">AI Analizi</p>
            <h2 className="mt-2 text-xl font-semibold text-white">Makine için son tahmine dayalı değerlendirme</h2>

            <div className="mt-6 rounded-xl border border-slate-800 bg-slate-950/70 p-5">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm text-slate-400">Analiz edilen sensör</p>
                  <p className="mt-2 text-lg font-semibold text-white">{aiAnalysis?.sensor || 'Hazır değil'}</p>
                </div>
                <span className={`rounded-full px-3 py-1 text-sm font-medium ${aiAnalysis?.is_anomaly ? 'bg-red-500/20 text-red-400' : 'bg-emerald-500/20 text-emerald-400'}`}>
                  {aiAnalysis?.is_anomaly ? 'Anomali' : 'Normal'}
                </span>
              </div>

              <div className="mt-6 grid gap-4 md:grid-cols-2">
                <div className="rounded-lg border border-slate-800 bg-slate-900/60 p-4">
                  <p className="text-sm text-slate-400">Son Değer</p>
                  <p className="mt-2 text-2xl font-semibold text-white">{aiAnalysis?.latest_value ?? '—'}</p>
                </div>
                <div className="rounded-lg border border-slate-800 bg-slate-900/60 p-4">
                  <p className="text-sm text-slate-400">Durum</p>
                  <p className="mt-2 text-base font-semibold text-white">{aiAnalysis?.status || 'waiting'}</p>
                </div>
              </div>

              <div className="mt-6 rounded-lg border border-cyan-500/20 bg-cyan-500/10 p-4 text-cyan-200">
                <p className="text-sm font-semibold uppercase tracking-[0.2em]">AI Mesajı</p>
                <p className="mt-2 text-sm">{aiAnalysis?.ai_message || 'AI analizi henüz hazır değil.'}</p>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-8 shadow-xl">
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-cyan-400">Bakım Geçmişi</p>
            <h2 className="mt-2 text-xl font-semibold text-white">Son bakım kayıtları</h2>

            <div className="mt-6 space-y-3">
              {maintenanceHistory.map((entry) => (
                <article key={entry.id} className="rounded-lg border border-slate-800 bg-slate-950/70 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <h3 className="font-semibold text-slate-100">{entry.title}</h3>
                    <span className="text-sm text-slate-400">{entry.date}</span>
                  </div>
                  <p className="mt-2 text-sm text-slate-400">{entry.note}</p>
                </article>
              ))}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

function InfoItem({ label, value, mono = false }) {
  return (
    <div className="rounded-lg border border-slate-700 bg-slate-900/50 p-4">
      <dt className="text-xs font-medium uppercase tracking-wider text-slate-500">{label}</dt>
      <dd className={`mt-3 text-sm font-medium text-slate-100 ${mono ? 'font-mono text-cyan-300' : ''}`}>{value}</dd>
    </div>
  );
}

function ConnectedSensorCard({ sensor }) {
  return (
    <article className="rounded-xl border border-slate-700 bg-slate-800 p-6 shadow-lg transition-colors hover:border-slate-600">
      <div className="flex items-start justify-between gap-4">
        <h3 className="font-semibold text-slate-100">{sensor.name}</h3>
        <StatusBadge status={sensor.status} />
      </div>
      <div className="mt-6">
        <p className="text-xs font-medium uppercase tracking-wider text-slate-500">Son Değer</p>
        <p className="mt-2 text-3xl font-bold text-white">
          {sensor.latest_value ?? '—'} <span className="text-base font-medium text-slate-400">{sensor.unit}</span>
        </p>
      </div>
      <div className="mt-4 flex items-center justify-between rounded-lg border border-slate-700 bg-slate-900/60 px-3 py-2 text-sm text-slate-400">
        <span>Durum</span>
        <span className="font-medium text-slate-100">{sensor.status}</span>
      </div>
    </article>
  );
}

function PageState({ message, isError = false }) {
  return (
    <div className="min-h-screen p-8 max-w-7xl mx-auto">
      <div className={`rounded-xl border bg-slate-800 p-8 text-center shadow-lg ${isError ? 'border-red-500/30 text-red-400' : 'border-slate-700 text-slate-400'}`}>
        {message}
      </div>
    </div>
  );
}

export default MachineDetail;
