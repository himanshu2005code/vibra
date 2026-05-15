import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Providers } from '@/components/providers';
import { Header } from '@/components/layout/header';
import { BottomNav } from '@/components/layout/bottom-nav';

const inter = Inter({ subsets: ['latin'], variable: '--font-sans' });

export const metadata: Metadata = {
  title: { default: 'EventSphere', template: '%s | EventSphere' },
  description: 'Book movies, concerts, comedy shows, sports & experiences across India',
  manifest: '/manifest.json',
  appleWebApp: { capable: true, statusBarStyle: 'black-translucent', title: 'EventSphere' },
};

export const viewport: Viewport = {
  themeColor: '#0f0f14',
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans min-h-screen pb-20 md:pb-0`}>
        <Providers>
          <Header />
          <main>{children}</main>
          <BottomNav />
        </Providers>
      </body>
    </html>
  );
}
