import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Send, Sparkles, KeyRound, Loader2 } from 'lucide-react';
import ChatMessage from './ChatMessage.jsx';

const MAX_TEXTAREA_HEIGHT = 160;

export default function ChatWindow({ messages, sending, notConfigured, onSend, suggestions }) {
  const { t } = useTranslation();
  const [value, setValue] = useState('');
  const bottomRef = useRef(null);
  const textareaRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [messages, sending]);

  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${Math.min(el.scrollHeight, MAX_TEXTAREA_HEIGHT)}px`;
  }, [value]);

  function submit(e) {
    e?.preventDefault();
    const question = value.trim();
    if (!question || sending || notConfigured) return;
    setValue('');
    onSend(question);
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      submit();
    }
  }

  return (
    <div className="relative flex h-[calc(100vh-4rem)] flex-col overflow-hidden">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10 grid-glow opacity-30" />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-96 bg-gradient-to-b from-primary/[0.06] to-transparent"
      />

      <div className="flex-1 overflow-y-auto">
        <div className="container-shell max-w-3xl py-8">
          {messages.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col items-center justify-center gap-4 py-20 text-center"
            >
              <span className="flex size-12 items-center justify-center rounded-full bg-gradient-to-br from-primary/25 to-primary/5 ring-1 ring-primary/20">
                <Sparkles className="size-5 text-primary" strokeWidth={1.9} />
              </span>
              <div>
                <p className="text-lg font-semibold text-text">{t('chatPage.emptyTitle')}</p>
                <p className="mt-1.5 text-sm text-muted">{t('chatPage.emptySubtitle')}</p>
              </div>
              {suggestions?.length > 0 && !notConfigured && (
                <div className="mt-2 flex flex-wrap justify-center gap-2">
                  {suggestions.map((s) => (
                    <button
                      key={s}
                      onClick={() => onSend(s)}
                      className="rounded-full border border-border px-3.5 py-2 text-xs text-muted transition-colors hover:border-primary/40 hover:text-text"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              )}
            </motion.div>
          ) : (
            <div className="space-y-5">
              {messages.map((m, i) => (
                <ChatMessage key={i} role={m.role} content={m.content} isError={m.isError} timestamp={m.timestamp} />
              ))}
              {sending && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-2.5">
                  <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary/20 to-primary/5 ring-1 ring-primary/25">
                    <Loader2 className="size-3.5 animate-spin text-primary" strokeWidth={2.25} />
                  </span>
                  <span className="text-xs text-muted">{t('chatPage.thinking')}</span>
                </motion.div>
              )}
              <div ref={bottomRef} />
            </div>
          )}
        </div>
      </div>

      <div className="border-t border-border bg-gradient-to-t from-bg via-bg/95 to-bg/80 backdrop-blur-md">
        <div className="container-shell max-w-3xl py-4">
          {notConfigured ? (
            <div className="flex items-center gap-2.5 rounded-xl border border-border bg-card px-4 py-3 text-xs text-muted">
              <KeyRound className="size-4 shrink-0 text-muted" strokeWidth={1.8} />
              {t('chatPage.notConfigured')}
            </div>
          ) : (
            <form
              onSubmit={submit}
              className="flex items-end gap-2 rounded-2xl border border-border bg-card p-2 shadow-lg shadow-black/10 transition-colors duration-150 focus-within:border-primary/50"
            >
              <textarea
                ref={textareaRef}
                rows={1}
                value={value}
                onChange={(e) => setValue(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={t('chatPreview.input_placeholder')}
                disabled={sending}
                className="max-h-40 flex-1 resize-none bg-transparent px-2.5 py-2 text-sm text-text placeholder:text-muted focus:outline-none disabled:opacity-60"
              />
              <button
                type="submit"
                disabled={sending || !value.trim()}
                className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-primary text-[#052e17] transition-all duration-150 hover:bg-primary-hover hover:scale-105 disabled:opacity-40 disabled:hover:scale-100"
                aria-label="Send"
              >
                <Send className="size-4 rtl:-scale-x-100" strokeWidth={2.25} />
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
