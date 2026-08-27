import { and, eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { apiError, requireSession } from "@/lib/api-helpers";
import { db } from "@/lib/db";
import { library } from "@/lib/db/models";
import { parseBody, patchLibrarySchema } from "@/lib/validations";

interface Params {
	params: Promise<{ id: string }>;
}

export async function DELETE(_request: Request, { params }: Params): Promise<NextResponse> {
	const { session, error } = await requireSession();
	if (error) return error;

	try {
		const { id } = await params;

		const deleted = await db
			.delete(library)
			.where(and(eq(library.id, id), eq(library.userId, session.user.id)))
			.returning();

		if (deleted.length === 0) {
			return NextResponse.json({ error: "Not found" }, { status: 404 });
		}

		return NextResponse.json({ message: "Removed from library" });
	} catch (err) {
		return apiError(err, "Failed to remove from library");
	}
}

export async function PATCH(request: Request, { params }: Params): Promise<NextResponse> {
	const { session, error } = await requireSession();
	if (error) return error;

	const parsed = await parseBody(request, patchLibrarySchema);
	if (parsed.error) return parsed.error;

	try {
		const { id } = await params;

		const updated = await db
			.update(library)
			.set({ status: parsed.data.status })
			.where(and(eq(library.id, id), eq(library.userId, session.user.id)))
			.returning();

		if (updated.length === 0) {
			return NextResponse.json({ error: "Not found" }, { status: 404 });
		}

		return NextResponse.json(updated[0]);
	} catch (err) {
		return apiError(err, "Failed to update library status");
	}
}
