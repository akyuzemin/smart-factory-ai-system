import { useEffect, useMemo, useState } from 'react';

const initialMaintenanceData = [
  {
    id: 'BKM-001',
    machine: 'CNC İşleme Merkezi',
    type: 'Önleyici Bakım',
    priority: 'Yüksek',
    status: 'Planlandı',
    plannedDate: '2026-08-18',
    assignee: 'Ahmet Yılmaz',
    progress: 35,
  },
  {
    id: 'BKM-002',
    machine: 'Hidrolik Pres',
    type: 'Arıza Onarımı',
    priority: 'Kritik',
    status: 'Devam Ediyor',
    plannedDate: '2026-08-16',
    assignee: 'Mehmet Öztürk',
    progress: 68,
  },
  {
    id: 'BKM-003',
    machine: 'Robotik Kaynak Ünitesi',
    type: 'Periyodik Kontrol',
    priority: 'Orta',
    status: 'Tamamlandı',
    plannedDate: '2026-08-15',
    assignee: 'Ayşe Kaya',
    progress: 100,
  },
  {
    id: 'BKM-004',
    machine: 'Konveyör Sistemi',
    type: 'Yağlama',
    priority: 'Düşük',
    status: 'Planlandı',
    plannedDate: '2026-08-20',
    assignee: 'Fatma Demir',
    progress: 20,
  },
  {
    id: 'BKM-005',
    machine: 'CNC İşleme Merkezi',
    type: 'Filtre Değişimi',
    priority: 'Orta',
    status: 'Tamamlandı',
    plannedDate: '2026-08-14',
    assignee: 'Ahmet Yılmaz',
    progress: 100,
  },
  {
    id: 'BKM-006',
    machine: 'Enjeksiyon Kalıplama',
    type: 'Hidrolik Kontrol',
    priority: 'Yüksek',
    status: 'Devam Ediyor',
    plannedDate: '2026-08-17',
    assignee: 'Murat Çelik',
    progress: 74,
  },
  {
    id: 'BKM-007',
    machine: 'Endüstriyel Paketleme',
    type: 'Sensör Kontrolü',
    priority: 'Orta',
    status: 'Planlandı',
    plannedDate: '2026-08-21',
    assignee: 'Can Aydın',
    progress: 15,
  },
];

function KpiCard({ label, value, color = 'text-white', subtitle }) {
  return (
    <div className="rounded-xl border border-slate-700 bg-slate-800 p-5">
      <p className="text-sm font-semibold text-slate-400">
        {label}
      </p>

      <p className={`mt-2 text-3xl font-bold ${color}`}>
        {value}
      </p>

      {subtitle && (
        <p className="mt-1 text-xs text-slate-500">
          {subtitle}
        </p>
      )}
    </div>
  );
}

function StatusBadge({ status }) {
  const styles = {
    Planlandı:
      'bg-cyan-500/10 text-cyan-300 border-cyan-500/20',

    'Devam Ediyor':
      'bg-amber-500/10 text-amber-300 border-amber-500/20',

    Tamamlandı:
      'bg-emerald-500/10 text-emerald-300 border-emerald-500/20',
  };

  return (
    <span
      className={`inline-flex items-center rounded-full border px-3 py-1 text-sm font-semibold ${
        styles[status] ||
        'bg-slate-700 text-slate-300 border-slate-600'
      }`}
    >
      {status}
    </span>
  );
}

function PriorityBadge({ priority }) {
  const styles = {
    Kritik:
      'bg-red-500/10 text-red-300 border-red-500/20',

    Yüksek:
      'bg-orange-500/10 text-orange-300 border-orange-500/20',

    Orta:
      'bg-amber-500/10 text-amber-300 border-amber-500/20',

    Düşük:
      'bg-sky-500/10 text-sky-300 border-sky-500/20',
  };

  return (
    <span
      className={`inline-flex items-center rounded-full border px-3 py-1 text-sm font-semibold ${
        styles[priority] ||
        'bg-slate-700 text-slate-300 border-slate-600'
      }`}
    >
      {priority}
    </span>
  );
}

function ProgressBar({ value }) {
  return (
    <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-slate-700">
      <div
        className="h-full rounded-full bg-cyan-500 transition-all duration-700"
        style={{
          width: `${value}%`,
        }}
      />
    </div>
  );
}

