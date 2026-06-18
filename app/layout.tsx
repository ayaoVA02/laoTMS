// app/layout.tsx
import './globals.css';
import { Inter, Noto_Sans_Lao } from 'next/font/google';
import { Providers } from './providers';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });
const notoSansLao = Noto_Sans_Lao({
  subsets: ['lao', 'latin'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-noto-sans-lao',
});

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
      <body className={`${inter.variable} ${notoSansLao.variable} font-sans`} suppressHydrationWarning>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}