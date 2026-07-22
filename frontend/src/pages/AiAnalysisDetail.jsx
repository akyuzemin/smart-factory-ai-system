import { useNavigate, useParams } from 'react-router-dom';

function AiAnalysisDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-950 p-8 text-slate-100">
      <div className="mx-auto max-w-5xl rounded-2xl border border-slate-800 bg-slate-900/80 p-8 shadow-xl">
        <button
          onClick={() => navigate('/ai-quality-control')}
          className="mb-5 rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-slate-300 transition hover:bg-slate-700"
        >
          ← AI analizlerine dön
        </button>

        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-cyan-400">AI Detay</p>
        <h1 className="mt-2 text-3xl font-semibold text-white">Analiz {id}</h1>
        <p className="mt-3 text-slate-400">
          Bu ekran, ileriki aşamada detay grafiklerini, açıklama metinlerini ve önerilen aksiyonları gösterecek şekilde genişletilecektir.
        </p>

        <div className="mt-8 rounded-xl border border-cyan-500/20 bg-cyan-500/10 p-5 text-slate-300">
          Şimdilik bu sayfa placeholder olarak hazırlandı. AI analizi yönetimi tablosu üzerinden seçim yapıldıktan sonra detay akışı burada tamamlanacaktır.
        </div>
      </div>
    </div>
  );
}

export default AiAnalysisDetail;
