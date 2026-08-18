import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis } from 'recharts';
import { Sparkles, Rows3, Columns3, CircleAlert, Copy } from 'lucide-react';
import AnimatedNumber from '../common/AnimatedNumber.jsx';

const CHART_DATA = [
  { region: 'North', value: 42 },
  { region: 'South', value: 58 },
  { region: 'East', value: 91 },
  { region: 'West', value: 66 },
];

function StatCard({ icon: Icon, label, target, format }) {
  return (
    <motion.div
      whileHover={{ y: -3 }}
      className="rounded-xl border border-border bg-card p-4 transition-colors duration-200 hover:border-primary/40"
    >
      <div className="flex items-center gap-2 text-muted">
        <Icon className="size-3.5" strokeWidth={2} />
        <span className="text-xs font-medium">{label}</span>
      </div>
      <p className="mt-2 text-xl font-bold text-text">
        <AnimatedNumber value={target} format={format} />
      </p>
    </motion.div>
  );
}

function ChartTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-border bg-surface px-3 py-1.5 text-xs text-text shadow-lg">
      {label}: <span className="font-semibold text-primary">{payload[0].value}</span>
    </div>
  );
}

export default function DashboardPreview() {
  const { t } = useTranslation();

  return (
    <section id="dashboard" className="py-24">
      <div className="container-shell grid items-center gap-14 md:grid-cols-2 md:gap-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.6 }}
        >
          <span className="text-xs font-semibold uppercase tracking-wider text-primary">
            {t('dashboardPreview.eyebrow')}
          </span>
          <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
            {t('dashboardPreview.title')}
          </h2>
          <p className="mt-4 max-w-md text-muted">{t('dashboardPreview.subtitle')}</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="rounded-2xl border border-border bg-surface p-5 shadow-2xl shadow-black/30 sm:p-6"
        >
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <StatCard
              icon={Rows3}
              label={t('dashboardPreview.card_rows')}
              target={12480}
              format={(v) => Math.round(v).toLocaleString()}
            />
            <StatCard icon={Columns3} label={t('dashboardPreview.card_columns')} target={18} />
            <StatCard
              icon={CircleAlert}
              label={t('dashboardPreview.card_missing')}
              target={0.4}
              format={(v) => `${v.toFixed(1)}%`}
            />
            <StatCard icon={Copy} label={t('dashboardPreview.card_duplicates')} target={12} />
          </div>

          <div className="mt-5 rounded-xl border border-border bg-card p-4">
            <p className="mb-3 text-xs font-medium text-muted">{t('dashboardPreview.chart_title')}</p>
            <div className="h-40">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={CHART_DATA} barSize={28}>
                  <XAxis
                    dataKey="region"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#94A3B8', fontSize: 11 }}
                  />
                  <Tooltip content={<ChartTooltip />} cursor={{ fill: 'rgba(148,163,184,0.06)' }} />
                  <Bar dataKey="value" fill="#22C55E" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="mt-4 flex items-start gap-2.5 rounded-xl border border-border bg-card p-4">
            <span className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full bg-primary/15">
              <Sparkles className="size-3.5 text-primary" strokeWidth={2.25} />
            </span>
            <div>
              <p className="text-xs font-semibold text-text">{t('dashboardPreview.insight_title')}</p>
              <p className="mt-1 text-xs leading-relaxed text-muted">
                {t('dashboardPreview.insight_text')}
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
