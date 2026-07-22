import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import SensorChart from '../components/dashboard/SensorChart';

function SensorDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [sensor, setSensor] = useState(null);
  const [stats, setStats] = useState(null);
  const [aiComment, setAiComment] = useState(null);
  const [alarmHistory, setAlarmHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;

    async function fetchSensorDetail() {
      try {
        const [sensorResponse, statsResponse, aiResponse, alarmResponse] = await Promise.all([
          fetch(`http://localhost:5000/api/sensors/${id}`),
          fetch(`http://localhost:5000/api/sensors/${id}/statistics`),
          fetch(`http://localhost:5000/api/sensors/${id}/ai-comment`),
          fetch(`http://localhost:5000/api/sensors/${id}/alarm-history`),
        ]);

        if (!sensorResponse.ok || !statsResponse.ok || !aiResponse.ok || !alarmResponse.ok) {
          throw new Error('Sensör detayı yüklenemedi.');
        }

        const sensorData = await sensorResponse.json();
        const statsData = await statsResponse.json();
        const aiData = await aiResponse.json();
        const alarmData = await alarmResponse.json();

        if (isMounted) {
          setSensor(sensorData);
          setStats(statsData);
          setAiComment(aiData);
          setAlarmHistory(alarmData);
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

    fetchSensorDetail();

    return () => {
      isMounted = false;
    };
  }, [id]);

  if (isLoading) {
    return <div className="min-h-screen bg-slate-950 p-8 text-center text-slate-400">Sensör detayları yükleniyor...</div>;
  }

  if (error || !sensor) {
    return (
      <div className="min-h-screen bg-slate-950 p-8 text-slate-100">
        <div className="mx-auto max-w-5xl rounded-2xl border border-red-500/30 bg-red-500/10 p-8 text-center text-red-400">
          <p>{error || 'Sensör bulunamadı.'}</p>
          <button
            onClick={() => navigate('/sensors')}
            className="mt-4 rounded-lg bg-slate-800 px-4 py-2 text-sm font-semibold text-slate-200 transition hover:bg-slate-700"
          >
            Sensör listesine dön
          </button>
        </div>
      </div>
    );
  }

  const statusClasses = sensor.status === 'Kritik'
    ? 'border-red-500/30 bg-red-500/20 text-red-400'
    : 'border-emerald-500/30 bg-emerald-500/20 text-emerald-400';

  return (
    <div className="min-h-screen bg-slate-950 p-8 text-slate-100">
      <div className="mx-auto max-w-7xl space-y-8">
        <header className="rounded-2xl border border-slate-800 bg-slate-900/80 p-8 shadow-xl">
          <button
            onClick={() => navigate('/sensors')}
            className="mb-4 rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-slate-300 transition hover:bg-slate-700"
          >
            ← Sensörlere dön
          </button>
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.3em] text-cyan-400">Sensör Detayı</p>
              <h1 className="mt-3 text-3xl font-semibold text-white">{sensor.name}</h1>
              <p className="mt-2 text-slate-400">Makine: {sensor.machine_name || 'Atanmış makine yok'} · Birim: {sensor.unit}</p>
            </div>
            <div className={`inline-flex rounded-full border px-4 py-2 text-sm font-semibold ${statusClasses}`}>
              Durum: {sensor.status}
            </div>
          </div>
        </header>

        <section className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-8 shadow-xl">
            <h2 className="text-xl font-semibold text-white">Anlık Ölçüm</h2>
            <div className="mt-5 flex items-end gap-3">
              <span className="text-5xl font-bold text-cyan-400">{sensor.latest_value ?? '—'}</span>
              <span className="pb-1 text-lg text-slate-400">{sensor.unit}</span>
            </div>
            <p className="mt-4 text-sm text-slate-400">Son alınan ölçüm değeri üzerinden sensör takibi sürdürülüyor.</p>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-8 shadow-xl">
            <h2 className="text-xl font-semibold text-white">İstatistik Özeti</h2>
            <div className="mt-5 space-y-4">
              <div className="rounded-xl border border-slate-700 bg-slate-800/80 p-4">
                <p className="text-sm text-slate-400">Minimum</p>
                <p className="mt-1 text-2xl font-semibold text-white">{stats?.min_value ?? '—'}</p>
              </div>
              <div className="rounded-xl border border-slate-700 bg-slate-800/80 p-4">
                <p className="text-sm text-slate-400">Maksimum</p>
                <p className="mt-1 text-2xl font-semibold text-white">{stats?.max_value ?? '—'}</p>
              </div>
              <div className="rounded-xl border border-slate-700 bg-slate-800/80 p-4">
                <p className="text-sm text-slate-400">Ortalama</p>
                <p className="mt-1 text-2xl font-semibold text-white">{stats?.avg_value ?? '—'}</p>
              </div>
            </div>
          </div>
        </section>

        <section className="rounded-2xl border border-slate-800 bg-slate-900/80 p-8 shadow-xl">
          <SensorChart sensorId={id} title={sensor.name} color="#38bdf8" />
        </section>

        <section className="grid gap-6 lg:grid-cols-[1fr_0.9fr]">
          <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-8 shadow-xl">
            <h2 className="text-xl font-semibold text-white">AI Yorumu</h2>
            <p className="mt-4 rounded-xl border border-cyan-500/20 bg-cyan-500/10 p-4 text-slate-300">
              {aiComment?.ai_message || 'AI yorumu henüz hazır değil.'}
            </p>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-8 shadow-xl">
            <h2 className="text-xl font-semibold text-white">Alarm Geçmişi</h2>
            <div className="mt-4 space-y-3">
              {alarmHistory.map((alarm) => (
                <div key={alarm.id} className="rounded-xl border border-slate-700 bg-slate-800/80 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <p className="font-semibold text-white">{alarm.title}</p>
                    <span className="rounded-full bg-slate-700 px-2 py-1 text-xs text-slate-300">{alarm.severity}</span>
                  </div>
                  <p className="mt-2 text-sm text-slate-400">{alarm.description}</p>
                  <p className="mt-2 text-xs uppercase tracking-[0.2em] text-slate-500">{alarm.time}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

export default SensorDetail;
