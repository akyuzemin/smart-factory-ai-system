import { Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';

const mockRiskData = [
  { name: 'Normal', value: 400, color: '#10b981' },
  { name: 'Uyarı', value: 300, color: '#f59e0b' },
  { name: 'Kritik', value: 150, color: '#ef4444' },
];

function CustomTooltip({ active, payload }) {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-lg border border-slate-700 bg-slate-800/80 p-2 text-sm shadow-lg backdrop-blur-sm">
        <p className="font-bold text-slate-200">{`${payload[0].name}: ${payload[0].value}`}</p>
      </div>
    );
  }
  return null;
}

function RiskDistributionChart() {
  return (
    <div className="h-72 rounded-2xl border border-slate-800 bg-slate-900/80 p-4 shadow-xl">
      <h3 className="px-2 font-semibold text-white">Risk Dağılımı</h3>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart margin={{ top: 20, right: 20, left: 20, bottom: 20 }}>
          <Pie data={mockRiskData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} labelLine={false}>
            {mockRiskData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} stroke={entry.color} />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          <Legend
            wrapperStyle={{ fontSize: '14px', color: '#94a3b8' }}
            formatter={(value, entry) => <span style={{ color: '#cbd5e1' }}>{value}</span>}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}

export default RiskDistributionChart;