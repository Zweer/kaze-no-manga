'use client';

import { Check, ChevronsUpDown } from 'lucide-react';
import * as React from 'react';
import { useDebounce } from 'use-debounce'; // Install: npm install use-debounce

import { addSelectedManga } from '@/actions/manga'; // Import the modified server action
import { Button } from '@/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandLoading,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { useToast } from '@/components/ui/use-toast';
import { cn } from '@/lib/utils';

interface SearchResult {
  sourceId: string;
  sourceName: string;
  slug: string;
  title: string;
  imageUrl?: string;
}

export function SearchAndAddManga() {
  const [open, setOpen] = React.useState(false);
  const [inputValue, setInputValue] = React.useState('');
  const [searchResults, setSearchResults] = React.useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = React.useState(false);
  const [isAdding, setIsAdding] = React.useState(false); // State for adding process
  const { toast } = useToast();

  // Debounce input value
  const [debouncedSearchQuery] = useDebounce(inputValue, 500); // 500ms debounce

  // Effect to fetch search results when debounced query changes
  React.useEffect(() => {
    if (debouncedSearchQuery.length < 2) {
      setSearchResults([]);
      setIsLoading(false);
      return;
    }

    let isActive = true; // Prevent state updates on unmounted component
    setIsLoading(true);

    const fetchResults = async () => {
      try {
        const response = await fetch(`/api/manga/search?q=${encodeURIComponent(debouncedSearchQuery)}`);
        if (!response.ok) {
          throw new Error(`Search failed: ${response.statusText}`);
        }
        const data: SearchResult[] = await response.json();
        if (isActive) {
          setSearchResults(data);
        }
      } catch (error) {
        console.error('Failed to fetch search results:', error);
        if (isActive) {
          setSearchResults([]); // Clear results on error
          toast({
            title: 'Search Error',
            description: 'Could not fetch manga suggestions.',
            variant: 'destructive',
          });
        }
      } finally {
        if (isActive) {
          setIsLoading(false);
        }
      }
    };

    fetchResults();

    return () => {
      isActive = false; // Cleanup on unmount or query change
    };
  }, [debouncedSearchQuery, toast]);

  // Handler when a suggestion is selected
  const handleSelect = async (result: SearchResult) => {
    setOpen(false); // Close the popover
    setInputValue(''); // Clear the input
    setSearchResults([]); // Clear results
    setIsAdding(true); // Set adding state

    try {
      const addResult = await addSelectedManga({
        sourceId: result.sourceId,
        sourceName: result.sourceName,
        slug: result.slug,
        title: result.title, // Pass title for better messages
      });

      toast({
        title: addResult.success ? 'Success' : 'Error',
        description: addResult.message,
        variant: addResult.success ? 'default' : 'destructive',
      });
    } catch (error) {
      console.error('Failed to call addSelectedManga action:', error);
      toast({
        title: 'Error',
        description: 'An unexpected error occurred while adding the manga.',
        variant: 'destructive',
      });
    } finally {
      setIsAdding(false); // Reset adding state
    }
  };

  return (
    <div className="flex items-center space-x-2 w-full max-w-md">
      {' '}
      {/* Adjust width as needed */}
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          {/* Using CommandInput directly inside PopoverTrigger can be tricky,
              so we often use a Button or Input as the trigger,
              and place CommandInput inside PopoverContent */}
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between text-muted-foreground" // Show placeholder text
            disabled={isAdding}
          >
            {isAdding ? 'Adding...' : 'Search for manga by title...'}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[--radix-popover-trigger-width] max-h-[--radix-popover-content-available-height] p-0">
          <Command shouldFilter={false}>
            {' '}
            {/* Disable built-in filtering, we fetch */}
            <CommandInput
              placeholder="Search manga title..."
              value={inputValue}
              onValueChange={setInputValue}
              disabled={isAdding}
            />
            <CommandList>
              {isLoading && <CommandLoading>Loading...</CommandLoading>}
              {!isLoading && !searchResults.length && debouncedSearchQuery.length >= 2 && (
                <CommandEmpty>No results found.</CommandEmpty>
              )}
              {searchResults.length > 0 && (
                <CommandGroup>
                  {searchResults.map(result => (
                    <CommandItem
                      key={`${result.sourceName}:${result.sourceId}`}
                      // Value not directly used for filtering, but useful for Command internals
                      value={`${result.title} (${result.sourceName})`}
                      onSelect={async () => handleSelect(result)}
                      className="flex items-center justify-between cursor-pointer"
                    >
                      <div className="flex items-center space-x-2 overflow-hidden mr-2">
                        {result.imageUrl && (
                          <img src={result.imageUrl} alt="" className="h-8 w-auto rounded object-cover flex-shrink-0" />
                        )}
                        <span className="truncate font-medium">{result.title}</span>
                      </div>
                      <span className="text-xs text-muted-foreground flex-shrink-0">{result.sourceName}</span>
                    </CommandItem>
                  ))}
                </CommandGroup>
              )}
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
      {/* Optional: Show a separate spinner if needed during add */}
      {/* {isAdding && <Spinner size="small" />} */}
    </div>
  );
}
