import type { Metadata } from 'next';

import { Inter } from 'next/font/google';

import { UserNav } from '@/components/auth/UserNav'; // Import UserNav
import { cn } from '@/lib/utils';
import SessionProviderWrapper from '@/providers/sessionProvider'; // Import the wrapper

import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Manga Tracker',
  description: 'Track your favorite manga',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    // Wrap with the SessionProviderWrapper
    <SessionProviderWrapper>
      <html lang="en" suppressHydrationWarning>
        <body className={cn('min-h-screen bg-background font-sans antialiased', inter.className)}>
          <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="container flex h-14 items-center">
              <div className="mr-4 hidden md:flex">
                {/* Add Logo/Title here */}
                <span className="font-bold">MangaTracker</span>
              </div>
              {/* Add Navigation here if needed */}
              <div className="flex flex-1 items-center justify-end space-x-4">
                <UserNav />
                {' '}
                {/* Add the UserNav component */}
              </div>
            </div>
          </header>
          <main className="container py-6">
            {children}
          </main>
          {/* Add Footer here if needed */}
        </body>
      </html>
    </SessionProviderWrapper>
  );
}
