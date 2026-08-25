"use client";

import { Search } from "lucide-react";
import { useEffect, useState } from "react";
import { MangaCard } from "@/components/manga-card";
import { Input } from "@/components/ui/input";
import type { MockManga } from "@/lib/mock";

export default function SearchPage() {
	const [query, setQuery] = useState("");
	const [results, setResults] = useState<MockManga[]>([]);
	const [isLoading, setIsLoading] = useState(false);

	useEffect(() => {
		if (!query.trim()) {
			setResults([]);
			return;
		}

		const timeout = setTimeout(async () => {
			setIsLoading(true);
			const res = await fetch(`/api/mock/search?q=${encodeURIComponent(query)}`);
			const data = (await res.json()) as MockManga[];
			setResults(data);
			setIsLoading(false);
		}, 300);

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

			{!isLoading && results.length > 0 && (
				<div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
					{results.map((manga) => (
						<MangaCard key={manga.slug} manga={manga} />
					))}
				</div>
			)}

			{!isLoading && query && results.length === 0 && (
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
