import { NextResponse } from "next/server";
import { z } from "zod";

// ── Schemas ──────────────────────────────────────────────────────────

export const addToLibrarySchema = z.object({
	source: z.string().min(1),
	slug: z.string().min(1),
	title: z.string().min(1),
	cover: z.string().default(""),
	description: z.string().default(""),
	status: z.string().default("unknown"),
	genres: z.array(z.string()).default([]),
});

export const patchLibrarySchema = z.object({
	status: z.enum(["reading", "plan_to_read", "completed", "on_hold", "dropped"]),
});

export const markReadSchema = z.object({
	source: z.string().min(1),
	mangaSlug: z.string().min(1),
	chapterSlug: z.string().min(1),
	chapterNumber: z.string().default("0"),
});

export const searchParamsSchema = z.object({
	q: z.string().min(1),
	source: z.string().default("omegascans"),
	page: z.coerce.number().int().positive().default(1),
});

// ── Types ────────────────────────────────────────────────────────────

export type AddToLibraryInput = z.infer<typeof addToLibrarySchema>;
export type PatchLibraryInput = z.infer<typeof patchLibrarySchema>;
export type MarkReadInput = z.infer<typeof markReadSchema>;
export type SearchParamsInput = z.infer<typeof searchParamsSchema>;

// ── Helpers ──────────────────────────────────────────────────────────

export async function parseBody<T>(
	request: Request,
	schema: z.ZodType<T>,
): Promise<{ data: T; error?: never } | { data?: never; error: NextResponse }> {
	let raw: unknown;
	try {
		raw = await request.json();
	} catch {
		return { error: NextResponse.json({ error: "Invalid JSON body" }, { status: 400 }) };
	}

	const result = schema.safeParse(raw);
	if (!result.success) {
		const issues = result.error.issues.map((i) => ({
			path: i.path.join("."),
			message: i.message,
		}));
		return { error: NextResponse.json({ error: issues }, { status: 400 }) };
	}

	return { data: result.data };
}

export function parseSearchParams<T>(
	searchParams: URLSearchParams,
	schema: z.ZodType<T>,
): { data: T; error?: never } | { data?: never; error: NextResponse } {
	const raw = Object.fromEntries(searchParams.entries());
	const result = schema.safeParse(raw);

	if (!result.success) {
		const issues = result.error.issues.map((i) => ({
			path: i.path.join("."),
			message: i.message,
		}));
		return { error: NextResponse.json({ error: issues }, { status: 400 }) };
	}

	return { data: result.data };
}
