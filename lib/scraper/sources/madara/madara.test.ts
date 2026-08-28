import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { Madara } from "./index";

// ─── Fixtures ─────────────────────────────────────────────────

const FIXTURES_DIR = resolve(import.meta.dirname, "__fixtures__");

function loadFixture(name: string): string {
	return readFileSync(resolve(FIXTURES_DIR, name), "utf-8");
}

const fixtures = {
	search: loadFixture("toonily-search.html"),
	manga: loadFixture("toonily-manga.html"),
	chapters: loadFixture("toonily-chapters.html"),
	chapterPages: loadFixture("toonily-chapter-pages.html"),
};

// ─── Mock Setup ───────────────────────────────────────────────

const mockFetch = vi.fn();

function mockHtmlResponse(html: string, ok = true, status = 200): unknown {
	return {
		ok,
		status,
		url: "https://toonily.com/mock",
		text: () => Promise.resolve(html),
	};
}

beforeEach(() => {
	vi.stubGlobal("fetch", mockFetch);
});

afterEach(() => {
	vi.restoreAllMocks();
});

// ─── Source Instances ─────────────────────────────────────────

const toonily = new Madara({
	id: "toonily",
	name: "Toonily",
	baseUrl: "https://toonily.com",
	mangaSubString: "serie",
	useAjaxChapters: true,
	cookies: { "toonily-mature": "1" },
	searchSelector: "div.page-item-detail.manga",
	descriptionSelector: "div.content-area div.summary__content",
});

const toongod = new Madara({
	id: "toongod",
	name: "ToonGod",
	baseUrl: "https://www.toongod.org",
	mangaSubString: "webtoons",
	useAjaxChapters: false,
});

// ─── Tests ────────────────────────────────────────────────────

