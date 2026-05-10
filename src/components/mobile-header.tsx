import { Link } from '@tanstack/react-router';
import { LogOut, Moon, Sun, User } from 'lucide-react';
import { useState } from 'react';

import { authClient } from '~/lib/auth-client';

export function MobileHeader() {
  const { data: session } = authClient.useSession();
  const [isDark, setIsDark] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);

  const toggleTheme = () => {
    setIsDark(!isDark);
    document.documentElement.classList.toggle('dark');
    document.documentElement.classList.toggle('light');
  };

  const handleSignOut = () => {
    authClient.signOut({ fetchOptions: { onSuccess: () => window.location.reload() } });
  };

  return (
    <header className="md:hidden fixed top-0 w-full z-50 bg-surface-container-low/80 backdrop-blur-xl border-b border-outline-variant/20 px-4 h-14 flex items-center justify-between">
      <Link to="/" className="flex items-center gap-2">
        <img src="/logo-square.png" alt="Kaze" className="h-8 w-8 rounded-lg" />
      </Link>

      <div className="flex items-center gap-1">
        <button
          type="button"
          onClick={toggleTheme}
          className="p-2 rounded-lg text-on-surface-variant"
        >
          {isDark ? <Sun size={18} /> : <Moon size={18} />}
        </button>

        {session ? (
          <div className="relative">
            <button type="button" onClick={() => setMenuOpen(!menuOpen)} className="rounded-full">
              {session.user.image ? (
                <img src={session.user.image} alt="" className="w-7 h-7 rounded-full" />
              ) : (
                <div className="w-7 h-7 rounded-full bg-primary/20 flex items-center justify-center">
                  <User size={14} className="text-primary" />
                </div>
              )}
            </button>

            {menuOpen && (
              <>
                {/* biome-ignore lint/a11y/useKeyWithClickEvents: backdrop */}
                {/* biome-ignore lint/a11y/noStaticElementInteractions: backdrop */}
                <div className="fixed inset-0 z-40" onClick={() => setMenuOpen(false)} />
                <div className="absolute right-0 top-10 z-50 w-48 bg-surface-container border border-outline-variant/30 rounded-xl p-2 shadow-xl dark:shadow-[0_8px_32px_rgba(139,92,246,0.15)] dark:border-primary/20">
                  <div className="px-3 py-2 mb-1 border-b border-outline-variant/20">
                    <p className="text-sm font-medium text-on-surface truncate">
                      {session.user.name}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleSignOut}
                    className="w-full flex items-center gap-3 px-3 py-2 text-sm text-error hover:bg-white/5 rounded-lg"
                  >
                    <LogOut size={14} />
                    Sign Out
                  </button>
                </div>
              </>
            )}
          </div>
        ) : (
          <Link
            to="/login"
            className="px-3 py-1.5 text-sm font-medium text-on-primary bg-primary rounded-lg"
          >
            Sign In
          </Link>
        )}
      </div>
    </header>
  );
}
