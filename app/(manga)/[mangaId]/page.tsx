import type { Manga } from '@prisma/client';

import axios from 'axios';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';

export default async function MangaDetailsPage({
  params,
}: {
  params: { mangaId: string };
}) {
  let mangaData: Manga;
  try {
    const { data } = await axios.get<Manga>(`/api/manga/${params.mangaId}`);
    mangaData = data;
  }
  catch (error) {
    console.error(error);
    notFound();
  }

  if (!mangaData) {
    notFound();
  }

  return (
    <div className="p-4">
      <div className="flex flex-col md:flex-row gap-4">
        <div className="md:w-1/3">
          <Image
            src={mangaData.coverImageUrl}
            alt={mangaData.title}
            width={300}
            height={450}
            className="rounded-md"
            priority
          />
        </div>
        <div className="md:w-2/3">
          <h1 className="text-3xl font-bold">{mangaData.title}</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            {mangaData.description}
          </p>
          {/* Add more details here (author, genres, etc.) */}
          {/* Display chapters */}
          <div>
            <h2 className="text-2xl font-bold mt-4">Chapters</h2>
            <ul>
              {mangaData.chapters.map((chapter: any) => (
                <li key={chapter.id}>
                  <Link href={`/manga/${mangaData.id}/${chapter.id}`}>
                    Chapter
                    {' '}
                    {chapter.chapterNumber}
                    :
                    {' '}
                    {chapter.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

    </div>
  );
}
