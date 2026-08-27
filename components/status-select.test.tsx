import { render } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { StatusSelect, statuses } from "./status-select";

describe("StatusSelect", () => {
	it("should render a trigger button", () => {
		const { container } = render(<StatusSelect value="completed" onValueChange={vi.fn()} />);
		const trigger = container.querySelector("button");
		expect(trigger).toBeInTheDocument();
	});

	it("should export all status options", () => {
		expect(statuses).toHaveLength(4);
		expect(statuses.map((s) => s.value)).toEqual([
			"plan_to_read",
			"on_hold",
			"completed",
			"dropped",
		]);
	});

	it("should render disabled state", () => {
		const { container } = render(
			<StatusSelect value="completed" onValueChange={vi.fn()} disabled />,
		);
		const trigger = container.querySelector("button");
		expect(trigger).toBeDisabled();
	});

	it("should apply sm size class", () => {
		const { container } = render(
			<StatusSelect value="completed" onValueChange={vi.fn()} size="sm" />,
		);
		const trigger = container.querySelector("button");
		expect(trigger?.className).toContain("h-7");
	});
});
