"use client";

import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function ReaderPage() {
	const params = useParams<{ source: string; slug: string; chapter: string }>();
	const router = useRouter();
	const [showControls, setShowControls] = useState(true);
	const [pages, setPages] = useState<string[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		const fetchPages = async () => {
			setIsLoading(true);
			setError(null);
			try {
				const res = await fetch(
					`/api/chapter/${params.source}/${params.slug}/${params.chapter}`,
				);
				if (!res.ok) {
					const data = await res.json();
					throw new Error(data.error ?? "Failed to load chapter");
				}
				const data = (await res.json()) as { pages: string[] };
				setPages(data.pages);
			} catch (err) {
				setError(err instanceof Error ? err.message : "Failed to load chapter");
			} finally {
				setIsLoading(false);
			}
		};
		fetchPages();
	}, [params.source, params.slug, params.chapter]);

	if (isLoading) {
		return (
			<div className="flex min-h-dvh items-center justify-center bg-black">
				<Loader2 className="size-8 animate-spin text-white/50" />
			</div>
		);
	}

	if (error) {
		return (
			<div className="flex min-h-dvh flex-col items-center justify-center gap-4 bg-black">
				<p className="text-white/70">{error}</p>
				<Button
					variant="ghost"
					className="cursor-pointer text-white"
					onClick={() => router.push(`/manga/${params.source}/${params.slug}`)}
				>
					Back to manga
				</Button>
			</div>
		);
	}

	return (
		<div
			className="relative min-h-dvh bg-black"
			onClick={() => setShowControls((prev) => !prev)}
		>
			{/* Header */}
			<div
				className={cn(
					"fixed top-0 right-0 left-0 z-50 flex items-center justify-between bg-black/80 px-4 py-3 backdrop-blur-md transition-transform duration-300",
					showControls ? "translate-y-0" : "-translate-y-full",
				)}
			>
				<Button
					variant="ghost"
					size="sm"
					className="cursor-pointer gap-2 text-white hover:text-white/80"
					onClick={(e) => {
						e.stopPropagation();
						router.push(`/manga/${params.source}/${params.slug}`);
					}}
				>
					<ArrowLeft className="size-4" />
					Back
				</Button>
				<span className="text-sm text-white/70">{params.chapter}</span>
			</div>

			{/* Pages */}
			<div className="mx-auto max-w-3xl pt-14 pb-20">
				{pages.map((pageUrl, index) => (
					<div
						key={pageUrl}
						className="relative w-full"
						onClick={(e) => e.stopPropagation()}
					>
						<Image
							src={pageUrl}
							alt={`Page ${index + 1}`}
							width={800}
							height={1200}
							className="w-full h-auto"
							priority={index < 3}
							unoptimized
						/>
					</div>
				))}
			</div>

			{/* Footer navigation */}
			<div
				className={cn(
					"fixed right-0 bottom-0 left-0 z-50 flex items-center justify-center bg-black/80 px-4 py-3 backdrop-blur-md transition-transform duration-300",
					showControls ? "translate-y-0" : "translate-y-full",
				)}
			>
				<Button
					variant="ghost"
					size="sm"
					className="cursor-pointer text-white hover:text-white/80"
					onClick={(e) => {
						e.stopPropagation();
						router.back();
					}}
				>
					<ChevronLeft className="size-4" />
					Prev
				</Button>

				<span className="mx-4 rounded-full bg-white/10 px-3 py-1 text-xs text-white/70">
					{pages.length} pages
				</span>

				<Button
					variant="ghost"
					size="sm"
					className="cursor-pointer text-white hover:text-white/80"
					onClick={(e) => {
						e.stopPropagation();
						router.back();
					}}
				>
					Next
					<ChevronRight className="size-4" />
				</Button>
			</div>
		</div>
	);
}
