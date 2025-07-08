import { NextResponse } from 'next/server';
import logger from '@/lib/logger';

import {
  getLastChapter,
  getLastCheckedMangas,
  insertChapters,
  retrieveChapters,
  retrieveManga,
  upsertManga,
} from '@/lib/service/manga';

export interface ResponseSuccess {
  success: true;
  message: string;
}

export interface ResponseError {
  success: false;
  error: string;
}

export async function GET(request: Request): Promise<NextResponse<ResponseSuccess | ResponseError>> {
  const authHeader = request.headers.get('authorization');
  const currentCronSecret = process.env.CRON_SECRET;
  if (process.env.NODE_ENV === 'production' && (!currentCronSecret || authHeader !== `Bearer ${currentCronSecret}`)) {
    logger.warn('Unauthorized attempt to run cron job');
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  logger.info('Starting manga update cron job...');

  try {
    const mangas = await getLastCheckedMangas();
    if (mangas.length === 0) {
      logger.info('No mangas found in the database to check for updates.');
      return NextResponse.json({ success: true, message: 'No mangas to update' });
    }

    logger.info({ mangaCount: mangas.length }, `Found ${mangas.length} mangas to check for updates.`);

    let mangasUpdated = 0;
  let newChaptersAdded = 0;

  for (const currentManga of mangas) {
    logger.debug({ mangaId: currentManga.id, sourceName: currentManga.sourceName, sourceId: currentManga.sourceId }, 'Processing manga for update check.');
    try {
      const fetchedManga = await retrieveManga(currentManga.sourceName, currentManga.sourceId);
      if (currentManga.chaptersCount === fetchedManga.chaptersCount) {
        logger.trace({ mangaId: currentManga.id }, 'Manga chapter count matches fetched count, skipping.');
        continue;
      }

      logger.info({ mangaId: currentManga.id, dbChapters: currentManga.chaptersCount, fetchedChapters: fetchedManga.chaptersCount }, 'Chapter count mismatch, proceeding to fetch chapters.');

      const lastChapter = await getLastChapter(currentManga.id);
      logger.debug({ mangaId: currentManga.id, lastChapterIndex: lastChapter?.index }, 'Retrieved last known chapter from DB.');

      const fetchedChapters = await retrieveChapters(currentManga.sourceName, currentManga.sourceId, currentManga.id);
      const newChapters = fetchedChapters.filter(chapter => chapter.index > (lastChapter?.index ?? -1));

      if (newChapters.length > 0) {
        logger.info({ mangaId: currentManga.id, newChapterCount: newChapters.length }, `Found ${newChapters.length} new chapters.`);
        newChaptersAdded += newChapters.length;

        await upsertManga(fetchedManga); // Upsert manga details (like updated chapter count)
        await insertChapters(newChapters); // Insert only the new chapters
        mangasUpdated++;
      } else {
        logger.info({ mangaId: currentManga.id }, 'No new chapters found despite count mismatch. Might be a source data issue or already synced.');
        // Optionally, still upsert fetchedManga if other details might have changed
        await upsertManga(fetchedManga);
      }
    } catch (error) {
      logger.error({ mangaId: currentManga.id, error }, 'Error processing a single manga during cron update.');
      // Continue to the next manga
    }
  }

  logger.info({ newChaptersAdded, mangasUpdated }, `Cron job finished. Added ${newChaptersAdded} chapters in ${mangasUpdated} mangas.`);
  return NextResponse.json({ success: true, message: `added ${newChaptersAdded} chapters in ${mangasUpdated} mangas` });
  } catch (error) {
    logger.error({ error }, 'Critical error during manga update cron job execution.');
    return NextResponse.json({ success: false, error: 'Cron job failed. Check server logs.' }, { status: 500 });
  }
}
