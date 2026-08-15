import { useEffect, useMemo, useState } from 'react';

const initialLines = [
  {
    name: 'Üretim Hattı A',
    machine: 'CNC-01',
    production: 469,
    target: 500,
    efficiency: 91,
    speed: 46,
    status: 'Çalışıyor',
  },
  {
    name: 'Üretim Hattı B',
    machine: 'PRS-02',
    production: 381,
    target: 400,
    efficiency: 96,
    speed: 28,
    status: 'Çalışıyor',
  },
  {
    name: 'Kaynak Hattı',
    machine: 'RBW-03',
    production: 299,
    target: 300,
    efficiency: 99,
    speed: 30,
    status: 'Çalışıyor',
  },
  {
    name: 'Paketleme Hattı',
    machine: 'PKG-04',
    production: 521,
    target: 600,
    efficiency: 84,
    speed: 55,
    status: 'Bakımda',
  },
  {
    name: 'Lojistik Hattı',
    machine: 'CNV-05',
    production: 425,
    target: 450,
    efficiency: 94,
    speed: 54,
    status: 'Çalışıyor',
  },
];

const initialDailyData = [
  { day: 'Pzt', value: 1820 },
  { day: 'Sal', value: 2050 },
  { day: 'Çar', value: 1980 },
  { day: 'Per', value: 2210 },
  { day: 'Cum', value: 2095 },
  { day: 'Cmt', value: 1940 },
  { day: 'Paz', value: 1760 },
];

function KpiCard({ label, value, subtitle, color = 'text-white' }) {
  return (
    <div className="rounded-xl border border-slate-700 bg-slate-800 p-5">
      <p className="text-sm font-semibold text-slate-400">
        {label}
      </p>

      <p className={`mt-2 text-3xl font-bold ${color}`}>
        {value}
      </p>

      <p className="mt-1 text-xs text-slate-500">
        {subtitle}
      </p>
    </div>
  );
}

