'use client';

import { ThemeProvider } from 'next-themes';
import { I18nextProvider } from 'react-i18next';
import i18n from '@/lib/i18n';
import Navbar from '@/components/layout/navbar';
import MobileTabBar from '@/components/layout/mobile-tab-bar';
import AuthProvider from './auth-provider';
import { useAttractionStore } from '@/stores/attraction-store';
import { useEffect, useRef } from 'react';
import { Toaster } from 'react-hot-toast';
import { FontProvider } from './font-provider';
import { useAppStore } from '@/stores/app-store';

// Restore the previously selected language after hydration,
// so server-rendered HTML (always 'la') matches client first render.
function LanguageHydration() {
  const { setLanguage } = useAppStore();
  const done = useRef(false);

  useEffect(() => {
    if (done.current) return;
    done.current = true;

    const saved = localStorage.getItem('i18nextLng');
    if (saved === 'en' || saved === 'la') {
      if (saved !== i18n.language) {
        i18n.changeLanguage(saved);
        setLanguage(saved);
      }
    }
  }, []);

  return null;
}

export function Providers({ children }: { children: React.ReactNode }) {
  const fetchAttractions = useAttractionStore((s) => s.fetchAttractions);
  const fetchTypes = useAttractionStore((s) => s.fetchTypes);

  const hasInitialized = useRef(false);

  useEffect(() => {
    if (!hasInitialized.current) {
      hasInitialized.current = true;
      fetchAttractions();
      fetchTypes();
    }
  }, []);

  // useEffect(() => {
  //   hasInitialized.current = true;
  //   fetchAttractions().then(() => fetchPopularDestinations());
  //   fetchTypes();
  // }, []);

  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <I18nextProvider i18n={i18n}>
        <FontProvider>
          {/* ✅ Restore saved language after hydration (fixes hydration mismatch) */}
          <LanguageHydration />
          {/* ✅ AuthProvider wraps everything so initAuth runs before any page renders */}
          <AuthProvider>
            <Toaster position="top-right" />
            <Navbar />
            <main className="min-h-screen pt-14 sm:pt-16 pb-16 md:pb-0">
              {children}
            </main>
            <MobileTabBar />
          </AuthProvider>
        </FontProvider>
      </I18nextProvider>
    </ThemeProvider>
  );
}