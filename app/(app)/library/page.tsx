"use client";

import { ArrowDownAZ, Clock, Trash2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { MangaCardSkeleton } from "@/components/manga-card-skeleton";
import { MangaCover } from "@/components/manga-cover";
import { PageHeading } from "@/components/page-heading";
import { StatusSelect } from "@/components/status-select";
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
	AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
	{ value: "reading", label: "Reading" },
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

	const fetchLibrary = useCallback(async () => {
		if (!session?.user) return;
		setIsLoading(true);
		const params = new URLSearchParams();
		if (activeStatus !== "all") params.set("status", activeStatus);
		params.set("sort", sort);

		try {
			const res = await fetch(`/api/library?${params.toString()}`);
			if (res.ok) {
				const data = (await res.json()) as LibraryEntry[];
				setEntries(data);
			} else {
				toast.error("Failed to load library");
			}
		} catch {
			toast.error("Failed to load library");
		} finally {
			setIsLoading(false);
		}
	}, [session, activeStatus, sort]);

	useEffect(() => {
		if (isSessionLoading) return;
		if (!session?.user) {
			setIsLoading(false);
			return;
		}
		fetchLibrary();
	}, [isSessionLoading, session, fetchLibrary]);

	const handleRemove = async (id: string, title: string) => {
		try {
			const res = await fetch(`/api/library/${id}`, { method: "DELETE" });
			if (res.ok) {
				setEntries((prev) => prev.filter((e) => e.id !== id));
				toast.success(`Removed "${title}" from library`);
			} else {
				toast.error("Failed to remove from library");
			}
		} catch {
			toast.error("Failed to remove from library");
		}
	};

	const handleStatusChange = async (entryId: string, newStatus: string) => {
		try {
			const res = await fetch(`/api/library/${entryId}`, {
				method: "PATCH",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ status: newStatus }),
			});
			if (res.ok) {
				if (activeStatus !== "all" && newStatus !== activeStatus) {
					setEntries((prev) => prev.filter((e) => e.id !== entryId));
				} else {
					setEntries((prev) =>
						prev.map((e) => (e.id === entryId ? { ...e, status: newStatus } : e)),
					);
				}
				toast.success("Status updated");
			} else {
				toast.error("Failed to update status");
			}
		} catch {
			toast.error("Failed to update status");
		}
	};

	if (isLoading || isSessionLoading) {
		return (
			<div className="space-y-6">
				<PageHeading title="Library" />
				<MangaCardSkeleton />
			</div>
		);
	}

	return (
		<div className="space-y-6">
			<PageHeading title="Library" />

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
					aria-label={sort === "alphabetical" ? "Sort by recently added" : "Sort alphabetically"}
					onClick={() =>
						setSort((prev) => (prev === "recently_added" ? "alphabetical" : "recently_added"))
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

			{entries.length > 0 && (
				<div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
					{entries.map((entry) => (
						<div key={entry.id} className="group relative">
							<Link href={`/manga/${entry.manga.source}/${entry.manga.slug}`} className="block">
								<MangaCover src={entry.manga.cover} alt={entry.manga.title} hoverable />
								<div className="mt-2">
									<p className="line-clamp-2 text-xs font-semibold leading-tight">
										{entry.manga.title}
									</p>
								</div>
							</Link>

							<div className="mt-1" onClick={(e) => e.stopPropagation()}>
								<StatusSelect
									value={entry.status}
									onValueChange={(v) => handleStatusChange(entry.id, v)}
									size="sm"
								/>
							</div>

							<AlertDialog>
								<AlertDialogTrigger>
									<Button
										variant="ghost"
										size="sm"
										aria-label={`Remove ${entry.manga.title} from library`}
										className="absolute top-2 right-2 size-8 cursor-pointer rounded-full bg-black/60 p-0 opacity-0 backdrop-blur-sm transition-opacity hover:bg-destructive group-hover:opacity-100"
									>
										<Trash2 className="size-3.5" />
									</Button>
								</AlertDialogTrigger>
								<AlertDialogContent>
									<AlertDialogHeader>
										<AlertDialogTitle>Remove from library?</AlertDialogTitle>
										<AlertDialogDescription>
											This will remove &quot;{entry.manga.title}&quot; from your library. Your
											reading progress will be kept.
										</AlertDialogDescription>
									</AlertDialogHeader>
									<AlertDialogFooter>
										<AlertDialogCancel className="cursor-pointer">Cancel</AlertDialogCancel>
										<AlertDialogAction
											className="cursor-pointer"
											onClick={() => handleRemove(entry.id, entry.manga.title)}
										>
											Remove
										</AlertDialogAction>
									</AlertDialogFooter>
								</AlertDialogContent>
							</AlertDialog>
						</div>
					))}
				</div>
			)}

			{entries.length === 0 && (
				<div className="flex flex-col items-center py-20">
					<p className="text-muted-foreground">
						{activeStatus === "all" ? "Nothing here yet" : "No manga with this status"}
					</p>
					<Image
						src="/images/manga-wind.png"
						alt=""
						width={400}
						height={267}
						className="mt-4 w-48 opacity-20 md:w-64"
					/>
				</div>
			)}
		</div>
	);
}
