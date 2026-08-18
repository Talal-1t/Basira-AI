import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ChevronDown, ChevronUp, List, Table2 } from 'lucide-react';

const TEXT_PREVIEW_CHARS = 900;

export default function PdfPreview({ extraction }) {
  const { t } = useTranslation();
  const [expanded, setExpanded] = useState(false);

  const text = extraction.text || '';
  const shownText = expanded ? text : text.slice(0, TEXT_PREVIEW_CHARS);

  return (
    <div className="space-y-5">
      {extraction.headings?.length > 0 && (
        <div className="rounded-2xl border border-border bg-gradient-to-b from-card to-card-2 p-5 shadow-lg shadow-black/10">
          <div className="flex items-center gap-1.5">
            <List className="size-4 text-primary" strokeWidth={2.25} />
            <p className="text-sm font-semibold text-text">{t('dashboardPage.pdf.headings')}</p>
          </div>
          <ul className="mt-3 space-y-1.5">
            {extraction.headings.map((h, i) => (
              <li key={i} className="flex items-baseline justify-between gap-3 text-xs">
                <span className="text-text/90">{h.text}</span>
                <span className="shrink-0 text-muted">
                  {t('dashboardPage.pdf.page')} {h.page}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {extraction.tables?.length > 0 && (
        <div className="rounded-2xl border border-border bg-gradient-to-b from-card to-card-2 p-5 shadow-lg shadow-black/10">
          <div className="flex items-center gap-1.5">
            <Table2 className="size-4 text-primary" strokeWidth={2.25} />
            <p className="text-sm font-semibold text-text">
              {t('dashboardPage.pdf.tables')} ({extraction.tables.length})
            </p>
          </div>
          <div className="mt-3 space-y-4">
            {extraction.tables.slice(0, 3).map((table, i) => (
              <div key={i} className="overflow-x-auto rounded-lg border border-border">
                <table className="w-full text-xs">
                  <tbody>
                    {table.rows.slice(0, 6).map((row, ri) => (
                      <tr key={ri} className={ri === 0 ? 'bg-bg/60 font-medium text-text' : 'text-muted'}>
                        {row.map((cell, ci) => (
                          <td key={ci} className="whitespace-nowrap border-b border-border px-3 py-2">
                            {cell ?? ''}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="rounded-2xl border border-border bg-gradient-to-b from-card to-card-2 p-5 shadow-lg shadow-black/10">
        <p className="text-sm font-semibold text-text">{t('dashboardPage.pdf.textPreview')}</p>
        <p className="mt-3 whitespace-pre-line text-xs leading-relaxed text-muted">
          {shownText}
          {!expanded && text.length > TEXT_PREVIEW_CHARS && '…'}
        </p>
        {text.length > TEXT_PREVIEW_CHARS && (
          <button
            onClick={() => setExpanded((v) => !v)}
            className="mt-3 flex items-center gap-1 text-xs font-medium text-primary hover:text-primary-hover"
          >
            {expanded ? t('dashboardPage.pdf.showLess') : t('dashboardPage.pdf.showMore')}
            {expanded ? <ChevronUp className="size-3.5" /> : <ChevronDown className="size-3.5" />}
          </button>
        )}
      </div>
    </div>
  );
}
