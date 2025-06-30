import type { Metadata } from 'next';

import { Plus_Jakarta_Sans } from 'next/font/google';

import Footer from '@/components/layout/Footer';
import Header from '@/components/layout/Header';
import Providers from '@/components/provider';
import config from '@/lib/config';
import { cn } from '@/lib/utils';

import './globals.css';

const jakarta = Plus_Jakarta_Sans({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: {
    default: config.name,
    template: `%s - ${config.name}`,
  },
  description: config.description,
  keywords: ['manga', 'reader'],
  authors: [config.author],
  creator: config.author.name,
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon-16x16.png',
    apple: '/apple-touch-icon.png',
  },
  manifest: `${process.env.NEXT_PUBLIC_APP_URL}/site.webmanifest`,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={cn(
          'bg-background antialiased [--footer-height:calc(var(--spacing)*14)] [--header-height:calc(var(--spacing)*14)]',
          jakarta.className,
        )}
      >
        <Providers>
          <div className="bg-background relative z-10 flex min-h-svh flex-col">
            <Header />
            <div className="px-40 flex flex-1 justify-center py-5">
              <main className="layout-content-container flex flex-col max-w-[960px] flex-1">
                {children}
              </main>
            </div>
            <Footer />
          </div>
        </Providers>
      </body>
    </html>
  );
}
