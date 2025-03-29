import type { Manga, Prisma } from '@prisma/client';
import type { ConnectorNames } from '@zweer/manga-scraper';

import type { prisma } from './db';

import { connectors } from '@zweer/manga-scraper';

type MangaSearch = Pick<Manga, 'sourceId' | 'sourceName' | 'title' | 'slug' | 'imageUrl'>;
type MangaCreateInput = Prisma.Args<typeof prisma.manga, 'create'>['data'];

export async function searchMangas(search: string): Promise<MangaSearch[]> {
  const results: MangaSearch[] = await Object.entries(connectors).reduce(
    async (promise, [name, connector]) => {
      const results = await promise;
      try {
        const mangas = await connector.getMangas(search);
        const mappedMangas = mangas.map(manga => ({
          sourceId: manga.id,
          sourceName: name as ConnectorNames,
          title: manga.title!,
          slug: manga.slug,
          imageUrl: manga.image!,
        }));

        results.push(...mappedMangas);
      }
      catch (error) {
        console.error(`Error searching on connector ${name}:`, error);
      }

      return results;
    },
    Promise.resolve([] as MangaSearch[]),
  );

  return results;
}

export async function getManga(
  sourceId: string,
  sourceName: ConnectorNames,
): Promise<MangaCreateInput | null> {
  const connector = connectors[sourceName];
  if (!connector) {
    console.error(`Connector not found: ${sourceName}`);
    return null;
  }

  try {
    const manga = await connector.getManga(sourceId);

    return {
      sourceId: manga.id,
      sourceName,
      slug: manga.slug,
      title: manga.title!,
      excerpt: manga.excerpt!,
      imageUrl: manga.image!,
      sourceUrl: manga.url,
      releasedAt: manga.releasedAt!,
      status: manga.status,
      genres: manga.genres,
      score: manga.score ?? 0,
      chaptersCount: manga.chaptersCount,
    };
  }
  catch (error) {
    console.error(`Error fetching manga from ${sourceName}:`, error);
    return null;
  }
}
