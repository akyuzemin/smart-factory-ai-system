// frontend/src/components/SensorCard.jsx
function SensorCard({ title, value, unit, status }) {
  const isCritical = status === 'Kritik';

  return (
    <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 shadow-lg flex flex-col items-center justify-center transition-all duration-300 hover:-translate-y-1 hover:shadow-cyan-500/20">
      <h3 className="text-slate-400 text-sm font-semibold uppercase tracking-wider mb-2">{title}</h3>
      
      <div className="flex items-baseline gap-1 mb-4">
        <span className="text-4xl font-bold text-white">{value}</span>
        <span className="text-slate-400 text-lg">{unit}</span>
      </div>
      
      <div className={`px-4 py-1 rounded-full text-sm font-medium ${
        isCritical 
          ? 'bg-red-500/20 text-red-400 border border-red-500/30' 
          : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
      }`}>
        Durum: {status}
      </div>
    </div>
  );
}

export default SensorCard;