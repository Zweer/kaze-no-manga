"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowDownAZ, Clock, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { StatusSelect } from "@/components/status-select";
import { useSession } from "@/lib/auth-client";

interface LibraryEntry {
	id: string;
	status: string;
	addedAt: string;
	manga: {
		id: string;
		source: string;
		slug: string;
		title: string;
		cover: string;
		status: string;
	};
}

const filterTabs = [
	{ value: "all", label: "All" },
	{ value: "plan_to_read", label: "Plan to Read" },
	{ value: "completed", label: "Completed" },
	{ value: "on_hold", label: "On Hold" },
	{ value: "dropped", label: "Dropped" },
];

export default function LibraryPage() {
	const { data: session, isPending: isSessionLoading } = useSession();
	const [entries, setEntries] = useState<LibraryEntry[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [activeStatus, setActiveStatus] = useState("all");
	const [sort, setSort] = useState<"recently_added" | "alphabetical">("recently_added");
	const [removingId, setRemovingId] = useState<string | null>(null);

	const fetchLibrary = useCallback(async () => {
		if (!session?.user) return;
		setIsLoading(true);
		const params = new URLSearchParams();
		if (activeStatus !== "all") params.set("status", activeStatus);
		params.set("sort", sort);

		const res = await fetch(`/api/library?${params.toString()}`);
		if (res.ok) {
			const data = (await res.json()) as LibraryEntry[];
			setEntries(data);
		}
		setIsLoading(false);
	}, [session, activeStatus, sort]);

	useEffect(() => {
		if (isSessionLoading) return;
		if (!session?.user) {
			setIsLoading(false);
			return;
		}
		fetchLibrary();
	}, [isSessionLoading, session, fetchLibrary]);

	const handleRemove = async (id: string) => {
		setRemovingId(id);
		const res = await fetch(`/api/library/${id}`, { method: "DELETE" });
		if (res.ok) {
			setEntries((prev) => prev.filter((e) => e.id !== id));
		}
		setRemovingId(null);
	};

	const handleStatusChange = async (entryId: string, newStatus: string) => {
		const res = await fetch(`/api/library/${entryId}`, {
			method: "PATCH",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ status: newStatus }),
		});
		if (res.ok) {
			if (activeStatus !== "all" && newStatus !== activeStatus) {
				// Remove from current view if filter is active and status changed
				setEntries((prev) => prev.filter((e) => e.id !== entryId));
			} else {
				setEntries((prev) =>
					prev.map((e) => (e.id === entryId ? { ...e, status: newStatus } : e)),
				);
			}
		}
	};

	if (isLoading || isSessionLoading) {
		return (
			<div className="space-y-6">
				<div className="space-y-2">
					<h1 className="font-heading text-3xl font-bold">Library</h1>
					<div className="h-1 w-12 rounded-full bg-primary" />
				</div>
				<div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
					{Array.from({ length: 4 }, (_, i) => (
						<div key={`skeleton-${i}`} className="space-y-2">
							<div className="aspect-[3/4] animate-pulse rounded-xl bg-muted" />
							<div className="h-3 w-3/4 animate-pulse rounded bg-muted" />
						</div>
					))}
				</div>
			</div>
		);
	}

	return (
		<div className="space-y-6">
			<div className="space-y-2">
				<h1 className="font-heading text-3xl font-bold">Library</h1>
				<div className="h-1 w-12 rounded-full bg-primary" />
			</div>

			{/* Filter tabs + sort */}
			<div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
				<Tabs value={activeStatus} onValueChange={setActiveStatus}>
					<TabsList className="h-auto flex-wrap justify-start gap-1">
						{filterTabs.map((tab) => (
							<TabsTrigger key={tab.value} value={tab.value} className="cursor-pointer">
								{tab.label}
							</TabsTrigger>
						))}
					</TabsList>
				</Tabs>

				<Button
					variant="ghost"
					size="sm"
					className="cursor-pointer gap-2 self-start text-muted-foreground"
					onClick={() =>
						setSort((prev) =>
							prev === "recently_added" ? "alphabetical" : "recently_added",
						)
					}
				>
					{sort === "alphabetical" ? (
						<>
							<ArrowDownAZ className="size-4" />
							A-Z
						</>
					) : (
						<>
							<Clock className="size-4" />
							Recent
						</>
					)}
				</Button>
			</div>

			{/* Grid */}
			{entries.length > 0 && (
				<div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
					{entries.map((entry) => (
						<div key={entry.id} className="group relative">
							<Link
								href={`/manga/${entry.manga.source}/${entry.manga.slug}`}
								className="block"
							>
								<div className="relative aspect-[3/4] w-full overflow-hidden rounded-xl bg-card">
									{entry.manga.cover ? (
										<Image
											src={entry.manga.cover}
											alt={entry.manga.title}
											fill
											className="object-cover transition-transform duration-300 group-hover:-translate-y-1 group-hover:scale-105"
											sizes="(max-width: 768px) 50vw, 200px"
											unoptimized
										/>
									) : (
										<div className="flex h-full items-center justify-center text-muted-foreground">
											No cover
										</div>
									)}
									<div className="absolute inset-0 shadow-[inset_0_0_40px_rgba(0,0,0,0.3)]" />
								</div>
								<div className="mt-2">
									<p className="line-clamp-2 text-xs font-semibold leading-tight">
										{entry.manga.title}
									</p>
								</div>
							</Link>

							{/* Status dropdown */}
							<div className="mt-1" onClick={(e) => e.stopPropagation()}>
								<StatusSelect
									value={entry.status}
									onValueChange={(v) => handleStatusChange(entry.id, v)}
									size="sm"
								/>
							</div>

							{/* Remove button */}
							<Button
								variant="ghost"
								size="sm"
								className="absolute top-2 right-2 size-8 cursor-pointer rounded-full bg-black/60 p-0 opacity-0 backdrop-blur-sm transition-opacity hover:bg-destructive group-hover:opacity-100"
								onClick={() => handleRemove(entry.id)}
								disabled={removingId === entry.id}
							>
								<Trash2 className="size-3.5" />
							</Button>
						</div>
					))}
				</div>
			)}

			{entries.length === 0 && (
				<div className="flex flex-col items-center py-20">
					<p className="text-muted-foreground">
						{activeStatus === "all" ? "Nothing here yet" : "No manga with this status"}
					</p>
					<p className="mt-2 select-none font-heading text-4xl text-muted-foreground/10">
						まだ何もない
					</p>
				</div>
			)}
		</div>
	);
}
