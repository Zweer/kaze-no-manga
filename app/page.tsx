import Image from 'next/image';
import Link from 'next/link';

import { db } from '@/lib/db';

export default async function Home() {
  const latestManga = await db.query.mangaTable.findMany({
    orderBy: (mangaTable, { desc }) => desc(mangaTable.createdAt),
    limit: 12,
  });

  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Welcome to KazeNoManga</h1>
        <p className="text-muted-foreground">Your portal to amazing stories.</p>
      </div>

      <h2 className="text-2xl font-bold border-b pb-2 mb-4">Recently Added</h2>

      {latestManga.length > 0
        ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {latestManga.map(manga => (
                <Link href={`/manga/${manga.slug}`} key={manga.id}>
                  <div className="group">
                    <div className="aspect-[3/4] overflow-hidden rounded-lg">
                      <Image
                        src={manga.image}
                        alt={`Cover for ${manga.title}`}
                        width={300}
                        height={400}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                    <h3 className="font-semibold mt-2 truncate">{manga.title}</h3>
                    <p className="text-sm text-muted-foreground">{manga.author}</p>
                  </div>
                </Link>
              ))}
            </div>
          )
        : (
            <p className="text-muted-foreground">No manga have been added yet.</p>
          )}
    </div>
  );
}
