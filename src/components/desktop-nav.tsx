import { Link, useRouterState } from '@tanstack/react-router';
import { BookOpen, Search } from 'lucide-react';

import { UserMenu } from './user-menu';

const navItems = [
  { to: '/', icon: Search, label: 'Search' },
  { to: '/library', icon: BookOpen, label: 'Library' },
] as const;

export function DesktopNav() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  return (
    <header className="hidden md:block fixed top-0 w-full z-50 bg-surface-container-low/80 backdrop-blur-xl border-b border-outline-variant/20">
      <div className="max-w-[1280px] mx-auto px-[var(--spacing-gutter)] h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <img src="/logo-square.png" alt="Kaze" className="h-9 w-9 rounded-lg" />
          <span className="font-heading text-lg font-black text-on-surface">Kaze</span>
        </Link>

        <nav className="flex gap-6 items-center">
          {navItems.map(({ to, icon: Icon, label }) => {
            const isActive = to === '/' ? pathname === '/' : pathname.startsWith(to);
            return (
              <Link
                key={to}
                to={to}
                className={`relative flex items-center gap-2 px-3 py-2 text-sm font-medium transition-colors ${
                  isActive ? 'text-primary' : 'text-on-surface-variant hover:text-on-surface'
                }`}
              >
                <Icon size={16} />
                {label}
                {isActive && (
                  <span className="absolute -bottom-3 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-primary rounded-full" />
                )}
              </Link>
            );
          })}
        </nav>

        <UserMenu />
      </div>
    </header>
  );
}
