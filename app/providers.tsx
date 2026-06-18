'use client';

import { ThemeProvider } from 'next-themes';
import { I18nextProvider } from 'react-i18next';
import i18n from '@/lib/i18n';
import Navbar from '@/components/layout/navbar';
import MobileTabBar from '@/components/layout/mobile-tab-bar';
import AuthProvider from './auth-provider';
import { useAttractionStore } from '@/stores/attraction-store';
import { useEffect, useRef } from 'react';
import { Toaster } from 'react-hot-toast'; // ✅ unified — matches create-attraction page

export function Providers({ children }: { children: React.ReactNode }) {
  const fetchAttractions = useAttractionStore((s) => s.fetchAttractions);
  const fetchTypes = useAttractionStore((s) => s.fetchTypes);
  // const { fetchAttractions, fetchTypes, fetchPopularDestinations } = useAttractionStore();

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
        {/* ✅ AuthProvider wraps everything so initAuth runs before any page renders */}
        <AuthProvider>
          <Toaster position="top-right" />
          <Navbar />
          <main className="min-h-screen pt-14 sm:pt-16 pb-16 md:pb-0">
            {children}
          </main>
          <MobileTabBar />
        </AuthProvider>
      </I18nextProvider>
    </ThemeProvider>
  );
}