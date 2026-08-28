import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { Atsumaru } from "./index";
import type {
	AtsChaptersResponse,
	AtsMangaDetailResponse,
	AtsReadResponse,
	AtsSearchResponse,
} from "./types";

const mockFetch = vi.fn();

function mockJsonResponse(data: unknown, ok = true, status = 200): unknown {
	const text = JSON.stringify(data);
	return {
		ok,
		status,
		url: "https://atsu.moe/mock",
		text: () => Promise.resolve(text),
		json: () => Promise.resolve(data),
	};
}

beforeEach(() => {
	vi.stubGlobal("fetch", mockFetch);
});

afterEach(() => {
	vi.restoreAllMocks();
});

const atsumaru = new Atsumaru();

describe("Atsumaru", () => {
	describe("search", () => {
		it("should parse Typesense search results", async () => {
			const data: AtsSearchResponse = {
				hits: [
					{
						document: {
							id: "oZOG5",
							title: "Solo Leveling",
							status: "Completed",
							type: "Manwha",
							genreIds: ["5", "31"],
							chapterCount: 201,
							isAdult: false,
							medium: "Comic",
							views: 11917956,
							mbRating: 8.617,
						},
					},
					{
						document: {
							id: "abc123",
							title: "Solo Leveling: Ragnarok",
							status: "Ongoing",
							type: "Manwha",
							genreIds: ["5"],
							chapterCount: 50,
							isAdult: false,
							medium: "Comic",
							views: 500000,
							mbRating: 7.5,
						},
					},
				],
				found: 7,
				out_of: 23903,
				page: 1,
			};

			mockFetch.mockResolvedValueOnce(mockJsonResponse(data));

			const result = await atsumaru.search("solo leveling");

			expect(result.mangas).toHaveLength(2);
			expect(result.mangas[0]!.sourceId).toBe("atsumaru");
			expect(result.mangas[0]!.slug).toBe("oZOG5");
			expect(result.mangas[0]!.title).toBe("Solo Leveling");
			expect(result.hasNextPage).toBe(false); // 7 found, page 1 * 40 >= 7
		});

		it("should indicate hasNextPage when more results exist", async () => {
			const data: AtsSearchResponse = {
				hits: Array.from({ length: 40 }, (_, i) => ({
					document: {
						id: `id${i}`,
						title: `Manga ${i}`,
						status: "Ongoing",
						type: "Manga",
						genreIds: [],
						chapterCount: 10,
						isAdult: false,
						medium: "Comic",
						views: 1000,
						mbRating: null,
					},
				})),
				found: 120,
				out_of: 23903,
				page: 1,
			};

			mockFetch.mockResolvedValueOnce(mockJsonResponse(data));

			const result = await atsumaru.search("test");

			expect(result.hasNextPage).toBe(true); // 120 found > 1 * 40
		});

		it("should build correct Typesense search URL", async () => {
			mockFetch.mockResolvedValueOnce(mockJsonResponse({ hits: [], found: 0, out_of: 0, page: 1 }));

			await atsumaru.search("one piece", 2);

			const [url] = mockFetch.mock.lastCall as [string];
			expect(url).toContain("/collections/manga/documents/search");
			expect(url).toContain("q=one+piece");
			expect(url).toContain("page=2");
			expect(url).toContain("per_page=40");
			expect(url).toContain("query_by=title");
		});

		it("should use wildcard for empty query", async () => {
			mockFetch.mockResolvedValueOnce(mockJsonResponse({ hits: [], found: 0, out_of: 0, page: 1 }));

			await atsumaru.search("");

			const [url] = mockFetch.mock.lastCall as [string];
			expect(url).toContain("q=*");
		});
	});

	describe("getManga", () => {
		it("should parse manga detail", async () => {
			const data: AtsMangaDetailResponse = {
				mangaPage: {
					id: "oZOG5",
					title: "Solo Leveling",
					synopsis: "Sung Jinwoo, the weakest hunter...",
					status: "Completed",
					type: "Manwha",
					genres: [{ name: "Action" }, { name: "Adventure" }, { name: "Fantasy" }],
					tags: [{ name: "Dungeons" }],
					poster: {
						image: "posters/abc123.jpg",
						smallImage: "posters/abc123-small.avif",
						mediumImage: "posters/abc123-medium.avif",
						largeImage: "posters/abc123-large.avif",
					},
					authors: [
						{ name: "Chu-Gong", type: "Author" },
						{ name: "Seong-Rak Jang", type: "Artist" },
					],
				},
			};

			mockFetch.mockResolvedValueOnce(mockJsonResponse(data));

			const manga = await atsumaru.getManga("oZOG5");

			expect(manga.sourceId).toBe("atsumaru");
			expect(manga.slug).toBe("oZOG5");
			expect(manga.sourceIdentifier).toBe("oZOG5");
			expect(manga.title).toBe("Solo Leveling");
			expect(manga.description).toBe("Sung Jinwoo, the weakest hunter...");
			expect(manga.status).toBe("completed");
			expect(manga.genres).toEqual(["Action", "Adventure", "Fantasy"]);
			expect(manga.cover).toBe("https://atsu.moe/posters/abc123.jpg");
		});

		it("should handle null poster gracefully", async () => {
			const data: AtsMangaDetailResponse = {
				mangaPage: {
					id: "test",
					title: "No Cover Manga",
					synopsis: null,
					status: null,
					type: null,
					genres: [],
					tags: [],
					poster: null,
					authors: [],
				},
			};

			mockFetch.mockResolvedValueOnce(mockJsonResponse(data));

			const manga = await atsumaru.getManga("test");

			expect(manga.cover).toBe("");
			expect(manga.description).toBe("");
			expect(manga.status).toBe("unknown");
		});

		it("should throw on not found", async () => {
			mockFetch.mockResolvedValue(mockJsonResponse(null, false, 404));

			await expect(atsumaru.getManga("nonexistent")).rejects.toThrow(
				"Atsumaru getManga failed: 404",
			);
		});
	});

	describe("getChapters", () => {
		it("should parse and deduplicate chapters", async () => {
			const data: AtsChaptersResponse = {
				chapters: [
					{
						id: "ch200a",
						title: "Chapter 200",
						number: 200,
						createdAt: 1751846327498,
						index: 201,
						pageCount: 49,
						scanlationMangaId: "scan1",
					},
					{
						id: "ch200b",
						title: "Chapter 200 Side Story",
						number: 200,
						createdAt: 1769883892956,
						index: 200,
						pageCount: 15,
						scanlationMangaId: "scan2",
					},
					{
						id: "ch199",
						title: "Chapter 199",
						number: 199,
						createdAt: 1751846337039,
						index: 200,
						pageCount: 48,
						scanlationMangaId: "scan1",
					},
					{
						id: "ch1",
						title: "Chapter 1",
						number: 1,
						createdAt: 1600000000000,
						index: 1,
						pageCount: 30,
						scanlationMangaId: "scan1",
					},
				],
			};

			mockFetch.mockResolvedValueOnce(mockJsonResponse(data));

			const manga = {
				sourceId: "atsumaru",
				slug: "oZOG5",
				sourceIdentifier: "oZOG5",
				title: "Solo Leveling",
				cover: "",
				description: "",
				status: "completed" as const,
				genres: [],
			};

			const chapters = await atsumaru.getChapters(manga);

			// ch200a and ch200b have same number, only first (ch200a) kept
			expect(chapters).toHaveLength(3);
			expect(chapters[0]!.number).toBe(1);
			expect(chapters[1]!.number).toBe(199);
			expect(chapters[2]!.number).toBe(200);
			expect(chapters[2]!.slug).toBe("ch200a"); // first seen wins
		});

		it("should convert timestamps to ISO dates", async () => {
			const data: AtsChaptersResponse = {
				chapters: [
					{
						id: "ch1",
						title: "Chapter 1",
						number: 1,
						createdAt: 1700000000000,
						index: 1,
						pageCount: 20,
						scanlationMangaId: null,
					},
				],
			};

			mockFetch.mockResolvedValueOnce(mockJsonResponse(data));

			const manga = {
				sourceId: "atsumaru",
				slug: "test",
				sourceIdentifier: "test",
				title: "Test",
				cover: "",
				description: "",
				status: "ongoing" as const,
				genres: [],
			};

			const chapters = await atsumaru.getChapters(manga);

			const date = new Date(chapters[0]!.releasedAt);
			expect(date.getFullYear()).toBe(2023);
		});
	});

	describe("getChapterPages", () => {
		it("should return absolute image URLs", async () => {
			const data: AtsReadResponse = {
				readChapter: {
					id: "PwTgD1Gh",
					title: "Chapter 200",
					pages: [
						{ id: "p0", image: "/static/pages/oZOG5/PwTgD1Gh/0.webp", number: 0 },
						{ id: "p1", image: "/static/pages/oZOG5/PwTgD1Gh/1.webp", number: 1 },
						{ id: "p2", image: "https://cdn.example.com/page2.jpg", number: 2 },
					],
				},
			};

			mockFetch.mockResolvedValueOnce(mockJsonResponse(data));

			const chapter = {
				sourceId: "atsumaru",
				mangaSlug: "oZOG5",
				slug: "PwTgD1Gh",
				number: 200,
				title: "Chapter 200",
				releasedAt: "2024-01-01T00:00:00Z",
			};

			const pages = await atsumaru.getChapterPages(chapter);

			expect(pages).toHaveLength(3);
			expect(pages[0]).toBe("https://atsu.moe/static/pages/oZOG5/PwTgD1Gh/0.webp");
			expect(pages[1]).toBe("https://atsu.moe/static/pages/oZOG5/PwTgD1Gh/1.webp");
			expect(pages[2]).toBe("https://cdn.example.com/page2.jpg");
		});

		it("should build correct API URL", async () => {
			const data: AtsReadResponse = {
				readChapter: { id: "ch1", title: "Ch 1", pages: [] },
			};

			mockFetch.mockResolvedValueOnce(mockJsonResponse(data));

			const chapter = {
				sourceId: "atsumaru",
				mangaSlug: "myManga",
				slug: "myChapter",
				number: 1,
				title: "Chapter 1",
				releasedAt: "2024-01-01T00:00:00Z",
			};

			await atsumaru.getChapterPages(chapter);

			const [url] = mockFetch.mock.lastCall as [string];
			expect(url).toContain("mangaId=myManga");
			expect(url).toContain("chapterId=myChapter");
		});
	});
});