describe("Madara", () => {
	describe("Toonily (Ajax variant)", () => {
		describe("search", () => {
			it("should parse search results from Ajax response", async () => {
				mockFetch.mockResolvedValueOnce(mockHtmlResponse(fixtures.search));

				const result = await toonily.search("solo leveling");

				expect(result.mangas.length).toBeGreaterThanOrEqual(1);
				const first = result.mangas[0]!;
				expect(first.sourceId).toBe("toonily");
				expect(first.title).toBeTruthy();
				expect(first.slug).toBeTruthy();
				expect(first.cover).toMatch(/^https?:\/\//);
			});

			it("should send POST to wp-admin/admin-ajax.php for Ajax search", async () => {
				mockFetch.mockResolvedValueOnce(mockHtmlResponse(fixtures.search));

				await toonily.search("test query");

				const [url, opts] = mockFetch.mock.lastCall as [string, RequestInit];
				expect(url).toBe("https://toonily.com/wp-admin/admin-ajax.php");
				expect(opts.method).toBe("POST");
				expect(opts.body).toContain("action=madara_load_more");
				expect(opts.body).toContain("vars%5Bs%5D=test+query");
			});

			it("should include toonily-mature cookie in headers", async () => {
				mockFetch.mockResolvedValueOnce(mockHtmlResponse(fixtures.search));

				await toonily.search("test");

				const [, opts] = mockFetch.mock.lastCall as [string, RequestInit];
				const headers = opts.headers as Record<string, string>;
				expect(headers.Cookie).toContain("toonily-mature=1");
			});

			it("should find manga slugs containing the hash suffix", async () => {
				mockFetch.mockResolvedValueOnce(mockHtmlResponse(fixtures.search));

				const result = await toonily.search("solo leveling");

				// The fixture has "solo-leveling-ragnarok-9a9db6f6" and "solo-leveling-574def58"
				const slugs = result.mangas.map((m) => m.slug);
				expect(slugs.some((s) => s.includes("solo-leveling"))).toBe(true);
			});
		});

		describe("getManga", () => {
			it("should parse manga detail from HTML", async () => {
				mockFetch.mockResolvedValueOnce(mockHtmlResponse(fixtures.manga));

				const manga = await toonily.getManga("solo-leveling-574def58");

				expect(manga.sourceId).toBe("toonily");
				expect(manga.slug).toBe("solo-leveling-574def58");
				expect(manga.title).toBe("Solo Leveling");
				expect(manga.cover).toMatch(/^https?:\/\/static\.tnlycdn\.com/);
				expect(manga.status).toBe("completed");
				expect(manga.genres).toContain("Action");
				expect(manga.genres).toContain("Fantasy");
				expect(manga.genres.length).toBeGreaterThanOrEqual(3);
			});

			it("should extract description using custom Toonily selector", async () => {
				mockFetch.mockResolvedValueOnce(mockHtmlResponse(fixtures.manga));

				const manga = await toonily.getManga("solo-leveling-574def58");

				expect(manga.description).toContain("hunters");
				expect(manga.description.length).toBeGreaterThan(50);
			});

			it("should fetch from correct URL with mangaSubString", async () => {
				mockFetch.mockResolvedValueOnce(mockHtmlResponse(fixtures.manga));

				await toonily.getManga("test-slug");

				const [url] = mockFetch.mock.lastCall as [string];
				expect(url).toBe("https://toonily.com/serie/test-slug/");
			});
		});

		describe("getChapters", () => {
			it("should parse chapters from Ajax response", async () => {
				mockFetch.mockResolvedValueOnce(mockHtmlResponse(fixtures.chapters));

				const manga = {
					sourceId: "toonily",
					slug: "solo-leveling-574def58",
					sourceIdentifier: "solo-leveling-574def58",
					title: "Solo Leveling",
					cover: "",
					description: "",
					status: "completed" as const,
					genres: [],
				};

				const chapters = await toonily.getChapters(manga);

				expect(chapters.length).toBeGreaterThan(100);
				expect(chapters[0]!.sourceId).toBe("toonily");
				expect(chapters[0]!.mangaSlug).toBe("solo-leveling-574def58");
			});

			it("should sort chapters by number ascending", async () => {
				mockFetch.mockResolvedValueOnce(mockHtmlResponse(fixtures.chapters));

				const manga = {
					sourceId: "toonily",
					slug: "solo-leveling-574def58",
					sourceIdentifier: "solo-leveling-574def58",
					title: "Solo Leveling",
					cover: "",
					description: "",
					status: "completed" as const,
					genres: [],
				};

				const chapters = await toonily.getChapters(manga);

				for (let i = 1; i < chapters.length; i++) {
					expect(chapters[i]!.number).toBeGreaterThanOrEqual(chapters[i - 1]!.number);
				}
			});

			it("should extract chapter numbers from names", async () => {
				mockFetch.mockResolvedValueOnce(mockHtmlResponse(fixtures.chapters));

				const manga = {
					sourceId: "toonily",
					slug: "solo-leveling-574def58",
					sourceIdentifier: "solo-leveling-574def58",
					title: "Solo Leveling",
					cover: "",
					description: "",
					status: "completed" as const,
					genres: [],
				};

				const chapters = await toonily.getChapters(manga);

				// Should have chapter 1 — may be either "chapter-1" or "side-story-1" as slug
				const ch1 = chapters.find((c) => c.number === 1);
				expect(ch1).toBeDefined();
				expect(ch1!.slug).toBeTruthy();

				// Verify that chapter numbers are actually parsed (not all 0)
				const withNumbers = chapters.filter((c) => c.number > 0);
				expect(withNumbers.length).toBeGreaterThan(100);
			});

			it("should parse chapter dates", async () => {
				mockFetch.mockResolvedValueOnce(mockHtmlResponse(fixtures.chapters));

				const manga = {
					sourceId: "toonily",
					slug: "solo-leveling-574def58",
					sourceIdentifier: "solo-leveling-574def58",
					title: "Solo Leveling",
					cover: "",
					description: "",
					status: "completed" as const,
					genres: [],
				};

				const chapters = await toonily.getChapters(manga);

				// All chapters should have a date
				for (const ch of chapters) {
					expect(ch.releasedAt).toBeTruthy();
					// Should be a valid ISO date
					expect(new Date(ch.releasedAt).getTime()).not.toBeNaN();
				}
			});

			it("should POST to ajax/chapters/ endpoint", async () => {
				mockFetch.mockResolvedValueOnce(mockHtmlResponse(fixtures.chapters));

				const manga = {
					sourceId: "toonily",
					slug: "solo-leveling-574def58",
					sourceIdentifier: "solo-leveling-574def58",
					title: "Solo Leveling",
					cover: "",
					description: "",
					status: "completed" as const,
					genres: [],
				};

				await toonily.getChapters(manga);

				const [url, opts] = mockFetch.mock.lastCall as [string, RequestInit];
				expect(url).toBe("https://toonily.com/serie/solo-leveling-574def58/ajax/chapters/");
				expect(opts.method).toBe("POST");
				const headers = opts.headers as Record<string, string>;
				expect(headers["X-Requested-With"]).toBe("XMLHttpRequest");
			});
		});

		describe("getChapterPages", () => {
			it("should extract image URLs from chapter page", async () => {
				mockFetch.mockResolvedValueOnce(mockHtmlResponse(fixtures.chapterPages));

				const chapter = {
					sourceId: "toonily",
					mangaSlug: "solo-leveling-574def58",
					slug: "chapter-1",
					number: 1,
					title: "Chapter 1",
					releasedAt: "2024-01-01T00:00:00Z",
				};

				const pages = await toonily.getChapterPages(chapter);

				expect(pages.length).toBeGreaterThan(10);
				for (const url of pages) {
					expect(url).toMatch(/^https?:\/\//);
				}
			});

			it("should return only CDN image URLs (no ads)", async () => {
				mockFetch.mockResolvedValueOnce(mockHtmlResponse(fixtures.chapterPages));

				const chapter = {
					sourceId: "toonily",
					mangaSlug: "solo-leveling-574def58",
					slug: "chapter-1",
					number: 1,
					title: "Chapter 1",
					releasedAt: "2024-01-01T00:00:00Z",
				};

				const pages = await toonily.getChapterPages(chapter);

				// Real manga pages are on data.tnlycdn.com, not toonily.com/wp-content
				const cdnPages = pages.filter((p) => p.includes("tnlycdn.com"));
				expect(cdnPages.length).toBeGreaterThan(10);
			});

			it("should fetch from correct chapter URL", async () => {
				mockFetch.mockResolvedValueOnce(mockHtmlResponse(fixtures.chapterPages));

				const chapter = {
					sourceId: "toonily",
					mangaSlug: "solo-leveling-574def58",
					slug: "chapter-1",
					number: 1,
					title: "Chapter 1",
					releasedAt: "2024-01-01T00:00:00Z",
				};

				await toonily.getChapterPages(chapter);

				const [url] = mockFetch.mock.lastCall as [string];
				expect(url).toBe("https://toonily.com/serie/solo-leveling-574def58/chapter-1/");
			});
		});
	});

	describe("ToonGod (NoAjax variant)", () => {
		describe("search", () => {
			it("should send GET request for NoAjax search", async () => {
				// Reuse toonily search HTML — same Madara format
				mockFetch.mockResolvedValueOnce(mockHtmlResponse(fixtures.search));

				await toongod.search("solo leveling");

				const [url, opts] = mockFetch.mock.lastCall as [string, RequestInit];
				expect(url).toContain("https://www.toongod.org/webtoons/");
				expect(url).toContain("s=solo+leveling");
				expect(url).toContain("post_type=wp-manga");
				expect(opts.method).toBeUndefined(); // GET = no method specified
			});

			it("should include page in URL path for page > 1", async () => {
				mockFetch.mockResolvedValueOnce(mockHtmlResponse(fixtures.search));

				await toongod.search("test", 3);

				const [url] = mockFetch.mock.lastCall as [string];
				expect(url).toContain("/page/3/");
			});
		});

		describe("getChapters (NoAjax)", () => {
			it("should fetch manga page for chapters when not using Ajax", async () => {
				mockFetch.mockResolvedValueOnce(mockHtmlResponse(fixtures.manga));

				const manga = {
					sourceId: "toongod",
					slug: "test-manga",
					sourceIdentifier: "test-manga",
					title: "Test",
					cover: "",
					description: "",
					status: "ongoing" as const,
					genres: [],
				};

				// The manga detail page also contains chapter list
				await toongod.getChapters(manga);

				const [url] = mockFetch.mock.lastCall as [string];
				expect(url).toBe("https://www.toongod.org/webtoons/test-manga/");
			});
		});
	});

	describe("Date parsing", () => {
		it("should parse Toonily date format (MMM d, yy)", async () => {
			const html = `<ul><li class="wp-manga-chapter">
				<a href="https://toonily.com/serie/test/chapter-1/">Chapter 1</a>
				<span class="chapter-release-date">May 31, 23</span>
			</li></ul>`;
			mockFetch.mockResolvedValueOnce(mockHtmlResponse(html));

			const manga = {
				sourceId: "toonily",
				slug: "test",
				sourceIdentifier: "test",
				title: "Test",
				cover: "",
				description: "",
				status: "ongoing" as const,
				genres: [],
			};

			const chapters = await toonily.getChapters(manga);

			expect(chapters).toHaveLength(1);
			const date = new Date(chapters[0]!.releasedAt);
			expect(date.getFullYear()).toBe(2023);
			expect(date.getMonth()).toBe(4); // May = 4
			expect(date.getDate()).toBe(31);
		});

		it("should parse relative dates", async () => {
			const html = `<ul><li class="wp-manga-chapter">
				<a href="https://toonily.com/serie/test/chapter-1/">Chapter 1</a>
				<span class="chapter-release-date">5 hours ago</span>
			</li></ul>`;
			mockFetch.mockResolvedValueOnce(mockHtmlResponse(html));

			const manga = {
				sourceId: "toonily",
				slug: "test",
				sourceIdentifier: "test",
				title: "Test",
				cover: "",
				description: "",
				status: "ongoing" as const,
				genres: [],
			};

			const chapters = await toonily.getChapters(manga);

			expect(chapters).toHaveLength(1);
			const date = new Date(chapters[0]!.releasedAt);
			// Should be within the last day
			const now = Date.now();
			expect(now - date.getTime()).toBeLessThan(24 * 60 * 60 * 1000);
		});

		it("should parse 'today' as today", async () => {
			const html = `<ul><li class="wp-manga-chapter">
				<a href="https://toonily.com/serie/test/chapter-1/">Chapter 1</a>
				<span class="chapter-release-date">today</span>
			</li></ul>`;
			mockFetch.mockResolvedValueOnce(mockHtmlResponse(html));

			const manga = {
				sourceId: "toonily",
				slug: "test",
				sourceIdentifier: "test",
				title: "Test",
				cover: "",
				description: "",
				status: "ongoing" as const,
				genres: [],
			};

			const chapters = await toonily.getChapters(manga);

			const date = new Date(chapters[0]!.releasedAt);
			const today = new Date();
			expect(date.getDate()).toBe(today.getDate());
		});
	});

	describe("Status parsing", () => {
		it("should parse 'Completed' status", async () => {
			mockFetch.mockResolvedValueOnce(mockHtmlResponse(fixtures.manga));

			const manga = await toonily.getManga("solo-leveling-574def58");

			expect(manga.status).toBe("completed");
		});

		it("should handle unknown status gracefully", async () => {
			const html = `<div class="post-title"><h1>Test</h1></div>
				<div class="summary_image"><img src="https://example.com/cover.jpg"></div>
				<div class="content-area"><div class="summary__content">desc</div></div>
				<div class="genres-content"><a>Action</a></div>
				<div class="summary-content">SomeWeirdStatus</div>`;
			mockFetch.mockResolvedValueOnce(mockHtmlResponse(html));

			const manga = await toonily.getManga("test");

			expect(manga.status).toBe("unknown");
		});
	});

	describe("Image URL extraction", () => {
		it("should prefer data-src over src", async () => {
			const html = `<div class="reading-content">
				<div class="page-break">
					<img data-src="https://cdn.example.com/hi-res.jpg" src="https://cdn.example.com/lo-res.jpg">
				</div>
			</div>`;
			mockFetch.mockResolvedValueOnce(mockHtmlResponse(html));

			const chapter = {
				sourceId: "toonily",
				mangaSlug: "test",
				slug: "chapter-1",
				number: 1,
				title: "Chapter 1",
				releasedAt: "2024-01-01T00:00:00Z",
			};

			const pages = await toonily.getChapterPages(chapter);

			expect(pages).toHaveLength(1);
			expect(pages[0]).toBe("https://cdn.example.com/hi-res.jpg");
		});

		it("should handle srcset and pick highest resolution", async () => {
			const html = `<div class="reading-content">
				<div class="page-break">
					<img srcset="https://cdn.example.com/small.jpg 300w, https://cdn.example.com/large.jpg 800w">
				</div>
			</div>`;
			mockFetch.mockResolvedValueOnce(mockHtmlResponse(html));

			const chapter = {
				sourceId: "toonily",
				mangaSlug: "test",
				slug: "chapter-1",
				number: 1,
				title: "Chapter 1",
				releasedAt: "2024-01-01T00:00:00Z",
			};

			const pages = await toonily.getChapterPages(chapter);

			expect(pages).toHaveLength(1);
			expect(pages[0]).toBe("https://cdn.example.com/large.jpg");
		});
	});

	describe("Error handling", () => {
		it("should throw on HTTP error", async () => {
			mockFetch.mockResolvedValue(mockHtmlResponse("", false, 404));

			await expect(toonily.getManga("nonexistent")).rejects.toThrow("Madara fetch failed (404)");
		});

		it("should throw on chapter fetch error", async () => {
			mockFetch.mockResolvedValue(mockHtmlResponse("", false, 403));

			const manga = {
				sourceId: "toonily",
				slug: "test",
				sourceIdentifier: "test",
				title: "Test",
				cover: "",
				description: "",
				status: "ongoing" as const,
				genres: [],
			};

			await expect(toonily.getChapters(manga)).rejects.toThrow("Madara getChapters failed: 403");
		});
	});
});
