import { Link } from '@tanstack/react-router';
import { BookPlus, Check, Loader2 } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

import type { MangaSearchResult } from '~/lib/scraper/types';
import { addMangaToLibrary } from '~/server/functions/library';

interface MangaCardProps {
  manga: MangaSearchResult;
}

export function MangaCard({ manga }: MangaCardProps) {
  const [adding, setAdding] = useState(false);
  const [added, setAdded] = useState(false);

  const handleAdd = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setAdding(true);
    try {
      await addMangaToLibrary({ data: { sourceName: manga.sourceName, slug: manga.slug } });
      setAdded(true);
      toast.success(`Added "${manga.title}" to library!`);
    } catch (err) {
      const message =
        err instanceof Error && err.message.includes('Unauthorized')
          ? 'Please sign in first.'
          : 'Failed to add.';
      toast.error(message);
    } finally {
      setAdding(false);
    }
  };

  return (
    <Link
      to="/manga/$source/$slug"
      params={{ source: manga.sourceName, slug: manga.slug }}
      className="group relative flex flex-col rounded-xl overflow-hidden bg-surface-container/60 border border-white/5 hover:border-primary/30 transition-all hover:-translate-y-1"
    >
      {/* Cover */}
      <div className="aspect-[3/4] relative overflow-hidden">
        {manga.cover ? (
          <img
            src={manga.cover}
            alt={manga.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full bg-surface-container-high flex items-center justify-center">
            <span className="text-on-surface-variant/40 text-4xl font-heading font-black">
              {manga.title[0]}
            </span>
          </div>
        )}
        <div className="card-vignette absolute inset-0" />

        {/* Quick add button */}
        <button
          type="button"
          onClick={handleAdd}
          disabled={adding || added}
          className="absolute top-2 right-2 p-2 rounded-full bg-black/60 backdrop-blur-sm text-white opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer disabled:cursor-default"
        >
          {adding ? (
            <Loader2 size={16} className="animate-spin" />
          ) : added ? (
            <Check size={16} className="text-primary" />
          ) : (
            <BookPlus size={16} />
          )}
        </button>
      </div>

      {/* Info */}
      <div className="p-3">
        <h3 className="text-sm font-semibold text-on-surface line-clamp-2 leading-tight">
          {manga.title}
        </h3>
        <p className="text-[10px] font-bold uppercase tracking-wider text-primary/70 mt-1">
          {manga.sourceName}
        </p>
      </div>
    </Link>
  );
}
