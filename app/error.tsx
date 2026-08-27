"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";

export default function GlobalError({
	error,
	reset,
}: {
	error: Error & { digest?: string };
	reset: () => void;
}) {
	useEffect(() => {
		console.error("Global error:", error);
	}, [error]);

	return (
		<div className="flex min-h-dvh flex-col items-center justify-center gap-6">
			<div className="text-center">
				<p className="select-none font-heading text-6xl font-black text-muted-foreground/10">
					Oops
				</p>
				<h1 className="mt-4 font-heading text-2xl font-bold">Something went wrong</h1>
				<p className="mt-2 max-w-md text-sm text-muted-foreground">
					An unexpected error occurred. Please try again.
				</p>
			</div>
			<Button onClick={reset} className="cursor-pointer">
				Try again
			</Button>
		</div>
	);
}
