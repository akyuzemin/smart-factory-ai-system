import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import StatusBadge from '../components/StatusBadge';
import formatDate from '../utils/formatDate';

function MachineDetail() {
  const { id } = useParams();
  const [machine, setMachine] = useState(null);
  const [sensors, setSensors] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;

    async function fetchMachineDetail() {
      try {
        const [machineResponse, sensorsResponse] = await Promise.all([
          fetch(`http://localhost:5000/api/machines/${id}`),
          fetch(`http://localhost:5000/api/machines/${id}/sensors`),
        ]);

        if (!machineResponse.ok || !sensorsResponse.ok) {
          throw new Error('Makine detayları alınamadı.');
        }

        const [machineData, sensorsData] = await Promise.all([
          machineResponse.json(),
          sensorsResponse.json(),
        ]);

        if (isMounted) {
          setMachine(machineData);
          setSensors(sensorsData);
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
    <div className="min-h-screen p-8 max-w-7xl mx-auto">
      <header className="mb-8">
        <Link to="/machines" className="inline-flex items-center gap-2 text-sm font-medium text-cyan-400 transition-colors hover:text-cyan-300">
          <span aria-hidden="true">←</span>
          Makinelere Dön
        </Link>
        <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">
              {machine.name}
            </h1>
            <p className="mt-2 text-slate-400">Makine durumu ve bağlı sensörleri görüntüleyin.</p>
          </div>
          <StatusBadge status={machine.status} />
        </div>
      </header>

      <section className="rounded-xl border border-slate-700 bg-slate-800 p-6 shadow-lg">
        <h2 className="text-lg font-semibold text-white">Makine Bilgileri</h2>
        <dl className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <InfoItem label="Makine Kodu" value={machine.code || '—'} mono />
          <InfoItem label="Bölüm" value={machine.department || '—'} />
          <InfoItem label="Son Bakım Tarihi" value={formatDate(machine.last_maintenance)} />
          <div className="rounded-lg border border-slate-700 bg-slate-900/50 p-4">
            <dt className="text-xs font-medium uppercase tracking-wider text-slate-500">Durum</dt>
            <dd className="mt-3"><StatusBadge status={machine.status} /></dd>
          </div>
        </dl>
      </section>

      <section className="mt-8">
        <div className="mb-5">
          <h2 className="text-xl font-semibold text-white">Bağlı Sensörler</h2>
          <p className="mt-1 text-sm text-slate-400">Bu makineye atanmış sensörlerin son ölçüm bilgileri.</p>
        </div>

        {sensors.length === 0 ? (
          <div className="rounded-xl border border-slate-700 bg-slate-800 p-8 text-center text-slate-400">Bu makineye bağlı sensör bulunamadı.</div>
        ) : (
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
            {sensors.map((sensor) => <ConnectedSensorCard key={sensor.id} sensor={sensor} />)}
          </div>
        )}
      </section>
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
