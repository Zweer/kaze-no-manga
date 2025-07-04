'use client';

import { SessionProvider as NextSessionProvider } from 'next-auth/react';
import React from 'react';

interface SessionProviderProps {
  children: React.ReactNode;
}

export function SessionProvider({ children }: SessionProviderProps) {
  return <NextSessionProvider>{children}</NextSessionProvider>;
}
