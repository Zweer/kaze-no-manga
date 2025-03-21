import UserDropdown from '@/components/UserDropdown';
import { auth } from '@/lib/auth';
import Image from 'next/image';
import Link from 'next/link';

// Placeholder data for recently updated manga (replace with API call later)
const recentManga = [
  { id: '1', title: 'Manga Title 1', coverImageUrl: '/placeholder-cover.jpg' },
  { id: '2', title: 'Manga Title 2', coverImageUrl: '/placeholder-cover.jpg' },
  { id: '3', title: 'Manga Title 3', coverImageUrl: '/placeholder-cover.jpg' },
];

export default async function Home() {
  const session = await auth();

  return (
    <div>
      <header className="flex justify-between items-center p-4 bg-white shadow-md dark:bg-gray-800">
        <h1 className="text-2xl font-bold">Kaze no Manga</h1>
        {session
          ? (
              <UserDropdown />
            )
          : (
              <Link href="/login" className="bg-purple-500 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline">
                Sign In
              </Link>
            )}
      </header>
      <main className="p-4">
        {session
          ? (
              <div>
                <p>
                  Welcome,
                  {session.user?.name}
                  !
                </p>
                {/* Display user's manga lists here later */}
              </div>
            )
          : (
              <div className="flex flex-col gap-8">
                <section className="text-center">
                  <h2 className="text-3xl font-bold mb-4">Discover Your Next Favorite Manga</h2>
                  <p className="text-lg text-gray-600 dark:text-gray-400">
                    Explore a vast collection of manga, create personalized lists, and track your reading progress.
                  </p>
                </section>

                <section>
                  <h3 className="text-2xl font-bold mb-4">Recently Updated</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {recentManga.map(manga => (
                      <div key={manga.id} className="bg-white rounded-md shadow-md p-4 dark:bg-gray-700">
                        <Image
                          src={manga.coverImageUrl}
                          alt={manga.title}
                          width={200}
                          height={300}
                          className="rounded-md"
                          placeholder="blur"
                          blurDataURL="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==" // A very small base64 image for the blur
                        />
                        <h4 className="text-lg font-semibold mt-2 text-gray-900 dark:text-white">{manga.title}</h4>
                      </div>
                    ))}
                  </div>
                </section>
              </div>
            )}
      </main>
    </div>
  );
}
