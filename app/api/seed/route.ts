import { connectors } from '@zweer/manga-scraper';

export async function GET() {
  const sourceName = 'mangapark';
  const sourceId = '341963';
  const _manga = await connectors[sourceName].getManga(sourceId);
  const _chapters = await connectors[sourceName].getChapters(sourceId);

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

  return Response.json(0);
}
