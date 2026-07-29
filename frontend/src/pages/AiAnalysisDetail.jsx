import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import RiskGauge from '../components/dashboard/RiskGauge';
import Timeline from '../components/dashboard/Timeline';

const mockAnalyses = {
  'A-001': {
    id: 'A-001',
    machine: 'CNC İşleme Merkezi',
    date: '2026-07-22',
    riskScore: 78,
    analysisTime: '45 saniye',
    detectedDefects: 3,
    maintenancePriority: 'Yüksek',
    operatorNote: 'Kontrol edildi, bakım ekibine acil olarak yönlendirildi.',
    timeline: [
      { id: 1, text: 'Analiz Başladı', time: '14:30:15', type: 'start' },
      { id: 2, text: 'Anormal Titreşim Saptandı', time: '14:30:48', type: 'detect' },
      { id: 3, text: 'Risk Skoru Hesaplandı', time: '14:31:02', type: 'calculate' },
      { id: 4, text: 'Operatör Bilgilendirildi', time: '14:31:05', type: 'notify' },
    ],
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
    riskScore: 64, // Orta risk
    analysisTime: '32 saniye',
    detectedDefects: 1,
    maintenancePriority: 'Orta',
    operatorNote: 'Basınç değerleri takip ediliyor. Henüz acil bir durum yok.',
    timeline: [
      { id: 1, text: 'Analiz Başladı', time: '11:15:00', type: 'start' },
      { id: 2, text: 'Basınçta Dalgalanma Saptandı', time: '11:15:21', type: 'detect' },
      { id: 3, text: 'Risk Skoru Hesaplandı', time: '11:15:30', type: 'calculate' },
      { id: 4, text: 'Operatör Bilgilendirildi', time: '11:15:33', type: 'notify' },
    ],
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
    riskScore: 92, // Kritik risk
    analysisTime: '51 saniye',
    detectedDefects: 5,
    maintenancePriority: 'Kritik',
    operatorNote: 'Makine acilen durduruldu. Bakım ekibi müdahale ediyor.',
    timeline: [
      { id: 1, text: 'Analiz Başladı', time: '09:05:10', type: 'start' },
      { id: 2, text: 'Aşırı Akım Saptandı', time: '09:05:45', type: 'detect' },
      { id: 3, text: 'Risk Skoru Hesaplandı', time: '09:05:58', type: 'calculate' },
      { id: 4, text: 'Operatör Bilgilendirildi', time: '09:06:01', type: 'notify' },
    ],
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
    riskScore: 18, // Düşük risk
    analysisTime: '25 saniye',
    detectedDefects: 0,
    maintenancePriority: 'Düşük',
    operatorNote: 'Rutin kontrol, herhangi bir sorun yok.',
    timeline: [
      { id: 1, text: 'Analiz Başladı', time: '16:00:00', type: 'start' },
      { id: 2, text: 'Veriler Doğrulandı', time: '16:00:20', type: 'calculate' },
      { id: 3, text: 'Operatör Bilgilendirildi', time: '16:00:25', type: 'notify' },
    ],
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

        <section className="grid grid-cols-2 gap-6 md:grid-cols-3 lg:grid-cols-5">
          <InfoCard label="Makine" value={analysis.machine} />
          <InfoCard label="Analiz Tarihi" value={analysis.date} />
          <InfoCard label="Güven %" value={analysis.confidence} />
          <InfoCard label="Analiz Süresi" value={analysis.analysisTime} />
          <InfoCard label="Kusur Sayısı" value={analysis.detectedDefects} />
        </section>

        <section className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          {/* Orta Sütun - Risk Göstergesi */}
          <div className="flex items-center justify-center rounded-2xl border border-slate-800 bg-slate-900/80 p-8 shadow-xl lg:col-span-1">
            <RiskGauge score={analysis.riskScore} />
          </div>

          {/* Sağ Sütun - AI Yorumu ve Aksiyonlar */}
          <div className="space-y-8 lg:col-span-2">
            <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-6 shadow-xl">
              <h2 className="text-xl font-semibold text-white">AI Yorumu</h2>
              <p className="mt-4 rounded-xl border border-cyan-500/20 bg-cyan-500/10 p-4 text-slate-300">{analysis.aiComment}</p>
            </div>

            <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 p-6 shadow-xl">
              <h2 className="text-xl font-semibold text-amber-300">Önerilen Aksiyon</h2>
              <p className="mt-4 text-slate-300">{analysis.recommendedAction}</p>
            </div>

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-6 shadow-xl">
                <h2 className="text-lg font-semibold text-white">Tahmini Bakım Önceliği</h2>
                <p className="mt-3 text-2xl font-bold text-orange-400">{analysis.maintenancePriority}</p>
              </div>
              <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-6 shadow-xl">
                <h2 className="text-lg font-semibold text-white">Operatör Notu</h2>
                <p className="mt-3 text-slate-300">{analysis.operatorNote}</p>
              </div>
            </div>
          </div>
        </section>

        <section className="grid grid-cols-1 gap-8 lg:grid-cols-2">
          <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-8 shadow-xl">
            <h2 className="mb-6 text-xl font-semibold text-white">Analiz Zaman Çizelgesi</h2>
            <Timeline data={analysis.timeline} />
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-8 shadow-xl">
            <h2 className="mb-6 text-xl font-semibold text-white">İlgili Sensörler</h2>
            <div className="space-y-4">
              {analysis.relatedSensors.map((sensor) => (
                <div key={sensor.id} className="flex items-center justify-between rounded-lg border border-slate-700 bg-slate-800 p-4">
                  <span className="font-medium text-slate-300">{sensor.name}</span>
                  <span className="font-mono text-lg font-bold text-white">{sensor.value}</span>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

function InfoCard({ label, value }) {
  return (
    <div className="rounded-xl border border-slate-700 bg-slate-800 p-4">
      <p className="text-sm text-slate-400">{label}</p>
      <p className="mt-2 text-xl font-semibold text-white">{value}</p>
    </div>
  );
}

export default AiAnalysisDetail;
