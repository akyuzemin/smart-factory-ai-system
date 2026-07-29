import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

const mockAlarmData = [
  { day: 'Pzt', count: 5 },
  { day: 'Sal', count: 8 },
  { day: 'Çar', count: 4 },
  { day: 'Per', count: 12 },
  { day: 'Cum', count: 7 },
  { day: 'Cmt', count: 9 },
  { day: 'Paz', count: 6 },
];

function CustomTooltip({ active, payload, label }) {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-lg border border-slate-700 bg-slate-800/80 p-2 text-sm shadow-lg backdrop-blur-sm">
        <p className="font-bold text-slate-200">{`${label}: ${payload[0].value} Alarm`}</p>
      </div>
    );
  }
  return null;
}

function AlarmTrendChart() {
  return (
    <div className="h-72 rounded-2xl border border-slate-800 bg-slate-900/80 p-4 shadow-xl">
      <h3 className="px-2 font-semibold text-white">Son 7 Günlük Alarm Sayısı</h3>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={mockAlarmData} margin={{ top: 30, right: 20, left: -20, bottom: 10 }}>
          <defs>
            <linearGradient id="alarmColor" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.7} />
              <stop offset="95%" stopColor="#f43f5e" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
          <XAxis dataKey="day" tick={{ fill: '#94a3b8' }} tickLine={{ stroke: '#94a3b8' }} axisLine={{ stroke: '#475569' }} />
          <YAxis tick={{ fill: '#94a3b8' }} tickLine={{ stroke: '#94a3b8' }} axisLine={{ stroke: '#475569' }} />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(148, 163, 184, 0.1)' }} />
          <Area type="monotone" dataKey="count" stroke="#fb7185" fillOpacity={1} fill="url(#alarmColor)" strokeWidth={2} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

export default AlarmTrendChart;