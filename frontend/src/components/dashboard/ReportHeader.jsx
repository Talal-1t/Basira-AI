import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { FileSpreadsheet, FileText, Clock, Upload, Download, Loader2, FileDown } from 'lucide-react';
import Button from '../common/Button.jsx';
import { exportPdf, exportXlsx } from '../../services/api.js';

function formatSize(bytes) {
  if (!bytes) return '—';
  const mb = bytes / (1024 * 1024);
  return mb >= 1 ? `${mb.toFixed(1)} MB` : `${Math.round(bytes / 1024)} KB`;
}

export default function ReportHeader({ meta }) {
  const { t, i18n } = useTranslation();
  const Icon = meta.kind === 'pdf' ? FileText : FileSpreadsheet;
  const date = new Date(meta.uploaded_at);
  const formattedDate = date.toLocaleString(i18n.resolvedLanguage === 'ar' ? 'ar-SA' : 'en-US', {
    dateStyle: 'medium',
    timeStyle: 'short',
  });

  const [exporting, setExporting] = useState(null); // 'pdf' | 'xlsx' | null
  const baseName = meta.filename.replace(/\.[^.]+$/, '');

  async function handleExport(format) {
    setExporting(format);
    try {
      if (format === 'pdf') await exportPdf(meta.id, baseName);
      else await exportXlsx(meta.id, baseName);
    } finally {
      setExporting(null);
    }
  }

  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-border bg-gradient-to-br from-card via-card to-surface p-5 shadow-xl shadow-black/20 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex min-w-0 items-center gap-3.5">
        <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary/25 to-primary/5 ring-1 ring-primary/25">
          <Icon className="size-5 text-primary" strokeWidth={1.9} />
        </span>
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h1 className="truncate text-base font-bold text-text sm:text-lg">{meta.filename}</h1>
            <span className="shrink-0 rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-semibold uppercase text-primary">
              {meta.extension}
            </span>
          </div>
          <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted">
            <span>{formatSize(meta.size_bytes)}</span>
            <span className="flex items-center gap-1">
              <Clock className="size-3" strokeWidth={2} />
              {formattedDate}
            </span>
          </div>
        </div>
      </div>

      <div className="flex shrink-0 flex-wrap items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          icon={exporting === 'pdf' ? Loader2 : FileDown}
          iconPosition="start"
          onClick={() => handleExport('pdf')}
          disabled={Boolean(exporting)}
          className={exporting === 'pdf' ? '[&_svg]:animate-spin' : ''}
        >
          PDF
        </Button>
        <Button
          variant="outline"
          size="sm"
          icon={exporting === 'xlsx' ? Loader2 : Download}
          iconPosition="start"
          onClick={() => handleExport('xlsx')}
          disabled={Boolean(exporting)}
          className={exporting === 'xlsx' ? '[&_svg]:animate-spin' : ''}
        >
          Excel
        </Button>
        <Button as={Link} to="/#upload" size="sm" icon={Upload} iconPosition="start">
          {t('dashboardPage.newFile')}
        </Button>
      </div>
    </div>
  );
}
