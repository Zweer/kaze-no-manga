import { NextResponse } from "next/server";
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
		const message = error instanceof Error ? error.message : "Failed to fetch chapter pages";
		return NextResponse.json({ error: message }, { status: 500 });
	}
}
