'use client';

import type { MangaSearchResult } from '@/lib/manga';

import { AlertCircle, Loader2, Search } from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
import { useDebouncedCallback } from 'use-debounce';

import { MangaCard } from '@/components/manga/MangaCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { searchInternalManga } from '@/lib/db/actions/search';

// Define types (replace any) - MAKE SURE Manga type matches server action return
type Manga = Awaited<ReturnType<typeof searchInternalManga>>[number]; // Infer type

// TODO: Import or define server action for internal search
// import { searchInternalManga } from '@/lib/db/searchActions';

export default function SearchPage() {
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get('q') || '';

  const [searchTerm, setSearchTerm] = useState(initialQuery);
  const [internalResults, setInternalResults] = useState<Manga[]>([]);
  const [externalResults, setExternalResults] = useState<MangaSearchResult[]>([]);
  const [isLoadingInternal, setIsLoadingInternal] = useState(false);
  const [isLoadingExternal, setIsLoadingExternal] = useState(false); // State for external search loading
  const [externalError, setExternalError] = useState<string | null>(null); // State for external search error

  // --- Debounced Internal Search ---
  const handleInternalSearch = useDebouncedCallback(async (query: string) => {
    if (query.length < 3) {
      setInternalResults([]);
      return;
    }

    setIsLoadingInternal(true);

    try {
      // Call the server action directly
      const results = await searchInternalManga(query);
      setInternalResults(results); // Set the results
    } catch (err) {
      console.error('Internal search error:', err);
      setInternalResults([]);
    } finally {
      setIsLoadingInternal(false);
    }
  }, 500);

  // --- Trigger External Search ---
  const handleExternalSearch = useCallback(async () => {
    if (searchTerm.length < 3 || isLoadingExternal) {
      return;
    }
    setIsLoadingExternal(true);
    setExternalError(null);
    setExternalResults([]); // Clear previous external results

    try {
      const response = await fetch(`/api/search/external?q=${searchTerm}`);

      const data = await response.json() as ({ results: MangaSearchResult[] } | { error: string });

      if (!response.ok) {
        const { error } = data as { error: string };
        // Throw an error with message from API or default
        throw new Error(error || `Error ${response.status}`);
      }

      const { results } = data as { results: MangaSearchResult[] };
      if (results) {
        setExternalResults(results);
      } else {
        // Should not happen if API returns correct format on success
        throw new Error('Invalid response format from external search API.');
      }
    } catch (errorRaw: any) {
      const error = errorRaw as Error;
      console.error('Error fetching external search results:', error);
      setExternalError(error.message || 'Failed to fetch external results.');
      setExternalResults([]);
    } finally {
      setIsLoadingExternal(false);
    }
  }, [searchTerm, isLoadingExternal]);

  // Update search term state and trigger internal search
  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newQuery = event.target.value;
    setSearchTerm(newQuery);
    handleInternalSearch(newQuery);
  };

  // Effect to run internal search on initial load if query param exists
  useEffect(() => {
    if (initialQuery) {
      handleInternalSearch(initialQuery);
      // Optionally trigger external search on load too?
      // handleExternalSearch();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Search Manga</h1>

      {/* Search Input Form */}
      <div className="flex w-full max-w-xl items-center space-x-2 mb-8">
        <Input
          type="search"
          placeholder="Search by title..."
          value={searchTerm}
          onChange={handleInputChange}
          onKeyDown={async e => e.key === 'Enter' && handleExternalSearch()} // Trigger search on Enter key
          className="flex-grow"
        />
        <Button type="button" onClick={handleExternalSearch} disabled={isLoadingExternal || searchTerm.length < 3}>
          {isLoadingExternal
            ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )
            : (
                <Search className="mr-2 h-4 w-4" />
              )}
          Search Externally
        </Button>
      </div>

      {/* Loading Indicator */}
      {(isLoadingInternal || isLoadingExternal) && (
        <div className="text-center py-4">
          <Loader2 className="h-6 w-6 animate-spin inline-block text-muted-foreground" />
          <p className="text-sm text-muted-foreground">Searching...</p>
        </div>
      )}

      {/* Error Display */}
      {externalError && (
        <div className="flex items-center justify-center text-destructive bg-destructive/10 p-3 rounded-md mb-6">
          <AlertCircle className="h-5 w-5 mr-2" />
          <span>{externalError}</span>
        </div>
      )}

      {/* Internal Results Section (Placeholder) */}
      {!isLoadingInternal && internalResults.length > 0 && (
        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-4 border-b pb-2">Found in Kaze Manga</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
            {internalResults.map(manga => (
              // Use MangaCard for internal results
              <MangaCard
                key={manga.slug}
                slug={manga.slug}
                title={manga.title}
                coverUrl={manga.coverUrl}
                // Pass other needed props if MangaCard requires them
                // lastChapterRead={undefined} // Not available directly from search
                // lastChapterChecked={undefined} // Not available directly from search
              />
            ))}
          </div>
        </section>
      )}

      {/* External Results Section */}
      {isLoadingExternal && ( // Show loading specifically for external
        <div className="text-center py-4">
          <Loader2 className="h-6 w-6 animate-spin inline-block text-muted-foreground" />
          <p className="text-sm text-muted-foreground">Searching external sources...</p>
        </div>
      )}
      {!isLoadingExternal && externalResults.length > 0 && (
        <section>
          <h2 className="text-xl font-semibold mb-4 border-b pb-2">Found on External Sources</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {externalResults.map(result => (
              // TODO: Create an ExternalMangaResultCard component
              <div key={`${result.sourceName}-${result.sourceId}`} className="border rounded-md p-3 bg-card text-card-foreground">
                <h3 className="font-medium truncate">{result.title}</h3>
                <p className="text-xs text-muted-foreground mb-2">
                  Source:
                  {result.sourceName}
                </p>
                {/* TODO: Add "Import" button here */}
                <Button size="sm" variant="outline">
                  Import
                </Button>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* No Results Message */}
      {!isLoadingInternal && !isLoadingExternal && !externalError && internalResults.length === 0 && externalResults.length === 0 && searchTerm.length >= 3 && (
        <div className="text-center py-10">
          <p className="text-muted-foreground">
            No results found for "
            {searchTerm}
            ".
          </p>
        </div>
      )}

    </div>
  );
}
