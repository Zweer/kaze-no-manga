import { NextResponse } from "next/server";
import { eq, and } from "drizzle-orm";
import { db } from "@/lib/db";
import { library } from "@/lib/db/models";
import { getSession } from "@/lib/session";

export async function GET(request: Request): Promise<NextResponse> {
	const session = await getSession();
	if (!session?.user) {
		return NextResponse.json({ inLibrary: false });
	}

	const url = new URL(request.url);
	const source = url.searchParams.get("source");
	const slug = url.searchParams.get("slug");

	if (!source || !slug) {
		return NextResponse.json({ inLibrary: false });
	}

	const mangaId = `${source}:${slug}`;
	const entry = await db
		.select({ id: library.id, status: library.status })
		.from(library)
		.where(and(eq(library.userId, session.user.id), eq(library.mangaId, mangaId)))
		.limit(1);

	if (entry.length > 0) {
		return NextResponse.json({ inLibrary: true, entryId: entry[0]!.id, status: entry[0]!.status });
	}

	return NextResponse.json({ inLibrary: false });
}
