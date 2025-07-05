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

export function mockInsertChaptersSuccess(
  chaptersToInsert: Partial<Chapter>[],
): Chapter[] {
  const chapters = chaptersToInsert.map((c) => ({ ...defaultChapter, ...c }));
  mockedInsertChapters.mockResolvedValueOnce(chapters);

  return chapters;
}
export function mockInsertChaptersError(message = 'Error inserting chapters'): void {
  mockedInsertChapters.mockRejectedValueOnce(new Error(message));
}

export function mockGetLastCheckedMangasSuccess(
  partialMangas: Partial<Manga>[],
): Manga[] {
  const mangas = partialMangas.map((m) => ({ ...defaultManga, ...m }));
  mockedGetLastCheckedMangas.mockResolvedValueOnce(mangas);

  return mangas;
}
export function mockGetLastCheckedMangasError(
  message = 'Error fetching last checked mangas',
): void {
  mockedGetLastCheckedMangas.mockRejectedValueOnce(new Error(message));
}

export function mockGetLastChapterFound(
  partialChapter: Partial<Chapter>,
): Chapter {
  const chapter = { ...defaultChapter, ...partialChapter };
  mockedGetLastChapter.mockResolvedValueOnce(chapter);

  return chapter;
}
export function mockGetLastChapterNotFound(): void {
  mockedGetLastChapter.mockResolvedValueOnce(undefined);
}
export function mockGetLastChapterError(message = 'Error fetching last chapter'): void {
  mockedGetLastChapter.mockRejectedValueOnce(new Error(message));
}

export function mockRetrieveMangaFound(partialManga: Partial<Manga>): Manga {
  const manga = { ...defaultManga, ...partialManga };
  mockedRetrieveManga.mockResolvedValueOnce(manga);

  return manga;
}
export function mockRetrieveMangaNotFound(): void {
  mockedRetrieveManga.mockResolvedValueOnce(null);
}
export function mockRetrieveMangaError(message = 'Error retrieving manga'): void {
  mockedRetrieveManga.mockRejectedValueOnce(new Error(message));
}

export function mockRetrieveChaptersFound(
  partialChapters: Partial<Chapter>[],
): Chapter[] {
  const chapters = partialChapters.map((c) => ({ ...defaultChapter, ...c }));
  mockedRetrieveChapters.mockResolvedValueOnce(chapters);

  return chapters;
}
export function mockRetrieveChaptersNotFound(): void {
  mockedRetrieveChapters.mockResolvedValueOnce([]);
}
export function mockRetrieveChaptersError(
  message = 'Error retrieving chapters',
): void {
  mockedRetrieveChapters.mockRejectedValueOnce(new Error(message));
}
