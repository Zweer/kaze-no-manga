import type { Metadata } from 'next';

import { SessionProvider } from 'next-auth/react'; // Client-side session provider
import { Inter } from 'next/font/google';

// Import your Header and Footer components here
import { Header } from '@/components/layout/Header';
// import Footer from '@/components/layout/Footer';
// Import your ThemeProvider if you have one for Light/Dark mode
import { ThemeProvider } from '@/components/providers/ThemeProvider';

import './globals.css';

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
      <body className={`${inter.className} antialiased flex flex-col min-h-screen`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          // disableTransitionOnChange // Optional: improve performance during theme change
        >
          {/* SessionProvider enables the useSession() hook in Client Components */}
          <SessionProvider>
            <Header />

            <main className="flex-grow container py-6">
              {children}
            </main>

            {/* <Footer /> */}
          </SessionProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
