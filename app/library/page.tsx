import { desc, eq } from 'drizzle-orm';
import Link from 'next/link';
import { redirect } from 'next/navigation'; // For redirecting unauthenticated users

import { MangaCard } from '@/components/manga/MangaCard'; // We'll create this component
import { Button } from '@/components/ui/button';
import { auth } from '@/lib/auth'; // Server-side session helper
import { db } from '@/lib/db';
import { userLibrary } from '@/lib/db/schema'; // Import schemas

// Optional: Revalidate this page periodically or on demand
// export const revalidate = 60; // Revalidate every minute, for example

export default async function LibraryPage() {
  const session = await auth(); // Get session on the server

  // Redirect to login if user is not authenticated
  if (!session?.user?.id) {
    // You might want to redirect to a dedicated login page
    // or use the default NextAuth signin page
    redirect('/api/auth/signin?callbackUrl=/library');
  }

  const userId = session.user.id;

  // Fetch the user's library entries along with the manga metadata
  // Using Drizzle's relational queries defined in schema.ts
  const libraryEntries = await db.query.userLibrary.findMany({
    where: eq(userLibrary.userId, userId),
    orderBy: [desc(userLibrary.addedAt)], // Order by recently added (adjust as needed)
    with: {
      // Include the related manga data for each library entry
      manga: {
        columns: {
          slug: true,
          title: true,
          coverUrl: true,
          lastChapterChecked: true, // Needed to compare with lastChapterRead
          // Include other manga fields if needed by MangaCard
        },
      },
    },
    columns: { // Select only needed columns from userLibrary
      mangaSlug: true,
      lastChapterRead: true,
      addedAt: true,
      status: true, // Include reading status
      // rating: true, // Include rating if needed
    },
  });

  // console.log(libraryEntries); // For debugging

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">My Library</h1>

      {libraryEntries.length === 0
        ? (
            <div className="text-center py-10 bg-muted/50 rounded-lg">
              <p className="text-muted-foreground mb-4">
                Your library is empty.
              </p>
              <Link href="/search">
                {' '}
                {/* Assuming /search is where users find manga */}
                <Button variant="default">Find Manga to Read</Button>
              </Link>
            </div>
          )
        : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
              {libraryEntries.map(entry => (
                // Render a MangaCard for each entry
                // Pass necessary props to the card component
                <MangaCard
                  key={entry.mangaSlug}
                  slug={entry.manga.slug} // From included manga data
                  title={entry.manga.title} // From included manga data
                  coverUrl={entry.manga.coverUrl} // From included manga data
                  lastChapterRead={entry.lastChapterRead}
                  lastChapterChecked={entry.manga.lastChapterChecked} // Pass for NEW badge logic
                  readingStatus={entry.status} // Pass reading status
                />
              ))}
            </div>
          )}
      {/* Optional: Add filtering/sorting controls here */}
    </div>
  );
}

// Set page metadata
export const metadata = {
  title: 'My Library | Kaze No Manga',
  description: 'Your personal collection of manga.',
};
