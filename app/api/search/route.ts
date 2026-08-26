import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { DEFAULT_SOURCE, getSource } from "@/lib/scraper";

export async function GET(request: NextRequest): Promise<NextResponse> {
	const query = request.nextUrl.searchParams.get("q");
	const sourceId = request.nextUrl.searchParams.get("source") ?? DEFAULT_SOURCE;
	const page = Number(request.nextUrl.searchParams.get("page") ?? "1");

	if (!query || query.trim().length === 0) {
		return NextResponse.json({ mangas: [], hasNextPage: false });
	}

	try {
		const source = getSource(sourceId);
		const result = await source.search(query.trim(), page);
		return NextResponse.json(result);
	} catch (error) {
		const message = error instanceof Error ? error.message : "Search failed";
		return NextResponse.json({ error: message }, { status: 500 });
	}
}
