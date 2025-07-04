import { eq } from 'drizzle-orm';
import { describe, expect, it } from 'vitest';

import { db } from '@/lib/db';
import { mangaTable } from '@/lib/db/model';

describe('Manga Model Tests', () => {
  const createDummyManga = (slugSuffix: string) => ({
    title: `Test Manga ${slugSuffix}`,
    slug: `test-manga-${slugSuffix}`,
    image: `test-cover-${slugSuffix}.jpg`,
    sourceName: `test-source-${slugSuffix}`,
    sourceId: `test-source-id-${slugSuffix}`,
    status: 'ongoing',
    chaptersCount: 10,
  });

  it('should be able to insert a new manga', async () => {
    const newMangaData = createDummyManga('insert');
    await db.insert(mangaTable).values(newMangaData);
    const manga = await db.query.mangaTable.findFirst({
      where: eq(mangaTable.slug, newMangaData.slug),
    });
    expect(manga).toBeDefined();
    expect(manga?.title).toBe(newMangaData.title);
    expect(manga?.sourceName).toBe(newMangaData.sourceName);
    expect(manga?.status).toBe(newMangaData.status);
    expect(manga?.chaptersCount).toBe(newMangaData.chaptersCount);
  });

  it('should be able to query manga', async () => {
    const newMangaData1 = createDummyManga('query1');
    const newMangaData2 = createDummyManga('query2');
    await db.insert(mangaTable).values([newMangaData1, newMangaData2]);
    const allManga = await db.query.mangaTable.findMany();
    // Assuming an empty database at the start of this test block,
    // after resetDatabase clears everything.
    expect(allManga.length).toBeGreaterThanOrEqual(2);
  });

  it('should be able to update a manga', async () => {
    const newMangaData = createDummyManga('update');
    const [{ id }] = await db.insert(mangaTable).values(newMangaData).returning({ id: mangaTable.id });
    const updatedTitle = 'Updated Test Manga for Update';
    await db.update(mangaTable).set({ title: updatedTitle }).where(eq(mangaTable.id, id));
    const updatedManga = await db.query.mangaTable.findFirst({
      where: eq(mangaTable.id, id),
    });
    expect(updatedManga?.title).toBe(updatedTitle);
  });

  it('should be able to delete a manga', async () => {
    const newMangaData = createDummyManga('delete');
    const [{ id }] = await db.insert(mangaTable).values(newMangaData).returning({ id: mangaTable.id });
    await db.delete(mangaTable).where(eq(mangaTable.id, id));
    const deletedManga = await db.query.mangaTable.findFirst({
      where: eq(mangaTable.id, id),
    });
    expect(deletedManga).toBeUndefined();
  });
});
