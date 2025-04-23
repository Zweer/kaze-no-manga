'use server';

import type { DatabaseError } from '@neondatabase/serverless';

import type { Manga } from '@/lib/manga/types';

import { and, eq, ilike, or } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import slugify from 'slugify';

import { getMangaDetails } from '@/lib/manga';

import { db } from '../index';
import { mangaSources, manga as mangaTable } from '../schema';

interface ImportMangaInput {
  title: string; // Title from search result (for matching/fallback)
  sourceName: string;
  sourceMangaId: string; // ID on the source
  sourceUrl?: string; // URL from search result (optional)
}

interface ImportResult {
  success: boolean;
  slug?: string;
  mangaId?: string;
  isNewEntry?: boolean;
  error?: string;
}

export async function importMangaMetadataAction(input: ImportMangaInput): Promise<ImportResult> {
  console.log(`Import request for sourceId: "${input.sourceMangaId}" from ${input.sourceName}`);

  if (!input.sourceName || !input.sourceMangaId) {
    return { success: false, error: 'Missing required sourceName or sourceMangaId.' };
  }

  // --- 1. Fetch Detailed Metadata using your wrapper ---
  let detailedData: Manga | null = null;
  try {
    detailedData = await getMangaDetails(input.sourceMangaId, input.sourceName);
    if (!detailedData || !detailedData.title) { // Ensure we got essential data like title
      throw new Error('Scraper did not return valid detailed data or title.');
    }
    console.log('Fetched details for:', detailedData.title);
  } catch (error) {
    console.error('Error fetching detailed manga data via getMangaDetails:', error);
    return { success: false, error: 'Failed to fetch complete details from source.' };
  }

  // --- 2. Generate Slug and Check for Existing Canonical Manga ---
  const finalTitle = detailedData.title; // Use the definitive title from details
  // eslint-disable-next-line ts/no-unsafe-call
  const generatedSlug = slugify(finalTitle, { lower: true, strict: true, trim: true }) as string;
  if (!generatedSlug) {
    return { success: false, error: 'Could not generate a valid slug from the title.' };
  }

  let existingMangaId: string | null = null;
  let existingMangaSlug: string | null = null;

  try {
    // Prioritize matching by unique source first
    const sourceMatch = await db.query.mangaSources.findFirst({
      where: and(
        eq(mangaSources.sourceName, input.sourceName),
        eq(mangaSources.sourceMangaId, input.sourceMangaId),
      ),
      columns: { mangaId: true }, // Get the linked canonical manga ID
      with: { // Include the slug from the canonical manga
        manga: { columns: { slug: true } },
      },
    });

    if (sourceMatch && sourceMatch.manga) {
      // Already imported this exact source before
      console.log(`Source "${input.sourceName}/${input.sourceMangaId}" already linked to manga ID: ${sourceMatch.mangaId}`);
      return { success: true, slug: sourceMatch.manga.slug, mangaId: sourceMatch.mangaId, isNewEntry: false };
    }

    // If exact source not found, try matching by slug/title for potential linking
    const potentialMatch = await db.query.manga.findFirst({
      where: or(
        eq(mangaTable.slug, generatedSlug),
        ilike(mangaTable.title, finalTitle),
      ),
      columns: { id: true, slug: true },
    });
    if (potentialMatch) {
      existingMangaId = potentialMatch.id;
      existingMangaSlug = potentialMatch.slug; // Use the existing slug
      console.log(`Potential match found for "${finalTitle}" with existing manga ID: ${existingMangaId}`);
    }
  } catch (error) {
    console.error('Error checking for existing manga/source:', error);
    return { success: false, error: 'Database error during check.' };
  }

  const finalSlug = existingMangaSlug || generatedSlug; // Use existing slug if matched

  // --- 3. Handle Existing Manga Match (Link New Source) ---
  if (existingMangaId) {
    console.log(`Linking new source "${input.sourceName}/${input.sourceMangaId}" to existing manga ${existingMangaId}.`);
    try {
      await db.insert(mangaSources).values({
        mangaId: existingMangaId,
        sourceName: input.sourceName,
        sourceMangaId: input.sourceMangaId,
        sourceUrl: detailedData.url, // Use URL from detailed data
        // Don't set chapter info here, that's for the update job
        // lastChapterChecked: ??? ,
        // lastCheckedAt: ??? ,
        isPreferredSource: false, // Maybe set first source added as preferred later?
      }).onConflictDoNothing(); // Avoid errors if somehow inserted concurrently

      // Update canonical manga if new source has better data? (e.g., cover)
      // await db.update(mangaTable).set({ coverUrl: detailedData.image }).where(eq(mangaTable.id, existingMangaId));

      revalidatePath(`/manga/${finalSlug}`);
      return { success: true, slug: finalSlug, mangaId: existingMangaId, isNewEntry: false };
    } catch (error) {
      console.error('Error linking source to existing manga:', error);
      return { success: false, error: 'Failed to link source.' };
    }
  } else {
    console.log(`Creating new canonical manga entry for "${finalTitle}" with slug "${finalSlug}".`);
    try {
      const insertedManga = await db.transaction(async (tx) => {
        const newManga = await tx.insert(mangaTable).values({
          slug: finalSlug,
          title: finalTitle,
          // author: detailedData.author,
          // artist: ???, // If your scraper provides it
          description: detailedData.excerpt,
          coverUrl: detailedData.image,
          status: detailedData.status,
          genres: detailedData.genres || [],
        }).returning({ id: mangaTable.id, slug: mangaTable.slug });

        if (!newManga?.[0]?.id)
          throw new Error('Failed to insert new manga.');
        const newMangaId = newManga[0].id;

        await tx.insert(mangaSources).values({
          mangaId: newMangaId,
          sourceName: input.sourceName,
          sourceMangaId: input.sourceMangaId,
          sourceUrl: detailedData.url,
          // Don't set chapter info here
          isPreferredSource: true, // Mark first source as preferred
        });

        return { id: newMangaId, slug: finalSlug };
      });

      console.log('Successfully created new manga and source:', insertedManga.slug);
      return { success: true, slug: insertedManga.slug, mangaId: insertedManga.id, isNewEntry: true };
    } catch (error) {
      const dbError = error as DatabaseError;
      console.error('Error creating new manga entry:', dbError);

      if (dbError.code === '23505' && dbError.constraint?.includes('manga_slug_idx')) {
        return { success: false, error: 'A manga with this slug already exists. Try searching again.' };
      }
      if (dbError.code === '23505' && dbError.constraint?.includes('manga_sources_unique_idx')) {
        // This case means the source was likely just added by another process/retry
        console.warn('Source likely already exists:', input.sourceName, input.sourceMangaId);
        // Attempt to find the mangaId it belongs to
        const existingSource = await db.query.mangaSources.findFirst({
          where: and(eq(mangaSources.sourceName, input.sourceName), eq(mangaSources.sourceMangaId, input.sourceMangaId)),
          columns: { mangaId: true },
          with: { manga: { columns: { slug: true } } },
        });
        if (existingSource?.manga) {
          return { success: true, slug: existingSource.manga.slug, mangaId: existingSource.mangaId, isNewEntry: false };
        } else {
          return { success: false, error: 'Failed to save manga source (conflict).' };
        }
      }
      return { success: false, error: 'Failed to save new manga to database.' };
    }
  }
}
