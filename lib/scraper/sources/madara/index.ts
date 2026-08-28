/**
 * Madara base class — HTML scraper for WordPress Madara-themed manga sites.
 *
 * Supports two variants:
 *   - NoAjax: chapters embedded in manga detail page (e.g. ToonGod)
 *   - Ajax: chapters fetched via POST to /ajax/chapters/ (e.g. Toonily)
 *
 * Based on keiyoushi/extensions-source MadaraBase.kt + Madara.kt + MadaraNoAjax.kt.
 */

import * as cheerio from "cheerio";
import type { Element } from "domhandler";
import { fetchWithRetry } from "../../fetch-utils";
import type { Chapter, MangaDetail, MangaSource, MangaSummary, SearchResult } from "../../types";
import { IMAGE_ATTR_PRIORITY, MADARA_SELECTORS, type MadaraConfig } from "./types";

export class Madara implements MangaSource {
	readonly id: string;
	readonly name: string;
	readonly baseUrl: string;
	readonly enabled: boolean;

	private readonly config: MadaraConfig;

	constructor(config: MadaraConfig) {
		this.id = config.id;
		this.name = config.name;
		this.baseUrl = config.baseUrl;
		this.enabled = config.enabled !== false;
		this.config = config;
	}

	// ─── Search ───────────────────────────────────────────────

	async search(query: string, page = 1): Promise<SearchResult> {
		if (this.config.useAjaxChapters) {
			return this.ajaxSearch(query, page);
		}
		return this.htmlSearch(query, page);
	}

	/**
	 * NoAjax search: GET request with query params.
	 * Used by sites like ToonGod.
	 */
	private async htmlSearch(query: string, page: number): Promise<SearchResult> {
		const url = new URL(`${this.baseUrl}/${this.config.mangaSubString}/`, this.baseUrl);
		url.searchParams.set("s", query);
		url.searchParams.set("post_type", "wp-manga");
		if (page > 1) {
			url.pathname = `${url.pathname}page/${page}/`;
		}

		const html = await this.fetchHtml(url.toString());
		const $ = cheerio.load(html);

		const selector = this.config.searchSelector ?? MADARA_SELECTORS.archiveItem;
		const mangas = this.parseArchive($, selector);
		const hasNextPage = $("div.nav-previous, a.nextpostslink").length > 0;

		return { mangas, hasNextPage };
	}

	/**
	 * Ajax search: POST to /wp-admin/admin-ajax.php with madara_load_more action.
	 * Used by sites like Toonily.
	 */
	private async ajaxSearch(query: string, page: number): Promise<SearchResult> {
		const body = new URLSearchParams();
		body.set("action", "madara_load_more");
		body.set("page", (page - 1).toString());
		body.set("template", "madara-core/content/content-archive");
		body.set("vars[paged]", "1");
		body.set("vars[template]", "archive");
		body.set("vars[posts_per_page]", "25");
		body.set("vars[post_type]", "wp-manga");
		body.set("vars[post_status]", "publish");
		body.set("vars[manga_archives_item_layout]", "big_thumbnail");
		if (query) {
			body.set("vars[s]", query);
		}
		body.set("vars[orderby]", "meta_value_num");
		body.set("vars[meta_key]", "_wp_manga_views");
		body.set("vars[order]", "DESC");

		const response = await fetchWithRetry(`${this.baseUrl}/wp-admin/admin-ajax.php`, {
			method: "POST",
			headers: {
				...this.buildHeaders(),
				"Content-Type": "application/x-www-form-urlencoded",
				"X-Requested-With": "XMLHttpRequest",
			},
			body: body.toString(),
		});

		if (!response.ok) {
			throw new Error(`Madara search failed: ${response.status}`);
		}

		const html = await response.text();
		const $ = cheerio.load(html);

		const selector = this.config.searchSelector ?? MADARA_SELECTORS.archiveItem;
		const mangas = this.parseArchive($, selector);

		return { mangas, hasNextPage: mangas.length === 25 };
	}

	// ─── Manga Detail ─────────────────────────────────────────

