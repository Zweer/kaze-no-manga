import { NextResponse } from "next/server";
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
		const message = error instanceof Error ? error.message : "Failed to fetch chapters";
		const status = message.includes("404") ? 404 : 500;
		return NextResponse.json({ error: message }, { status });
	}
}
