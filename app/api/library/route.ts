import { NextResponse } from "next/server";
import { eq, and, asc, desc } from "drizzle-orm";
import { db } from "@/lib/db";
import { manga, library } from "@/lib/db/models";
import { apiError, requireSession, buildMangaId } from "@/lib/api-helpers";
import { addToLibrarySchema, parseBody } from "@/lib/validations";

export async function GET(request: Request): Promise<NextResponse> {
	const { session, error } = await requireSession();
	if (error) return error;

	try {
		const url = new URL(request.url);
		const statusFilter = url.searchParams.get("status");
		const sort = url.searchParams.get("sort") ?? "recently_added";

		const conditions = [eq(library.userId, session.user.id)];
		if (statusFilter && statusFilter !== "all") {
			conditions.push(eq(library.status, statusFilter));
		}

		const orderBy = sort === "alphabetical" ? asc(manga.title) : desc(library.addedAt);

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
			.where(and(...conditions))
			.orderBy(orderBy);

		return NextResponse.json(entries);
	} catch (err) {
		return apiError(err, "Failed to fetch library");
	}
}

export async function POST(request: Request): Promise<NextResponse> {
	const { session, error } = await requireSession();
	if (error) return error;

	const parsed = await parseBody(request, addToLibrarySchema);
	if (parsed.error) return parsed.error;
	const body = parsed.data;

	try {
		const mangaId = buildMangaId(body.source, body.slug);

		await db
			.insert(manga)
			.values({
				id: mangaId,
				source: body.source,
				slug: body.slug,
				title: body.title,
				cover: body.cover,
				description: body.description,
				status: body.status,
				genres: JSON.stringify(body.genres),
			})
			.onConflictDoUpdate({
				target: [manga.source, manga.slug],
				set: {
					title: body.title,
					cover: body.cover,
					description: body.description,
					status: body.status,
					genres: JSON.stringify(body.genres),
				},
			});

		const existing = await db
			.select()
			.from(library)
			.where(and(eq(library.userId, session.user.id), eq(library.mangaId, mangaId)))
			.limit(1);

		if (existing.length > 0) {
			return NextResponse.json({ message: "Already in library", id: existing[0]!.id });
		}

		const libraryId = `${session.user.id}:${mangaId}`;
		await db.insert(library).values({
			id: libraryId,
			userId: session.user.id,
			mangaId,
			status: "plan_to_read",
		});

		return NextResponse.json({ message: "Added to library", id: libraryId }, { status: 201 });
	} catch (err) {
		return apiError(err, "Failed to update library");
	}
}
