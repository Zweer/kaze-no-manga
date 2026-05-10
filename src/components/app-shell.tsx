import type { ReactNode } from 'react';

import { DesktopNav } from './desktop-nav';
import { MobileNav } from './mobile-nav';

export function AppShell({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <>
      <DesktopNav />
      <main className="relative z-10 pt-4 pb-32 md:pt-24 max-w-[1280px] mx-auto px-[var(--spacing-margin-mobile)] md:px-[var(--spacing-gutter)]">
        {children}
      </main>
      <MobileNav />
    </>
  );
}
