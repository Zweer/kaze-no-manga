import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';

import { Button } from '@/components/ui/button';
import { db } from '@/lib/db';

interface ReaderPageProps {
  mangaSlug: string;
  chapterIndex: string;
}

export default async function ReaderPage({ params }: { params: Promise<ReaderPageProps> }) {
  const { chapterIndex, mangaSlug } = await params;

  const manga = await db.query.mangaTable.findFirst({
    where: (mangaTable, { eq }) => eq(mangaTable.slug, mangaSlug),
  });
  if (!manga) {
    notFound();
  }

  const chapter = await db.query.chapterTable.findFirst({
    where: (chapterTable, { and, eq }) => and(
      eq(chapterTable.mangaId, manga.id),
      eq(chapterTable.index, Number.parseFloat(chapterIndex)),
    ),
  });
  if (!chapter) {
    notFound();
  }

  const prevChapter = await db.query.chapterTable.findFirst({
    where: (chapterTable, { and, eq, lt }) => and(
      eq(chapterTable.mangaId, manga.id),
      lt(chapterTable.index, Number.parseFloat(chapterIndex)),
    ),
    orderBy: (chapterTable, { desc }) => desc(chapterTable.index),
  });

  const nextChapter = await db.query.chapterTable.findFirst({
    where: (chapterTable, { and, eq, gt }) => and(
      eq(chapterTable.mangaId, manga.id),
      gt(chapterTable.index, Number.parseFloat(chapterIndex)),
    ),
    orderBy: (chapterTable, { asc }) => asc(chapterTable.index),
  });

  return (
    <div className="bg-background text-foreground">
      <div className="fixed top-0 left-0 right-0 h-14 bg-background/80 backdrop-blur z-50 border-b">
        <div className="container mx-auto h-full flex items-center justify-between">
          <Link href={`/manga/${manga.slug}`} className="text-lg font-bold hover:underline">
            MangaVerse Test Comic
          </Link>
          <div className="text-center">
            <h1 className="font-semibold">
              Chapter
              {chapter.index}
            </h1>
          </div>
          <div className="flex items-center gap-2">
          </div>
        </div>
      </div>

      <div className="pt-14">
        {' '}
        <div className="max-w-3xl mx-auto flex flex-col items-center">
          <div className="w-full min-h-screen">
            {' '}
            {chapter.images.map((image, index) => (
              // eslint-disable-next-line react/no-array-index-key
              <div key={index} className="relative w-full">
                <Image
                  src={image}
                  alt={`Page ${index}`}
                  width={800}
                  height={1200}
                  sizes="100vw"
                  className="w-full h-auto"
                  priority={index <= 2}
                />
              </div>
            ))}
          </div>

          <div className="w-full flex justify-between items-center my-8 px-4">
            {prevChapter
              ? (
                  <Link href={`/manga/${manga.slug}/${prevChapter.index}`}>
                    <Button variant="outline">Previous Chapter</Button>
                  </Link>
                )
              : <div></div>}

            {nextChapter
              ? (
                  <Link href={`/manga/${manga.slug}/${nextChapter.index}`}>
                    <Button variant="outline">Next Chapter</Button>
                  </Link>
                )
              : <div></div>}
          </div>
        </div>
      </div>
    </div>
  );
}
