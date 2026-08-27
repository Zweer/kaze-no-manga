"use client";

import { Search } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { ErrorState } from "@/components/error-state";
import { MangaCardSkeleton } from "@/components/manga-card-skeleton";
import { MangaCover } from "@/components/manga-cover";
import { Input } from "@/components/ui/input";
import type { MangaSummary, SearchResult } from "@/lib/scraper";

export default function SearchPage() {
	const [query, setQuery] = useState("");
	const [results, setResults] = useState<MangaSummary[]>([]);
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const fetchResults = () => {
		if (!query.trim()) {
			setResults([]);
			setError(null);
			return;
		}

		const timeout = setTimeout(async () => {
			setIsLoading(true);
			setError(null);
			try {
				const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
				if (!res.ok) {
					const data = await res.json();
					throw new Error(data.error ?? "Search failed");
				}
				const data = (await res.json()) as SearchResult;
				setResults(data.mangas);
			} catch (err) {
				setError(err instanceof Error ? err.message : "Search failed");
				setResults([]);
			} finally {
				setIsLoading(false);
			}
		}, 400);

		return () => clearTimeout(timeout);
	};

	// biome-ignore lint/correctness/useExhaustiveDependencies: debounce pattern
	useEffect(fetchResults, [query]);

	return (
		<div className="space-y-8">
			<div className="relative">
				<Search className="absolute top-1/2 left-4 size-5 -translate-y-1/2 text-muted-foreground" />
				<Input
					type="search"
					placeholder="Search manga..."
					aria-label="Search manga"
					value={query}
					onChange={(e) => setQuery(e.target.value)}
					className="h-14 rounded-xl pl-12 text-base"
				/>
			</div>

			{isLoading && <MangaCardSkeleton count={6} />}

			{error && <ErrorState message={error} onRetry={fetchResults} />}

			{!isLoading && !error && results.length > 0 && (
				<div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
					{results.map((manga) => (
						<Link
							key={manga.slug}
							href={`/manga/${manga.sourceId}/${manga.slug}`}
							className="group"
						>
							<MangaCover src={manga.cover} alt={manga.title} hoverable />
							<div className="mt-2 space-y-0.5">
								<p className="line-clamp-2 text-xs font-semibold leading-tight">{manga.title}</p>
								<p className="text-[10px] text-muted-foreground">{manga.sourceId}</p>
							</div>
						</Link>
					))}
				</div>
			)}

			{!isLoading && !error && query && results.length === 0 && (
				<div className="flex flex-col items-center py-20">
					<p className="text-muted-foreground">No results found</p>
				</div>
			)}

			{!query && (
				<div className="flex flex-col items-center py-20">
					<p className="select-none font-heading text-5xl text-muted-foreground/10 md:text-7xl">
						風の漫画
					</p>
					<p className="mt-4 text-sm text-muted-foreground">Search for your next journey</p>
				</div>
			)}
		</div>
	);
}
