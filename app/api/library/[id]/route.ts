import { NextResponse } from "next/server";
import { eq, and } from "drizzle-orm";
import { db } from "@/lib/db";
import { library } from "@/lib/db/models";
import { getSession } from "@/lib/session";

interface Params {
	params: Promise<{ id: string }>;
}

export async function DELETE(_request: Request, { params }: Params): Promise<NextResponse> {
	const session = await getSession();
	if (!session?.user) {
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	}

	const { id } = await params;

	const deleted = await db
		.delete(library)
		.where(and(eq(library.id, id), eq(library.userId, session.user.id)))
		.returning();

	if (deleted.length === 0) {
		return NextResponse.json({ error: "Not found" }, { status: 404 });
	}

	return NextResponse.json({ message: "Removed from library" });
}

interface PatchBody {
	status: string;
}

const VALID_STATUSES = ["reading", "plan_to_read", "completed", "on_hold", "dropped"];

export async function PATCH(request: Request, { params }: Params): Promise<NextResponse> {
	const session = await getSession();
	if (!session?.user) {
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	}

	const { id } = await params;
	const body = (await request.json()) as PatchBody;

	if (!VALID_STATUSES.includes(body.status)) {
		return NextResponse.json(
			{ error: `Invalid status. Must be one of: ${VALID_STATUSES.join(", ")}` },
			{ status: 400 },
		);
	}

	const updated = await db
		.update(library)
		.set({ status: body.status })
		.where(and(eq(library.id, id), eq(library.userId, session.user.id)))
		.returning();

	if (updated.length === 0) {
		return NextResponse.json({ error: "Not found" }, { status: 404 });
	}

	return NextResponse.json(updated[0]);
}
