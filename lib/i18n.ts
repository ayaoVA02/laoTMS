import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import en from '../locales/en.json';
import la from '../locales/la.json';

// Determine initial language: localStorage > 'la' as default
let initialLng = 'la';
if (typeof window !== 'undefined') {
  const saved = localStorage.getItem('i18nextLng');
  if (saved && (saved === 'en' || saved === 'la')) {
    initialLng = saved;
  }
}

i18n.use(initReactI18next).init({
  resources: {
    en: { translation: en },
    la: { translation: la },
  },
  lng: initialLng,
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
