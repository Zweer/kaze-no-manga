import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { WeebCentral } from "./index";

// ─── Fixtures ─────────────────────────────────────────────────

const FIXTURES_DIR = resolve(import.meta.dirname, "__fixtures__");

function loadFixture(name: string): string {
	return readFileSync(resolve(FIXTURES_DIR, name), "utf-8");
}

const fixtures = {
	search: loadFixture("search.html"),
	manga: loadFixture("manga.html"),
	chapters: loadFixture("chapters.html"),
	chapterPages: loadFixture("chapter-pages.html"),
};

// ─── Mock Setup ───────────────────────────────────────────────

const mockFetch = vi.fn();

function mockHtmlResponse(html: string, ok = true, status = 200): unknown {
	return {
		ok,
		status,
		url: "https://weebcentral.com/mock",
		text: () => Promise.resolve(html),
	};
}

beforeEach(() => {
	vi.stubGlobal("fetch", mockFetch);
});

afterEach(() => {
	vi.restoreAllMocks();
});

// ─── Tests ────────────────────────────────────────────────────

const wc = new WeebCentral();

describe("WeebCentral", () => {
	describe("search", () => {
		it("should parse search results", async () => {
			mockFetch.mockResolvedValueOnce(mockHtmlResponse(fixtures.search));

			const result = await wc.search("one piece");

			expect(result.mangas.length).toBe(5);
			const first = result.mangas[0]!;
			expect(first.sourceId).toBe("weebcentral");
			expect(first.title).toBe("One Piece");
			expect(first.slug).toContain("01J76XY7E9FNDZ1DBBM6PBJPFK");
			expect(first.cover).toMatch(/^https?:\/\//);
			expect(first.cover).toContain("normal"); // srcset "small" replaced with "normal"
		});

		it("should build correct search URL", async () => {
			mockFetch.mockResolvedValueOnce(mockHtmlResponse(fixtures.search));

			await wc.search("one piece", 2);

			const [url] = mockFetch.mock.lastCall as [string];
			expect(url).toContain("text=one+piece");
			expect(url).toContain("limit=32");
			expect(url).toContain("offset=32");
			expect(url).toContain("display_mode=Full+Display");
		});

		it("should strip special characters from search query", async () => {
			mockFetch.mockResolvedValueOnce(mockHtmlResponse(fixtures.search));

			await wc.search("one-piece! (2024)");

			const [url] = mockFetch.mock.lastCall as [string];
			// Special chars stripped, query trimmed (spaces may not collapse)
			expect(url).not.toContain("!");
			expect(url).not.toContain("(");
			expect(url).not.toContain(")");
			expect(url).toContain("one");
			expect(url).toContain("piece");
			expect(url).toContain("2024");
		});

		it("should detect no next page when no button present", async () => {
			mockFetch.mockResolvedValueOnce(mockHtmlResponse(fixtures.search));

			const result = await wc.search("one piece");

			expect(result.hasNextPage).toBe(false);
		});
	});

	describe("getManga", () => {
		it("should parse manga detail", async () => {
			mockFetch.mockResolvedValueOnce(mockHtmlResponse(fixtures.manga));

			const manga = await wc.getManga("01J76XY7E9FNDZ1DBBM6PBJPFK/One-Piece");

			expect(manga.sourceId).toBe("weebcentral");
			expect(manga.slug).toBe("01J76XY7E9FNDZ1DBBM6PBJPFK/One-Piece");
			expect(manga.sourceIdentifier).toBe("01J76XY7E9FNDZ1DBBM6PBJPFK");
			expect(manga.title).toBe("One Piece");
			expect(manga.status).toBe("ongoing");
			expect(manga.cover).toMatch(/^https?:\/\//);
		});

		it("should extract genres", async () => {
			mockFetch.mockResolvedValueOnce(mockHtmlResponse(fixtures.manga));

			const manga = await wc.getManga("01J76XY7E9FNDZ1DBBM6PBJPFK/One-Piece");

			expect(manga.genres).toContain("Action");
			expect(manga.genres).toContain("Adventure");
			expect(manga.genres.length).toBeGreaterThanOrEqual(3);
		});

		it("should extract description", async () => {
			mockFetch.mockResolvedValueOnce(mockHtmlResponse(fixtures.manga));

			const manga = await wc.getManga("01J76XY7E9FNDZ1DBBM6PBJPFK/One-Piece");

			expect(manga.description).toContain("Luffy");
			expect(manga.description.length).toBeGreaterThan(50);
		});

		it("should fetch from correct URL", async () => {
			mockFetch.mockResolvedValueOnce(mockHtmlResponse(fixtures.manga));

			await wc.getManga("SOMEID/My-Manga");

			const [url] = mockFetch.mock.lastCall as [string];
			expect(url).toBe("https://weebcentral.com/series/SOMEID/My-Manga");
		});
	});

	describe("getChapters", () => {
		it("should parse all chapters", async () => {
			mockFetch.mockResolvedValueOnce(mockHtmlResponse(fixtures.chapters));

			const manga = {
				sourceId: "weebcentral",
				slug: "01J76XY7E9FNDZ1DBBM6PBJPFK/One-Piece",
				sourceIdentifier: "01J76XY7E9FNDZ1DBBM6PBJPFK",
				title: "One Piece",
				cover: "",
				description: "",
				status: "ongoing" as const,
				genres: [],
			};

			const chapters = await wc.getChapters(manga);

			expect(chapters.length).toBe(1191);
		});

		it("should sort chapters ascending by number", async () => {
			mockFetch.mockResolvedValueOnce(mockHtmlResponse(fixtures.chapters));

			const manga = {
				sourceId: "weebcentral",
				slug: "01J76XY7E9FNDZ1DBBM6PBJPFK/One-Piece",
				sourceIdentifier: "01J76XY7E9FNDZ1DBBM6PBJPFK",
				title: "One Piece",
				cover: "",
				description: "",
				status: "ongoing" as const,
				genres: [],
			};

			const chapters = await wc.getChapters(manga);

			expect(chapters[0]!.number).toBe(1);
			expect(chapters.at(-1)!.number).toBe(1191);

			for (let i = 1; i < chapters.length; i++) {
				expect(chapters[i]!.number).toBeGreaterThanOrEqual(chapters[i - 1]!.number);
			}
		});

		it("should have valid chapter IDs as slugs", async () => {
			mockFetch.mockResolvedValueOnce(mockHtmlResponse(fixtures.chapters));

			const manga = {
				sourceId: "weebcentral",
				slug: "01J76XY7E9FNDZ1DBBM6PBJPFK/One-Piece",
				sourceIdentifier: "01J76XY7E9FNDZ1DBBM6PBJPFK",
				title: "One Piece",
				cover: "",
				description: "",
				status: "ongoing" as const,
				genres: [],
			};

			const chapters = await wc.getChapters(manga);
			const first = chapters[0]!;

			expect(first.slug).toMatch(/^[A-Z0-9]+$/);
			expect(first.slug.length).toBeGreaterThan(10);
		});

		it("should parse chapter dates as ISO strings", async () => {
			mockFetch.mockResolvedValueOnce(mockHtmlResponse(fixtures.chapters));

			const manga = {
				sourceId: "weebcentral",
				slug: "01J76XY7E9FNDZ1DBBM6PBJPFK/One-Piece",
				sourceIdentifier: "01J76XY7E9FNDZ1DBBM6PBJPFK",
				title: "One Piece",
				cover: "",
				description: "",
				status: "ongoing" as const,
				genres: [],
			};

			const chapters = await wc.getChapters(manga);

			for (const ch of chapters.slice(0, 10)) {
				expect(ch.releasedAt).toBeTruthy();
				expect(new Date(ch.releasedAt).getTime()).not.toBeNaN();
			}
		});

		it("should fetch from full-chapter-list endpoint", async () => {
			mockFetch.mockResolvedValueOnce(mockHtmlResponse(fixtures.chapters));

			const manga = {
				sourceId: "weebcentral",
				slug: "01J76XY7E9FNDZ1DBBM6PBJPFK/One-Piece",
				sourceIdentifier: "01J76XY7E9FNDZ1DBBM6PBJPFK",
				title: "One Piece",
				cover: "",
				description: "",
				status: "ongoing" as const,
				genres: [],
			};

			await wc.getChapters(manga);

			const [url] = mockFetch.mock.lastCall as [string];
			expect(url).toBe(
				"https://weebcentral.com/series/01J76XY7E9FNDZ1DBBM6PBJPFK/full-chapter-list",
			);
		});
	});

	describe("getChapterPages", () => {
		it("should extract image URLs", async () => {
			mockFetch.mockResolvedValueOnce(mockHtmlResponse(fixtures.chapterPages));

			const chapter = {
				sourceId: "weebcentral",
				mangaSlug: "01J76XY7E9FNDZ1DBBM6PBJPFK/One-Piece",
				slug: "01J76XYYR7VK2XCSHBZT8BZ4C2",
				number: 1,
				title: "Chapter 1",
				releasedAt: "2024-09-07T17:04:15.717Z",
			};

			const pages = await wc.getChapterPages(chapter);

			expect(pages.length).toBe(57);
			for (const url of pages) {
				expect(url).toMatch(/^https?:\/\//);
				expect(url).toContain("planeptune.us");
			}
		});

		it("should fetch from images endpoint with correct params", async () => {
			mockFetch.mockResolvedValueOnce(mockHtmlResponse(fixtures.chapterPages));

			const chapter = {
				sourceId: "weebcentral",
				mangaSlug: "01J76XY7E9FNDZ1DBBM6PBJPFK/One-Piece",
				slug: "CHAPTER_ID_123",
				number: 1,
				title: "Chapter 1",
				releasedAt: "2024-01-01T00:00:00Z",
			};

			await wc.getChapterPages(chapter);

			const [url] = mockFetch.mock.lastCall as [string];
			expect(url).toContain("/chapters/CHAPTER_ID_123/images");
			expect(url).toContain("is_prev=False");
			expect(url).toContain("reading_style=long_strip");
		});
	});

	describe("Error handling", () => {
		it("should throw on HTTP error", async () => {
			mockFetch.mockResolvedValue(mockHtmlResponse("", false, 404));

			await expect(wc.getManga("invalid")).rejects.toThrow("WeebCentral fetch failed (404)");
		});
	});
});
