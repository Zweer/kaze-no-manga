import { createFileRoute } from '@tanstack/react-router';
import { Search, Wind } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';

import { AppShell } from '~/components/app-shell';
import { MangaCard } from '~/components/manga-card';
import type { MangaSearchResult } from '~/lib/scraper/types';
import { searchManga } from '~/server/functions/manga';

export const Route = createFileRoute('/')({
  component: Home,
});

function Home() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<MangaSearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(null);

  const doSearch = useCallback(async (q: string) => {
    if (!q.trim()) {
      setResults([]);
      return;
    }
    setLoading(true);
    try {
      const data = await searchManga({ data: { query: q } });
      setResults(data.mangas);
    } catch {
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => doSearch(query), 400);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query, doSearch]);

  return (
    <AppShell>
      {!query && <div className="watermark">風の漫画</div>}

      <section className="flex flex-col items-center justify-center text-center mb-8 pt-12 md:pt-8">
        <h1 className="md:hidden font-heading text-6xl leading-none text-on-surface font-black mb-2">
          Kaze
        </h1>
        <p className="md:hidden font-heading text-xl font-bold text-primary/80 tracking-[0.2em] mb-12">
          風の漫画
        </p>

        <div className="w-full max-w-2xl relative group">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-on-surface-variant group-focus-within:text-primary transition-colors">
            <Search size={24} />
          </div>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by title..."
            autoComplete="off"
            className="w-full h-14 pl-14 pr-4 rounded-xl bg-surface-container/60 backdrop-blur-2xl border border-white/10 text-on-surface placeholder-on-surface-variant/60 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all text-base font-medium"
          />
        </div>
      </section>

      {/* Results */}
      {loading && (
        <div className="flex justify-center py-12">
          <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {!loading && results.length > 0 && (
        <section className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 max-w-5xl mx-auto">
          {results.map((manga) => (
            <MangaCard key={`${manga.sourceName}:${manga.sourceId}`} manga={manga} />
          ))}
        </section>
      )}

      {/* Empty state */}
      {!loading && !query && results.length === 0 && (
        <>
          <div className="w-full max-w-4xl mx-auto ink-divider mb-12" />
          <section className="flex flex-col items-center justify-center py-20 text-center">
            <Wind size={80} className="text-primary opacity-20 mb-6" />
            <h2 className="font-heading text-2xl font-bold text-on-surface-variant mb-2">
              Search for your next journey
            </h2>
            <p className="text-base text-on-surface-variant/60 max-w-md">
              Discover worlds of ink and wind. Enter a title above to begin.
            </p>
          </section>
        </>
      )}

      {/* No results */}
      {!loading && query && results.length === 0 && (
        <section className="flex flex-col items-center justify-center py-20 text-center">
          <p className="text-on-surface-variant text-lg">No results for "{query}"</p>
        </section>
      )}
    </AppShell>
  );
}
