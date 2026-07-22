function AiStatusCard({ aiStatus }) {
  if (!aiStatus) {
    return null;
  }

  const isAnomaly = aiStatus.is_anomaly;

  return (
    <div className={`mb-8 p-5 rounded-xl border flex items-center justify-between transition-all duration-500 ${
      isAnomaly
        ? 'bg-red-500/20 border-red-500 shadow-[0_0_15px_rgba(239,68,68,0.5)] animate-pulse'
        : 'bg-emerald-500/10 border-emerald-500/30'
    }`}>
      <div className="flex items-center gap-4">
        <span className="text-3xl">{isAnomaly ? '⚠️' : '🧠'}</span>
        <div>
          <h4 className={`font-bold ${isAnomaly ? 'text-red-400' : 'text-emerald-400'}`}>
            Yapay Zeka Analiz Modülü (Motor 1)
          </h4>
          <p className="text-slate-300 text-sm mt-1">
            {aiStatus.ai_message} <span className="opacity-75">(Son Değer: {aiStatus.latest_value}°C)</span>
          </p>
        </div>
      </div>

      <div className="text-xs font-mono text-slate-500">
        Model: Isolation Forest
      </div>
    </div>
  );
}

export default AiStatusCard;
