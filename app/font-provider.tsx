'use client';

import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';

/**
 * FontProvider handles font switching based on language.
 * Language RESTORATION from localStorage is done in a separate
 * component (LanguageProvider) that is loaded with ssr:false 
 * to avoid hydration mismatches.
 */
export function FontProvider({ children }: { children: React.ReactNode }) {
  const { i18n } = useTranslation();

  useEffect(() => {
    const currentLang = i18n.language || 'en';
    if (currentLang === 'la') {
      document.documentElement.classList.add('font-lao');
      document.documentElement.classList.remove('font-en');
    } else {
      document.documentElement.classList.add('font-en');
      document.documentElement.classList.remove('font-lao');
    }
  }, [i18n.language]);

  return <>{children}</>;
}

/**
 * LanguageRestorer runs ONLY on client-side (after hydration).
 * It restores the persisted language from localStorage WITHOUT
 * causing a hydration mismatch because it's imported with ssr:false.
 */
export function LanguageRestorer() {
  const { i18n } = useTranslation();

  useEffect(() => {
    const stored = localStorage.getItem('i18nextLng');
    if (stored === 'la' && i18n.language !== 'la') {
      i18n.changeLanguage('la');
    }
  }, []);

  return null;
}