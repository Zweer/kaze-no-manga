import type { ResponseError, ResponseSuccess } from './route';

import { NextRequest } from 'next/server';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import {
  getLastChapter,
  getLastCheckedMangas,
  insertChapters,
  retrieveChapters,
  retrieveManga,
  upsertManga,
} from '@/lib/service/manga';
import {
  defaultChapter,
  defaultManga,
  mockGetLastChapterFound,
  mockGetLastChapterNotFound,
  mockGetLastCheckedMangasError,
  mockGetLastCheckedMangasSuccess,
  mockInsertChaptersSuccess,
  mockRetrieveChaptersSuccess,
  mockRetrieveMangaSuccess,
  mockUpsertMangaSuccess,
} from '@/test/lib/service/manga';

import { GET } from './route';

vi.mock('@/lib/service/manga', () => ({
  getLastChapter: vi.fn(),
  getLastCheckedMangas: vi.fn(),
  insertChapters: vi.fn(),
  retrieveChapters: vi.fn(),
  retrieveManga: vi.fn(),
  upsertManga: vi.fn(),
}));

describe('cron Fetch Manga Updates API Route GET /api/cron/fetch-manga-updates', () => {
  const url = 'http://localhost/api/cron/fetch-manga-updates';

  beforeEach(() => {
    vi.resetAllMocks();

    // @ts-expect-error NODE_ENV is read only
    process.env.NODE_ENV = 'test';
    process.env.CRON_SECRET = 'test-secret';
  });

  describe('authorization', () => {
    it('should return 401 if NODE_ENV is production and CRON_SECRET is missing', async () => {
      // @ts-expect-error NODE_ENV is read only
      process.env.NODE_ENV = 'production';
      delete process.env.CRON_SECRET;
      const request = new NextRequest(url);
      const response = await GET(request);
      const body = await response.json() as ResponseError;

      expect(response.status).toBe(401);
      expect(body.success).toBe(false);
      expect(body.error).toBe('Unauthorized');
    });

    it('should return 401 if NODE_ENV is production and Authorization header is incorrect', async () => {
      // @ts-expect-error NODE_ENV is read only
      process.env.NODE_ENV = 'production';
      process.env.CRON_SECRET = 'correct-secret';
      const request = new NextRequest(url, {
        headers: { Authorization: 'Bearer incorrect-secret' },
      });
      const response = await GET(request);
      const body = await response.json() as ResponseError;

      expect(response.status).toBe(401);
      expect(body.success).toBe(false);
      expect(body.error).toBe('Unauthorized');
    });

    it('should proceed if NODE_ENV is production and Authorization header is correct', async () => {
      // @ts-expect-error NODE_ENV is read only
      process.env.NODE_ENV = 'production';
      process.env.CRON_SECRET = 'correct-secret';
      mockGetLastCheckedMangasSuccess([]);
      const request = new NextRequest(url, {
        headers: { Authorization: 'Bearer correct-secret' },
      });
      const response = await GET(request);
      expect(response.status).toBe(200);
    });

    it('should proceed if NODE_ENV is not production (e.g., test), regardless of CRON_SECRET', async () => {
      // @ts-expect-error NODE_ENV is read only
      process.env.NODE_ENV = 'test';
      delete process.env.CRON_SECRET;
      mockGetLastCheckedMangasSuccess([]);
      const request = new NextRequest(url);
      const response = await GET(request);
      expect(response.status).toBe(200);
    });
  });

  describe('manga Update Logic', () => {
    it('should return success with "No mangas to update" if no mangas are found', async () => {
      mockGetLastCheckedMangasSuccess([]);
      const request = new NextRequest(url);
      const response = await GET(request);
      const body = await response.json() as ResponseSuccess;

      expect(response.status).toBe(200);
      expect(body.success).toBe(true);
      expect(body.message).toBe('No mangas to update');
      expect(getLastCheckedMangas).toHaveBeenCalledTimes(1);
      expect(retrieveManga).not.toHaveBeenCalled();
    });

    it('should not update if fetched manga has the same chapter count', async () => {
      const mangaToUpdate = { ...defaultManga, id: 'manga1', chaptersCount: 5 };
      mockGetLastCheckedMangasSuccess([mangaToUpdate]);
      mockRetrieveMangaSuccess({ ...mangaToUpdate, chaptersCount: 5 });

      const request = new NextRequest(url);
      await GET(request);

      expect(getLastCheckedMangas).toHaveBeenCalledTimes(1);
      expect(retrieveManga).toHaveBeenCalledTimes(1);
      expect(retrieveManga).toHaveBeenCalledWith(mangaToUpdate.sourceName, mangaToUpdate.sourceId);
      expect(getLastChapter).not.toHaveBeenCalled();
      expect(retrieveChapters).not.toHaveBeenCalled();
      expect(upsertManga).not.toHaveBeenCalled();
      expect(insertChapters).not.toHaveBeenCalled();
    });

    it('should update manga and add new chapters if new chapters are found', async () => {
      const manga1 = { ...defaultManga, id: 'manga-1', sourceId: 's-manga-1', chaptersCount: 2 };
      const fetchedManga1 = { ...manga1, chaptersCount: 3 };
      const lastChapterManga1 = { ...defaultChapter, mangaId: manga1.id, index: 1 };
      const fetchedChaptersManga1 = [
        { ...defaultChapter, mangaId: manga1.id, index: 0, sourceId: 's-ch-0' },
        { ...defaultChapter, mangaId: manga1.id, index: 1, sourceId: 's-ch-1' },
        { ...defaultChapter, mangaId: manga1.id, index: 2, sourceId: 's-ch-2' },
      ];
      const newChapterForManga1 = fetchedChaptersManga1[2];

      const manga2 = { ...defaultManga, id: 'manga-2', sourceId: 's-manga-2', chaptersCount: 1 };
      const fetchedManga2 = { ...manga2, chaptersCount: 3 };
      const fetchedChaptersManga2 = [
        { ...defaultChapter, mangaId: manga2.id, index: 0, sourceId: 's-ch-m2-0' },
        { ...defaultChapter, mangaId: manga2.id, index: 1, sourceId: 's-ch-m2-1' },
        { ...defaultChapter, mangaId: manga2.id, index: 2, sourceId: 's-ch-m2-2' },
      ];

      mockGetLastCheckedMangasSuccess([manga1, manga2]);

      mockRetrieveMangaSuccess(fetchedManga1);
      mockGetLastChapterFound(lastChapterManga1);
      mockRetrieveChaptersSuccess(fetchedChaptersManga1);
      mockUpsertMangaSuccess(fetchedManga1);
      mockInsertChaptersSuccess([newChapterForManga1]);

      mockRetrieveMangaSuccess(fetchedManga2);
      mockGetLastChapterNotFound();
      mockRetrieveChaptersSuccess(fetchedChaptersManga2);
      mockUpsertMangaSuccess(fetchedManga2);
      mockInsertChaptersSuccess(fetchedChaptersManga2);

      const request = new NextRequest(url);
      const response = await GET(request);
      const body = await response.json() as ResponseSuccess;

      expect(response.status).toBe(200);
      expect(body.success).toBe(true);
      expect(body.message).toBe(`added 4 chapters in 2 mangas`);

      expect(retrieveManga).toHaveBeenCalledWith(manga1.sourceName, manga1.sourceId);
      expect(getLastChapter).toHaveBeenCalledWith(manga1.id);
      expect(retrieveChapters).toHaveBeenCalledWith(manga1.sourceName, manga1.sourceId, manga1.id);
      expect(upsertManga).toHaveBeenCalledWith(fetchedManga1);
      expect(insertChapters).toHaveBeenCalledWith([newChapterForManga1]);

      expect(retrieveManga).toHaveBeenCalledWith(manga2.sourceName, manga2.sourceId);
      expect(getLastChapter).toHaveBeenCalledWith(manga2.id);
      expect(retrieveChapters).toHaveBeenCalledWith(manga2.sourceName, manga2.sourceId, manga2.id);
      expect(upsertManga).toHaveBeenCalledWith(fetchedManga2);
      expect(insertChapters).toHaveBeenCalledWith(fetchedChaptersManga2);

      expect(getLastCheckedMangas).toHaveBeenCalledTimes(1);
      expect(retrieveManga).toHaveBeenCalledTimes(2);
      expect(getLastChapter).toHaveBeenCalledTimes(2);
      expect(retrieveChapters).toHaveBeenCalledTimes(2);
      expect(upsertManga).toHaveBeenCalledTimes(2);
      expect(insertChapters).toHaveBeenCalledTimes(2);
    });

    it('should handle errors when getLastCheckedMangas fails', async () => {
      const errorMessage = 'Database connection error';
      mockGetLastCheckedMangasError(errorMessage);

      const request = new NextRequest(url);
      const response = await GET(request);
      const body = await response.json() as ResponseError;

      expect(response.status).toBe(500);
      expect(body.success).toBe(false);
      expect(body.error).toBe('Cron job failed. Check server logs.');

      expect(getLastCheckedMangas).toHaveBeenCalledTimes(1);
      expect(retrieveManga).not.toHaveBeenCalled();
    });
  });
});
