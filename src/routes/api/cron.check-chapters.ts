import { createFileRoute } from '@tanstack/react-router';
import { eq, sql } from 'drizzle-orm';

import { db } from '~/lib/db';
import { chapter, library, manga } from '~/lib/db/schema';
import { getSource } from '~/lib/scraper';

export const Route = createFileRoute('/api/cron/check-chapters')({
  server: {
    handlers: {
      GET: async ({ request }: { request: Request }) => {
        // Verify cron secret (Vercel sends this header)
        const authHeader = request.headers.get('authorization');
        if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
          return new Response('Unauthorized', { status: 401 });
        }

        // Get all manga that are in at least one user's library
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

            // Get existing chapter numbers
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

              // Update manga's updatedAt
              await db.update(manga).set({ updatedAt: sql`now()` }).where(eq(manga.id, m.id));

              totalNew += newChapters.length;
            }
          } catch {
            // Skip failed sources, continue with others
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
