import { createFileRoute } from '@tanstack/react-router';
import { LogOut, Moon, Sun, User } from 'lucide-react';
import { useState } from 'react';

import { AppShell } from '~/components/app-shell';
import { authClient } from '~/lib/auth-client';

export const Route = createFileRoute('/_authed/settings')({
  component: Settings,
});

function Settings() {
  const { data: session } = authClient.useSession();
  const [isDark, setIsDark] = useState(true);

  const handleSignOut = () => {
    authClient.signOut({ fetchOptions: { onSuccess: () => window.location.reload() } });
  };

  const toggleTheme = () => {
    setIsDark(!isDark);
    document.documentElement.classList.toggle('dark');
    document.documentElement.classList.toggle('light');
  };

  return (
    <AppShell>
      <header className="mb-12 pt-12 md:pt-0">
        <h1 className="font-heading text-5xl md:text-6xl font-black text-on-surface">Settings</h1>
      </header>

      <div className="flex flex-col gap-4 max-w-lg">
        {/* Appearance */}
        <button
          type="button"
          onClick={toggleTheme}
          className="flex items-center justify-between p-4 bg-surface-container/60 backdrop-blur-md rounded-xl border border-white/5"
        >
          <div className="flex items-center gap-3">
            {isDark ? (
              <Moon size={20} className="text-on-surface-variant" />
            ) : (
              <Sun size={20} className="text-on-surface-variant" />
            )}
            <span className="text-base font-medium text-on-surface">
              {isDark ? 'Dark Mode' : 'Light Mode'}
            </span>
          </div>
          <div
            className={`w-12 h-7 rounded-full relative transition-colors ${isDark ? 'bg-primary' : 'bg-outline-variant'}`}
          >
            <div
              className={`absolute top-1 w-5 h-5 bg-white rounded-full shadow-md transition-all ${isDark ? 'right-1' : 'left-1'}`}
            />
          </div>
        </button>

        {/* Account */}
        <div className="flex items-center justify-between p-4 bg-surface-container/60 backdrop-blur-md rounded-xl border border-white/5">
          <div className="flex items-center gap-3">
            {session?.user.image ? (
              <img src={session.user.image} alt="" className="w-8 h-8 rounded-full" />
            ) : (
              <User size={20} className="text-on-surface-variant" />
            )}
            <div>
              <p className="text-base font-medium text-on-surface">{session?.user.name}</p>
              <p className="text-sm text-on-surface-variant">{session?.user.email}</p>
            </div>
          </div>
        </div>

        {/* Sign Out */}
        <button
          type="button"
          onClick={handleSignOut}
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
