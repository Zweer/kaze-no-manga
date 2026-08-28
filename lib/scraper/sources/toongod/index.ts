/**
 * ToonGod — Madara NoAjax instance.
 *
 * ❌ CURRENTLY BLOCKED BY CLOUDFLARE (managed challenge, verified 2026-08-28).
 * Kept as a ready-to-use config for when/if CF protection is removed.
 *
 * Uses: HTML scraping, chapters in manga detail page, GET search.
 * Date format: "d MMM yyyy" (e.g. "5 Aug 2024")
 */

import { Madara } from "../madara";

export const toongod = new Madara({
	id: "toongod",
	name: "ToonGod",
	baseUrl: "https://www.toongod.org",
	mangaSubString: "webtoons",
	useAjaxChapters: false,
});
