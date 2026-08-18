import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import {
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
} from 'recharts';
import { CheckCircle2, Sparkles } from 'lucide-react';
import AnimatedNumber from '../common/AnimatedNumber.jsx';

const SALES_TREND = [8, 11, 10, 15, 14, 19, 18, 23, 21, 27, 26, 31].map((v, i) => ({
  m: i,
  v,
}));

// A restrained, single-hue data-viz palette derived from the brand token
// (primary green at decreasing opacity) rather than introducing new hues.
const DONUT_COLORS = ['#22C55E', '#16A34A', '#0F7A38', '#1F2937'];

function StatCell({ label, target, format, className }) {
  return (
    <div className="rounded-lg border border-border bg-bg/60 px-3 py-2.5">
      <p className="text-[11px] text-muted">{label}</p>
      <p className={`mt-1 text-base font-bold text-text ${className || ''}`}>
        <AnimatedNumber value={target} format={format} />
      </p>
    </div>
  );
}

export default function DashboardMockup() {
  const { t } = useTranslation();
  const categories = t('dashboardMock.categories', { returnObjects: true });
  const checklist = t('dashboardMock.checklist', { returnObjects: true });
  const qualityScore = 96;

  return (
    <div className="relative w-full">
      <div
        aria-hidden="true"
        className="absolute -inset-12 -z-10 rounded-full bg-primary/10 blur-[100px]"
      />

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        className="overflow-hidden rounded-2xl border border-border bg-surface shadow-2xl shadow-black/40"
      >
        {/* window chrome */}
        <div className="flex items-center gap-1.5 border-b border-border px-4 py-3">
          <span className="size-2.5 rounded-full bg-danger/70" />
          <span className="size-2.5 rounded-full bg-warning/70" />
          <span className="size-2.5 rounded-full bg-primary/70" />
        </div>

        <div className="grid gap-3 p-4 md:grid-cols-5">
          {/* left column: overview + AI insight */}
          <div className="space-y-3 md:col-span-2">
            <div className="rounded-xl border border-border bg-card p-3.5">
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold text-text">{t('dashboardMock.overview')}</p>
                <span className="flex items-center gap-1.5">
                  <span className="relative flex size-1.5">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75" />
                    <span className="relative inline-flex size-1.5 rounded-full bg-primary" />
                  </span>
                  <span className="text-[10px] font-medium text-primary">Live</span>
                </span>
              </div>
              <div className="mt-3 grid grid-cols-2 gap-2">
                <StatCell
                  label={t('dashboardMock.rows')}
                  target={12580}
                  format={(v) => Math.round(v).toLocaleString()}
                />
                <StatCell label={t('dashboardMock.columns')} target={24} />
                <StatCell
                  label={t('dashboardMock.missing')}
                  target={3.2}
                  format={(v) => `${v.toFixed(1)}%`}
                />
                <StatCell
                  label={t('dashboardMock.time')}
                  target={2.4}
                  format={(v) => `${v.toFixed(1)}s`}
                />
              </div>
            </div>

            <div className="rounded-xl border border-border bg-card p-3.5">
              <div className="flex items-center gap-1.5">
                <Sparkles className="size-3.5 text-primary" strokeWidth={2.25} />
                <p className="text-xs font-semibold text-text">
                  {t('dashboardMock.insightsTitle')}
                </p>
              </div>
              <p className="mt-2 text-[11px] leading-relaxed text-muted">
                {t('dashboardMock.insightsText')}
              </p>
            </div>
          </div>

          {/* right column: sales trend line */}
          <div className="rounded-xl border border-border bg-card p-3.5 md:col-span-3">
            <p className="text-xs font-semibold text-text">{t('dashboardMock.salesTrendTitle')}</p>
            <div className="mt-2 h-[104px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={SALES_TREND} margin={{ top: 6, right: 4, bottom: 0, left: 4 }}>
                  <Line
                    type="monotone"
                    dataKey="v"
                    stroke="#22C55E"
                    strokeWidth={2.25}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* bottom row: category donut + quality donut */}
          <div className="flex items-center gap-3 rounded-xl border border-border bg-card p-3.5 md:col-span-3">
            <div className="h-20 w-20 shrink-0">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categories}
                    dataKey="value"
                    nameKey="label"
                    innerRadius={26}
                    outerRadius={38}
                    strokeWidth={0}
                  >
                    {categories.map((_, i) => (
                      <Cell key={i} fill={DONUT_COLORS[i % DONUT_COLORS.length]} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="min-w-0 flex-1">
              <p className="mb-1.5 text-[11px] font-semibold text-text">
                {t('dashboardMock.topCategoriesTitle')}
              </p>
              <ul className="space-y-1">
                {categories.map((c, i) => (
                  <li key={c.label} className="flex items-center justify-between gap-2 text-[11px]">
                    <span className="flex items-center gap-1.5 text-muted">
                      <span
                        className="size-1.5 rounded-full"
                        style={{ backgroundColor: DONUT_COLORS[i % DONUT_COLORS.length] }}
                      />
                      {c.label}
                    </span>
                    <span className="font-medium text-text">{c.value}%</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="flex items-center gap-3 rounded-xl border border-border bg-card p-3.5 md:col-span-2">
            <div className="relative h-20 w-20 shrink-0">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={[
                      { value: qualityScore },
                      { value: 100 - qualityScore },
                    ]}
                    dataKey="value"
                    innerRadius={26}
                    outerRadius={38}
                    startAngle={90}
                    endAngle={-270}
                    strokeWidth={0}
                  >
                    <Cell fill="#22C55E" />
                    <Cell fill="#1F2937" />
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-sm font-bold text-text">{qualityScore}%</span>
              </div>
            </div>
            <div className="min-w-0 flex-1">
              <p className="mb-1.5 text-[11px] font-semibold text-text">
                {t('dashboardMock.dataQualityTitle')}
              </p>
              <ul className="space-y-1">
                {checklist.slice(0, 3).map((item) => (
                  <li key={item} className="flex items-center gap-1.5 text-[11px] text-muted">
                    <CheckCircle2 className="size-3 shrink-0 text-primary" strokeWidth={2.5} />
                    <span className="truncate">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
