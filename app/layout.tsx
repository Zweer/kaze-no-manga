import type { Metadata } from 'next';

import { Plus_Jakarta_Sans } from 'next/font/google';

import Footer from '@/components/layout/Footer';
import Header from '@/components/layout/Header';
import Providers from '@/components/provider';
import { cn } from '@/lib/utils';

import './globals.css';

const jakarta = Plus_Jakarta_Sans({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Kaze No Manga',
  description: 'A modern manga reading platform.',
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
          'bg-background antialiased',
          jakarta.className,
        )}
      >
        <Providers>
          <div className="relative flex size-full min-h-screen flex-col group/design-root overflow-x-hidden">
            <div className="layout-container flex h-full grow flex-col">
              <Header />
              <div className="px-40 flex flex-1 justify-center py-5">
                <main className="layout-content-container flex flex-col max-w-[960px] flex-1">
                  {children}
                </main>
              </div>
              <Footer />
            </div>
          </div>
        </Providers>
      </body>
    </html>
  );
}
