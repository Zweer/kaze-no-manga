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

    // Check if manga already exists in DB
    const mangaDetail = await source.getManga(data.slug);
    const mangaId = `${mangaDetail.sourceName}:${mangaDetail.sourceId}`;

    const [existing] = await db.select().from(manga).where(eq(manga.id, mangaId)).limit(1);

    if (!existing) {
      // Save manga to DB
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

      // Fetch and save chapters
      const chapters = await source.getChapters(data.slug);
      if (chapters.length > 0) {
        // Insert in batches of 100 to avoid query size limits
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
      sourceUrl: manga.sourceUrl,
    })
    .from(library)
    .innerJoin(manga, eq(library.mangaId, manga.id))
    .where(eq(library.userId, session.user.id));

  return results.map((r) => ({
    ...r,
    slug: r.sourceUrl.split('/series/')[1] || r.mangaId,
  }));
});
