import { eq } from 'drizzle-orm';
import Image from 'next/image'; // Use Next.js Image for optimization
import { notFound } from 'next/navigation';

import { LibraryToggleButton } from '@/components/manga/LibraryToggleButton'; // Our new client component
import { Button } from '@/components/ui/button';
import { auth } from '@/lib/auth'; // Server-side session
import { db } from '@/lib/db';
import { isMangaInLibrary } from '@/lib/db/libraryActions'; // Server action to check library status
import { manga as mangaTable } from '@/lib/db/schema'; // Manga table schema

// Optional: Revalidate this page periodically or on demand
// export const revalidate = 3600; // Revalidate every hour

interface MangaDetailPageProps {
  params: {
    slug: string;
  };
}

export default async function MangaDetailPage({ params }: MangaDetailPageProps) {
  const { slug } = params;
  const session = await auth(); // Get session on the server
  const userId = session?.user?.id;

  // Fetch manga metadata
  const mangaData = await db.query.manga.findFirst({
    where: eq(mangaTable.slug, slug),
    // Optionally fetch related data like chapters count here later
  });

  if (!mangaData) {
    notFound(); // Show 404 if manga slug is invalid
  }

  // Check if manga is in library (only if user is logged in)
  const initialIsInLibrary = userId ? await isMangaInLibrary(slug) : false;

  // TODO: Fetch user's reading progress for this manga if logged in

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Left Column: Cover Image */}
        <div className="md:col-span-1">
          {mangaData.coverUrl
            ? (
                <Image
                  src={mangaData.coverUrl}
                  alt={`Cover for ${mangaData.title}`}
                  width={300} // Adjust width as needed
                  height={450} // Adjust height based on typical cover ratio
                  className="rounded-md shadow-lg object-cover w-full"
                  priority // Prioritize loading cover image
                />
              )
            : (
                <div className="w-full h-[450px] bg-muted rounded-md flex items-center justify-center">
                  <span className="text-muted-foreground">No Image</span>
                </div>
              )}
        </div>

        {/* Right Column: Details and Actions */}
        <div className="md:col-span-2 space-y-4">
          <h1 className="text-3xl font-bold">{mangaData.title}</h1>
          <div className="text-lg text-muted-foreground">
            {mangaData.author && (
              <span>
                Author:
                {mangaData.author}
              </span>
            )}
            {/* Add Artist if available */}
          </div>
          <div className="flex flex-wrap gap-2">
            <span className="px-2 py-1 bg-secondary text-secondary-foreground text-xs font-medium rounded-full">
              {mangaData.status || 'Unknown Status'}
            </span>
            {mangaData.genres?.map(genre => (
              <span key={genre} className="px-2 py-1 bg-muted text-muted-foreground text-xs font-medium rounded-full">
                {genre}
              </span>
            ))}
          </div>

          <div className="prose dark:prose-invert max-w-none">
            {' '}
            {/* Apply typography styles */}
            <p>{mangaData.description || 'No description available.'}</p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-4 pt-4">
            {/* Reading Progress Button (Placeholder) */}
            <Button size="sm">
              {/* TODO: Logic based on reading progress */}
              Start Reading (Ch. 1)
            </Button>

            {/* Add/Remove from Library Button */}
            <LibraryToggleButton
              mangaSlug={slug}
              initialIsInLibrary={initialIsInLibrary}
            />

            {/* Add to List Button (Placeholder) */}
            <Button variant="outline" size="sm" disabled={!userId}>
              Add to List
            </Button>
          </div>

          {/* TODO: Chapter List Section */}

        </div>
      </div>
    </div>
  );
}

// Helper to generate Metadata (Title, Description) for the page
export async function generateMetadata({ params }: MangaDetailPageProps) {
  const { slug } = params;
  const mangaData = await db.query.manga.findFirst({
    where: eq(mangaTable.slug, slug),
    columns: { title: true, description: true },
  });

  if (!mangaData) {
    return { title: 'Manga Not Found' };
  }

  return {
    title: `${mangaData.title} | Kaze No Manga`,
    description: mangaData.description?.substring(0, 160) || `Details for ${mangaData.title}`,
  };
}
