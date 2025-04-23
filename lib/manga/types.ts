import type { ConnectorNames, Chapter as ExternalChapter, Manga as ExternalManga } from '@zweer/manga-scraper';

export interface MangaSearchResult {
  sourceId: string;
  sourceName: ConnectorNames;
  title: string;
  slug: string;
  coverUrl: string;
}

export interface Manga extends ExternalManga {}
export interface Chapter extends ExternalChapter {}
