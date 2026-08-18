import {
  Area,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ComposedChart,
  Line,
  Pie,
  PieChart,
  Scatter,
  ScatterChart,
  Tooltip,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { ChartPie, ChartColumn, ChartLine, ChartScatter } from 'lucide-react';

// A proper qualitative BI palette — green stays the brand anchor, joined by
// violet/amber/rose/cyan so multi-series charts read clearly instead of as
// a single monotone wash.
const PALETTE = ['#22C55E', '#818CF8', '#F59E0B', '#FB7185', '#22D3EE', '#4ADE80', '#A78BFA'];

const TYPE_ICON = { pie: ChartPie, bar: ChartColumn, line: ChartLine, scatter: ChartScatter };

function ChartTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-border bg-surface px-3 py-1.5 text-xs text-text shadow-xl shadow-black/30">
      {label !== undefined && <div className="mb-0.5 text-muted">{label}</div>}
      {payload.map((p, i) => (
        <div key={i}>
          <span className="font-semibold text-primary">
            {typeof p.value === 'number' ? p.value.toLocaleString() : p.value}
          </span>
        </div>
      ))}
    </div>
  );
}

function PieChartView({ chart, height }) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <PieChart>
        <Pie
          data={chart.data}
          dataKey="value"
          nameKey="label"
          innerRadius={height * 0.21}
          outerRadius={height * 0.34}
          paddingAngle={2}
          strokeWidth={0}
        >
          {chart.data.map((_, i) => (
            <Cell key={i} fill={PALETTE[i % PALETTE.length]} />
          ))}
        </Pie>
        <Tooltip content={<ChartTooltip />} />
        <Legend
          formatter={(value) => <span className="text-xs text-muted">{value}</span>}
          iconType="circle"
          iconSize={8}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}

function BarChartView({ chart, height }) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={chart.data} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
        <defs>
          <linearGradient id="barFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#4ADE80" stopOpacity={1} />
            <stop offset="100%" stopColor="#16A34A" stopOpacity={0.85} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#1F2937" vertical={false} />
        <XAxis dataKey="label" tick={{ fill: '#94A3B8', fontSize: 11 }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fill: '#94A3B8', fontSize: 11 }} axisLine={false} tickLine={false} />
        <Tooltip content={<ChartTooltip />} cursor={{ fill: 'rgba(148,163,184,0.06)' }} />
        <Bar dataKey="value" fill="url(#barFill)" radius={[8, 8, 0, 0]} maxBarSize={56} />
      </BarChart>
    </ResponsiveContainer>
  );
}

function LineChartView({ chart, height }) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <ComposedChart data={chart.data} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
        <defs>
          <linearGradient id="lineFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#22C55E" stopOpacity={0.35} />
            <stop offset="100%" stopColor="#22C55E" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#1F2937" vertical={false} />
        <XAxis
          dataKey="x"
          tick={{ fill: '#94A3B8', fontSize: 11 }}
          axisLine={false}
          tickLine={false}
          tickFormatter={(v) => (typeof v === 'string' ? v.slice(0, 10) : v)}
        />
        <YAxis tick={{ fill: '#94A3B8', fontSize: 11 }} axisLine={false} tickLine={false} />
        <Tooltip content={<ChartTooltip />} />
        <Area type="monotone" dataKey="y" stroke="none" fill="url(#lineFill)" />
        <Line type="monotone" dataKey="y" stroke="#22C55E" strokeWidth={2.5} dot={false} activeDot={{ r: 5 }} />
      </ComposedChart>
    </ResponsiveContainer>
  );
}

function ScatterChartView({ chart, height }) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <ScatterChart margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#1F2937" />
        <XAxis
          dataKey="x"
          type="number"
          name={chart.x_column}
          tick={{ fill: '#94A3B8', fontSize: 11 }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          dataKey="y"
          type="number"
          name={chart.y_column}
          tick={{ fill: '#94A3B8', fontSize: 11 }}
          axisLine={false}
          tickLine={false}
        />
        <Tooltip content={<ChartTooltip />} cursor={{ strokeDasharray: '3 3' }} />
        <Scatter data={chart.data} fill="#818CF8" fillOpacity={0.75} />
      </ScatterChart>
    </ResponsiveContainer>
  );
}

const VIEWS = {
  pie: PieChartView,
  bar: BarChartView,
  line: LineChartView,
  scatter: ScatterChartView,
};

export default function ChartCard({ chart, featured = false }) {
  const View = VIEWS[chart.type];
  if (!View) return null;
  const Icon = TYPE_ICON[chart.type];
  const height = featured ? 360 : 260;

  return (
    <div
      className={`rounded-2xl border bg-gradient-to-b from-card to-card-2 p-5 transition-shadow duration-300 ${
        featured
          ? 'border-primary/20 shadow-xl shadow-black/20'
          : 'border-border shadow-lg shadow-black/10 hover:border-white/10'
      }`}
    >
      <div className="flex items-center gap-1.5">
        {Icon && <Icon className="size-3.5 text-primary" strokeWidth={2.25} />}
        <p className={`font-semibold text-text ${featured ? 'text-base' : 'text-sm'}`}>{chart.title}</p>
      </div>
      <div className="mt-3">
        <View chart={chart} height={height} />
      </div>
    </div>
  );
}
