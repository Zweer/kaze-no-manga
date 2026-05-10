import { createFileRoute, Link } from '@tanstack/react-router';
import { BookPlus, Check, Loader2, Play } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';

import { AppShell } from '~/components/app-shell';
import type { Chapter, MangaDetail } from '~/lib/scraper/types';
import { getMangaDetail, getReadChapters } from '~/server/functions/chapters';
import { addMangaToLibrary, removeFromLibrary } from '~/server/functions/library';

export const Route = createFileRoute('/manga/$source/$slug')({
  component: MangaDetailPage,
});

function MangaDetailPage() {
  const { source: sourceName, slug } = Route.useParams();
  const [manga, setManga] = useState<MangaDetail | null>(null);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [readIds, setReadIds] = useState<string[]>([]);
  const [mangaId, setMangaId] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);
  const [added, setAdded] = useState(false);

  useEffect(() => {
    setLoading(true);
    setError(null);

    getMangaDetail({ data: { sourceName, slug } })
      .then(async (result) => {
        setManga(result.manga);
        setChapters(result.chapters);
        setMangaId(result.mangaId);
        setAdded(result.inLibrary);

        const read = await getReadChapters({ data: { mangaId: result.mangaId } }).catch(() => []);
        setReadIds(read);
      })
      .catch(() => setError('Failed to load manga details.'))
      .finally(() => setLoading(false));
  }, [sourceName, slug]);

  const handleAdd = useCallback(async () => {
    setAdding(true);
    try {
      await addMangaToLibrary({ data: { sourceName, slug } });
      setAdded(true);
      toast.success('Added to library!');
    } catch (err) {
      const message =
        err instanceof Error && err.message.includes('Unauthorized')
          ? 'Please sign in to add to library.'
          : 'Failed to add to library.';
      toast.error(message);
    } finally {
      setAdding(false);
    }
  }, [sourceName, slug]);

  const handleRemove = useCallback(async () => {
    try {
      await removeFromLibrary({ data: { mangaId } });
      setAdded(false);
      toast.success('Removed from library.');
    } catch {
      toast.error('Failed to remove.');
    }
  }, [mangaId]);

  if (loading) {
    return (
      <AppShell>
        <div className="flex justify-center py-20">
          <Loader2 size={32} className="text-primary animate-spin" />
        </div>
      </AppShell>
    );
  }

  if (error || !manga) {
    return (
      <AppShell>
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <p className="text-on-surface-variant mb-4">{error || 'Manga not found'}</p>
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="px-6 py-3 bg-primary text-on-primary rounded-xl font-medium"
          >
            Retry
          </button>
        </div>
      </AppShell>
    );
  }

  // Find next unread chapter for "Continue Reading"
  const nextUnread = (() => {
    if (readIds.length === 0 || chapters.length === 0) return null;
    const readNumbers = chapters
      .filter((ch) => readIds.includes(`${mangaId}:${ch.sourceId}`))
      .map((ch) => ch.number);
    if (readNumbers.length === 0) return null;
    const maxRead = Math.max(...readNumbers);
    return chapters.find((ch) => ch.number > maxRead) || null;
  })();

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
        {manga.cover && (
          <div className="w-48 shrink-0 mx-auto md:mx-0">
            <img src={manga.cover} alt={manga.title} className="w-full rounded-xl shadow-2xl" />
          </div>
        )}

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

          <div className="mt-6 flex gap-3">
            {!added ? (
              <button
                type="button"
                onClick={handleAdd}
                disabled={adding}
                className="flex items-center gap-2 px-6 py-3 rounded-xl bg-primary text-on-primary font-medium shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-all disabled:opacity-60 cursor-pointer"
              >
                {adding ? <Loader2 size={18} className="animate-spin" /> : <BookPlus size={18} />}
                Add to Library
              </button>
            ) : (
              <button
                type="button"
                onClick={handleRemove}
                className="flex items-center gap-2 px-6 py-3 rounded-xl bg-error/10 text-error font-medium hover:bg-error/20 transition-all cursor-pointer"
              >
                Remove from Library
              </button>
            )}
          </div>
        </div>
      </section>

      {/* Continue Reading */}
      {nextUnread && (
        <Link
          to="/read/$source/$slug/$chapterNum"
          params={{ source: sourceName, slug, chapterNum: String(nextUnread.number) }}
          className="mb-8 flex items-center gap-2 px-6 py-3 rounded-xl bg-primary text-on-primary font-medium shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-all w-fit"
        >
          <Play size={18} />
          Continue: Chapter {nextUnread.number}
        </Link>
      )}

      {/* Chapter List */}
      <section>
        <h2 className="font-heading text-xl font-bold text-on-surface mb-4">
          Chapters ({chapters.length})
        </h2>
        <div className="flex flex-col gap-1">
          {chapters.map((ch) => {
            const isRead = readIds.includes(`${mangaId}:${ch.sourceId}`);
            return (
              <Link
                key={ch.sourceId}
                to="/read/$source/$slug/$chapterNum"
                params={{ source: sourceName, slug, chapterNum: String(ch.number) }}
                className={`flex items-center px-4 py-3 rounded-lg hover:bg-white/5 transition-colors ${isRead ? 'opacity-60' : ''}`}
              >
                <div className="flex items-center gap-3">
                  {isRead && <Check size={14} className="text-primary" />}
                  <span className="text-sm font-medium text-on-surface">Chapter {ch.number}</span>
                  {ch.title && (
                    <span className="text-sm text-on-surface-variant">— {ch.title}</span>
                  )}
                </div>
              </Link>
            );
          })}
        </div>
      </section>
    </AppShell>
  );
}
