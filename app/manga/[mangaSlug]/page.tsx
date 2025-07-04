import { format } from 'date-fns';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { db } from '@/lib/db';

interface MangaPageProps {
  mangaSlug: string;
}

export default async function MangaPage({ params }: { params: Promise<MangaPageProps> }) {
  const { mangaSlug } = await params;

  const manga = await db.query.mangaTable.findFirst({
    where: (mangaTable, { eq }) => eq(mangaTable.slug, mangaSlug),
    with: {
      chapters: true,
    },
  });
  if (!manga) {
    notFound();
  }

  return (
    <div className="container max-w-5xl mx-auto py-8">
      <div className="flex flex-col md:flex-row gap-8 items-start">
        <div className="flex-shrink-0 w-full md:w-1/3">
          <Image
            src={manga.image}
            alt={`Cover for ${manga.title}`}
            width={384}
            height={538}
            className="rounded-lg shadow-lg w-full h-auto"
            priority
          />
        </div>

        <div className="flex-grow">
          <span className="text-sm font-semibold text-primary">{manga.status}</span>
          <h1 className="text-4xl font-bold mt-1 mb-2">{manga.title}</h1>
          <p className="text-lg text-muted-foreground mb-4">
            by
            {' '}
            {manga.author}
          </p>
          <p className="text-base leading-relaxed">{manga.excerpt}</p>
        </div>
      </div>

      <div className="mt-12">
        <h2 className="text-2xl font-bold border-b pb-2 mb-4">Chapters</h2>
        {manga.chapters.length > 0
          ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Chapter</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Progress</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {manga.chapters.map(chapter => (
                    <TableRow key={chapter.id}>
                      <TableCell>
                        <Link href={`/manga/${manga.slug}/${chapter.index}`}>
                          Chapter
                          {' '}
                          {chapter.index}
                        </Link>
                      </TableCell>
                      <TableCell>{chapter.releasedAt && format(chapter.releasedAt, 'PPP')}</TableCell>
                      <TableCell></TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )
          : (
              <p className="text-muted-foreground">No chapters available yet.</p>
            )}
      </div>
    </div>
  );
}
