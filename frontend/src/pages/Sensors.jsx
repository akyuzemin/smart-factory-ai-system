import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';

function KpiCard({ label, value, color = 'bg-slate-800' }) {
  return (
    <div className={`rounded-xl border border-slate-700 p-4 ${color}`}>
      <p className="text-sm font-semibold text-slate-400">{label}</p>
      <p className="mt-2 text-2xl font-bold text-white">{value}</p>
    </div>
  );
}

function StatusBadge({ status }) {
  const mapping = {
    Normal: 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/20',
    Kritik: 'bg-red-500/10 text-red-300 border border-red-500/20',
    'Veri Yok': 'bg-zinc-700 text-zinc-300 border border-zinc-600',
  };

  const cls = mapping[status] || 'bg-slate-700 text-slate-300 border border-slate-600';

  return <span className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-semibold ${cls}`}>{status}</span>;
}

function Sensors() {
  const navigate = useNavigate();
  const [sensors, setSensors] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters
  const [query, setQuery] = useState('');
  const [machineFilter, setMachineFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    let isMounted = true;

    async function fetchSensors() {
      try {
        const response = await fetch('http://localhost:5000/api/sensors');

        if (!response.ok) {
          throw new Error('Sensör verileri alınamadı.');
        }

        const data = await response.json();
        if (isMounted) setSensors(data);
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
    const map = {};
    sensors.forEach(s => { if (s.machine_name) map[s.machine_id] = s.machine_name; });
    return Object.entries(map).map(([id, name]) => ({ id, name }));
  }, [sensors]);

  // KPIs
  const totals = useMemo(() => {
    const total = sensors.length;
    const offline = sensors.filter(s => s.status === 'Veri Yok').length;
    const critical = sensors.filter(s => s.status === 'Kritik').length;
    const active = total - offline;
    return { total, active, critical, offline };
  }, [sensors]);

  const filtered = useMemo(() => {
    return sensors.filter(s => {
      if (machineFilter !== 'all' && String(s.machine_id) !== String(machineFilter)) return false;
      if (statusFilter !== 'all' && s.status !== statusFilter) return false;
      if (query && !(s.name || s.title).toLowerCase().includes(query.toLowerCase())) return false;
      return true;
    });
  }, [sensors, query, machineFilter, statusFilter]);

  return (
    <div className="min-h-screen bg-slate-950 p-6 text-slate-100">
      <div className="mx-auto max-w-7xl space-y-6">
        <header className="rounded-2xl border border-slate-800 bg-slate-900/80 p-6 shadow-xl">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-cyan-400">Sensör Yönetimi</p>
          <h1 className="mt-2 text-2xl font-semibold text-white">Sensör envanteri — merkezi yönetim</h1>
          <p className="mt-2 text-sm text-slate-400">Filtreleyin, sıralayın ve sensör detaylarına hızlıca geçiş yapın.</p>
        </header>

        {/* KPI Cards */}
        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <KpiCard label="Toplam Sensör" value={totals.total} />
          <KpiCard label="Aktif Sensör" value={totals.active} />
          <KpiCard label="Alarmdaki Sensör" value={totals.critical} color="bg-slate-800" />
          <KpiCard label="Çevrimdışı Sensör" value={totals.offline} color="bg-slate-800" />
        </section>

        {/* Filters */}
        <section className="rounded-2xl border border-slate-800 bg-slate-900/80 p-4 shadow-xl">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div className="flex flex-1 items-center gap-3">
              <input
                className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-slate-200 placeholder:text-slate-500"
                placeholder="Sensör ara..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />

              <select
                className="rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-slate-200"
                value={machineFilter}
                onChange={(e) => setMachineFilter(e.target.value)}
              >
                <option value="all">Tüm Makineler</option>
                {machines.map(m => (
                  <option key={m.id} value={m.id}>{m.name}</option>
                ))}
              </select>

              <select
                className="rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-slate-200"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="all">Tüm Durumlar</option>
                <option value="Normal">Normal</option>
                <option value="Kritik">Kritik</option>
                <option value="Veri Yok">Veri Yok</option>
              </select>
            </div>

            <div className="mt-3 flex items-center gap-3 md:mt-0">
              <div className="text-sm text-slate-400">Gösterilen: <span className="font-semibold text-white">{filtered.length}</span></div>
            </div>
          </div>
        </section>

        {/* Table / List */}
        <section className="rounded-2xl border border-slate-800 bg-slate-900/80 p-4 shadow-xl">
          {isLoading ? (
            <div className="p-8 text-center text-slate-400">Sensör verileri yükleniyor...</div>
          ) : error ? (
            <div className="p-8 text-center text-red-400">{error}</div>
          ) : (
            <div>
              {/* Desktop table */}
              <div className="hidden md:block">
                <div className="overflow-x-auto">
                  <table className="min-w-full table-auto">
                    <thead>
                      <tr className="text-left text-sm text-slate-400">
                        <th className="px-4 py-3">Sensör Adı</th>
                        <th className="px-4 py-3">Bağlı Makine</th>
                        <th className="px-4 py-3">Son Değer</th>
                        <th className="px-4 py-3">Birim</th>
                        <th className="px-4 py-3">Durum</th>
                        <th className="px-4 py-3">Son Güncelleme</th>
                        <th className="px-4 py-3">İşlemler</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filtered.map(s => (
                        <tr key={s.id} className="border-t border-slate-800 hover:bg-slate-900/60">
                          <td className="px-4 py-3 text-white font-medium">{s.name}</td>
                          <td className="px-4 py-3 text-slate-300">{s.machine_name || '—'}</td>
                          <td className="px-4 py-3 text-white">{s.value ?? '—'}</td>
                          <td className="px-4 py-3 text-slate-300">{s.unit}</td>
                          <td className="px-4 py-3"><StatusBadge status={s.status} /></td>
                          <td className="px-4 py-3 text-slate-300">{s.value ? 'Şimdi' : '—'}</td>
                          <td className="px-4 py-3">
                            <button
                              onClick={() => navigate(`/sensors/${s.id}`)}
                              className="rounded-md bg-slate-800 px-3 py-1 text-sm font-semibold text-slate-200 hover:bg-slate-700"
                            >
                              👁 Görüntüle
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Mobile list */}
              <div className="space-y-3 md:hidden">
                {filtered.map(s => (
                  <div key={s.id} className="rounded-lg border border-slate-700 bg-slate-800 p-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-semibold text-white">{s.name}</p>
                        <p className="text-sm text-slate-400">{s.machine_name || '—'}</p>
                      </div>
                      <div className="space-y-1 text-right">
                        <div className="text-white font-semibold">{s.value ?? '—'} <span className="text-sm text-slate-400">{s.unit}</span></div>
                        <div><StatusBadge status={s.status} /></div>
                      </div>
                    </div>
                    <div className="mt-3 flex justify-end">
                      <button onClick={() => navigate(`/sensors/${s.id}`)} className="rounded-md bg-slate-700 px-3 py-1 text-sm font-semibold text-slate-200">👁 Görüntüle</button>
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

export default Sensors;
