import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import {
  ChartColumn,
  Database,
  FileText,
  MessageSquare,
  Sparkles,
  Languages,
} from 'lucide-react';

const ICONS = [Database, ChartColumn, FileText, MessageSquare, Sparkles, Languages];

export default function FeatureCards() {
  const { t } = useTranslation();
  const items = t('features.items', { returnObjects: true });

  return (
    <section id="features" className="py-24">
      <div className="container-shell">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.6 }}
          className="mx-auto max-w-2xl text-center"
        >
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">{t('features.title')}</h2>
          <p className="mt-3 text-muted">{t('features.subtitle')}</p>
        </motion.div>

        <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item, i) => {
            const Icon = ICONS[i % ICONS.length];
            return (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-60px' }}
                whileHover={{ y: -6 }}
                transition={{ duration: 0.5, delay: (i % 3) * 0.08 }}
                className="group rounded-2xl border border-border bg-card p-6 transition-colors duration-200 hover:border-primary/40 hover:shadow-lg hover:shadow-primary/5"
              >
                <div className="flex size-11 items-center justify-center rounded-xl bg-primary/10 transition-transform duration-300 group-hover:scale-110 group-hover:bg-primary/15">
                  <Icon className="size-5 text-primary" strokeWidth={1.9} />
                </div>
                <h3 className="mt-5 text-base font-semibold text-text">{item.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted">{item.description}</p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
