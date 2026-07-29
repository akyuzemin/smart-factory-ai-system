import { CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

const mockSensorHistory = Array.from({ length: 24 }, (_, i) => ({
  hour: `-${24 - i}s`,
  value: 65 + Math.random() * 10 + (i > 18 ? Math.random() * 15 : 0), // Simulate a spike
}));

function CustomTooltip({ active, payload, label }) {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-lg border border-slate-700 bg-slate-800/80 p-2 text-sm shadow-lg backdrop-blur-sm">
        <p className="font-bold text-slate-200">{`Değer: ${payload[0].value.toFixed(2)}`}</p>
      </div>
    );
  }
  return null;
}

function SensorHistoryChart() {
  return (
    <div className="h-72 rounded-2xl border border-slate-800 bg-slate-900/80 p-4 shadow-xl">
      <h3 className="px-2 font-semibold text-white">Son 24 Saat Sensör Verisi</h3>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={mockSensorHistory} margin={{ top: 30, right: 20, left: -20, bottom: 10 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
          <XAxis
            dataKey="hour"
            tick={{ fill: '#94a3b8', fontSize: 10 }}
            tickLine={{ stroke: '#94a3b8' }}
            axisLine={{ stroke: '#475569' }}
            interval={5}
          />
          <YAxis tick={{ fill: '#94a3b8' }} tickLine={{ stroke: '#94a3b8' }} axisLine={{ stroke: '#475569' }} />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(148, 163, 184, 0.1)' }} />
          <Legend wrapperStyle={{ fontSize: '14px' }} />
          <Line type="monotone" dataKey="value" name="Motor Sıcaklığı" stroke="#10b981" strokeWidth={2} dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

export default SensorHistoryChart;