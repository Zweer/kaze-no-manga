import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { GET } from '@/app/api/cron/fetch-manga-updates/route';
import { db } from '@/lib/db';
import { mangaTable, chapterTable, type MangaInsert, type ChapterInsert } from '@/lib/db/model/manga';
import { MangaScraper, type Manga, type Chapter } from '@zweer/manga-scraper'; // Assuming types can be imported

// Mock the MangaScraper
vi.mock('@zweer/manga-scraper', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@zweer/manga-scraper')>();
  return {
    ...actual,
    MangaScraper: vi.fn(),
  };
});

// Mock NextResponse
vi.mock('next/server', async () => {
  return {
    NextResponse: {
      json: vi.fn((body, init) => ({ body, init, headers: new Headers() })),
    },
  };
});


describe('API Route: /api/cron/fetch-manga-updates', () => {
  let mockScraperGetManga: ReturnType<typeof vi.fn>;
  const CRON_SECRET_VALUE = 'test-secret';

  beforeEach(async () => {
    // Reset database (handled by global setup.ts)

    // Setup mock for MangaScraper
    mockScraperGetManga = vi.fn();
    (MangaScraper as ReturnType<typeof vi.fn>).mockImplementation(() => {
      return {
        getManga: mockScraperGetManga,
      };
    });

    // Mock environment variable
    vi.stubEnv('CRON_SECRET', CRON_SECRET_VALUE);
    vi.stubEnv('NODE_ENV', 'production'); // To test auth logic

    // Spy on db methods
    vi.spyOn(db, 'select').mockReturnThis(); // Allow chaining for select
    vi.spyOn(db, 'from').mockReturnThis();
    vi.spyOn(db, 'orderBy').mockReturnThis();
    vi.spyOn(db, 'limit').mockReturnThis();
    vi.spyOn(db, 'where').mockReturnThis();
    vi.spyOn(db, 'update').mockReturnThis(); // For chaining update().set().where()
    vi.spyOn(db, 'set').mockReturnThis();

    // More specific spies needed for actual execution and assertions
    vi.spyOn(db, 'insert').mockResolvedValue({} as any); // as any to satisfy Drizzle's return type
    // For the actual update execution, we might need a more sophisticated spy or rely on select after
    // For now, let's assume the chained update works and we can verify by selecting data after.
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.restoreAllMocks(); // This will also clear spies from db object if not careful
                         // However, setup.ts also calls restoreAllMocks, so this is fine.
  });

  const createMockRequest = (secret?: string): Request => {
    const headers = new Headers();
    if (secret) {
      headers.set('authorization', `Bearer ${secret}`);
    }
    return new Request('http://localhost/api/cron/fetch-manga-updates', { headers });
  };

  it('should return 401 if cron secret is missing or incorrect in production', async () => {
    const requestNoSecret = createMockRequest();
    const responseNoSecret = await GET(requestNoSecret);
    expect(responseNoSecret.init?.status).toBe(401);

    const requestWrongSecret = createMockRequest('wrong-secret');
    const responseWrongSecret = await GET(requestWrongSecret);
    expect(responseWrongSecret.init?.status).toBe(401);
  });

  it('should process mangas, fetch and add new chapters', async () => {
    const initialManga: MangaInsert = {
      sourceName: 'test-source',
      sourceId: 'manga123',
      title: 'Test Manga 1',
      slug: 'test-manga-1',
      image: 'test.jpg',
      status: 'ongoing',
      chaptersCount: 1,
      lastCheckedAt: new Date(Date.now() - 24 * 60 * 60 * 1000 * 2), // 2 days ago
      // other required fields
    };
    await db.insert(mangaTable).values(initialManga);
    const insertedManga = await db.query.mangaTable.findFirst({ where: (m, {eq}) => eq(m.slug, initialManga.slug!)});


    const existingChapter: ChapterInsert = {
      mangaId: insertedManga!.id,
      sourceName: 'test-source',
      sourceId: 'ch1',
      title: 'Chapter 1',
      index: 1,
      images: ['img1.jpg'],
    };
    await db.insert(chapterTable).values(existingChapter);

    const remoteMangaData: Partial<Manga> = { // Using Partial from scraper's type
      id: 'manga123',
      title: 'Test Manga 1',
      chapters: [
        { id: 'ch1', title: 'Chapter 1', index: 1, releasedAt: new Date().toISOString(), images: ['img1.jpg'] },
        { id: 'ch2', title: 'Chapter 2', index: 2, releasedAt: new Date().toISOString(), images: ['img2.jpg'] },
      ],
    };
    mockScraperGetManga.mockResolvedValue(remoteMangaData);

    // Reset spies before the call to GET to have clean assertions for this test case
    // This is tricky with the global db mock/spy from setup.ts.
    // For simplicity, we'll rely on checking the db state.
    const dbInsertSpy = vi.spyOn(db, 'insert'); // Re-spy on insert for this specific test
    const dbUpdateSpy = vi.spyOn(db, 'update');


    const request = createMockRequest(CRON_SECRET_VALUE);
    await GET(request);

    // Verify new chapter was inserted
    const chaptersAfter = await db.query.chapterTable.findMany({ where: (c, {eq}) => eq(c.mangaId, insertedManga!.id) });
    expect(chaptersAfter.length).toBe(2);
    expect(chaptersAfter.some(c => c.sourceId === 'ch2')).toBe(true);

    // Verify manga lastCheckedAt and chaptersCount were updated
    const updatedManga = await db.query.mangaTable.findFirst({ where: (m, {eq}) => eq(m.id, insertedManga!.id) });
    expect(updatedManga?.lastCheckedAt).toBeInstanceOf(Date);
    // Check if the date is recent (e.g., within the last few seconds)
    expect(updatedManga?.lastCheckedAt!.getTime()).toBeGreaterThan(Date.now() - 5000);
    expect(updatedManga?.chaptersCount).toBe(2);

    // Check that db.insert was called for the new chapter
    // This part is tricky due to the global db mock. A more direct spy on chapterTable insert might be needed.
    // For now, the data check above is the primary assertion.
    // We could check dbInsertSpy.mock.calls for chapterTable if needed, but it might be complex with the setup.
  });

  it('should update lastCheckedAt if no new chapters are found', async () => {
    const initialManga: MangaInsert = {
      sourceName: 'test-source',
      sourceId: 'manga456',
      title: 'Test Manga 2',
      slug: 'test-manga-2',
      image: 'test2.jpg',
      status: 'ongoing',
      chaptersCount: 1,
      lastCheckedAt: null,
    };
    await db.insert(mangaTable).values(initialManga);
    const insertedManga = await db.query.mangaTable.findFirst({ where: (m, {eq}) => eq(m.slug, initialManga.slug!)});

    const existingChapter: ChapterInsert = {
      mangaId: insertedManga!.id,
      sourceName: 'test-source',
      sourceId: 'ch1-m2',
      title: 'Chapter 1',
      index: 1,
      images: ['img1-m2.jpg'],
    };
    await db.insert(chapterTable).values(existingChapter);

    const remoteMangaData: Partial<Manga> = {
      id: 'manga456',
      title: 'Test Manga 2',
      chapters: [
        { id: 'ch1-m2', title: 'Chapter 1', index: 1, releasedAt: new Date().toISOString(), images: ['img1-m2.jpg'] },
      ],
    };
    mockScraperGetManga.mockResolvedValue(remoteMangaData);
    const dbUpdateSpy = vi.spyOn(db, 'update'); // Spy on db.update

    const request = createMockRequest(CRON_SECRET_VALUE);
    await GET(request);

    const chaptersAfter = await db.query.chapterTable.findMany({ where: (c, {eq}) => eq(c.mangaId, insertedManga!.id) });
    expect(chaptersAfter.length).toBe(1); // No new chapters

    const updatedManga = await db.query.mangaTable.findFirst({ where: (m, {eq}) => eq(m.id, insertedManga!.id) });
    expect(updatedManga?.lastCheckedAt).toBeInstanceOf(Date);
    expect(updatedManga?.lastCheckedAt!.getTime()).toBeGreaterThan(Date.now() - 5000);
    expect(updatedManga?.chaptersCount).toBe(1); // Count remains the same

    // Check that db.update was called on mangaTable
    // This also is complex with global db mock, but the data check is key.
  });

  it('should handle scraper errors gracefully for a single manga and continue', async () => {
    const manga1: MangaInsert = { /* ... old manga ... */ sourceName: 's1', sourceId: 'id1', title: 'M1', slug: 'm1', image: 'i.jpg', status: 's', chaptersCount: 0, lastCheckedAt: null };
    const manga2: MangaInsert = { /* ... new manga to be updated ... */ sourceName: 's2', sourceId: 'id2', title: 'M2', slug: 'm2', image: 'i.jpg', status: 's', chaptersCount: 0, lastCheckedAt: null };
    await db.insert(mangaTable).values([manga1, manga2]);
    const insertedManga2 = await db.query.mangaTable.findFirst({ where: (m, {eq}) => eq(m.slug, manga2.slug!) });


    mockScraperGetManga
      .mockRejectedValueOnce(new Error('Scraper failed for manga1'))
      .mockResolvedValueOnce({
        id: 'id2',
        title: 'M2',
        chapters: [{ id: 'ch1-m2', title: 'Chapter 1', index: 1, releasedAt: new Date().toISOString(), images: [] }],
      });

    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const dbInsertSpy = vi.spyOn(db, 'insert');
    const dbUpdateSpy = vi.spyOn(db, 'update');


    const request = createMockRequest(CRON_SECRET_VALUE);
    await GET(request);

    expect(consoleErrorSpy).toHaveBeenCalledWith(expect.stringContaining('Error processing manga M1'), expect.any(Error));

    const updatedManga1 = await db.query.mangaTable.findFirst({ where: (m, {eq}) => eq(m.slug, manga1.slug!) });
    // Depending on error handling strategy, lastCheckedAt might be updated or not.
    // Current code in route does not update on error, so it should remain null.
    expect(updatedManga1?.lastCheckedAt).toBeNull();

    const updatedManga2 = await db.query.mangaTable.findFirst({ where: (m, {eq}) => eq(m.slug, manga2.slug!) });
    expect(updatedManga2?.lastCheckedAt).toBeInstanceOf(Date);
    expect(updatedManga2?.chaptersCount).toBe(1);

    consoleErrorSpy.mockRestore();
  });

  it('should return a message if no mangas are found to update', async () => {
    // Ensure db is empty or mangas are all recent
    // resetDatabase() in beforeEach handles this

    const request = createMockRequest(CRON_SECRET_VALUE);
    const response = await GET(request);

    expect(response.body).toEqual({ message: 'No mangas to update.' });
  });

});
