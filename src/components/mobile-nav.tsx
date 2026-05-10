import { Link, useRouterState } from '@tanstack/react-router';
import { BookOpen, Search } from 'lucide-react';

const navItems = [
  { to: '/', icon: Search, label: 'Search' },
  { to: '/library', icon: BookOpen, label: 'Library' },
] as const;

export function MobileNav() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  return (
    <nav className="md:hidden fixed bottom-6 left-6 right-6 z-50 flex justify-around items-center h-14 px-8 bg-surface-container/80 backdrop-blur-2xl rounded-full border border-white/10 shadow-2xl">
      {navItems.map(({ to, icon: Icon, label }) => {
        const isActive = to === '/' ? pathname === '/' : pathname.startsWith(to);
        return (
          <Link
            key={to}
            to={to}
            className={`flex flex-col items-center justify-center gap-0.5 transition-all ${
              isActive ? 'text-primary' : 'text-on-surface-variant/60'
            }`}
          >
            <Icon size={20} />
            <span className="text-[10px] font-bold uppercase tracking-wider">{label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
