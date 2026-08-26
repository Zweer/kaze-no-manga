"use client";

import { useState, useEffect } from "react";
import { Search } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import type { SearchResult, MangaSummary } from "@/lib/scraper";

export default function SearchPage() {
	const [query, setQuery] = useState("");
	const [results, setResults] = useState<MangaSummary[]>([]);
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
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
	}, [query]);

	return (
		<div className="space-y-8">
			<div className="relative">
				<Search className="absolute top-1/2 left-4 size-5 -translate-y-1/2 text-muted-foreground" />
				<Input
					type="search"
					placeholder="Search manga..."
					value={query}
					onChange={(e) => setQuery(e.target.value)}
					className="h-14 rounded-xl pl-12 text-base"
				/>
			</div>

			{isLoading && (
				<div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
					{Array.from({ length: 6 }, (_, i) => (
						<div key={`skeleton-${i}`} className="space-y-2">
							<div className="aspect-[3/4] animate-pulse rounded-xl bg-muted" />
							<div className="h-3 w-3/4 animate-pulse rounded bg-muted" />
						</div>
					))}
				</div>
			)}

			{error && (
				<div className="flex flex-col items-center py-12">
					<p className="text-sm text-destructive">{error}</p>
				</div>
			)}

			{!isLoading && !error && results.length > 0 && (
				<div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
					{results.map((manga) => (
						<Link
							key={manga.slug}
							href={`/manga/${manga.sourceId}/${manga.slug}`}
							className="group"
						>
							<div className="relative aspect-[3/4] w-full overflow-hidden rounded-xl bg-card">
								{manga.cover ? (
									<Image
										src={manga.cover}
										alt={manga.title}
										fill
										className="object-cover transition-transform duration-300 group-hover:-translate-y-1 group-hover:scale-105"
										sizes="(max-width: 768px) 50vw, 200px"
									/>
								) : (
									<div className="flex h-full items-center justify-center text-muted-foreground">
										No cover
									</div>
								)}
								<div className="absolute inset-0 shadow-[inset_0_0_40px_rgba(0,0,0,0.3)]" />
							</div>
							<div className="mt-2 space-y-0.5">
								<p className="line-clamp-2 text-xs font-semibold leading-tight">
									{manga.title}
								</p>
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
					<p className="mt-4 text-sm text-muted-foreground">
						Search for your next journey
					</p>
				</div>
			)}
		</div>
	);
}
