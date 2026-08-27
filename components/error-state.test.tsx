import { render, screen, fireEvent } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { ErrorState } from "./error-state";

describe("ErrorState", () => {
	it("should render the error message", () => {
		render(<ErrorState message="Something went wrong" />);
		expect(screen.getByText("Something went wrong")).toBeInTheDocument();
	});

	it("should render retry button when onRetry is provided", () => {
		const onRetry = vi.fn();
		render(<ErrorState message="Error" onRetry={onRetry} />);
		expect(screen.getByRole("button", { name: "Try again" })).toBeInTheDocument();
	});

	it("should not render retry button when onRetry is not provided", () => {
		render(<ErrorState message="Error" />);
		expect(screen.queryByRole("button")).not.toBeInTheDocument();
	});

	it("should call onRetry when retry button is clicked", () => {
		const onRetry = vi.fn();
		render(<ErrorState message="Error" onRetry={onRetry} />);
		fireEvent.click(screen.getByRole("button", { name: "Try again" }));
		expect(onRetry).toHaveBeenCalledOnce();
	});
});
