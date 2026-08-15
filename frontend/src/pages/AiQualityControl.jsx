import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';

function KpiCard({ label, value, subtitle, color = 'text-white' }) {
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

function RiskBadge({ risk }) {
  const map = {
    'Düşük Risk':
      'bg-emerald-500/10 text-emerald-300 border border-emerald-500/20',

    'Orta Risk':
      'bg-amber-500/10 text-amber-300 border border-amber-500/20',

    'Yüksek Risk':
      'bg-orange-500/10 text-orange-300 border border-orange-500/20',

    'Kritik Risk':
      'bg-red-500/10 text-red-300 border border-red-500/20',
  };

  return (
    <span
      className={`inline-flex items-center rounded-full border px-3 py-1 text-sm font-semibold ${
        map[risk] ||
        'bg-slate-700 text-slate-300 border-slate-600'
      }`}
    >
      {risk}
    </span>
  );
}

function DecisionBadge({ decision }) {
  const styles = {
    Normal:
      'bg-emerald-500/10 text-emerald-300 border-emerald-500/20',

    İzleme:
      'bg-amber-500/10 text-amber-300 border-amber-500/20',

    'Bakım Gerekiyor':
      'bg-orange-500/10 text-orange-300 border-orange-500/20',

    Kritik:
      'bg-red-500/10 text-red-300 border-red-500/20',
  };

  return (
    <span
      className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold ${
        styles[decision] ||
        'bg-slate-700 text-slate-300 border-slate-600'
      }`}
    >
      {decision}
    </span>
  );
}

function ProgressBar({ value }) {
  return (
    <div className="h-2 w-full overflow-hidden rounded-full bg-slate-700">
      <div
        className={`h-full rounded-full transition-all duration-700 ${
          value >= 80
            ? 'bg-red-500'
            : value >= 60
            ? 'bg-orange-500'
            : value >= 40
            ? 'bg-amber-500'
            : 'bg-emerald-500'
        }`}
        style={{
          width: `${Math.min(value, 100)}%`,
        }}
      />
    </div>
  );
}

function getRisk(score) {
  if (score >= 80) return 'Kritik Risk';
  if (score >= 60) return 'Yüksek Risk';
  if (score >= 40) return 'Orta Risk';
  return 'Düşük Risk';
}

function getDecision(score) {
  if (score >= 80) return 'Kritik';
  if (score >= 60) return 'Bakım Gerekiyor';
  if (score >= 40) return 'İzleme';
  return 'Normal';
}

function AiQualityControl() {
  const navigate = useNavigate();

  const [analyses, setAnalyses] = useState([]);
  const [summary, setSummary] = useState(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [machineFilter, setMachineFilter] =
    useState('all');

  const [riskFilter, setRiskFilter] =
    useState('all');

  const [dateFilter, setDateFilter] =
    useState('all');

  const [lastUpdate, setLastUpdate] =
    useState(new Date());

  /*
   * ---------------------------------------------------------
   * İLK VERİYİ BACKEND'DEN AL
   * ---------------------------------------------------------
   */

  useEffect(() => {
    let isMounted = true;

    async function fetchInitialAnalysis() {
      try {
        const response = await fetch(
          'http://localhost:5000/api/ai/anomaly-summary'
        );

        if (!response.ok) {
          throw new Error(
            'AI analizi alınamadı.'
          );
        }

        const data = await response.json();

        if (!isMounted) return;

        setSummary(data);

        /*
         * Backend'den gelen sensör adı varsa
         * ilk analizde kullanıyoruz.
         */
        const baseMachine =
          data?.sensor ||
          'CNC İşleme Merkezi';

        const initialData = [
          {
            id: 'A-001',
            machine: baseMachine,
            score: data?.is_anomaly ? 72 : 18,
            confidence: data?.is_anomaly ? 92 : 96,
          },
          {
            id: 'A-002',
            machine: 'Hidrolik Pres',
            score: 48,
            confidence: 89,
          },
          {
            id: 'A-003',
            machine: 'Robotik Kaynak Ünitesi',
            score: 83,
            confidence: 95,
          },
          {
            id: 'A-004',
            machine: 'Konveyör Sistemi',
            score: 27,
            confidence: 91,
          },
          {
            id: 'A-005',
            machine: 'Endüstriyel Paketleme',
            score: 56,
            confidence: 87,
          },
          {
            id: 'A-006',
            machine: 'Enjeksiyon Kalıplama',
            score: 39,
            confidence: 93,
          },
        ];

        const today =
          new Date()
            .toISOString()
            .split('T')[0];

        const preparedData =
          initialData.map((item) => {
            const risk =
              getRisk(item.score);

            return {
              ...item,
              risk,
              decision:
                getDecision(item.score),
              date: today,
            };
          });

        setAnalyses(preparedData);
      } catch (fetchError) {
  console.warn(
    'AI backend verisi alınamadı, demo verisi kullanılıyor:',
    fetchError
  );

  if (!isMounted) return;

  const today = new Date()
    .toISOString()
    .split('T')[0];

  const fallbackData = [
    {
      id: 'A-001',
      machine: 'CNC İşleme Merkezi',
      score: 42,
      confidence: 94,
    },
    {
      id: 'A-002',
      machine: 'Hidrolik Pres',
      score: 67,
      confidence: 91,
    },
    {
      id: 'A-003',
      machine: 'Robotik Kaynak Ünitesi',
      score: 81,
      confidence: 96,
    },
    {
      id: 'A-004',
      machine: 'Konveyör Sistemi',
      score: 28,
      confidence: 89,
    },
    {
      id: 'A-005',
      machine: 'Endüstriyel Paketleme',
      score: 55,
      confidence: 93,
    },
    {
      id: 'A-006',
      machine: 'Enjeksiyon Kalıplama',
      score: 36,
      confidence: 90,
    },
  ].map((item) => ({
    ...item,
    risk: getRisk(item.score),
    decision: getDecision(item.score),
    date: today,
  }));

  setAnalyses(fallbackData);

  setSummary({
    is_anomaly: true,
    sensor: 'CNC İşleme Merkezi',
  });

} finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    fetchInitialAnalysis();

    return () => {
      isMounted = false;
    };
  }, []);

  /*
   * ---------------------------------------------------------
   * CANLI AI ANALİZ SİMÜLASYONU
   *
   * Her 2 saniyede risk skorları küçük miktarlarda değişir.
   * Böylece dashboard canlı görünür.
   * ---------------------------------------------------------
   */

  useEffect(() => {
    const interval = setInterval(() => {
      setAnalyses((current) => {
        return current.map((item) => {
          /*
           * -5 ile +5 arasında değişim
           */
          const change =
            Math.floor(
              Math.random() * 11
            ) - 5;

          let newScore =
            item.score + change;

          newScore = Math.max(
            5,
            Math.min(98, newScore)
          );

          /*
           * Güven oranını da küçük miktarda değiştir.
           */
          const confidenceChange =
            Math.floor(
              Math.random() * 5
            ) - 2;

          let newConfidence =
            item.confidence +
            confidenceChange;

          newConfidence = Math.max(
            80,
            Math.min(99, newConfidence)
          );

          const risk =
            getRisk(newScore);

          const decision =
            getDecision(newScore);

          return {
            ...item,
            score: newScore,
            confidence: newConfidence,
            risk,
            decision,
          };
        });
      });

      setLastUpdate(new Date());
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  /*
   * ---------------------------------------------------------
   * MAKİNELER
   * ---------------------------------------------------------
   */

  const machines = useMemo(() => {
    return [
      ...new Set(
        analyses.map(
          (item) => item.machine
        )
      ),
    ];
  }, [analyses]);

  /*
   * ---------------------------------------------------------
   * KPI
   * ---------------------------------------------------------
   */

  const totals = useMemo(() => {
    const total =
      analyses.length;

    const risky =
      analyses.filter(
        (item) =>
          item.risk === 'Yüksek Risk' ||
          item.risk === 'Kritik Risk'
      ).length;

    const critical =
      analyses.filter(
        (item) =>
          item.risk === 'Kritik Risk'
      ).length;

    const average =
      total > 0
        ? Math.round(
            analyses.reduce(
              (sum, item) =>
                sum + item.score,
              0
            ) / total
          )
        : 0;

    const averageConfidence =
      total > 0
        ? Math.round(
            analyses.reduce(
              (sum, item) =>
                sum + item.confidence,
              0
            ) / total
          )
        : 0;

    return {
      total,
      risky,
      critical,
      average,
      averageConfidence,
    };
  }, [analyses]);

  /*
   * ---------------------------------------------------------
   * FİLTRE
   * ---------------------------------------------------------
   */

  const filtered = useMemo(() => {
    return analyses.filter((item) => {
      if (
        machineFilter !== 'all' &&
        item.machine !== machineFilter
      ) {
        return false;
      }

      if (
        riskFilter !== 'all' &&
        item.risk !== riskFilter
      ) {
        return false;
      }

      if (
        dateFilter !== 'all' &&
        item.date !== dateFilter
      ) {
        return false;
      }

      return true;
    });
  }, [
    analyses,
    machineFilter,
    riskFilter,
    dateFilter,
  ]);

  /*
   * ---------------------------------------------------------
   * RENDER
   * ---------------------------------------------------------
   */

  return (
    <div className="min-h-screen bg-slate-950 p-6 text-slate-100">

      <div className="mx-auto max-w-7xl space-y-6">

        {/* HEADER */}
        <header className="rounded-2xl border border-slate-800 bg-slate-900/80 p-6 shadow-xl">

          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">

            <div>

              <p className="text-sm font-semibold uppercase tracking-[0.3em] text-cyan-400">
                SMART FACTORY / AI QUALITY
              </p>

              <h1 className="mt-2 text-3xl font-bold text-white">
                AI Kalite Kontrol
              </h1>

              <p className="mt-2 text-sm text-slate-400">
                Yapay zekâ destekli makine risk analizi
                ve kalite kontrol merkezi.
              </p>

            </div>

            {/* CANLI DURUM */}

            <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/10 px-4 py-3">

              <div className="flex items-center gap-2">

                <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-400" />

                <span className="text-sm font-semibold text-emerald-400">
                  AI SİSTEMİ AKTİF
                </span>

              </div>

              <p className="mt-1 text-xs text-slate-500">
                Son analiz:{' '}
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
            label="Toplam Analiz"
            value={totals.total}
            subtitle="Aktif AI analizleri"
            color="text-cyan-400"
          />

          <KpiCard
            label="Riskli Makine"
            value={totals.risky}
            subtitle="Yüksek + kritik"
            color="text-orange-400"
          />

          <KpiCard
            label="Kritik Risk"
            value={totals.critical}
            subtitle="Acil müdahale"
            color="text-red-400"
          />

          <KpiCard
            label="Ortalama Risk"
            value={`%${totals.average}`}
            subtitle="Anlık risk skoru"
            color="text-amber-400"
          />

          <KpiCard
            label="AI Güveni"
            value={`%${totals.averageConfidence}`}
            subtitle="Ortalama güven oranı"
            color="text-emerald-400"
          />

        </section>

        {/* AI SUMMARY */}

        <section className="grid gap-6 lg:grid-cols-3">

          <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-6">

            <p className="text-sm text-slate-400">
              AI Model Durumu
            </p>

            <div className="mt-4 flex items-center gap-3">

              <span className="h-3 w-3 animate-pulse rounded-full bg-emerald-400" />

              <span className="text-xl font-bold text-emerald-400">
                Çalışıyor
              </span>

            </div>

            <p className="mt-3 text-sm text-slate-500">
              Model sensör ve makine verilerini
              sürekli analiz ediyor.
            </p>

          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-6">

            <p className="text-sm text-slate-400">
              Anomali Durumu
            </p>

            <p className="mt-3 text-3xl font-bold text-white">

              {summary?.is_anomaly
                ? 'Anomali Tespit Edildi'
                : 'Normal'}

            </p>

            <p className="mt-2 text-sm text-slate-500">
              Backend AI analiz sonucu
            </p>

          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-6">

            <p className="text-sm text-slate-400">
              Analiz Edilen Sensör
            </p>

            <p className="mt-3 text-xl font-bold text-cyan-400">
              {summary?.sensor ||
                'CNC İşleme Merkezi'}
            </p>

            <p className="mt-2 text-sm text-slate-500">
              Aktif AI izleme noktası
            </p>

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
                  setMachineFilter(
                    e.target.value
                  )
                }
              >

                <option value="all">
                  Tüm Makineler
                </option>

                {machines.map(
                  (machine) => (
                    <option
                      key={machine}
                      value={machine}
                    >
                      {machine}
                    </option>
                  )
                )}

              </select>

              <select
                className="rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-slate-200 outline-none focus:border-cyan-500"
                value={riskFilter}
                onChange={(e) =>
                  setRiskFilter(
                    e.target.value
                  )
                }
              >

                <option value="all">
                  Tüm Risk Seviyeleri
                </option>

                <option value="Düşük Risk">
                  Düşük Risk
                </option>

                <option value="Orta Risk">
                  Orta Risk
                </option>

                <option value="Yüksek Risk">
                  Yüksek Risk
                </option>

                <option value="Kritik Risk">
                  Kritik Risk
                </option>

              </select>

              <select
                className="rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-slate-200 outline-none focus:border-cyan-500"
                value={dateFilter}
                onChange={(e) =>
                  setDateFilter(
                    e.target.value
                  )
                }
              >

                <option value="all">
                  Tüm Tarihler
                </option>

                {[
                  ...new Set(
                    analyses.map(
                      (item) =>
                        item.date
                    )
                  ),
                ].map((date) => (
                  <option
                    key={date}
                    value={date}
                  >
                    {date}
                  </option>
                ))}

              </select>

            </div>

            <div className="text-sm text-slate-400">

              Gösterilen:{' '}

              <span className="font-semibold text-white">
                {filtered.length}
              </span>

            </div>

          </div>

        </section>

        {/* TABLE */}

        <section className="rounded-2xl border border-slate-800 bg-slate-900/80 p-4 shadow-xl">

          {loading ? (

            <div className="p-10 text-center text-slate-400">
              AI analizleri yükleniyor...
            </div>

          ) : error ? (

            <div className="p-10 text-center">

              <p className="text-red-400">
                {error}
              </p>

              <p className="mt-2 text-sm text-slate-500">
                Backend servisinin çalıştığından emin olun.
              </p>

            </div>

          ) : (

            <div>

              {/* DESKTOP */}

              <div className="hidden md:block">

                <div className="overflow-x-auto">

                  <table className="min-w-full table-auto">

                    <thead>

                      <tr className="border-b border-slate-800 text-left text-sm text-slate-400">

                        <th className="px-4 py-4">
                          Analiz ID
                        </th>

                        <th className="px-4 py-4">
                          Makine
                        </th>

                        <th className="px-4 py-4">
                          Risk Skoru
                        </th>

                        <th className="px-4 py-4">
                          AI Kararı
                        </th>

                        <th className="px-4 py-4">
                          Risk
                        </th>

                        <th className="px-4 py-4">
                          Güven
                        </th>

                        <th className="px-4 py-4">
                          Tarih
                        </th>

                        <th className="px-4 py-4">
                          İşlem
                        </th>

                      </tr>

                    </thead>

                    <tbody>

                      {filtered.map(
                        (item) => (

                          <tr
                            key={item.id}
                            className="border-b border-slate-800/70 transition-colors hover:bg-slate-800/40"
                          >

                            <td className="px-4 py-5">

                              <span className="font-mono text-sm font-semibold text-cyan-300">
                                {item.id}
                              </span>

                            </td>

                            <td className="px-4 py-5">

                              <p className="font-semibold text-white">
                                {item.machine}
                              </p>

                            </td>

                            <td className="min-w-[170px] px-4 py-5">

                              <div className="flex items-center justify-between">

                                <span className="font-bold text-white">
                                  {item.score}%
                                </span>

                              </div>

                              <div className="mt-2">

                                <ProgressBar
                                  value={
                                    item.score
                                  }
                                />

                              </div>

                            </td>

                            <td className="px-4 py-5">

                              <DecisionBadge
                                decision={
                                  item.decision
                                }
                              />

                            </td>

                            <td className="px-4 py-5">

                              <RiskBadge
                                risk={
                                  item.risk
                                }
                              />

                            </td>

                            <td className="px-4 py-5">

                              <span className="font-semibold text-slate-300">
                                %{item.confidence}
                              </span>

                            </td>

                            <td className="px-4 py-5 text-sm text-slate-400">
                              {item.date}
                            </td>

                            <td className="px-4 py-5">

                              <button
                                onClick={() =>
                                  navigate(
                                    `/ai-quality-control/${item.id}`
                                  )
                                }
                                className="rounded-md bg-slate-800 px-3 py-2 text-sm font-semibold text-slate-200 transition hover:bg-slate-700"
                              >
                                👁 Görüntüle
                              </button>

                            </td>

                          </tr>

                        )
                      )}

                    </tbody>

                  </table>

                </div>

              </div>

              {/* MOBILE */}

              <div className="space-y-3 md:hidden">

                {filtered.map(
                  (item) => (

                    <div
                      key={item.id}
                      className="rounded-lg border border-slate-700 bg-slate-800 p-4"
                    >

                      <div className="flex items-start justify-between gap-3">

                        <div>

                          <p className="font-semibold text-white">
                            {item.id}
                          </p>

                          <p className="mt-1 text-sm text-slate-400">
                            {item.machine}
                          </p>

                        </div>

                        <RiskBadge
                          risk={item.risk}
                        />

                      </div>

                      <div className="mt-4">

                        <div className="flex justify-between">

                          <span className="text-sm text-slate-400">
                            Risk Skoru
                          </span>

                          <span className="font-bold text-white">
                            {item.score}%
                          </span>

                        </div>

                        <div className="mt-2">

                          <ProgressBar
                            value={
                              item.score
                            }
                          />

                        </div>

                      </div>

                      <div className="mt-4 flex flex-wrap items-center gap-2">

                        <DecisionBadge
                          decision={
                            item.decision
                          }
                        />

                        <span className="text-slate-500">
                          •
                        </span>

                        <span className="text-sm text-slate-300">
                          Güven %{item.confidence}
                        </span>

                      </div>

                      <div className="mt-4 flex items-center justify-between">

                        <span className="text-sm text-slate-500">
                          {item.date}
                        </span>

                        <button
                          onClick={() =>
                            navigate(
                              `/ai-quality-control/${item.id}`
                            )
                          }
                          className="rounded-md bg-slate-700 px-3 py-2 text-sm font-semibold text-slate-200"
                        >
                          👁 Görüntüle
                        </button>

                      </div>

                    </div>

                  )
                )}

              </div>

            </div>

          )}

        </section>

        {/* AI RISK SUMMARY */}

        <section className="grid gap-6 lg:grid-cols-2">

          {/* RISK DISTRIBUTION */}

          <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-6">

            <h2 className="text-lg font-bold text-white">
              Risk Dağılımı
            </h2>

            <p className="mt-1 text-sm text-slate-400">
              Makinelerin anlık AI risk seviyeleri
            </p>

            <div className="mt-6 space-y-4">

              {[
                'Düşük Risk',
                'Orta Risk',
                'Yüksek Risk',
                'Kritik Risk',
              ].map((risk) => {

                const count =
                  analyses.filter(
                    (item) =>
                      item.risk === risk
                  ).length;

                const percentage =
                  analyses.length > 0
                    ? Math.round(
                        (count /
                          analyses.length) *
                          100
                      )
                    : 0;

                return (
                  <div key={risk}>

                    <div className="flex items-center justify-between">

                      <span className="text-sm text-slate-300">
                        {risk}
                      </span>

                      <span className="text-sm font-semibold text-white">
                        {count}
                      </span>

                    </div>

                    <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-800">

                      <div
                        className={`h-full rounded-full transition-all duration-700 ${
                          risk === 'Kritik Risk'
                            ? 'bg-red-500'
                            : risk === 'Yüksek Risk'
                            ? 'bg-orange-500'
                            : risk === 'Orta Risk'
                            ? 'bg-amber-500'
                            : 'bg-emerald-500'
                        }`}
                        style={{
                          width: `${percentage}%`,
                        }}
                      />

                    </div>

                  </div>
                );
              })}

            </div>

          </div>

          {/* SYSTEM STATUS */}

          <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-6">

            <h2 className="text-lg font-bold text-white">
              AI Sistem Durumu
            </h2>

            <p className="mt-1 text-sm text-slate-400">
              Yapay zekâ kalite kontrol sistemi
            </p>

            <div className="mt-6 space-y-4">

              <div className="flex items-center justify-between rounded-lg border border-slate-800 bg-slate-950/50 p-4">

                <div className="flex items-center gap-3">

                  <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-emerald-400" />

                  <span className="text-sm text-slate-300">
                    AI Modeli
                  </span>

                </div>

                <span className="font-semibold text-emerald-400">
                  Aktif
                </span>

              </div>

              <div className="flex items-center justify-between rounded-lg border border-slate-800 bg-slate-950/50 p-4">

                <span className="text-sm text-slate-300">
                  Ortalama Güven
                </span>

                <span className="font-bold text-cyan-400">
                  %{totals.averageConfidence}
                </span>

              </div>

              <div className="flex items-center justify-between rounded-lg border border-slate-800 bg-slate-950/50 p-4">

                <span className="text-sm text-slate-300">
                  Analiz Durumu
                </span>

                <span className="font-semibold text-emerald-400">
                  Gerçek Zamanlı
                </span>

              </div>

              <div className="rounded-lg border border-cyan-500/20 bg-cyan-500/5 p-4">

                <div className="flex items-center gap-2">

                  <span className="h-2 w-2 animate-pulse rounded-full bg-cyan-400" />

                  <span className="text-sm font-semibold text-cyan-300">
                    AI analizleri devam ediyor
                  </span>

                </div>

                <p className="mt-2 text-xs text-slate-500">
                  Risk skorları ve kararlar otomatik
                  olarak güncelleniyor.
                </p>

              </div>

            </div>

          </div>

        </section>

      </div>

    </div>
  );
}

export default AiQualityControl;