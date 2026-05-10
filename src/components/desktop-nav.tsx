import { Link, useRouterState } from '@tanstack/react-router';
import { BookOpen, LogOut, Moon, Search, Sun, User } from 'lucide-react';
import { useState } from 'react';

import { authClient } from '~/lib/auth-client';

const navItems = [
  { to: '/', icon: Search, label: 'Search' },
  { to: '/library', icon: BookOpen, label: 'Library' },
] as const;

export function DesktopNav() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const { data: session } = authClient.useSession();
  const [menuOpen, setMenuOpen] = useState(false);
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
    <header className="hidden md:block fixed top-0 w-full z-50 bg-surface/80 backdrop-blur-xl border-b border-white/5">
      <div className="max-w-[1280px] mx-auto px-[var(--spacing-gutter)] h-16 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2">
          <img src="/logo-dark.png" alt="Kaze no Manga" className="h-8" />
        </Link>

        {/* Centered Nav */}
        <nav className="flex gap-1 items-center">
          {navItems.map(({ to, icon: Icon, label }) => {
            const isActive = to === '/' ? pathname === '/' : pathname.startsWith(to);
            return (
              <Link
                key={to}
                to={to}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  isActive
                    ? 'text-primary bg-primary/10'
                    : 'text-on-surface-variant hover:text-on-surface hover:bg-white/5'
                }`}
              >
                <Icon size={16} />
                {label}
              </Link>
            );
          })}
        </nav>

        {/* User Menu */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setMenuOpen(!menuOpen)}
            className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-white/5 transition-colors"
          >
            {session?.user.image ? (
              <img src={session.user.image} alt="" className="w-7 h-7 rounded-full" />
            ) : (
              <User size={20} className="text-on-surface-variant" />
            )}
          </button>

          {menuOpen && (
            <>
              {/* biome-ignore lint/a11y/useKeyWithClickEvents: backdrop overlay */}
              {/* biome-ignore lint/a11y/noStaticElementInteractions: backdrop overlay */}
              <div className="fixed inset-0 z-40" onClick={() => setMenuOpen(false)} />
              <div className="absolute right-0 top-12 z-50 w-56 bg-surface-container border border-white/10 rounded-xl shadow-2xl p-2">
                {session && (
                  <div className="px-3 py-2 mb-1 border-b border-white/5">
                    <p className="text-sm font-medium text-on-surface truncate">
                      {session.user.name}
                    </p>
                    <p className="text-xs text-on-surface-variant truncate">{session.user.email}</p>
                  </div>
                )}
                <button
                  type="button"
                  onClick={toggleTheme}
                  className="w-full flex items-center gap-3 px-3 py-2 text-sm text-on-surface-variant hover:text-on-surface hover:bg-white/5 rounded-lg transition-colors"
                >
                  {isDark ? <Sun size={16} /> : <Moon size={16} />}
                  {isDark ? 'Light Mode' : 'Dark Mode'}
                </button>
                <button
                  type="button"
                  onClick={handleSignOut}
                  className="w-full flex items-center gap-3 px-3 py-2 text-sm text-error hover:bg-white/5 rounded-lg transition-colors"
                >
                  <LogOut size={16} />
                  Sign Out
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
