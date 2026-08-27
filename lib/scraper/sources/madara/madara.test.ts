import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { Madara } from "./index";

const mockFetch = vi.fn();

function mockHtmlResponse(html: string, ok = true, status = 200) {
	return {
		ok,
		status,
		url: "https://test.com/mock",
		text: () => Promise.resolve(html),
	};
}

beforeEach(() => {
	vi.stubGlobal("fetch", mockFetch);
	mockFetch.mockClear();
});

afterEach(() => {
	vi.restoreAllMocks();
});

const madara = new Madara({
	id: "test-madara",
	name: "Test Madara",
	baseUrl: "https://test.com",
	mangaSubDirectory: "manga",
});

const searchResultHtml = `
<div class="page-item-detail">
  <div class="post-title"><a href="https://test.com/manga/solo-leveling/">Solo Leveling</a></div>
  <img src="https://test.com/covers/solo.jpg" />
</div>
<div class="page-item-detail">
  <div class="post-title"><a href="https://test.com/manga/tower-of-god/">Tower of God</a></div>
  <img data-src="https://test.com/covers/tog.jpg" />
</div>
`;

const mangaDetailHtml = `
<html>
<div class="post-title"><h1>Solo Leveling</h1></div>
<div class="summary_image"><img src="https://test.com/covers/solo.jpg" /></div>
<div class="description-summary"><div class="summary__content">A great manhwa about hunters.</div></div>
<div class="summary-content">OnGoing</div>
<div class="genres-content">
  <a href="/genre/action/">Action</a>
  <a href="/genre/fantasy/">Fantasy</a>
</div>
</html>
`;

const chapterListHtml = `
<ul>
  <li class="wp-manga-chapter">
    <a href="https://test.com/manga/solo-leveling/chapter-200/">Chapter 200</a>
    <span class="chapter-release-date"><i>2 days ago</i></span>
  </li>
  <li class="wp-manga-chapter">
    <a href="https://test.com/manga/solo-leveling/chapter-199/">Chapter 199</a>
    <span class="chapter-release-date"><i>Aug 20, 2024</i></span>
  </li>
  <li class="wp-manga-chapter">
    <a href="https://test.com/manga/solo-leveling/chapter-198-5/">Chapter 198.5</a>
    <span class="chapter-release-date"><i>1 week ago</i></span>
  </li>
</ul>
`;

const chapterPagesHtml = `
<html>
<div class="reading-content">
  <div class="page-break">
    <img data-src="  https://cdn.test.com/images/page1.jpg  " />
  </div>
  <div class="page-break">
    <img data-src="  https://cdn.test.com/images/page2.jpg  " />
  </div>
  <div class="page-break">
    <img data-src="  https://cdn.test.com/images/page3.jpg  " />
  </div>
</div>
</html>
`;

