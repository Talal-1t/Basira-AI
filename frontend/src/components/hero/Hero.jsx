import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Sparkles } from 'lucide-react';

export default function Hero() {
  const { t } = useTranslation();

  return (
    <section id="top" className="relative overflow-hidden pb-16 pt-20 md:pt-28">
      <div aria-hidden="true" className="absolute inset-0 -z-10 grid-glow" />
      <div
        aria-hidden="true"
        className="absolute left-1/2 top-0 -z-10 h-72 w-[36rem] -translate-x-1/2 rounded-full bg-primary/10 blur-[100px]"
      />

      <div className="container-shell text-center">
        <motion.span
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2 rounded-full border border-border bg-surface px-3.5 py-1.5 text-xs font-medium text-muted"
        >
          <Sparkles className="size-3.5 text-primary" strokeWidth={2.1} />
          {t('hero.eyebrow')}
        </motion.span>

        <motion.h1
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="mx-auto mt-5 max-w-2xl text-4xl font-extrabold leading-[1.15] tracking-tight sm:text-5xl"
        >
          {t('hero.headline_1')} <span className="text-gradient">{t('hero.headline_2')}</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mx-auto mt-4 max-w-lg text-base leading-relaxed text-muted sm:text-lg"
        >
          {t('hero.subheadline')}
        </motion.p>
      </div>
    </section>
  );
}
