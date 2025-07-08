'use server';

import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { readingTable } from '@/lib/db/model';

export async function upsertReading(
  chapterId: string,
  percentage: number,
): Promise<void> {
  const session = await auth();

  if (!session?.user?.id) {
    throw new Error('User not authenticated');
  }

  const userId = session.user.id;

  await db
    .insert(readingTable)
    .values({
      userId,
      chapterId,
      percentage,
      lastReadAt: new Date(),
      isCompleted: percentage >= 98,
    })
    .onConflictDoUpdate({
      target: [readingTable.userId, readingTable.chapterId],
      set: {
        percentage,
        lastReadAt: new Date(),
        isCompleted: percentage >= 98,
      },
    });
}
