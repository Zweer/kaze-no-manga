'use server';

import type { DatabaseError } from '@neondatabase/serverless';

import type { Manga } from '@/lib/manga/types';

import { and, eq, ilike, or } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import slugify from 'slugify';

import { getMangaDetails } from '@/lib/manga';

import { db } from '../';
import { mangaSources, manga as mangaTable } from '../schema'; // Import both schemas

interface ImportMangaInput {
  title: string;
  sourceName: string;
  sourceId: string;
}

type ImportResult = {
  success: true;
  slug: string;
  mangaId: string;
  isNewEntry: boolean;
} | {
  success: false;
  error: string;
};

export async function importMangaMetadataAction(input: ImportMangaInput): Promise<ImportResult> {
  console.log(`Import request for: "${input.title}" from ${input.sourceName} (ID: ${input.sourceId})`);

  if (!input.title || !input.sourceName || !input.sourceId) {
    return { success: false, error: 'Missing required fields (title, sourceName, sourceId).' };
  }

  // --- 1. Try to find existing canonical manga (Simple Title/Slug Match) ---
  // eslint-disable-next-line ts/no-unsafe-call
  const generatedSlug = slugify(input.title, { lower: true, strict: true, trim: true }) as string;
  let existingMangaId: string | null = null;
  let existingMangaSlug: string | null = null;

  if (generatedSlug) {
    try {
      const potentialMatch = await db.query.manga.findFirst({
        // Match on slug OR do a case-insensitive title match
        where: or(
          eq(mangaTable.slug, generatedSlug),
          ilike(mangaTable.title, input.title), // Basic title match
          // TODO: Could use more advanced matching here (pg_trgm?)
        ),
        columns: { id: true, slug: true },
      });

      if (potentialMatch) {
        existingMangaId = potentialMatch.id;
        existingMangaSlug = potentialMatch.slug;
        console.log(`Potential match found for "${input.title}" with existing manga ID: ${existingMangaId}`);
      }
    } catch (error) {
      console.error('Error checking for existing manga:', error);
      // Continue execution, will attempt to create new if match fails
    }
  } else {
    console.warn('Could not generate slug for title:', input.title);
    // Proceed without slug matching if slug generation failed
  }

  // --- 2. Fetch Detailed Metadata (Always fetch for latest info?) ---
  // Decide if you fetch details even if manga exists (to update) or only for new ones
  let detailedData: Manga | null = null;
  try {
    detailedData = await getMangaDetails(input.sourceId, input.sourceName);
    if (!detailedData) {
      throw new Error('Scraper did not return detailed data.');
    }
    console.log('Fetched details for:', detailedData.title || input.title);
  } catch (error) {
    console.error('Error fetching detailed manga data:', error);
    // If we failed to fetch details, maybe we shouldn't proceed? Or proceed with minimal data?
    // For now, let's return an error.
    return { success: false, error: 'Failed to fetch complete details from source.' };
  }

  // Prefer data from detailed fetch
  const finalTitle = detailedData.title || input.title;
  // eslint-disable-next-line ts/no-unsafe-call
  const finalSlug = existingMangaSlug || slugify(finalTitle, { lower: true, strict: true, trim: true }) as string;
  if (!finalSlug)
    return { success: false, error: 'Could not generate final slug.' };

  // --- 3. Handle Existing Manga Match ---
  if (existingMangaId) {
    // Check if this specific source is already linked
    try {
      const existingSource = await db.query.mangaSources.findFirst({
        where: and(
          eq(mangaSources.mangaId, existingMangaId),
          eq(mangaSources.sourceName, input.sourceName),
        ),
        columns: { id: true },
      });

      if (existingSource) {
        console.log(`Source "${input.sourceName}" already linked to manga ${existingMangaId}. Updating check info.`);

        // Optionally: Update canonical manga data if detailed data is better? (e.g., cover)
        // await db.update(mangaTable).set({ coverUrl: ... }).where(eq(mangaTable.id, existingMangaId));

        return { success: true, slug: finalSlug, mangaId: existingMangaId, isNewEntry: false };
      } else {
        console.log(`Linking new source "${input.sourceName}" to existing manga ${existingMangaId}.`);

        // Link new source to existing manga
        await db.insert(mangaSources).values({
          mangaId: existingMangaId,
          sourceName: input.sourceName,
          sourceMangaId: input.sourceId,
          sourceUrl: detailedData.url,
          isPreferredSource: false, // Set preferred source logic later if needed
        });

        // Revalidate paths?
        revalidatePath(`/manga/${finalSlug}`);
        return { success: true, slug: finalSlug, mangaId: existingMangaId, isNewEntry: false };
      }
    } catch (error) {
      console.error('Error handling existing manga source linking:', error);
      return { success: false, error: 'Failed to link source to existing manga.' };
    }
  } else {
    console.log(`Creating new canonical manga entry for "${finalTitle}" with slug "${finalSlug}".`);
    // Create new canonical manga entry AND the first source entry
    try {
      const insertedManga = await db.transaction(async (tx) => {
        // Insert canonical manga data
        const newManga = await tx.insert(mangaTable).values({
          // id: generated automatically by DB
          slug: finalSlug,
          title: finalTitle,
          description: detailedData.excerpt,
          coverUrl: detailedData.image,
          status: detailedData.status,
          genres: detailedData.genres || [],
        }).returning({ id: mangaTable.id, slug: mangaTable.slug }); // Return the new ID and slug

        if (!newManga || newManga.length === 0 || !newManga[0].id) {
          throw new Error('Failed to insert new manga or retrieve its ID.');
        }
        const newMangaId = newManga[0].id;
        const newMangaSlug = newManga[0].slug;

        // Insert the first source link
        await tx.insert(mangaSources).values({
          mangaId: newMangaId,
          sourceName: input.sourceName,
          sourceMangaId: input.sourceId,
          sourceUrl: detailedData.url,
          isPreferredSource: true, // Mark the first source as preferred by default
        });

        return { id: newMangaId, slug: newMangaSlug };
      });

      console.log('Successfully created new manga and source:', insertedManga.slug);
      // Revalidate? Probably not needed immediately for a new entry.
      return { success: true, slug: insertedManga.slug, mangaId: insertedManga.id, isNewEntry: true };
    } catch (error) {
      const dbError = error as DatabaseError;
      console.error('Error creating new manga entry:', error);

      // Check for unique constraint violation on slug (race condition?)
      if (dbError.code === '23505' && dbError.constraint?.includes('manga_slug_idx')) {
        return { success: false, error: 'A manga with a similar title might have been added concurrently. Please try searching again.' };
      }
      return { success: false, error: 'Failed to save new manga to database.' };
    }
  }
}
