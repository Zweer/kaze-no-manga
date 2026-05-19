import { createFileRoute, Link, useNavigate } from '@tanstack/react-router';
import { ArrowLeft, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';

import type { Page } from '~/lib/scraper/types';
import { getChapters, getPages, markChapterRead } from '~/server/functions/chapters';

export const Route = createFileRoute('/read/$source/$slug/$chapterNum')({
  component: Reader,
  validateSearch: (search: Record<string, unknown>) => ({
    mangaId: (search.mangaId as string) || '',
  }),
});

type ChapterInfo = Awaited<ReturnType<typeof getChapters>>[number];

function Reader() {
  const { source, slug, chapterNum } = Route.useParams();
  const { mangaId } = Route.useSearch();
  const navigate = useNavigate();
  const [pages, setPages] = useState<Page[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [chapters, setChapters] = useState<ChapterInfo[]>([]);
  const [currentChapter, setCurrentChapter] = useState<ChapterInfo | null>(null);
  const [showUI, setShowUI] = useState(true);

  const num = Number.parseInt(chapterNum, 10);

  useEffect(() => {
    setLoading(true);
    setError(null);
    getChapters({ data: { mangaId } }).then((chs) => {
      const sorted = chs.sort((a, b) => a.number - b.number);
      setChapters(sorted);
      const ch = sorted.find((c) => c.number === num);
      setCurrentChapter(ch || null);

      if (ch) {
        getPages({ data: { mangaId, chapterId: ch.id } })
          .then(setPages)
          .catch(() => setError('Failed to load chapter images.'))
          .finally(() => setLoading(false));

        // Mark as read
        markChapterRead({ data: { mangaId, chapterId: ch.id } });
      } else {
        setLoading(false);
      }
    });
  }, [mangaId, num]);

  const prevChapter = chapters.find((c) => c.number === num - 1);
  const nextChapter = chapters.find((c) => c.number === num + 1);

  const goToChapter = useCallback(
    (chNum: number) => {
      navigate({
        to: '/read/$source/$slug/$chapterNum',
        params: { source, slug, chapterNum: String(chNum) },
        search: { mangaId },
      });
    },
    [navigate, source, slug, mangaId],
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <Loader2 size={32} className="text-primary animate-spin" />
      </div>
    );
  }

  if (!currentChapter) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center text-on-surface-variant">
        Chapter not found
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center gap-4">
        <p className="text-white/60">{error}</p>
        <button
          type="button"
          onClick={() => window.location.reload()}
          className="px-6 py-3 bg-primary text-on-primary rounded-xl font-medium"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    // biome-ignore lint/a11y/useKeyWithClickEvents: tap to toggle UI
    // biome-ignore lint/a11y/noStaticElementInteractions: tap to toggle UI
    <div className="min-h-screen bg-black relative" onClick={() => setShowUI(!showUI)}>
      {/* Header */}
      <header
        className={`fixed top-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-md px-4 py-3 flex items-center gap-3 transition-transform duration-300 ${showUI ? 'translate-y-0' : '-translate-y-full'}`}
      >
        <Link
          to="/manga/$source/$slug"
          params={{ source, slug }}
          className="text-white/80 hover:text-white"
          onClick={(e) => e.stopPropagation()}
        >
          <ArrowLeft size={20} />
        </Link>
        <div className="min-w-0">
          <p className="text-sm text-white/60 truncate">Chapter {num}</p>
          {currentChapter.title && (
            <p className="text-xs text-white/40 truncate">{currentChapter.title}</p>
          )}
        </div>
      </header>

      {/* Pages */}
      <div className="flex flex-col items-center">
        {pages.map((page) => (
          <img
            key={page.index}
            src={page.imageUrl}
            alt={`Page ${page.index + 1}`}
            className="w-full max-w-3xl"
            loading="lazy"
          />
        ))}
      </div>

      {/* End of chapter — next chapter prompt */}
      {nextChapter && (
        <div className="flex flex-col items-center py-16 bg-black">
          <p className="text-white/40 text-sm mb-4">End of Chapter {num}</p>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              goToChapter(nextChapter.number);
            }}
            className="px-6 py-3 bg-primary text-on-primary rounded-xl font-medium"
          >
            Next: Chapter {nextChapter.number}
          </button>
        </div>
      )}

      {/* Footer nav */}
      <footer
        className={`fixed bottom-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-md px-4 py-3 flex items-center justify-between transition-transform duration-300 ${showUI ? 'translate-y-0' : 'translate-y-full'}`}
      >
        <button
          type="button"
          disabled={!prevChapter}
          onClick={(e) => {
            e.stopPropagation();
            if (prevChapter) goToChapter(prevChapter.number);
          }}
          className="flex items-center gap-1 text-sm text-white/70 disabled:text-white/20"
        >
          <ChevronLeft size={16} />
          Prev
        </button>
        <span className="text-sm text-white/50">
          Ch. {num} · {pages.length} pages
        </span>
        <button
          type="button"
          disabled={!nextChapter}
          onClick={(e) => {
            e.stopPropagation();
            if (nextChapter) goToChapter(nextChapter.number);
          }}
          className="flex items-center gap-1 text-sm text-white/70 disabled:text-white/20"
        >
          Next
          <ChevronRight size={16} />
        </button>
      </footer>
    </div>
  );
}
