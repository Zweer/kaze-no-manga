import { NextResponse } from "next/server";
import { apiError } from "@/lib/api-helpers";
import { getSource } from "@/lib/scraper";

interface Params {
	params: Promise<{ source: string; slug: string }>;
}

export async function GET(_request: Request, { params }: Params): Promise<NextResponse> {
	const { source, slug } = await params;

	try {
		const scraper = getSource(source);
		const manga = await scraper.getManga(slug);
		const chapters = await scraper.getChapters(manga);
		return NextResponse.json(chapters);
	} catch (error) {
		return apiError(error, "Failed to fetch chapters");
	}
}
