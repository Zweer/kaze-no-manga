import * as cheerio from "cheerio";
import { fetchWithRetry, safeJson } from "../../fetch-utils";
import type { Chapter, MangaDetail, MangaSource, MangaSummary, SearchResult } from "../../types";
import type { ComickChapter, ComickChaptersResponse, ComickSearchResult } from "./types";

const API_URL = "https://api.comick.dev";
const IMAGE_HOST = "https://meo.comick.pictures";
const PER_PAGE = 20;

export class Comick implements MangaSource {
	readonly id = "comick";
	readonly name = "Comick";
	readonly baseUrl = "https://comick.dev";

	private headers() {
		return {
			Referer: this.baseUrl,
			Accept: "application/json",
		};
	}

	async search(query: string, page = 1): Promise<SearchResult> {
		const url = new URL(`${API_URL}/v1.0/search`);
		url.searchParams.set("q", query);
		url.searchParams.set("limit", PER_PAGE.toString());
		url.searchParams.set("page", page.toString());
		url.searchParams.set("tachiyomi", "true");

		const response = await fetchWithRetry(url.toString(), { headers: this.headers() });
		if (!response.ok) {
			throw new Error(`Comick search failed: ${response.status}`);
		}

		const data = await safeJson<ComickSearchResult[]>(response);

		const mangas: MangaSummary[] = data.map((item) => ({
			sourceId: this.id,
			slug: item.slug,
			title: item.title,
			cover: this.buildCoverUrl(item),
		}));

		return { mangas, hasNextPage: mangas.length >= PER_PAGE };
	}

	async getManga(slug: string): Promise<MangaDetail> {
		const url = `${API_URL}/comic/${slug}`;
		const response = await fetchWithRetry(url, { headers: this.headers() });

		if (!response.ok) {
			throw new Error(`Comick getManga failed: ${response.status}`);
		}

		const raw = await safeJson<Record<string, unknown>>(response);
		// API may return { comic: {...} } or the comic object directly
		const comic = (raw.comic ?? raw) as ComickSearchResult;

		return {
			sourceId: this.id,
			slug: comic.slug,
			sourceIdentifier: comic.hid,
			title: comic.title,
			cover: this.buildCoverUrl(comic),
			description: comic.desc?.replace(/<[^>]*>/g, "").trim() ?? "",
			status: this.parseStatus(comic.status),
			genres: comic.genres?.map((g) => g.name) ?? [],
		};
	}

	async getChapters(manga: MangaDetail): Promise<Chapter[]> {
		const chapters: Chapter[] = [];
		let page = 1;
		let hasMore = true;

		while (hasMore && page <= 50) {
			const url = new URL(`${API_URL}/comic/${manga.sourceIdentifier}/chapters`);
			url.searchParams.set("lang", "en");
			url.searchParams.set("page", page.toString());
			url.searchParams.set("limit", "100");

			const response = await fetchWithRetry(url.toString(), { headers: this.headers() });
			if (!response.ok) {
				throw new Error(`Comick getChapters failed: ${response.status}`);
			}

			const raw = await safeJson<Record<string, unknown>>(response);
			// API may return { chapters: [...], total } or just { chapters: [...] }
			const chaptersData = (raw.chapters ?? []) as ComickChapter[];
			const total = (raw.total as number) ?? 0;

			for (const ch of chaptersData) {
				if (!ch.chap) continue;

				chapters.push({
					sourceId: this.id,
					mangaSlug: manga.slug,
					slug: ch.hid,
					number: Number.parseFloat(ch.chap) || 0,
					title: ch.title || `Chapter ${ch.chap}`,
					releasedAt: ch.created_at,
				});
			}

			hasMore = chaptersData.length >= 100;
			page++;
		}

		return chapters.sort((a, b) => a.number - b.number);
	}

	async getChapterPages(chapter: Chapter): Promise<string[]> {
		// Fetch chapter page HTML from comick.io to get __NEXT_DATA__
		const url = `${this.baseUrl}/comic/${chapter.mangaSlug}/${chapter.slug}`;
		const response = await fetchWithRetry(url, {
			headers: { Referer: this.baseUrl },
		});

		if (!response.ok) {
			throw new Error(`Comick getChapterPages failed: ${response.status}`);
		}

		const html = await response.text();
		const $ = cheerio.load(html);

		// Try __NEXT_DATA__ first
		const nextData = $("#__NEXT_DATA__").text();
		if (nextData) {
			try {
				const parsed = JSON.parse(nextData) as {
					props?: { pageProps?: { chapter?: { md_images?: Array<{ b2key: string }> } } };
				};
				const images = parsed.props?.pageProps?.chapter?.md_images;
				if (images && images.length > 0) {
					return images.map((img) => `${IMAGE_HOST}/${img.b2key}`);
				}
			} catch {
				// Fall through to img parsing
			}
		}

		// Fallback: parse img tags
		const pages: string[] = [];
		$("img[data-index]").each((_, el) => {
			const src = $(el).attr("data-src") || $(el).attr("src") || "";
			if (src && src.includes("comick")) {
				pages.push(src);
			}
		});

		if (pages.length === 0) {
			throw new Error("No images found for this chapter");
		}

		return pages;
	}

	private buildCoverUrl(comic: ComickSearchResult): string {
		if (comic.cover_url) return comic.cover_url;
		if (comic.md_covers?.length > 0) {
			return `${IMAGE_HOST}/${comic.md_covers[0]!.b2key}`;
		}
		return "";
	}

	private parseStatus(status: number | null): MangaDetail["status"] {
		// Comick status: 1=Ongoing, 2=Completed, 3=Cancelled, 4=Hiatus
		switch (status) {
			case 1:
				return "ongoing";
			case 2:
				return "completed";
			case 3:
				return "cancelled";
			case 4:
				return "hiatus";
			default:
				return "unknown";
		}
	}
}

export const comick = new Comick();
