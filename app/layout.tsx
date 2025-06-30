import type { Metadata } from 'next';

import { Inter } from 'next/font/google';

import { SessionProvider } from '@/components/provider/SessionProvider';
import { ThemeProvider } from '@/components/provider/ThemeProvider';
import { cn } from '@/lib/utils';

import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'PT Client Hub',
  description: 'Your Personal Trainer Client Management App',
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
          'min-h-screen bg-background antialiased',
          inter.className,
        )}
      >
        <SessionProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
          // disableTransitionOnChange // Optional: improve performance during theme change
          >
            {/* The group layouts ((www) or (app)) will inject their specific structure here */}
            {children}
          </ThemeProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
