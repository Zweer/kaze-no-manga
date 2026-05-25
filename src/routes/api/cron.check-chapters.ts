import { createFileRoute } from '@tanstack/react-router';
import { eq, sql } from 'drizzle-orm';

import { db } from '~/lib/db';
import { chapter, library, manga } from '~/lib/db/schema';
import { sendPushToUser } from '~/lib/push';
import { getSource } from '~/lib/scraper';

export const Route = createFileRoute('/api/cron/check-chapters')({
  server: {
    handlers: {
      GET: async ({ request }: { request: Request }) => {
        const authHeader = request.headers.get('authorization');
        if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
          return new Response('Unauthorized', { status: 401 });
        }

        // Get all manga in at least one library, with their subscribers
        const mangasInLibrary = await db
          .selectDistinct({ id: manga.id, source: manga.source, sourceUrl: manga.sourceUrl })
          .from(manga)
          .innerJoin(library, eq(library.mangaId, manga.id));

        let totalNew = 0;

        for (const m of mangasInLibrary) {
          const source = getSource(m.source);
          if (!source) continue;

          const mangaSlug = m.sourceUrl.split('/series/')[1];
          if (!mangaSlug) continue;

          try {
            const remoteChapters = await source.getChapters(mangaSlug);

            const existing = await db
              .select({ number: chapter.number })
              .from(chapter)
              .where(eq(chapter.mangaId, m.id));

            const existingNumbers = new Set(existing.map((c) => c.number));
            const newChapters = remoteChapters.filter((ch) => !existingNumbers.has(ch.number));

            if (newChapters.length > 0) {
              await db
                .insert(chapter)
                .values(
                  newChapters.map((ch) => ({
                    id: `${m.id}:${ch.sourceId}`,
                    mangaId: m.id,
                    number: ch.number,
                    title: ch.title,
                    sourceUrl: ch.sourceUrl,
                  })),
                )
                .onConflictDoNothing();

              await db.update(manga).set({ updatedAt: sql`now()` }).where(eq(manga.id, m.id));

              totalNew += newChapters.length;

              // Notify subscribers
              const subscribers = await db
                .select({ userId: library.userId })
                .from(library)
                .where(eq(library.mangaId, m.id));

              const [mangaRow] = await db
                .select({ title: manga.title })
                .from(manga)
                .where(eq(manga.id, m.id))
                .limit(1);

              const title = mangaRow?.title || 'Manga';
              const chapterNums = newChapters.map((ch) => ch.number).sort((a, b) => a - b);
              const body =
                chapterNums.length === 1
                  ? `Chapter ${chapterNums[0]} is available`
                  : `${chapterNums.length} new chapters (${chapterNums[0]}–${chapterNums.at(-1)})`;

              await Promise.allSettled(
                subscribers.map((sub) =>
                  sendPushToUser(sub.userId, {
                    title,
                    body,
                    url: `/manga/${m.source}/${mangaSlug}`,
                  }),
                ),
              );
            }
          } catch {
            // Skip failed sources
          }
        }

        return Response.json({
          ok: true,
          checked: mangasInLibrary.length,
          newChapters: totalNew,
        });
      },
    },
  },
});
