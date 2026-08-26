import type {
	Chapter,
	MangaDetail,
	MangaSource,
	MangaSummary,
	SearchResult,
} from "../../types";
import type {
	HeanCmsChapterDetailResponse,
	HeanCmsChapterListResponse,
	HeanCmsSearchResponse,
	HeanCmsSeriesDetail,
} from "./types";

export interface HeanCmsConfig {
	id: string;
	name: string;
	baseUrl: string;
	apiUrl: string;
	/** Path prefix for covers (e.g. "" or "uploads/") */
	coverPath?: string;
	/** Subdirectory for manga pages (e.g. "series") */
	mangaSubDirectory?: string;
}

const PER_PAGE = 12;
const PER_PAGE_CHAPTERS = 1000;

export class HeanCms implements MangaSource {
	readonly id: string;
	readonly name: string;
	readonly baseUrl: string;
	readonly apiUrl: string;
	private readonly coverPath: string;
	private readonly mangaSubDirectory: string;

	constructor(config: HeanCmsConfig) {
		this.id = config.id;
		this.name = config.name;
		this.baseUrl = config.baseUrl;
		this.apiUrl = config.apiUrl;
		this.coverPath = config.coverPath ?? "";
		this.mangaSubDirectory = config.mangaSubDirectory ?? "series";
	}

	async search(query: string, page = 1): Promise<SearchResult> {
		const url = new URL(`${this.apiUrl}/query`);
		url.searchParams.set("query_string", query);
		url.searchParams.set("page", page.toString());
		url.searchParams.set("perPage", PER_PAGE.toString());
		url.searchParams.set("status", "All");
		url.searchParams.set("order", "desc");
		url.searchParams.set("orderBy", "total_views");
		url.searchParams.set("series_type", "Comic");
		url.searchParams.set("tags_ids", "[]");
		url.searchParams.set("adult", "true");

		const response = await fetch(url.toString());
		if (!response.ok) {
			throw new Error(`HeanCms search failed: ${response.status}`);
		}

		const data = (await response.json()) as HeanCmsSearchResponse;

		const mangas: MangaSummary[] = data.data.map((series) => ({
			sourceId: this.id,
			slug: series.series_slug,
			title: series.title,
			cover: this.buildCoverUrl(series.thumbnail),
		}));

		const hasNextPage = data.meta
			? data.meta.current_page < data.meta.last_page
			: false;

		return { mangas, hasNextPage };
	}

	async getManga(slug: string): Promise<MangaDetail> {
		const response = await fetch(`${this.apiUrl}/series/${slug}`, {
			headers: { Accept: "application/json" },
		});

		if (!response.ok) {
			throw new Error(`HeanCms getManga failed: ${response.status}`);
		}

		const series = (await response.json()) as HeanCmsSeriesDetail;

		return {
			sourceId: this.id,
			slug: series.series_slug,
			sourceIdentifier: series.id.toString(),
			title: series.title,
			cover: this.buildCoverUrl(series.thumbnail),
			description: this.stripHtml(series.description ?? ""),
			status: this.parseStatus(series.status),
			genres: series.tags.map((tag) => tag.name),
		};
	}

	async getChapters(manga: MangaDetail): Promise<Chapter[]> {
		const chapters: Chapter[] = [];
		let page = 1;
		let hasNextPage = true;

		while (hasNextPage) {
			const url = new URL(`${this.apiUrl}/chapter/query`);
			url.searchParams.set("page", page.toString());
			url.searchParams.set("perPage", PER_PAGE_CHAPTERS.toString());
			url.searchParams.set("series_id", manga.sourceIdentifier);

			const response = await fetch(url.toString(), {
				headers: { Accept: "application/json" },
			});

			if (!response.ok) {
				throw new Error(`HeanCms getChapters failed: ${response.status}`);
			}

			const data = (await response.json()) as HeanCmsChapterListResponse;

			for (const ch of data.data) {
				if (ch.price > 0) continue; // Skip paid chapters

				chapters.push({
					sourceId: this.id,
					mangaSlug: manga.slug,
					slug: ch.chapter_slug,
					number: this.extractChapterNumber(ch.chapter_name, ch.chapter_slug),
					title: ch.chapter_title || ch.chapter_name || `Chapter ${ch.chapter_slug}`,
					releasedAt: ch.created_at,
				});
			}

			hasNextPage = data.meta.current_page < data.meta.last_page;
			page++;
		}

		return chapters.sort((a, b) => a.number - b.number);
	}

	async getChapterPages(chapter: Chapter): Promise<string[]> {
		const url = `${this.apiUrl}/chapter/${chapter.mangaSlug}/${chapter.slug}`;

		const response = await fetch(url, {
			headers: { Accept: "application/json" },
		});

		if (!response.ok) {
			throw new Error(`HeanCms getChapterPages failed: ${response.status}`);
		}

		const data = (await response.json()) as HeanCmsChapterDetailResponse;

		if (!data.chapter.chapter_data?.images) {
			throw new Error("Chapter has no images (possibly paywalled)");
		}

		return data.chapter.chapter_data.images.map((img) => this.toAbsoluteUrl(img));
	}

	private stripHtml(html: string): string {
		return html.replace(/<[^>]*>/g, "").trim();
	}

	private extractChapterNumber(name: string | null, slug: string): number {
		// Try to extract from chapter_name (e.g. "Chapter 80", "Chapter 78.5")
		if (name) {
			const match = name.match(/(\d+(?:\.\d+)?)/);
			if (match) return Number.parseFloat(match[1]!);
		}
		// Fallback: extract from slug (e.g. "chapter-80", "chapter-78-5")
		const slugMatch = slug.match(/(\d+)(?:-(\d+))?$/);
		if (slugMatch) {
			const major = slugMatch[1]!;
			const minor = slugMatch[2];
			return Number.parseFloat(minor ? `${major}.${minor}` : major);
		}
		return 0;
	}

	private buildCoverUrl(thumbnail: string | null): string {
		if (!thumbnail) return "";
		if (thumbnail.startsWith("http")) return thumbnail;
		return `${this.apiUrl}/${this.coverPath}${thumbnail}`;
	}

	private toAbsoluteUrl(url: string): string {
		if (url.startsWith("http")) return url;
		return `${this.apiUrl}/${this.coverPath}${url}`;
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
			case "canceled":
			case "cancelled":
				return "cancelled";
			default:
				return "unknown";
		}
	}
}
