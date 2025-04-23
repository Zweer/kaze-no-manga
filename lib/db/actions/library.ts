'use server';

import type { DatabaseError } from '@neondatabase/serverless';

import { and, eq } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';

import { auth } from '@/lib/auth';

import { db } from '../';
import { manga as mangaTable, userLibrary } from '../schema';

/**
 * Checks if a specific manga is in the current user's library.
 * Can be called from Server Components or Server Actions.
 * @param mangaId - The id of the manga to check.
 * @returns boolean - True if the manga is in the library, false otherwise.
 */
export async function isMangaInLibrary(mangaId: string): Promise<boolean> {
  const session = await auth(); // Get session server-side
  const userId = session?.user?.id;

  if (!userId) {
    // Not logged in, cannot be in library
    return false;
  }

  if (!mangaId) {
    console.error('isMangaInLibrary: mangaId is required');
    return false;
  }

  try {
    const entry = await db.query.userLibrary.findFirst({
      where: and(
        eq(userLibrary.userId, userId),
        eq(userLibrary.mangaId, mangaId),
      ),
      columns: {
        userId: true, // Only need to check for existence
      },
    });
    return !!entry; // Return true if an entry exists, false otherwise
  } catch (error) {
    console.error('Error checking manga in library:', error);
    // Depending on desired behavior, you might want to return false or throw
    return false;
  }
}

/**
 * Adds a manga to the current user's library.
 * Designed to be called from Server Actions or API routes.
 * @param mangaId - The id of the manga to add.
 * @returns Object indicating success or error.
 */
export async function addMangaToLibrary(mangaId: string): Promise<{ success: boolean; error?: string }> {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    return { success: false, error: 'User not authenticated.' };
  }
  if (!mangaId) {
    return { success: false, error: 'Manga id is required.' };
  }

  try {
    // Attempt to insert into the userLibrary table
    await db.insert(userLibrary).values({
      userId,
      mangaId,
      // status: 'Reading', // Default status is set in schema
      // addedAt: new Date() // Default is set in schema
    });
    // Optional: Use .onConflictDoNothing() if you want to ignore errors if the entry already exists
    // .onConflictDoNothing();

    const manga = await db.query.manga.findFirst({
      where: eq(mangaTable.id, mangaId),
      columns: {
        slug: true,
      },
    });

    // Revalidate relevant paths to update UI cache
    revalidatePath(`/library`); // Revalidate the library page
    revalidatePath(`/manga/${manga!.slug}`); // Revalidate the manga detail page

    return { success: true };
  } catch (error) {
    const dbError = error as DatabaseError;
    console.error('Error adding manga to library:', dbError);

    // Check for unique constraint violation (already in library)
    if (dbError.code === '23505') { // Postgres unique violation code
      return { success: false, error: 'Manga already in library.' };
    }
    return { success: false, error: 'Failed to add manga to library.' };
  }
}

/**
 * Removes a manga from the current user's library.
 * Designed to be called from Server Actions or API routes.
 * @param mangaId - The slug of the manga to remove.
 * @returns Object indicating success or error.
 */
export async function removeMangaFromLibrary(mangaId: string): Promise<{ success: boolean; error?: string }> {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    return { success: false, error: 'User not authenticated.' };
  }
  if (!mangaId) {
    return { success: false, error: 'Manga id is required.' };
  }

  try {
    // Delete the entry from the userLibrary table
    const result = await db.delete(userLibrary).where(
      and(
        eq(userLibrary.userId, userId),
        eq(userLibrary.mangaId, mangaId),
      ),
    ).returning({ mangaId: userLibrary.mangaId }); // Check if something was deleted

    if (result.length === 0) {
      // This case should ideally not happen if UI prevents removing non-existent entries
      console.warn('Attempted to remove manga not found in library:', { userId, mangaId });
      // Return success anyway or a specific message? Let's return success.
      // return { success: false, error: "Manga not found in library." };
    }

    const manga = await db.query.manga.findFirst({
      where: eq(mangaTable.id, mangaId),
      columns: {
        slug: true,
      },
    });

    // Revalidate relevant paths
    revalidatePath(`/library`);
    revalidatePath(`/manga/${manga!.slug}`);

    return { success: true };
  } catch (error) {
    console.error('Error removing manga from library:', error);
    return { success: false, error: 'Failed to remove manga from library.' };
  }
}

// --- Add functions for updating status, rating, notes etc. later ---
// export async function updateMangaStatus(...) { ... }