	async getManga(slug: string): Promise<MangaDetail> {
		const url = `${this.baseUrl}/${this.config.mangaSubString}/${slug}/`;
		const html = await this.fetchHtml(url);
		const $ = cheerio.load(html);

		const title = this.extractTitle($);
		const description = this.extractDescription($);
		const cover = this.extractThumbnail($);
		const status = this.extractStatus($);
		const genres = this.extractGenres($);

		return {
			sourceId: this.id,
			slug,
			sourceIdentifier: slug,
			title,
			cover,
			description,
			status,
			genres,
		};
	}

	// ─── Chapters ─────────────────────────────────────────────

	async getChapters(manga: MangaDetail): Promise<Chapter[]> {
		let html: string;

		if (this.config.useAjaxChapters) {
			html = await this.fetchAjaxChapters(manga.slug);
		} else {
			// NoAjax: chapters are in the manga detail page
			const url = `${this.baseUrl}/${this.config.mangaSubString}/${manga.slug}/`;
			html = await this.fetchHtml(url);
		}

		const $ = cheerio.load(html);

		const chapters: Chapter[] = [];

		$(MADARA_SELECTORS.chapterList).each((_, el) => {
			const link = $(el).find(MADARA_SELECTORS.chapterLink).first();
			const href = link.attr("href");
			if (!href) return;

			const chapterSlug = this.extractChapterSlug(href);
			if (!chapterSlug) return;

			const name = link.text().trim();
			const dateText = $(el).find(MADARA_SELECTORS.chapterDate).text().trim();

			chapters.push({
				sourceId: this.id,
				mangaSlug: manga.slug,
				slug: chapterSlug,
				number: this.extractChapterNumber(name, chapterSlug),
				title: name || `Chapter ${chapterSlug}`,
				releasedAt: this.parseDate(dateText),
			});
		});

		return chapters.sort((a, b) => a.number - b.number);
	}

	private async fetchAjaxChapters(mangaSlug: string): Promise<string> {
		const url = `${this.baseUrl}/${this.config.mangaSubString}/${mangaSlug}/ajax/chapters/`;

		const response = await fetchWithRetry(url, {
			method: "POST",
			headers: {
				...this.buildHeaders(),
				"X-Requested-With": "XMLHttpRequest",
			},
		});

		if (!response.ok) {
			throw new Error(`Madara getChapters failed: ${response.status}`);
		}

		return response.text();
	}

	// ─── Chapter Pages ────────────────────────────────────────

	async getChapterPages(chapter: Chapter): Promise<string[]> {
		const url = `${this.baseUrl}/${this.config.mangaSubString}/${chapter.mangaSlug}/${chapter.slug}/`;
		const html = await this.fetchHtml(url);
		const $ = cheerio.load(html);

		// Check for single-page mode and switch to list mode
		if ($("#single-pager").length > 0) {
			const listUrl = `${url}?style=list`;
			const listHtml = await this.fetchHtml(listUrl);
			return this.extractPageImages(cheerio.load(listHtml));
		}

		return this.extractPageImages($);
	}

	private extractPageImages($: cheerio.CheerioAPI): string[] {
		const images: string[] = [];

		$(MADARA_SELECTORS.pageImages).each((_, el) => {
			const img = $(el).is("img") ? $(el) : $(el).find("img").first();
			if (img.length === 0) return;

			const src = this.imageFromElement(img);
			if (src && this.isValidImageUrl(src)) {
				images.push(src.trim());
			}
		});

		return images;
	}

	// ─── HTML Parsing Helpers ─────────────────────────────────

	private parseArchive($: cheerio.CheerioAPI, selector: string): MangaSummary[] {
		const mangas: MangaSummary[] = [];

		$(selector).each((_, el) => {
			const link = $(el).find(MADARA_SELECTORS.archiveUrl).first();
			const href = link.attr("href");
			if (!href) return;

			const slug = this.extractMangaSlug(href);
			if (!slug) return;

			const title = link.text().trim();
			if (!title) return;

			const img = $(el).find("img").first();
			const cover = this.imageFromElement(img);

			mangas.push({
				sourceId: this.id,
				slug,
				title,
				cover: cover ?? "",
			});
		});

		return mangas;
	}

