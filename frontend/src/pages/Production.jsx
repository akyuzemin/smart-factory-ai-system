import { useEffect, useMemo, useState } from 'react';

const initialLines = [
  {
    id: 1,
    name: 'Üretim Hattı A',
    machine: 'CNC-01',
    product: 'Çelik Parça A',
    target: 500,
    produced: 438,
    efficiency: 91,
    speed: 42,
    status: 'Çalışıyor',
  },
  {
    id: 2,
    name: 'Üretim Hattı B',
    machine: 'PRS-02',
    product: 'Hidrolik Parça',
    target: 400,
    produced: 351,
    efficiency: 87,
    speed: 35,
    status: 'Çalışıyor',
  },
  {
    id: 3,
    name: 'Kaynak Hattı',
    machine: 'RBW-03',
    product: 'Kaynaklı Gövde',
    target: 300,
    produced: 267,
    efficiency: 89,
    speed: 28,
    status: 'Çalışıyor',
  },
  {
    id: 4,
    name: 'Paketleme Hattı',
    machine: 'PKG-04',
    product: 'Final Ürün',
    target: 600,
    produced: 521,
    efficiency: 84,
    speed: 55,
    status: 'Bakımda',
  },
  {
    id: 5,
    name: 'Lojistik Hattı',
    machine: 'CNV-05',
    product: 'Taşıma Ünitesi',
    target: 450,
    produced: 396,
    efficiency: 93,
    speed: 47,
    status: 'Çalışıyor',
  },
];

