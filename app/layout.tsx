import "@/styles/globals.css";
import clsx from "clsx";
import { Metadata, Viewport } from "next";

import { Providers } from "./providers";
import NavBar from "@/components/Navbar";

import { Fira_Code as FontMono, Inter as FontSans } from "next/font/google";

const fontSans = FontSans({
  subsets: ["latin"],
  variable: "--font-sans",
});

const fontMono = FontMono({
  subsets: ["latin"],
  variable: "--font-geist-mono",
});

export const metadata: Metadata = {
  title: 'AI Education Platform',
  description: 'Personalized AI tutoring support for students',
  icons: [
    { rel: 'icon', url: '/favicon.ico' },
    { rel: 'apple-touch-icon', url: '/favicon.ico' },
    { rel: 'shortcut icon', url: '/favicon.ico' }
  ],
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "white" },
    { media: "(prefers-color-scheme: dark)", color: "black" },
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      suppressHydrationWarning
      lang="en"
      className={`dark ${fontSans.variable} ${fontMono.variable} font-sans`}
    >
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
      </head>
      <body className={clsx("min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 antialiased")}>
        <Providers>
          <NavBar />
          <main className="relative flex flex-col min-h-screen w-full">
            {children}
          </main>
        </Providers>
      </body>
    </html>
  );
}
