import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Upload, Brain, MessageSquare, CircleCheck, ArrowRight } from 'lucide-react';

const ICONS = [Upload, Brain, MessageSquare, CircleCheck];

export default function HowItWorks() {
  const { t } = useTranslation();
  const steps = t('howItWorks.steps', { returnObjects: true });

  return (
    <section id="how-it-works" className="py-24">
      <div className="container-shell">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.6 }}
          className="mx-auto max-w-2xl text-center"
        >
          <span className="text-xs font-semibold uppercase tracking-wider text-primary">
            {t('nav.howItWorks')}
          </span>
          <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">{t('howItWorks.title')}</h2>
          <p className="mt-3 text-muted">{t('howItWorks.subtitle')}</p>
        </motion.div>

        <div className="mt-16 flex flex-col items-stretch gap-6 sm:flex-row sm:items-center sm:justify-between">
          {steps.map((step, i) => {
            const Icon = ICONS[i];
            const isLast = i === steps.length - 1;
            return (
              <div key={step.title} className="flex flex-1 items-center gap-4 sm:gap-6">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-60px' }}
                  transition={{ duration: 0.5, delay: i * 0.1 }}
                  className="flex-1 text-center"
                >
                  <div className="mx-auto flex size-14 items-center justify-center rounded-full border border-border bg-surface">
                    <Icon className="size-6 text-primary" strokeWidth={1.8} />
                  </div>
                  <p className="mt-4 text-sm font-semibold text-text">
                    {i + 1}. {step.title}
                  </p>
                  <p className="mt-1.5 text-xs leading-relaxed text-muted">{step.description}</p>
                </motion.div>

                {!isLast && (
                  <ArrowRight
                    className="hidden size-5 shrink-0 text-border sm:block rtl:-scale-x-100"
                    strokeWidth={2}
                    aria-hidden="true"
                  />
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
