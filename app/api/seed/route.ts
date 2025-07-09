import { connectors } from '@zweer/manga-scraper';

import logger from '@/lib/logger';

export async function GET() {
  const sourceName = 'mangapark';
  const sourceId = '341963';
  logger.info({ sourceName, sourceId }, 'Attempting to seed data for manga');

  try {
    const _manga = await connectors[sourceName].getManga(sourceId);
    const _chapters = await connectors[sourceName].getChapters(sourceId);

    // TODO: Add actual seeding logic here if needed for demonstration,
    // or remove if this route is purely for testing the logger.
    logger.info({ sourceName, sourceId, mangaTitle: _manga.title, chapterCount: _chapters.length }, 'Successfully fetched manga data for seeding');

    // await db.update(mangaTable).set({
    //   image: manga.image,
    //   author: manga.author,
    //   status: manga.status,
    //   excerpt: manga.excerpt,
    // }).where(eq(mangaTable.sourceId, sourceId));

    // const [newManga] = await db.insert(mangaTable).values({
    //   sourceName,
    //   sourceId,
    //   title: manga.title,
    //   slug: manga.slug,
    //   chaptersCount: manga.chaptersCount,
    // }).returning();

    // await db.insert(chapterTable).values(chapters.map(chapter => ({
    //   sourceName,
    //   sourceId: chapter.id,
    //   mangaId: newManga.id,
    //   title: chapter.title,
    //   index: chapter.index,
    //   releasedAt: chapter.releasedAt,
    //   images: chapter.images,
    // })));

    return Response.json({ success: true, mangaTitle: _manga.title, chaptersFetched: _chapters.length });
  } catch (error) {
    logger.error({ sourceName, sourceId, error }, 'Failed to seed data for manga');
    return Response.json({ success: false, error: 'Failed to seed data. Check logs.' }, { status: 500 });
  }
}
