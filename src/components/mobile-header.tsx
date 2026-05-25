import { Link } from '@tanstack/react-router';

import { UserMenu } from './user-menu';

export function MobileHeader() {
  return (
    <header className="md:hidden fixed top-0 w-full z-50 bg-surface-container-low/80 backdrop-blur-xl border-b border-outline-variant/20 px-4 h-14 flex items-center justify-between">
      <Link to="/" className="flex items-center gap-2">
        <img src="/logo-square.png" alt="Kaze" className="h-8 w-8 rounded-lg" />
      </Link>

      <UserMenu compact />
    </header>
  );
}
