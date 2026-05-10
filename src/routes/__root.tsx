/// <reference types="vite/client" />

import {
  createRootRoute,
  ErrorComponent,
  HeadContent,
  Outlet,
  Scripts,
} from '@tanstack/react-router';
import type { ReactNode } from 'react';
import { Toaster } from 'sonner';

import appCss from '~/styles/app.css?url';

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { title: 'Kaze no Manga — 風の漫画' },
      { name: 'theme-color', content: '#15121b' },
      { name: 'description', content: 'Cross-device manga reading tracker' },
    ],
    links: [
      { rel: 'stylesheet', href: appCss },
      { rel: 'icon', href: '/logo-square.png', type: 'image/png' },
    ],
  }),
  component: RootComponent,
  errorComponent: RootError,
  pendingComponent: RootPending,
  notFoundComponent: NotFound,
});

function RootComponent() {
  return (
    <RootDocument>
      <Outlet />
    </RootDocument>
  );
}

function RootError({ error }: { error: Error }) {
  return (
    <RootDocument>
      <div className="flex min-h-screen items-center justify-center px-4">
        <div className="text-center max-w-md">
          <h1 className="font-heading text-4xl font-black text-on-surface mb-4">Oops</h1>
          <p className="text-on-surface-variant mb-6">Something went wrong.</p>
          <ErrorComponent error={error} />
          <a
            href="/"
            className="mt-6 inline-block px-6 py-3 bg-primary text-on-primary rounded-xl font-medium"
          >
            Go Home
          </a>
        </div>
      </div>
    </RootDocument>
  );
}

function RootPending() {
  return (
    <RootDocument>
      <div className="flex min-h-screen items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    </RootDocument>
  );
}

function NotFound() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center px-4">
      <div className="text-center">
        <h1 className="font-heading text-6xl font-black text-on-surface mb-2">404</h1>
        <p className="text-on-surface-variant mb-6">Page not found</p>
        <a
          href="/"
          className="px-6 py-3 bg-primary text-on-primary rounded-xl font-medium inline-block"
        >
          Go Home
        </a>
      </div>
    </div>
  );
}

function RootDocument({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="en" className="dark">
      <head>
        <HeadContent />
      </head>
      <body>
        <div className="noise-overlay" />
        {children}
        <Toaster theme="dark" position="bottom-center" richColors />
        <Scripts />
      </body>
    </html>
  );
}
