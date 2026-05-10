import { createServerFn } from '@tanstack/react-start';

import { sources } from '~/lib/scraper';
import type { MangaSearchResult } from '~/lib/scraper/types';

export const searchManga = createServerFn({ method: 'GET' })
  .inputValidator((input: { query: string; page?: number }) => input)
  .handler(async ({ data }) => {
    if (!data.query.trim()) return { mangas: [] as MangaSearchResult[], hasNextPage: false };

    const results = await Promise.allSettled(
      sources.map((source) => source.search({ query: data.query, page: data.page })),
    );

    const mangas: MangaSearchResult[] = [];
    let hasNextPage = false;

    for (const result of results) {
      if (result.status === 'fulfilled') {
        mangas.push(...result.value.mangas);
        if (result.value.hasNextPage) hasNextPage = true;
      }
    }

    return { mangas, hasNextPage };
  });
