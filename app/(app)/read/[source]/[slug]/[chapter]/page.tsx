"use client";

import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { Chapter } from "@/lib/scraper";

export default function ReaderPage() {
	const params = useParams<{ source: string; slug: string; chapter: string }>();
	const router = useRouter();
	const [showControls, setShowControls] = useState(true);
	const [pages, setPages] = useState<string[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [chapters, setChapters] = useState<Chapter[]>([]);
	const [scrollProgress, setScrollProgress] = useState(0);
	const [showEndPrompt, setShowEndPrompt] = useState(false);

	// Find prev/next chapters
	const sortedChapters = chapters.sort((a, b) => a.number - b.number);
	const currentIndex = sortedChapters.findIndex((ch) => ch.slug === params.chapter);
	const prevChapter = currentIndex > 0 ? sortedChapters[currentIndex - 1] : null;
	const nextChapter =
		currentIndex >= 0 && currentIndex < sortedChapters.length - 1
			? sortedChapters[currentIndex + 1]
			: null;

	const navigateToChapter = useCallback(
		(chapterSlug: string) => {
			router.push(`/read/${params.source}/${params.slug}/${chapterSlug}`);
		},
		[router, params.source, params.slug],
	);

	// Fetch chapter pages
	useEffect(() => {
		const fetchPages = async () => {
			setIsLoading(true);
			setError(null);
			setShowEndPrompt(false);
			setScrollProgress(0);
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
				window.scrollTo(0, 0);

				// Auto-mark chapter as read
				fetch("/api/progress", {
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({
						source: params.source,
						mangaSlug: params.slug,
						chapterSlug: params.chapter,
						chapterNumber: currentIndex >= 0 ? sortedChapters[currentIndex]?.number?.toString() ?? "0" : "0",
					}),
				}).catch(() => {}); // Fire and forget
			} catch (err) {
				setError(err instanceof Error ? err.message : "Failed to load chapter");
			} finally {
				setIsLoading(false);
			}
		};
		fetchPages();
	}, [params.source, params.slug, params.chapter]);

	// Fetch chapter list for navigation
	useEffect(() => {
		const fetchChapters = async () => {
			const res = await fetch(`/api/manga/${params.source}/${params.slug}/chapters`);
			if (res.ok) {
				const data = (await res.json()) as Chapter[];
				setChapters(data);
			}
		};
		fetchChapters();
	}, [params.source, params.slug]);

	// Scroll progress tracking
	useEffect(() => {
		const handleScroll = () => {
			const scrollTop = window.scrollY;
			const docHeight = document.documentElement.scrollHeight - window.innerHeight;
			if (docHeight > 0) {
				const progress = Math.min(scrollTop / docHeight, 1);
				setScrollProgress(progress);
				if (progress > 0.95) {
					setShowEndPrompt(true);
				}
			}
		};
		window.addEventListener("scroll", handleScroll, { passive: true });
		return () => window.removeEventListener("scroll", handleScroll);
	}, []);

	// Keyboard shortcuts
	useEffect(() => {
		const handleKeyDown = (e: KeyboardEvent) => {
			if (e.key === "ArrowLeft" && prevChapter) {
				navigateToChapter(prevChapter.slug);
			} else if (e.key === "ArrowRight" && nextChapter) {
				navigateToChapter(nextChapter.slug);
			}
		};
		window.addEventListener("keydown", handleKeyDown);
		return () => window.removeEventListener("keydown", handleKeyDown);
	}, [prevChapter, nextChapter, navigateToChapter]);

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
			{/* Scroll progress bar */}
			<div className="fixed top-0 right-0 left-0 z-[60] h-0.5">
				<div
					className="h-full bg-primary shadow-[0_0_8px_rgba(139,92,246,0.5)] transition-[width] duration-150"
					style={{ width: `${scrollProgress * 100}%` }}
				/>
			</div>

			{/* Header */}
			<div
				className={cn(
					"fixed top-0.5 right-0 left-0 z-50 flex items-center justify-between bg-black/80 px-4 py-3 backdrop-blur-md transition-transform duration-300",
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
							className="h-auto w-full"
							priority={index < 3}
							unoptimized
						/>
					</div>
				))}

				{/* End of chapter prompt */}
				{showEndPrompt && (
					<div
						className="flex flex-col items-center gap-4 py-16"
						onClick={(e) => e.stopPropagation()}
					>
						<p className="text-sm text-white/50">End of chapter</p>
						{nextChapter ? (
							<Button
								className="cursor-pointer gap-2"
								onClick={() => navigateToChapter(nextChapter.slug)}
							>
								Next: Chapter {nextChapter.number}
								<ChevronRight className="size-4" />
							</Button>
						) : (
							<p className="text-xs text-white/30">No more chapters</p>
						)}
						<Button
							variant="ghost"
							size="sm"
							className="cursor-pointer text-white/30 hover:text-white/60"
							onClick={() => router.push(`/manga/${params.source}/${params.slug}`)}
						>
							Back to manga
						</Button>
					</div>
				)}
			</div>

			{/* Footer navigation */}
			<div
				className={cn(
					"fixed right-0 bottom-0 left-0 z-50 flex items-center justify-between bg-black/80 px-4 py-3 backdrop-blur-md transition-transform duration-300",
					showControls ? "translate-y-0" : "translate-y-full",
				)}
			>
				<Button
					variant="ghost"
					size="sm"
					className="cursor-pointer text-white hover:text-white/80"
					disabled={!prevChapter}
					onClick={(e) => {
						e.stopPropagation();
						if (prevChapter) navigateToChapter(prevChapter.slug);
					}}
				>
					<ChevronLeft className="size-4" />
					Prev
				</Button>

				<span className="rounded-full bg-white/10 px-3 py-1 text-xs text-white/70">
					{pages.length} pages
				</span>

				<Button
					variant="ghost"
					size="sm"
					className="cursor-pointer text-white hover:text-white/80"
					disabled={!nextChapter}
					onClick={(e) => {
						e.stopPropagation();
						if (nextChapter) navigateToChapter(nextChapter.slug);
					}}
				>
					Next
					<ChevronRight className="size-4" />
				</Button>
			</div>
		</div>
	);
}