function StatusBadge({ status }) {
  const styles = {
    'Çalışıyor':
      'bg-emerald-500/10 text-emerald-300 border-emerald-500/20',

    Bakımda:
      'bg-amber-500/10 text-amber-300 border-amber-500/20',

    Arızalı:
      'bg-red-500/10 text-red-300 border-red-500/20',
  };

  return (
    <span
      className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold ${
        styles[status] ||
        'bg-slate-700 text-slate-300 border-slate-600'
      }`}
    >
      {status}
    </span>
  );
}

function ProgressBar({ value }) {
  return (
    <div className="h-2 w-full overflow-hidden rounded-full bg-slate-700">
      <div
        className="h-full rounded-full bg-cyan-500 transition-all duration-700"
        style={{
          width: `${Math.min(value, 100)}%`,
        }}
      />
    </div>
  );
}

function Reports() {
  const [lines, setLines] = useState(initialLines);
  const [dailyData, setDailyData] = useState(initialDailyData);
  const [lastUpdate, setLastUpdate] = useState(new Date());

  /*
   * CANLI RAPOR VERİLERİ
   *
   * Her 2 saniyede üretim, verimlilik ve
   * hız değerlerinde küçük değişimler olur.
   */
  useEffect(() => {
    const interval = setInterval(() => {
      setLines((currentLines) => {
        return currentLines.map((line) => {
          let production = line.production;
          let efficiency = line.efficiency;
          let speed = line.speed;
          let status = line.status;

          if (status === 'Çalışıyor') {
            production += Math.floor(
              Math.random() * 5
            );

            efficiency +=
              Math.random() > 0.5 ? 1 : -1;

            speed +=
              Math.random() > 0.5 ? 1 : -1;

            efficiency = Math.max(
              75,
              Math.min(100, efficiency)
            );

            speed = Math.max(
              20,
              Math.min(70, speed)
            );
          }

          /*
           * Paketleme hattı gibi bazı hatlar
           * zaman zaman bakıma geçebilir.
           */
          if (
            Math.random() > 0.97 &&
            status === 'Çalışıyor'
          ) {
            status = 'Bakımda';
          }

          /*
           * Bakımda olan hat tekrar çalışabilir.
           */
          else if (
            Math.random() > 0.90 &&
            status === 'Bakımda'
          ) {
            status = 'Çalışıyor';
          }

          return {
            ...line,
            production,
            efficiency,
            speed,
            status,
          };
        });
      });

      setDailyData((currentData) =>
        currentData.map((item, index) => {
          if (index !== 6) {
            return item;
          }

          return {
            ...item,
            value:
              item.value +
              Math.floor(Math.random() * 8),
          };
        })
      );

      setLastUpdate(new Date());
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  /*
   * GENEL RAPOR İSTATİSTİKLERİ
   */
  const statistics = useMemo(() => {
    const totalProduction = lines.reduce(
      (sum, line) =>
        sum + line.production,
      0
    );

    const totalTarget = lines.reduce(
      (sum, line) =>
        sum + line.target,
      0
    );

    const averageEfficiency =
      lines.length > 0
        ? Math.round(
            lines.reduce(
              (sum, line) =>
                sum + line.efficiency,
              0
            ) / lines.length
          )
        : 0;

    const activeLines = lines.filter(
      (line) =>
        line.status === 'Çalışıyor'
    ).length;

    const maintenanceLines = lines.filter(
      (line) =>
        line.status === 'Bakımda'
    ).length;

    const productionRate =
      totalTarget > 0
        ? Math.round(
            (totalProduction /
              totalTarget) *
              100
          )
        : 0;

    return {
      totalProduction,
      totalTarget,
      averageEfficiency,
      activeLines,
      maintenanceLines,
      productionRate,
    };
  }, [lines]);

  const maxDailyValue = Math.max(
    ...dailyData.map((item) => item.value)
  );

  return (
    <div className="min-h-screen bg-slate-950 p-6 text-slate-100">

      <div className="mx-auto max-w-7xl space-y-6">

        {/* HEADER */}
        <header className="rounded-2xl border border-slate-800 bg-slate-900/80 p-6 shadow-xl">

          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">

            <div>

              <p className="text-sm font-semibold uppercase tracking-[0.3em] text-cyan-400">
                SMART FACTORY / REPORTS
              </p>

              <h1 className="mt-2 text-3xl font-bold text-white">
                Fabrika Performans Raporları
              </h1>

              <p className="mt-2 text-sm text-slate-400">
                Üretim, makine verimliliği ve operasyon
                performansını anlık olarak takip edin.
              </p>

            </div>

            {/* LIVE */}
            <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/10 px-4 py-3">

              <div className="flex items-center gap-2">

                <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-400" />

                <span className="text-sm font-semibold text-emerald-400">
                  CANLI RAPOR
                </span>

              </div>

              <p className="mt-1 text-xs text-slate-500">
                Son güncelleme:{' '}
                {lastUpdate.toLocaleTimeString(
                  'tr-TR'
                )}
              </p>

            </div>

          </div>

        </header>

        {/* KPI */}
        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">

          <KpiCard
            label="Toplam Üretim"
            value={statistics.totalProduction}
            subtitle={`Hedef: ${statistics.totalTarget}`}
            color="text-cyan-400"
          />

          <KpiCard
            label="Üretim Oranı"
            value={`%${statistics.productionRate}`}
            subtitle="Hedefe ulaşma oranı"
            color="text-emerald-400"
          />

          <KpiCard
            label="Ortalama Verimlilik"
            value={`%${statistics.averageEfficiency}`}
            subtitle="Tüm üretim hatları"
            color="text-cyan-400"
          />

          <KpiCard
            label="Aktif Hat"
            value={statistics.activeLines}
            subtitle="Şu anda çalışan"
            color="text-emerald-400"
          />

          <KpiCard
            label="Bakımda"
            value={statistics.maintenanceLines}
            subtitle="Bakım sürecindeki"
            color="text-amber-400"
          />

        </section>

        {/* PRODUCTION TARGET */}
        <section className="rounded-2xl border border-slate-800 bg-slate-900/80 p-6 shadow-xl">

          <div className="flex items-center justify-between">

            <div>

              <h2 className="text-lg font-bold text-white">
                Günlük Üretim Hedefi
              </h2>

              <p className="mt-1 text-sm text-slate-400">
                Fabrikanın toplam üretim performansı
              </p>

            </div>

            <span className="text-3xl font-bold text-cyan-400">
              %{statistics.productionRate}
            </span>

          </div>

          <div className="mt-5">
            <ProgressBar
              value={statistics.productionRate}
            />
          </div>

          <div className="mt-3 flex justify-between text-sm text-slate-400">

            <span>
              Üretilen:{' '}
              <strong className="text-white">
                {statistics.totalProduction}
              </strong>
            </span>

            <span>
              Hedef:{' '}
              <strong className="text-white">
                {statistics.totalTarget}
              </strong>
            </span>

          </div>

        </section>

        {/* DAILY CHART */}
        <section className="rounded-2xl border border-slate-800 bg-slate-900/80 p-6 shadow-xl">

          <div>

            <h2 className="text-lg font-bold text-white">
              Haftalık Üretim
            </h2>

            <p className="mt-1 text-sm text-slate-400">
              Son 7 günlük üretim miktarları
            </p>

          </div>

          <div className="mt-8 flex h-64 items-end justify-between gap-3">

            {dailyData.map((item) => {

              const height =
                (item.value /
                  maxDailyValue) *
                100;

              return (
                <div
                  key={item.day}
                  className="flex h-full flex-1 flex-col items-center justify-end gap-2"
                >

                  <span className="text-xs font-semibold text-slate-300">
                    {item.value}
                  </span>

                  <div className="flex h-full w-full items-end">

                    <div
                      className="w-full rounded-t-lg bg-cyan-500 transition-all duration-700"
                      style={{
                        height: `${height}%`,
                      }}
                    />

                  </div>

                  <span className="text-xs text-slate-500">
                    {item.day}
                  </span>

                </div>
              );
            })}

          </div>

        </section>

        {/* PRODUCTION LINES */}
        <section className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5 shadow-xl">

          <div className="mb-5">

            <h2 className="text-lg font-bold text-white">
              Üretim Hatları Performansı
            </h2>

            <p className="mt-1 text-sm text-slate-400">
              Hatların anlık üretim ve verimlilik değerleri
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

                  const productionPercent =
                    Math.min(
                      100,
                      Math.round(
                        (line.production /
                          line.target) *
                          100
                      )
                    );

                  return (
                    <tr
                      key={line.machine}
                      className="border-b border-slate-800/70 transition-colors hover:bg-slate-800/40"
                    >

                      <td className="px-4 py-5">

                        <p className="font-semibold text-white">
                          {line.name}
                        </p>

                        <p className="mt-1 text-xs text-slate-500">
                          Hedef: {line.target}
                        </p>

                      </td>

                      <td className="px-4 py-5 font-mono text-sm text-cyan-300">
                        {line.machine}
                      </td>

                      <td className="min-w-[180px] px-4 py-5">

                        <div className="flex justify-between">

                          <span className="font-semibold text-white">
                            {line.production}
                          </span>

                          <span className="text-xs text-slate-500">
                            %{productionPercent}
                          </span>

                        </div>

                        <div className="mt-2">
                          <ProgressBar
                            value={productionPercent}
                          />
                        </div>

                      </td>

                      <td className="px-4 py-5">

                        <span
                          className={`font-bold ${
                            line.efficiency >= 95
                              ? 'text-emerald-400'
                              : line.efficiency >= 85
                              ? 'text-cyan-400'
                              : 'text-amber-400'
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

        {/* BOTTOM CARDS */}
        <section className="grid gap-6 lg:grid-cols-2">

          {/* MACHINE EFFICIENCY */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-6">

            <h2 className="text-lg font-bold text-white">
              Makine Verimlilikleri
            </h2>

            <p className="mt-1 text-sm text-slate-400">
              Makinelerin anlık performans değerleri
            </p>

            <div className="mt-6 space-y-5">

              {lines.map((line) => (

                <div key={line.machine}>

                  <div className="flex items-center justify-between">

                    <span className="text-sm text-slate-300">
                      {line.machine}
                    </span>

                    <span className="text-sm font-bold text-white">
                      %{line.efficiency}
                    </span>

                  </div>

                  <div className="mt-2">
                    <ProgressBar
                      value={line.efficiency}
                    />
                  </div>

                </div>

              ))}

            </div>

          </div>

          {/* SUMMARY */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-6">

            <h2 className="text-lg font-bold text-white">
              Rapor Özeti
            </h2>

            <p className="mt-1 text-sm text-slate-400">
              Fabrika operasyonlarının genel durumu
            </p>

            <div className="mt-6 space-y-3">

              <div className="flex items-center justify-between rounded-lg border border-slate-800 bg-slate-950/50 p-4">

                <span className="text-sm text-slate-400">
                  Üretim performansı
                </span>

                <span className="font-bold text-emerald-400">
                  %{statistics.productionRate}
                </span>

              </div>

              <div className="flex items-center justify-between rounded-lg border border-slate-800 bg-slate-950/50 p-4">

                <span className="text-sm text-slate-400">
                  Ortalama verimlilik
                </span>

                <span className="font-bold text-cyan-400">
                  %{statistics.averageEfficiency}
                </span>

              </div>

              <div className="flex items-center justify-between rounded-lg border border-slate-800 bg-slate-950/50 p-4">

                <span className="text-sm text-slate-400">
                  Aktif üretim hatları
                </span>

                <span className="font-bold text-emerald-400">
                  {statistics.activeLines}
                </span>

              </div>

              <div className="flex items-center justify-between rounded-lg border border-slate-800 bg-slate-950/50 p-4">

                <span className="text-sm text-slate-400">
                  Bakımdaki hatlar
                </span>

                <span className="font-bold text-amber-400">
                  {statistics.maintenanceLines}
                </span>

              </div>

              <div className="mt-5 rounded-lg border border-cyan-500/20 bg-cyan-500/5 p-4">

                <div className="flex items-center gap-2">

                  <span className="h-2 w-2 animate-pulse rounded-full bg-cyan-400" />

                  <span className="text-sm font-semibold text-cyan-300">
                    Sistem canlı olarak güncelleniyor
                  </span>

                </div>

                <p className="mt-2 text-xs text-slate-500">
                  Üretim ve performans verileri
                  otomatik olarak yenilenmektedir.
                </p>

              </div>

            </div>

          </div>

        </section>

      </div>

    </div>
  );
}

export default Reports;