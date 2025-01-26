import {
  ColorSchemeScript,
  DEFAULT_THEME,
  MantineProvider,
  mergeMantineTheme,
} from '@mantine/core';
import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import Head from 'next/head';
import React from 'react';

import { Header } from '@/components/Header';

import './globals.css';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'Kaze no Manga',
  description: 'Your source for the latest manga releases',
  icons: [
    { rel: 'apple-touch-icon', url: '/favicon/apple-touch-icon.png' },
    { rel: 'icon', type: 'image/png', sizes: '32x32', url: '/favicon/favicon-32x32.png' },
    { rel: 'icon', type: 'image/png', sizes: '16x16', url: '/favicon/favicon-16x16.png' },
    { rel: 'manifest', url: '/favicon/site.webmanifest' },
  ],
};

const theme = mergeMantineTheme(DEFAULT_THEME, {
  fontFamily: geistSans.style.fontFamily,
  fontFamilyMonospace: geistMono.style.fontFamily,
  primaryColor: 'violet',
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <Head>
        <ColorSchemeScript />
      </Head>

      <body className="antialiased">
        <MantineProvider defaultColorScheme="dark" theme={theme}>
          <Header />
          {children}
        </MantineProvider>
      </body>
    </html>
  );
}
