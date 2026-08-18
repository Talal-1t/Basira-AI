import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import en from './locales/en.json';
import ar from './locales/ar.json';

export const RTL_LANGUAGES = ['ar'];

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: en },
      ar: { translation: ar },
    },
    fallbackLng: 'en',
    supportedLngs: ['en', 'ar'],
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage'],
      lookupLocalStorage: 'basira_lang',
    },
    interpolation: { escapeValue: false },
  });

/**
 * Applies the correct <html lang> / <html dir> attributes instantly,
 * without a page refresh, whenever the active language changes.
 */
function applyDocumentDirection(lng) {
  const dir = RTL_LANGUAGES.includes(lng) ? 'rtl' : 'ltr';
  document.documentElement.setAttribute('lang', lng);
  document.documentElement.setAttribute('dir', dir);
}

applyDocumentDirection(i18n.resolvedLanguage || i18n.language);
i18n.on('languageChanged', applyDocumentDirection);

export default i18n;
