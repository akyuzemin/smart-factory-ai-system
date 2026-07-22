import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import SensorChart from '../components/dashboard/SensorChart';

const mockAnalyses = {
  'A-001': {
    id: 'A-001',
    machine: 'CNC İşleme Merkezi',
    date: '2026-07-22',
    riskScore: 72,
    confidence: '92%',
    aiComment: 'Motor sıcaklığı son ölçümlerde normal çalışma aralığının üzerine çıkmaktadır. Anomali tespit edilmiştir.',
    recommendedAction: 'Rulman kontrolü ve soğutma sistemi incelemesi önerilmektedir. 72 saat içinde bakım planlanmalıdır.',
    relatedSensors: [
      { id: 1, name: 'Motor Sıcaklığı', value: '85°C' },
      { id: 3, name: 'Titreşim', value: '0.6 mm/s' },
    ],
    mainSensorId: 1,
  },
  'A-002': {
    id: 'A-002',
    machine: 'Hidrolik Pres',
    date: '2026-07-22',
    riskScore: 64,
    confidence: '87%',
    aiComment: 'Basınç sensöründe beklenmedik dalgalanmalar gözlemleniyor. Sistem normalden farklı çalışıyor.',
    recommendedAction: 'Hidrolik sistemin basınç valfleri kontrol edilmeli. Operatörün makineyi yakından izlemesi tavsiye edilir.',
    relatedSensors: [
      { id: 2, name: 'Ana Valf Basıncı', value: '120 bar' },
      { id: 4, name: 'Yağ Seviyesi', value: '95%' },
    ],
    mainSensorId: 2,
  },
  'A-003': {
    id: 'A-003',
    machine: 'Robotik Kaynak Ünitesi',
    date: '2026-07-21',
    riskScore: 88,
    confidence: '95%',
    aiComment: 'Robot kolu akım sensöründe kritik seviyede anomali saptandı. Bu durum, motor arızasına işaret ediyor olabilir.',
    recommendedAction: 'Acil bakım gereklidir. Robot kolunun motoru ve güç kaynağı derhal incelenmelidir.',
    relatedSensors: [
      { id: 5, name: 'Robot Kolu Akımı', value: '15A' },
      { id: 1, name: 'Motor Sıcaklığı', value: '92°C' },
    ],
    mainSensorId: 5,
  },
  'A-004': {
    id: 'A-004',
    machine: 'Konveyör Sistemi',
    date: '2026-07-21',
    riskScore: 30,
    confidence: '91%',
    aiComment: 'Tüm sensör verileri normal aralıkta. Herhangi bir anomali tespit edilmedi.',
    recommendedAction: 'Rutin kontroller dışında ek bir işlem gerekmemektedir.',
    relatedSensors: [{ id: 6, name: 'Bant Hızı', value: '1.2 m/s' }],
    mainSensorId: 6,
  },
};

function AiAnalysisDetail() {
  const { id } = useParams();
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulating API fetch
    setLoading(true);
    setTimeout(() => {
      setAnalysis(mockAnalyses[id] || null);
      setLoading(false);
    }, 500);
  }, [id]);

  if (loading) {
    return <div className="p-8 text-center text-slate-400">Analiz detayı yükleniyor...</div>;
  }

  if (!analysis) {
    return (
      <div className="p-8 text-center text-red-400">
        <p>Analiz bulunamadı.</p>
        <Link to="/ai-quality-control" className="mt-4 inline-block rounded-lg bg-slate-800 px-4 py-2 text-slate-200 hover:bg-slate-700">
          ← Geri dön
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 p-8 text-slate-100">
      <div className="mx-auto max-w-7xl space-y-8">
        <header>
          <Link to="/ai-quality-control" className="mb-4 inline-flex items-center gap-2 text-sm font-medium text-cyan-400 transition-colors hover:text-cyan-300">
            <span aria-hidden="true">←</span> AI Analizlerine Dön
          </Link>
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-cyan-400">AI Analiz Raporu</p>
          <h1 className="mt-2 text-3xl font-semibold text-white">Analiz #{analysis.id}</h1>
        </header>

        <section className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <InfoCard label="Makine" value={analysis.machine} />
          <InfoCard label="Analiz Tarihi" value={analysis.date} />
          <InfoCard label="Güven Oranı" value={analysis.confidence} />
        </section>

        <section className="grid grid-cols-1 gap-8 lg:grid-cols-[2fr_1fr]">
          <div className="space-y-8">
            <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-8 shadow-xl">
              <h2 className="text-xl font-semibold text-white">Risk Göstergesi</h2>
              <div className="mt-4">
                <div className="flex justify-between text-sm font-medium text-slate-400">
                  <span>Düşük Risk</span>
                  <span>Yüksek Risk</span>
                </div>
                <div className="mt-2 h-4 w-full rounded-full bg-slate-700">
                  <div className="h-4 rounded-full bg-gradient-to-r from-emerald-500 via-amber-500 to-red-600" style={{ width: `${analysis.riskScore}%` }} />
                </div>
                <div className="mt-3 text-center text-2xl font-bold text-white">{analysis.riskScore}%</div>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-8 shadow-xl">
              <h2 className="text-xl font-semibold text-white">AI Yorumu</h2>
              <p className="mt-4 rounded-xl border border-cyan-500/20 bg-cyan-500/10 p-4 text-slate-300">{analysis.aiComment}</p>
            </div>

            <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 p-8 shadow-xl">
              <h2 className="text-xl font-semibold text-amber-300">Önerilen İşlem</h2>
              <p className="mt-4 text-slate-300">{analysis.recommendedAction}</p>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-8 shadow-xl">
            <h2 className="text-xl font-semibold text-white">İlgili Sensörler</h2>
            <div className="mt-4 space-y-3">
              {analysis.relatedSensors.map(sensor => (
                <div key={sensor.id} className="flex items-center justify-between rounded-lg border border-slate-700 bg-slate-800 p-3">
                  <span className="text-sm font-medium text-slate-300">{sensor.name}</span>
                  <span className="text-sm font-bold text-white">{sensor.value}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="rounded-2xl border border-slate-800 bg-slate-900/80 p-8 shadow-xl">
          <SensorChart sensorId={analysis.mainSensorId} title={`${analysis.machine} - Ana Sensör Trendi`} color="#38bdf8" />
        </section>
      </div>
    </div>
  );
}

function InfoCard({ label, value }) {
  return (
    <div className="rounded-xl border border-slate-700 bg-slate-800 p-5">
      <p className="text-sm text-slate-400">{label}</p>
      <p className="mt-2 text-lg font-semibold text-white">{value}</p>
    </div>
  );
}

export default AiAnalysisDetail;
