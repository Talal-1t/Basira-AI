import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Brain, Send, Sparkles } from 'lucide-react';
import Logo from '../common/Logo.jsx';

export default function ChatPreview() {
  const { t } = useTranslation();

  const suggestions = [
    t('chatPreview.suggested_1'),
    t('chatPreview.suggested_2'),
    t('chatPreview.suggested_3'),
  ];

  return (
    <section id="chat" className="py-24">
      <div className="container-shell grid items-center gap-14 md:grid-cols-2 md:gap-10">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.6 }}
          className="order-2 overflow-hidden rounded-2xl border border-border bg-surface shadow-2xl shadow-black/30 md:order-1"
        >
          <div className="flex items-center gap-2.5 border-b border-border px-4 py-3.5">
            <Logo showWordmark={false} />
            <span className="text-xs font-semibold text-text">Basira</span>
            <span className="ms-auto flex items-center gap-1.5 rounded-full bg-primary/10 px-2.5 py-1 text-[11px] font-medium text-primary">
              <Brain className="size-3" strokeWidth={2.5} />
              AI
            </span>
          </div>

          <div className="space-y-3 p-4">
            <div className="ms-auto max-w-[85%] rounded-2xl rounded-ee-sm bg-primary px-4 py-2.5 text-sm font-medium text-[#052e17]">
              {t('chatPreview.user_msg')}
            </div>

            <div className="flex max-w-[90%] items-start gap-2">
              <span className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full bg-card ring-1 ring-border">
                <Sparkles className="size-3.5 text-primary" strokeWidth={2.25} />
              </span>
              <div className="rounded-2xl rounded-ss-sm border border-border bg-card px-4 py-2.5 text-sm leading-relaxed text-text/90">
                {t('chatPreview.ai_msg')}
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 px-4 pb-3">
            {suggestions.map((s) => (
              <span
                key={s}
                className="rounded-full border border-border px-3 py-1.5 text-xs text-muted"
              >
                {s}
              </span>
            ))}
          </div>

          <div className="flex items-center gap-2 border-t border-border p-3">
            <div className="flex-1 rounded-xl border border-border bg-card px-3.5 py-2.5 text-sm text-muted">
              {t('chatPreview.input_placeholder')}
            </div>
            <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-primary text-[#052e17]">
              <Send className="size-4" strokeWidth={2.25} />
            </span>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="order-1 md:order-2"
        >
          <span className="text-xs font-semibold uppercase tracking-wider text-primary">
            {t('chatPreview.eyebrow')}
          </span>
          <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
            {t('chatPreview.title')}
          </h2>
          <p className="mt-4 max-w-md text-muted">{t('chatPreview.subtitle')}</p>
        </motion.div>
      </div>
    </section>
  );
}
