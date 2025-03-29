'use server';

import type { ConnectorNames } from '@zweer/manga-scraper';

import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';

import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { getManga } from '@/lib/manga';

// Zod schema for the new input based on selection
const AddMangaSchema = z.object({
  sourceId: z.string().min(1),
  sourceName: z.string().min(1),
});

export interface AddMangaState {
  message: string | null;
  success: boolean;
  error?: string; // Optional detailed error
}

export async function addSelectedManga(
  selectedManga: { sourceId: string; sourceName: string },
): Promise<AddMangaState> {
  const session = await auth();
  if (!session?.user?.id) {
    return { message: 'Not authenticated.', success: false, error: 'AUTH_REQUIRED' };
  }

  const validatedFields = AddMangaSchema.safeParse(selectedManga);

  if (!validatedFields.success) {
    console.error('Invalid data passed to addSelectedManga:', validatedFields.error);

    return {
      message: 'Invalid manga selection data.',
      success: false,
      error: 'VALIDATION_FAILED',
    };
  }

  const { sourceId, sourceName } = validatedFields.data;

  try {
    // 1. Check if Manga already exists in our DB by sourceId and sourceName
    let manga = await prisma.manga.findUnique({
      where: { sourceId_sourceName: { sourceId, sourceName } },
    });

    // 2. If not, fetch full details from the specific source connector
    if (!manga) {
      const mangaDetails = await getManga(sourceId, sourceName as ConnectorNames);

      if (!mangaDetails) {
        console.warn(`Could not fetch full details for "${sourceId}" from the source "${sourceName}".`);

        return { message: `Could not retrieve full details for "${sourceId}" from the source "${sourceName}". It might have been removed.`, success: false, error: 'FETCH_DETAILS_FAILED' };
      }

      try {
        manga = await prisma.manga.create({
          data: {
            sourceId, // Use ID from fetched details
            sourceName,
            slug: mangaDetails.slug,
            title: mangaDetails.title,
            excerpt: mangaDetails.excerpt,
            imageUrl: mangaDetails.imageUrl,
            sourceUrl: mangaDetails.sourceUrl,
            releasedAt: mangaDetails.releasedAt,
            status: mangaDetails.status,
            genres: mangaDetails.genres,
            score: mangaDetails.score,
            chaptersCount: mangaDetails.chaptersCount,
          },
        });
        console.log(`Created new manga in DB: ${manga.title} (${manga.id})`);
      } catch (createError: any) {
        // Handle potential race condition if another user added it between check and create
        if (createError instanceof PrismaClientKnownRequestError && createError.code === 'P2002') {
          console.log('Race condition detected. Fetching existing manga.');
          manga = await prisma.manga.findUnique({ where: { sourceId_sourceName: { sourceId, sourceName } } });
          if (!manga) {
            console.error('Failed to fetch manga after P2002 error on creation.');
            return { message: 'Error adding manga after race condition.', success: false, error: 'RACE_CONDITION_FETCH_FAILED' };
          }
        } else {
          throw createError; // Re-throw other errors
        }
      }
    } else {
      console.log(`Found existing manga in DB: ${manga.title} (${manga.id})`);
    }

    // 3. Check if the user is already tracking this manga
    const existingTracking = await prisma.userManga.findUnique({
      where: {
        userId_mangaId: {
          userId: session.user.id,
          mangaId: manga.id,
        },
      },
    });

    if (existingTracking) {
      return { message: `You are already tracking "${manga.title}".`, success: false, error: 'ALREADY_TRACKING' };
    }

    // 4. Create the UserManga tracking record
    await prisma.userManga.create({
      data: {
        userId: session.user.id,
        mangaId: manga.id,
        isFavourite: false,
        hasNewChapter: false,
      },
    });

    console.log(`User ${session.user.id} started tracking manga ${manga.id}`);

    // 5. Revalidate the dashboard path to show the new manga
    revalidatePath('/dashboard');

    // 6. Return success state
    return { message: `Successfully added "${manga.title}" to your list!`, success: true };
  } catch (error) {
    console.error(`Error adding manga "${sourceId}" from the source "${sourceName}":`, error);
    // Check for specific Prisma errors if needed
    return { message: `An unexpected error occurred while adding "${sourceId}" from the source "${sourceName}".`, success: false, error: 'UNKNOWN_ERROR' };
  }
}
