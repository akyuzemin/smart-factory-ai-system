import { useEffect, useState } from 'react';

function AiQualityControl() {
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalysis = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/ai/anomaly-summary');
        const data = await response.json();
        setAnalysis(data);
      } catch (error) {
        console.error('AI kalite analizi alınamadı:', error);
        setAnalysis({ status: 'error', message: 'AI servisine erişilemedi.' });
      } finally {
        setLoading(false);
      }
    };

    fetchAnalysis();
    const intervalId = setInterval(fetchAnalysis, 8000);

    return () => clearInterval(intervalId);
  }, []);

  const recommendation = analysis?.is_anomaly
    ? 'Bakım ekibi, kritik sıcaklık dalgalanmasını doğrulamak ve ekipman incelemesini başlatmak için yönlendirilmeli.'
    : 'Sistem normal seyirde; üretim takibini sürdürmek yeterli.';

  return (
    <div className="min-h-screen bg-slate-950 p-8 text-slate-100">
      <div className="mx-auto max-w-6xl space-y-6">
        <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-8 shadow-xl">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-cyan-400">AI Kalite Kontrol</p>
          <h1 className="mt-3 text-3xl font-semibold text-white">Yapay zekâ destekli anomali analizi</h1>
          <p className="mt-3 max-w-3xl text-slate-400">
            Bu ekran, sensör verilerinden elde edilen anomali tespiti sonuçlarını ve bakım önerilerini tek bir noktada sunar.
          </p>
        </div>

        {loading ? (
          <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-8 text-slate-300">
            Analiz yükleniyor...
          </div>
        ) : (
          <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
            <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-8 shadow-xl">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm uppercase tracking-[0.2em] text-slate-400">Sonuç</p>
                  <h2 className="mt-2 text-2xl font-semibold text-white">{analysis?.sensor || 'Motor 1 Sıcaklığı'}</h2>
                </div>
                <span className={`rounded-full px-4 py-1 text-sm font-medium ${analysis?.is_anomaly ? 'bg-red-500/20 text-red-400' : 'bg-emerald-500/20 text-emerald-400'}`}>
                  {analysis?.is_anomaly ? 'Anomali Tespit Edildi' : 'Normal Çalışma'}
                </span>
              </div>

              <div className="mt-8 grid gap-4 md:grid-cols-2">
                <div className="rounded-xl border border-slate-800 bg-slate-950/70 p-4">
                  <p className="text-sm text-slate-400">En Son Değer</p>
                  <p className="mt-2 text-3xl font-semibold text-white">{analysis?.latest_value ?? '—'}</p>
                </div>
                <div className="rounded-xl border border-slate-800 bg-slate-950/70 p-4">
                  <p className="text-sm text-slate-400">Durum</p>
                  <p className="mt-2 text-xl font-semibold text-white">{analysis?.status ?? 'error'}</p>
                </div>
              </div>

              <div className="mt-8 rounded-xl border border-cyan-500/20 bg-cyan-500/10 p-4 text-cyan-200">
                <p className="text-sm font-semibold uppercase tracking-[0.2em]">AI Mesajı</p>
                <p className="mt-2 text-base">{analysis?.ai_message || analysis?.message || 'Analiz henüz hazır değil.'}</p>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-8 shadow-xl">
              <p className="text-sm uppercase tracking-[0.2em] text-slate-400">Önerilen Aksiyon</p>
              <h3 className="mt-2 text-xl font-semibold text-white">Tahmine dayalı bakım</h3>
              <p className="mt-4 text-slate-400">{recommendation}</p>

              <ul className="mt-6 space-y-3 text-sm text-slate-300">
                <li className="rounded-lg border border-slate-800 bg-slate-950/70 p-3">• Verileri 5 dakika boyunca izleyin ve trendi doğrulayın.</li>
                <li className="rounded-lg border border-slate-800 bg-slate-950/70 p-3">• Gerekiyorsa makineye kısa bir bakım planı ekleyin.</li>
                <li className="rounded-lg border border-slate-800 bg-slate-950/70 p-3">• Üretim planını anomali durumuna göre yeniden ayarlayın.</li>
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default AiQualityControl;
