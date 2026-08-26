"use client";

import { useEffect, useState } from "react";
import { MangaCard } from "@/components/manga-card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { LibraryEntry } from "@/lib/mock";

const statuses = [
	{ value: "all", label: "All" },
	{ value: "reading", label: "Reading" },
	{ value: "plan_to_read", label: "Plan to Read" },
	{ value: "completed", label: "Completed" },
	{ value: "on_hold", label: "On Hold" },
	{ value: "dropped", label: "Dropped" },
];

export default function LibraryPage() {
	const [activeStatus, setActiveStatus] = useState("all");
	const [entries, setEntries] = useState<LibraryEntry[]>([]);
	const [isLoading, setIsLoading] = useState(true);

	useEffect(() => {
		const fetchLibrary = async () => {
			setIsLoading(true);
			const url =
				activeStatus === "all" ? "/api/mock/library" : `/api/mock/library?status=${activeStatus}`;
			const res = await fetch(url);
			const data = (await res.json()) as LibraryEntry[];
			setEntries(data);
			setIsLoading(false);
		};
		fetchLibrary();
	}, [activeStatus]);

	return (
		<div className="space-y-6">
			<div className="space-y-2">
				<h1 className="font-heading text-3xl font-bold">Library</h1>
				<div className="h-1 w-12 rounded-full bg-primary" />
			</div>

			<Tabs value={activeStatus} onValueChange={setActiveStatus}>
				<TabsList className="h-auto w-full flex-wrap justify-start gap-1">
					{statuses.map((status) => (
						<TabsTrigger key={status.value} value={status.value} className="cursor-pointer">
							{status.label}
						</TabsTrigger>
					))}
				</TabsList>
			</Tabs>

			{isLoading && (
				<div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
					{Array.from({ length: 4 }, (_, i) => (
						<div key={`skeleton-${i}`} className="space-y-2">
							<div className="aspect-[3/4] animate-pulse rounded-xl bg-muted" />
							<div className="h-3 w-3/4 animate-pulse rounded bg-muted" />
						</div>
					))}
				</div>
			)}

			{!isLoading && entries.length > 0 && (
				<div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
					{entries.map((entry) => (
						<MangaCard key={entry.manga.slug} manga={entry.manga} />
					))}
				</div>
			)}

			{!isLoading && entries.length === 0 && (
				<div className="flex flex-col items-center py-20">
					<p className="text-muted-foreground">Nothing here yet</p>
					<p className="mt-2 select-none font-heading text-4xl text-muted-foreground/10">
						まだ何もない
					</p>
				</div>
			)}
		</div>
	);
}
