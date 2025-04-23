'use client';

import { Check, Loader2, Plus } from 'lucide-react'; // Icons
import { useSession } from 'next-auth/react'; // Use client-side session hook
import * as React from 'react';

import { Button } from '@/components/ui/button';
import { addMangaToLibrary, removeMangaFromLibrary } from '@/lib/db/actions/library'; // Import server actions
import { cn } from '@/lib/utils'; // Utility for class names

interface LibraryToggleButtonProps extends React.HTMLAttributes<HTMLButtonElement> {
  mangaSlug: string;
  initialIsInLibrary: boolean; // Pass initial state from server component
}

export function LibraryToggleButton({
  mangaSlug,
  initialIsInLibrary,
  className,
  ...props
}: LibraryToggleButtonProps) {
  const { data: _session, status } = useSession(); // Check auth status client-side
  const [isInLibrary, setIsInLibrary] = React.useState(initialIsInLibrary);
  const [isLoading, setIsLoading] = React.useState(false);
  // Optimistic update: Assume success immediately for better UX
  const [isPending, startTransition] = React.useTransition();

  const handleToggleLibrary = async () => {
    if (status !== 'authenticated' || isLoading || isPending) {
      // Prevent action if not logged in or already processing
      // Optionally redirect to login or show message
      if (status !== 'authenticated') {
        // Consider prompting login, e.g., using signIn()
        console.log('User not authenticated');
      }
      return;
    }

    setIsLoading(true); // Indicate loading state visually
    const currentlyInLibrary = isInLibrary; // Store current state before optimistic update

    // Optimistic Update - change UI immediately
    startTransition(() => {
      setIsInLibrary(!currentlyInLibrary);
    });

    try {
      let result: { success: boolean; error?: string };
      if (currentlyInLibrary) {
        // Attempt to remove
        result = await removeMangaFromLibrary(mangaSlug);
      } else {
        // Attempt to add
        result = await addMangaToLibrary(mangaSlug);
      }

      // Handle result from server action
      if (!result.success) {
        console.error('Failed to update library:', result.error);
        // Revert optimistic update on failure
        setIsInLibrary(currentlyInLibrary);
        // TODO: Show error toast to user
      }
      // On success, the optimistic update is already correct
      // Cache revalidation handled by the server action will update data eventually
    } catch (error) {
      console.error('Error toggling library status:', error);
      // Revert optimistic update on error
      setIsInLibrary(currentlyInLibrary);
      // TODO: Show error toast to user
    } finally {
      setIsLoading(false); // Stop loading indicator
    }
  };

  // Don't render button if auth status is loading
  if (status === 'loading') {
    return (
      <Button variant="outline" size="sm" disabled className={cn(className)}>
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        {' '}
        Loading
      </Button>
    );
  }
  // Optionally hide button completely if not logged in, or show a disabled "Login to Add"
  if (status !== 'authenticated') {
    return (
      <Button variant="outline" size="sm" disabled className={cn(className)}>
        <Plus className="mr-2 h-4 w-4" />
        {' '}
        Add to Library
      </Button>
    ); // Example disabled state
  }

  return (
    <Button
      variant={isInLibrary ? 'default' : 'outline'} // Change style based on state
      size="sm"
      onClick={handleToggleLibrary}
      disabled={isLoading || isPending} // Disable while loading/transitioning
      className={cn(className)}
      {...props}
    >
      {isLoading || isPending
        ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          )
        : isInLibrary
          ? (
              <Check className="mr-2 h-4 w-4" />
            )
          : (
              <Plus className="mr-2 h-4 w-4" />
            )}
      {isInLibrary ? 'In Library' : 'Add to Library'}
    </Button>
  );
}