	private extractTitle($: cheerio.CheerioAPI): string {
		const el = $(MADARA_SELECTORS.title).first();
		// Get own text content only (exclude badge spans)
		return el.contents().first().text().trim() || el.text().trim() || "Unknown";
	}

	private extractDescription($: cheerio.CheerioAPI): string {
		const selector = this.config.descriptionSelector ?? MADARA_SELECTORS.description;
		const el = $(selector).first();

		// Try paragraphs first, fall back to all text
		const paragraphs = el.find("p");
		if (paragraphs.length > 0) {
			return paragraphs
				.map((_, p) => $(p).text().trim())
				.get()
				.filter(Boolean)
				.join("\n\n");
		}

		return el.text().trim();
	}

	private extractThumbnail($: cheerio.CheerioAPI): string {
		const img = $(MADARA_SELECTORS.thumbnail).first();
		return this.imageFromElement(img) ?? "";
	}

	private extractStatus($: cheerio.CheerioAPI): MangaDetail["status"] {
		const statusEl = $(MADARA_SELECTORS.status).last();
		const text = statusEl.text().toLowerCase().trim();
		return this.parseStatusText(text);
	}

	private extractGenres($: cheerio.CheerioAPI): string[] {
		return $(MADARA_SELECTORS.genres)
			.map((_, el) => $(el).text().trim())
			.get()
			.filter(Boolean);
	}

	/**
	 * Extract image URL from an element, following Madara's priority order.
	 */
	private imageFromElement(el: cheerio.Cheerio<Element>): string | null {
		for (const attr of IMAGE_ATTR_PRIORITY) {
			const value = el.attr(attr);
			if (!value) continue;

			if (attr === "srcset") {
				const best = this.bestSrcSetUrl(value);
				if (best) return best;
				continue;
			}

			if (value.trim()) return value.trim();
		}
		return null;
	}

