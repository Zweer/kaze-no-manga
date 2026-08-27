import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { apiError } from "@/lib/api-helpers";
import { getSource } from "@/lib/scraper";
import { parseSearchParams, searchParamsSchema } from "@/lib/validations";

export async function GET(request: NextRequest): Promise<NextResponse> {
	const parsed = parseSearchParams(request.nextUrl.searchParams, searchParamsSchema);
	if (parsed.error) return parsed.error;
	const { q: query, source: sourceId, page } = parsed.data;

	try {
		const source = getSource(sourceId);
		const result = await source.search(query, page);
		return NextResponse.json(result);
	} catch (error) {
		return apiError(error, "Search failed");
	}
}
