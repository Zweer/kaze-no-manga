import { NextResponse } from "next/server";
import { getSession } from "./session";

/**
 * Build a consistent error response for API routes.
 */
export function apiError(error: unknown, fallbackMessage: string, status = 500): NextResponse {
	const message = error instanceof Error ? error.message : fallbackMessage;
	// Don't leak internal details in production
	const safeMessage = process.env.NODE_ENV === "production" ? fallbackMessage : message;
	return NextResponse.json({ error: safeMessage }, { status });
}

/**
 * Get the authenticated session or return a 401 response.
 * Use in protected API routes.
 */
export async function requireSession(): Promise<
	| { session: NonNullable<Awaited<ReturnType<typeof getSession>>>; error: null }
	| { session: null; error: NextResponse }
> {
	const session = await getSession();
	if (!session?.user) {
		return {
			session: null,
			error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
		};
	}
	return { session, error: null };
}

/**
 * Build a deterministic manga ID from source + slug.
 * Used as primary key in the manga table and as FK in library/progress.
 */
export function buildMangaId(source: string, slug: string): string {
	return `${source}:${slug}`;
}
