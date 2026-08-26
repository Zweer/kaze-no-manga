import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { HeanCms } from "./index";
import type {
	HeanCmsChapterDetailResponse,
	HeanCmsChapterListResponse,
	HeanCmsSearchResponse,
	HeanCmsSeriesDetail,
} from "./types";

const mockFetch = vi.fn();

beforeEach(() => {
	vi.stubGlobal("fetch", mockFetch);
});

afterEach(() => {
	vi.restoreAllMocks();
});

const heancms = new HeanCms({
	id: "test-source",
	name: "Test Source",
	baseUrl: "https://test.com",
	apiUrl: "https://api.test.com",
});

describe("HeanCms", () => {
	describe("search", () => {
		it("should return manga results from search", async () => {
			const mockResponse: HeanCmsSearchResponse = {
				data: [
					{ id: 1, title: "Test Manga", slug: "test-manga", thumbnail: "covers/test.jpg", status: "Ongoing" },
					{ id: 2, title: "Another Manga", slug: "another-manga", thumbnail: "https://cdn.example.com/img.jpg", status: "Completed" },
				],
				meta: { current_page: 1, last_page: 2, per_page: 12, total: 20 },
			};

			mockFetch.mockResolvedValueOnce({
				ok: true,
				json: () => Promise.resolve(mockResponse),
			});

			const result = await heancms.search("test");

			expect(result.mangas).toHaveLength(2);
			expect(result.mangas[0]!.title).toBe("Test Manga");
			expect(result.mangas[0]!.slug).toBe("test-manga");
			expect(result.mangas[0]!.sourceId).toBe("test-source");
			expect(result.mangas[0]!.cover).toBe("https://api.test.com/covers/test.jpg");
			expect(result.mangas[1]!.cover).toBe("https://cdn.example.com/img.jpg");
			expect(result.hasNextPage).toBe(true);
		});

		it("should return hasNextPage false on last page", async () => {
			const mockResponse: HeanCmsSearchResponse = {
				data: [{ id: 1, title: "Manga", slug: "manga", thumbnail: null, status: null }],
				meta: { current_page: 2, last_page: 2, per_page: 12, total: 15 },
			};

			mockFetch.mockResolvedValueOnce({
				ok: true,
				json: () => Promise.resolve(mockResponse),
			});

			const result = await heancms.search("manga", 2);

			expect(result.hasNextPage).toBe(false);
			expect(result.mangas[0]!.cover).toBe("");
		});

		it("should throw on failed search", async () => {
			mockFetch.mockResolvedValueOnce({ ok: false, status: 500 });

			await expect(heancms.search("test")).rejects.toThrow("HeanCms search failed: 500");
		});

		it("should build correct search URL with query params", async () => {
			mockFetch.mockResolvedValueOnce({
				ok: true,
				json: () => Promise.resolve({ data: [], meta: null }),
			});

			await heancms.search("one piece", 3);

			const calledUrl = mockFetch.mock.lastCall![0] as string;
			expect(calledUrl).toContain("query_string=one");
			expect(calledUrl).toContain("page=3");
			expect(calledUrl).toContain("perPage=12");
			expect(calledUrl).toContain("series_type=Comic");
		});
	});

	describe("getManga", () => {
		it("should return manga detail", async () => {
			const mockSeries: HeanCmsSeriesDetail = {
				id: 42,
				title: "Amazing Manga",
				slug: "amazing-manga",
				description: "A great manga",
				thumbnail: "covers/amazing.jpg",
				status: "Ongoing",
				tags: [{ id: 1, name: "Action" }, { id: 2, name: "Fantasy" }],
			};

			mockFetch.mockResolvedValueOnce({
				ok: true,
				json: () => Promise.resolve(mockSeries),
			});

			const result = await heancms.getManga("amazing-manga");

			expect(result.sourceId).toBe("test-source");
			expect(result.slug).toBe("amazing-manga");
			expect(result.sourceIdentifier).toBe("42");
			expect(result.title).toBe("Amazing Manga");
			expect(result.description).toBe("A great manga");
			expect(result.status).toBe("ongoing");
			expect(result.genres).toEqual(["Action", "Fantasy"]);
		});

		it("should throw on not found", async () => {
			mockFetch.mockResolvedValueOnce({ ok: false, status: 404 });

			await expect(heancms.getManga("nonexistent")).rejects.toThrow("HeanCms getManga failed: 404");
		});
	});

	describe("getChapters", () => {
		it("should return free chapters sorted by number", async () => {
			const mockResponse: HeanCmsChapterListResponse = {
				data: [
					{ id: 1, chapter_name: null, chapter_title: "Intro", chapter_slug: "chapter-1", chapter_number: "1", price: 0, created_at: "2024-01-01T00:00:00Z" },
					{ id: 2, chapter_name: null, chapter_title: null, chapter_slug: "chapter-2", chapter_number: "2", price: 0, created_at: "2024-01-08T00:00:00Z" },
					{ id: 3, chapter_name: null, chapter_title: "VIP", chapter_slug: "chapter-3", chapter_number: "3", price: 100, created_at: "2024-01-15T00:00:00Z" },
				],
				meta: { current_page: 1, last_page: 1, per_page: 1000, total: 3 },
			};

			mockFetch.mockResolvedValueOnce({
				ok: true,
				json: () => Promise.resolve(mockResponse),
			});

			const manga = {
				sourceId: "test-source",
				slug: "test-manga",
				sourceIdentifier: "42",
				title: "Test",
				cover: "",
				description: "",
				status: "ongoing" as const,
				genres: [],
			};

			const chapters = await heancms.getChapters(manga);

			expect(chapters).toHaveLength(2); // Paid chapter filtered out
			expect(chapters[0]!.number).toBe(1);
			expect(chapters[0]!.title).toBe("Intro");
			expect(chapters[1]!.number).toBe(2);
			expect(chapters[1]!.title).toBe("Chapter 2");
		});
	});

	describe("getChapterPages", () => {
		it("should return image URLs", async () => {
			const mockResponse: HeanCmsChapterDetailResponse = {
				chapter: {
					id: 1,
					chapter_slug: "chapter-1",
					chapter_name: null,
					chapter_number: "1",
					price: 0,
					paywall: false,
					chapter_data: {
						images: [
							"https://cdn.example.com/page1.jpg",
							"uploads/page2.jpg",
						],
					},
				},
			};

			mockFetch.mockResolvedValueOnce({
				ok: true,
				json: () => Promise.resolve(mockResponse),
			});

			const chapter = {
				sourceId: "test-source",
				mangaSlug: "test-manga",
				slug: "chapter-1",
				number: 1,
				title: "Chapter 1",
				releasedAt: "2024-01-01T00:00:00Z",
			};

			const pages = await heancms.getChapterPages(chapter);

			expect(pages).toHaveLength(2);
			expect(pages[0]).toBe("https://cdn.example.com/page1.jpg");
			expect(pages[1]).toBe("https://api.test.com/uploads/page2.jpg");
		});

		it("should throw on paywalled chapter", async () => {
			const mockResponse: HeanCmsChapterDetailResponse = {
				chapter: {
					id: 1,
					chapter_slug: "chapter-1",
					chapter_name: null,
					chapter_number: "1",
					price: 100,
					paywall: true,
					chapter_data: null,
				},
			};

			mockFetch.mockResolvedValueOnce({
				ok: true,
				json: () => Promise.resolve(mockResponse),
			});

			const chapter = {
				sourceId: "test-source",
				mangaSlug: "test-manga",
				slug: "chapter-1",
				number: 1,
				title: "Chapter 1",
				releasedAt: "2024-01-01T00:00:00Z",
			};

			await expect(heancms.getChapterPages(chapter)).rejects.toThrow("Chapter has no images");
		});
	});
});
