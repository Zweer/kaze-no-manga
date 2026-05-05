export interface MangaSearchResult {
  sourceId: string;
  title: string;
  cover?: string;
  url: string;
}

export interface MangaDetail {
  sourceId: string;
  title: string;
  altTitles: string[];
  description?: string;
  cover?: string;
  status: 'ONGOING' | 'COMPLETED' | 'HIATUS' | 'CANCELLED';
  genres: string[];
  authors: string[];
  year?: number;
}

export interface ChapterInfo {
  sourceId: string;
  number: number;
  title?: string;
  releaseDate?: string;
  url: string;
}

export interface ChapterPage {
  url: string;
  page: number;
}

export interface MangaSource {
  readonly name: string;
  readonly baseUrl: string;

  search(query: string): Promise<MangaSearchResult[]>;
  getManga(sourceId: string): Promise<MangaDetail>;
  getChapters(sourceId: string): Promise<ChapterInfo[]>;
  getChapterPages(sourceId: string, chapterSourceId: string): Promise<ChapterPage[]>;
}
