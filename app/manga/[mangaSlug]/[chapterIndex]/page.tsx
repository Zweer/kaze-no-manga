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
    <div className="container max-w-5xl mx-auto py-8">
      <div className="flex flex-col md:flex-row gap-8 items-start">
        <div className="flex-grow">
          <span className="text-sm font-semibold text-primary">{manga.title}</span>
          <h1 className="text-4xl font-bold mt-1 mb-2">{chapter.title ?? `Chapter ${chapter.index}`}</h1>
        </div>
      </div>

      <div className="flex flex-col items-center mt-12">
        {chapter.images.map((image, index) => (
          <Image
            // eslint-disable-next-line react/no-array-index-key
            key={index}
            src={image}
            alt={`Page ${index}`}
            width={800}
            height={1200}
            sizes="100vw"
            className="h-auto"
            priority={index <= 2}
          />
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
  );
}
