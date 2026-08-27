import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { apiError } from "@/lib/api-helpers";
import type { MangaSummary } from "@/lib/scraper";
import { getAllSources, getSource } from "@/lib/scraper";

interface SourceResult {
	sourceId: string;
	sourceName: string;
	mangas: MangaSummary[];
	error?: string;
}

export async function GET(request: NextRequest): Promise<NextResponse> {
	const query = request.nextUrl.searchParams.get("q");
	const sourceId = request.nextUrl.searchParams.get("source");
	const page = Number(request.nextUrl.searchParams.get("page") ?? "1");

	if (!query || query.trim().length === 0) {
		return NextResponse.json({ results: [] });
	}

	try {
		// Single source mode
		if (sourceId) {
			const source = getSource(sourceId);
			const result = await source.search(query.trim(), page);
			const results: SourceResult[] = [
				{
					sourceId: source.id,
					sourceName: source.name,
					mangas: result.mangas,
				},
			];
			return NextResponse.json({ results });
		}

		// Multi-source mode: fetch all in parallel
		const sources = getAllSources();
		const promises = sources.map(async (source): Promise<SourceResult> => {
			try {
				const result = await source.search(query.trim(), page);
				return {
					sourceId: source.id,
					sourceName: source.name,
					mangas: result.mangas,
				};
			} catch (err) {
				return {
					sourceId: source.id,
					sourceName: source.name,
					mangas: [],
					error: err instanceof Error ? err.message : "Search failed",
				};
			}
		});

		const results = await Promise.all(promises);

		// Sort by result count (most results first), errors last
		results.sort((a, b) => {
			if (a.error && !b.error) return 1;
			if (!a.error && b.error) return -1;
			return b.mangas.length - a.mangas.length;
		});

		return NextResponse.json({ results });
	} catch (error) {
		return apiError(error, "Search failed");
	}
}
