import * as cheerio from "cheerio";
import { fetchWithRetry } from "../../fetch-utils";
import type { Chapter, MangaDetail, MangaSource, MangaSummary, SearchResult } from "../../types";

export interface MadaraConfig {
	id: string;
	name: string;
	baseUrl: string;
	/** Subdirectory for manga pages (default: "manga") */
	mangaSubDirectory?: string;
	/** Use AJAX endpoint for chapter list instead of page parsing */
	useAjaxChapters?: boolean;
	/** Date format for chapter dates */
	dateFormat?: string;
}

const PAGE_SIZE = 20;

export class Madara implements MangaSource {
	readonly id: string;
	readonly name: string;
	readonly baseUrl: string;
	private readonly mangaSubDirectory: string;
	private readonly useAjaxChapters: boolean;

	constructor(config: MadaraConfig) {
		this.id = config.id;
		this.name = config.name;
		this.baseUrl = config.baseUrl;
		this.mangaSubDirectory = config.mangaSubDirectory ?? "manga";
		this.useAjaxChapters = config.useAjaxChapters ?? true;
	}

	async search(query: string, page = 1): Promise<SearchResult> {
		const formData = new URLSearchParams();
		formData.set("action", "madara_load_more");
		formData.set("page", (page - 1).toString());
		formData.set("template", "madara-core/content/content-archive");
		formData.set("vars[paged]", "1");
		formData.set("vars[template]", "archive");
		formData.set("vars[posts_per_page]", PAGE_SIZE.toString());
		formData.set("vars[post_type]", "wp-manga");
		formData.set("vars[post_status]", "publish");
		formData.set("vars[manga_archives_item_layout]", "big_thumbnail");
		formData.set("vars[s]", query);
		formData.set("vars[orderby]", "meta_value_num");
		formData.set("vars[meta_key]", "_wp_manga_views");
		formData.set("vars[order]", "DESC");

		const response = await fetchWithRetry(`${this.baseUrl}/wp-admin/admin-ajax.php`, {
			method: "POST",
			headers: {
				"Content-Type": "application/x-www-form-urlencoded",
				"X-Requested-With": "XMLHttpRequest",
			},
			body: formData.toString(),
		});

		if (!response.ok) {
			throw new Error(`Madara search failed: ${response.status}`);
		}

		const html = await response.text();
		const $ = cheerio.load(html);

		const mangas: MangaSummary[] = [];
		$("div.page-item-detail, .c-tabs-item__content").each((_, el) => {
			const link = $(el).find(".post-title a").first();
			const href = link.attr("href") ?? "";
			const title = link.text().trim();
			const img = $(el).find("img").first();
			const cover = img.attr("data-src") || img.attr("src") || "";

			if (href && title) {
				const slug = this.extractSlugFromUrl(href);
				mangas.push({
					sourceId: this.id,
					slug,
					title,
					cover,
				});
			}
		});

		return { mangas, hasNextPage: mangas.length >= PAGE_SIZE };
	}

	async getManga(slug: string): Promise<MangaDetail> {
		const url = `${this.baseUrl}/${this.mangaSubDirectory}/${slug}/`;
		const response = await fetchWithRetry(url);

		if (!response.ok) {
			throw new Error(`Madara getManga failed: ${response.status}`);
		}

		const html = await response.text();
		const $ = cheerio.load(html);

		const title = $("div.post-title h1, div.post-title h3, #manga-title h1").first().text().trim();
		const description = $("div.description-summary div.summary__content, div.summary_content")
			.first()
			.text()
			.trim();
		const cover =
			$("div.summary_image img").attr("data-src") || $("div.summary_image img").attr("src") || "";
		const statusText = $(
			"div.summary-content:contains(OnGoing), div.summary-content:contains(Completed)",
		)
			.first()
			.text()
			.trim()
			.toLowerCase();
		const genres: string[] = [];
		$("div.genres-content a").each((_, el) => {
			genres.push($(el).text().trim());
		});

		return {
			sourceId: this.id,
			slug,
			sourceIdentifier: slug,
			title: title || slug,
			cover,
			description,
			status: this.parseStatus(statusText),
			genres,
		};
	}