function KpiCard({ title, value, subtitle, color = 'text-cyan-400' }) {
  return (
    <div className="rounded-xl border border-slate-700 bg-slate-900 p-5">
      <p className="text-sm font-semibold text-slate-400">{title}</p>

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
    'Çalışıyor':
      'border-emerald-500/30 bg-emerald-500/10 text-emerald-400',

    'Bakımda':
      'border-amber-500/30 bg-amber-500/10 text-amber-400',

    'Arızalı':
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

function ProgressBar({ value }) {
  return (
    <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-slate-800">
      <div
        className="h-full rounded-full bg-cyan-500 transition-all duration-700"
        style={{
          width: `${Math.min(value, 100)}%`,
        }}
      />
    </div>
  );
}

function Production() {
  const [lines, setLines] = useState(initialLines);
  const [lastUpdate, setLastUpdate] = useState(new Date());

  /*
   * Hareketli üretim verisi.
   *
   * Her 2 saniyede üretim değerleri küçük miktarlarda değişir.
   * Böylece demo sırasında sistem canlıymış gibi görünür.
   */
  useEffect(() => {
    const interval = setInterval(() => {
      setLines((currentLines) =>
        currentLines.map((line) => {
          if (line.status !== 'Çalışıyor') {
            return line;
          }

          const productionIncrease =
            Math.floor(Math.random() * 4) + 1;

          const efficiencyChange =
            Math.floor(Math.random() * 5) - 2;

          const speedChange =
            Math.floor(Math.random() * 5) - 2;

          return {
            ...line,

            produced: Math.min(
              line.target + 50,
              line.produced + productionIncrease
            ),

            efficiency: Math.max(
              75,
              Math.min(
                99,
                line.efficiency + efficiencyChange
              )
            ),

            speed: Math.max(
              20,
              Math.min(
                70,
                line.speed + speedChange
              )
            ),
          };
        })
      );

      setLastUpdate(new Date());
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  const statistics = useMemo(() => {
    const totalTarget = lines.reduce(
      (sum, line) => sum + line.target,
      0
    );

    const totalProduced = lines.reduce(
      (sum, line) => sum + line.produced,
      0
    );

    const averageEfficiency =
      lines.length > 0
        ? Math.round(
            lines.reduce(
              (sum, line) => sum + line.efficiency,
              0
            ) / lines.length
          )
        : 0;

    const activeLines = lines.filter(
      (line) => line.status === 'Çalışıyor'
    ).length;

    const maintenanceLines = lines.filter(
      (line) => line.status === 'Bakımda'
    ).length;

    const progress =
      totalTarget > 0
        ? Math.round(
            (totalProduced / totalTarget) * 100
          )
        : 0;

    return {
      totalTarget,
      totalProduced,
      averageEfficiency,
      activeLines,
      maintenanceLines,
      progress,
    };
  }, [lines]);

  return (
    <div className="min-h-screen bg-slate-950 p-6 text-slate-100">
      <div className="mx-auto max-w-7xl space-y-6">

        {/* HEADER */}
        <header className="rounded-2xl border border-slate-800 bg-slate-900/80 p-6 shadow-xl">

          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">

            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.3em] text-cyan-400">
                SMART FACTORY / PRODUCTION
              </p>

              <h1 className="mt-2 text-3xl font-bold text-white">
                Üretim Yönetim Paneli
              </h1>

              <p className="mt-2 text-sm text-slate-400">
                Üretim hatlarını, hedefleri ve verimlilik
                değerlerini anlık olarak izleyin.
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

        {/* KPI */}
        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">

          <KpiCard
            title="Toplam Üretim"
            value={statistics.totalProduced}
            subtitle={`Hedef: ${statistics.totalTarget}`}
          />

          <KpiCard
            title="Ortalama Verimlilik"
            value={`%${statistics.averageEfficiency}`}
            subtitle="Tüm üretim hatları"
            color="text-emerald-400"
          />

          <KpiCard
            title="Aktif Hat"
            value={statistics.activeLines}
            subtitle={`${statistics.maintenanceLines} hat bakımda`}
            color="text-cyan-400"
          />

          <KpiCard
            title="Hedef Gerçekleşme"
            value={`%${statistics.progress}`}
            subtitle="Toplam üretim hedefi"
            color="text-amber-400"
          />

        </section>

        {/* GENEL ÜRETİM */}
        <section className="rounded-2xl border border-slate-800 bg-slate-900/80 p-6 shadow-xl">

          <div className="mb-6 flex items-center justify-between">

            <div>
              <h2 className="text-xl font-bold text-white">
                Üretim İlerlemesi
              </h2>

              <p className="mt-1 text-sm text-slate-400">
                Fabrika genelindeki üretim hedefi
              </p>
            </div>

            <span className="text-2xl font-bold text-cyan-400">
              %{Math.min(statistics.progress, 100)}
            </span>

          </div>

          <ProgressBar
            value={statistics.progress}
          />

          <div className="mt-3 flex justify-between text-xs text-slate-500">
            <span>
              Üretilen: {statistics.totalProduced}
            </span>

            <span>
              Hedef: {statistics.totalTarget}
            </span>
          </div>

        </section>

        {/* HATLAR */}
        <section className="rounded-2xl border border-slate-800 bg-slate-900/80 p-6 shadow-xl">

          <div className="mb-5">
            <h2 className="text-xl font-bold text-white">
              Üretim Hatları
            </h2>

            <p className="mt-1 text-sm text-slate-400">
              Hatların anlık üretim ve performans durumları
            </p>
          </div>

          <div className="overflow-x-auto">

            <table className="min-w-full">

              <thead>
                <tr className="border-b border-slate-800 text-left text-xs uppercase tracking-wider text-slate-500">

                  <th className="px-4 py-4">
                    Üretim Hattı
                  </th>

                  <th className="px-4 py-4">
                    Makine
                  </th>

                  <th className="px-4 py-4">
                    Ürün
                  </th>

                  <th className="px-4 py-4">
                    Üretim
                  </th>

                  <th className="px-4 py-4">
                    Verimlilik
                  </th>

                  <th className="px-4 py-4">
                    Hız
                  </th>

                  <th className="px-4 py-4">
                    Durum
                  </th>

                </tr>
              </thead>

              <tbody>

                {lines.map((line) => {

                  const progress =
                    line.target > 0
                      ? Math.round(
                          (line.produced /
                            line.target) *
                            100
                        )
                      : 0;

                  return (
                    <tr
                      key={line.id}
                      className="border-b border-slate-800/70 transition-colors hover:bg-slate-800/40"
                    >

                      <td className="px-4 py-5">

                        <p className="font-semibold text-white">
                          {line.name}
                        </p>

                        <p className="mt-1 text-xs text-slate-500">
                          Hat #{line.id}
                        </p>

                      </td>

                      <td className="px-4 py-5 text-slate-300">
                        {line.machine}
                      </td>

                      <td className="px-4 py-5 text-slate-300">
                        {line.product}
                      </td>

                      <td className="px-4 py-5">

                        <p className="font-semibold text-white">
                          {line.produced}
                        </p>

                        <p className="mt-1 text-xs text-slate-500">
                          / {line.target} adet
                        </p>

                        <ProgressBar value={progress} />

                      </td>

                      <td className="px-4 py-5">

                        <span
                          className={`font-bold ${
                            line.efficiency >= 90
                              ? 'text-emerald-400'
                              : line.efficiency >= 80
                              ? 'text-amber-400'
                              : 'text-red-400'
                          }`}
                        >
                          %{line.efficiency}
                        </span>

                      </td>

                      <td className="px-4 py-5 text-slate-300">
                        {line.speed} adet/dk
                      </td>

                      <td className="px-4 py-5">
                        <StatusBadge
                          status={line.status}
                        />
                      </td>

                    </tr>
                  );
                })}

              </tbody>

            </table>

          </div>

        </section>

        {/* ALT KARTLAR */}
        <section className="grid gap-6 lg:grid-cols-2">

          {/* HAT DURUMLARI */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-6">

            <h2 className="text-lg font-bold text-white">
              Hat Durumları
            </h2>

            <div className="mt-5 space-y-4">

              {lines.map((line) => (

                <div
                  key={line.id}
                  className="flex items-center justify-between rounded-lg border border-slate-800 bg-slate-950/50 p-4"
                >

                  <div className="flex items-center gap-3">

                    <span
                      className={`h-3 w-3 rounded-full ${
                        line.status === 'Çalışıyor'
                          ? 'animate-pulse bg-emerald-400'
                          : line.status === 'Bakımda'
                          ? 'bg-amber-400'
                          : 'bg-red-400'
                      }`}
                    />

                    <div>

                      <p className="font-semibold text-white">
                        {line.name}
                      </p>

                      <p className="text-xs text-slate-500">
                        {line.machine}
                      </p>

                    </div>

                  </div>

                  <StatusBadge
                    status={line.status}
                  />

                </div>

              ))}

            </div>

          </div>

          {/* PERFORMANS */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-6">

            <h2 className="text-lg font-bold text-white">
              Üretim Performansı
            </h2>

            <p className="mt-1 text-sm text-slate-400">
              Hat bazında verimlilik
            </p>

            <div className="mt-6 space-y-5">

              {lines.map((line) => (

                <div key={line.id}>

                  <div className="flex justify-between">

                    <span className="text-sm text-slate-300">
                      {line.name}
                    </span>

                    <span className="text-sm font-bold text-cyan-400">
                      %{line.efficiency}
                    </span>

                  </div>

                  <ProgressBar
                    value={line.efficiency}
                  />

                </div>

              ))}

            </div>

          </div>

        </section>

      </div>
    </div>
  );
}

export default Production;