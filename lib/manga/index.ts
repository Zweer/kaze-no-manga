import type { ConnectorNames } from '@zweer/manga-scraper';

import type { Chapter, Manga, MangaSearchResult } from './types';

import { connectors } from '@zweer/manga-scraper';

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

export async function getMangaDetails(sourceId: string, sourceName: string): Promise<Manga> {
  const connectorName = sourceName as ConnectorNames;
  const connector = connectors[connectorName];
  if (!connector) {
    throw new Error(`Connector for source ${sourceName} not found`);
  }

  const mangaDetails = await connector.getManga(sourceId);

  return mangaDetails;
}

export async function getMangaChapters(sourceId: string, sourceName: string): Promise<Chapter[]> {
  const connectorName = sourceName as ConnectorNames;
  const connector = connectors[connectorName];
  if (!connector) {
    throw new Error(`Connector for source ${sourceName} not found`);
  }

  const chapters = await connector.getChapters(sourceId);

  return chapters;
}

export async function getChapterDetails(sourceId: string, sourceName: string, chapterNumber: string): Promise<Chapter> {
  const connectorName = sourceName as ConnectorNames;
  const connector = connectors[connectorName];
  if (!connector) {
    throw new Error(`Connector for source ${sourceName} not found`);
  }

  const chapterDetails = await connector.getChapter(sourceId, chapterNumber);

  return chapterDetails;
}
