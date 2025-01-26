'use client';

import { HeroUIProvider } from '@heroui/react';
import { ThemeProvider } from 'next-themes';
import React from 'react';

import { defaultTheme } from '@/app/constants';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <HeroUIProvider>
      <ThemeProvider attribute="class" defaultTheme={defaultTheme}>
        {children}
      </ThemeProvider>
    </HeroUIProvider>
  );
}
