import { useTranslation } from 'react-i18next';
import { FileSpreadsheet, FileText, Clock } from 'lucide-react';

function formatSize(bytes) {
  if (!bytes) return '—';
  const mb = bytes / (1024 * 1024);
  return mb >= 1 ? `${mb.toFixed(1)} MB` : `${Math.round(bytes / 1024)} KB`;
}

export default function FileInfoCard({ meta }) {
  const { t, i18n } = useTranslation();
  const Icon = meta.kind === 'pdf' ? FileText : FileSpreadsheet;
  const date = new Date(meta.uploaded_at);
  const formattedDate = date.toLocaleString(i18n.resolvedLanguage === 'ar' ? 'ar-SA' : 'en-US', {
    dateStyle: 'medium',
    timeStyle: 'short',
  });

  return (
    <div className="flex items-center gap-3 rounded-2xl border border-border bg-card p-4">
      <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10">
        <Icon className="size-5 text-primary" strokeWidth={1.9} />
      </span>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-text">{meta.filename}</p>
        <div className="mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted">
          <span className="uppercase">{meta.extension}</span>
          <span>{formatSize(meta.size_bytes)}</span>
          <span className="flex items-center gap-1">
            <Clock className="size-3" strokeWidth={2} />
            {formattedDate}
          </span>
        </div>
      </div>
    </div>
  );
}
