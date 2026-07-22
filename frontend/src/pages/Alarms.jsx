import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';

function KpiCard({ label, value, accent = 'bg-slate-800' }) {
  return (
    <div className={`rounded-xl border border-slate-700 p-4 ${accent}`}>
      <p className="text-sm font-semibold text-slate-400">{label}</p>
      <p className="mt-2 text-2xl font-bold text-white">{value}</p>
    </div>
  );
}

function StatusBadge({ status }) {
  const styles = {
    Aktif: 'bg-red-500/10 text-red-300 border border-red-500/20',
    'Çözüldü': 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/20',
    Beklemede: 'bg-amber-500/10 text-amber-300 border border-amber-500/20',
  };

  return <span className={`inline-flex rounded-full border px-3 py-1 text-sm font-semibold ${styles[status] || 'bg-slate-700 text-slate-300 border border-slate-600'}`}>{status}</span>;
}

function PriorityBadge({ priority }) {
  const styles = {
    Yüksek: 'bg-red-500/10 text-red-300 border border-red-500/20',
    Orta: 'bg-amber-500/10 text-amber-300 border border-amber-500/20',
    Düşük: 'bg-cyan-500/10 text-cyan-300 border border-cyan-500/20',
  };

  return <span className={`inline-flex rounded-full border px-3 py-1 text-sm font-semibold ${styles[priority] || 'bg-slate-700 text-slate-300 border border-slate-600'}`}>{priority}</span>;
}

function generateAlarms(sensors) {
  return sensors.flatMap((sensor, index) => {
    const baseStatus = sensor.status || 'Normal';
    const alarmTypes = {
      temperature: 'Sıcaklık Artışı',
      pressure: 'Basınç Dalgası',
      humidity: 'Nem Değişimi',
    };

    const priorityMap = {
      Kritik: 'Yüksek',
      Normal: 'Düşük',
      'Veri Yok': 'Orta',
    };

    const statusMap = {
      Kritik: 'Aktif',
      Normal: 'Çözüldü',
      'Veri Yok': 'Beklemede',
    };

    const alarm = {
      id: `ALR-${String(index + 1).padStart(3, '0')}`,
      machine: sensor.machine_name || 'Atanmamış',
      sensor: sensor.name || sensor.title,
      sensorId: sensor.id,
      type: alarmTypes[sensor.sensor_type] || 'Ölçüm Uyarısı',
      priority: priorityMap[baseStatus] || 'Orta',
      status: statusMap[baseStatus] || 'Aktif',
      createdAt: baseStatus === 'Kritik' ? '2026-07-22 21:31' : '2026-07-22 20:15',
    };

    return [alarm];
  });
}

