'use client';

import type { MangaSearchResult } from '@/lib/manga/types';

import { AlertCircle, Check, Loader2, Plus } from 'lucide-react';
import Image from 'next/image';
import * as React from 'react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { importMangaMetadataAction } from '@/lib/db/actions/import';

interface ExternalMangaResultCardProps {
  result: MangaSearchResult;
  onImportSuccess?: (slug: string) => void;
}

export function ExternalMangaResultCard({ result, onImportSuccess }: ExternalMangaResultCardProps) {
  const [isImporting, setIsImporting] = React.useState(false);
  const [importStatus, setImportStatus] = React.useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);

  const handleImportClick = async () => {
    setIsImporting(true);
    setImportStatus('idle');
    setErrorMessage(null);

    try {
      // Call the server action to import this specific manga
      const importResult = await importMangaMetadataAction({
        sourceId: result.sourceId,
        sourceName: result.sourceName,
        title: result.title,
      });

      if (importResult.success) {
        setImportStatus('success');
        // Optionally call the callback with the new slug
        if (onImportSuccess) {
          onImportSuccess(importResult.slug);
        }
        // Keep button disabled or change its state permanently? For now, success state.
      } else {
        setImportStatus('error');
        setErrorMessage(importResult.error || 'Import failed.');
        // Keep button enabled to allow retry? Or disable permanently?
      }
    } catch (errorRaw: any) {
      const error = errorRaw as Error;
      console.error('Error importing manga:', error);

      setImportStatus('error');
      setErrorMessage(error.message || 'An unexpected error occurred during import.');
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <Card className="flex flex-col h-full">
      {' '}
      {/* Ensure card takes full height in grid cell */}
      <CardHeader className="p-3 pb-1">
        {/* Optional: Display cover image if available */}
        {result.coverUrl && (
          <div className="relative aspect-[2/3] w-full mb-2 rounded overflow-hidden bg-muted">
            <Image
              src={result.coverUrl}
              alt={`Cover for ${result.title}`}
              fill
              sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, 25vw"
              className="object-cover"
            />
          </div>
        )}
        <CardTitle className="text-base font-medium leading-tight truncate" title={result.title}>
          {result.title}
        </CardTitle>
        <p className="text-xs text-muted-foreground">
          Source:
          {result.sourceName}
        </p>
      </CardHeader>
      <CardContent className="p-3 pt-0 flex-grow">
        {' '}
        {/* Allow content to grow */}
        {/* Optionally display Author or other small details here */}
        {/*
        {result.author && (
          <p className="text-xs text-muted-foreground truncate">
            Author:
            {result.author}
          </p>
        )}
        */}
      </CardContent>
      <CardFooter className="p-3 pt-1">
        {importStatus === 'success'
          ? (
              <Button size="sm" variant="ghost" disabled className="w-full text-green-600">
                <Check className="mr-2 h-4 w-4" />
                Imported
              </Button>
            )
          : importStatus === 'error'
            ? (
                <div className="w-full text-center">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleImportClick} // Allow retry
                    disabled={isImporting}
                    className="w-full border-destructive text-destructive hover:bg-destructive/10 mb-1"
                  >
                    {isImporting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <AlertCircle className="mr-2 h-4 w-4" />}
                    Retry Import
                  </Button>
                  <p className="text-xs text-destructive truncate" title={errorMessage || undefined}>{errorMessage}</p>
                </div>
              )
            : (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleImportClick}
                  disabled={isImporting}
                  className="w-full"
                >
                  {isImporting
                    ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      )
                    : (
                        <Plus className="mr-2 h-4 w-4" />
                      )}
                  Import
                </Button>
              )}
      </CardFooter>
    </Card>
  );
}
