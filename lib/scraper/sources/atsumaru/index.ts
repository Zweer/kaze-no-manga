/**
 * Atsumaru (atsu.moe) — JSON API scraper.
 *
 * Based on keiyoushi/extensions-source Atsumaru.kt.
 * Uses Typesense for search, REST API for detail/chapters/pages.
 *
 * URL patterns:
 *   Search:   GET /collections/manga/documents/search?q={query}&...
 *   Detail:   GET /api/manga/page?id={id}
 *   Chapters: GET /api/manga/allChapters?mangaId={id}
 *   Pages:    GET /api/read/chapter?mangaId={id}&chapterId={id}
 */

import { fetchWithRetry, safeJson } from "../../fetch-utils";
import type { Chapter, MangaDetail, MangaSource, MangaSummary, SearchResult } from "../../types";
import type {
	AtsChaptersResponse,
	AtsMangaDetailResponse,
	AtsReadResponse,
	AtsSearchResponse,
} from "./types";

const PER_PAGE = 40;

export class Atsumaru implements MangaSource {
	readonly id = "atsumaru";
	readonly name = "Atsumaru";
	readonly baseUrl = "https://atsu.moe";

	private headers(): Record<string, string> {
		return {
			Accept: "*/*",
			"Content-Type": "application/json",
		};
	}

	// ─── Search ───────────────────────────────────────────────

	async search(query: string, page = 1): Promise<SearchResult> {
		const url = new URL(`${this.baseUrl}/collections/manga/documents/search`);
		url.searchParams.set("q", query || "*");
		url.searchParams.set("query_by", "title,englishTitle,otherNames,authors");
		url.searchParams.set("query_by_weights", "4,3,2,1");
		url.searchParams.set("num_typos", "4,3,2,1");
		url.searchParams.set("page", page.toString());
		url.searchParams.set("per_page", PER_PAGE.toString());
		url.searchParams.set(
			"filter_by",
			"hidden:!=true && (mbContentRating:=[`Safe`,`Suggestive`,`Erotica`] || mbContentRating:!=*) && medium:!=[`Novel`] && views:>0",
		);

		const response = await fetchWithRetry(url.toString(), { headers: this.headers() });
		if (!response.ok) {
			throw new Error(`Atsumaru search failed: ${response.status}`);
		}

		const data = await safeJson<AtsSearchResponse>(response);

		const mangas: MangaSummary[] = data.hits.map((hit) => ({
			sourceId: this.id,
			slug: hit.document.id,
			title: hit.document.title,
			// Typesense search results don't include image — cover loaded on detail page
			cover: "",
		}));

		const hasNextPage = page * PER_PAGE < data.found;

		return { mangas, hasNextPage };
	}

	// ─── Manga Detail ─────────────────────────────────────────

	async getManga(identifier: string): Promise<MangaDetail> {
		const url = `${this.baseUrl}/api/manga/page?id=${encodeURIComponent(identifier)}`;

		const response = await fetchWithRetry(url, { headers: this.headers() });
		if (!response.ok) {
			throw new Error(`Atsumaru getManga failed: ${response.status}`);
		}

		const data = await safeJson<AtsMangaDetailResponse>(response);
		const manga = data.mangaPage;

		return {
			sourceId: this.id,
			slug: manga.id,
			sourceIdentifier: manga.id,
			title: manga.title,
			cover: this.buildImageUrl(manga.poster?.image ?? ""),
			description: manga.synopsis ?? "",
			status: this.parseStatus(manga.status),
			genres: manga.genres.map((g) => g.name),
		};
	}

	// ─── Chapters ─────────────────────────────────────────────

	async getChapters(manga: MangaDetail): Promise<Chapter[]> {
		const url = `${this.baseUrl}/api/manga/allChapters?mangaId=${encodeURIComponent(manga.sourceIdentifier)}`;

		const response = await fetchWithRetry(url, { headers: this.headers() });
		if (!response.ok) {
			throw new Error(`Atsumaru getChapters failed: ${response.status}`);
		}

		const data = await safeJson<AtsChaptersResponse>(response);

		// Deduplicate by chapter number (keep first = highest index/newest scan)
		const seen = new Map<number, Chapter>();

		for (const ch of data.chapters) {
			if (seen.has(ch.number)) continue;

			seen.set(ch.number, {
				sourceId: this.id,
				mangaSlug: manga.slug,
				slug: ch.id,
				number: ch.number,
				title: ch.title || `Chapter ${ch.number}`,
				releasedAt: new Date(ch.createdAt).toISOString(),
			});
		}

		return Array.from(seen.values()).sort((a, b) => a.number - b.number);
	}

	// ─── Chapter Pages ────────────────────────────────────────

	async getChapterPages(chapter: Chapter): Promise<string[]> {
		const url = new URL(`${this.baseUrl}/api/read/chapter`);
		url.searchParams.set("mangaId", chapter.mangaSlug);
		url.searchParams.set("chapterId", chapter.slug);

		const response = await fetchWithRetry(url.toString(), { headers: this.headers() });
		if (!response.ok) {
			throw new Error(`Atsumaru getChapterPages failed: ${response.status}`);
		}

		const data = await safeJson<AtsReadResponse>(response);

		return data.readChapter.pages.map((page) => this.buildImageUrl(page.image));
	}

	// ─── Helpers ──────────────────────────────────────────────

	private buildImageUrl(path: string): string {
		if (!path) return "";
		if (path.startsWith("http")) return path.replace(/^http:\/\//, "https://");
		if (path.startsWith("//")) return `https:${path}`;
		// Relative path: /static/pages/... or posters/...
		const cleanPath = path.startsWith("/") ? path : `/${path}`;
		return `${this.baseUrl}${cleanPath}`;
	}

	private parseStatus(status: string | null): MangaDetail["status"] {
		switch (status?.toLowerCase()) {
			case "ongoing":
				return "ongoing";
			case "completed":
				return "completed";
			case "hiatus":
			case "on hiatus":
				return "hiatus";
			case "dropped":
				return "dropped";
			case "cancelled":
			case "canceled":
				return "cancelled";
			default:
				return "unknown";
		}
	}
}

export const atsumaru = new Atsumaru();
