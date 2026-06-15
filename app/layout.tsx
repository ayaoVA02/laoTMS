// app/layout.tsx
import './globals.css';
import { Inter } from 'next/font/google';
import { Providers } from './providers';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'LaoTMS',
  description: 'Laos Tourism Management System',
  icons: {
    icon: '/assets/images/logoLaoTMS.png',
    shortcut: '/assets/images/logoLaoTMS.png',
    apple: '/assets/images/logoLaoTMS.png',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      
      <body className={inter.className}>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}