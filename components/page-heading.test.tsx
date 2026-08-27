import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { PageHeading } from "./page-heading";

describe("PageHeading", () => {
	it("should render the title", () => {
		render(<PageHeading title="Library" />);
		expect(screen.getByRole("heading", { name: "Library" })).toBeInTheDocument();
	});

	it("should render the accent bar", () => {
		const { container } = render(<PageHeading title="Test" />);
		const bar = container.querySelector(".bg-primary");
		expect(bar).toBeInTheDocument();
	});

	it("should render children when provided", () => {
		render(
			<PageHeading title="Test">
				<button type="button">Action</button>
			</PageHeading>,
		);
		expect(screen.getByRole("button", { name: "Action" })).toBeInTheDocument();
	});

	it("should not render children slot when empty", () => {
		const { container } = render(<PageHeading title="Test" />);
		// Only the heading div, no extra children
		expect(container.querySelector("button")).not.toBeInTheDocument();
	});
});
