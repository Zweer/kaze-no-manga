'use server';

import type { Chapter } from '@/lib/manga/types';

import { and, asc, desc, eq } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';

import { getMangaChapters as getExternalChapters } from '@/lib/manga';

import { db } from '../index';
import { chapters as chaptersTable, mangaSources } from '../schema'; // Import schemas

export interface ChapterInfo {
  // id: number; // We might not need the DB id here
  chapterNumber: number;
  title: string | null;
  publishedAt: Date | null;
  // We might need sourceName/sourceMangaId if we want to fetch pages later
  // sourceName: string;
  // sourceMangaId: string;
}

export async function syncChaptersWithSource(mangaId: string): Promise<{ success: boolean; added: number; error?: string }> {
  console.log(`Syncing chapters for mangaId: ${mangaId}`);

  // 1. Get the preferred (or first) source for this manga
  const preferredSource = await db.query.mangaSources.findFirst({
    where: and(eq(mangaSources.mangaId, mangaId), eq(mangaSources.isPreferredSource, true)),
    columns: { sourceName: true, sourceMangaId: true },
  });
  const fallbackSource = preferredSource
    ? null
    : await db.query.mangaSources.findFirst({
      where: eq(mangaSources.mangaId, mangaId),
      orderBy: mangaSources.id,
      columns: { sourceName: true, sourceMangaId: true },
    });
  const sourceToUse = preferredSource || fallbackSource;

  if (!sourceToUse) {
    return { success: false, added: 0, error: 'No source found for this manga to sync chapters.' };
  }
  const { sourceName, sourceMangaId } = sourceToUse;

  // 2. Fetch chapter list from the external source using your wrapper
  let externalChapters: Chapter[] = [];
  try {
    externalChapters = await getExternalChapters(sourceMangaId, sourceName);
    console.log(`Fetched ${externalChapters.length} chapters from ${sourceName} for mangaId ${mangaId}`);
  } catch (error) {
    console.error(`Error fetching external chapters from ${sourceName}:`, error);
    return { success: false, added: 0, error: 'Failed to fetch chapter list from source.' };
  }

  if (externalChapters.length === 0) {
    console.log(`No chapters found on source ${sourceName} for mangaId ${mangaId}.`);
    // Update last checked info?
    await db.update(mangaSources).set({ lastChapterChecked: 'N/A', lastCheckedAt: new Date() }).where(and(eq(mangaSources.mangaId, mangaId), eq(mangaSources.sourceName, sourceName)));
    return { success: true, added: 0 }; // Success, but nothing to add
  }

  // 3. Get existing chapters from our DB for this manga
  const existingChapters = await db.select({ chapterNumber: chaptersTable.chapterNumber }).from(chaptersTable).where(eq(chaptersTable.mangaId, mangaId));
  const existingChapterNumbers = new Set(existingChapters.map(c => c.chapterNumber));

  // 4. Determine which chapters are new
  const chaptersToInsert = externalChapters
    .filter(ec => !existingChapterNumbers.has(ec.index)) // Filter out chapters already in DB (using ec.id which is chapterNumber/slug)
    .map(ec => ({
      mangaId,
      chapterNumber: ec.index,
      title: ec.title,
      publishedAt: ec.releasedAt, // Use releasedAt from scraper
    }));

  // 5. Insert new chapters into the DB
  let addedCount = 0;
  if (chaptersToInsert.length > 0) {
    try {
      const result = await db.insert(chaptersTable).values(chaptersToInsert).returning({ id: chaptersTable.id });
      addedCount = result.length;
      console.log(`Inserted ${addedCount} new chapters into DB for mangaId ${mangaId}.`);
    } catch (error) {
      console.error(`Error inserting new chapters for mangaId ${mangaId}:`, error);
      return { success: false, added: 0, error: 'Database error inserting new chapters.' };
    }
  } else {
    console.log(`No new chapters to insert for mangaId ${mangaId}.`);
  }

  // 6. Update last checked info on the manga_sources table
  try {
    const latestChapterFromSource = externalChapters[0]?.id; // Assuming scraper returns newest first
    await db.update(mangaSources)
      .set({
        lastChapterChecked: latestChapterFromSource ?? 'N/A',
        lastCheckedAt: new Date(),
      })
      .where(and(eq(mangaSources.mangaId, mangaId), eq(mangaSources.sourceName, sourceName)));
  } catch (error) {
    console.error(`Error updating last checked info for source ${sourceName} on mangaId ${mangaId}:`, error);
    // Non-critical error, proceed reporting success based on chapter insertion
  }

  // Revalidate manga detail page cache
  // We need the slug for this! Fetch it or pass it? Let's skip for now.
  // const manga = await db.query.manga.findFirst({ where: eq(mangaTable.id, mangaId), columns: { slug: true } });
  // if(manga?.slug) revalidatePath(`/manga/${manga.slug}`);
  revalidatePath(`/manga/[slug]`, 'layout'); // Revalidate all manga pages layout? Less ideal.

  return { success: true, added: addedCount };
}

/**
 * Fetches the list of chapters for a given manga ID FROM THE DATABASE.
 * @param mangaId - The UUID of the canonical manga.
 * @param order - Sort order ('asc' or 'desc').
 * @returns An array of ChapterInfo objects from the DB.
 */
export async function getMangaChaptersFromDB(mangaId: string, order: 'asc' | 'desc' = 'desc'): Promise<ChapterInfo[]> {
  if (!mangaId)
    return [];
  try {
    // TODO: Implement proper numeric sorting if needed
    const sortOrder = order === 'asc' ? asc(chaptersTable.createdAt) : desc(chaptersTable.createdAt);
    const chapters = await db
      .select({
        // id: chaptersTable.id, // Don't need DB id
        chapterNumber: chaptersTable.chapterNumber, // This is the source ID/slug
        title: chaptersTable.title,
        publishedAt: chaptersTable.publishedAt,
        // createdAt: chaptersTable.createdAt, // Maybe useful for sorting fallback
      })
      .from(chaptersTable)
      .where(eq(chaptersTable.mangaId, mangaId))
      .orderBy(sortOrder);
    // Map result to ChapterInfo if select differs
    return chapters.map(c => ({ ...c, title: c.title ?? null, publishedAt: c.publishedAt ?? null }));
  } catch (error) {
    console.error('Error fetching manga chapters from DB:', error);
    return [];
  }
}
