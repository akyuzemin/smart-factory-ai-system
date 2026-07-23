import { useMemo, useState } from 'react';

const mockMaintenanceData = [
  {
    id: 'BKM-001',
    machine: 'CNC İşleme Merkezi',
    type: 'Önleyici Bakım',
    priority: 'Yüksek',
    status: 'Planlandı',
    plannedDate: '2026-07-25',
    assignee: 'Ahmet Yılmaz',
  },
  {
    id: 'BKM-002',
    machine: 'Hidrolik Pres',
    type: 'Arıza Onarımı',
    priority: 'Kritik',
    status: 'Devam Ediyor',
    plannedDate: '2026-07-23',
    assignee: 'Mehmet Öztürk',
  },
  {
    id: 'BKM-003',
    machine: 'Robotik Kaynak Ünitesi',
    type: 'Periyodik Kontrol',
    priority: 'Orta',
    status: 'Tamamlandı',
    plannedDate: '2026-07-20',
    assignee: 'Ayşe Kaya',
  },
  {
    id: 'BKM-004',
    machine: 'Konveyör Sistemi',
    type: 'Yağlama',
    priority: 'Düşük',
    status: 'Planlandı',
    plannedDate: '2026-07-28',
    assignee: 'Fatma Demir',
  },
  {
    id: 'BKM-005',
    machine: 'CNC İşleme Merkezi',
    type: 'Filtre Değişimi',
    priority: 'Orta',
    status: 'Tamamlandı',
    plannedDate: '2026-07-15',
    assignee: 'Ahmet Yılmaz',
  },
];

function KpiCard({ label, value }) {
  return (
    <div className="rounded-xl border border-slate-700 bg-slate-800 p-4">
      <p className="text-sm font-semibold text-slate-400">{label}</p>
      <p className="mt-2 text-2xl font-bold text-white">{value}</p>
    </div>
  );
}

function StatusBadge({ status }) {
  const styles = {
    Planlandı: 'bg-cyan-500/10 text-cyan-300 border-cyan-500/20',
    'Devam Ediyor': 'bg-amber-500/10 text-amber-300 border-amber-500/20',
    Tamamlandı: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20',
  };
  return <span className={`inline-flex items-center rounded-full border px-3 py-1 text-sm font-semibold ${styles[status] || 'bg-slate-700 text-slate-300'}`}>{status}</span>;
}

function PriorityBadge({ priority }) {
  const styles = {
    Kritik: 'bg-red-500/10 text-red-300 border-red-500/20',
    Yüksek: 'bg-orange-500/10 text-orange-300 border-orange-500/20',
    Orta: 'bg-amber-500/10 text-amber-300 border-amber-500/20',
    Düşük: 'bg-sky-500/10 text-sky-300 border-sky-500/20',
  };
  return <span className={`inline-flex items-center rounded-full border px-3 py-1 text-sm font-semibold ${styles[priority] || 'bg-slate-700 text-slate-300'}`}>{priority}</span>;
}

