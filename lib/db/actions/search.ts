'use server';

import { ilike, or } from 'drizzle-orm'; // Import 'ilike' for case-insensitive search

import { db } from '../';
import { manga as mangaTable } from '../schema';

// Define the structure of the returned manga data
interface MangaSearchResult {
  slug: string;
  title: string;
  coverUrl: string | null;
  author: string | null;
}

export async function searchInternalManga(query: string): Promise<MangaSearchResult[]> {
  if (!query || query.trim().length < 3) {
    return [];
  }

  const searchTerm = `%${query.trim()}%`; // Add wildcards for 'like'/'ilike'

  try {
    const results = await db
      .select({
        slug: mangaTable.slug,
        title: mangaTable.title,
        coverUrl: mangaTable.coverUrl,
        author: mangaTable.author,
      })
      .from(mangaTable)
      .where(
        // Search in title OR author (case-insensitive)
        or(
          ilike(mangaTable.title, searchTerm),
          ilike(mangaTable.author, searchTerm), // Search author only if it exists
        ),
      )
      .limit(10); // Limit the number of results

    return results;
  } catch (error) {
    console.error('Error searching internal manga:', error);
    return []; // Return empty array on error
  }
}
