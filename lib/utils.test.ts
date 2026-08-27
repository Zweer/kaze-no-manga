import { describe, expect, it } from "vitest";
import { buildMangaId } from "./api-helpers";
import { getInitials } from "./utils";

describe("getInitials", () => {
	it("should return initials from full name", () => {
		expect(getInitials("John Doe")).toBe("JD");
	});

	it("should return single initial from single name", () => {
		expect(getInitials("John")).toBe("J");
	});

	it("should handle three-part names", () => {
		expect(getInitials("John Michael Doe")).toBe("JMD");
	});

	it("should return ? for null", () => {
		expect(getInitials(null)).toBe("?");
	});

	it("should return ? for undefined", () => {
		expect(getInitials(undefined)).toBe("?");
	});

	it("should return ? for empty string", () => {
		expect(getInitials("")).toBe("?");
	});
});

describe("buildMangaId", () => {
	it("should build composite ID from source and slug", () => {
		expect(buildMangaId("omegascans", "my-illustrator")).toBe("omegascans:my-illustrator");
	});

	it("should handle special characters in slug", () => {
		expect(buildMangaId("source", "manga-123-title")).toBe("source:manga-123-title");
	});
});
