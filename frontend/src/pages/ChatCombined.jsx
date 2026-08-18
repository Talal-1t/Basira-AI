import { useCallback, useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, Loader2, Layers } from 'lucide-react';

import AppTopBar from '../components/layout/AppTopBar.jsx';
import AmbientBackground from '../components/common/AmbientBackground.jsx';
import ChatWindow from '../components/chat/ChatWindow.jsx';
import { getFile, askCombinedQuestion } from '../services/api.js';

export default function ChatCombined() {
  const [searchParams] = useSearchParams();
  const { t } = useTranslation();
  const fileIds = (searchParams.get('ids') || '').split(',').filter(Boolean);

  const [files, setFiles] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [messages, setMessages] = useState([]);
  const [sending, setSending] = useState(false);
  const [notConfigured, setNotConfigured] = useState(false);

  useEffect(() => {
    if (fileIds.length < 2) {
      setError(t('chatPage.combinedNeedsTwo'));
      setLoading(false);
      return;
    }
    Promise.all(fileIds.map((id) => getFile(id)))
      .then((results) => setFiles(results.map((r) => r.meta)))
      .catch(() => setError(t('dashboardPage.errorLoading')))
      .finally(() => setLoading(false));
  }, [searchParams]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleSend = useCallback(
    async (question) => {
      const history = messages.map((m) => ({ role: m.role, content: m.content }));
      setMessages((prev) => [...prev, { role: 'user', content: question, timestamp: Date.now() }]);
      setSending(true);
      try {
        const result = await askCombinedQuestion(fileIds, question, history);
        setMessages((prev) => [
          ...prev,
          { role: 'assistant', content: result.answer, timestamp: Date.now() },
        ]);
      } catch (err) {
        const code = err?.response?.data?.error?.code;
        if (code === 'ai_not_configured') {
          setNotConfigured(true);
        } else {
          setMessages((prev) => [
            ...prev,
            { role: 'assistant', content: t('chatPage.sendError'), isError: true, timestamp: Date.now() },
          ]);
        }
      } finally {
        setSending(false);
      }
    },
    [fileIds, messages, t]
  );

  if (loading) {
    return (
      <div className="relative min-h-screen bg-bg text-text">
        <AmbientBackground />
        <AppTopBar />
        <div className="container-shell flex min-h-[70vh] flex-col items-center justify-center gap-3 text-center">
          <Loader2 className="size-6 animate-spin text-primary" strokeWidth={2} />
          <p className="text-sm text-muted">{t('dashboardPage.loadingFile')}</p>
        </div>
      </div>
    );
  }

  if (error || !files) {
    return (
      <div className="relative min-h-screen bg-bg text-text">
        <AmbientBackground />
        <AppTopBar />
        <div className="container-shell flex min-h-[70vh] flex-col items-center justify-center gap-3 text-center">
          <p className="text-sm text-danger">{error || t('dashboardPage.errorLoading')}</p>
          <Link to="/#upload" className="text-sm font-medium text-primary hover:text-primary-hover">
            {t('dashboardPage.newFile')}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-bg text-text">
      <AmbientBackground />
      <AppTopBar />

      <div className="sticky top-16 z-30 border-b border-border bg-bg/85 backdrop-blur-md">
        <div className="container-shell flex h-auto min-h-12 flex-wrap items-center gap-3 py-2.5">
          <Link
            to="/"
            className="flex items-center gap-1.5 text-xs font-medium text-muted transition-colors hover:text-text"
          >
            <ArrowLeft className="size-3.5 rtl:-scale-x-100" strokeWidth={2} />
            {t('dashboardPage.newFile')}
          </Link>
          <span className="h-4 w-px bg-border" />
          <div className="flex items-center gap-1.5 text-xs text-muted">
            <Layers className="size-3.5 shrink-0 text-primary" strokeWidth={2} />
            <span>{t('chatPage.combinedTitle', { count: files.length })}</span>
          </div>
          <div className="flex flex-wrap items-center gap-1.5">
            {files.map((f) => (
              <span key={f.id} className="rounded-full border border-border px-2.5 py-1 text-[11px] text-muted">
                {f.filename}
              </span>
            ))}
          </div>
        </div>
      </div>

      <ChatWindow
        messages={messages}
        sending={sending}
        notConfigured={notConfigured}
        onSend={handleSend}
        suggestions={[t('chatPage.combinedSuggestion')]}
      />
    </div>
  );
}
