import { Link } from '@tanstack/react-router';

import type { MangaSearchResult } from '~/lib/scraper/types';

interface MangaCardProps {
  manga: MangaSearchResult;
}

export function MangaCard({ manga }: MangaCardProps) {
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
