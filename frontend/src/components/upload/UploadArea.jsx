import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import {
  UploadCloud,
  FileSpreadsheet,
  FileText,
  AlertCircle,
  Loader2,
  CheckCircle2,
  ArrowRight,
  Layers,
  X,
} from 'lucide-react';
import { cn } from '../../utils/cn';
import { runWithLimit } from '../../utils/concurrency.js';
import { uploadFile } from '../../services/api.js';
import { addRecentFile } from '../../utils/recentFiles.js';

const ACCEPTED = {
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
  'application/vnd.ms-excel': ['.xls'],
  'text/csv': ['.csv'],
  'application/pdf': ['.pdf'],
};

const MAX_SIZE = 500 * 1024 * 1024; // 500MB — keep in sync with backend MAX_UPLOAD_MB
const MAX_CONCURRENT_UPLOADS = 3;

let localIdCounter = 0;
const makeLocalId = () => `upload-${Date.now()}-${localIdCounter++}`;

function fileIcon(name) {
  return name.toLowerCase().endsWith('.pdf') ? FileText : FileSpreadsheet;
}

function FileRow({ item, onRetry, onRemove, t }) {
  const Icon = fileIcon(item.name);
  const busy = item.status === 'uploading' || item.status === 'analyzing';

  return (
    <motion.li
      layout
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -12 }}
      className={cn(
        'flex items-center gap-3 rounded-xl border bg-card px-4 py-3',
        item.status === 'error' ? 'border-danger/40' : 'border-border'
      )}
    >
      <span
        className={cn(
          'flex size-8 shrink-0 items-center justify-center rounded-lg',
          item.status === 'error' ? 'bg-danger/10' : item.status === 'done' ? 'bg-primary/10' : 'bg-bg'
        )}
      >
        {item.status === 'uploading' || item.status === 'analyzing' ? (
          <Loader2 className="size-4 animate-spin text-primary" strokeWidth={2} />
        ) : item.status === 'done' ? (
          <CheckCircle2 className="size-4 text-primary" strokeWidth={2} />
        ) : item.status === 'error' ? (
          <AlertCircle className="size-4 text-danger" strokeWidth={2} />
        ) : (
          <Icon className="size-4 text-muted" strokeWidth={2} />
        )}
      </span>

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="truncate text-sm font-medium text-text">{item.name}</span>
          <span className="shrink-0 text-xs text-muted">{(item.size / (1024 * 1024)).toFixed(1)} MB</span>
        </div>

        {item.status === 'uploading' && (
          <div className="mt-1.5 h-1 w-full overflow-hidden rounded-full bg-border">
            <motion.div
              className="h-full rounded-full bg-primary"
              animate={{ width: `${item.progress}%` }}
              transition={{ ease: 'easeOut' }}
            />
          </div>
        )}
        {item.status === 'analyzing' && (
          <p className="mt-0.5 text-xs font-medium text-primary">{t('upload.analyzing')}</p>
        )}
        {item.status === 'error' && <p className="mt-0.5 text-xs text-danger">{item.error}</p>}
      </div>

      {item.status === 'done' && (
        <Link
          to={`/dashboard/${item.fileId}`}
          className="flex shrink-0 items-center gap-1 rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-text transition-colors hover:border-primary/40 hover:text-primary"
        >
          {t('upload.openDashboard')}
          <ArrowRight className="size-3 rtl:-scale-x-100" strokeWidth={2} />
        </Link>
      )}
      {item.status === 'error' && (
        <button
          onClick={() => onRetry(item.id)}
          className="shrink-0 text-xs font-medium text-primary hover:text-primary-hover"
        >
          {t('upload.retry')}
        </button>
      )}
      {!busy && (
        <button
          onClick={() => onRemove(item.id)}
          className="shrink-0 rounded-lg p-1.5 text-muted transition-colors hover:bg-white/5 hover:text-text"
          aria-label={`Remove ${item.name}`}
        >
          <X className="size-4" />
        </button>
      )}
    </motion.li>
  );
}

