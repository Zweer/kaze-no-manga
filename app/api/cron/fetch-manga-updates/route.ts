import { NextResponse } from 'next/server';

import {
  getLastChapter,
  getLastCheckedMangas,
  insertChapters,
  retrieveChapters,
  retrieveManga,
  upsertManga,
} from '@/lib/service/manga';

// const CRON_SECRET = process.env.CRON_SECRET; // Moved inside GET

interface ResponseSuccess {
  success: true;
  message: string;
}

interface ResponseError {
  success: false;
  error: string;
}

export async function GET(request: Request): Promise<NextResponse<ResponseSuccess | ResponseError>> {
  const authHeader = request.headers.get('authorization');
  const currentCronSecret = process.env.CRON_SECRET; // Read at time of execution
  if (process.env.NODE_ENV === 'production' && (!currentCronSecret || authHeader !== `Bearer ${currentCronSecret}`)) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  console.log('Starting manga update cron job...');

  const mangas = await getLastCheckedMangas();
  if (mangas.length === 0) {
    console.log('No mangas found');
    return NextResponse.json({ success: true, message: 'No mangas to update' });
  }

  console.log(`Found ${mangas.length} mangas to check for updates...`);

  let mangasUpdated = 0;
  let newChaptersAdded = 0;

  for (const manga of mangas) {
    const fetchedManga = await retrieveManga(manga.sourceName, manga.sourceId);
    if (manga.chaptersCount === fetchedManga.chaptersCount) {
      continue;
    }

    const lastChapter = await getLastChapter(manga.id);
    const fetchedChapters = await retrieveChapters(manga.sourceName, manga.sourceId, manga.id);
    const newChapters = fetchedChapters.filter(chapter => chapter.index > (lastChapter?.index ?? -1));

    mangasUpdated++;
    newChaptersAdded += newChapters.length;

    await upsertManga(fetchedManga);
    await insertChapters(newChapters);
  }

  return NextResponse.json({ success: true, message: `added ${newChaptersAdded} chapters in ${mangasUpdated} mangas` });
}
