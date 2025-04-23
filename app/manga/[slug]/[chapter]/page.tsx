import { eq } from 'drizzle-orm';
import { notFound } from 'next/navigation';

import { MangaReader } from '@/components/manga/MangaReader';
import { db } from '@/lib/db';
import { mangaSources, manga as mangaTable } from '@/lib/db/schema'; // Include mangaSources
import { getChapterDetails } from '@/lib/manga';

interface MangaReaderPageProps {
  params: {
    slug: string;
    chapter: string; // This is the chapterNumber (source ID/slug)
  };
}

async function fetchReaderData(slug: string, chapterNumber: string) {
  const mangaData = await db.query.manga.findFirst({
    where: eq(mangaTable.slug, slug),
    columns: { id: true, title: true },
    // Include preferred source to get chapter details
    with: {
      sources: {
        where: eq(mangaSources.isPreferredSource, true),
        limit: 1,
        columns: { sourceName: true, sourceMangaId: true }, // Need these for getChapterDetails
      },
      // Include fallback source logic if needed
    },
  });

  if (!mangaData)
    return { error: 'Manga not found' };

  // Find the preferred source or a fallback
  let sourceToUse = mangaData.sources?.[0];
  if (!sourceToUse) {
    const fallbackSource = await db.query.mangaSources.findFirst({
      where: eq(mangaSources.mangaId, mangaData.id),
      orderBy: mangaSources.id,
      columns: { sourceName: true, sourceMangaId: true },
    });
    if (!fallbackSource)
      return { error: 'No source available for this manga' };
    sourceToUse = fallbackSource;
  }

  // Verify chapter exists in our DB (optional but good)
  // const chapterExists = await db.query.chapters.findFirst({...});
  // if (!chapterExists) return { error: 'Chapter not listed' };

  // Fetch chapter images using the wrapper function
  try {
    const chapterDetails = await getChapterDetails(
      sourceToUse.sourceMangaId, // ID on source
      sourceToUse.sourceName,
      chapterNumber, // The chapter identifier (e.g., '10', '10-5')
    );

    if (!chapterDetails?.images || chapterDetails.images.length === 0) {
      return { error: 'No images found for this chapter on the source.' };
    }

    return {
      mangaTitle: mangaData.title,
      chapterNumber, // Use the identifier passed in URL
      imageUrls: chapterDetails.images,
      // TODO: Fetch prev/next chapter numbers from DB here
      // prevChapter: ...,
      // nextChapter: ...,
    };
  } catch (error) {
    console.error('Error fetching chapter details:', error);
    return { error: 'Failed to load chapter details from source.' };
  }
}

export default async function MangaReaderPage({ params }: MangaReaderPageProps) {
  const { slug, chapter } = params;
  // const session = await auth(); // Needed for progress update later

  const readerData = await fetchReaderData(slug, chapter);

  if (readerData.error) {
    // Handle error - maybe show a specific error page?
    // For now, just show notFound
    console.error('Reader Page Error:', readerData.error);
    notFound();
  }

  return (
    <div className="reader-container">
      <MangaReader
        mangaTitle={readerData.mangaTitle!} // Assert non-null as error is handled
        chapterNumber={readerData.chapterNumber!}
        imageUrls={readerData.imageUrls!}
        mangaSlug={slug} // Pass slug for back button link
        // Pass prev/next later
        // Pass mangaId/userId later for progress update
      />
    </div>
  );
}

// Optional: Generate Metadata for the reader page
export async function generateMetadata({ params }: MangaReaderPageProps) {
  const { slug, chapter } = params;
  // Could fetch manga title here again for accuracy
  const title = slug.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()); // Basic title generation
  return {
    title: `Read ${title} Chapter ${chapter} | Kaze No Manga`,
    // Prevent indexing of reader pages?
    robots: { index: false, follow: false },
  };
}
