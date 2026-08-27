import { NextResponse } from "next/server";
import { eq, and, desc } from "drizzle-orm";
import { db } from "@/lib/db";
import { readingProgress } from "@/lib/db/models";
import { getSession } from "@/lib/session";

interface Params {
	params: Promise<{ source: string; slug: string }>;
}

export async function GET(_request: Request, { params }: Params): Promise<NextResponse> {
	const session = await getSession();
	if (!session?.user) {
		return NextResponse.json({ readChapters: [], lastChapter: null });
	}

	const { source, slug } = await params;
	const mangaId = `${source}:${slug}`;

	const entries = await db
		.select({
			chapterSlug: readingProgress.chapterSlug,
			chapterNumber: readingProgress.chapterNumber,
			readAt: readingProgress.readAt,
		})
		.from(readingProgress)
		.where(
			and(eq(readingProgress.userId, session.user.id), eq(readingProgress.mangaId, mangaId)),
		)
		.orderBy(desc(readingProgress.readAt));

	const readChapters = entries.map((e) => e.chapterSlug);
	const lastChapter = entries.length > 0 ? entries[0] : null;

	return NextResponse.json({ readChapters, lastChapter });
}
