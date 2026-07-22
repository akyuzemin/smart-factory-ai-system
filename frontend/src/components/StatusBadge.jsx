const statusStyles = {
  Çalışıyor: 'border-emerald-500/30 bg-emerald-500/15 text-emerald-400',
  Bakımda: 'border-amber-500/30 bg-amber-500/15 text-amber-400',
  Arızalı: 'border-red-500/30 bg-red-500/15 text-red-400',
  Normal: 'border-emerald-500/30 bg-emerald-500/15 text-emerald-400',
  Kritik: 'border-red-500/30 bg-red-500/15 text-red-400',
  'Veri Yok': 'border-slate-600 bg-slate-700 text-slate-300',
};

function StatusBadge({ status }) {
  const label = status || 'Bilinmiyor';
  const style = statusStyles[label] || 'border-slate-600 bg-slate-700 text-slate-300';

  return <span className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold ${style}`}>{label}</span>;
}

export default StatusBadge;
