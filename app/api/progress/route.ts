import { NextResponse } from "next/server";
import { eq, and } from "drizzle-orm";
import { db } from "@/lib/db";
import { readingProgress, library } from "@/lib/db/models";
import { getSession } from "@/lib/session";

interface MarkReadBody {
	source: string;
	mangaSlug: string;
	chapterSlug: string;
	chapterNumber: string;
}

export async function POST(request: Request): Promise<NextResponse> {
	const session = await getSession();
	if (!session?.user) {
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	}

	const body = (await request.json()) as MarkReadBody;

	if (!body.source || !body.mangaSlug || !body.chapterSlug) {
		return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
	}

	const mangaId = `${body.source}:${body.mangaSlug}`;
	const progressId = `${session.user.id}:${mangaId}:${body.chapterSlug}`;

	// Upsert reading progress
	await db
		.insert(readingProgress)
		.values({
			id: progressId,
			userId: session.user.id,
			mangaId,
			chapterSlug: body.chapterSlug,
			chapterNumber: body.chapterNumber || "0",
		})
		.onConflictDoUpdate({
			target: [readingProgress.userId, readingProgress.mangaId, readingProgress.chapterSlug],
			set: {
				readAt: new Date(),
			},
		});

	// Auto-update library status to "reading" if manga is in library
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
}
