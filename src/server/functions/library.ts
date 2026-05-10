import { createServerFn } from '@tanstack/react-start';
import { getRequestHeaders } from '@tanstack/react-start/server';
import { and, eq } from 'drizzle-orm';

import { auth } from '~/lib/auth';
import { db } from '~/lib/db';
import { chapter, library, manga } from '~/lib/db/schema';
import { getSource } from '~/lib/scraper';

export const addMangaToLibrary = createServerFn({ method: 'POST' })
  .inputValidator((input: { sourceName: string; slug: string }) => input)
  .handler(async ({ data }) => {
    const headers = getRequestHeaders();
    const session = await auth.api.getSession({ headers });
    if (!session) throw new Error('Unauthorized');

    const source = getSource(data.sourceName);
    if (!source) throw new Error(`Source not found: ${data.sourceName}`);

    // Fetch manga details + chapters from source
    const [mangaDetail, chapters] = await Promise.all([
      source.getManga(data.slug),
      source.getChapters(data.slug),
    ]);

    // Upsert manga (global entity)
    const mangaId = `${mangaDetail.sourceName}:${mangaDetail.sourceId}`;
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

    // Upsert chapters
    if (chapters.length > 0) {
      await db
        .insert(chapter)
        .values(
          chapters.map((ch) => ({
            id: `${mangaId}:${ch.sourceId}`,
            mangaId,
            number: ch.number,
            title: ch.title,
            sourceUrl: ch.sourceUrl,
          })),
        )
        .onConflictDoNothing();
    }

    // Add to user's library
    const libraryId = `${session.user.id}:${mangaId}`;
    await db
      .insert(library)
      .values({
        id: libraryId,
        userId: session.user.id,
        mangaId,
      })
      .onConflictDoNothing();

    return { success: true, mangaId };
  });

export const removeFromLibrary = createServerFn({ method: 'POST' })
  .inputValidator((input: { mangaId: string }) => input)
  .handler(async ({ data }) => {
    const headers = getRequestHeaders();
    const session = await auth.api.getSession({ headers });
    if (!session) throw new Error('Unauthorized');

    await db
      .delete(library)
      .where(and(eq(library.userId, session.user.id), eq(library.mangaId, data.mangaId)));

    return { success: true };
  });

export const getLibrary = createServerFn({ method: 'GET' }).handler(async () => {
  const headers = getRequestHeaders();
  const session = await auth.api.getSession({ headers });
  if (!session) throw new Error('Unauthorized');

  const results = await db
    .select({
      id: library.id,
      status: library.status,
      addedAt: library.addedAt,
      mangaId: manga.id,
      title: manga.title,
      cover: manga.cover,
      source: manga.source,
    })
    .from(library)
    .innerJoin(manga, eq(library.mangaId, manga.id))
    .where(eq(library.userId, session.user.id));

  return results;
});
