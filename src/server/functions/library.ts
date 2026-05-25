import { createServerFn } from '@tanstack/react-start';
import { and, count, eq } from 'drizzle-orm';

import { db } from '~/lib/db';
import { chapter, library, manga, readingProgress } from '~/lib/db/schema';
import { getSource } from '~/lib/scraper';
import { authMiddleware } from '~/server/middleware/auth';

export const addMangaToLibrary = createServerFn({ method: 'POST' })
  .middleware([authMiddleware])
  .inputValidator((input: { sourceName: string; slug: string }) => input)
  .handler(async ({ data, context }) => {
    const source = getSource(data.sourceName);
    if (!source) throw new Error(`Source not found: ${data.sourceName}`);

    const mangaDetail = await source.getManga(data.slug);
    const mangaId = `${mangaDetail.sourceName}:${mangaDetail.sourceId}`;

    const [existing] = await db.select().from(manga).where(eq(manga.id, mangaId)).limit(1);

    if (!existing) {
      await db
        .insert(manga)
        .values({
          id: mangaId,
          title: mangaDetail.title,
          cover: mangaDetail.cover,
          source: mangaDetail.sourceName,
          sourceId: mangaDetail.sourceId,
          sourceUrl: `${source.baseUrl}/series/${mangaDetail.slug}`,
        })
        .onConflictDoNothing();

      const chapters = await source.getChapters(data.slug);
      if (chapters.length > 0) {
        for (let i = 0; i < chapters.length; i += 100) {
          const batch = chapters.slice(i, i + 100);
          await db
            .insert(chapter)
            .values(
              batch.map((ch) => ({
                id: `${mangaId}:${ch.sourceId}`,
                mangaId,
                number: ch.number,
                title: ch.title,
                sourceUrl: ch.sourceUrl,
              })),
            )
            .onConflictDoNothing();
        }
      }
    }

    const libraryId = `${context.session.user.id}:${mangaId}`;
    await db
      .insert(library)
      .values({
        id: libraryId,
        userId: context.session.user.id,
        mangaId,
      })
      .onConflictDoNothing();

    return { success: true, mangaId };
  });

export const removeFromLibrary = createServerFn({ method: 'POST' })
  .middleware([authMiddleware])
  .inputValidator((input: { mangaId: string }) => input)
  .handler(async ({ data, context }) => {
    await db
      .delete(library)
      .where(and(eq(library.userId, context.session.user.id), eq(library.mangaId, data.mangaId)));

    return { success: true };
  });

export const getLibrary = createServerFn({ method: 'GET' })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const userId = context.session.user.id;

    const results = await db
      .select({
        id: library.id,
        status: library.status,
        addedAt: library.addedAt,
        mangaId: manga.id,
        title: manga.title,
        cover: manga.cover,
        source: manga.source,
        sourceUrl: manga.sourceUrl,
        totalChapters: count(chapter.id),
      })
      .from(library)
      .innerJoin(manga, eq(library.mangaId, manga.id))
      .leftJoin(chapter, eq(chapter.mangaId, manga.id))
      .where(eq(library.userId, userId))
      .groupBy(library.id, manga.id);

    // Get read counts in a single query
    const readCounts = await db
      .select({
        mangaId: readingProgress.mangaId,
        count: count(readingProgress.id),
      })
      .from(readingProgress)
      .where(eq(readingProgress.userId, userId))
      .groupBy(readingProgress.mangaId);

    const readMap = new Map(readCounts.map((r) => [r.mangaId, r.count]));

    return results.map((r) => ({
      ...r,
      slug: r.sourceUrl.split('/series/')[1] || r.mangaId,
      totalChapters: r.totalChapters,
      readChapters: readMap.get(r.mangaId) ?? 0,
    }));
  });