function Maintenance() {
  const [records] = useState(mockMaintenanceData);
  const [machineFilter, setMachineFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  const machines = useMemo(() => [...new Set(records.map(r => r.machine))], [records]);

  const totals = useMemo(() => ({
    total: records.length,
    planned: records.filter(r => r.status === 'Planlandı').length,
    inProgress: records.filter(r => r.status === 'Devam Ediyor').length,
    completed: records.filter(r => r.status === 'Tamamlandı').length,
  }), [records]);

  const filteredRecords = useMemo(() => {
    return records.filter(r => {
      if (machineFilter !== 'all' && r.machine !== machineFilter) return false;
      if (priorityFilter !== 'all' && r.priority !== priorityFilter) return false;
      if (statusFilter !== 'all' && r.status !== statusFilter) return false;
      return true;
    });
  }, [records, machineFilter, priorityFilter, statusFilter]);

  return (
    <div className="min-h-screen bg-slate-950 p-6 text-slate-100">
      <div className="mx-auto max-w-7xl space-y-6">
        <header className="rounded-2xl border border-slate-800 bg-slate-900/80 p-6 shadow-xl">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-cyan-400">Bakım Yönetimi</p>
          <h1 className="mt-2 text-2xl font-semibold text-white">Bakım görevleri ve planlama</h1>
          <p className="mt-2 text-sm text-slate-400">Planlanan, devam eden ve tamamlanan bakım kayıtlarını yönetin.</p>
        </header>

        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <KpiCard label="Toplam Bakım" value={totals.total} />
          <KpiCard label="Planlanan Bakım" value={totals.planned} />
          <KpiCard label="Devam Eden" value={totals.inProgress} />
          <KpiCard label="Tamamlanan" value={totals.completed} />
        </section>

        <section className="rounded-2xl border border-slate-800 bg-slate-900/80 p-4 shadow-xl">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex flex-1 flex-col gap-3 md:flex-row">
              <select className="rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-slate-200" value={machineFilter} onChange={e => setMachineFilter(e.target.value)}>
                <option value="all">Tüm Makineler</option>
                {machines.map(m => <option key={m} value={m}>{m}</option>)}
              </select>
              <select className="rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-slate-200" value={priorityFilter} onChange={e => setPriorityFilter(e.target.value)}>
                <option value="all">Tüm Öncelikler</option>
                <option>Kritik</option><option>Yüksek</option><option>Orta</option><option>Düşük</option>
              </select>
              <select className="rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-slate-200" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
                <option value="all">Tüm Durumlar</option>
                <option>Planlandı</option><option>Devam Ediyor</option><option>Tamamlandı</option>
              </select>
            </div>
            <div className="text-sm text-slate-400">Gösterilen: <span className="font-semibold text-white">{filteredRecords.length}</span></div>
          </div>
        </section>

        <section className="rounded-2xl border border-slate-800 bg-slate-900/80 p-4 shadow-xl">
          <div className="hidden md:block">
            <table className="min-w-full table-auto">
              <thead>
                <tr className="text-left text-sm text-slate-400">
                  <th className="px-4 py-3">Bakım ID</th>
                  <th className="px-4 py-3">Makine</th>
                  <th className="px-4 py-3">Bakım Türü</th>
                  <th className="px-4 py-3">Öncelik</th>
                  <th className="px-4 py-3">Durum</th>
                  <th className="px-4 py-3">Planlanan Tarih</th>
                  <th className="px-4 py-3">Sorumlu</th>
                  <th className="px-4 py-3">İşlem</th>
                </tr>
              </thead>
              <tbody>
                {filteredRecords.map(r => (
                  <tr key={r.id} className="border-t border-slate-800 hover:bg-slate-900/60">
                    <td className="px-4 py-3 font-mono text-sm text-cyan-300">{r.id}</td>
                    <td className="px-4 py-3 text-white">{r.machine}</td>
                    <td className="px-4 py-3 text-slate-300">{r.type}</td>
                    <td className="px-4 py-3"><PriorityBadge priority={r.priority} /></td>
                    <td className="px-4 py-3"><StatusBadge status={r.status} /></td>
                    <td className="px-4 py-3 text-slate-300">{r.plannedDate}</td>
                    <td className="px-4 py-3 text-slate-300">{r.assignee}</td>
                    <td className="px-4 py-3"><button className="rounded-md bg-slate-800 px-3 py-1 text-sm font-semibold text-slate-200 hover:bg-slate-700">👁 Görüntüle</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="space-y-3 md:hidden">
            {filteredRecords.map(r => (
              <div key={r.id} className="rounded-lg border border-slate-700 bg-slate-800 p-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold text-white">{r.machine}</p>
                    <p className="text-sm text-slate-400">{r.type}</p>
                  </div>
                  <StatusBadge status={r.status} />
                </div>
                <div className="mt-3 flex flex-wrap items-center gap-2 text-sm text-slate-300">
                  <PriorityBadge priority={r.priority} />
                  <span className="text-slate-500">•</span>
                  <span>{r.assignee}</span>
                </div>
                <div className="mt-3 flex items-center justify-between text-sm text-slate-400">
                  <span>{r.plannedDate}</span>
                  <button className="rounded-md bg-slate-700 px-3 py-1 text-sm font-semibold text-slate-200">👁 Görüntüle</button>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

export default Maintenance;
