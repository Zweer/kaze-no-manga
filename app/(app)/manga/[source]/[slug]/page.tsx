"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { BookOpen, Clock, Check, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useSession } from "@/lib/auth-client";
import type { MangaDetail, Chapter } from "@/lib/scraper";

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
			router.push(`/?login=true&callbackUrl=/manga/${params.source}/${params.slug}`);
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
			}
		} finally {
			setIsAdding(false);
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

					<p className="text-sm leading-relaxed text-muted-foreground">
						{manga.description}
					</p>

					<div className="flex flex-wrap gap-1.5">
						{manga.genres.map((genre) => (
							<Badge key={genre} variant="outline" className="text-xs">
								{genre}
							</Badge>
						))}
					</div>

					<Button className="mt-4 cursor-pointer gap-2" onClick={handleAddToLibrary} disabled={isAdding || isInLibrary}>
						{isInLibrary ? (
							<>
								<Check className="size-4" />
								In Library
							</>
						) : isAdding ? (
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
				</div>
			</div>

			<div className="space-y-4">
				<h2 className="font-heading text-xl font-semibold">
					Chapters{chapters.length > 0 && ` (${chapters.length})`}
				</h2>

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
							.map((chapter) => (
								<Link
									key={chapter.slug}
									href={`/read/${manga.sourceId}/${manga.slug}/${chapter.slug}`}
									className="flex items-center justify-between rounded-lg px-4 py-3 transition-colors hover:bg-accent"
								>
									<div className="flex items-center gap-3">
										<span className="size-2 rounded-full bg-muted-foreground/30" />
										<span className="text-sm font-medium">
											Chapter {chapter.number}
										</span>
										{chapter.title !== `Chapter ${chapter.number}` && (
											<span className="text-sm text-muted-foreground">
												{chapter.title}
											</span>
										)}
									</div>
									<div className="flex items-center gap-2 text-xs text-muted-foreground">
										<Clock className="size-3" />
										{new Date(chapter.releasedAt).toLocaleDateString()}
									</div>
								</Link>
							))}
					</div>
				)}
			</div>
		</div>
	);
}
