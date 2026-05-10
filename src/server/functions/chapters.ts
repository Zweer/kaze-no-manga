import { createServerFn } from '@tanstack/react-start';
import { getRequestHeaders } from '@tanstack/react-start/server';
import { and, eq } from 'drizzle-orm';

import { auth } from '~/lib/auth';
import { db } from '~/lib/db';
import { chapter, manga, readingProgress } from '~/lib/db/schema';
import { getSource } from '~/lib/scraper';

export const getChapters = createServerFn({ method: 'GET' })
  .inputValidator((input: { mangaId: string }) => input)
  .handler(async ({ data }) => {
    const chapters = await db
      .select()
      .from(chapter)
      .where(eq(chapter.mangaId, data.mangaId))
      .orderBy(chapter.number);

    return chapters;
  });

export const getMangaFromDb = createServerFn({ method: 'GET' })
  .inputValidator((input: { mangaId: string }) => input)
  .handler(async ({ data }) => {
    const [row] = await db.select().from(manga).where(eq(manga.id, data.mangaId)).limit(1);
    return row || null;
  });

export const getPages = createServerFn({ method: 'GET' })
  .inputValidator((input: { mangaId: string; chapterId: string }) => input)
  .handler(async ({ data }) => {
    // Get manga to find source
    const [mangaRow] = await db.select().from(manga).where(eq(manga.id, data.mangaId)).limit(1);
    if (!mangaRow) throw new Error('Manga not found');

    const source = getSource(mangaRow.source);
    if (!source) throw new Error(`Source not found: ${mangaRow.source}`);

    // Get chapter to find slug
    const [chapterRow] = await db
      .select()
      .from(chapter)
      .where(eq(chapter.id, data.chapterId))
      .limit(1);
    if (!chapterRow) throw new Error('Chapter not found');

    // Extract slugs from URLs
    const mangaSlug = mangaRow.sourceUrl.split('/series/')[1];
    if (!mangaSlug) throw new Error('Invalid manga source URL');

    const chapterSlug = chapterRow.sourceUrl.split('/').pop();
    if (!chapterSlug) throw new Error('Invalid chapter source URL');

    // Fetch pages directly from source (R2 integration later)
    const pages = await source.getPages(mangaSlug, chapterSlug);
    return pages;
  });

export const markChapterRead = createServerFn({ method: 'POST' })
  .inputValidator((input: { mangaId: string; chapterId: string }) => input)
  .handler(async ({ data }) => {
    const headers = getRequestHeaders();
    const session = await auth.api.getSession({ headers });
    if (!session) throw new Error('Unauthorized');

    const progressId = `${session.user.id}:${data.chapterId}`;
    await db
      .insert(readingProgress)
      .values({
        id: progressId,
        userId: session.user.id,
        mangaId: data.mangaId,
        chapterId: data.chapterId,
      })
      .onConflictDoNothing();

    return { success: true };
  });

export const getReadChapters = createServerFn({ method: 'GET' })
  .inputValidator((input: { mangaId: string }) => input)
  .handler(async ({ data }) => {
    const headers = getRequestHeaders();
    const session = await auth.api.getSession({ headers });
    if (!session) return [];

    const rows = await db
      .select({ chapterId: readingProgress.chapterId })
      .from(readingProgress)
      .where(
        and(eq(readingProgress.userId, session.user.id), eq(readingProgress.mangaId, data.mangaId)),
      );

    return rows.map((r) => r.chapterId);
  });
