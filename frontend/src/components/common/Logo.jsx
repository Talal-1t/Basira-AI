import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { cn } from '../../utils/cn';

export default function Logo({ className, showWordmark = true }) {
  const { i18n } = useTranslation();
  const isAr = i18n.resolvedLanguage === 'ar';

  return (
    <div className={cn('flex items-center gap-2.5', className)}>
      <span className="flex size-8 items-center justify-center rounded-lg bg-primary/12 ring-1 ring-primary/25">
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
          <motion.rect
            x="1.5" width="3.4" rx="1"
            fill="#22C55E" fillOpacity="0.55"
            initial={{ y: 12, height: 3 }}
            animate={{ y: [12, 8, 12], height: [3, 7, 3] }}
            transition={{ duration: 2.6, repeat: Infinity, ease: 'easeInOut', delay: 0 }}
          />
          <motion.rect
            x="7.3" width="3.4" rx="1"
            fill="#22C55E"
            initial={{ y: 6, height: 9 }}
            animate={{ y: [6, 2, 6], height: [9, 13, 9] }}
            transition={{ duration: 2.6, repeat: Infinity, ease: 'easeInOut', delay: 0.25 }}
          />
          <motion.rect
            x="13.1" width="3.4" rx="1"
            fill="#22C55E" fillOpacity="0.8"
            initial={{ y: 9, height: 6 }}
            animate={{ y: [9, 4, 9], height: [6, 11, 6] }}
            transition={{ duration: 2.6, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
          />
        </svg>
      </span>
      {showWordmark && (
        <span className="text-[17px] font-bold tracking-tight text-text">
          {isAr ? (
            <>
              بصيرة <span className="text-primary">AI</span>
            </>
          ) : (
            <>
              Basira <span className="text-primary">AI</span>
            </>
          )}
        </span>
      )}
    </div>
  );
}
