import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Sparkles, TriangleAlert, Lightbulb, RefreshCw, Loader2, KeyRound } from 'lucide-react';

function Section({ icon: Icon, title, items }) {
  if (!items?.length) return null;
  return (
    <div>
      <div className="flex items-center gap-1.5 text-text">
        <Icon className="size-3.5 text-primary" strokeWidth={2.25} />
        <p className="text-xs font-semibold">{title}</p>
      </div>
      <ul className="mt-2 space-y-1.5">
        {items.map((item, i) => (
          <li key={i} className="text-xs leading-relaxed text-muted">
            • {item}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function InsightsPanel({ kind, insights, loading, error, errorCode, onRetry }) {
  const { t } = useTranslation();

  return (
    <div className="rounded-2xl border border-border bg-gradient-to-b from-card to-card-2 p-5 shadow-lg shadow-black/10">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <Sparkles className="size-4 text-primary" strokeWidth={2.25} />
          <p className="text-sm font-semibold text-text">{t('dashboardPage.insights.title')}</p>
        </div>
        {!loading && (
          <button
            onClick={() => onRetry(true)}
            className="text-muted transition-colors hover:text-text"
            aria-label={t('dashboardPage.insights.refresh')}
          >
            <RefreshCw className="size-3.5" strokeWidth={2} />
          </button>
        )}
      </div>

      {loading && (
        <div className="mt-4 flex items-center gap-2 text-xs text-muted">
          <Loader2 className="size-3.5 animate-spin text-primary" strokeWidth={2} />
          {t('dashboardPage.insights.loading')}
        </div>
      )}

      {!loading && errorCode === 'ai_not_configured' && (
        <div className="mt-4 rounded-xl border border-border bg-bg/60 p-4 text-center">
          <KeyRound className="mx-auto size-5 text-muted" strokeWidth={1.8} />
          <p className="mt-2 text-xs leading-relaxed text-muted">
            {t('dashboardPage.insights.notConfigured')}
          </p>
        </div>
      )}

      {!loading && error && errorCode !== 'ai_not_configured' && (
        <div className="mt-4 text-center">
          <p className="text-xs text-danger">{error}</p>
          <button
            onClick={() => onRetry(false)}
            className="mt-2 text-xs font-medium text-primary hover:text-primary-hover"
          >
            {t('dashboardPage.insights.retry')}
          </button>
        </div>
      )}

      {!loading && !error && insights && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="mt-4 space-y-4"
        >
          {insights.summary && (
            <p className="text-xs leading-relaxed text-text/90">{insights.summary}</p>
          )}
          <Section
            icon={Lightbulb}
            title={t('dashboardPage.insights.keyPoints')}
            items={insights.key_points}
          />
          {kind === 'tabular' ? (
            <>
              <Section
                icon={TriangleAlert}
                title={t('dashboardPage.insights.anomalies')}
                items={insights.anomalies}
              />
              <Section
                icon={Sparkles}
                title={t('dashboardPage.insights.recommendations')}
                items={insights.recommendations}
              />
            </>
          ) : (
            <>
              <Section
                icon={TriangleAlert}
                title={t('dashboardPage.insights.importantNumbers')}
                items={insights.important_numbers}
              />
              {insights.faq?.length > 0 && (
                <div>
                  <div className="flex items-center gap-1.5 text-text">
                    <Sparkles className="size-3.5 text-primary" strokeWidth={2.25} />
                    <p className="text-xs font-semibold">{t('dashboardPage.insights.faq')}</p>
                  </div>
                  <ul className="mt-2 space-y-2.5">
                    {insights.faq.map((qa, i) => (
                      <li key={i}>
                        <p className="text-xs font-medium text-text">{qa.question}</p>
                        <p className="mt-0.5 text-xs leading-relaxed text-muted">{qa.answer}</p>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </>
          )}
        </motion.div>
      )}
    </div>
  );
}
