'use client';

import { ThemeProvider } from 'next-themes';
import { I18nextProvider } from 'react-i18next';
import i18n from '@/lib/i18n';
import Navbar from '@/components/layout/navbar';
import MobileTabBar from '@/components/layout/mobile-tab-bar';
import { useAttractionStore } from '@/stores/attraction-store';
import { useEffect } from 'react';

function DataInitializer() {
  const fetchAttractions = useAttractionStore((s) => s.fetchAttractions);
  const fetchTypes = useAttractionStore((s) => s.fetchTypes);

  useEffect(() => {
    fetchAttractions();
    fetchTypes();
  }, []);

  return null;
}

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <I18nextProvider i18n={i18n}>
        <DataInitializer />
        <Navbar />
        <main className="min-h-screen pt-14 sm:pt-16 pb-16 md:pb-0">{children}</main>
        <MobileTabBar />
      </I18nextProvider>
    </ThemeProvider>
  );
}
