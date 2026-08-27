"use client";

import { BookOpen, Clock, Loader2, Trash2 } from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { ErrorState } from "@/components/error-state";
import { MangaCover } from "@/components/manga-cover";
import { StatusSelect } from "@/components/status-select";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useMangaDetail } from "@/hooks/use-manga-detail";
import { useSession } from "@/lib/auth-client";
import type { Chapter, MangaDetail } from "@/lib/scraper";
import { cn } from "@/lib/utils";

export default function MangaDetailPage() {
	const params = useParams<{ source: string; slug: string }>();
	const router = useRouter();
	const { data: session } = useSession();

	const {
		manga,
		chapters,
		isLoading,
		isLoadingChapters,
		error,
		library,
		progress,
		isAdding,
		addToLibrary,
		changeStatus,
		removeFromLibrary,
	} = useMangaDetail(params.source, params.slug);

	const handleAddToLibrary = () => {
		if (!session?.user) {
			const currentPath = `/manga/${params.source}/${params.slug}`;
			router.push(`${currentPath}?login=true&callbackUrl=${currentPath}`);
			return;
		}
		addToLibrary();
	};

	if (isLoading) {
		return (
			<div className="space-y-6">
				<div className="flex gap-6">
					<Skeleton className="aspect-[3/4] w-36 rounded-xl sm:w-48" />
					<div className="flex-1 space-y-3">
						<Skeleton className="h-6 w-3/4" />
						<Skeleton className="h-4 w-1/2" />
						<Skeleton className="h-20 w-full" />
					</div>
				</div>
			</div>
		);
	}

	if (error || !manga) {
		return <ErrorState message={error ?? "Manga not found"} />;
	}

	return (
		<div className="space-y-8">
			<MangaHero
				manga={manga}
				library={library}
				isAdding={isAdding}
				onAddToLibrary={handleAddToLibrary}
				onChangeStatus={changeStatus}
				onRemove={removeFromLibrary}
			/>
			<ChapterList
				manga={manga}
				chapters={chapters}
				isLoading={isLoadingChapters}
				readChapters={progress.readChapters}
				lastReadChapterSlug={progress.lastReadChapterSlug}
			/>
		</div>
	);
}

// ── Sub-components ──────────────────────────────────────────────────

interface MangaHeroProps {
	manga: MangaDetail;
	library: { isInLibrary: boolean; status: string };
	isAdding: boolean;
	onAddToLibrary: () => void;
	onChangeStatus: (status: string) => void;
	onRemove: () => void;
}

function MangaHero({
	manga,
	library,
	isAdding,
	onAddToLibrary,
	onChangeStatus,
	onRemove,
}: MangaHeroProps) {
	return (
		<div className="flex flex-col gap-6 sm:flex-row">
			<MangaCover
				src={manga.cover}
				alt={manga.title}
				sizes="192px"
				className="w-36 shrink-0 shadow-2xl sm:w-48"
			/>

			<div className="flex-1 space-y-3">
				<h1 className="font-heading text-2xl font-bold sm:text-3xl">{manga.title}</h1>

				<div className="flex items-center gap-2">
					<Badge variant="secondary" className="capitalize">
						{manga.sourceId}
					</Badge>
					<Badge
						variant={manga.status === "ongoing" ? "default" : "secondary"}
						className="capitalize"
					>
						{manga.status}
					</Badge>
				</div>

				<p className="text-sm leading-relaxed text-muted-foreground">{manga.description}</p>

				<div className="flex flex-wrap gap-1.5">
					{manga.genres.map((genre) => (
						<Badge key={genre} variant="outline" className="text-xs">
							{genre}
						</Badge>
					))}
				</div>

				<div className="mt-4 flex items-center gap-3">
					{library.isInLibrary ? (
						<>
							<StatusSelect value={library.status} onValueChange={onChangeStatus} />
							<Button
								variant="ghost"
								size="sm"
								className="cursor-pointer text-muted-foreground hover:text-destructive"
								onClick={onRemove}
							>
								<Trash2 className="size-4" />
								Remove
							</Button>
						</>
					) : (
						<Button className="cursor-pointer gap-2" onClick={onAddToLibrary} disabled={isAdding}>
							{isAdding ? (
								<>
									<Loader2 className="size-4 animate-spin" />
									Adding...
								</>
							) : (
								<>
									<BookOpen className="size-4" />
									Add to Library
								</>
							)}
						</Button>
					)}
				</div>
			</div>
		</div>
	);
}

interface ChapterListProps {
	manga: MangaDetail;
	chapters: Chapter[];
	isLoading: boolean;
	readChapters: Set<string>;
	lastReadChapterSlug: string | null;
}

function ChapterList({
	manga,
	chapters,
	isLoading,
	readChapters,
	lastReadChapterSlug,
}: ChapterListProps) {
	const router = useRouter();

	const handleContinueReading = () => {
		const sorted = [...chapters].sort((a, b) => a.number - b.number);
		const lastReadIndex = sorted.findIndex((ch) => ch.slug === lastReadChapterSlug);
		const nextUnread = sorted.find((ch, i) => i > lastReadIndex && !readChapters.has(ch.slug));
		const target = nextUnread ?? sorted.find((ch) => ch.slug === lastReadChapterSlug);
		if (target) {
			router.push(`/read/${manga.sourceId}/${manga.slug}/${target.slug}`);
		}
	};

	return (
		<div className="space-y-4">
			<div className="flex items-center justify-between">
				<h2 className="font-heading text-xl font-semibold">
					Chapters{chapters.length > 0 && ` (${chapters.length})`}
				</h2>
				{lastReadChapterSlug && (
					<Button size="sm" className="cursor-pointer gap-2" onClick={handleContinueReading}>
						Continue Reading
					</Button>
				)}
			</div>

			{isLoading && (
				<div className="space-y-2">
					{Array.from({ length: 5 }, (_, i) => (
						<Skeleton key={`chap-skeleton-${i}`} className="h-12 rounded-lg" />
					))}
				</div>
			)}

			{!isLoading && chapters.length === 0 && (
				<p className="text-sm text-muted-foreground">No chapters available</p>
			)}

			{!isLoading && chapters.length > 0 && (
				<div className="space-y-1">
					{chapters
						.sort((a, b) => b.number - a.number)
						.map((chapter) => {
							const isRead = readChapters.has(chapter.slug);
							return (
								<Link
									key={chapter.slug}
									href={`/read/${manga.sourceId}/${manga.slug}/${chapter.slug}`}
									className="flex items-center justify-between rounded-lg px-4 py-3 transition-colors hover:bg-accent"
								>
									<div className="flex items-center gap-3">
										<span
											className={cn(
												"size-2 rounded-full",
												isRead ? "bg-primary" : "bg-muted-foreground/30",
											)}
										/>
										<span className={cn("text-sm font-medium", isRead && "text-muted-foreground")}>
											Chapter {chapter.number}
										</span>
										{chapter.title !== `Chapter ${chapter.number}` && (
											<span className="text-sm text-muted-foreground">{chapter.title}</span>
										)}
									</div>
									<div className="flex items-center gap-2 text-xs text-muted-foreground">
										<Clock className="size-3" />
										{new Date(chapter.releasedAt).toLocaleDateString()}
									</div>
								</Link>
							);
						})}
				</div>
			)}
		</div>
	);
}
