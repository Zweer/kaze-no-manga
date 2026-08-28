/**
 * Configuration and types for Madara-based WordPress manga sources.
 *
 * Madara is a WordPress theme used by hundreds of manga/manhwa sites.
 * Two variants exist:
 *   - NoAjax: chapters embedded in manga detail page
 *   - Ajax: chapters fetched via POST to /ajax/chapters/
 */

export interface MadaraConfig {
	/** Unique source identifier (e.g. "toonily") */
	id: string;
	/** Human-readable name (e.g. "Toonily") */
	name: string;
	/** Base URL of the source website */
	baseUrl: string;
	/** Whether this source is enabled for search/browsing (default: true) */
	enabled?: boolean;
	/** Manga sub-directory (e.g. "manga", "serie", "webtoons") */
	mangaSubString: string;
	/**
	 * Whether chapters are fetched via AJAX POST or are embedded in the manga page.
	 * - true: POST to /{mangaSubString}/{slug}/ajax/chapters/
	 * - false: chapters are in the manga detail page HTML
	 */
	useAjaxChapters: boolean;
	/** Extra cookies to send with every request */
	cookies?: Record<string, string>;
	/** Extra headers to send with every request */
	headers?: Record<string, string>;
	/** Override: CSS selector for search result items */
	searchSelector?: string;
	/** Override: CSS selector for description */
	descriptionSelector?: string;
	/** Override: date format for chapter dates (dayjs format) */
	dateFormat?: string;
}

/** Selector defaults from MadaraBase.kt */
export const MADARA_SELECTORS = {
	// Archive/search
	archiveItem: "div.page-item-detail, .manga__item, .c-tabs-item__content",
	archiveUrl: ".post-title a",
	// Manga detail
	title: "div.post-title h3, div.post-title h1",
	author: "div.author-content > a",
	artist: "div.artist-content > a",
	description: "div.description-summary div.summary__content",
	thumbnail: "div.summary_image img",
	genres: "div.genres-content a",
	status: "div.summary-content",
	// Chapters
	chapterList: "li.wp-manga-chapter",
	chapterLink: "a",
	chapterDate: "span.chapter-release-date",
	// Pages
	pageImages:
		"div.page-break img, li.blocks-gallery-item img, .reading-content .text-left:not(:has(.blocks-gallery-item)) img",
} as const;

/**
 * Priority order for extracting image URLs from an img element.
 * Matches MadaraBase.kt imageFromElement().
 */
export const IMAGE_ATTR_PRIORITY = [
	"data-src",
	"data-lazy-src",
	"data-cfsrc",
	"data-manga-src",
	"srcset",
	"src",
] as const;