describe("Madara", () => {
	describe("search", () => {
		it("should parse search results from HTML", async () => {
			mockFetch.mockResolvedValueOnce(mockHtmlResponse(searchResultHtml));

			const result = await madara.search("solo");

			expect(result.mangas).toHaveLength(2);
			expect(result.mangas[0]!.title).toBe("Solo Leveling");
			expect(result.mangas[0]!.slug).toBe("solo-leveling");
			expect(result.mangas[0]!.cover).toBe("https://test.com/covers/solo.jpg");
			expect(result.mangas[0]!.sourceId).toBe("test-madara");
			expect(result.mangas[1]!.title).toBe("Tower of God");
			expect(result.mangas[1]!.cover).toBe("https://test.com/covers/tog.jpg");
		});

		it("should return empty results for no matches", async () => {
			mockFetch.mockResolvedValueOnce(mockHtmlResponse("<div></div>"));

			const result = await madara.search("nonexistent");

			expect(result.mangas).toHaveLength(0);
			expect(result.hasNextPage).toBe(false);
		});

		it("should throw on failed request", async () => {
			mockFetch.mockResolvedValue(mockHtmlResponse("", false, 404));

			await expect(madara.search("test")).rejects.toThrow("Madara search failed: 404");
		});

		it("should POST to admin-ajax.php", async () => {
			mockFetch.mockResolvedValueOnce(mockHtmlResponse(""));

			await madara.search("test query", 2);

			expect(mockFetch).toHaveBeenCalledTimes(1);
			const [url, opts] = mockFetch.mock.calls[0]!;
			expect(url).toContain("/wp-admin/admin-ajax.php");
			expect(opts.method).toBe("POST");
			expect(opts.body).toContain("action=madara_load_more");
			expect(opts.body).toContain("vars%5Bs%5D=test+query");
			expect(opts.body).toContain("page=1"); // page-1 for zero-indexed
		});
	});

	describe("getManga", () => {
		it("should parse manga detail from HTML", async () => {
			mockFetch.mockResolvedValueOnce(mockHtmlResponse(mangaDetailHtml));

			const result = await madara.getManga("solo-leveling");

			expect(result.title).toBe("Solo Leveling");
			expect(result.slug).toBe("solo-leveling");
			expect(result.sourceId).toBe("test-madara");
			expect(result.description).toBe("A great manhwa about hunters.");
			expect(result.cover).toBe("https://test.com/covers/solo.jpg");
			expect(result.status).toBe("ongoing");
			expect(result.genres).toEqual(["Action", "Fantasy"]);
		});

		it("should throw on 404", async () => {
			mockFetch.mockResolvedValue(mockHtmlResponse("", false, 404));

			await expect(madara.getManga("nonexistent")).rejects.toThrow("Madara getManga failed: 404");
		});
	});

	describe("getChapters", () => {
		it("should parse chapter list from AJAX response", async () => {
			mockFetch.mockResolvedValueOnce(mockHtmlResponse(chapterListHtml));

			const manga = {
				sourceId: "test-madara",
				slug: "solo-leveling",
				sourceIdentifier: "solo-leveling",
				title: "Solo Leveling",
				cover: "",
				description: "",
				status: "ongoing" as const,
				genres: [],
			};

			const chapters = await madara.getChapters(manga);

			expect(chapters).toHaveLength(3);
			// Sorted by number ascending
			expect(chapters[0]!.number).toBe(198.5);
			expect(chapters[0]!.slug).toBe("chapter-198-5");
			expect(chapters[1]!.number).toBe(199);
			expect(chapters[2]!.number).toBe(200);
			expect(chapters[2]!.title).toBe("Chapter 200");
		});

		it("should use AJAX endpoint", async () => {
			mockFetch.mockResolvedValueOnce(mockHtmlResponse(chapterListHtml));

			const manga = {
				sourceId: "test-madara",
				slug: "test-manga",
				sourceIdentifier: "test-manga",
				title: "Test",
				cover: "",
				description: "",
				status: "ongoing" as const,
				genres: [],
			};

			await madara.getChapters(manga);

			const [url, opts] = mockFetch.mock.calls[0]!;
			expect(url).toContain("/manga/test-manga/ajax/chapters/");
			expect(opts.method).toBe("POST");
		});
	});

	describe("getChapterPages", () => {
		it("should parse image URLs from chapter page", async () => {
			mockFetch.mockResolvedValueOnce(mockHtmlResponse(chapterPagesHtml));

			const chapter = {
				sourceId: "test-madara",
				mangaSlug: "solo-leveling",
				slug: "chapter-200",
				number: 200,
				title: "Chapter 200",
				releasedAt: "2024-01-01T00:00:00Z",
			};

			const pages = await madara.getChapterPages(chapter);

			expect(pages).toHaveLength(3);
			expect(pages[0]).toBe("https://cdn.test.com/images/page1.jpg");
			expect(pages[1]).toBe("https://cdn.test.com/images/page2.jpg");
			expect(pages[2]).toBe("https://cdn.test.com/images/page3.jpg");
		});

		it("should throw on failed request", async () => {
			mockFetch.mockResolvedValue(mockHtmlResponse("", false, 404));

			const chapter = {
				sourceId: "test-madara",
				mangaSlug: "test",
				slug: "ch-1",
				number: 1,
				title: "Ch 1",
				releasedAt: "",
			};

			await expect(madara.getChapterPages(chapter)).rejects.toThrow(
				"Madara getChapterPages failed: 404",
			);
		});
	});
});
