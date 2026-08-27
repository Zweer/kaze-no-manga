"use client";

import { AlertCircle, Search } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { ErrorState } from "@/components/error-state";
import { MangaCardSkeleton } from "@/components/manga-card-skeleton";
import { MangaCover } from "@/components/manga-cover";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import type { MangaSummary } from "@/lib/scraper";

interface SourceResult {
	sourceId: string;
	sourceName: string;
	mangas: MangaSummary[];
	error?: string;
}

interface SearchResponse {
	results: SourceResult[];
}

export default function SearchPage() {
	const [query, setQuery] = useState("");
	const [results, setResults] = useState<SourceResult[]>([]);
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
				const data = (await res.json()) as SearchResponse;
				setResults(data.results);
			} catch (err) {
				setError(err instanceof Error ? err.message : "Search failed");
				setResults([]);
			} finally {
				setIsLoading(false);
			}
		}, 400);

		return () => clearTimeout(timeout);
	};

	useEffect(fetchResults, [query]);

	const totalResults = results.reduce((sum, r) => sum + r.mangas.length, 0);

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
				<div className="space-y-8">
					{results.map((source) => (
						<SourceSection key={source.sourceId} source={source} />
					))}
				</div>
			)}

			{!isLoading && !error && query && totalResults === 0 && (
				<div className="flex flex-col items-center py-20">
					<p className="text-muted-foreground">No results found</p>
				</div>
			)}

			{!query && (
				<div className="flex flex-col items-center py-12">
					<Image
						src="/images/manga-wind.png"
						alt=""
						width={400}
						height={267}
						className="w-64 opacity-30 md:w-80"
					/>
					<p className="mt-4 text-sm text-muted-foreground">Search for your next journey</p>
				</div>
			)}
		</div>
	);
}

function SourceSection({ source }: { source: SourceResult }) {
	if (source.error) {
		return (
			<div className="space-y-3">
				<SourceHeader name={source.sourceName} count={0} />
				<div className="flex items-center gap-2 text-sm text-muted-foreground">
					<AlertCircle className="size-4 text-destructive" />
					<span>Failed to load results</span>
				</div>
			</div>
		);
	}

	if (source.mangas.length === 0) {
		return null; // Don't show sources with no results
	}

	return (
		<div className="space-y-3">
			<SourceHeader name={source.sourceName} count={source.mangas.length} />
			<div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
				{source.mangas.map((manga) => (
					<Link
						key={`${manga.sourceId}-${manga.slug}`}
						href={`/manga/${manga.sourceId}/${manga.slug}`}
						className="group"
					>
						<MangaCover src={manga.cover} alt={manga.title} hoverable />
						<div className="mt-2 space-y-0.5">
							<p className="line-clamp-2 text-xs font-semibold leading-tight">{manga.title}</p>
						</div>
					</Link>
				))}
			</div>
		</div>
	);
}

function SourceHeader({ name, count }: { name: string; count: number }) {
	return (
		<div className="flex items-center gap-2">
			<h2 className="font-heading text-lg font-semibold">{name}</h2>
			<Badge variant="secondary" className="text-xs">
				{count}
			</Badge>
			<div className="h-px flex-1 bg-gradient-to-r from-primary/20 to-transparent" />
		</div>
	);
}
