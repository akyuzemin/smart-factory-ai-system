import { RadialBar, RadialBarChart, ResponsiveContainer } from 'recharts';

function RiskGauge({ score }) {
  const getRiskColor = () => {
    if (score > 80) return '#ef4444'; // red-500
    if (score > 60) return '#f59e0b'; // amber-500
    return '#10b981'; // emerald-500
  };

  const data = [{ name: 'Risk', value: score }];

  return (
    <div className="relative h-64 w-64">
      <ResponsiveContainer width="100%" height="100%">
        <RadialBarChart
          innerRadius="80%"
          outerRadius="100%"
          data={data}
          startAngle={180}
          endAngle={-180}
          barSize={20}
        >
          <RadialBar
            background={{ fill: '#334155' }} // slate-700
            dataKey="value"
            cornerRadius={10}
            fill={getRiskColor()}
          />
        </RadialBarChart>
      </ResponsiveContainer>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center">
        <p className="text-5xl font-bold" style={{ color: getRiskColor() }}>
          {score}
        </p>
        <p className="text-sm font-semibold uppercase tracking-widest text-slate-400">Risk Skoru</p>
      </div>
    </div>
  );
}

export default RiskGauge;