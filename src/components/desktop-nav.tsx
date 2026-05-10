import { Link, useRouterState } from '@tanstack/react-router';
import { BookOpen, Search, Settings } from 'lucide-react';

const navItems = [
  { to: '/', icon: Search, label: 'Search' },
  { to: '/library', icon: BookOpen, label: 'Library' },
  { to: '/settings', icon: Settings, label: 'Settings' },
] as const;

export function DesktopNav() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  return (
    <header className="hidden md:flex fixed top-0 w-full z-50 justify-between items-center px-[var(--spacing-gutter)] h-16 max-w-[1280px] mx-auto bg-surface/5 backdrop-blur-xl">
      <Link to="/" className="font-heading text-[32px] font-black text-primary tracking-tighter">
        Kaze no Manga
      </Link>

      <nav className="flex gap-6 items-center">
        {navItems.map(({ to, icon: Icon, label }) => {
          const isActive = to === '/' ? pathname === '/' : pathname.startsWith(to);
          return (
            <Link
              key={to}
              to={to}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-base font-medium transition-all duration-300 hover:bg-white/5 ${
                isActive
                  ? 'text-primary relative after:content-[""] after:absolute after:-bottom-1 after:left-1/2 after:-translate-x-1/2 after:w-1 after:h-1 after:bg-primary after:rounded-full'
                  : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              <Icon size={18} />
              {label}
            </Link>
          );
        })}
      </nav>

      {/* Ink divider at bottom */}
      <div className="absolute bottom-0 left-0 w-full ink-divider" />
    </header>
  );
}