	/**
	 * Pick the highest-resolution URL from a srcset attribute.
	 */
	private bestSrcSetUrl(srcset: string): string | null {
		const candidates = srcset
			.split(",")
			.map((s) => s.trim().split(/\s+/))
			.filter((parts) => parts.length >= 1 && /^https?:\/\//.test(parts[0]!));

		if (candidates.length === 0) return null;

		// Pick the candidate with the largest width descriptor (e.g. 800w)
		let best: string | null = null;
		let bestWidth = 0;

		for (const parts of candidates) {
			const url = parts[0]!;
			const descriptor = parts[1];
			const width = descriptor ? Number.parseFloat(descriptor) : 0;

			if (width > bestWidth || best === null) {
				best = url;
				bestWidth = width;
			}
		}

		return best;
	}

	// ─── URL Extraction ───────────────────────────────────────

	private extractMangaSlug(href: string): string | null {
		try {
			const url = new URL(href);
			const segments = url.pathname.split("/").filter(Boolean);
			// URL pattern: /{mangaSubString}/{slug}/
			const subIdx = segments.indexOf(this.config.mangaSubString);
			if (subIdx >= 0 && subIdx + 1 < segments.length) {
				return segments[subIdx + 1] ?? null;
			}
			// Fallback: last non-empty segment
			return segments.at(-1) ?? null;
		} catch {
			return null;
		}
	}

	private extractChapterSlug(href: string): string | null {
		try {
			const url = new URL(href);
			const segments = url.pathname.split("/").filter(Boolean);
			// Last segment is the chapter slug
			return segments.at(-1) ?? null;
		} catch {
			return null;
		}
	}

	private extractChapterNumber(name: string, slug: string): number {
		// Try name first: "Chapter 42", "Ch. 42.5", "Side Story 21"
		const nameMatch = name.match(/(\d+(?:\.\d+)?)/);
		if (nameMatch) return Number.parseFloat(nameMatch[1]!);

		// Try slug: "chapter-42", "chapter-42-5"
		const slugMatch = slug.match(/(\d+)(?:-(\d+))?$/);
		if (slugMatch) {
			const major = slugMatch[1]!;
			const minor = slugMatch[2];
			return Number.parseFloat(minor ? `${major}.${minor}` : major);
		}

		return 0;
	}

	// ─── Date Parsing ─────────────────────────────────────────

	private parseDate(text: string): string {
		if (!text) return new Date(0).toISOString();

		const normalized = text.toLowerCase().trim();

		// Relative dates: "5 hours ago", "2 days ago", "today", "yesterday"
		if (normalized === "today" || normalized.startsWith("just now")) {
			return new Date().toISOString();
		}

		if (normalized === "yesterday") {
			const d = new Date();
			d.setDate(d.getDate() - 1);
			return d.toISOString();
		}

		const relativeMatch = normalized.match(
			/(\d+)\s+(second|minute|hour|day|week|month|year)s?\s+ago/,
		);
		if (relativeMatch) {
			return this.parseRelativeDate(Number.parseInt(relativeMatch[1]!, 10), relativeMatch[2]!);
		}

		// Absolute dates
		return this.parseAbsoluteDate(text);
	}

	private parseRelativeDate(amount: number, unit: string): string {
		const now = new Date();

		switch (unit) {
			case "second":
				now.setSeconds(now.getSeconds() - amount);
				break;
			case "minute":
				now.setMinutes(now.getMinutes() - amount);
				break;
			case "hour":
				now.setHours(now.getHours() - amount);
				break;
			case "day":
				now.setDate(now.getDate() - amount);
				break;
			case "week":
				now.setDate(now.getDate() - amount * 7);
				break;
			case "month":
				now.setMonth(now.getMonth() - amount);
				break;
			case "year":
				now.setFullYear(now.getFullYear() - amount);
				break;
		}

		return now.toISOString();
	}

	private parseAbsoluteDate(text: string): string {
		// Handle "UP" (updating) as today
		if (/\bup\b/i.test(text)) {
			return new Date().toISOString();
		}

		// Common Madara date formats:
		// "MMMM dd, yyyy" — "January 15, 2024"
		// "MMM d, yy"     — "May 31, 23" (Toonily)
		// "d MMM yyyy"    — "5 Aug 2024" (ToonGod)
		const parsed = new Date(text);
		if (!Number.isNaN(parsed.getTime())) {
			return parsed.toISOString();
		}

		// Try "MMM d, yy" format (two-digit year)
		const shortYearMatch = text.match(/(\w+)\s+(\d{1,2}),?\s+(\d{2})$/);
		if (shortYearMatch) {
			const [, month, day, year] = shortYearMatch;
			const fullYear = Number.parseInt(year!, 10) + 2000;
			const attempt = new Date(`${month} ${day}, ${fullYear}`);
			if (!Number.isNaN(attempt.getTime())) {
				return attempt.toISOString();
			}
		}

		return new Date(0).toISOString();
	}

	// ─── Status Parsing ───────────────────────────────────────

	private parseStatusText(text: string): MangaDetail["status"] {
		if (/completed|completo|conclu[ií]do|finalizado/.test(text)) return "completed";
		if (/ongoing|on going|updating|em lan[çc]amento|en cours/.test(text)) return "ongoing";
		if (/on hold|hiatus|pausado/.test(text)) return "hiatus";
		if (/dropped/.test(text)) return "dropped";
		if (/cancel[le]d|cancelado/.test(text)) return "cancelled";
		return "unknown";
	}

	// ─── Fetch Helpers ────────────────────────────────────────

	private async fetchHtml(url: string): Promise<string> {
		const response = await fetchWithRetry(url, {
			headers: this.buildHeaders(),
		});

		if (!response.ok) {
			throw new Error(`Madara fetch failed (${response.status}): ${url}`);
		}

		return response.text();
	}

	private buildHeaders(): Record<string, string> {
		const headers: Record<string, string> = {
			Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
		};

		if (this.config.cookies) {
			headers.Cookie = Object.entries(this.config.cookies)
				.map(([k, v]) => `${k}=${v}`)
				.join("; ");
		}

		if (this.config.headers) {
			Object.assign(headers, this.config.headers);
		}

		return headers;
	}

	private isValidImageUrl(url: string): boolean {
		if (!url || url.length < 10) return false;
		// Skip common non-manga images
		if (url.includes("/avatar/")) return false;
		if (url.includes("/emoji/")) return false;
		if (url.includes("gravatar.com")) return false;
		// Must look like a real URL
		return url.startsWith("http://") || url.startsWith("https://");
	}
}
