import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { Comick } from "./index";

const mockFetch = vi.fn();

function mockJsonResponse(data: unknown, ok = true, status = 200) {
	const text = JSON.stringify(data);
	return {
		ok,
		status,
		url: "https://api.comick.io/mock",
		text: () => Promise.resolve(text),
	};
}

function mockHtmlResponse(html: string, ok = true, status = 200) {
	return { ok, status, url: "https://comick.io/mock", text: () => Promise.resolve(html) };
}

beforeEach(() => {
	vi.stubGlobal("fetch", mockFetch);
	mockFetch.mockClear();
});

afterEach(() => {
	vi.restoreAllMocks();
});

const comick = new Comick();

describe("Comick", () => {
	describe("search", () => {
		it("should return manga results", async () => {
			mockFetch.mockResolvedValueOnce(
				mockJsonResponse([
					{
						hid: "abc123",
						title: "Solo Leveling",
						slug: "solo-leveling",
						cover_url: "https://img.comick.io/cover.jpg",
						md_covers: [],
						status: 1,
						genres: [{ name: "Action", slug: "action" }],
						desc: "A great manga",
					},
				]),
			);

			const result = await comick.search("solo");

			expect(result.mangas).toHaveLength(1);
			expect(result.mangas[0]!.title).toBe("Solo Leveling");
			expect(result.mangas[0]!.slug).toBe("solo-leveling");
			expect(result.mangas[0]!.sourceId).toBe("comick");
			expect(result.mangas[0]!.cover).toBe("https://img.comick.io/cover.jpg");
		});

		it("should throw on failed request", async () => {
			mockFetch.mockResolvedValue(mockJsonResponse(null, false, 404));
			await expect(comick.search("test")).rejects.toThrow("Comick search failed: 404");
		});
	});

	describe("getManga", () => {
		it("should return manga detail", async () => {
			mockFetch.mockResolvedValueOnce(
				mockJsonResponse({
					comic: {
						hid: "abc123",
						title: "Solo Leveling",
						slug: "solo-leveling",
						cover_url: null,
						md_covers: [{ b2key: "covers/solo.jpg", w: 300, h: 400 }],
						status: 2,
						genres: [
							{ name: "Action", slug: "action" },
							{ name: "Fantasy", slug: "fantasy" },
						],
						desc: "<p>A great manga</p>",
					},
				}),
			);

			const result = await comick.getManga("solo-leveling");

			expect(result.sourceIdentifier).toBe("abc123");
			expect(result.title).toBe("Solo Leveling");
			expect(result.status).toBe("completed");
			expect(result.description).toBe("A great manga");
			expect(result.cover).toBe("https://meo.comick.pictures/covers/solo.jpg");
			expect(result.genres).toEqual(["Action", "Fantasy"]);
		});
	});

	describe("getChapters", () => {
		it("should return chapters sorted by number", async () => {
			mockFetch.mockResolvedValueOnce(
				mockJsonResponse({
					chapters: [
						{
							hid: "ch3",
							chap: "3",
							title: "Third",
							lang: "en",
							created_at: "2024-03-01T00:00:00Z",
							group_name: [],
						},
						{
							hid: "ch1",
							chap: "1",
							title: "First",
							lang: "en",
							created_at: "2024-01-01T00:00:00Z",
							group_name: [],
						},
						{
							hid: "ch2",
							chap: "2",
							title: null,
							lang: "en",
							created_at: "2024-02-01T00:00:00Z",
							group_name: [],
						},
						{
							hid: "no-chap",
							chap: null,
							title: "Special",
							lang: "en",
							created_at: "2024-04-01T00:00:00Z",
							group_name: [],
						},
					],
					total: 4,
				}),
			);

			const manga = {
				sourceId: "comick",
				slug: "solo-leveling",
				sourceIdentifier: "abc123",
				title: "Solo Leveling",
				cover: "",
				description: "",
				status: "ongoing" as const,
				genres: [],
			};

			const chapters = await comick.getChapters(manga);

			expect(chapters).toHaveLength(3); // null chap filtered out
			expect(chapters[0]!.number).toBe(1);
			expect(chapters[0]!.title).toBe("First");
			expect(chapters[0]!.slug).toBe("ch1");
			expect(chapters[1]!.number).toBe(2);
			expect(chapters[1]!.title).toBe("Chapter 2"); // null title → default
			expect(chapters[2]!.number).toBe(3);
		});
	});

	describe("getChapterPages", () => {
		it("should extract images from __NEXT_DATA__", async () => {
			const nextData = JSON.stringify({
				props: {
					pageProps: {
						chapter: {
							md_images: [{ b2key: "img/page1.jpg" }, { b2key: "img/page2.jpg" }],
						},
					},
				},
			});

			mockFetch.mockResolvedValueOnce(
				mockHtmlResponse(`<html><script id="__NEXT_DATA__">${nextData}</script></html>`),
			);

			const chapter = {
				sourceId: "comick",
				mangaSlug: "solo-leveling",
				slug: "ch1",
				number: 1,
				title: "Chapter 1",
				releasedAt: "",
			};

			const pages = await comick.getChapterPages(chapter);

			expect(pages).toHaveLength(2);
			expect(pages[0]).toBe("https://meo.comick.pictures/img/page1.jpg");
			expect(pages[1]).toBe("https://meo.comick.pictures/img/page2.jpg");
		});

		it("should throw when no images found", async () => {
			mockFetch.mockResolvedValueOnce(mockHtmlResponse("<html></html>"));

			const chapter = {
				sourceId: "comick",
				mangaSlug: "test",
				slug: "ch1",
				number: 1,
				title: "Ch 1",
				releasedAt: "",
			};

			await expect(comick.getChapterPages(chapter)).rejects.toThrow("No images found");
		});
	});
});
