import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Rows3, Columns3, CircleAlert, Copy, Loader2, MessageSquareText, ChartColumn } from 'lucide-react';

import AppTopBar from '../components/layout/AppTopBar.jsx';
import AmbientBackground from '../components/common/AmbientBackground.jsx';
import ReportHeader from '../components/dashboard/ReportHeader.jsx';
import KpiCard from '../components/dashboard/KpiCard.jsx';
import QualityGauge from '../components/dashboard/QualityGauge.jsx';
import ColumnsPanel from '../components/dashboard/ColumnsPanel.jsx';
import ChartCard from '../components/dashboard/ChartCard.jsx';
import InsightsPanel from '../components/dashboard/InsightsPanel.jsx';
import PdfPreview from '../components/dashboard/PdfPreview.jsx';

import { useFileDashboard } from '../hooks/useFileDashboard.js';
import { useInsights } from '../hooks/useInsights.js';

function computeQualityScore(stats) {
  const missingPenalty = stats.missing_values.percent_of_cells;
  const duplicateRatio = stats.shape.rows > 0 ? stats.duplicate_rows / stats.shape.rows : 0;
  const duplicatePenalty = Math.min(duplicateRatio * 100, 20);
  return Math.max(0, Math.round(100 - missingPenalty - duplicatePenalty));
}

function statusFor(value, { warnAt, badAt, invert = false }) {
  const bad = invert ? value < badAt : value > badAt;
  const warn = invert ? value < warnAt : value > warnAt;
  if (bad) return 'bad';
  if (warn) return 'warning';
  return 'good';
}

export default function Dashboard() {
  const { fileId } = useParams();
  const { t } = useTranslation();
  const { data, loading, error, reload } = useFileDashboard(fileId);
  const insightsState = useInsights(fileId);

  if (loading) {
    return (
      <div className="relative min-h-screen bg-bg text-text">
        <AmbientBackground />
        <AppTopBar />
        <div className="container-shell flex min-h-[70vh] flex-col items-center justify-center gap-3 text-center">
          <Loader2 className="size-6 animate-spin text-primary" strokeWidth={2} />
          <p className="text-sm text-muted">{t('dashboardPage.loadingFile')}</p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="relative min-h-screen bg-bg text-text">
        <AmbientBackground />
        <AppTopBar />
        <div className="container-shell flex min-h-[70vh] flex-col items-center justify-center gap-3 text-center">
          <p className="text-sm text-danger">{error || t('dashboardPage.errorLoading')}</p>
          <div className="flex gap-3">
            <button onClick={reload} className="text-sm font-medium text-primary hover:text-primary-hover">
              {t('dashboardPage.retryLoad')}
            </button>
            <Link to="/#upload" className="text-sm font-medium text-muted hover:text-text">
              {t('dashboardPage.newFile')}
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const { meta, stats, charts, extraction } = data;
  const isTabular = meta.kind === 'tabular';
  const qualityScore = isTabular ? computeQualityScore(stats) : null;
  const [featuredChart, ...restCharts] = charts || [];

  return (
    <div className="relative min-h-screen bg-bg text-text">
      <AmbientBackground />
      <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-16 -z-10 h-72 grid-glow opacity-40" />
      <AppTopBar />

      <main className="container-shell py-8">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
          <ReportHeader meta={meta} />
        </motion.div>

        <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_340px]">
          <div className="space-y-6">
            {isTabular && (
              <>
                <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.05 }}
                  className="grid grid-cols-2 gap-3 sm:grid-cols-5"
                >
                  <KpiCard
                    icon={Rows3}
                    label={t('dashboardPage.overview.rows')}
                    target={stats.shape.rows}
                    format={(v) => Math.round(v).toLocaleString()}
                  />
                  <KpiCard icon={Columns3} label={t('dashboardPage.overview.columns')} target={stats.shape.columns} />
                  <KpiCard
                    icon={CircleAlert}
                    label={t('dashboardPage.overview.missing')}
                    target={stats.missing_values.percent_of_cells}
                    format={(v) => `${v.toFixed(1)}%`}
                    status={statusFor(stats.missing_values.percent_of_cells, { warnAt: 5, badAt: 15 })}
                  />
                  <KpiCard
                    icon={Copy}
                    label={t('dashboardPage.overview.duplicates')}
                    target={stats.duplicate_rows}
                    status={statusFor(stats.duplicate_rows, { warnAt: 0, badAt: stats.shape.rows * 0.1 })}
                  />
                  <div className="col-span-2 flex items-center justify-center rounded-xl border border-border bg-card p-3 sm:col-span-1">
                    <QualityGauge score={qualityScore} size={64} />
                  </div>
                </motion.div>

                <div>
                  <div className="mb-3 flex items-center gap-1.5">
                    <ChartColumn className="size-4 text-primary" strokeWidth={2.25} />
                    <p className="text-sm font-semibold text-text">{t('dashboardPage.charts.title')}</p>
                  </div>
                  {charts?.length > 0 ? (
                    <div className="space-y-5">
                      {featuredChart && (
                        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.1 }}>
                          <ChartCard chart={featuredChart} featured />
                        </motion.div>
                      )}
                      {restCharts.length > 0 && (
                        <div className="grid gap-5 sm:grid-cols-2">
                          {restCharts.map((chart, i) => (
                            <motion.div
                              key={i}
                              initial={{ opacity: 0, y: 16 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ duration: 0.4, delay: 0.16 + i * 0.06 }}
                            >
                              <ChartCard chart={chart} />
                            </motion.div>
                          ))}
                        </div>
                      )}
                    </div>
                  ) : (
                    <p className="text-sm text-muted">{t('dashboardPage.charts.empty')}</p>
                  )}
                </div>

                <ColumnsPanel columnTypes={stats.column_types} />
              </>
            )}

            {!isTabular && extraction && <PdfPreview extraction={extraction} />}
          </div>

          <div className="space-y-5 lg:sticky lg:top-24 lg:self-start">
            <InsightsPanel
              kind={meta.kind}
              insights={insightsState.insights}
              loading={insightsState.loading}
              error={insightsState.error}
              errorCode={insightsState.errorCode}
              onRetry={insightsState.reload}
            />

            <Link
              to={`/chat/${fileId}`}
              className="group flex flex-col items-center rounded-2xl border border-border bg-card p-5 text-center transition-colors duration-200 hover:border-primary/40"
            >
              <span className="flex size-10 items-center justify-center rounded-full bg-primary/10 transition-transform duration-200 group-hover:scale-105">
                <MessageSquareText className="size-5 text-primary" strokeWidth={1.8} />
              </span>
              <p className="mt-3 text-xs font-semibold text-text">{t('dashboardPage.chatCta')}</p>
              <p className="mt-1 text-[11px] text-muted">{t('dashboardPage.chatSubtitle')}</p>
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
