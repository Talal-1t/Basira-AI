import { useTranslation } from 'react-i18next';
import { RTL_LANGUAGES } from '../i18n';

/**
 * Central place for reading/changing the active language.
 * i18n/index.js already keeps <html lang>/<html dir> in sync on change,
 * so switching here re-renders instantly with no page reload.
 */
export function useLanguage() {
  const { i18n } = useTranslation();
  const language = i18n.resolvedLanguage || i18n.language;
  const isRtl = RTL_LANGUAGES.includes(language);

  const toggleLanguage = () => {
    i18n.changeLanguage(language === 'ar' ? 'en' : 'ar');
  };

  const setLanguage = (lng) => i18n.changeLanguage(lng);

  return { language, isRtl, toggleLanguage, setLanguage };
}
