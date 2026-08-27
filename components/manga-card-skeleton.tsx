import { Skeleton } from "@/components/ui/skeleton";

interface MangaCardSkeletonProps {
	count?: number;
}

export function MangaCardSkeleton({ count = 4 }: MangaCardSkeletonProps) {
	return (
		<div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
			{Array.from({ length: count }, (_, i) => (
				<div key={`manga-skeleton-${i}`} className="space-y-2">
					<Skeleton className="aspect-[3/4] rounded-xl" />
					<Skeleton className="h-3 w-3/4" />
				</div>
			))}
		</div>
	);
}
