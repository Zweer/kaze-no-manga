import { NextResponse } from 'next/server';
import { MangaScraper } from '@zweer/manga-scraper';
import { db } from '@/lib/db';
import { mangaTable, chapterTable, type ChapterInsert } from '@/lib/db/model/manga';
import { asc, eq, isNull, and, inArray } from 'drizzle-orm';

// It's good practice to secure your cron jobs.
// You can set CRON_SECRET in your Vercel environment variables.
const CRON_SECRET = process.env.CRON_SECRET;

export async function GET(request: Request) {
  // 1. Authenticate the request (optional but recommended)
  const authHeader = request.headers.get('authorization');
  if (process.env.NODE_ENV === 'production' && (!CRON_SECRET || authHeader !== `Bearer ${CRON_SECRET}`)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  console.log('Starting manga update cron job...');

  try {
    // 2. Fetch 10 least recently checked mangas
    const mangasToUpdate = await db
      .select()
      .from(mangaTable)
      .orderBy(asc(mangaTable.lastCheckedAt).nullsFirst()) // Ensures NULLs are treated as oldest
      .limit(10);

    if (mangasToUpdate.length === 0) {
      console.log('No mangas found to update.');
      return NextResponse.json({ message: 'No mangas to update.' });
    }

    console.log(`Found ${mangasToUpdate.length} mangas to check for updates.`);
    let totalNewChaptersAdded = 0;

    for (const manga of mangasToUpdate) {
      console.log(`Checking manga: ${manga.title} (ID: ${manga.id}, Source: ${manga.sourceName}, SourceID: ${manga.sourceId})`);
      try {
        const scraper = new MangaScraper(manga.sourceName as any); // Type assertion might be needed depending on scraper's constructor
        const remoteManga = await scraper.getManga(manga.sourceId);

        if (!remoteManga) {
          console.warn(`Scraper returned no data for manga: ${manga.title} (ID: ${manga.id}, SourceID: ${manga.sourceId}). Skipping.`);
          // Update lastCheckedAt to avoid re-checking immediately if the source consistently returns nothing.
          await db.update(mangaTable).set({ lastCheckedAt: new Date() }).where(eq(mangaTable.id, manga.id));
          continue;
        }

        if (!remoteManga.chapters || remoteManga.chapters.length === 0) {
          console.log(`No chapters listed remotely for manga: ${manga.title} (ID: ${manga.id}, SourceID: ${manga.sourceId}). It might be a new manga or an issue with the source page.`);
          // Update lastCheckedAt as we've successfully checked it.
          await db.update(mangaTable).set({ lastCheckedAt: new Date() }).where(eq(mangaTable.id, manga.id));
          continue;
        }

        // Get existing chapter sourceIds for this manga
        const existingChapters = await db
          .select({ sourceId: chapterTable.sourceId })
          .from(chapterTable)
          .where(eq(chapterTable.mangaId, manga.id));

        const existingChapterSourceIds = new Set(existingChapters.map(c => c.sourceId));

        const newChapters: ChapterInsert[] = [];
        for (const remoteChapter of remoteManga.chapters) {
          if (!existingChapterSourceIds.has(remoteChapter.id)) {
            newChapters.push({
              sourceName: manga.sourceName,
              sourceId: remoteChapter.id,
              mangaId: manga.id,
              title: remoteChapter.title || `Chapter ${remoteChapter.index}`,
              index: remoteChapter.index,
              releasedAt: remoteChapter.releasedAt ? new Date(remoteChapter.releasedAt) : null,
              images: remoteChapter.images || [], // Ensure images is an array
              // createdAt and updatedAt will be handled by the `timestamps` helper if configured
            });
          }
        }

        if (newChapters.length > 0) {
          console.log(`Adding ${newChapters.length} new chapters for manga: ${manga.title}`);
          await db.insert(chapterTable).values(newChapters);
          totalNewChaptersAdded += newChapters.length;
        } else {
          console.log(`No new chapters found for manga: ${manga.title}`);
        }

        // Update lastCheckedAt and chaptersCount for the manga
        const updatedChapterCount = (manga.chaptersCount || 0) + newChapters.length; // Or requery count for accuracy
        await db
          .update(mangaTable)
          .set({
            lastCheckedAt: new Date(),
            chaptersCount: updatedChapterCount, // Update with the new total
          })
          .where(eq(mangaTable.id, manga.id));

      } catch (error: any) { // Specify 'any' or 'unknown' and then check type if necessary
        let errorMessage = `Error processing manga ${manga.title} (ID: ${manga.id}, Source: ${manga.sourceName}, SourceID: ${manga.sourceId})`;
        if (error instanceof Error) {
          errorMessage += `: ${error.message}`;
        }
        console.error(errorMessage, error); // Log the full error object for stack trace etc.

        // Regarding updating lastCheckedAt on error:
        // - Not updating it means the job will retry this manga soon. Good for transient issues.
        // - Updating it means the job might skip this manga for a while. Good for persistent issues with one manga.
        // - A more advanced strategy could involve a retry_count or failure_flag on the mangaTable.
        // For now, we do not update lastCheckedAt on error to allow retries for transient network/scraper issues.
        // Consider adding alerting if a specific manga fails repeatedly.
      }
    }

    console.log(`Manga update cron job finished. Checked ${mangasToUpdate.length} mangas. Total new chapters added: ${totalNewChaptersAdded}.`);
    return NextResponse.json({
      message: 'Manga update process completed.',
      mangasChecked: mangasToUpdate.length,
      totalNewChaptersAdded,
    });

  } catch (error) {
    console.error('Error in manga update cron job:', error);
    return NextResponse.json({ error: 'Failed to update mangas.' }, { status: 500 });
  }
}
