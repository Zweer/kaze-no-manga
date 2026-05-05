// Generated types — run `npm run codegen` to regenerate
// Placeholder until codegen is configured

export type MangaStatus = 'ONGOING' | 'COMPLETED' | 'HIATUS' | 'CANCELLED';
export type ReadingStatus = 'READING' | 'COMPLETED' | 'PLAN_TO_READ' | 'DROPPED' | 'ON_HOLD';
export type ImageWidth = 'FIT' | 'FULL';
export type Theme = 'LIGHT' | 'DARK' | 'AUTO';

export interface Manga {
  id: string;
  slug: string;
  title: string;
  altTitles: string[];
  description?: string;
  cover?: string;
  status: MangaStatus;
  genres: string[];
  authors: string[];
  year?: number;
  totalChapters?: number;
  isNsfw: boolean;
  sourceName: string;
  sourceId: string;
  createdAt: string;
  updatedAt: string;
}

export interface Chapter {
  id: string;
  mangaId: string;
  number: number;
  title?: string;
  releaseDate?: string;
  images: ChapterImage[];
  createdAt: string;
}

export interface ChapterImage {
  url: string;
  page: number;
  width?: number;
  height?: number;
}

export interface LibraryEntry {
  userId: string;
  mangaId: string;
  status: ReadingStatus;
  rating?: number;
  notes?: string;
  currentChapterNumber?: number;
  lastReadAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ReadingHistory {
  id: string;
  mangaId: string;
  chapterId: string;
  chapterNumber: number;
  completed: boolean;
  readAt: string;
}
