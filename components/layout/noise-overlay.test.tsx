import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { NoiseOverlay } from "./noise-overlay";

describe("NoiseOverlay", () => {
	it("should render with aria-hidden", () => {
		const { container } = render(<NoiseOverlay />);
		const overlay = container.firstChild as HTMLElement;
		expect(overlay).toHaveAttribute("aria-hidden", "true");
	});

	it("should be non-interactive (pointer-events-none)", () => {
		const { container } = render(<NoiseOverlay />);
		const overlay = container.firstChild as HTMLElement;
		expect(overlay.className).toContain("pointer-events-none");
	});

	it("should contain an SVG with noise filter", () => {
		const { container } = render(<NoiseOverlay />);
		expect(container.querySelector("svg")).toBeInTheDocument();
		expect(container.querySelector("feTurbulence")).toBeInTheDocument();
	});
});
