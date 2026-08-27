"use client";

import { BookOpen, Clock, Loader2, Trash2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { StatusSelect } from "@/components/status-select";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useSession } from "@/lib/auth-client";
import type { Chapter, MangaDetail } from "@/lib/scraper";
import { cn } from "@/lib/utils";

export default function MangaDetailPage() {
	const params = useParams<{ source: string; slug: string }>();
	const router = useRouter();
	const { data: session } = useSession();
	const [manga, setManga] = useState<MangaDetail | null>(null);
	const [chapters, setChapters] = useState<Chapter[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [isLoadingChapters, setIsLoadingChapters] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [isAdding, setIsAdding] = useState(false);
	const [isInLibrary, setIsInLibrary] = useState(false);
	const [libraryEntryId, setLibraryEntryId] = useState<string | null>(null);
	const [libraryStatus, setLibraryStatus] = useState<string>("plan_to_read");
	const [readChapters, setReadChapters] = useState<Set<string>>(new Set());
	const [lastReadChapterSlug, setLastReadChapterSlug] = useState<string | null>(null);

	useEffect(() => {
		const fetchManga = async () => {
			setIsLoading(true);
			setError(null);
			try {
				const res = await fetch(`/api/manga/${params.source}/${params.slug}`);
				if (!res.ok) {
					const data = await res.json();
					throw new Error(data.error ?? "Manga not found");
				}
				const data = (await res.json()) as MangaDetail;
				setManga(data);

				setIsLoadingChapters(true);
				const chapRes = await fetch(`/api/manga/${params.source}/${params.slug}/chapters`);
				if (chapRes.ok) {
					const chapData = (await chapRes.json()) as Chapter[];
					setChapters(chapData);
				}

				// Check if in library
				const libRes = await fetch(
					`/api/library/check?source=${params.source}&slug=${params.slug}`,
				);
				if (libRes.ok) {
					const libData = (await libRes.json()) as {
						inLibrary: boolean;
						entryId?: string;
						status?: string;
					};
					if (libData.inLibrary) {
						setIsInLibrary(true);
						setLibraryEntryId(libData.entryId ?? null);
						setLibraryStatus(libData.status ?? "reading");
					}
				}

				// Fetch reading progress
				const progressRes = await fetch(`/api/progress/${params.source}/${params.slug}`);
				if (progressRes.ok) {
					const progressData = (await progressRes.json()) as {
						readChapters: string[];
						lastChapter: { chapterSlug: string } | null;
					};
					setReadChapters(new Set(progressData.readChapters));
					setLastReadChapterSlug(progressData.lastChapter?.chapterSlug ?? null);
				}
			} catch (err) {
				setError(err instanceof Error ? err.message : "Failed to load manga");
			} finally {
				setIsLoading(false);
				setIsLoadingChapters(false);
			}
		};
		fetchManga();
	}, [params.source, params.slug]);

	const handleAddToLibrary = async () => {
		if (!session?.user) {
			const currentPath = `/manga/${params.source}/${params.slug}`;
			router.push(`${currentPath}?login=true&callbackUrl=${currentPath}`);
			return;
		}
		if (!manga) return;

		setIsAdding(true);
		try {
			const res = await fetch("/api/library", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					source: manga.sourceId,
					slug: manga.slug,
					title: manga.title,
					cover: manga.cover,
					description: manga.description,
					status: manga.status,
					genres: manga.genres,
				}),
			});
			if (res.ok) {
				setIsInLibrary(true);
				const data = (await res.json()) as { id: string };
				setLibraryEntryId(data.id);
				setLibraryStatus("plan_to_read");
			}
		} finally {
			setIsAdding(false);
		}
	};

	const handleStatusChange = async (newStatus: string) => {
		if (!libraryEntryId) return;
		const res = await fetch(`/api/library/${libraryEntryId}`, {
			method: "PATCH",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ status: newStatus }),
		});
		if (res.ok) {
			setLibraryStatus(newStatus);
		}
	};

	const handleRemoveFromLibrary = async () => {
		if (!libraryEntryId) return;
		const res = await fetch(`/api/library/${libraryEntryId}`, { method: "DELETE" });
		if (res.ok) {
			setIsInLibrary(false);
			setLibraryEntryId(null);
			setLibraryStatus("plan_to_read");
		}
	};

	if (isLoading) {
		return (
			<div className="space-y-6">
				<div className="flex gap-6">
					<div className="aspect-[3/4] w-36 animate-pulse rounded-xl bg-muted sm:w-48" />
					<div className="flex-1 space-y-3">
						<div className="h-6 w-3/4 animate-pulse rounded bg-muted" />
						<div className="h-4 w-1/2 animate-pulse rounded bg-muted" />
						<div className="h-20 w-full animate-pulse rounded bg-muted" />
					</div>
				</div>
			</div>
		);
	}

	if (error || !manga) {
		return (
			<div className="flex flex-col items-center py-20">
				<p className="text-muted-foreground">{error ?? "Manga not found"}</p>
			</div>
		);
	}

	return (
		<div className="space-y-8">
			<div className="flex flex-col gap-6 sm:flex-row">
				<div className="relative aspect-[3/4] w-36 shrink-0 overflow-hidden rounded-xl shadow-2xl sm:w-48">
					{manga.cover ? (
						<Image
							src={manga.cover}
							alt={manga.title}
							fill
							className="object-cover"
							sizes="192px"
						/>
					) : (
						<div className="flex h-full items-center justify-center bg-card text-muted-foreground">
							No cover
						</div>
					)}
					<div className="absolute inset-0 shadow-[inset_0_0_40px_rgba(0,0,0,0.3)]" />
				</div>

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
						{isInLibrary ? (
							<>
								<StatusSelect value={libraryStatus} onValueChange={handleStatusChange} />
								<Button
									variant="ghost"
									size="sm"
									className="cursor-pointer text-muted-foreground hover:text-destructive"
									onClick={handleRemoveFromLibrary}
								>
									<Trash2 className="size-4" />
									Remove
								</Button>
							</>
						) : (
							<Button
								className="cursor-pointer gap-2"
								onClick={handleAddToLibrary}
								disabled={isAdding}
							>
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

			<div className="space-y-4">
				<div className="flex items-center justify-between">
					<h2 className="font-heading text-xl font-semibold">
						Chapters{chapters.length > 0 && ` (${chapters.length})`}
					</h2>
					{lastReadChapterSlug && (
						<Button
							size="sm"
							className="cursor-pointer gap-2"
							onClick={() => {
								// Find next unread chapter after last read
								const sorted = [...chapters].sort((a, b) => a.number - b.number);
								const lastReadIndex = sorted.findIndex((ch) => ch.slug === lastReadChapterSlug);
								const nextUnread = sorted.find(
									(ch, i) => i > lastReadIndex && !readChapters.has(ch.slug),
								);
								const target = nextUnread ?? sorted.find((ch) => ch.slug === lastReadChapterSlug);
								if (target && manga) {
									router.push(`/read/${manga.sourceId}/${manga.slug}/${target.slug}`);
								}
							}}
						>
							Continue Reading
						</Button>
					)}
				</div>

				{isLoadingChapters && (
					<div className="space-y-2">
						{Array.from({ length: 5 }, (_, i) => (
							<div key={`chap-skeleton-${i}`} className="h-12 animate-pulse rounded-lg bg-muted" />
						))}
					</div>
				)}

				{!isLoadingChapters && chapters.length === 0 && (
					<p className="text-sm text-muted-foreground">No chapters available</p>
				)}

				{!isLoadingChapters && chapters.length > 0 && (
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
											<span
												className={cn("text-sm font-medium", isRead && "text-muted-foreground")}
											>
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
		</div>
	);
}
