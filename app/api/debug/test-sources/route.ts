import { NextResponse } from "next/server";
import { fetchWithRetry } from "@/lib/scraper/fetch-utils";

export const dynamic = "force-dynamic";
export const maxDuration = 30;

const TESTS = [
	{ name: "OmegaScans API", url: "https://api.omegascans.org/query?query_string=love&page=1&perPage=1&status=All&order=desc&orderBy=total_views&series_type=Comic&tags_ids=[]&adult=true" },
	{ name: "Comick.io API", url: "https://api.comick.io/v1.0/search?q=solo&limit=1&tachiyomi=true" },
	{ name: "Comick.fun API", url: "https://api.comick.fun/v1.0/search?q=solo&limit=1&tachiyomi=true" },
	{ name: "Comick.art API", url: "https://api.comick.art/v1.0/search?q=solo&limit=1" },
	{ name: "ToonGod AJAX", url: "https://www.toongod.org/wp-admin/admin-ajax.php", method: "POST", body: "action=madara_load_more&page=0&template=madara-core/content/content-archive&vars[s]=solo&vars[posts_per_page]=1&vars[post_type]=wp-manga&vars[post_status]=publish" },
	{ name: "Toonily AJAX", url: "https://toonily.com/wp-admin/admin-ajax.php", method: "POST", body: "action=madara_load_more&page=0&template=madara-core/content/content-archive&vars[s]=solo&vars[posts_per_page]=1&vars[post_type]=wp-manga&vars[post_status]=publish" },
	{ name: "MangaFire", url: "https://mangafire.to/filter?keyword=solo&page=1" },
	{ name: "WeebCentral", url: "https://weebcentral.com/search/data?text=solo+leveling&limit=1" },
	{ name: "MangaDex API", url: "https://api.mangadex.org/manga?title=solo+leveling&limit=1" },
];

export async function GET(): Promise<NextResponse> {
	const results: Record<string, unknown> = {};

	for (const test of TESTS) {
		try {
			const opts: RequestInit = {
				headers: {
					"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
					"Accept": "text/html,application/json,*/*",
					...(test.method === "POST" ? {
						"Content-Type": "application/x-www-form-urlencoded",
						"X-Requested-With": "XMLHttpRequest",
					} : {}),
				},
				method: test.method || "GET",
				body: test.body,
			};

			const response = await fetchWithRetry(test.url, opts, { maxRetries: 0, timeoutMs: 8000 });
			const text = await response.text();
			results[test.name] = {
				status: response.status,
				ok: response.ok,
				bodyPreview: text.slice(0, 300),
				contentType: response.headers?.get?.("content-type") ?? "unknown",
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
