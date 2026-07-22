// frontend/src/components/SensorCard.jsx
function SensorCard({ title, value, unit, status, onClick }) {
  const isCritical = status === 'Kritik';
  const isClickable = typeof onClick === 'function';

  return (
    <div
      onClick={onClick}
      onKeyDown={(event) => {
        if (isClickable && (event.key === 'Enter' || event.key === ' ')) {
          event.preventDefault();
          onClick();
        }
      }}
      role={isClickable ? 'button' : undefined}
      tabIndex={isClickable ? 0 : undefined}
      className={`flex flex-col items-center justify-center rounded-xl border border-slate-700 bg-slate-800 p-6 shadow-lg transition-all duration-300 hover:-translate-y-1 hover:shadow-cyan-500/20 ${isClickable ? 'cursor-pointer focus:outline-none focus:ring-2 focus:ring-cyan-400' : ''}`}
    >
      <h3 className="mb-2 text-sm font-semibold uppercase tracking-wider text-slate-400">{title}</h3>

      <div className="mb-4 flex items-baseline gap-1">
        <span className="text-4xl font-bold text-white">{value ?? '—'}</span>
        <span className="text-lg text-slate-400">{unit}</span>
      </div>

      <div className={`rounded-full border px-4 py-1 text-sm font-medium ${
        isCritical
          ? 'border-red-500/30 bg-red-500/20 text-red-400'
          : 'border-emerald-500/30 bg-emerald-500/20 text-emerald-400'
      }`}>
        Durum: {status}
      </div>
    </div>
  );
}

export default SensorCard;