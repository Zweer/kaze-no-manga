"use client";

import { ArrowLeft, ChevronLeft, ChevronRight } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function ReaderPage() {
	const params = useParams<{ source: string; slug: string; chapter: string }>();
	const router = useRouter();
	const [showControls, setShowControls] = useState(true);

	const chapterNum = Number(params.chapter);
	const pages = Array.from({ length: 8 }, (_, i) => i + 1);

	return (
		<div className="relative min-h-dvh bg-black" onClick={() => setShowControls((prev) => !prev)}>
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
				<span className="text-sm text-white/70">Chapter {chapterNum}</span>
			</div>

			{/* Pages */}
			<div className="mx-auto max-w-3xl space-y-1 px-0 pt-14 pb-20">
				{pages.map((page) => (
					<div
						key={page}
						className="relative aspect-[2/3] w-full bg-card/5"
						onClick={(e) => e.stopPropagation()}
					>
						<div className="flex h-full items-center justify-center text-white/20">
							<span className="text-lg">Page {page}</span>
						</div>
						{/* Edge shadows between pages */}
						<div className="absolute inset-x-0 top-0 h-4 bg-gradient-to-b from-black/20 to-transparent" />
						<div className="absolute inset-x-0 bottom-0 h-4 bg-gradient-to-t from-black/20 to-transparent" />
					</div>
				))}
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
					disabled={chapterNum <= 1}
					onClick={(e) => {
						e.stopPropagation();
						router.push(`/read/${params.source}/${params.slug}/${chapterNum - 1}`);
					}}
				>
					<ChevronLeft className="size-4" />
					Prev
				</Button>

				<span className="rounded-full bg-white/10 px-3 py-1 text-xs text-white/70">
					Ch. {chapterNum}
				</span>

				<Button
					variant="ghost"
					size="sm"
					className="cursor-pointer text-white hover:text-white/80"
					onClick={(e) => {
						e.stopPropagation();
						router.push(`/read/${params.source}/${params.slug}/${chapterNum + 1}`);
					}}
				>
					Next
					<ChevronRight className="size-4" />
				</Button>
			</div>
		</div>
	);
}
