import { createFileRoute } from '@tanstack/react-router';
import { BookPlus, Loader2 } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';

import { AppShell } from '~/components/app-shell';
import { getSource } from '~/lib/scraper';
import type { Chapter, MangaDetail } from '~/lib/scraper/types';
import { addMangaToLibrary } from '~/server/functions/library';

export const Route = createFileRoute('/manga/$source/$slug')({
  component: MangaDetailPage,
});

function MangaDetailPage() {
  const { source: sourceName, slug } = Route.useParams();
  const [manga, setManga] = useState<MangaDetail | null>(null);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [added, setAdded] = useState(false);

  useEffect(() => {
    const source = getSource(sourceName);
    if (!source) return;

    Promise.all([source.getManga(slug), source.getChapters(slug)])
      .then(([m, c]) => {
        setManga(m);
        setChapters(c.sort((a, b) => a.number - b.number));
      })
      .finally(() => setLoading(false));
  }, [sourceName, slug]);

  const handleAdd = useCallback(async () => {
    setAdding(true);
    try {
      await addMangaToLibrary({ data: { sourceName, slug } });
      setAdded(true);
    } finally {
      setAdding(false);
    }
  }, [sourceName, slug]);

  if (loading) {
    return (
      <AppShell>
        <div className="flex justify-center py-20">
          <Loader2 size={32} className="text-primary animate-spin" />
        </div>
      </AppShell>
    );
  }

  if (!manga) {
    return (
      <AppShell>
        <p className="text-center text-on-surface-variant py-20">Manga not found</p>
      </AppShell>
    );
  }

  return (
    <AppShell>
      {/* Hero */}
      {manga.cover && (
        <div className="absolute top-0 left-0 w-full h-80 overflow-hidden -z-10">
          <img
            src={manga.cover}
            alt=""
            className="w-full h-full object-cover blur-[100px] opacity-30"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-background" />
        </div>
      )}

      <section className="pt-8 md:pt-4 flex flex-col md:flex-row gap-8 mb-12">
        {/* Cover */}
        {manga.cover && (
          <div className="w-48 shrink-0 mx-auto md:mx-0">
            <img src={manga.cover} alt={manga.title} className="w-full rounded-xl shadow-2xl" />
          </div>
        )}

        {/* Info */}
        <div className="flex-1 min-w-0">
          <p className="text-[10px] font-bold uppercase tracking-wider text-primary mb-2">
            {manga.sourceName}
          </p>
          <h1 className="font-heading text-3xl md:text-4xl font-black text-on-surface mb-3">
            {manga.title}
          </h1>
          {manga.author && <p className="text-sm text-on-surface-variant mb-2">{manga.author}</p>}
          {manga.genres.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-4">
              {manga.genres.map((g) => (
                <span
                  key={g}
                  className="px-2 py-0.5 text-xs rounded-full bg-primary/10 text-primary font-medium"
                >
                  {g}
                </span>
              ))}
            </div>
          )}
          {manga.description && (
            <p className="text-sm text-on-surface-variant/80 line-clamp-4">{manga.description}</p>
          )}

          {/* Add to Library */}
          <button
            type="button"
            onClick={handleAdd}
            disabled={adding || added}
            className="mt-6 flex items-center gap-2 px-6 py-3 rounded-xl bg-primary text-on-primary font-medium shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-all disabled:opacity-60"
          >
            {adding ? <Loader2 size={18} className="animate-spin" /> : <BookPlus size={18} />}
            {added ? 'Added to Library' : 'Add to Library'}
          </button>
        </div>
      </section>

      {/* Chapter List */}
      <section>
        <h2 className="font-heading text-xl font-bold text-on-surface mb-4">
          Chapters ({chapters.length})
        </h2>
        <div className="flex flex-col gap-1">
          {chapters.map((ch) => (
            <div
              key={ch.sourceId}
              className="flex items-center justify-between px-4 py-3 rounded-lg hover:bg-white/5 transition-colors"
            >
              <div>
                <span className="text-sm font-medium text-on-surface">Chapter {ch.number}</span>
                {ch.title && (
                  <span className="text-sm text-on-surface-variant ml-2">— {ch.title}</span>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>
    </AppShell>
  );
}
