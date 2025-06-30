import { connectors } from '@zweer/manga-scraper';

import { db } from '@/lib/db';
import { chapterTable, mangaTable } from '@/lib/db/model';

export async function GET() {
  const sourceName = 'mangapark';
  const sourceId = '341963';
  const manga = await connectors[sourceName].getManga(sourceId);
  const chapters = await connectors[sourceName].getChapters(sourceId);

  const [newManga] = await db.insert(mangaTable).values({
    sourceName,
    sourceId,
    title: manga.title,
    slug: manga.slug,
    chaptersCount: manga.chaptersCount,
  }).returning();

  await db.insert(chapterTable).values(chapters.map(chapter => ({
    sourceName,
    sourceId: chapter.id,
    mangaId: newManga.id,
    title: chapter.title,
    index: chapter.index,
    releasedAt: chapter.releasedAt,
    images: chapter.images,
  })));

  return Response.json(0);
}
