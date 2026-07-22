import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';

function KpiCard({ label, value }) {
  return (
    <div className="rounded-xl border border-slate-700 bg-slate-800 p-4">
      <p className="text-sm font-semibold text-slate-400">{label}</p>
      <p className="mt-2 text-2xl font-bold text-white">{value}</p>
    </div>
  );
}

function RiskBadge({ risk }) {
  const map = {
    'Düşük Risk': 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/20',
    'Orta Risk': 'bg-amber-500/10 text-amber-300 border border-amber-500/20',
    'Yüksek Risk': 'bg-orange-500/10 text-orange-300 border border-orange-500/20',
    'Kritik Risk': 'bg-red-500/10 text-red-300 border border-red-500/20',
  };

  return <span className={`inline-flex rounded-full border px-3 py-1 text-sm font-semibold ${map[risk] || 'bg-slate-700 text-slate-300 border border-slate-600'}`}>{risk}</span>;
}

function AiQualityControl() {
  const navigate = useNavigate();
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [machineFilter, setMachineFilter] = useState('all');
  const [riskFilter, setRiskFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');

  useEffect(() => {
    let isMounted = true;

    const fetchAnalysis = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/ai/anomaly-summary');
        if (!response.ok) throw new Error('AI analizi alınamadı.');
        const data = await response.json();

        const samples = [
          {
            id: 'A-001',
            machine: data?.sensor || 'CNC İşleme Merkezi',
            score: data?.is_anomaly ? 72 : 18,
            decision: data?.is_anomaly ? 'Bakım Gerekiyor' : 'Normal',
            confidence: '92%',
            date: '2026-07-22',
            risk: data?.is_anomaly ? 'Yüksek Risk' : 'Düşük Risk',
          },
          {
            id: 'A-002',
            machine: 'Hidrolik Pres',
            score: 64,
            decision: 'İzleme',
            confidence: '87%',
            date: '2026-07-22',
            risk: 'Orta Risk',
          },
          {
            id: 'A-003',
            machine: 'Robotik Kaynak Ünitesi',
            score: 88,
            decision: 'Kritik',
            confidence: '95%',
            date: '2026-07-21',
            risk: 'Kritik Risk',
          },
          {
            id: 'A-004',
            machine: 'Konveyör Sistemi',
            score: 30,
            decision: 'Normal',
            confidence: '91%',
            date: '2026-07-21',
            risk: 'Düşük Risk',
          },
        ];

        if (isMounted) {
          setSummary(data);
          setAnalyses(samples);
        }
      } catch (fetchError) {
        if (isMounted) {
          setError(fetchError.message);
          setAnalyses([]);
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchAnalysis();
    return () => { isMounted = false; };
  }, []);

  const [analyses, setAnalyses] = useState([]);

  const machines = useMemo(() => {
    const unique = [];
    const seen = new Set();
    analyses.forEach((item) => {
      if (!seen.has(item.machine)) {
        seen.add(item.machine);
        unique.push(item.machine);
      }
    });
    return unique;
  }, [analyses]);

  const totals = useMemo(() => {
    const total = analyses.length;
    const today = analyses.filter((item) => item.date === '2026-07-22').length;
    const risky = analyses.filter((item) => item.risk === 'Yüksek Risk' || item.risk === 'Kritik Risk').length;
    const avg = analyses.length ? Math.round(analyses.reduce((acc, item) => acc + item.score, 0) / analyses.length) : 0;
    return { total, today, risky, avg };
  }, [analyses]);

  const filtered = useMemo(() => {
    return analyses.filter((item) => {
      if (machineFilter !== 'all' && item.machine !== machineFilter) return false;
      if (riskFilter !== 'all' && item.risk !== riskFilter) return false;
      if (dateFilter !== 'all' && item.date !== dateFilter) return false;
      return true;
    });
  }, [analyses, machineFilter, riskFilter, dateFilter]);

  return (
    <div className="min-h-screen bg-slate-950 p-6 text-slate-100">
      <div className="mx-auto max-w-7xl space-y-6">
        <header className="rounded-2xl border border-slate-800 bg-slate-900/80 p-6 shadow-xl">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-cyan-400">AI Kalite Kontrol</p>
          <h1 className="mt-2 text-2xl font-semibold text-white">Yapay zekâ analizleri merkezi yönetim paneli</h1>
          <p className="mt-2 text-sm text-slate-400">Makine bazlı risk seviyelerini filtreleyip analiz geçmişini yönetin.</p>
        </header>

        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <KpiCard label="Toplam Analiz" value={totals.total} />
          <KpiCard label="Bugünkü Analiz" value={totals.today} />
          <KpiCard label="Riskli Makine" value={totals.risky} />
          <KpiCard label="Ortalama Risk Skoru" value={`${totals.avg}%`} />
        </section>

        <section className="rounded-2xl border border-slate-800 bg-slate-900/80 p-4 shadow-xl">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex flex-1 flex-col gap-3 md:flex-row">
              <select className="rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-slate-200" value={machineFilter} onChange={(e) => setMachineFilter(e.target.value)}>
                <option value="all">Tüm Makineler</option>
                {machines.map((machine) => <option key={machine} value={machine}>{machine}</option>)}
              </select>
              <select className="rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-slate-200" value={riskFilter} onChange={(e) => setRiskFilter(e.target.value)}>
                <option value="all">Tüm Risk Seviyeleri</option>
                <option value="Düşük Risk">Düşük Risk</option>
                <option value="Orta Risk">Orta Risk</option>
                <option value="Yüksek Risk">Yüksek Risk</option>
                <option value="Kritik Risk">Kritik Risk</option>
              </select>
              <select className="rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-slate-200" value={dateFilter} onChange={(e) => setDateFilter(e.target.value)}>
                <option value="all">Tüm Tarihler</option>
                <option value="2026-07-22">2026-07-22</option>
                <option value="2026-07-21">2026-07-21</option>
              </select>
            </div>
            <div className="text-sm text-slate-400">Gösterilen: <span className="font-semibold text-white">{filtered.length}</span></div>
          </div>
        </section>

        <section className="rounded-2xl border border-slate-800 bg-slate-900/80 p-4 shadow-xl">
          {loading ? (
            <div className="p-8 text-center text-slate-400">AI analizleri yükleniyor...</div>
          ) : error ? (
            <div className="p-8 text-center text-red-400">{error}</div>
          ) : (
            <div>
              <div className="hidden md:block">
                <div className="overflow-x-auto">
                  <table className="min-w-full table-auto">
                    <thead>
                      <tr className="text-left text-sm text-slate-400">
                        <th className="px-4 py-3">Analiz ID</th>
                        <th className="px-4 py-3">Makine</th>
                        <th className="px-4 py-3">Risk Skoru (%)</th>
                        <th className="px-4 py-3">AI Kararı</th>
                        <th className="px-4 py-3">Güven Oranı</th>
                        <th className="px-4 py-3">Analiz Tarihi</th>
                        <th className="px-4 py-3">İşlem</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filtered.map((item) => (
                        <tr key={item.id} className="border-t border-slate-800 hover:bg-slate-900/60">
                          <td className="px-4 py-3 text-white">{item.id}</td>
                          <td className="px-4 py-3 text-slate-300">{item.machine}</td>
                          <td className="px-4 py-3 text-white">{item.score}</td>
                          <td className="px-4 py-3"><RiskBadge risk={item.risk} /></td>
                          <td className="px-4 py-3 text-slate-300">{item.confidence}</td>
                          <td className="px-4 py-3 text-slate-300">{item.date}</td>
                          <td className="px-4 py-3">
                            <button onClick={() => navigate(`/ai-quality-control/${item.id}`)} className="rounded-md bg-slate-800 px-3 py-1 text-sm font-semibold text-slate-200 hover:bg-slate-700">👁 Görüntüle</button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="space-y-3 md:hidden">
                {filtered.map((item) => (
                  <div key={item.id} className="rounded-lg border border-slate-700 bg-slate-800 p-3">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-semibold text-white">{item.id}</p>
                        <p className="text-sm text-slate-400">{item.machine}</p>
                      </div>
                      <RiskBadge risk={item.risk} />
                    </div>
                    <div className="mt-3 flex flex-wrap items-center gap-2 text-sm text-slate-300">
                      <span>Skor: {item.score}</span>
                      <span>•</span>
                      <span>{item.confidence}</span>
                    </div>
                    <div className="mt-3 flex items-center justify-between text-sm text-slate-400">
                      <span>{item.date}</span>
                      <button onClick={() => navigate(`/ai-quality-control/${item.id}`)} className="rounded-md bg-slate-700 px-3 py-1 text-sm font-semibold text-slate-200">👁 Görüntüle</button>
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

export default AiQualityControl;
