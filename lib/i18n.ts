import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import en from '../locales/en.json';
import la from '../locales/la.json';

// Always start with 'la' on both server and client to avoid hydration mismatch.
// After hydration, the Providers component will read localStorage and switch if needed.
i18n.use(initReactI18next).init({
  resources: {
    en: { translation: en },
    la: { translation: la },
  },
  lng: 'la',
  fallbackLng: 'en',
  interpolation: { escapeValue: false },
});

// Persist language changes to localStorage
i18n.on('languageChanged', (lng) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('i18nextLng', lng);
  }
});

export default i18n;
