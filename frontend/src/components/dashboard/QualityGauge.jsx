import { Cell, Pie, PieChart, ResponsiveContainer } from 'recharts';

function scoreColor(score) {
  if (score >= 80) return '#22C55E';
  if (score >= 50) return '#F59E0B';
  return '#EF4444';
}

export default function QualityGauge({ score, label, size = 84 }) {
  const clamped = Math.max(0, Math.min(100, score));
  const color = scoreColor(clamped);

  return (
    <div className="flex items-center gap-3">
      <div className="relative shrink-0" style={{ width: size, height: size }}>
        <div
          aria-hidden="true"
          className="absolute inset-0 rounded-full opacity-30 blur-md"
          style={{ backgroundColor: color }}
        />
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={[{ value: clamped }, { value: 100 - clamped }]}
              dataKey="value"
              innerRadius={size * 0.34}
              outerRadius={size * 0.48}
              startAngle={90}
              endAngle={-270}
              cornerRadius={6}
              strokeWidth={0}
            >
              <Cell fill={color} />
              <Cell fill="#1F2937" />
            </Pie>
          </PieChart>
        </ResponsiveContainer>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-sm font-bold text-text">{Math.round(clamped)}%</span>
        </div>
      </div>
      {label && <p className="text-xs font-medium text-muted">{label}</p>}
    </div>
  );
}
