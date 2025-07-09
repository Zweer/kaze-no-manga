'use server';

import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { readingTable } from '@/lib/db/model';
import logger from '@/lib/logger';

export async function upsertReading(
  chapterId: string,
  percentage: number,
): Promise<void> {
  const session = await auth();

  if (!session?.user?.id) {
    logger.warn({ chapterId, percentage }, 'Attempt to upsert reading progress without authentication.');
    throw new Error('User not authenticated');
  }

  const userId = session.user.id;
  const isCompleted = percentage >= 98;
  logger.debug({ userId, chapterId, percentage, isCompleted }, 'Upserting reading progress.');

  try {
    await db
      .insert(readingTable)
      .values({
        userId,
        chapterId,
        percentage,
        lastReadAt: new Date(),
        isCompleted,
      })
      .onConflictDoUpdate({
        target: [readingTable.userId, readingTable.chapterId],
        set: {
          percentage,
          lastReadAt: new Date(),
          isCompleted,
        },
      });
    logger.info({ userId, chapterId, percentage, isCompleted }, 'Reading progress upserted successfully.');
  } catch (error) {
    logger.error({ userId, chapterId, percentage, error }, 'Error upserting reading progress.');
    throw error;
  }
}
