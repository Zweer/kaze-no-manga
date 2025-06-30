import Link from 'next/link';

import { KazeNoMangaIcon } from '@/components/icons';

export default function Logo() {
  return (
    <Link href="/" className="mr-6 flex items-center space-x-2">
      <KazeNoMangaIcon className="h-6 w-6" />
      {' '}
      <span className="font-bold inline-block">
        KazeNoManga
      </span>
    </Link>
  );
}
