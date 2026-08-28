import { NextResponse } from "next/server";
import { getAllSources } from "@/lib/scraper";

export const dynamic = "force-dynamic";
export const maxDuration = 30;

export async function GET(): Promise<NextResponse> {
	const sources = getAllSources();
	const results: Record<string, unknown> = {};

	for (const source of sources) {
		try {
			const searchResult = await source.search("solo leveling", 1);
			results[source.id] = {
				status: "ok",
				resultCount: searchResult.mangas.length,
				firstResult: searchResult.mangas[0] ?? null,
			};
		} catch (err) {
			results[source.id] = {
				status: "error",
				message: err instanceof Error ? err.message : String(err),
				stack: err instanceof Error ? err.stack?.split("\n").slice(0, 5) : undefined,
			};
		}
	}

	return NextResponse.json(results);
}
