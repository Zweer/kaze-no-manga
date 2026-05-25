import { createServerFn } from '@tanstack/react-start';
import { getRequestHeaders } from '@tanstack/react-start/server';
import { and, eq } from 'drizzle-orm';

import { auth } from '~/lib/auth';
import { db } from '~/lib/db';
import { chapter, library, manga, readingProgress } from '~/lib/db/schema';
import { getSource } from '~/lib/scraper';
import { downloadImage, pagePublicUrl, uploadPage } from '~/lib/storage';
import { authMiddleware } from '~/server/middleware/auth';

export const getChapters = createServerFn({ method: 'GET' })
  .inputValidator((input: { mangaId: string }) => input)
  .handler(async ({ data }) => {
    return db
      .select()
      .from(chapter)
      .where(eq(chapter.mangaId, data.mangaId))
      .orderBy(chapter.number);
  });

export const getMangaFromDb = createServerFn({ method: 'GET' })
  .inputValidator((input: { mangaId: string }) => input)
  .handler(async ({ data }) => {
    const [row] = await db.select().from(manga).where(eq(manga.id, data.mangaId)).limit(1);
    return row || null;
  });

export const getMangaDetail = createServerFn({ method: 'GET' })
  .inputValidator((input: { sourceName: string; slug: string }) => input)
  .handler(async ({ data }) => {
    const source = getSource(data.sourceName);
    if (!source) throw new Error(`Source not found: ${data.sourceName}`);

    const mangaDetail = await source.getManga(data.slug);
    const chapters = await source.getChapters(data.slug);

    const mangaId = `${mangaDetail.sourceName}:${mangaDetail.sourceId}`;
    let inLibrary = false;

    const headers = getRequestHeaders();
    const session = await auth.api.getSession({ headers });
    if (session) {
      const [lib] = await db
        .select()
        .from(library)
        .where(and(eq(library.userId, session.user.id), eq(library.mangaId, mangaId)))
        .limit(1);
      inLibrary = !!lib;
    }

    return {
      manga: mangaDetail,
      chapters: chapters.sort((a, b) => a.number - b.number),
      inLibrary,
      mangaId,
    };
  });

export const getPages = createServerFn({ method: 'GET' })
  .inputValidator((input: { mangaId: string; chapterId: string }) => input)
  .handler(async ({ data }) => {
    const [mangaRow] = await db.select().from(manga).where(eq(manga.id, data.mangaId)).limit(1);
    if (!mangaRow) throw new Error('Manga not found');

    const [chapterRow] = await db
      .select()
      .from(chapter)
      .where(eq(chapter.id, data.chapterId))
      .limit(1);
    if (!chapterRow) throw new Error('Chapter not found');

    if (chapterRow.imagesOnR2 && chapterRow.pageCount) {
      return Array.from({ length: chapterRow.pageCount }, (_, i) => ({
        index: i,
        imageUrl: pagePublicUrl(data.mangaId, data.chapterId, i),
      }));
    }

    const source = getSource(mangaRow.source);
    if (!source) throw new Error(`Source not found: ${mangaRow.source}`);

    const mangaSlug = mangaRow.sourceUrl.split('/series/')[1];
    const chapterSlug = chapterRow.sourceUrl.split('/').pop();
    if (!mangaSlug || !chapterSlug) throw new Error('Invalid source URLs');

    const sourcePages = await source.getPages(mangaSlug, chapterSlug);
    const referer = `${source.baseUrl}/`;

    const urls = await Promise.all(
      sourcePages.map(async (page) => {
        const { buffer, contentType } = await downloadImage(page.imageUrl, referer);
        const url = await uploadPage(data.mangaId, data.chapterId, page.index, buffer, contentType);
        return { index: page.index, imageUrl: url };
      }),
    );

    await db
      .update(chapter)
      .set({ imagesOnR2: true, pageCount: sourcePages.length })
      .where(eq(chapter.id, data.chapterId));

    return urls;
  });

export const markChapterRead = createServerFn({ method: 'POST' })
  .middleware([authMiddleware])
  .inputValidator((input: { mangaId: string; chapterId: string }) => input)
  .handler(async ({ data, context }) => {
    const progressId = `${context.session.user.id}:${data.chapterId}`;
    await db
      .insert(readingProgress)
      .values({
        id: progressId,
        userId: context.session.user.id,
        mangaId: data.mangaId,
        chapterId: data.chapterId,
      })
      .onConflictDoNothing();

    return { success: true };
  });

export const getReadChapters = createServerFn({ method: 'GET' })
  .middleware([authMiddleware])
  .inputValidator((input: { mangaId: string }) => input)
  .handler(async ({ data, context }) => {
    const rows = await db
      .select({ chapterId: readingProgress.chapterId })
      .from(readingProgress)
      .where(
        and(
          eq(readingProgress.userId, context.session.user.id),
          eq(readingProgress.mangaId, data.mangaId),
        ),
      );

    return rows.map((r) => r.chapterId);
  });
