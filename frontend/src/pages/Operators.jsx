import { useEffect, useMemo, useState } from 'react';

const initialOperators = [
  {
    id: 1,
    name: 'Ahmet Yılmaz',
    employeeNo: 'OP-001',
    department: 'Üretim',
    shift: '08:00 - 16:00',
    machine: 'CNC-01',
    status: 'Aktif',
    efficiency: 94,
    production: 128,
  },
  {
    id: 2,
    name: 'Mehmet Kaya',
    employeeNo: 'OP-002',
    department: 'Üretim',
    shift: '08:00 - 16:00',
    machine: 'PRS-02',
    status: 'Aktif',
    efficiency: 89,
    production: 116,
  },
  {
    id: 3,
    name: 'Emre Demir',
    employeeNo: 'OP-003',
    department: 'Kaynak',
    shift: '16:00 - 00:00',
    machine: 'RBW-03',
    status: 'Aktif',
    efficiency: 92,
    production: 104,
  },
  {
    id: 4,
    name: 'Burak Şahin',
    employeeNo: 'OP-004',
    department: 'Paketleme',
    shift: '08:00 - 16:00',
    machine: 'PKG-04',
    status: 'Molada',
    efficiency: 86,
    production: 97,
  },
  {
    id: 5,
    name: 'Can Aydın',
    employeeNo: 'OP-005',
    department: 'Lojistik',
    shift: '16:00 - 00:00',
    machine: 'CNV-05',
    status: 'Aktif',
    efficiency: 91,
    production: 121,
  },
  {
    id: 6,
    name: 'Murat Çelik',
    employeeNo: 'OP-006',
    department: 'Bakım',
    shift: '00:00 - 08:00',
    machine: 'Tüm Hatlar',
    status: 'Aktif',
    efficiency: 88,
    production: 73,
  },
];

