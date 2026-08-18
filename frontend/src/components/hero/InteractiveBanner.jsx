import { useEffect, useState } from 'react';
import {
  AnimatePresence,
  motion,
  useMotionTemplate,
  useMotionValue,
  useSpring,
} from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { ArrowRight, Sparkles, Terminal } from 'lucide-react';
import Button from '../common/Button.jsx';

export default function InteractiveBanner() {
  const { t } = useTranslation();
  const ticker = t('banner.ticker', { returnObjects: true });
  const [index, setIndex] = useState(0);

  const mx = useMotionValue(50);
  const my = useMotionValue(30);
  const sx = useSpring(mx, { stiffness: 50, damping: 20, mass: 0.6 });
  const sy = useSpring(my, { stiffness: 50, damping: 20, mass: 0.6 });
  const background = useMotionTemplate`radial-gradient(560px circle at ${sx}% ${sy}%, rgba(34,197,94,0.20), transparent 62%)`;

  useEffect(() => {
    const id = setInterval(() => setIndex((i) => (i + 1) % ticker.length), 2800);
    return () => clearInterval(id);
  }, [ticker.length]);

  function handleMouseMove(e) {
    const rect = e.currentTarget.getBoundingClientRect();
    mx.set(((e.clientX - rect.left) / rect.width) * 100);
    my.set(((e.clientY - rect.top) / rect.height) * 100);
  }

  return (
    <section className="py-8">
      <div className="container-shell">
        <motion.div
          onMouseMove={handleMouseMove}
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.7 }}
          className="relative isolate overflow-hidden rounded-3xl border border-border bg-surface px-6 py-16 text-center sm:px-12 sm:py-20"
        >
          <motion.div aria-hidden="true" className="absolute inset-0 -z-10" style={{ background }} />
          <div aria-hidden="true" className="absolute inset-0 -z-10 grid-glow opacity-60" />

          <span className="inline-flex items-center gap-2 rounded-full border border-border bg-bg/60 px-3.5 py-1.5 text-xs font-medium text-muted">
            <Sparkles className="size-3.5 text-primary" strokeWidth={2.25} />
            {t('banner.eyebrow')}
          </span>

          <h2 className="mx-auto mt-6 max-w-2xl text-3xl font-extrabold leading-tight tracking-tight sm:text-4xl">
            {t('banner.title')}
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-muted">{t('banner.subtitle')}</p>

          {/* interactive command-bar ticker */}
          <div className="mx-auto mt-9 flex max-w-xl items-center gap-3 rounded-2xl border border-border bg-card px-5 py-4 text-start shadow-xl shadow-black/30">
            <Terminal className="size-4 shrink-0 text-primary" strokeWidth={2.25} />
            <div className="relative h-5 flex-1 overflow-hidden">
              <AnimatePresence mode="wait">
                <motion.span
                  key={index}
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -14 }}
                  transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                  className="absolute inset-0 truncate text-sm text-text/90"
                >
                  {ticker[index]}
                </motion.span>
              </AnimatePresence>
            </div>
            <span className="h-4 w-px shrink-0 animate-pulse bg-primary" aria-hidden="true" />
          </div>

          <div className="mt-8">
            <Button size="lg" icon={ArrowRight} iconPosition="end">
              {t('banner.cta')}
            </Button>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
