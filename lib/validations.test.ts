import { describe, expect, it } from "vitest";
import {
	addToLibrarySchema,
	patchLibrarySchema,
	markReadSchema,
	searchParamsSchema,
} from "./validations";

describe("addToLibrarySchema", () => {
	it("should validate correct input", () => {
		const result = addToLibrarySchema.safeParse({
			source: "omegascans",
			slug: "my-manga",
			title: "My Manga",
		});
		expect(result.success).toBe(true);
	});

	it("should apply defaults for optional fields", () => {
		const result = addToLibrarySchema.parse({
			source: "omegascans",
			slug: "my-manga",
			title: "My Manga",
		});
		expect(result.cover).toBe("");
		expect(result.description).toBe("");
		expect(result.status).toBe("unknown");
		expect(result.genres).toEqual([]);
	});

	it("should reject missing source", () => {
		const result = addToLibrarySchema.safeParse({ slug: "s", title: "t" });
		expect(result.success).toBe(false);
	});

	it("should reject empty title", () => {
		const result = addToLibrarySchema.safeParse({ source: "s", slug: "s", title: "" });
		expect(result.success).toBe(false);
	});
});

describe("patchLibrarySchema", () => {
	it("should accept valid statuses", () => {
		for (const status of ["reading", "plan_to_read", "completed", "on_hold", "dropped"]) {
			expect(patchLibrarySchema.safeParse({ status }).success).toBe(true);
		}
	});

	it("should reject invalid status", () => {
		expect(patchLibrarySchema.safeParse({ status: "invalid" }).success).toBe(false);
	});

	it("should reject missing status", () => {
		expect(patchLibrarySchema.safeParse({}).success).toBe(false);
	});
});

describe("markReadSchema", () => {
	it("should validate correct input", () => {
		const result = markReadSchema.safeParse({
			source: "omegascans",
			mangaSlug: "my-manga",
			chapterSlug: "chapter-1",
		});
		expect(result.success).toBe(true);
	});

	it("should default chapterNumber to '0'", () => {
		const result = markReadSchema.parse({
			source: "s",
			mangaSlug: "m",
			chapterSlug: "c",
		});
		expect(result.chapterNumber).toBe("0");
	});

	it("should reject missing mangaSlug", () => {
		const result = markReadSchema.safeParse({ source: "s", chapterSlug: "c" });
		expect(result.success).toBe(false);
	});
});

describe("searchParamsSchema", () => {
	it("should validate correct input", () => {
		const result = searchParamsSchema.safeParse({ q: "test" });
		expect(result.success).toBe(true);
	});

	it("should apply defaults", () => {
		const result = searchParamsSchema.parse({ q: "test" });
		expect(result.source).toBe("omegascans");
		expect(result.page).toBe(1);
	});

	it("should coerce page to number", () => {
		const result = searchParamsSchema.parse({ q: "test", page: "3" });
		expect(result.page).toBe(3);
	});

	it("should reject empty query", () => {
		expect(searchParamsSchema.safeParse({ q: "" }).success).toBe(false);
	});

	it("should reject missing query", () => {
		expect(searchParamsSchema.safeParse({}).success).toBe(false);
	});
});
