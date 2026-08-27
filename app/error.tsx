"use client";

import Image from "next/image";
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
		<div className="flex min-h-dvh flex-col items-center justify-center gap-6 px-4">
			<Image
				src="/images/manga-wind.png"
				alt=""
				width={300}
				height={200}
				className="w-48 opacity-30 md:w-64"
			/>
			<div className="text-center">
				<h1 className="font-heading text-2xl font-bold">Something went wrong</h1>
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
