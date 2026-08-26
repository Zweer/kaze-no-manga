import Image from "next/image";
import Link from "next/link";
import type { MockManga } from "@/lib/mock";
import { cn } from "@/lib/utils";

interface MangaCardProps {
	manga: MockManga;
	className?: string;
}

export function MangaCard({ manga, className }: MangaCardProps) {
	return (
		<Link
			href={`/manga/${manga.source}/${manga.slug}`}
			className={cn("group", className)}
		>
			<div className="relative aspect-[3/4] w-full overflow-hidden rounded-xl bg-card">
				<Image
					src={manga.cover}
					alt={manga.title}
					fill
					className="object-cover transition-transform duration-300 group-hover:-translate-y-1 group-hover:scale-105"
					sizes="(max-width: 768px) 50vw, 200px"
				/>
				<div className="absolute inset-0 shadow-[inset_0_0_40px_rgba(0,0,0,0.3)]" />
			</div>
			<div className="mt-2 space-y-0.5">
				<p className="line-clamp-2 text-xs font-semibold leading-tight">{manga.title}</p>
				<p className="text-[10px] text-muted-foreground">{manga.source}</p>
			</div>
		</Link>
	);
}
