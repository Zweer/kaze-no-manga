import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { MangaCover } from "./manga-cover";

describe("MangaCover", () => {
	it("should render image when src is provided", () => {
		render(<MangaCover src="https://example.com/cover.jpg" alt="Test Manga" />);
		const img = screen.getByAltText("Test Manga");
		expect(img).toBeInTheDocument();
	});

	it("should render 'No cover' fallback when src is empty", () => {
		render(<MangaCover src="" alt="Test Manga" />);
		expect(screen.getByText("No cover")).toBeInTheDocument();
	});

	it("should apply custom className", () => {
		const { container } = render(
			<MangaCover src="https://example.com/cover.jpg" alt="Test" className="w-48" />,
		);
		expect(container.firstChild).toHaveClass("w-48");
	});

	it("should have vignette shadow overlay", () => {
		const { container } = render(
			<MangaCover src="https://example.com/cover.jpg" alt="Test" />,
		);
		const shadow = container.querySelector("[class*='shadow-\\[inset']");
		expect(shadow).toBeInTheDocument();
	});
});
