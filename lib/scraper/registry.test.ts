import { describe, expect, it } from "vitest";
import { DEFAULT_SOURCE, getAllSources, getSource, getSourceIds } from "./index";

describe("Scraper Registry", () => {
	it("should return mangadex as the default source", () => {
		expect(DEFAULT_SOURCE).toBe("mangadex");
	});

	it("should get mangadex source by id", () => {
		const source = getSource("mangadex");
		expect(source.id).toBe("mangadex");
		expect(source.name).toBe("MangaDex");
		expect(source.baseUrl).toBe("https://mangadex.org");
	});

	it("should get comick source by id", () => {
		const source = getSource("comick");
		expect(source.id).toBe("comick");
		expect(source.name).toBe("Comick");
	});

	it("should get omegascans source by id", () => {
		const source = getSource("omegascans");
		expect(source.id).toBe("omegascans");
		expect(source.name).toBe("Omega Scans");
	});

	it("should throw for unknown source", () => {
		expect(() => getSource("nonexistent")).toThrow("Unknown source: nonexistent");
	});

	it("should return all source ids", () => {
		const ids = getSourceIds();
		expect(ids).toContain("mangadex");
		expect(ids).toContain("comick");
		expect(ids).toContain("omegascans");
		expect(ids).toHaveLength(3);
	});

	it("should return all sources", () => {
		const sources = getAllSources();
		expect(sources.length).toBe(3);
		for (const source of sources) {
			expect(source.id).toBeDefined();
			expect(source.name).toBeDefined();
			expect(source.baseUrl).toBeDefined();
		}
	});
});
