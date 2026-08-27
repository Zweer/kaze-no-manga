import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { manga, chapter, library } from "@/lib/db/models";
import { apiError } from "@/lib/api-helpers";
import { getSource } from "@/lib/scraper";

export const dynamic = "force-dynamic";

export async function GET(request: Request): Promise<NextResponse> {
	const authHeader = request.headers.get("authorization");
	if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	}

	try {
		const mangaInLibrary = await db
			.selectDistinct({ id: manga.id, source: manga.source, slug: manga.slug })
			.from(manga)
			.innerJoin(library, eq(manga.id, library.mangaId));

		let newChapters = 0;
		const errors: string[] = [];

		for (const m of mangaInLibrary) {
			try {
				const source = getSource(m.source);
				const mangaDetail = await source.getManga(m.slug);
				const chapters = await source.getChapters(mangaDetail);

				// Batch insert all chapters (skip existing via onConflictDoNothing)
				if (chapters.length > 0) {
					const values = chapters.map((ch) => ({
						id: `${m.id}:${ch.slug}`,
						mangaId: m.id,
						slug: ch.slug,
						number: ch.number,
						title: ch.title,
						releasedAt: new Date(ch.releasedAt),
					}));

					const result = await db
						.insert(chapter)
						.values(values)
						.onConflictDoNothing()
						.returning();

					newChapters += result.length;
				}
			} catch (err) {
				const message = err instanceof Error ? err.message : "Unknown error";
				errors.push(`${m.source}/${m.slug}: ${message}`);
			}
		}

		return NextResponse.json({
			checked: mangaInLibrary.length,
			newChapters,
			errors: errors.length > 0 ? errors : undefined,
		});
	} catch (err) {
		return apiError(err, "Chapter check failed");
	}
}
