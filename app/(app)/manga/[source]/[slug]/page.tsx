"use client";

import { BookOpen, Clock } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { MockManga } from "@/lib/mock";

export default function MangaDetailPage() {
	const params = useParams<{ source: string; slug: string }>();
	const [manga, setManga] = useState<MockManga | null>(null);
	const [isLoading, setIsLoading] = useState(true);

	useEffect(() => {
		const fetchManga = async () => {
			setIsLoading(true);
			const res = await fetch(`/api/mock/manga/${params.source}/${params.slug}`);
			if (res.ok) {
				const data = (await res.json()) as MockManga;
				setManga(data);
			}
			setIsLoading(false);
		};
		fetchManga();
	}, [params.source, params.slug]);

	if (isLoading) {
		return (
			<div className="space-y-6">
				<div className="flex gap-6">
					<div className="aspect-[3/4] w-36 animate-pulse rounded-xl bg-muted" />
					<div className="flex-1 space-y-3">
						<div className="h-6 w-3/4 animate-pulse rounded bg-muted" />
						<div className="h-4 w-1/2 animate-pulse rounded bg-muted" />
						<div className="h-20 w-full animate-pulse rounded bg-muted" />
					</div>
				</div>
			</div>
		);
	}

	if (!manga) {
		return (
			<div className="flex flex-col items-center py-20">
				<p className="text-muted-foreground">Manga not found</p>
			</div>
		);
	}

	return (
		<div className="space-y-8">
			{/* Hero section */}
			<div className="flex flex-col gap-6 sm:flex-row">
				<div className="relative aspect-[3/4] w-36 shrink-0 overflow-hidden rounded-xl shadow-2xl sm:w-48">
					<Image src={manga.cover} alt={manga.title} fill className="object-cover" sizes="192px" />
					<div className="absolute inset-0 shadow-[inset_0_0_40px_rgba(0,0,0,0.3)]" />
				</div>

				<div className="flex-1 space-y-3">
					<h1 className="font-heading text-2xl font-bold sm:text-3xl">{manga.title}</h1>

					<div className="flex items-center gap-2">
						<Badge variant="secondary" className="capitalize">
							{manga.source}
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

					<Button className="mt-4 cursor-pointer gap-2">
						<BookOpen className="size-4" />
						Add to Library
					</Button>
				</div>
			</div>

			{/* Chapter list */}
			<div className="space-y-4">
				<h2 className="font-heading text-xl font-semibold">Chapters ({manga.chapters.length})</h2>

				<div className="space-y-1">
					{manga.chapters
						.sort((a, b) => b.number - a.number)
						.map((chapter) => (
							<Link
								key={chapter.number}
								href={`/read/${manga.source}/${manga.slug}/${chapter.number}`}
								className="flex items-center justify-between rounded-lg px-4 py-3 transition-colors hover:bg-accent"
							>
								<div className="flex items-center gap-3">
									<span className="size-2 rounded-full bg-muted-foreground/30" />
									<span className="text-sm font-medium">Chapter {chapter.number}</span>
									{chapter.title !== `Chapter ${chapter.number}` && (
										<span className="text-sm text-muted-foreground">{chapter.title}</span>
									)}
								</div>
								<div className="flex items-center gap-2 text-xs text-muted-foreground">
									<Clock className="size-3" />
									{new Date(chapter.releasedAt).toLocaleDateString()}
								</div>
							</Link>
						))}
				</div>
			</div>
		</div>
	);
}
