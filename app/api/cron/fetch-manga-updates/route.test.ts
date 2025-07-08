import { GET } from './route';
import { GET } from './route';
import { NextRequest } from 'next/server';
import { describe, it, expect, beforeEach, vi } from 'vitest';
// Import the actual service functions that will be mocked
import {
  getLastChapter,
  getLastCheckedMangas,
  insertChapters,
  retrieveChapters,
  retrieveManga,
  upsertManga,
} from '@/lib/service/manga';
// Import data helpers from the test lib
import { defaultManga, defaultChapter } from '@/test/lib/service/manga';

// Mock the service functions
// This replaces the actual functions in '@/lib/service/manga' with vi.fn() instances
// for the duration of this test file.
vi.mock('@/lib/service/manga', () => ({
  getLastChapter: vi.fn(),
  getLastCheckedMangas: vi.fn(),
  insertChapters: vi.fn(),
  retrieveChapters: vi.fn(),
  retrieveManga: vi.fn(),
  upsertManga: vi.fn(),
}));

describe('Cron Fetch Manga Updates API Route GET /api/cron/fetch-manga-updates', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    // Reset environment variables
    process.env.NODE_ENV = 'test';
    process.env.CRON_SECRET = 'test-secret';
  });

  describe('Authorization', () => {
    it('should return 401 if NODE_ENV is production and CRON_SECRET is missing', async () => {
      process.env.NODE_ENV = 'production';
      delete process.env.CRON_SECRET;
      const request = new NextRequest('http://localhost/api/cron/fetch-manga-updates');
      const response = await GET(request);
      const body = await response.json();

      expect(response.status).toBe(401);
      expect(body.success).toBe(false);
      expect(body.error).toBe('Unauthorized');
    });

    it('should return 401 if NODE_ENV is production and Authorization header is incorrect', async () => {
      process.env.NODE_ENV = 'production';
      process.env.CRON_SECRET = 'correct-secret';
      const request = new NextRequest('http://localhost/api/cron/fetch-manga-updates', {
        headers: { Authorization: 'Bearer incorrect-secret' },
      });
      const response = await GET(request);
      const body = await response.json();

      expect(response.status).toBe(401);
      expect(body.success).toBe(false);
      expect(body.error).toBe('Unauthorized');
    });

    it('should proceed if NODE_ENV is production and Authorization header is correct', async () => {
      process.env.NODE_ENV = 'production';
      process.env.CRON_SECRET = 'correct-secret';
      // Mock getLastCheckedMangas to prevent further execution for this specific test
      (getLastCheckedMangas as vi.Mock).mockResolvedValue([]);
      const request = new NextRequest('http://localhost/api/cron/fetch-manga-updates', {
        headers: { Authorization: 'Bearer correct-secret' },
      });
      const response = await GET(request);
      expect(response.status).toBe(200); // Or whatever status is expected for successful empty update
    });

    it('should proceed if NODE_ENV is not production (e.g., test), regardless of CRON_SECRET', async () => {
      process.env.NODE_ENV = 'test';
      delete process.env.CRON_SECRET; // Ensure it's not relying on the beforeEach one
      // Mock getLastCheckedMangas to prevent further execution for this specific test
      (getLastCheckedMangas as vi.Mock).mockResolvedValue([]);
      const request = new NextRequest('http://localhost/api/cron/fetch-manga-updates');
      const response = await GET(request);
      expect(response.status).toBe(200); // Or whatever status is expected for successful empty update
    });
  });

  describe('Manga Update Logic', () => {
    it('should return success with "No mangas to update" if no mangas are found', async () => {
      (getLastCheckedMangas as vi.Mock).mockResolvedValue([]);
      const request = new NextRequest('http://localhost/api/cron/fetch-manga-updates');
      const response = await GET(request);
      const body = await response.json();

      expect(response.status).toBe(200);
      expect(body.success).toBe(true);
      expect(body.message).toBe('No mangas to update');
      expect(getLastCheckedMangas).toHaveBeenCalledTimes(1);
      expect(retrieveManga).not.toHaveBeenCalled();
    });

    it('should not update if fetched manga has the same chapter count', async () => {
      const mangaToUpdate = { ...defaultManga, id: 'manga1', chaptersCount: 5 };
      (getLastCheckedMangas as vi.Mock).mockResolvedValue([mangaToUpdate]);
      (retrieveManga as vi.Mock).mockResolvedValue({ ...mangaToUpdate, chaptersCount: 5 }); // Same chapter count

      const request = new NextRequest('http://localhost/api/cron/fetch-manga-updates');
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
      const fetchedManga1 = { ...manga1, chaptersCount: 3 }; // New chapter
      const lastChapterManga1 = { ...defaultChapter, mangaId: manga1.id, index: 1 }; // Last chapter index is 1
      const fetchedChaptersManga1 = [
        { ...defaultChapter, mangaId: manga1.id, index: 0, sourceId: 's-ch-0' },
        { ...defaultChapter, mangaId: manga1.id, index: 1, sourceId: 's-ch-1' },
        { ...defaultChapter, mangaId: manga1.id, index: 2, sourceId: 's-ch-2' }, // New chapter
      ];
      const newChapterForManga1 = fetchedChaptersManga1[2];

      const manga2 = { ...defaultManga, id: 'manga-2', sourceId: 's-manga-2', chaptersCount: 1 };
      const fetchedManga2 = { ...manga2, chaptersCount: 3 }; // 2 New chapters
      // No last chapter for manga2, meaning all fetched chapters are new
      const fetchedChaptersManga2 = [
        { ...defaultChapter, mangaId: manga2.id, index: 0, sourceId: 's-ch-m2-0' },
        { ...defaultChapter, mangaId: manga2.id, index: 1, sourceId: 's-ch-m2-1' },
        { ...defaultChapter, mangaId: manga2.id, index: 2, sourceId: 's-ch-m2-2' },
      ];

      (getLastCheckedMangas as vi.Mock).mockResolvedValue([manga1, manga2]);

      // Setup mocks for manga1
      (retrieveManga as vi.Mock).mockResolvedValueOnce(fetchedManga1);
      (getLastChapter as vi.Mock).mockResolvedValueOnce(lastChapterManga1);
      (retrieveChapters as vi.Mock).mockResolvedValueOnce(fetchedChaptersManga1);
      (upsertManga as vi.Mock).mockResolvedValueOnce(fetchedManga1);
      (insertChapters as vi.Mock).mockResolvedValueOnce([newChapterForManga1]);

      // Setup mocks for manga2
      (retrieveManga as vi.Mock).mockResolvedValueOnce(fetchedManga2);
      (getLastChapter as vi.Mock).mockResolvedValueOnce(undefined); // No last chapter
      (retrieveChapters as vi.Mock).mockResolvedValueOnce(fetchedChaptersManga2);
      (upsertManga as vi.Mock).mockResolvedValueOnce(fetchedManga2);
      (insertChapters as vi.Mock).mockResolvedValueOnce(fetchedChaptersManga2);


      const request = new NextRequest('http://localhost/api/cron/fetch-manga-updates');
      const response = await GET(request);
      const body = await response.json();

      expect(response.status).toBe(200);
      expect(body.success).toBe(true);
      expect(body.message).toBe(`added 4 chapters in 2 mangas`); // 1 new for manga1, 3 new for manga2

      // Check calls for manga1
      expect(retrieveManga).toHaveBeenCalledWith(manga1.sourceName, manga1.sourceId);
      expect(getLastChapter).toHaveBeenCalledWith(manga1.id);
      expect(retrieveChapters).toHaveBeenCalledWith(manga1.sourceName, manga1.sourceId, manga1.id);
      expect(upsertManga).toHaveBeenCalledWith(fetchedManga1);
      expect(insertChapters).toHaveBeenCalledWith([newChapterForManga1]);

      // Check calls for manga2
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
      (getLastCheckedMangas as vi.Mock).mockRejectedValueOnce(new Error(errorMessage));

      const request = new NextRequest('http://localhost/api/cron/fetch-manga-updates');
      // We expect the GET handler to catch the error and return a 500 response,
      // or for the test framework to catch the unhandled rejection if the route doesn't handle it.
      // For this example, let's assume the route doesn't have global error handling for this specific case
      // and the error would propagate. Vitest would catch this.
      // If the route *did* handle it and return a JSON error, we'd check for that.
      await expect(GET(request)).rejects.toThrow(errorMessage);

      expect(getLastCheckedMangas).toHaveBeenCalledTimes(1);
      expect(retrieveManga).not.toHaveBeenCalled();
    });

    // Additional error tests can be added here for other service function failures
  });
});