function Maintenance() {
  const [records, setRecords] = useState(
    initialMaintenanceData
  );

  const [machineFilter, setMachineFilter] =
    useState('all');

  const [priorityFilter, setPriorityFilter] =
    useState('all');

  const [statusFilter, setStatusFilter] =
    useState('all');

  const [lastUpdate, setLastUpdate] =
    useState(new Date());

  /*
   * CANLI BAKIM VERİSİ
   *
   * Her 2 saniyede bakım ilerleme değerleri
   * küçük miktarlarda değişir.
   */
  useEffect(() => {
    const interval = setInterval(() => {
      setRecords((currentRecords) => {
        return currentRecords.map((record) => {
          let newProgress = record.progress;
          let newStatus = record.status;

          /*
           * Tamamlanmamış bakımlarda ilerleme
           * zaman içerisinde artıyor.
           */
          if (record.status !== 'Tamamlandı') {
            const change =
              Math.floor(Math.random() * 5);

            newProgress = Math.min(
              100,
              record.progress + change
            );

            /*
             * İlerleme %100'e ulaşırsa
             * bakım tamamlandı.
             */
            if (newProgress >= 100) {
              newProgress = 100;
              newStatus = 'Tamamlandı';
            }

            /*
             * Bazı planlı bakımlar zaman zaman
             * çalışmaya başlayabilir.
             */
            else if (
              record.status === 'Planlandı' &&
              Math.random() > 0.92
            ) {
              newStatus = 'Devam Ediyor';
            }
          }

          return {
            ...record,
            progress: newProgress,
            status: newStatus,
          };
        });
      });

      setLastUpdate(new Date());
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  const machines = useMemo(() => {
    return [
      ...new Set(
        records.map((record) => record.machine)
      ),
    ];
  }, [records]);

  const totals = useMemo(() => {
    const total = records.length;

    const planned = records.filter(
      (record) =>
        record.status === 'Planlandı'
    ).length;

    const inProgress = records.filter(
      (record) =>
        record.status === 'Devam Ediyor'
    ).length;

    const completed = records.filter(
      (record) =>
        record.status === 'Tamamlandı'
    ).length;

    const critical = records.filter(
      (record) =>
        record.priority === 'Kritik'
    ).length;

    const averageProgress =
      total > 0
        ? Math.round(
            records.reduce(
              (sum, record) =>
                sum + record.progress,
              0
            ) / total
          )
        : 0;

    return {
      total,
      planned,
      inProgress,
      completed,
      critical,
      averageProgress,
    };
  }, [records]);

  const filteredRecords = useMemo(() => {
    return records.filter((record) => {
      if (
        machineFilter !== 'all' &&
        record.machine !== machineFilter
      ) {
        return false;
      }

      if (
        priorityFilter !== 'all' &&
        record.priority !== priorityFilter
      ) {
        return false;
      }

      if (
        statusFilter !== 'all' &&
        record.status !== statusFilter
      ) {
        return false;
      }

      return true;
    });
  }, [
    records,
    machineFilter,
    priorityFilter,
    statusFilter,
  ]);

  return (
    <div className="min-h-screen bg-slate-950 p-6 text-slate-100">

      <div className="mx-auto max-w-7xl space-y-6">

        {/* HEADER */}
        <header className="rounded-2xl border border-slate-800 bg-slate-900/80 p-6 shadow-xl">

          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">

            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.3em] text-cyan-400">
                SMART FACTORY / MAINTENANCE
              </p>

              <h1 className="mt-2 text-3xl font-bold text-white">
                Bakım Yönetim Paneli
              </h1>

              <p className="mt-2 text-sm text-slate-400">
                Bakım görevlerini, öncelikleri ve
                makine bakım süreçlerini anlık olarak
                takip edin.
              </p>
            </div>

            {/* LIVE INDICATOR */}
            <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/10 px-4 py-3">

              <div className="flex items-center gap-2">

                <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-400" />

                <span className="text-sm font-semibold text-emerald-400">
                  CANLI VERİ
                </span>

              </div>

              <p className="mt-1 text-xs text-slate-500">
                Son güncelleme:{' '}
                {lastUpdate.toLocaleTimeString('tr-TR')}
              </p>

            </div>

          </div>

        </header>

        {/* KPI CARDS */}
        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">

          <KpiCard
            label="Toplam Bakım"
            value={totals.total}
            subtitle="Tüm bakım kayıtları"
          />

          <KpiCard
            label="Planlanan"
            value={totals.planned}
            subtitle="Bekleyen görevler"
            color="text-cyan-400"
          />

          <KpiCard
            label="Devam Eden"
            value={totals.inProgress}
            subtitle="Aktif bakım"
            color="text-amber-400"
          />

          <KpiCard
            label="Tamamlanan"
            value={totals.completed}
            subtitle="Başarıyla tamamlandı"
            color="text-emerald-400"
          />

          <KpiCard
            label="Kritik"
            value={totals.critical}
            subtitle="Öncelikli bakım"
            color="text-red-400"
          />

        </section>

        {/* GENERAL PROGRESS */}
        <section className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5 shadow-xl">

          <div className="flex items-center justify-between">

            <div>
              <h2 className="text-lg font-bold text-white">
                Genel Bakım İlerlemesi
              </h2>

              <p className="mt-1 text-sm text-slate-400">
                Tüm bakım görevlerinin ortalama ilerleme durumu
              </p>
            </div>

            <span className="text-2xl font-bold text-cyan-400">
              %{totals.averageProgress}
            </span>

          </div>

          <div className="mt-4 h-3 overflow-hidden rounded-full bg-slate-800">

            <div
              className="h-full rounded-full bg-cyan-500 transition-all duration-700"
              style={{
                width: `${totals.averageProgress}%`,
              }}
            />

          </div>

        </section>

        {/* FILTERS */}
        <section className="rounded-2xl border border-slate-800 bg-slate-900/80 p-4 shadow-xl">

          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">

            <div className="flex flex-1 flex-col gap-3 md:flex-row">

              <select
                className="rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-slate-200 outline-none focus:border-cyan-500"
                value={machineFilter}
                onChange={(e) =>
                  setMachineFilter(e.target.value)
                }
              >

                <option value="all">
                  Tüm Makineler
                </option>

                {machines.map((machine) => (
                  <option
                    key={machine}
                    value={machine}
                  >
                    {machine}
                  </option>
                ))}

              </select>

              <select
                className="rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-slate-200 outline-none focus:border-cyan-500"
                value={priorityFilter}
                onChange={(e) =>
                  setPriorityFilter(e.target.value)
                }
              >

                <option value="all">
                  Tüm Öncelikler
                </option>

                <option value="Kritik">
                  Kritik
                </option>

                <option value="Yüksek">
                  Yüksek
                </option>

                <option value="Orta">
                  Orta
                </option>

                <option value="Düşük">
                  Düşük
                </option>

              </select>

              <select
                className="rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-slate-200 outline-none focus:border-cyan-500"
                value={statusFilter}
                onChange={(e) =>
                  setStatusFilter(e.target.value)
                }
              >

                <option value="all">
                  Tüm Durumlar
                </option>

                <option value="Planlandı">
                  Planlandı
                </option>

                <option value="Devam Ediyor">
                  Devam Ediyor
                </option>

                <option value="Tamamlandı">
                  Tamamlandı
                </option>

              </select>

            </div>

            <div className="text-sm text-slate-400">

              Gösterilen:{' '}

              <span className="font-semibold text-white">
                {filteredRecords.length}
              </span>

            </div>

          </div>

        </section>

        {/* TABLE */}
        <section className="rounded-2xl border border-slate-800 bg-slate-900/80 p-4 shadow-xl">

          <div className="hidden md:block">

            <div className="overflow-x-auto">

              <table className="min-w-full table-auto">

                <thead>

                  <tr className="border-b border-slate-800 text-left text-sm text-slate-400">

                    <th className="px-4 py-4">
                      Bakım ID
                    </th>

                    <th className="px-4 py-4">
                      Makine
                    </th>

                    <th className="px-4 py-4">
                      Bakım Türü
                    </th>

                    <th className="px-4 py-4">
                      Öncelik
                    </th>

                    <th className="px-4 py-4">
                      Durum
                    </th>

                    <th className="px-4 py-4">
                      İlerleme
                    </th>

                    <th className="px-4 py-4">
                      Tarih
                    </th>

                    <th className="px-4 py-4">
                      Sorumlu
                    </th>

                  </tr>

                </thead>

                <tbody>

                  {filteredRecords.map((record) => (

                    <tr
                      key={record.id}
                      className="border-b border-slate-800/70 transition-colors hover:bg-slate-800/40"
                    >

                      <td className="px-4 py-5 font-mono text-sm text-cyan-300">
                        {record.id}
                      </td>

                      <td className="px-4 py-5 font-semibold text-white">
                        {record.machine}
                      </td>

                      <td className="px-4 py-5 text-slate-300">
                        {record.type}
                      </td>

                      <td className="px-4 py-5">
                        <PriorityBadge
                          priority={record.priority}
                        />
                      </td>

                      <td className="px-4 py-5">
                        <StatusBadge
                          status={record.status}
                        />
                      </td>

                      <td className="min-w-[150px] px-4 py-5">

                        <div className="flex justify-between">

                          <span className="text-sm font-semibold text-white">
                            %{record.progress}
                          </span>

                        </div>

                        <ProgressBar
                          value={record.progress}
                        />

                      </td>

                      <td className="px-4 py-5 text-slate-300">
                        {record.plannedDate}
                      </td>

                      <td className="px-4 py-5 text-slate-300">
                        {record.assignee}
                      </td>

                    </tr>

                  ))}

                </tbody>

              </table>

            </div>

          </div>

          {/* MOBILE */}
          <div className="space-y-3 md:hidden">

            {filteredRecords.map((record) => (

              <div
                key={record.id}
                className="rounded-lg border border-slate-700 bg-slate-800 p-4"
              >

                <div className="flex items-start justify-between gap-3">

                  <div>

                    <p className="font-semibold text-white">
                      {record.machine}
                    </p>

                    <p className="mt-1 text-sm text-slate-400">
                      {record.type}
                    </p>

                  </div>

                  <StatusBadge
                    status={record.status}
                  />

                </div>

                <div className="mt-4">

                  <div className="flex justify-between text-sm">

                    <span className="text-slate-400">
                      İlerleme
                    </span>

                    <span className="font-semibold text-white">
                      %{record.progress}
                    </span>

                  </div>

                  <ProgressBar
                    value={record.progress}
                  />

                </div>

                <div className="mt-4 flex flex-wrap items-center gap-2">

                  <PriorityBadge
                    priority={record.priority}
                  />

                  <span className="text-slate-500">
                    •
                  </span>

                  <span className="text-sm text-slate-300">
                    {record.assignee}
                  </span>

                </div>

                <div className="mt-3 text-sm text-slate-400">
                  Planlanan: {record.plannedDate}
                </div>

              </div>

            ))}

          </div>

          {filteredRecords.length === 0 && (
            <div className="py-10 text-center text-slate-500">
              Filtrelere uygun bakım kaydı bulunamadı.
            </div>
          )}

        </section>

        {/* BOTTOM SUMMARY */}
        <section className="grid gap-6 lg:grid-cols-2">

          {/* PRIORITY SUMMARY */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-6">

            <h2 className="text-lg font-bold text-white">
              Öncelik Dağılımı
            </h2>

            <p className="mt-1 text-sm text-slate-400">
              Bakım görevlerinin öncelik seviyeleri
            </p>

            <div className="mt-6 space-y-4">

              {['Kritik', 'Yüksek', 'Orta', 'Düşük'].map(
                (priority) => {

                  const count =
                    records.filter(
                      (record) =>
                        record.priority === priority
                    ).length;

                  const percentage =
                    records.length > 0
                      ? Math.round(
                          (count /
                            records.length) *
                            100
                        )
                      : 0;

                  return (
                    <div key={priority}>

                      <div className="flex items-center justify-between">

                        <span className="text-sm text-slate-300">
                          {priority}
                        </span>

                        <span className="text-sm font-semibold text-white">
                          {count} kayıt
                        </span>

                      </div>

                      <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-800">

                        <div
                          className="h-full rounded-full bg-cyan-500 transition-all duration-700"
                          style={{
                            width: `${percentage}%`,
                          }}
                        />

                      </div>

                    </div>
                  );
                }
              )}

            </div>

          </div>

          {/* STATUS SUMMARY */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-6">

            <h2 className="text-lg font-bold text-white">
              Bakım Durumu
            </h2>

            <p className="mt-1 text-sm text-slate-400">
              Bakım süreçlerinin anlık durumu
            </p>

            <div className="mt-6 space-y-4">

              <div className="flex items-center justify-between rounded-lg border border-slate-800 bg-slate-950/50 p-4">

                <div className="flex items-center gap-3">

                  <span className="h-2.5 w-2.5 rounded-full bg-cyan-400" />

                  <span className="text-sm text-slate-300">
                    Planlandı
                  </span>

                </div>

                <span className="font-bold text-white">
                  {totals.planned}
                </span>

              </div>

              <div className="flex items-center justify-between rounded-lg border border-slate-800 bg-slate-950/50 p-4">

                <div className="flex items-center gap-3">

                  <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-amber-400" />

                  <span className="text-sm text-slate-300">
                    Devam Ediyor
                  </span>

                </div>

                <span className="font-bold text-amber-400">
                  {totals.inProgress}
                </span>

              </div>

              <div className="flex items-center justify-between rounded-lg border border-slate-800 bg-slate-950/50 p-4">

                <div className="flex items-center gap-3">

                  <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" />

                  <span className="text-sm text-slate-300">
                    Tamamlandı
                  </span>

                </div>

                <span className="font-bold text-emerald-400">
                  {totals.completed}
                </span>

              </div>

            </div>

          </div>

        </section>

      </div>

    </div>
  );
}

export default Maintenance;