function KpiCard({ label, value, subtitle, color = 'text-cyan-400' }) {
  return (
    <div className="rounded-xl border border-slate-700 bg-slate-900 p-5">
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
    Aktif:
      'border-emerald-500/30 bg-emerald-500/10 text-emerald-400',

    Molada:
      'border-amber-500/30 bg-amber-500/10 text-amber-400',

    'İzinli':
      'border-blue-500/30 bg-blue-500/10 text-blue-400',

    Pasif:
      'border-red-500/30 bg-red-500/10 text-red-400',
  };

  return (
    <span
      className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${
        styles[status] ||
        'border-slate-600 bg-slate-700 text-slate-300'
      }`}
    >
      {status}
    </span>
  );
}

function Operators() {
  const [operators, setOperators] = useState(initialOperators);
  const [lastUpdate, setLastUpdate] = useState(new Date());
  const [query, setQuery] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  /*
   * Demo için canlı operatör verisi.
   *
   * Her 2 saniyede performans ve üretim değerleri
   * küçük miktarlarda değişir.
   */
  useEffect(() => {
    const interval = setInterval(() => {
      setOperators((current) =>
        current.map((operator) => {
          const efficiencyChange =
            Math.floor(Math.random() * 5) - 2;

          const productionIncrease =
            Math.floor(Math.random() * 3);

          return {
            ...operator,

            efficiency: Math.max(
              75,
              Math.min(
                99,
                operator.efficiency + efficiencyChange
              )
            ),

            production:
              operator.production + productionIncrease,
          };
        })
      );

      setLastUpdate(new Date());
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  const departments = useMemo(() => {
    return [
      ...new Set(
        operators.map((operator) => operator.department)
      ),
    ];
  }, [operators]);

  const statistics = useMemo(() => {
    const total = operators.length;

    const active = operators.filter(
      (operator) => operator.status === 'Aktif'
    ).length;

    const onBreak = operators.filter(
      (operator) => operator.status === 'Molada'
    ).length;

    const averageEfficiency =
      total > 0
        ? Math.round(
            operators.reduce(
              (sum, operator) =>
                sum + operator.efficiency,
              0
            ) / total
          )
        : 0;

    const totalProduction = operators.reduce(
      (sum, operator) =>
        sum + operator.production,
      0
    );

    return {
      total,
      active,
      onBreak,
      averageEfficiency,
      totalProduction,
    };
  }, [operators]);

  const filteredOperators = useMemo(() => {
    return operators.filter((operator) => {
      const searchText = query.toLowerCase();

      const matchesSearch =
        !query ||
        operator.name
          .toLowerCase()
          .includes(searchText) ||
        operator.employeeNo
          .toLowerCase()
          .includes(searchText) ||
        operator.machine
          .toLowerCase()
          .includes(searchText);

      const matchesDepartment =
        departmentFilter === 'all' ||
        operator.department === departmentFilter;

      const matchesStatus =
        statusFilter === 'all' ||
        operator.status === statusFilter;

      return (
        matchesSearch &&
        matchesDepartment &&
        matchesStatus
      );
    });
  }, [
    operators,
    query,
    departmentFilter,
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
                SMART FACTORY / OPERATORS
              </p>

              <h1 className="mt-2 text-3xl font-bold text-white">
                Operatör Yönetim Paneli
              </h1>

              <p className="mt-2 text-sm text-slate-400">
                Operatörleri, vardiyaları ve üretim
                performanslarını anlık olarak takip edin.
              </p>
            </div>

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
        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">

          <KpiCard
            label="Toplam Operatör"
            value={statistics.total}
            subtitle="Kayıtlı personel"
          />

          <KpiCard
            label="Aktif Operatör"
            value={statistics.active}
            subtitle={`${statistics.onBreak} kişi molada`}
            color="text-emerald-400"
          />

          <KpiCard
            label="Ortalama Verimlilik"
            value={`%${statistics.averageEfficiency}`}
            subtitle="Anlık performans"
            color="text-cyan-400"
          />

          <KpiCard
            label="Toplam Üretim"
            value={statistics.totalProduction}
            subtitle="Operatör bazlı üretim"
            color="text-amber-400"
          />

        </section>

        {/* FILTERS */}
        <section className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5 shadow-xl">

          <div className="flex flex-col gap-3 lg:flex-row">

            <input
              type="text"
              placeholder="Operatör, sicil no veya makine ara..."
              value={query}
              onChange={(e) =>
                setQuery(e.target.value)
              }
              className="flex-1 rounded-lg border border-slate-700 bg-slate-800 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-500 focus:border-cyan-500"
            />

            <select
              value={departmentFilter}
              onChange={(e) =>
                setDepartmentFilter(e.target.value)
              }
              className="rounded-lg border border-slate-700 bg-slate-800 px-4 py-3 text-sm text-slate-200 outline-none"
            >

              <option value="all">
                Tüm Departmanlar
              </option>

              {departments.map((department) => (
                <option
                  key={department}
                  value={department}
                >
                  {department}
                </option>
              ))}

            </select>

            <select
              value={statusFilter}
              onChange={(e) =>
                setStatusFilter(e.target.value)
              }
              className="rounded-lg border border-slate-700 bg-slate-800 px-4 py-3 text-sm text-slate-200 outline-none"
            >

              <option value="all">
                Tüm Durumlar
              </option>

              <option value="Aktif">
                Aktif
              </option>

              <option value="Molada">
                Molada
              </option>

              <option value="İzinli">
                İzinli
              </option>

            </select>

          </div>

          <div className="mt-3 text-sm text-slate-500">
            Gösterilen:{' '}
            <span className="font-semibold text-white">
              {filteredOperators.length}
            </span>{' '}
            operatör
          </div>

        </section>

        {/* OPERATOR TABLE */}
        <section className="rounded-2xl border border-slate-800 bg-slate-900/80 p-6 shadow-xl">

          <div className="mb-5">

            <h2 className="text-xl font-bold text-white">
              Operatör Listesi
            </h2>

            <p className="mt-1 text-sm text-slate-400">
              Personel ve anlık performans bilgileri
            </p>

          </div>

          <div className="overflow-x-auto">

            <table className="min-w-full">

              <thead>

                <tr className="border-b border-slate-800 text-left text-xs uppercase tracking-wider text-slate-500">

                  <th className="px-4 py-4">
                    Operatör
                  </th>

                  <th className="px-4 py-4">
                    Departman
                  </th>

                  <th className="px-4 py-4">
                    Vardiya
                  </th>

                  <th className="px-4 py-4">
                    Makine
                  </th>

                  <th className="px-4 py-4">
                    Üretim
                  </th>

                  <th className="px-4 py-4">
                    Verimlilik
                  </th>

                  <th className="px-4 py-4">
                    Durum
                  </th>

                </tr>

              </thead>

              <tbody>

                {filteredOperators.map((operator) => (

                  <tr
                    key={operator.id}
                    className="border-b border-slate-800/70 transition-colors hover:bg-slate-800/40"
                  >

                    <td className="px-4 py-5">

                      <div className="flex items-center gap-3">

                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-cyan-500/10 text-sm font-bold text-cyan-400">

                          {operator.name
                            .split(' ')
                            .map((word) => word[0])
                            .join('')
                            .slice(0, 2)}

                        </div>

                        <div>

                          <p className="font-semibold text-white">
                            {operator.name}
                          </p>

                          <p className="mt-1 text-xs text-slate-500">
                            {operator.employeeNo}
                          </p>

                        </div>

                      </div>

                    </td>

                    <td className="px-4 py-5 text-slate-300">
                      {operator.department}
                    </td>

                    <td className="px-4 py-5 text-slate-300">
                      {operator.shift}
                    </td>

                    <td className="px-4 py-5 text-slate-300">
                      {operator.machine}
                    </td>

                    <td className="px-4 py-5">

                      <span className="font-bold text-white">
                        {operator.production}
                      </span>

                      <span className="ml-1 text-xs text-slate-500">
                        adet
                      </span>

                    </td>

                    <td className="px-4 py-5">

                      <div className="flex items-center gap-3">

                        <span
                          className={`font-bold ${
                            operator.efficiency >= 90
                              ? 'text-emerald-400'
                              : operator.efficiency >= 80
                              ? 'text-amber-400'
                              : 'text-red-400'
                          }`}
                        >
                          %{operator.efficiency}
                        </span>

                        <div className="hidden w-20 rounded-full bg-slate-800 sm:block">

                          <div
                            className="h-1.5 rounded-full bg-cyan-500 transition-all duration-700"
                            style={{
                              width: `${operator.efficiency}%`,
                            }}
                          />

                        </div>

                      </div>

                    </td>

                    <td className="px-4 py-5">

                      <StatusBadge
                        status={operator.status}
                      />

                    </td>

                  </tr>

                ))}

              </tbody>

            </table>

          </div>

          {filteredOperators.length === 0 && (
            <div className="py-10 text-center text-slate-500">
              Arama kriterlerine uygun operatör bulunamadı.
            </div>
          )}

        </section>

        {/* ALT PANEL */}
        <section className="grid gap-6 lg:grid-cols-2">

          {/* VARDİYA DURUMU */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-6">

            <h2 className="text-lg font-bold text-white">
              Vardiya Durumu
            </h2>

            <p className="mt-1 text-sm text-slate-400">
              Aktif operatörlerin vardiya dağılımı
            </p>

            <div className="mt-6 space-y-4">

              {['08:00 - 16:00', '16:00 - 00:00', '00:00 - 08:00'].map(
                (shift) => {

                  const count = operators.filter(
                    (operator) =>
                      operator.shift === shift &&
                      operator.status === 'Aktif'
                  ).length;

                  return (
                    <div
                      key={shift}
                      className="flex items-center justify-between rounded-lg border border-slate-800 bg-slate-950/50 p-4"
                    >

                      <div className="flex items-center gap-3">

                        <span className="h-2.5 w-2.5 rounded-full bg-cyan-400" />

                        <span className="text-sm font-semibold text-slate-300">
                          {shift}
                        </span>

                      </div>

                      <span className="font-bold text-white">
                        {count} operatör
                      </span>

                    </div>
                  );
                }
              )}

            </div>

          </div>

          {/* PERFORMANS */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-6">

            <h2 className="text-lg font-bold text-white">
              Operatör Performansı
            </h2>

            <p className="mt-1 text-sm text-slate-400">
              En yüksek performans gösteren operatörler
            </p>

            <div className="mt-6 space-y-4">

              {[...operators]
                .sort(
                  (a, b) =>
                    b.efficiency - a.efficiency
                )
                .slice(0, 4)
                .map((operator) => (

                  <div
                    key={operator.id}
                    className="rounded-lg border border-slate-800 bg-slate-950/50 p-4"
                  >

                    <div className="flex items-center justify-between">

                      <div>

                        <p className="font-semibold text-white">
                          {operator.name}
                        </p>

                        <p className="mt-1 text-xs text-slate-500">
                          {operator.machine}
                        </p>

                      </div>

                      <span className="font-bold text-emerald-400">
                        %{operator.efficiency}
                      </span>

                    </div>

                    <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-slate-800">

                      <div
                        className="h-full rounded-full bg-emerald-500 transition-all duration-700"
                        style={{
                          width: `${operator.efficiency}%`,
                        }}
                      />

                    </div>

                  </div>

                ))}

            </div>

          </div>

        </section>

      </div>
    </div>
  );
}

export default Operators;