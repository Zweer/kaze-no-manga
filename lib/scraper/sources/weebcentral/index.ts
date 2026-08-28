/**
 * Weeb Central — custom HTML scraper.
 *
 * Based on keiyoushi/extensions-source WeebCentral.kt.
 * Pure HTML scraping via cheerio, no API, no anti-bot.
 *
 * URL patterns:
 *   Search:   GET /search/data?text={query}&limit=32&offset=0&display_mode=Full+Display
 *   Detail:   GET /series/{id}/{slug}
 *   Chapters: GET /series/{id}/full-chapter-list
 *   Pages:    GET /chapters/{chapterId}/images?is_prev=False&reading_style=long_strip
 *
 * Rate limit: 1 request per 2 seconds (enforced by the site).
 */

import * as cheerio from "cheerio";
import type { Element } from "domhandler";
import { fetchWithRetry } from "../../fetch-utils";
import type { Chapter, MangaDetail, MangaSource, MangaSummary, SearchResult } from "../../types";

const FETCH_LIMIT = 32;
const EXCLUDED_SEARCH_CHARS = /[!#:(),-]/g;

export class WeebCentral implements MangaSource {
	readonly id = "weebcentral";
	readonly name = "Weeb Central";
	readonly baseUrl = "https://weebcentral.com";

	// ─── Search ───────────────────────────────────────────────

	async search(query: string, page = 1): Promise<SearchResult> {
		const offset = (page - 1) * FETCH_LIMIT;
		const cleanQuery = query.replace(EXCLUDED_SEARCH_CHARS, " ").trim();

		const url = new URL(`${this.baseUrl}/search/data`);
		url.searchParams.set("text", cleanQuery);
		url.searchParams.set("limit", FETCH_LIMIT.toString());
		url.searchParams.set("offset", offset.toString());
		url.searchParams.set("display_mode", "Full Display");

		const html = await this.fetchHtml(url.toString());
		const $ = cheerio.load(html);

		const mangas: MangaSummary[] = [];

		$("article > section > a").each((_, el) => {
			const href = $(el).attr("href");
			if (!href) return;

			const { seriesId, slug } = this.parseSeriesUrl(href);
			if (!seriesId) return;

			const title = $(el).find("div:not([class]):last-child").text().trim();
			const cover = this.sourceImg($(el));

			mangas.push({
				sourceId: this.id,
				slug: `${seriesId}/${slug}`,
				title,
				cover: cover ?? "",
			});
		});

		const hasNextPage = $("button").length > 0;

		return { mangas, hasNextPage };
	}

	// ─── Manga Detail ─────────────────────────────────────────

	async getManga(identifier: string): Promise<MangaDetail> {
		const url = `${this.baseUrl}/series/${identifier}`;
		const html = await this.fetchHtml(url);
		const $ = cheerio.load(html);

		const sections = $("section[x-data] > section");
		const s0 = sections.eq(0);
		const s1 = sections.eq(1);

		const title = s1.find("h1").first().text().trim() || "Unknown";
		const cover = this.sourceImg(s0) ?? "";

		const genres = s0
			.find("ul > li:has(strong:contains(Tag),strong:contains(Type)) a")
			.map((_, el) => $(el).text().trim())
			.get();

		const statusText = s0.find("ul > li:has(strong:contains(Status)) > a").text().trim();
		const status = this.parseStatus(statusText);

		const description = this.buildDescription($, s1);

		const seriesId = this.extractSeriesId(identifier);

		return {
			sourceId: this.id,
			slug: identifier,
			sourceIdentifier: seriesId,
			title,
			cover,
			description,
			status,
			genres,
		};
	}

	// ─── Chapters ─────────────────────────────────────────────

	async getChapters(manga: MangaDetail): Promise<Chapter[]> {
		const seriesId = manga.sourceIdentifier;
		const url = `${this.baseUrl}/series/${seriesId}/full-chapter-list`;
		const html = await this.fetchHtml(url);
		const $ = cheerio.load(html);

		const elements = $("div[x-data] > a");
		const total = elements.length;
		const chapters: Chapter[] = [];

		elements.each((index, el) => {
			const href = $(el).attr("href");
			if (!href) return;

			const chapterId = this.extractChapterId(href);
			if (!chapterId) return;

			const name = $(el).find("span.flex > span").first().text().trim();
			const dateStr = $(el).find("time[datetime]").attr("datetime") ?? "";

			chapters.push({
				sourceId: this.id,
				mangaSlug: manga.slug,
				slug: chapterId,
				number: this.extractChapterNumber(name, total - index),
				title: name || `Chapter ${total - index}`,
				releasedAt: dateStr || new Date(0).toISOString(),
			});
		});

		return chapters.sort((a, b) => a.number - b.number);
	}

	// ─── Chapter Pages ────────────────────────────────────────

	async getChapterPages(chapter: Chapter): Promise<string[]> {
		const url = new URL(`${this.baseUrl}/chapters/${chapter.slug}/images`);
		url.searchParams.set("is_prev", "False");
		url.searchParams.set("reading_style", "long_strip");

		const html = await this.fetchHtml(url.toString());
		const $ = cheerio.load(html);

		const images: string[] = [];

		$("section img, section[x-data] > img").each((_, el) => {
			const src = $(el).attr("src");
			if (src?.startsWith("http")) {
				images.push(src.trim());
			}
		});

		return images;
	}

	// ─── URL Parsing ──────────────────────────────────────────

	private parseSeriesUrl(href: string): { seriesId: string; slug: string } {
		// URL: https://weebcentral.com/series/{id}/{slug}
		// or: /series/{id}/{slug}
		try {
			const url = new URL(href, this.baseUrl);
			const segments = url.pathname.split("/").filter(Boolean);
			const seriesIdx = segments.indexOf("series");
			if (seriesIdx >= 0 && seriesIdx + 1 < segments.length) {
				const seriesId = segments[seriesIdx + 1]!;
				const slug = segments[seriesIdx + 2] ?? "";
				return { seriesId, slug };
			}
		} catch {
			// ignore
		}
		return { seriesId: "", slug: "" };
	}

	private extractSeriesId(identifier: string): string {
		// identifier can be "SERIES_ID/slug" or just "SERIES_ID"
		return identifier.split("/")[0]!;
	}

	private extractChapterId(href: string): string | null {
		// URL: /chapters/{chapterId} or https://weebcentral.com/chapters/{chapterId}
		try {
			const url = new URL(href, this.baseUrl);
			const segments = url.pathname.split("/").filter(Boolean);
			const chapIdx = segments.indexOf("chapters");
			if (chapIdx >= 0 && chapIdx + 1 < segments.length) {
				return segments[chapIdx + 1]!;
			}
		} catch {
			// ignore
		}
		return null;
	}

	private extractChapterNumber(name: string, fallbackIndex: number): number {
		const match = name.match(/(\d+(?:\.\d+)?)/);
		if (match) return Number.parseFloat(match[1]!);
		return fallbackIndex;
	}

	// ─── HTML Helpers ─────────────────────────────────────────

	private sourceImg(el: cheerio.Cheerio<Element>): string | null {
		// Prefer <source srcset> (replace "small" with "normal" for better quality)
		const srcset = el.find("source").attr("srcset");
		if (srcset) return srcset.replace("small", "normal");

		const imgSrc = el.find("img").attr("src");
		return imgSrc ?? null;
	}

	private buildDescription(
		$: cheerio.CheerioAPI,
		section: cheerio.Cheerio<Element>,
	): string {
		const parts: string[] = [];

		// Main description
		const desc = section.find("li:has(strong:contains(Description)) > p").text().trim();
		if (desc) {
			parts.push(desc.replace("NOTE: ", "\n\nNOTE: "));
		}

		// Alternate titles
		const altTitles = section.find("li:has(strong:contains(Associated Name)) li");
		if (altTitles.length > 0) {
			parts.push("\n\nAssociated Name(s):");
			altTitles.each((_, el) => {
				parts.push(`- ${$(el).text().trim()}`);
			});
		}

		return parts.join("\n");
	}

	private parseStatus(text: string): MangaDetail["status"] {
		switch (text.toLowerCase()) {
			case "ongoing":
				return "ongoing";
			case "complete":
			case "completed":
				return "completed";
			case "hiatus":
				return "hiatus";
			case "canceled":
			case "cancelled":
				return "cancelled";
			default:
				return "unknown";
		}
	}

	// ─── Fetch ────────────────────────────────────────────────

	private async fetchHtml(url: string): Promise<string> {
		const response = await fetchWithRetry(url, {
			headers: {
				Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
			},
		});

		if (!response.ok) {
			throw new Error(`WeebCentral fetch failed (${response.status}): ${url}`);
		}

		return response.text();
	}
}

export const weebcentral = new WeebCentral();
