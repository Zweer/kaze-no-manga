import type { Metadata } from 'next';

import { SessionProvider } from 'next-auth/react'; // Client-side session provider
import { Inter } from 'next/font/google';

import './globals.css';
// Import your Header and Footer components here
// import Header from '@/components/layout/Header';
// import Footer from '@/components/layout/Footer';
// Import your ThemeProvider if you have one for Light/Dark mode
// import { ThemeProvider } from '@/components/ThemeProvider';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Kaze No Manga',
  description: 'Read and track your favorite manga',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      {' '}
      {/* suppressHydrationWarning recommended for next-themes */}
      <body className={`${inter.className} antialiased`}>
        {' '}
        {/* Add antialiased for smoother fonts */}
        {/* SessionProvider enables the useSession() hook in Client Components */}
        <SessionProvider>
          {/* Optional: ThemeProvider for Light/Dark Mode Toggle */}
          {/* <ThemeProvider attribute="class" defaultTheme="system" enableSystem> */}

          {/* Add Header and Footer components here */}
          {/* <Header /> */}
          <main className="flex-grow">
            {' '}
            {/* Ensure main content can grow */}
            {children}
          </main>
          {/* <Footer /> */}

          {/* </ThemeProvider> */}
        </SessionProvider>
      </body>
    </html>
  );
}
