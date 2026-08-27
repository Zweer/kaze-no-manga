import { and, eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { apiError, buildMangaId, requireSession } from "@/lib/api-helpers";
import { db } from "@/lib/db";
import { library, readingProgress } from "@/lib/db/models";
import { markReadSchema, parseBody } from "@/lib/validations";

export async function POST(request: Request): Promise<NextResponse> {
	const { session, error } = await requireSession();
	if (error) return error;

	const parsed = await parseBody(request, markReadSchema);
	if (parsed.error) return parsed.error;
	const body = parsed.data;

	try {
		const mangaId = buildMangaId(body.source, body.mangaSlug);
		const progressId = `${session.user.id}:${mangaId}:${body.chapterSlug}`;

		await db
			.insert(readingProgress)
			.values({
				id: progressId,
				userId: session.user.id,
				mangaId,
				chapterSlug: body.chapterSlug,
				chapterNumber: body.chapterNumber,
			})
			.onConflictDoUpdate({
				target: [readingProgress.userId, readingProgress.mangaId, readingProgress.chapterSlug],
				set: { readAt: new Date() },
			});

		// Auto-update library status to "reading" if currently "plan_to_read"
		const libraryEntry = await db
			.select({ id: library.id, status: library.status })
			.from(library)
			.where(and(eq(library.userId, session.user.id), eq(library.mangaId, mangaId)))
			.limit(1);

		if (libraryEntry.length > 0 && libraryEntry[0]!.status === "plan_to_read") {
			await db
				.update(library)
				.set({ status: "reading" })
				.where(eq(library.id, libraryEntry[0]!.id));
		}

		return NextResponse.json({ message: "Marked as read" });
	} catch (err) {
		return apiError(err, "Failed to mark chapter as read");
	}
}
