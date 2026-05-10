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
          <img src="/logo-square.png" alt="Kaze" className="h-9 w-9 rounded-lg" />
          <span className="font-heading text-lg font-black text-on-surface">Kaze</span>
        </Link>

        {/* Centered Nav */}
        <nav className="flex gap-1 items-center bg-white/5 rounded-full p-1">
          {navItems.map(({ to, icon: Icon, label }) => {
            const isActive = to === '/' ? pathname === '/' : pathname.startsWith(to);
            return (
              <Link
                key={to}
                to={to}
                className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-primary text-on-primary'
                    : 'text-on-surface-variant hover:text-on-surface'
                }`}
              >
                <Icon size={16} />
                {label}
              </Link>
            );
          })}
        </nav>

        {/* Right: Theme toggle + User */}
        <div className="flex items-center gap-2">
          {/* Theme toggle */}
          <button
            type="button"
            onClick={toggleTheme}
            className="p-2 rounded-lg text-on-surface-variant hover:text-on-surface hover:bg-white/5 transition-colors"
          >
            {isDark ? <Sun size={18} /> : <Moon size={18} />}
          </button>

          {/* User menu */}
          {session ? (
            <div className="relative">
              <button
                type="button"
                onClick={() => setMenuOpen(!menuOpen)}
                className="flex items-center rounded-full hover:ring-2 hover:ring-primary/30 transition-all"
              >
                {session.user.image ? (
                  <img src={session.user.image} alt="" className="w-8 h-8 rounded-full" />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                    <User size={16} className="text-primary" />
                  </div>
                )}
              </button>

              {menuOpen && (
                <>
                  {/* biome-ignore lint/a11y/useKeyWithClickEvents: backdrop overlay */}
                  {/* biome-ignore lint/a11y/noStaticElementInteractions: backdrop overlay */}
                  <div className="fixed inset-0 z-40" onClick={() => setMenuOpen(false)} />
                  <div className="absolute right-0 top-12 z-50 w-56 bg-surface-container border border-white/10 rounded-xl shadow-2xl p-2">
                    <div className="px-3 py-2 mb-1 border-b border-white/5">
                      <p className="text-sm font-medium text-on-surface truncate">
                        {session.user.name}
                      </p>
                      <p className="text-xs text-on-surface-variant truncate">
                        {session.user.email}
                      </p>
                    </div>
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
          ) : (
            <Link
              to="/login"
              className="px-4 py-2 text-sm font-medium text-on-primary bg-primary rounded-lg hover:bg-primary-light transition-colors"
            >
              Sign In
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
