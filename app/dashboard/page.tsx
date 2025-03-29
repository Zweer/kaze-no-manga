import Link from 'next/link';
import { redirect } from 'next/navigation';

import { AddMangaForm } from '@/components/manga/AddMangaForm'; // We'll create this next
import { auth } from '@/lib/auth'; // Server-side auth helper
import { prisma } from '@/lib/db';

export default async function DashboardPage() {
  const session = await auth();

  // If user is not logged in, redirect to home page or login page
  if (!session?.user?.id) {
    // You could redirect to a specific login page if you have one:
    // redirect('/api/auth/signin?callbackUrl=/dashboard');
    redirect('/');
  }

  // Fetch the user's tracked manga list from the database
  const userMangas = await prisma.userManga.findMany({
    where: {
      userId: session.user.id,
    },
    include: {
      manga: true, // Include the related manga details
      lastReadChapter: { // Include details of the last read chapter
        select: {
          id: true,
          name: true,
          index: true,
        },
      },
    },
    orderBy: [
      // Order by favourite status, then maybe by recent activity or title
      { isFavourite: 'desc' },
      { manga: { title: 'asc' } },
      // { lastReadAt: 'desc' }, // If you want most recently read first
    ],
  });

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">My Manga List</h1>

      {/* Component to Add New Manga */}
      <div className="mb-8 p-4 border rounded-lg shadow-sm">
        <h2 className="text-xl font-semibold mb-3">Add New Manga</h2>
        <AddMangaForm />
      </div>

      {/* Display Tracked Manga List */}
      <div className="space-y-4">
        {userMangas.length === 0
          ? (
              <p className="text-muted-foreground">
                You haven't added any manga yet. Use the form above to add one!
              </p>
            )
          : (
              userMangas.map(userManga => (
                <div key={userManga.mangaId} className="flex items-center justify-between p-4 border rounded-lg shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex items-center space-x-4">
                    {/* Basic Image Placeholder */}
                    {userManga.manga.imageUrl
                      ? (
                          <img src={userManga.manga.imageUrl} alt={userManga.manga.title ?? 'Manga Cover'} className="h-16 w-auto rounded object-cover" />
                        )
                      : (
                          <div className="h-16 w-12 bg-muted rounded flex items-center justify-center text-xs text-muted-foreground">No Image</div>
                        )}
                    <div>
                      <Link
                        href={`/manga/${userManga.manga.slug ?? userManga.manga.id}`} // Link to manga detail page (needs creating)
                        className="text-lg font-semibold hover:underline"
                      >
                        {userManga.manga.title ?? 'Untitled Manga'}
                      </Link>
                      <p className="text-sm text-muted-foreground">
                        Status:
                        {' '}
                        {userManga.manga.status}
                        {userManga.hasNewChapter && <span className="ml-2 text-xs font-semibold text-blue-600 dark:text-blue-400">(New Chapter!)</span>}
                      </p>
                      {userManga.lastReadChapter && (
                        <p className="text-xs text-muted-foreground">
                          Last read: Ch.
                          {' '}
                          {userManga.lastReadChapter.index}
                          {' '}
                          (
                          {userManga.lastReadChapter.name}
                          )
                        </p>
                      )}
                    </div>
                  </div>
                  {/* Add Action buttons later (e.g., Mark read, Favourite, Remove) */}
                  <div>
                    {userManga.isFavourite && (
                      <span title="Favourite" className="text-yellow-500 mr-2">⭐</span>
                    )}
                    {/* Placeholder for future actions */}
                    {/* <Button variant="outline" size="sm">Actions</Button> */}
                  </div>
                </div>
              ))
            )}
      </div>
    </div>
  );
}
