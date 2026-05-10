import { Link, useRouterState } from '@tanstack/react-router';
import { BookOpen, Search, Settings } from 'lucide-react';

const navItems = [
  { to: '/', icon: Search, label: 'Search' },
  { to: '/library', icon: BookOpen, label: 'Library' },
  { to: '/settings', icon: Settings, label: 'Settings' },
] as const;

export function MobileNav() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  return (
    <nav className="md:hidden fixed bottom-6 left-6 right-6 z-50 flex justify-around items-center h-16 px-6 bg-surface-container/60 backdrop-blur-2xl rounded-full border border-white/10 shadow-2xl">
      {navItems.map(({ to, icon: Icon, label }) => {
        const isActive = to === '/' ? pathname === '/' : pathname.startsWith(to);
        return (
          <Link
            key={to}
            to={to}
            className={`flex flex-col items-center justify-center transition-all ${
              isActive
                ? 'text-primary relative after:content-[""] after:absolute after:-bottom-2 after:w-1 after:h-1 after:bg-primary after:rounded-full'
                : 'text-on-surface-variant/60 hover:text-primary'
            }`}
          >
            <Icon size={22} />
            <span className="text-[10px] font-bold uppercase tracking-wider mt-1">{label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
