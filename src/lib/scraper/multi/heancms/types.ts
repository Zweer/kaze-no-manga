export interface HeanCmsSearchResponse {
  data: HeanCmsSeriesDto[];
  meta: { current_page: number; last_page: number } | null;
}

export interface HeanCmsSeriesDto {
  id: number;
  series_slug: string;
  title: string;
  thumbnail: string;
  author: string | null;
  description: string | null;
  studio: string | null;
  status: string | null;
  tags: { name: string }[] | null;
  seasons: { chapters: HeanCmsChapterDto[] | null }[] | null;
}

export interface HeanCmsChapterPayloadResponse {
  data: HeanCmsChapterDto[];
  meta: { current_page: number; last_page: number };
}

export interface HeanCmsChapterDto {
  id: number;
  chapter_name: string;
  chapter_title: string | null;
  chapter_slug: string;
  created_at: string | null;
  price: number | null;
}

export interface HeanCmsPageResponse {
  chapter: {
    chapter_data: { images: string[] } | null;
  };
  data: string[] | null;
  paywall: boolean;
}
