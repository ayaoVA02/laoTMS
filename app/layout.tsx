import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { Providers } from './providers';
import AuthProvider from './auth-provider';

const inter = Inter({ subsets: ['latin'] });


export const metadata: Metadata = {
  title: 'LaoTMS - Lao Tourism Management System',
  description: 'Discover the beauty of Laos. Explore attractions, plan trips, and manage tourism with LaoTMS.',
  openGraph: {
    title: 'LaoTMS - Lao Tourism Management System',
    description: 'Discover the beauty of Laos',
    images: [
      {
        url: 'https://bolt.new/static/og_default.png',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    images: [
      {
        url: 'https://bolt.new/static/og_default.png',
      },
    ],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <Providers>
          <AuthProvider>
            {children}
          </AuthProvider>
        </Providers>
      </body>
    </html>
  );
}