export default function UploadArea() {
  const { t } = useTranslation();
  const [items, setItems] = useState([]);

  function updateItem(id, patch) {
    setItems((prev) => prev.map((it) => (it.id === id ? { ...it, ...patch } : it)));
  }

  // Takes the full entry directly (not just an id looked up from state) —
  // entries are enqueued in the same tick they're created, before React has
  // committed the state update, so reading them back from `items` at that
  // point would silently miss the ones just added.
  const uploadOne = useCallback(async (entry) => {
    const { id, file } = entry;
    updateItem(id, { status: 'uploading', progress: 0, error: null });
    try {
      const result = await uploadFile(file, (pct) => {
        updateItem(id, { progress: pct, status: pct >= 100 ? 'analyzing' : 'uploading' });
      });
      updateItem(id, { status: 'done', fileId: result.meta.id });
      addRecentFile({
        id: result.meta.id,
        filename: result.meta.filename,
        kind: result.meta.kind,
        extension: result.meta.extension,
      });
    } catch (err) {
      const message =
        err?.response?.data?.error?.message ||
        (err?.code === 'ERR_NETWORK' ? t('upload.error_network') : t('upload.error_generic'));
      updateItem(id, { status: 'error', error: message });
    }
  }, [t]);

  const enqueue = useCallback(
    (entries) => {
      runWithLimit(
        entries.map((entry) => () => uploadOne(entry)),
        MAX_CONCURRENT_UPLOADS
      );
    },
    [uploadOne]
  );

  const onDrop = useCallback(
    (accepted, rejected) => {
      const acceptedEntries = accepted.map((file) => ({
        id: makeLocalId(),
        file,
        name: file.name,
        size: file.size,
        status: 'queued',
        progress: 0,
        fileId: null,
        error: null,
      }));

      const rejectedEntries = rejected.map(({ file, errors }) => ({
        id: makeLocalId(),
        file,
        name: file.name,
        size: file.size,
        status: 'error',
        progress: 0,
        fileId: null,
        error:
          errors[0]?.code === 'file-too-large' ? t('upload.error_size') : t('upload.error_type'),
      }));

      setItems((prev) => [...prev, ...acceptedEntries, ...rejectedEntries]);
      if (acceptedEntries.length > 0) enqueue(acceptedEntries);
    },
    [enqueue, t]
  );

  function handleRetry(id) {
    const entry = items.find((it) => it.id === id);
    if (entry) enqueue([entry]);
  }

  function handleRemove(id) {
    setItems((prev) => prev.filter((it) => it.id !== id));
  }

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: ACCEPTED,
    maxSize: MAX_SIZE,
    multiple: true,
  });

  const doneCount = items.filter((i) => i.status === 'done').length;

  return (
    <section id="upload" className="py-24">
      <div className="container-shell">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.6 }}
          className="mx-auto max-w-2xl text-center"
        >
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">{t('upload.title')}</h2>
          <p className="mt-3 text-muted">{t('upload.subtitle')}</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="mx-auto mt-10 max-w-2xl"
        >
          <div
            {...getRootProps()}
            className={cn(
              'group cursor-pointer rounded-2xl border-2 border-dashed p-10 text-center transition-colors duration-200 sm:p-14',
              isDragActive ? 'border-primary bg-primary/5' : 'border-border bg-surface hover:border-muted'
            )}
          >
            <input {...getInputProps()} />
            <div className="mx-auto flex size-14 items-center justify-center rounded-full bg-card ring-1 ring-border transition-transform duration-200 group-hover:scale-105">
              <UploadCloud
                className={cn('size-6', isDragActive ? 'text-primary' : 'text-muted')}
                strokeWidth={1.75}
              />
            </div>
            <p className="mt-5 text-base font-semibold text-text">{t('upload.dropzone_title')}</p>
            <p className="mt-1.5 text-sm text-muted">{t('upload.dropzone_subtitle')}</p>
            <p className="mt-1 text-xs text-muted">{t('upload.multiple_hint')}</p>
            <p className="mt-4 text-xs text-muted">{t('upload.max_size')}</p>
          </div>

          <ul className="mt-5 space-y-2">
            <AnimatePresence initial={false}>
              {items.map((item) => (
                <FileRow key={item.id} item={item} onRetry={handleRetry} onRemove={handleRemove} t={t} />
              ))}
            </AnimatePresence>
          </ul>

          {doneCount >= 2 && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-4 flex items-center justify-between gap-3 rounded-xl border border-primary/25 bg-primary/5 px-4 py-3"
            >
              <div className="flex items-center gap-2 text-sm text-text">
                <Layers className="size-4 text-primary" strokeWidth={2} />
                {t('upload.askTogetherHint', { count: doneCount })}
              </div>
              <Link
                to={`/chat/combined?ids=${items.filter((i) => i.status === 'done').map((i) => i.fileId).join(',')}`}
                className="flex shrink-0 items-center gap-1 rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-[#052e17] transition-colors hover:bg-primary-hover"
              >
                {t('upload.askTogether')}
                <ArrowRight className="size-3 rtl:-scale-x-100" strokeWidth={2.25} />
              </Link>
            </motion.div>
          )}
        </motion.div>
      </div>
    </section>
  );
}
