import { fetchWithRetry, safeJson } from "../../fetch-utils";
import type { Chapter, MangaDetail, MangaSource, MangaSummary, SearchResult } from "../../types";
import type {
	MangaDexAtHomeResponse,
	MangaDexChapter,
	MangaDexListResponse,
	MangaDexManga,
} from "./types";

const API_URL = "https://api.mangadex.org";
const COVER_URL = "https://uploads.mangadex.org/covers";
const PER_PAGE = 20;

export class MangaDex implements MangaSource {
	readonly id = "mangadex";
	readonly name = "MangaDex";
	readonly baseUrl = "https://mangadex.org";

	async search(query: string, page = 1): Promise<SearchResult> {
		const offset = (page - 1) * PER_PAGE;
		const url = new URL(`${API_URL}/manga`);
		url.searchParams.set("title", query);
		url.searchParams.set("limit", PER_PAGE.toString());
		url.searchParams.set("offset", offset.toString());
		url.searchParams.set("includes[]", "cover_art");
		url.searchParams.set("hasAvailableChapters", "true");
		url.searchParams.set("order[relevance]", "desc");

		const response = await fetchWithRetry(url.toString());
		if (!response.ok) {
			throw new Error(`MangaDex search failed: ${response.status}`);
		}

		const data = await safeJson<MangaDexListResponse<MangaDexManga>>(response);

		const mangas: MangaSummary[] = data.data.map((manga) => ({
			sourceId: this.id,
			slug: manga.id,
			title: this.getTitle(manga),
			cover: this.getCoverUrl(manga),
		}));

		return {
			mangas,
			hasNextPage: offset + PER_PAGE < data.total,
		};
	}

	async getManga(id: string): Promise<MangaDetail> {
		const url = new URL(`${API_URL}/manga/${id}`);
		url.searchParams.set("includes[]", "cover_art");

		const response = await fetchWithRetry(url.toString());
		if (!response.ok) {
			throw new Error(`MangaDex getManga failed: ${response.status}`);
		}

		const data = await safeJson<{ result: string; data: MangaDexManga }>(response);
		const manga = data.data;

		return {
			sourceId: this.id,
			slug: manga.id,
			sourceIdentifier: manga.id,
			title: this.getTitle(manga),
			cover: this.getCoverUrl(manga),
			description:
				manga.attributes.description.en ?? Object.values(manga.attributes.description)[0] ?? "",
			status: this.parseStatus(manga.attributes.status),
			genres: manga.attributes.tags.map(
				(t) => t.attributes.name.en ?? Object.values(t.attributes.name)[0] ?? "",
			),
		};
	}

	async getChapters(manga: MangaDetail): Promise<Chapter[]> {
		const chapters: Chapter[] = [];
		let offset = 0;
		const limit = 100;
		let hasMore = true;

		while (hasMore && offset < 5000) {
			const url = new URL(`${API_URL}/manga/${manga.sourceIdentifier}/feed`);
			url.searchParams.set("translatedLanguage[]", "en");
			url.searchParams.set("limit", limit.toString());
			url.searchParams.set("offset", offset.toString());
			url.searchParams.set("order[chapter]", "asc");
			url.searchParams.set("includes[]", "scanlation_group");

			const response = await fetchWithRetry(url.toString());
			if (!response.ok) {
				throw new Error(`MangaDex getChapters failed: ${response.status}`);
			}

			const data = await safeJson<MangaDexListResponse<MangaDexChapter>>(response);

			for (const ch of data.data) {
				if (!ch.attributes.chapter) continue;

				chapters.push({
					sourceId: this.id,
					mangaSlug: manga.slug,
					slug: ch.id,
					number: Number.parseFloat(ch.attributes.chapter) || 0,
					title: ch.attributes.title || `Chapter ${ch.attributes.chapter}`,
					releasedAt: ch.attributes.publishAt,
				});
			}

			hasMore = offset + limit < data.total;
			offset += limit;
		}

		// Deduplicate by chapter number (keep first/oldest)
		const seen = new Map<number, Chapter>();
		for (const ch of chapters) {
			if (!seen.has(ch.number)) {
				seen.set(ch.number, ch);
			}
		}

		return Array.from(seen.values()).sort((a, b) => a.number - b.number);
	}

	async getChapterPages(chapter: Chapter): Promise<string[]> {
		const url = `${API_URL}/at-home/server/${chapter.slug}`;

		const response = await fetchWithRetry(url);
		if (!response.ok) {
			throw new Error(`MangaDex getChapterPages failed: ${response.status}`);
		}

		const data = await safeJson<MangaDexAtHomeResponse>(response);

		return data.chapter.data.map(
			(filename) => `${data.baseUrl}/data/${data.chapter.hash}/${filename}`,
		);
	}

	private getTitle(manga: MangaDexManga): string {
		return (
			manga.attributes.title.en ??
			manga.attributes.title["ja-ro"] ??
			manga.attributes.title.ja ??
			Object.values(manga.attributes.title)[0] ??
			"Unknown"
		);
	}

	private getCoverUrl(manga: MangaDexManga): string {
		const cover = manga.relationships.find((r) => r.type === "cover_art");
		if (cover?.attributes?.fileName) {
			return `${COVER_URL}/${manga.id}/${cover.attributes.fileName}.256.jpg`;
		}
		return "";
	}

	private parseStatus(status: string | null): MangaDetail["status"] {
		switch (status) {
			case "ongoing":
				return "ongoing";
			case "completed":
				return "completed";
			case "hiatus":
				return "hiatus";
			case "cancelled":
				return "cancelled";
			default:
				return "unknown";
		}
	}
}

export const mangadex = new MangaDex();
