'use server';

import type { DatabaseError } from '@neondatabase/serverless';
import type { ConnectorNames, Manga } from '@zweer/manga-scraper';

import { connectors } from '@zweer/manga-scraper';
import { and, eq } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';

import { db } from '../';
import { manga as mangaTable } from '../schema';

type ImportResult = {
  success: true;
  manga: typeof mangaTable.$inferSelect;
} | {
  success: false;
  error: string;
};

export async function importMangaMetadataAction(sourceName: ConnectorNames, sourceId: string): Promise<ImportResult> {
  console.log('Attempting to import manga:', sourceId, 'from', sourceName);

  // 2. Check if manga with this slug already exists in our DB
  try {
    const existingManga = await db.query.manga.findFirst({
      where: and(
        eq(mangaTable.sourceMangaId, sourceId),
        eq(mangaTable.sourceName, sourceName),
      ),
    });

    if (existingManga) {
      console.log('Manga already exists in DB:', existingManga.title);
      // Manga already exists, maybe just return success? Or update?
      // For now, just return success indicating it's available.
      return { success: true, manga: existingManga };
    }
  } catch (error) {
    console.error('Error checking for existing manga:', error);
    return { success: false, error: 'Database error checking for existing manga.' };
  }

  // 3. Fetch detailed metadata using the scraper's detail fetch function
  let detailedData: Manga | null = null;
  try {
    // Use the specific identifier and source to get full details
    // Your fetchMangaDetails might need identifier, source, or sourceUrl
    detailedData = await connectors[sourceName].getManga(sourceId);

    if (!detailedData) {
      throw new Error('Scraper did not return detailed data.');
    }
    console.log('Fetched detailed data for:', detailedData.title);
  } catch (error) {
    console.error('Error fetching detailed manga data from scraper:', error);
    return { success: false, error: 'Failed to fetch complete details from source.' };
  }

  // 5. Insert into the database
  try {
    const [manga] = await db.insert(mangaTable).values({
      slug: detailedData.slug,
      title: detailedData.title!,
      // author: detailedData.author,
      description: detailedData.excerpt,
      coverUrl: detailedData.image,
      sourceMangaId: sourceId,
      sourceName,
      sourceUrl: detailedData.url,
      genres: detailedData.genres,
      status: detailedData.status,
    }).returning();
    console.log('Successfully inserted manga:', manga);

    // Revalidate search page? Or maybe not needed immediately.
    // Revalidate the new manga's page if we redirect there
    revalidatePath(`/manga/${manga.slug}`);

    return { success: true, manga };
  } catch (error: any) {
    const dbError = error as DatabaseError;
    console.error('Error inserting manga into database:', dbError);

    // Check for unique constraint violation (just in case, race condition?)
    if (dbError.code === '23505') {
      console.warn('Manga likely already inserted due to race condition:', detailedData.title);

      const manga = await db.query.manga.findFirst({
        where: and(
          eq(mangaTable.sourceMangaId, sourceId),
          eq(mangaTable.sourceName, sourceName),
        ),
      });

      return { success: true, manga: manga! };
    }
    return { success: false, error: 'Failed to save manga to database.' };
  }
}
