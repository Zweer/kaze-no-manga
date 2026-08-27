import Image from "next/image";
import { cn } from "@/lib/utils";

interface MangaCoverProps {
	src: string;
	alt: string;
	sizes?: string;
	className?: string;
	hoverable?: boolean;
}

export function MangaCover({
	src,
	alt,
	sizes = "(max-width: 768px) 50vw, 200px",
	className,
	hoverable = false,
}: MangaCoverProps) {
	return (
		<div
			className={cn("relative aspect-[3/4] w-full overflow-hidden rounded-xl bg-card", className)}
		>
			{src ? (
				<Image
					src={src}
					alt={alt}
					fill
					className={cn(
						"object-cover",
						hoverable &&
							"transition-transform duration-300 group-hover:-translate-y-1 group-hover:scale-105",
					)}
					sizes={sizes}
					unoptimized
				/>
			) : (
				<div className="flex h-full items-center justify-center text-muted-foreground">
					No cover
				</div>
			)}
			<div className="absolute inset-0 shadow-[inset_0_0_40px_rgba(0,0,0,0.3)]" />
		</div>
	);
}
