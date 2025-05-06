import '@/styles/globals.css';
import clsx from 'clsx';
import { Metadata, Viewport } from 'next';
import { Fira_Code as FontMono, Inter as FontSans } from 'next/font/google';

import { Providers } from './providers';

import NavBar from '@/components/NavBar';
import ZohoSalesIQ from '@/components/ZohoSalesIQ';
import GoogleAnalytics from '@/components/GoogleAnalytics';
import Footer from '@/components/Footer';

const fontSans = FontSans({
  subsets: ['latin'],
  variable: '--font-sans',
});

const fontMono = FontMono({
  subsets: ['latin'],
  variable: '--font-geist-mono',
});

export const metadata: Metadata = {
  title: 'AI Education Platform',
  description: 'Personalized AI tutoring support for students',
  icons: [
    { rel: 'icon', url: '/favicon.ico' },
    { rel: 'apple-touch-icon', url: '/favicon.ico' },
    { rel: 'shortcut icon', url: '/favicon.ico' },
  ],
};

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: 'white' },
    { media: '(prefers-color-scheme: dark)', color: 'black' },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      suppressHydrationWarning
      className={`dark ${fontSans.variable} ${fontMono.variable} font-sans`}
      lang="en"
    >
      <head>
        <link href="/favicon.ico" rel="icon" sizes="any" />
        <GoogleAnalytics />
      </head>
      <body className={clsx('min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 antialiased')}>
        <Providers>
          <NavBar />
          <main className="relative flex flex-col min-h-screen w-full">{children}</main>
          <Footer />
        </Providers>
        <ZohoSalesIQ />
      </body>
    </html>
  );
}
