import { createFileRoute } from '@tanstack/react-router';
import { LogOut, Moon, User } from 'lucide-react';

import { AppShell } from '~/components/app-shell';

export const Route = createFileRoute('/settings')({
  component: Settings,
});

function Settings() {
  return (
    <AppShell>
      <header className="mb-12 pt-12 md:pt-0">
        <h1 className="font-heading text-5xl md:text-6xl font-black text-on-surface">Settings</h1>
      </header>

      <div className="flex flex-col gap-4 max-w-lg">
        {/* Appearance */}
        <div className="flex items-center justify-between p-4 bg-surface-container/60 backdrop-blur-md rounded-xl border border-white/5">
          <div className="flex items-center gap-3">
            <Moon size={20} className="text-on-surface-variant" />
            <span className="text-base font-medium text-on-surface">Dark Mode</span>
          </div>
          <div className="w-12 h-7 bg-primary rounded-full relative">
            <div className="absolute top-1 right-1 w-5 h-5 bg-white rounded-full shadow-md" />
          </div>
        </div>

        {/* Account */}
        <div className="flex items-center justify-between p-4 bg-surface-container/60 backdrop-blur-md rounded-xl border border-white/5">
          <div className="flex items-center gap-3">
            <User size={20} className="text-on-surface-variant" />
            <span className="text-base font-medium text-on-surface">Account</span>
          </div>
          <span className="text-sm text-on-surface-variant">Not signed in</span>
        </div>

        {/* Sign Out */}
        <button
          type="button"
          className="flex items-center gap-3 p-4 bg-surface-container/60 backdrop-blur-md rounded-xl border border-white/5 hover:bg-white/5 transition-colors"
        >
          <LogOut size={20} className="text-error" />
          <span className="text-base font-medium text-error">Sign Out</span>
        </button>
      </div>

      {/* Version */}
      <p className="mt-16 text-sm text-on-surface-variant/40 text-center">Kaze no Manga v0.1.0</p>
    </AppShell>
  );
}