function Alarms() {
  const navigate = useNavigate();
  const [sensors, setSensors] = useState([]);
  const [alarms, setAlarms] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [query, setQuery] = useState('');
  const [machineFilter, setMachineFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    let isMounted = true;

    async function fetchSensors() {
      try {
        const response = await fetch('http://localhost:5000/api/sensors');
        if (!response.ok) throw new Error('Alarm verileri alınamadı.');

        const data = await response.json();
        if (isMounted) {
          setSensors(data);
          setAlarms(generateAlarms(data));
        }
      } catch (fetchError) {
        if (isMounted) setError(fetchError.message);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    fetchSensors();
    return () => { isMounted = false; };
  }, []);

  const machines = useMemo(() => {
    const unique = [];
    const seen = new Set();
    alarms.forEach((alarm) => {
      if (!seen.has(alarm.machine)) {
        seen.add(alarm.machine);
        unique.push(alarm.machine);
      }
    });
    return unique;
  }, [alarms]);

  const totals = useMemo(() => ({
    total: alarms.length,
    critical: alarms.filter((alarm) => alarm.priority === 'Yüksek').length,
    active: alarms.filter((alarm) => alarm.status === 'Aktif').length,
    resolved: alarms.filter((alarm) => alarm.status === 'Çözüldü').length,
  }), [alarms]);

  const filtered = useMemo(() => {
    return alarms.filter((alarm) => {
      if (machineFilter !== 'all' && alarm.machine !== machineFilter) return false;
      if (priorityFilter !== 'all' && alarm.priority !== priorityFilter) return false;
      if (statusFilter !== 'all' && alarm.status !== statusFilter) return false;
      if (query && !`${alarm.id} ${alarm.machine} ${alarm.sensor} ${alarm.type}`.toLowerCase().includes(query.toLowerCase())) return false;
      return true;
    });
  }, [alarms, machineFilter, priorityFilter, query, statusFilter]);

  return (
    <div className="min-h-screen bg-slate-950 p-6 text-slate-100">
      <div className="mx-auto max-w-7xl space-y-6">
        <header className="rounded-2xl border border-slate-800 bg-slate-900/80 p-6 shadow-xl">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-cyan-400">Alarm Yönetimi</p>
          <h1 className="mt-2 text-2xl font-semibold text-white">Fabrika alarmlarının merkezi izleme paneli</h1>
          <p className="mt-2 text-sm text-slate-400">Aktif ve geçmiş alarm verilerini filtreleyerek yönetin.</p>
        </header>

        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <KpiCard label="Toplam Alarm" value={totals.total} />
          <KpiCard label="Kritik Alarm" value={totals.critical} />
          <KpiCard label="Aktif Alarm" value={totals.active} />
          <KpiCard label="Çözülen Alarm" value={totals.resolved} />
        </section>

        <section className="rounded-2xl border border-slate-800 bg-slate-900/80 p-4 shadow-xl">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex flex-1 flex-col gap-3 md:flex-row">
              <input
                className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-slate-200 placeholder:text-slate-500"
                placeholder="Alarm ara..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
              <select className="rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-slate-200" value={machineFilter} onChange={(e) => setMachineFilter(e.target.value)}>
                <option value="all">Tüm Makineler</option>
                {machines.map((machine) => <option key={machine} value={machine}>{machine}</option>)}
              </select>
              <select className="rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-slate-200" value={priorityFilter} onChange={(e) => setPriorityFilter(e.target.value)}>
                <option value="all">Tüm Öncelikler</option>
                <option value="Yüksek">Yüksek</option>
                <option value="Orta">Orta</option>
                <option value="Düşük">Düşük</option>
              </select>
              <select className="rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-slate-200" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                <option value="all">Tüm Durumlar</option>
                <option value="Aktif">Aktif</option>
                <option value="Çözüldü">Çözüldü</option>
                <option value="Beklemede">Beklemede</option>
              </select>
            </div>
            <div className="text-sm text-slate-400">Gösterilen: <span className="font-semibold text-white">{filtered.length}</span></div>
          </div>
        </section>

        <section className="rounded-2xl border border-slate-800 bg-slate-900/80 p-4 shadow-xl">
          {isLoading ? (
            <div className="p-8 text-center text-slate-400">Alarm verileri oluşturuluyor...</div>
          ) : error ? (
            <div className="p-8 text-center text-red-400">{error}</div>
          ) : (
            <div>
              <div className="hidden md:block">
                <div className="overflow-x-auto">
                  <table className="min-w-full table-auto">
                    <thead>
                      <tr className="text-left text-sm text-slate-400">
                        <th className="px-4 py-3">Alarm ID</th>
                        <th className="px-4 py-3">Makine</th>
                        <th className="px-4 py-3">Sensör</th>
                        <th className="px-4 py-3">Alarm Türü</th>
                        <th className="px-4 py-3">Öncelik</th>
                        <th className="px-4 py-3">Durum</th>
                        <th className="px-4 py-3">Oluşturulma Tarihi</th>
                        <th className="px-4 py-3">İşlem</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filtered.map((alarm) => (
                        <tr key={alarm.id} className="border-t border-slate-800 hover:bg-slate-900/60">
                          <td className="px-4 py-3 text-white">{alarm.id}</td>
                          <td className="px-4 py-3 text-slate-300">{alarm.machine}</td>
                          <td className="px-4 py-3 text-slate-300">{alarm.sensor}</td>
                          <td className="px-4 py-3 text-slate-300">{alarm.type}</td>
                          <td className="px-4 py-3"><PriorityBadge priority={alarm.priority} /></td>
                          <td className="px-4 py-3"><StatusBadge status={alarm.status} /></td>
                          <td className="px-4 py-3 text-slate-300">{alarm.createdAt}</td>
                          <td className="px-4 py-3">
                            <button onClick={() => navigate(`/sensors/${alarm.sensorId}`)} className="rounded-md bg-slate-800 px-3 py-1 text-sm font-semibold text-slate-200 hover:bg-slate-700">👁 Görüntüle</button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="space-y-3 md:hidden">
                {filtered.map((alarm) => (
                  <div key={alarm.id} className="rounded-lg border border-slate-700 bg-slate-800 p-3">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-semibold text-white">{alarm.id}</p>
                        <p className="text-sm text-slate-400">{alarm.machine} · {alarm.sensor}</p>
                      </div>
                      <StatusBadge status={alarm.status} />
                    </div>
                    <div className="mt-3 flex flex-wrap items-center gap-2 text-sm text-slate-300">
                      <span>{alarm.type}</span>
                      <span>•</span>
                      <PriorityBadge priority={alarm.priority} />
                    </div>
                    <div className="mt-3 flex items-center justify-between text-sm text-slate-400">
                      <span>{alarm.createdAt}</span>
                      <button onClick={() => navigate(`/sensors/${alarm.sensorId}`)} className="rounded-md bg-slate-700 px-3 py-1 text-sm font-semibold text-slate-200">👁 Görüntüle</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

export default Alarms;
