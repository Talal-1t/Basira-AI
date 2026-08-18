import { Languages } from 'lucide-react';
import { useLanguage } from '../../hooks/useLanguage';

export default function LanguageSwitch({ className }) {
  const { language, toggleLanguage } = useLanguage();

  return (
    <button
      type="button"
      onClick={toggleLanguage}
      className={`inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-2 text-sm font-medium text-muted transition-colors hover:border-muted hover:text-text ${className || ''}`}
      aria-label="Switch language"
    >
      <Languages className="size-4" strokeWidth={2} />
      <span>{language === 'ar' ? 'EN' : 'ع'}</span>
    </button>
  );
}
