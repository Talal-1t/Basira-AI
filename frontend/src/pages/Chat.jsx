import { useCallback, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, Loader2, FileSpreadsheet, FileText } from 'lucide-react';

import AppTopBar from '../components/layout/AppTopBar.jsx';
import AmbientBackground from '../components/common/AmbientBackground.jsx';
import ChatWindow from '../components/chat/ChatWindow.jsx';
import { useFileDashboard } from '../hooks/useFileDashboard.js';
import { askQuestion } from '../services/api.js';

export default function Chat() {
  const { fileId } = useParams();
  const { t } = useTranslation();
  const { data, loading, error } = useFileDashboard(fileId);

  const [messages, setMessages] = useState([]);
  const [sending, setSending] = useState(false);
  const [notConfigured, setNotConfigured] = useState(false);

  const suggestions = [
    t('chatPreview.suggested_1'),
    t('chatPreview.suggested_2'),
    t('chatPreview.suggested_3'),
  ];

  const handleSend = useCallback(
    async (question) => {
      const history = messages.map((m) => ({ role: m.role, content: m.content }));
      setMessages((prev) => [...prev, { role: 'user', content: question, timestamp: Date.now() }]);
      setSending(true);

      try {
        const result = await askQuestion(fileId, question, history);
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
    [fileId, messages, t]
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

  if (error || !data) {
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

  const FileIcon = data.meta.kind === 'pdf' ? FileText : FileSpreadsheet;

  return (
    <div className="relative min-h-screen bg-bg text-text">
      <AmbientBackground />
      <AppTopBar />

      <div className="sticky top-16 z-30 border-b border-border bg-bg/85 backdrop-blur-md">
        <div className="container-shell flex h-12 items-center gap-3">
          <Link
            to={`/dashboard/${fileId}`}
            className="flex items-center gap-1.5 text-xs font-medium text-muted transition-colors hover:text-text"
          >
            <ArrowLeft className="size-3.5 rtl:-scale-x-100" strokeWidth={2} />
            {t('chatPage.backToDashboard')}
          </Link>
          <span className="h-4 w-px bg-border" />
          <div className="flex min-w-0 items-center gap-1.5 text-xs text-muted">
            <FileIcon className="size-3.5 shrink-0 text-primary" strokeWidth={2} />
            <span className="truncate">{data.meta.filename}</span>
          </div>
        </div>
      </div>

      <ChatWindow
        messages={messages}
        sending={sending}
        notConfigured={notConfigured}
        onSend={handleSend}
        suggestions={suggestions}
      />
    </div>
  );
}
