import type { ConnectorNames } from '@zweer/manga-scraper';

import type { Chapter, ChapterInsert, Manga, MangaInsert } from '@/lib/db/model';

import { connectors } from '@zweer/manga-scraper';

import { db } from '@/lib/db';
import { chapterTable, mangaTable } from '@/lib/db/model';

export async function upsertManga(manga: MangaInsert): Promise<Manga> {
  const [returnedManga] = await db
    .insert(mangaTable)
    .values(manga)
    .onConflictDoUpdate({
      target: mangaTable.id,
      set: manga,
    })
    .returning();

  return returnedManga;
}

export async function insertChapters(chapters: ChapterInsert[]): Promise<Chapter[]> {
  return db.insert(chapterTable).values(chapters).returning();
}

export async function getLastCheckedMangas(limit: number = 10): Promise<Manga[]> {
  return db.query.mangaTable.findMany({
    orderBy: (mangaTable, { asc }) => asc(mangaTable.lastCheckedAt),
    limit,
  });
}

export async function getLastChapter(mangaId: string): Promise<Chapter | undefined> {
  return db.query.chapterTable.findFirst({
    where: (chapterTable, { eq }) => eq(chapterTable.mangaId, mangaId),
    orderBy: (chapterTable, { desc }) => desc(chapterTable.index),
  });
}

function retrieveConnector(sourceName: string): typeof connectors[ConnectorNames] {
  const connector = connectors[sourceName as ConnectorNames];
  if (!connector) {
    throw new Error('Invalid connector name');
  }

  return connector;
}

export async function retrieveManga(sourceName: string, sourceId: string): Promise<MangaInsert> {
  const connector = retrieveConnector(sourceName);
  const manga = await connector.getManga(sourceId);

  return {
    sourceName,
    sourceId,
    title: manga.title,
    excerpt: manga.excerpt,
    author: manga.author,
    slug: manga.slug,
    image: manga.image,
    status: manga.status,
    chaptersCount: manga.chaptersCount,
    lastCheckedAt: new Date(),
  };
}

export async function retrieveChapters(sourceName: string, sourceId: string, mangaId: string): Promise<ChapterInsert[]> {
  const connector = retrieveConnector(sourceName);
  const chapters = await connector.getChapters(sourceId);

  return chapters.map(chapter => ({
    sourceName,
    sourceId: chapter.id,
    mangaId,
    title: chapter.title,
    index: chapter.index,
    releasedAt: chapter.releasedAt,
    images: chapter.images,
  }));
}
