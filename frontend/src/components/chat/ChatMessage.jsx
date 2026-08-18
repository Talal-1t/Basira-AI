import { useState } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, TriangleAlert, Copy, Check } from 'lucide-react';
import { cn } from '../../utils/cn';
import { renderChatText } from '../../utils/renderChatText.jsx';

function Timestamp({ date }) {
  const label = date.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
  return <span className="mt-1 block text-[10px] text-muted/70">{label}</span>;
}

export default function ChatMessage({ role, content, isError, timestamp }) {
  const isUser = role === 'user';
  const [copied, setCopied] = useState(false);
  const time = timestamp ? new Date(timestamp) : null;

  function handleCopy() {
    navigator.clipboard?.writeText(content).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  }

  if (isUser) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="ms-auto max-w-[85%] sm:max-w-[70%]"
      >
        <div className="rounded-2xl rounded-ee-sm bg-gradient-to-br from-primary to-primary-hover px-4 py-2.5 text-sm font-medium text-[#052e17] shadow-lg shadow-primary/20">
          {content}
        </div>
        {time && <div className="text-end"><Timestamp date={time} /></div>}
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="group flex max-w-[90%] items-start gap-2.5 sm:max-w-[75%]"
    >
      <span
        className={cn(
          'mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-full ring-1',
          isError ? 'bg-danger/10 ring-danger/30' : 'bg-gradient-to-br from-primary/25 to-accent-violet/10 ring-primary/25'
        )}
      >
        {isError ? (
          <TriangleAlert className="size-3.5 text-danger" strokeWidth={2.25} />
        ) : (
          <Sparkles className="size-3.5 text-primary" strokeWidth={2.25} />
        )}
      </span>
      <div className="min-w-0">
        <div
          className={cn(
            'rounded-2xl rounded-ss-sm border px-4 py-2.5 text-sm shadow-lg shadow-black/10',
            isError
              ? 'border-danger/30 bg-danger/5 text-danger'
              : 'border-border bg-gradient-to-b from-card to-card-2 text-text/90'
          )}
        >
          {isError ? content : renderChatText(content)}
        </div>
        <div className="mt-1 flex items-center gap-2.5 ps-0.5">
          {time && <Timestamp date={time} />}
          {!isError && (
            <button
              onClick={handleCopy}
              className="opacity-0 transition-opacity duration-150 group-hover:opacity-100 text-muted hover:text-text"
              aria-label="Copy"
            >
              {copied ? (
                <Check className="size-3 text-primary" strokeWidth={2.25} />
              ) : (
                <Copy className="size-3" strokeWidth={2} />
              )}
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
}
