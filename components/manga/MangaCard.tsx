import Image from 'next/image';
import Link from 'next/link';

import { Badge } from '@/components/ui/badge'; // Import Badge component
import { cn } from '@/lib/utils';

interface MangaCardProps {
  slug: string;
  title: string;
  coverUrl: string | null;
  lastChapterRead: number | null;
  lastChapterChecked: number | null;
  readingStatus: string | null;
  className?: string;
}

// Helper to compare chapter strings (basic numeric comparison)
// TODO: Improve this to handle complex chapter numbers (e.g., '10.5', 'Extra')
function isNewChapterAvailable(lastRead: number | null, lastChecked: number | null): boolean {
  if (!lastChecked) {
    return false; // No checked chapter info
  }

  // Check if checkedNum is a valid number and greater than readNum
  return !Number.isNaN(lastChecked) && lastChecked > (lastRead ?? 0);
}

export function MangaCard({
  slug,
  title,
  coverUrl,
  lastChapterRead,
  lastChapterChecked,
  readingStatus,
  className,
}: MangaCardProps) {
  const hasNewChapter = isNewChapterAvailable(lastChapterRead, lastChapterChecked);

  return (
    <Link href={`/manga/${slug}`} className={cn('group block', className)}>
      <div className="relative aspect-[2/3] w-full overflow-hidden rounded-md bg-muted shadow-md transition-shadow group-hover:shadow-lg">
        {/* New Chapter Badge */}
        {hasNewChapter && (
          <Badge
            variant="default" // Use primary color or a specific 'new' variant
            className="absolute top-2 right-2 z-10 !px-1.5 !py-0.5 text-xs animate-pulse" // Smaller padding, pulse animation
          >
            NEW
          </Badge>
        )}

        {/* Cover Image */}
        {coverUrl
          ? (
              <Image
                src={coverUrl}
                alt={`Cover for ${title}`}
                fill // Use fill to cover the container
                sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 20vw" // Optimize image loading based on viewport
                className="object-cover transition-transform group-hover:scale-105" // Zoom effect on hover
              />
            )
          : (
              <div className="flex h-full w-full items-center justify-center">
                <span className="text-sm text-muted-foreground">No Image</span>
              </div>
            )}
        {/* Optional: Overlay with reading status */}
        {readingStatus && (
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 via-black/30 to-transparent p-2 pt-4">
            <Badge variant="secondary" className="text-xs truncate">{readingStatus}</Badge>
          </div>
        )}
      </div>
      {/* Manga Title */}
      <div className="mt-2">
        <h3 className="text-sm font-medium truncate group-hover:text-primary">
          {title}
        </h3>
        {/* Optional: Progress indicator */}
        {/* <p className="text-xs text-muted-foreground">Read: {lastChapterRead ?? '0'}</p> */}
      </div>
    </Link>
  );
}