	async getChapters(manga: MangaDetail): Promise<Chapter[]> {
		let html: string;

		if (this.useAjaxChapters) {
			// Try AJAX endpoint first
			const ajaxUrl = `${this.baseUrl}/${this.mangaSubDirectory}/${manga.slug}/ajax/chapters/`;
			const response = await fetchWithRetry(ajaxUrl, {
				method: "POST",
				headers: { "X-Requested-With": "XMLHttpRequest" },
			});

			if (response.ok) {
				html = await response.text();
			} else {
				// Fallback to page parsing
				const pageResponse = await fetchWithRetry(
					`${this.baseUrl}/${this.mangaSubDirectory}/${manga.slug}/`,
				);
				html = await pageResponse.text();
			}
		} else {
			const response = await fetchWithRetry(
				`${this.baseUrl}/${this.mangaSubDirectory}/${manga.slug}/`,
			);
			html = await response.text();
		}

		const $ = cheerio.load(html);
		const chapters: Chapter[] = [];

		$("li.wp-manga-chapter").each((_, el) => {
			const link = $(el).find("a").first();
			const href = link.attr("href") ?? "";
			const chapterText = link.text().trim();
			const dateText = $(el).find("span.chapter-release-date, span i").text().trim();

			if (href) {
				const chapterSlug = this.extractChapterSlugFromUrl(href);
				const number = this.extractChapterNumber(chapterText, chapterSlug);

				chapters.push({
					sourceId: this.id,
					mangaSlug: manga.slug,
					slug: chapterSlug,
					number,
					title: chapterText || `Chapter ${number}`,
					releasedAt: this.parseDate(dateText),
				});
			}
		});

		return chapters.sort((a, b) => a.number - b.number);
	}

	async getChapterPages(chapter: Chapter): Promise<string[]> {
		const url = `${this.baseUrl}/${this.mangaSubDirectory}/${chapter.mangaSlug}/${chapter.slug}/`;
		const response = await fetchWithRetry(url);

		if (!response.ok) {
			throw new Error(`Madara getChapterPages failed: ${response.status}`);
		}

		const html = await response.text();
		const $ = cheerio.load(html);
		const pages: string[] = [];

		$("div.page-break img, .reading-content img").each((_, el) => {
			const src = $(el).attr("data-src")?.trim() || $(el).attr("src")?.trim() || "";
			if (src && !src.includes("loading")) {
				pages.push(src);
			}
		});

		return pages;
	}

	private extractSlugFromUrl(url: string): string {
		const clean = url.replace(/\/$/, "");
		return clean.split("/").pop() ?? "";
	}

	private extractChapterSlugFromUrl(url: string): string {
		const clean = url.replace(/\/$/, "");
		const parts = clean.split("/");
		// URL format: .../manga-slug/chapter-slug/
		return parts.pop() ?? "";
	}

	private extractChapterNumber(text: string, slug: string): number {
		// Try from text: "Chapter 80", "Ch. 78.5"
		const textMatch = text.match(/(?:chapter|ch\.?)\s*(\d+(?:\.\d+)?)/i);
		if (textMatch) return Number.parseFloat(textMatch[1]!);

		// Fallback from slug: "chapter-80", "ch-78-5"
		const slugMatch = slug.match(/(\d+)(?:-(\d+))?$/);
		if (slugMatch) {
			const major = slugMatch[1]!;
			const minor = slugMatch[2];
			return Number.parseFloat(minor ? `${major}.${minor}` : major);
		}

		return 0;
	}

	private parseStatus(text: string): MangaDetail["status"] {
		if (text.includes("ongoing") || text.includes("on going")) return "ongoing";
		if (text.includes("completed")) return "completed";
		if (text.includes("hiatus") || text.includes("on hold")) return "hiatus";
		if (text.includes("dropped")) return "dropped";
		if (text.includes("canceled") || text.includes("cancelled")) return "cancelled";
		return "unknown";
	}

	private parseDate(text: string): string {
		if (!text) return new Date().toISOString();

		// Handle relative dates: "2 hours ago", "1 day ago"
		const relMatch = text.match(/(\d+)\s+(second|minute|hour|day|week|month|year)s?\s+ago/i);
		if (relMatch) {
			const amount = Number.parseInt(relMatch[1]!, 10);
			const unit = relMatch[2]!.toLowerCase();
			const now = new Date();
			const ms: Record<string, number> = {
				second: 1000,
				minute: 60_000,
				hour: 3_600_000,
				day: 86_400_000,
				week: 604_800_000,
				month: 2_592_000_000,
				year: 31_536_000_000,
			};
			return new Date(now.getTime() - amount * (ms[unit] ?? 0)).toISOString();
		}

		// Try direct parse
		const parsed = new Date(text);
		if (!Number.isNaN(parsed.getTime())) return parsed.toISOString();

		return new Date().toISOString();
	}
}
