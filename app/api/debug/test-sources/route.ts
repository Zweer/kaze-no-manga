import { NextResponse } from "next/server";
import { fetchWithRetry } from "@/lib/scraper/fetch-utils";

export const dynamic = "force-dynamic";
export const maxDuration = 30;

const TESTS = [
	{ name: "OmegaScans API", url: "https://api.omegascans.org/query?query_string=love&page=1&perPage=1&status=All&order=desc&orderBy=total_views&series_type=Comic&tags_ids=[]&adult=true" },
	{ name: "MangaDex API", url: "https://api.mangadex.org/manga?title=solo+leveling&limit=1" },
	{ name: "Atsumaru", url: "https://atsu.moe/manga/" },
	{ name: "BatCave", url: "https://batcave.biz/" },
	{ name: "Comick.dev API", url: "https://api.comick.dev/v1.0/search?q=solo&limit=1&tachiyomi=true" },
	{ name: "ReadComicsOnline", url: "https://readcomicsonline.ru/" },
];

export async function GET(): Promise<NextResponse> {
	const results: Record<string, unknown> = {};

	for (const test of TESTS) {
		try {
			const response = await fetchWithRetry(test.url, {
				headers: {
					"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
					Accept: "text/html,application/json,*/*",
				},
			}, { maxRetries: 0, timeoutMs: 8000 });
			const text = await response.text();
			results[test.name] = {
				status: response.status,
				ok: response.ok,
				bodyPreview: text.slice(0, 200),
			};
		} catch (err) {
			results[test.name] = {
				status: "error",
				message: err instanceof Error ? err.message : String(err),
			};
		}
	}

	return NextResponse.json(results);
}
