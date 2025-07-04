import type { ConnectorNames } from '@zweer/manga-scraper';

import type { Chapter, Manga } from '@/lib/db/model';

import { vi } from 'vitest';

import {
  getLastChapter,
  getLastCheckedMangas,
  insertChapters,
  retrieveChapters,
  retrieveManga,
  upsertManga,
} from '@/lib/service/manga';

export const connectorNameA = 'TestConnectorA' as ConnectorNames;

export const defaultManga: Manga = {
  id: 'manga-id-123',
  sourceName: connectorNameA,
  sourceId: 'manga-source-id-123',
  title: 'Epic Adventure Manga',
  excerpt: 'An epic excerpt.',
  author: 'A. Uthor',
  slug: 'epic-adventure',
  image: 'image.url',
  status: 'Ongoing',
  chaptersCount: 10,
  lastCheckedAt: new Date(),
  createdAt: new Date(),
  updatedAt: new Date(),
};

export const defaultChapter: Chapter = {
  id: 'chapter-id-123',
  sourceName: connectorNameA,
  sourceId: 'chapter-source-id-123',
  mangaId: 'manga-id-123',
  title: 'Epic Adventure Chapter',
  index: 1,
  releasedAt: new Date(),
  images: ['image-1', 'image-2'],
  createdAt: new Date(),
  updatedAt: new Date(),
};

export const mockedUpsertManga = vi.mocked(upsertManga);
export const mockedInsertChapters = vi.mocked(insertChapters);
export const mockedGetLastCheckedMangas = vi.mocked(getLastCheckedMangas);
export const mockedGetLastChapter = vi.mocked(getLastChapter);
export const mockedRetrieveManga = vi.mocked(retrieveManga);
export const mockedRetrieveChapters = vi.mocked(retrieveChapters);

export function mockUpsertMangaSuccess(partialManga: Partial<Manga>): Manga {
  const manga = { ...defaultManga, ...partialManga };
  mockedUpsertManga.mockResolvedValueOnce(manga);

  return manga;
}
export function mockUpsertMangaError(message = 'Invalid connector name'): void {
  mockedUpsertManga.mockRejectedValueOnce(new Error(message));
}

// insertChapters(chapters: ChapterInsert[]): Promise<Chapter[]>
// getLastCheckedMangas(limit: number = 10): Promise<Manga[]>
// getLastChapter(mangaId: string): Promise<Chapter | undefined>
// retrieveManga(sourceName: string, sourceId: string): Promise<MangaInsert>
// retrieveChapters(sourceName: string, sourceId: string, mangaId: string): Promise<ChapterInsert[]>
