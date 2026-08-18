import { useTranslation } from 'react-i18next';
import { Hash, Type, Calendar, List, Table2 } from 'lucide-react';

const TYPE_ICON = {
  numeric: Hash,
  categorical: List,
  datetime: Calendar,
  text: Type,
};

const TYPE_COLOR = {
  numeric: 'text-primary',
  categorical: 'text-[#60A5FA]',
  datetime: 'text-[#F59E0B]',
  text: 'text-muted',
};

export default function ColumnsPanel({ columnTypes }) {
  const { t } = useTranslation();
  const entries = Object.entries(columnTypes || {});
  if (entries.length === 0) return null;

  return (
    <div className="rounded-2xl border border-border bg-gradient-to-b from-card to-card-2 p-5 shadow-lg shadow-black/10">
      <div className="flex items-center gap-1.5">
        <Table2 className="size-4 text-primary" strokeWidth={2.25} />
        <p className="text-sm font-semibold text-text">
          {t('dashboardPage.columns.title')} ({entries.length})
        </p>
      </div>
      <div className="mt-3 grid gap-1.5 sm:grid-cols-2 lg:grid-cols-3">
        {entries.map(([name, type]) => {
          const Icon = TYPE_ICON[type] || Type;
          return (
            <div
              key={name}
              className="flex items-center gap-2 rounded-lg border border-border bg-bg/50 px-3 py-2"
            >
              <Icon className={`size-3.5 shrink-0 ${TYPE_COLOR[type] || 'text-muted'}`} strokeWidth={2} />
              <span className="truncate text-xs text-text/90">{name}</span>
              <span className="ms-auto shrink-0 text-[10px] uppercase text-muted">
                {t(`dashboardPage.columns.types.${type}`, type)}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
