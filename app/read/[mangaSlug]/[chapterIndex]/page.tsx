import Image from 'next/image';
import { notFound } from 'next/navigation';

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

  return (
    <div className="bg-slate-800 text-white min-h-screen">
      <div className="max-w-3xl mx-auto flex flex-col items-center">
        {/* Intestazione del lettore */}
        <div className="w-full text-center py-4 bg-slate-900/80 backdrop-blur sticky top-14 z-40">
          <h1 className="text-2xl font-bold">
            Chapter
            {chapter.index}
          </h1>
          <p className="text-sm text-slate-300">{chapter.title}</p>
        </div>

        {/* Contenitore delle pagine del manga */}
        <div className="w-full">
          {chapter.images.map((image, index) => (
            // eslint-disable-next-line react/no-array-index-key
            <div key={index} className="relative w-full">
              <Image
                src={image}
                alt={`Page ${index}`}
                width={800} // Larghezza base per il calcolo del ratio
                height={1200} // Altezza base per il calcolo del ratio
                sizes="100vw"
                className="w-full h-auto" // Stili per mantenere il rapporto d'aspetto
                priority={index <= 2} // Carica le prime 2 pagine con priorità
              />
            </div>
          ))}
        </div>

        <div className="w-full text-center py-8 bg-slate-900">
          <p>
            End of Chapter
            {chapter.index}
          </p>
        </div>
      </div>
    </div>
  );
}
