'use server'; // Mark this as potentially usable in Server Actions/Components

import { and, eq } from 'drizzle-orm'; // Drizzle query helpers
import { revalidatePath } from 'next/cache'; // For revalidating cache after mutations

import { auth } from '@/lib/auth'; // Get server-side session

import { db } from '../index'; // Your Drizzle instance
import { userLibrary } from '../schema'; // Your userLibrary table schema

/**
 * Checks if a specific manga is in the current user's library.
 * Can be called from Server Components or Server Actions.
 * @param mangaSlug - The slug of the manga to check.
 * @returns boolean - True if the manga is in the library, false otherwise.
 */
export async function isMangaInLibrary(mangaSlug: string): Promise<boolean> {
  const session = await auth(); // Get session server-side
  const userId = session?.user?.id;

  if (!userId) {
    // Not logged in, cannot be in library
    return false;
  }
  if (!mangaSlug) {
    console.error('isMangaInLibrary: mangaSlug is required');
    return false;
  }

  try {
    const entry = await db.query.userLibrary.findFirst({
      where: and(
        eq(userLibrary.userId, userId),
        eq(userLibrary.mangaSlug, mangaSlug),
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
 * @param mangaSlug - The slug of the manga to add.
 * @returns Object indicating success or error.
 */
export async function addMangaToLibrary(mangaSlug: string): Promise<{ success: boolean; error?: string }> {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    return { success: false, error: 'User not authenticated.' };
  }
  if (!mangaSlug) {
    return { success: false, error: 'Manga slug is required.' };
  }

  try {
    // Attempt to insert into the userLibrary table
    await db.insert(userLibrary).values({
      userId,
      mangaSlug,
      // status: 'Reading', // Default status is set in schema
      // addedAt: new Date() // Default is set in schema
    });
    // Optional: Use .onConflictDoNothing() if you want to ignore errors if the entry already exists
    // .onConflictDoNothing();

    // Revalidate relevant paths to update UI cache
    revalidatePath(`/library`); // Revalidate the library page
    revalidatePath(`/manga/${mangaSlug}`); // Revalidate the manga detail page

    return { success: true };
  } catch (error: any) {
    console.error('Error adding manga to library:', error);
    // Check for unique constraint violation (already in library)
    if (error.code === '23505') { // Postgres unique violation code
      return { success: false, error: 'Manga already in library.' };
    }
    return { success: false, error: 'Failed to add manga to library.' };
  }
}

/**
 * Removes a manga from the current user's library.
 * Designed to be called from Server Actions or API routes.
 * @param mangaSlug - The slug of the manga to remove.
 * @returns Object indicating success or error.
 */
export async function removeMangaFromLibrary(mangaSlug: string): Promise<{ success: boolean; error?: string }> {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    return { success: false, error: 'User not authenticated.' };
  }
  if (!mangaSlug) {
    return { success: false, error: 'Manga slug is required.' };
  }

  try {
    // Delete the entry from the userLibrary table
    const result = await db.delete(userLibrary).where(
      and(
        eq(userLibrary.userId, userId),
        eq(userLibrary.mangaSlug, mangaSlug),
      ),
    ).returning({ mangaSlug: userLibrary.mangaSlug }); // Check if something was deleted

    if (result.length === 0) {
      // This case should ideally not happen if UI prevents removing non-existent entries
      console.warn('Attempted to remove manga not found in library:', { userId, mangaSlug });
      // Return success anyway or a specific message? Let's return success.
      // return { success: false, error: "Manga not found in library." };
    }

    // Revalidate relevant paths
    revalidatePath(`/library`);
    revalidatePath(`/manga/${mangaSlug}`);

    return { success: true };
  } catch (error) {
    console.error('Error removing manga from library:', error);
    return { success: false, error: 'Failed to remove manga from library.' };
  }
}

// --- Add functions for updating status, rating, notes etc. later ---
// export async function updateMangaStatus(...) { ... }
