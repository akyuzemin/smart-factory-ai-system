import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

const mockEfficiencyData = [
  { time: '08:00', efficiency: 95.2 },
  { time: '09:00', efficiency: 96.1 },
  { time: '10:00', efficiency: 94.5 },
  { time: '11:00', efficiency: 97.0 },
  { time: '12:00', efficiency: 96.8 },
  { time: '13:00', efficiency: 97.5 },
  { time: '14:00', efficiency: 95.9 },
];

function CustomTooltip({ active, payload, label }) {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-lg border border-slate-700 bg-slate-800/80 p-2 text-sm shadow-lg backdrop-blur-sm">
        <p className="font-bold text-slate-200">{`Saat ${label}: %${payload[0].value}`}</p>
      </div>
    );
  }
  return null;
}

function EfficiencyChart() {
  return (
    <div className="h-72 rounded-2xl border border-slate-800 bg-slate-900/80 p-4 shadow-xl">
      <h3 className="px-2 font-semibold text-white">Üretim Verimliliği (%)</h3>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={mockEfficiencyData} margin={{ top: 30, right: 20, left: -10, bottom: 10 }}>
          <defs>
            <linearGradient id="efficiencyColor" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.7} />
              <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
          <XAxis dataKey="time" tick={{ fill: '#94a3b8' }} tickLine={{ stroke: '#94a3b8' }} axisLine={{ stroke: '#475569' }} />
          <YAxis domain={[90, 100]} tick={{ fill: '#94a3b8' }} tickLine={{ stroke: '#94a3b8' }} axisLine={{ stroke: '#475569' }} />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(148, 163, 184, 0.1)' }} />
          <Area type="monotone" dataKey="efficiency" stroke="#38bdf8" fillOpacity={1} fill="url(#efficiencyColor)" strokeWidth={2} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

export default EfficiencyChart;