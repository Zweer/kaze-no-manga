import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { mockManga } from "@/lib/mock";

export function GET(request: NextRequest): NextResponse {
	const query = request.nextUrl.searchParams.get("q")?.toLowerCase() ?? "";

	if (!query) {
		return NextResponse.json([]);
	}

	const results = mockManga.filter(
		(manga) =>
			manga.title.toLowerCase().includes(query) ||
			manga.genres.some((g) => g.toLowerCase().includes(query)),
	);

	return NextResponse.json(results);
}
