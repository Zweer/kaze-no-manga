import { describe, expect, it } from "vitest";
import { DEFAULT_SOURCE, getAllSources, getSource, getSourceIds } from "./index";

describe("Scraper Registry", () => {
	it("should return omegascans as the default source", () => {
		expect(DEFAULT_SOURCE).toBe("omegascans");
	});

	it("should get omegascans source by id", () => {
		const source = getSource("omegascans");
		expect(source.id).toBe("omegascans");
		expect(source.name).toBe("Omega Scans");
		expect(source.baseUrl).toBe("https://omegascans.org");
	});

	it("should throw for unknown source", () => {
		expect(() => getSource("nonexistent")).toThrow("Unknown source: nonexistent");
	});

	it("should return all source ids", () => {
		const ids = getSourceIds();
		expect(ids).toContain("omegascans");
		expect(ids.length).toBeGreaterThan(0);
	});

	it("should return all sources", () => {
		const sources = getAllSources();
		expect(sources.length).toBe(getSourceIds().length);
		for (const source of sources) {
			expect(source.id).toBeDefined();
			expect(source.name).toBeDefined();
			expect(source.baseUrl).toBeDefined();
		}
	});
});
