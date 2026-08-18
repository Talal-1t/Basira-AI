import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { FileSpreadsheet, Sparkles, CheckCircle2 } from 'lucide-react';

const ROWS = [
  [62, 40, 78, 30],
  [48, 70, 34, 58],
  [80, 26, 62, 44],
  [36, 54, 90, 28],
  [70, 32, 46, 66],
];

export default function HeroVisual() {
  const { t } = useTranslation();

  return (
    <div className="relative mx-auto w-full max-w-md">
      {/* ambient glow behind the card */}
      <div
        aria-hidden="true"
        className="absolute -inset-10 -z-10 rounded-full bg-primary/15 blur-[80px]"
      />

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        className="relative overflow-hidden rounded-2xl border border-border bg-card shadow-2xl shadow-black/40"
      >
        {/* file header */}
        <div className="flex items-center gap-2.5 border-b border-border px-4 py-3.5">
          <FileSpreadsheet className="size-4 text-primary" strokeWidth={2} />
          <span className="text-xs font-medium text-muted">{t('hero.mock_filename')}</span>
        </div>

        {/* data grid being "read" */}
        <div className="relative space-y-2 p-4">
          {ROWS.map((row, ri) => (
            <div key={ri} className="flex items-center gap-2">
              {row.map((w, ci) => (
                <motion.span
                  key={ci}
                  initial={{ opacity: 0.25 }}
                  animate={{ opacity: [0.25, 1, 0.35] }}
                  transition={{
                    duration: 2.2,
                    repeat: Infinity,
                    repeatDelay: 1.4,
                    delay: ri * 0.18 + ci * 0.06,
                    ease: 'easeInOut',
                  }}
                  className="h-2.5 rounded-full bg-border"
                  style={{ width: `${w}px` }}
                />
              ))}
            </div>
          ))}

          {/* scanning beam sweeping down the grid */}
          <motion.div
            aria-hidden="true"
            initial={{ top: '0%' }}
            animate={{ top: ['0%', '100%', '0%'] }}
            transition={{ duration: 3.6, repeat: Infinity, ease: 'easeInOut' }}
            className="pointer-events-none absolute inset-x-0 h-10 bg-gradient-to-b from-transparent via-primary/25 to-transparent"
          />
        </div>

        {/* status line */}
        <div className="flex items-center gap-2 border-t border-border bg-surface px-4 py-3">
          <CheckCircle2 className="size-3.5 text-primary" strokeWidth={2.5} />
          <span className="text-xs font-medium text-muted">{t('hero.scan_done')}</span>
        </div>
      </motion.div>

      {/* floating AI insight chip */}
      <motion.div
        initial={{ opacity: 0, y: 14, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6, delay: 0.9, ease: [0.16, 1, 0.3, 1] }}
        className="absolute -bottom-8 left-1/2 w-[92%] -translate-x-1/2 rounded-xl border border-border bg-card/95 p-3.5 shadow-xl shadow-black/50 backdrop-blur-sm"
      >
        <div className="flex items-start gap-2.5">
          <span className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full bg-primary/15">
            <Sparkles className="size-3.5 text-primary" strokeWidth={2.25} />
          </span>
          <p className="text-xs leading-relaxed text-text/90">{t('hero.mock_insight')}</p>
        </div>
      </motion.div>
    </div>
  );
}
