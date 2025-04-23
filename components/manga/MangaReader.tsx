// components/reader/MangaReader.tsx
'use client';

import { CheckCircle, ChevronLeft, ChevronRight, Loader2, X } from 'lucide-react';
import { useSession } from 'next-auth/react'; // Hook to get user session
import Image from 'next/image'; // O standard img
import Link from 'next/link';
import { useCallback, useEffect, useRef, useState } from 'react';

import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress'; // Make sure to install: npx shadcn-ui@latest add progress
import { updateReadingProgress } from '@/lib/db/actions/library'; // Server action to update progress

interface MangaReaderProps {
  mangaTitle: string;
  chapterNumber: number; // The identifier for the current chapter (e.g., '10', '10-5')
  imageUrls: string[]; // Array of image URLs for the chapter
  mangaSlug: string; // Slug for linking back to manga detail page
  mangaId: string; // UUID of the canonical manga for updating progress
  // Optional props for chapter navigation (to be implemented)
  // prevChapterNumber?: string | null;
  // nextChapterNumber?: string | null;
}

export function MangaReader({
  mangaTitle,
  chapterNumber,
  imageUrls,
  mangaSlug,
  mangaId,
  // prevChapterNumber,
  // nextChapterNumber,
}: MangaReaderProps) {
  const { data: session, status: sessionStatus } = useSession(); // Get session data and status
  const userId = session?.user?.id; // Get user ID if logged in

  const [showControls, setShowControls] = useState(true); // State for showing/hiding header/footer controls
  const [progress, setProgress] = useState(0); // State for reading progress percentage
  const [isUpdatingProgress, setIsUpdatingProgress] = useState(false); // State for loading indicator when saving progress
  const [updateSuccess, setUpdateSuccess] = useState(false); // State to show success message after saving progress
  const endOfChapterRef = useRef<HTMLDivElement>(null); // Ref for the element at the end of images used as trigger
  const progressUpdateTriggered = useRef(false); // Ref to ensure progress update is triggered only once per chapter load

  // --- Effect for Showing/Hiding Controls ---
  useEffect(() => {
    let controlsTimeoutId: NodeJS.Timeout;
    const handleScroll = () => {
      setShowControls(false); // Hide controls immediately on scroll
      clearTimeout(controlsTimeoutId);
      // Set a timeout to show controls again after scrolling stops
      controlsTimeoutId = setTimeout(() => setShowControls(true), 1500); // Show after 1.5s of inactivity
    };
    // Also toggle controls on click/tap anywhere in the reader area (optional)
    // const handleClick = () => setShowControls(prev => !prev);
    // const container = readerContainerRef.current; // Need a ref on the main div if using click toggle

    window.addEventListener('scroll', handleScroll, { passive: true });
    // container?.addEventListener('click', handleClick);

    // Cleanup listeners and timeout on component unmount
    return () => {
      window.removeEventListener('scroll', handleScroll);
      // container?.removeEventListener('click', handleClick);
      clearTimeout(controlsTimeoutId);
    };
  }, []); // Run only once on mount

  // --- Effect for Calculating Reading Progress Bar ---
  useEffect(() => {
    const handleProgress = () => {
      const docElement = document.documentElement; // Use documentElement for full page scroll context
      const scrollPosition = docElement.scrollTop;
      // Total scrollable height = Full document height - Viewport height
      const totalHeight = docElement.scrollHeight - docElement.clientHeight;

      if (totalHeight <= 0) { // If content doesn't fill the screen or no scrollbar
        setProgress(100); // Consider it fully visible
        return;
      }

      // Calculate progress percentage, ensuring it's between 0 and 100
      const currentProgress = Math.min(100, Math.max(0, (scrollPosition / totalHeight) * 100));
      setProgress(currentProgress);
    };

    window.addEventListener('scroll', handleProgress, { passive: true });
    handleProgress(); // Calculate initial progress on load

    // Cleanup listener on component unmount
    return () => window.removeEventListener('scroll', handleProgress);
    // Dependency array: recalculate only if the image list changes (unlikely mid-chapter)
  }, [imageUrls]);

  // --- Callback Function to Update Reading Progress ---
  const handleChapterComplete = useCallback(async () => {
    // Guard clauses: Do nothing if...
    if (progressUpdateTriggered.current // Already triggered for this chapter load
      || isUpdatingProgress // Update is already in progress
      || sessionStatus !== 'authenticated' // User is not logged in
      || !userId // User ID is missing
      || !mangaId) { // Manga ID is missing
      return;
    }

    progressUpdateTriggered.current = true; // Prevent further triggers for this load
    setIsUpdatingProgress(true); // Show loading state
    setUpdateSuccess(false); // Reset success state
    console.log(`End of chapter ${chapterNumber} reached by user ${userId} for manga ${mangaId}. Calling update action...`);

    try {
      // Call the Server Action
      const result = await updateReadingProgress(mangaId, chapterNumber, mangaSlug);

      if (result.success) {
        console.log('Server action updateReadingProgress succeeded.');
        setUpdateSuccess(true); // Show success feedback
      } else {
        console.error('Server action updateReadingProgress failed:', result.error);
        progressUpdateTriggered.current = false; // Allow user to potentially trigger again if there was a recoverable error
        // TODO: Implement user-facing error message (e.g., toast notification)
      }
    } catch (error) {
      console.error('Error calling updateReadingProgress server action:', error);
      progressUpdateTriggered.current = false; // Allow retry on unexpected errors
      // TODO: Implement user-facing error message
    } finally {
      setIsUpdatingProgress(false); // Hide loading state regardless of outcome
    }
  // Dependencies for the callback function
  }, [userId, mangaId, chapterNumber, mangaSlug, isUpdatingProgress, sessionStatus]);

  // --- Effect for Intersection Observer (Triggers Chapter Complete) ---
  useEffect(() => {
    // Don't set up observer if user isn't logged in or update already happened
    if (sessionStatus !== 'authenticated' || progressUpdateTriggered.current) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        // If the target element is intersecting (visible in viewport)
        if (entry.isIntersecting) {
          // Call the function to update progress
          handleChapterComplete();
          // Optional: Stop observing after the first time it becomes visible
          // observer.unobserve(entry.target);
        }
      },
      {
        root: null, // Observe relative to the viewport
        rootMargin: '0px', // No margin around the viewport
        threshold: 0.1, // Trigger when at least 10% of the target element is visible
      },
    );

    const targetElement = endOfChapterRef.current; // Get the DOM element reference

    // Start observing the target element if it exists
    if (targetElement) {
      observer.observe(targetElement);
    }

    // Cleanup function: Stop observing when the component unmounts or dependencies change
    return () => {
      if (targetElement) {
        observer.unobserve(targetElement);
      }
    };
  // Re-run this effect if the callback function or authentication status changes
  }, [handleChapterComplete, sessionStatus]);

  // --- Render Error State if images failed to load ---
  if (!imageUrls || imageUrls.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen text-center px-4">
        {/* Minimal header for error state */}
        <div className="fixed top-0 left-0 right-0 h-14 bg-background/80 backdrop-blur z-10 flex items-center justify-between px-4 border-b">
          <h1 className="text-lg font-semibold truncate">
            {mangaTitle}
            {' '}
            - Ch.
            {' '}
            {chapterNumber}
          </h1>
          <Link href={mangaSlug ? `/manga/${mangaSlug}` : '/'} passHref aria-label="Back to manga details">
            <Button variant="ghost" size="icon"><X className="h-5 w-5" /></Button>
          </Link>
        </div>
        <div className="pt-20">
          {' '}
          {/* Offset content below fixed header */}
          <p className="text-destructive text-lg font-semibold mb-2">Error Loading Chapter</p>
          <p className="text-muted-foreground">
            Could not fetch images for this chapter. The source might be unavailable.
          </p>
          <Link href={mangaSlug ? `/manga/${mangaSlug}` : '/'} passHref>
            <Button variant="outline" className="mt-4">Back to Manga Details</Button>
          </Link>
        </div>
      </div>
    );
  }

  // --- Render Main Reader UI ---
  return (
    <div className="reader-content bg-black flex flex-col items-center">
      {/* Fixed Header Controls */}
      <div className={`fixed top-0 left-0 right-0 z-20 transition-opacity duration-300 ${showControls ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
        <div className="bg-gradient-to-b from-black/70 via-black/50 to-transparent p-3 flex justify-between items-center text-white">
          {/* Previous Chapter Button */}
          <Button size="sm" variant="ghost" /* disabled={!prevChapterNumber} */ className="text-white hover:bg-white/20">
            <ChevronLeft className="h-5 w-5 mr-1" />
            {' '}
            Prev
          </Button>
          {/* Title */}
          <div className="text-center mx-2">
            <h1 className="text-base font-semibold truncate">{mangaTitle}</h1>
            <p className="text-xs opacity-80">
              Chapter
              {chapterNumber}
            </p>
          </div>
          {/* Next Chapter Button */}
          <Button size="sm" variant="ghost" /* disabled={!nextChapterNumber} */ className="text-white hover:bg-white/20">
            Next
            {' '}
            <ChevronRight className="h-5 w-5 ml-1" />
          </Button>
        </div>
        {/* Progress Bar */}
        <Progress value={progress} className="h-1 w-full [&>div]:bg-primary bg-white/20" />
      </div>

      {/* Manga Pages */}
      <div className="w-full max-w-screen-md">
        {' '}
        {/* Optional: Constrain width of images */}
        {imageUrls.map((url, index) => (
          // Using standard <img> for better browser handling in readers
          <Image
            key={index}
            src={url}
            alt={`Page ${index + 1} of ${mangaTitle} Chapter ${chapterNumber}`}
            className="max-w-full h-auto block mx-auto" // Center images if container is wider
            loading="lazy" // Enable browser native lazy loading
          />
        ))}
      </div>

      {/* End of Chapter Trigger Element & Feedback/Next Button */}
      <div ref={endOfChapterRef} className="py-10 text-center text-muted-foreground min-h-[120px] flex flex-col items-center justify-center w-full">
        {' '}
        {/* Give it space */}
        {isUpdatingProgress && ( // Show loading indicator
          <div className="flex items-center mb-2 text-sm">
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
            <span>Saving progress...</span>
          </div>
        )}
        {updateSuccess && !isUpdatingProgress && ( // Show success indicator
          <div className="flex items-center mb-2 text-green-500 text-sm">
            <CheckCircle className="h-4 w-4 mr-2" />
            <span>Progress saved!</span>
          </div>
        )}
        {!isUpdatingProgress && ( // Show end text and button only when not loading
          <>
            <div className="mb-4">
              End of Chapter
              {chapterNumber}
            </div>
            {/* TODO: Implement Next Chapter Button functionality */}
            <div className="mt-2">
              <Button variant="outline">
                Next Chapter
                {' '}
                <ChevronRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
