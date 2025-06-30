import Link from 'next/link';

import UserAuth from '@/components/Header/UserAuth';
import { KazeNoMangaIcon } from '@/components/icons'; // Creeremo questa icona tra poco

export default function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        <div className="mr-4 flex items-center">
          <Link href="/" className="mr-6 flex items-center space-x-2">
            <KazeNoMangaIcon className="h-6 w-6" />
            <span className="font-bold">Kaze No Manga</span>
          </Link>

          {/* Navigation links here */}
        </div>

        <div className="flex flex-1 items-center justify-end">
          <nav className="flex items-center space-x-2">
            <UserAuth />
          </nav>
        </div>
      </div>
    </header>
  );
}
