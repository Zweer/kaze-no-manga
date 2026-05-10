import type {
  Chapter,
  MangaDetail,
  MangaSearchResult,
  Page,
  SearchOptions,
  SearchResult,
  Source,
} from '../../types';
import type {
  HeanCmsChapterDto,
  HeanCmsChapterPayloadResponse,
  HeanCmsPageResponse,
  HeanCmsSearchResponse,
  HeanCmsSeriesDto,
} from './types';

interface HeanCmsConfig {
  id: string;
  name: string;
  baseUrl: string;
  apiUrl?: string;
  useNewChapterEndpoint?: boolean;
}

export function createHeanCmsSource(config: HeanCmsConfig): Source {
  const { id, name, baseUrl } = config;
  const apiUrl = config.apiUrl ?? baseUrl.replace('://', '://api.');
  const useNewChapterEndpoint = config.useNewChapterEndpoint ?? true;

  async function fetchJson<T>(url: string): Promise<T> {
    const res = await fetch(url, {
      headers: {
        Origin: baseUrl,
        Referer: `${baseUrl}/`,
        Accept: 'application/json, text/plain, */*',
      },
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}: ${url}`);
    return res.json() as Promise<T>;
  }

  function mapStatus(status: string | null): MangaDetail['status'] {
    switch (status) {
      case 'Ongoing':
        return 'ongoing';
      case 'Completed':
      case 'Finished':
        return 'completed';
      case 'Hiatus':
        return 'hiatus';
      case 'Dropped':
      case 'Canceled':
        return 'dropped';
      default:
        return 'unknown';
    }
  }

  function toAbsoluteUrl(url: string): string {
    if (url.startsWith('http://') || url.startsWith('https://')) return url;
    const path = url.startsWith('/') ? url.slice(1) : url;
    return `${apiUrl}/${path}`;
  }

  function parseChapterNumber(name: string): number {
    const match = name.match(/(\d+(?:\.\d+)?)/);
    return match ? Number.parseFloat(match[1]) : 0;
  }

  function mapSeriesToSearchResult(series: HeanCmsSeriesDto): MangaSearchResult {
    return {
      sourceId: String(series.id),
      sourceName: id,
      slug: series.series_slug,
      title: series.title,
      cover: series.thumbnail ? toAbsoluteUrl(series.thumbnail) : null,
    };
  }

  function mapChapter(dto: HeanCmsChapterDto, seriesSlug: string): Chapter {
    return {
      sourceId: String(dto.id),
      slug: dto.chapter_slug,
      number: parseChapterNumber(dto.chapter_name),
      title: dto.chapter_title?.trim() || null,
      sourceUrl: `${baseUrl}/series/${seriesSlug}/${dto.chapter_slug}`,
      publishedAt: dto.created_at ? new Date(dto.created_at) : null,
    };
  }

  return {
    id,
    name,
    baseUrl,

    async search(options: SearchOptions): Promise<SearchResult> {
      const page = options.page ?? 1;
      const params = new URLSearchParams({
        query_string: options.query,
        status: 'All',
        order: 'desc',
        orderBy: 'total_views',
        series_type: 'Comic',
        page: String(page),
        perPage: '12',
        tags_ids: '[]',
        adult: 'true',
      });

      const data = await fetchJson<HeanCmsSearchResponse>(`${apiUrl}/query?${params}`);

      return {
        mangas: data.data.map(mapSeriesToSearchResult),
        hasNextPage: data.meta ? data.meta.current_page < data.meta.last_page : false,
      };
    },

    async getManga(slug: string): Promise<MangaDetail> {
      const series = await fetchJson<HeanCmsSeriesDto>(`${apiUrl}/series/${slug}`);

      return {
        sourceId: String(series.id),
        sourceName: id,
        slug: series.series_slug,
        title: series.title,
        cover: series.thumbnail ? toAbsoluteUrl(series.thumbnail) : null,
        author: series.author?.trim() || null,
        description: series.description?.replace(/<[^>]*>/g, '').trim() || null,
        status: mapStatus(series.status),
        genres: series.tags?.map((t) => t.name).sort() ?? [],
      };
    },

    async getChapters(slug: string): Promise<Chapter[]> {
      if (useNewChapterEndpoint) {
        const series = await fetchJson<HeanCmsSeriesDto>(`${apiUrl}/series/${slug}`);
        const seriesId = series.id;

        const chapters: Chapter[] = [];
        let page = 1;
        let hasMore = true;

        while (hasMore) {
          const params = new URLSearchParams({
            page: String(page),
            perPage: '1000',
            series_id: String(seriesId),
          });

          const data = await fetchJson<HeanCmsChapterPayloadResponse>(
            `${apiUrl}/chapter/query?${params}`,
          );

          for (const dto of data.data) {
            if (dto.price && dto.price > 0) continue;
            chapters.push(mapChapter(dto, slug));
          }

          hasMore = data.meta.current_page < data.meta.last_page;
          page++;
        }

        return chapters;
      }

      // Legacy: chapters embedded in series response
      const series = await fetchJson<HeanCmsSeriesDto>(`${apiUrl}/series/${slug}`);
      const chapters: Chapter[] = [];

      for (const season of series.seasons ?? []) {
        for (const dto of season.chapters ?? []) {
          if (dto.price && dto.price > 0) continue;
          chapters.push(mapChapter(dto, slug));
        }
      }

      return chapters;
    },

    async getPages(mangaSlug: string, chapterSlug: string): Promise<Page[]> {
      const data = await fetchJson<HeanCmsPageResponse>(
        `${apiUrl}/chapter/${mangaSlug}/${chapterSlug}`,
      );

      if (data.paywall && !data.chapter.chapter_data) {
        throw new Error('Chapter is paywalled');
      }

      const images = data.chapter.chapter_data?.images ?? data.data ?? [];

      return images.map((url, index) => ({
        index,
        imageUrl: toAbsoluteUrl(url),
      }));
    },
  };
}
