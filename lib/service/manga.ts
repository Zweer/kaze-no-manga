import type { ConnectorNames } from '@zweer/manga-scraper';

import type { Chapter, ChapterInsert, Manga, MangaInsert } from '@/lib/db/model';

import { connectors } from '@zweer/manga-scraper';

import { db } from '@/lib/db';
import { chapterTable, mangaTable } from '@/lib/db/model';
import logger from '@/lib/logger';

export async function upsertManga(manga: MangaInsert): Promise<Manga> {
  logger.debug({ mangaTitle: manga.title, sourceId: manga.sourceId }, 'Upserting manga');
  try {
    const [returnedManga] = await db
      .insert(mangaTable)
      .values(manga)
      .onConflictDoUpdate({
        target: mangaTable.id,
        set: manga,
      })
      .returning();
    logger.info({ mangaId: returnedManga.id, title: returnedManga.title }, 'Manga upserted successfully');
    return returnedManga;
  } catch (error) {
    logger.error({ mangaTitle: manga.title, sourceId: manga.sourceId, error }, 'Error upserting manga');
    throw error;
  }
}

export async function insertChapters(chapters: ChapterInsert[]): Promise<Chapter[]> {
  if (chapters.length === 0) {
    logger.info('No chapters provided to insert.');
    return [];
  }
  logger.debug({ count: chapters.length, mangaId: chapters[0]?.mangaId }, `Inserting ${chapters.length} chapters.`);
  try {
    const insertedChapters = await db.insert(chapterTable).values(chapters).returning();
    logger.info({ insertedCount: insertedChapters.length, mangaId: chapters[0]?.mangaId }, 'Chapters inserted successfully.');
    return insertedChapters;
  } catch (error) {
    logger.error({ count: chapters.length, mangaId: chapters[0]?.mangaId, error }, 'Error inserting chapters');
    throw error;
  }
}

export async function getLastCheckedMangas(limit: number = 10): Promise<Manga[]> {
  logger.debug({ limit }, `Fetching last ${limit} checked mangas.`);
  try {
    const mangas = await db.query.mangaTable.findMany({
      orderBy: (mangaTable, { asc }) => asc(mangaTable.lastCheckedAt),
      limit,
    });
    logger.info({ count: mangas.length, limit }, `Retrieved ${mangas.length} mangas.`);
    return mangas;
  } catch (error) {
    logger.error({ limit, error }, 'Error fetching last checked mangas.');
    throw error;
  }
}

export async function getLastChapter(mangaId: string): Promise<Chapter | undefined> {
  logger.debug({ mangaId }, 'Fetching last chapter for manga.');
  try {
    const chapter = await db.query.chapterTable.findFirst({
      where: (chapterTable, { eq }) => eq(chapterTable.mangaId, mangaId),
      orderBy: (chapterTable, { desc }) => desc(chapterTable.index),
    });
    if (chapter) {
      logger.info({ mangaId, chapterId: chapter.id, chapterIndex: chapter.index }, 'Last chapter retrieved.');
    } else {
      logger.info({ mangaId }, 'No chapters found for this manga yet.');
    }
    return chapter;
  } catch (error) {
    logger.error({ mangaId, error }, 'Error fetching last chapter.');
    throw error;
  }
}

function retrieveConnector(sourceName: string): typeof connectors[ConnectorNames] {
  logger.trace({ sourceName }, 'Retrieving connector.');
  const connector = connectors[sourceName as ConnectorNames];
  if (!connector) {
    logger.error({ sourceName }, 'Invalid connector name requested.');
    throw new Error(`Invalid connector name: ${sourceName}`);
  }
  return connector;
}

export async function retrieveManga(sourceName: string, sourceId: string): Promise<MangaInsert> {
  logger.debug({ sourceName, sourceId }, 'Retrieving manga data from source.');
  try {
    const connector = retrieveConnector(sourceName);
    const mangaData = await connector.getManga(sourceId);
    logger.info({ sourceName, sourceId, title: mangaData.title }, 'Manga data retrieved from source successfully.');
    return {
      sourceName,
      sourceId,
      title: mangaData.title,
      excerpt: mangaData.excerpt,
      author: mangaData.author,
      slug: mangaData.slug,
      image: mangaData.image,
      status: mangaData.status,
      chaptersCount: mangaData.chaptersCount,
      lastCheckedAt: new Date(),
    };
  } catch (error) {
    logger.error({ sourceName, sourceId, error }, 'Error retrieving manga data from source.');
    throw error;
  }
}

export async function retrieveChapters(sourceName: string, sourceId: string, mangaId: string): Promise<ChapterInsert[]> {
  logger.debug({ sourceName, sourceId, mangaId }, 'Retrieving chapters data from source.');
  try {
    const connector = retrieveConnector(sourceName);
    const chaptersData = await connector.getChapters(sourceId);
    logger.info({ sourceName, sourceId, mangaId, count: chaptersData.length }, 'Chapters data retrieved from source successfully.');
    return chaptersData.map(chapter => ({
      sourceName,
      sourceId: chapter.id,
      mangaId,
      title: chapter.title,
      index: chapter.index,
      releasedAt: chapter.releasedAt,
      images: chapter.images,
    }));
  } catch (error) {
    logger.error({ sourceName, sourceId, mangaId, error }, 'Error retrieving chapters data from source.');
    throw error;
  }
}
