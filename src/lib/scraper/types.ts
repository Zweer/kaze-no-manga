export interface MangaSearchResult {
  sourceId: string;
  sourceName: string;
  slug: string;
  title: string;
  cover: string | null;
}

export interface MangaDetail extends MangaSearchResult {
  author: string | null;
  description: string | null;
  status: 'ongoing' | 'completed' | 'hiatus' | 'dropped' | 'unknown';
  genres: string[];
}

export interface Chapter {
  sourceId: string;
  slug: string;
  number: number;
  title: string | null;
  sourceUrl: string;
  publishedAt: Date | null;
}

export interface Page {
  index: number;
  imageUrl: string;
}

export interface SearchOptions {
  query: string;
  page?: number;
}

export interface SearchResult {
  mangas: MangaSearchResult[];
  hasNextPage: boolean;
}

export interface Source {
  id: string;
  name: string;
  baseUrl: string;

  search(options: SearchOptions): Promise<SearchResult>;
  getManga(slug: string): Promise<MangaDetail>;
  getChapters(slug: string): Promise<Chapter[]>;
  getPages(mangaSlug: string, chapterSlug: string): Promise<Page[]>;
}
