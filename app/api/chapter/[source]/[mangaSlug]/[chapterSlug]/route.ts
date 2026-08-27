import { NextResponse } from "next/server";
import { apiError } from "@/lib/api-helpers";
import { getSource } from "@/lib/scraper";

interface Params {
	params: Promise<{ source: string; mangaSlug: string; chapterSlug: string }>;
}

export async function GET(_request: Request, { params }: Params): Promise<NextResponse> {
	const { source, mangaSlug, chapterSlug } = await params;

	try {
		const scraper = getSource(source);
		const pages = await scraper.getChapterPages({
			sourceId: source,
			mangaSlug,
			slug: chapterSlug,
			number: 0,
			title: "",
			releasedAt: "",
		});
		return NextResponse.json({ pages });
	} catch (error) {
		return apiError(error, "Failed to fetch chapter pages");
	}
}
