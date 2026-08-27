"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import type { Chapter, MangaDetail } from "@/lib/scraper";

interface LibraryState {
	isInLibrary: boolean;
	entryId: string | null;
	status: string;
}

interface ProgressState {
	readChapters: Set<string>;
	lastReadChapterSlug: string | null;
}

interface UseMangaDetailReturn {
	manga: MangaDetail | null;
	chapters: Chapter[];
	isLoading: boolean;
	isLoadingChapters: boolean;
	error: string | null;
	library: LibraryState;
	progress: ProgressState;
	isAdding: boolean;
	addToLibrary: () => Promise<void>;
	changeStatus: (status: string) => Promise<void>;
	removeFromLibrary: () => Promise<void>;
}

export function useMangaDetail(source: string, slug: string): UseMangaDetailReturn {
	const [manga, setManga] = useState<MangaDetail | null>(null);
	const [chapters, setChapters] = useState<Chapter[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [isLoadingChapters, setIsLoadingChapters] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [isAdding, setIsAdding] = useState(false);
	const [library, setLibrary] = useState<LibraryState>({
		isInLibrary: false,
		entryId: null,
		status: "plan_to_read",
	});
	const [progress, setProgress] = useState<ProgressState>({
		readChapters: new Set(),
		lastReadChapterSlug: null,
	});

	useEffect(() => {
		const fetchAll = async () => {
			setIsLoading(true);
			setError(null);
			try {
				// Fetch manga detail
				const res = await fetch(`/api/manga/${source}/${slug}`);
				if (!res.ok) {
					const data = await res.json();
					throw new Error(data.error ?? "Manga not found");
				}
				const mangaData = (await res.json()) as MangaDetail;
				setManga(mangaData);

				// Fetch chapters
				setIsLoadingChapters(true);
				const chapRes = await fetch(`/api/manga/${source}/${slug}/chapters`);
				if (chapRes.ok) {
					setChapters((await chapRes.json()) as Chapter[]);
				}

				// Check library status
				const libRes = await fetch(`/api/library/check?source=${source}&slug=${slug}`);
				if (libRes.ok) {
					const libData = (await libRes.json()) as {
						inLibrary: boolean;
						entryId?: string;
						status?: string;
					};
					if (libData.inLibrary) {
						setLibrary({
							isInLibrary: true,
							entryId: libData.entryId ?? null,
							status: libData.status ?? "reading",
						});
					}
				}

				// Fetch progress
				const progressRes = await fetch(`/api/progress/${source}/${slug}`);
				if (progressRes.ok) {
					const progressData = (await progressRes.json()) as {
						readChapters: string[];
						lastChapter: { chapterSlug: string } | null;
					};
					setProgress({
						readChapters: new Set(progressData.readChapters),
						lastReadChapterSlug: progressData.lastChapter?.chapterSlug ?? null,
					});
				}
			} catch (err) {
				setError(err instanceof Error ? err.message : "Failed to load manga");
			} finally {
				setIsLoading(false);
				setIsLoadingChapters(false);
			}
		};
		fetchAll();
	}, [source, slug]);

	const addToLibrary = async () => {
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
				const data = (await res.json()) as { id: string };
				setLibrary({ isInLibrary: true, entryId: data.id, status: "plan_to_read" });
				toast.success(`Added "${manga.title}" to library`);
			} else {
				toast.error("Failed to add to library");
			}
		} catch {
			toast.error("Failed to add to library");
		} finally {
			setIsAdding(false);
		}
	};

	const changeStatus = async (newStatus: string) => {
		if (!library.entryId) return;
		try {
			const res = await fetch(`/api/library/${library.entryId}`, {
				method: "PATCH",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ status: newStatus }),
			});
			if (res.ok) {
				setLibrary((prev) => ({ ...prev, status: newStatus }));
				toast.success("Status updated");
			} else {
				toast.error("Failed to update status");
			}
		} catch {
			toast.error("Failed to update status");
		}
	};

	const removeFromLibrary = async () => {
		if (!library.entryId) return;
		try {
			const res = await fetch(`/api/library/${library.entryId}`, { method: "DELETE" });
			if (res.ok) {
				setLibrary({ isInLibrary: false, entryId: null, status: "plan_to_read" });
				toast.success(`Removed "${manga?.title}" from library`);
			} else {
				toast.error("Failed to remove from library");
			}
		} catch {
			toast.error("Failed to remove from library");
		}
	};

	return {
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
	};
}
