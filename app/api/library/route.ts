import { NextResponse } from "next/server";
import { eq, and } from "drizzle-orm";
import { db } from "@/lib/db";
import { manga, library } from "@/lib/db/models";
import { getSession } from "@/lib/session";

export async function GET(): Promise<NextResponse> {
	const session = await getSession();
	if (!session?.user) {
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	}

	const entries = await db
		.select({
			id: library.id,
			status: library.status,
			addedAt: library.addedAt,
			manga: {
				id: manga.id,
				source: manga.source,
				slug: manga.slug,
				title: manga.title,
				cover: manga.cover,
				status: manga.status,
			},
		})
		.from(library)
		.innerJoin(manga, eq(library.mangaId, manga.id))
		.where(eq(library.userId, session.user.id));

	return NextResponse.json(entries);
}

interface AddToLibraryBody {
	source: string;
	slug: string;
	title: string;
	cover: string;
	description: string;
	status: string;
	genres: string[];
}

export async function POST(request: Request): Promise<NextResponse> {
	const session = await getSession();
	if (!session?.user) {
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	}

	const body = (await request.json()) as AddToLibraryBody;

	if (!body.source || !body.slug || !body.title) {
		return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
	}

	// Upsert manga (create if not exists)
	const mangaId = `${body.source}:${body.slug}`;
	await db
		.insert(manga)
		.values({
			id: mangaId,
			source: body.source,
			slug: body.slug,
			title: body.title,
			cover: body.cover || "",
			description: body.description || "",
			status: body.status || "unknown",
			genres: JSON.stringify(body.genres || []),
		})
		.onConflictDoUpdate({
			target: [manga.source, manga.slug],
			set: {
				title: body.title,
				cover: body.cover || "",
				description: body.description || "",
				status: body.status || "unknown",
				genres: JSON.stringify(body.genres || []),
			},
		});

	// Check if already in library
	const existing = await db
		.select()
		.from(library)
		.where(and(eq(library.userId, session.user.id), eq(library.mangaId, mangaId)))
		.limit(1);

	if (existing.length > 0) {
		return NextResponse.json({ message: "Already in library", id: existing[0]!.id });
	}

	// Add to library
	const libraryId = `${session.user.id}:${mangaId}`;
	await db.insert(library).values({
		id: libraryId,
		userId: session.user.id,
		mangaId,
		status: "reading",
	});

	return NextResponse.json({ message: "Added to library", id: libraryId }, { status: 201 });
}
