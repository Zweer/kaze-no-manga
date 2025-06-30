import Link from 'next/link';

import Logo from '@/components/layout/Header/Logo';
import UserAuth from '@/components/layout/Header/UserAuth';

const pages = [
  { label: 'Home', href: '/' },
  { label: 'Browse', href: '/browse' },
  { label: 'Library', href: '/library' },
];

export default function Header() {
  return (
    <header className="flex items-center justify-between whitespace-nowrap border-b border-solid px-10 py-3">
      <div className="flex items-center gap-8">
        <div className="flex items-center gap-4">
          <Logo />
        </div>

        <nav className="hidden md:flex items-center space-x-6 text-sm font-medium">
          {pages.map(page => (
            <Link key={page.label.toLowerCase()} href={page.href} className="text-foreground/60 transition-colors hover:text-foreground/80">
              {page.label}
            </Link>
          ))}
        </nav>
      </div>

      <div className="flex flex-1 justify-end gap-8">
        <div className="flex flex-1 items-center justify-end">
          <nav className="flex items-center space-x-2">
            <UserAuth />
          </nav>
        </div>
      </div>
    </header>
  );
}
