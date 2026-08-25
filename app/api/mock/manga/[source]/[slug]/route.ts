import { NextResponse } from "next/server";
import { mockManga } from "@/lib/mock";

interface Params {
	params: Promise<{ source: string; slug: string }>;
}

export async function GET(_request: Request, { params }: Params): Promise<NextResponse> {
	const { source, slug } = await params;
	const manga = mockManga.find((m) => m.source === source && m.slug === slug);

	if (!manga) {
		return NextResponse.json({ error: "Not found" }, { status: 404 });
	}

	return NextResponse.json(manga);
}
