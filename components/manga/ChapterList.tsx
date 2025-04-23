import type { ChapterInfo } from '@/lib/db/actions/chapter'; // Import the type

import { Eye, EyeOff } from 'lucide-react'; // Icons for read/unread state (optional)
import Link from 'next/link';

import { formatDate } from '@/lib/utils'; // Assume a date formatting utility exists

interface ChapterListProps {
  chapters: ChapterInfo[];
  mangaSlug: string;
  lastChapterRead?: string | null;
}

export function ChapterList({
  chapters,
  mangaSlug,
  lastChapterRead,
}: ChapterListProps) {
  // TODO: Improve comparison logic for read status based on chapterNumber format
  const lastReadNumeric = Number.parseFloat(lastChapterRead || '-1');

  if (!chapters || chapters.length === 0) {
    return (
      <div className="text-center text-muted-foreground py-6 italic">
        No chapters available yet.
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {chapters.map((chapter) => {
        // Basic check if chapter is considered "read"
        const isRead = !Number.isNaN(lastReadNumeric) && chapter.chapterNumber <= lastReadNumeric;

        return (
          <Link
            // Generate the link to the reader page (we'll create this page next)
            href={`/manga/${mangaSlug}/reader/${chapter.chapterNumber}`} // Use chapter number in URL for now
            key={chapter.chapterNumber}
            className={`block p-3 rounded-md border transition-colors duration-150 ease-in-out ${
              isRead
                ? 'bg-muted/50 border-transparent hover:bg-muted/70' // Style for read chapters
                : 'bg-card hover:bg-muted/30 hover:border-border' // Style for unread chapters
            }`}
          >
            <div className="flex justify-between items-center gap-4">
              <div className="flex-1 min-w-0">
                {' '}
                {/* Allow text to truncate */}
                <p className={`font-medium truncate ${isRead ? 'text-muted-foreground' : 'text-foreground'}`}>
                  Chapter
                  {' '}
                  {chapter.chapterNumber}
                  {chapter.title && (
                    <span className="text-sm text-muted-foreground/80 ml-2 truncate hidden sm:inline">
                      {' '}
                      -
                      {chapter.title}
                    </span>
                  )}
                </p>
                {chapter.publishedAt && (
                  <p className="text-xs text-muted-foreground/80 mt-0.5">
                    {/* TODO: Format date nicely */}
                    Published:
                    {' '}
                    {formatDate(chapter.publishedAt)}
                  </p>
                )}
              </div>
              {/* Optional: Read/Unread Icon or Action Button */}
              <div className="flex-shrink-0">
                {isRead
                  ? (
                      <EyeOff className="h-4 w-4 text-muted-foreground" aria-label="Read" />
                    )
                  : (
                      <Eye className="h-4 w-4 text-primary" aria-label="Unread" />
                    )}
                {/* Or add a button to mark as read/unread later */}
              </div>
            </div>
          </Link>
        );
      })}
      {/* Optional: Add pagination or "Load More" if list is very long */}
    </div>
  );
}
