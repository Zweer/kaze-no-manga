/**
 * Toonily — Madara Ajax instance.
 *
 * Uses: HTML scraping + AJAX chapter loading, POST search.
 * Requires: Cookie `toonily-mature=1` for NSFW content.
 * Date format: "MMM d, yy" (e.g. "May 31, 23")
 *
 * Search selector override: "div.page-item-detail.manga"
 * Description selector override: "div.content-area div.summary__content"
 */

import { Madara } from "../madara";

export const toonily = new Madara({
	id: "toonily",
	name: "Toonily",
	baseUrl: "https://toonily.com",
	mangaSubString: "serie",
	useAjaxChapters: true,
	cookies: {
		"toonily-mature": "1",
	},
	searchSelector: "div.page-item-detail.manga",
	descriptionSelector: "div.content-area div.summary__content",
});
