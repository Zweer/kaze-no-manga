import { NextResponse } from "next/server";
import { eq, sql } from "drizzle-orm";
import { db } from "@/lib/db";
import { manga, chapter, library } from "@/lib/db/models";
import { getSource } from "@/lib/scraper";

export const dynamic = "force-dynamic";

export async function GET(request: Request): Promise<NextResponse> {
	// Verify cron secret
	const authHeader = request.headers.get("authorization");
	if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	}

	// Get all manga that are in at least one user's library
	const mangaInLibrary = await db
		.selectDistinct({ id: manga.id, source: manga.source, slug: manga.slug })
		.from(manga)
		.innerJoin(library, eq(manga.id, library.mangaId));

	let totalNew = 0;
	const errors: string[] = [];

	for (const m of mangaInLibrary) {
		try {
			const source = getSource(m.source);
			const mangaDetail = await source.getManga(m.slug);
			const chapters = await source.getChapters(mangaDetail);

			for (const ch of chapters) {
				const chapterId = `${m.id}:${ch.slug}`;
				await db
					.insert(chapter)
					.values({
						id: chapterId,
						mangaId: m.id,
						slug: ch.slug,
						number: ch.number,
						title: ch.title,
						releasedAt: new Date(ch.releasedAt),
					})
					.onConflictDoNothing();
			}

			// Count newly inserted (approximate via total)
			const [count] = await db
				.select({ count: sql<number>`count(*)` })
				.from(chapter)
				.where(eq(chapter.mangaId, m.id));

			totalNew += chapters.length - (count?.count ?? 0);
		} catch (err) {
			const message = err instanceof Error ? err.message : "Unknown error";
			errors.push(`${m.source}/${m.slug}: ${message}`);
		}
	}

	return NextResponse.json({
		checked: mangaInLibrary.length,
		newChapters: totalNew,
		errors: errors.length > 0 ? errors : undefined,
	});
}
