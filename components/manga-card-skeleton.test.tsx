import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { MangaCardSkeleton } from "./manga-card-skeleton";

describe("MangaCardSkeleton", () => {
	it("should render default 4 skeletons", () => {
		const { container } = render(<MangaCardSkeleton />);
		const skeletons = container.querySelectorAll("[data-slot='skeleton']");
		// 4 cards × 2 skeletons each (cover + text)
		expect(skeletons.length).toBe(8);
	});

	it("should render custom count", () => {
		const { container } = render(<MangaCardSkeleton count={2} />);
		const skeletons = container.querySelectorAll("[data-slot='skeleton']");
		expect(skeletons.length).toBe(4);
	});
});
