import type { ConnectorNames } from '@zweer/manga-scraper';

import { connectors } from '@zweer/manga-scraper';

export interface MangaSearchResult {
  sourceId: string;
  sourceName: ConnectorNames;
  title: string;
  slug: string;
  coverUrl: string;
}

export async function searchMangas(query: string): Promise<MangaSearchResult[]> {
  const results = await Object.entries(connectors).reduce(
    async (prev, [sourceName, connector]) => {
      const previousMangas = await prev;
      const mangas = await connector.getMangas(query);
      const formattedMangas = mangas.map(manga => ({
        sourceId: manga.id,
        sourceName: sourceName as ConnectorNames,
        title: manga.title!,
        slug: manga.slug,
        coverUrl: manga.image!,
      }));
      return [...previousMangas, ...formattedMangas];
    },
    Promise.resolve([] as MangaSearchResult[]),
  );

  return results;
}
