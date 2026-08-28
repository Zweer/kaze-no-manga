/**
 * Common types for all manga sources.
 * Every source implements MangaSource regardless of the underlying CMS.
 */

export interface MangaSource {
	/** Unique source identifier (e.g. "omegascans", "toongod") */
	readonly id: string;
	/** Human-readable name (e.g. "Omega Scans") */
	readonly name: string;
	/** Base URL of the source website */
	readonly baseUrl: string;
	/**
	 * Whether this source is enabled for search and browsing.
	 * Disabled sources are still accessible via getSource() (for existing library entries)
	 * but excluded from getAllSources() and multi-source search.
	 * Defaults to true if not set.
	 */
	readonly enabled?: boolean;

	/** Search for manga by query */
	search(query: string, page?: number): Promise<SearchResult>;
	/** Get full manga details by slug/identifier */
	getManga(identifier: string): Promise<MangaDetail>;
	/** Get all chapters for a manga */
	getChapters(manga: MangaDetail): Promise<Chapter[]>;
	/** Get image URLs for a chapter */
	getChapterPages(chapter: Chapter): Promise<string[]>;
}

export interface SearchResult {
	mangas: MangaSummary[];
	hasNextPage: boolean;
}

export interface MangaSummary {
	sourceId: string;
	slug: string;
	title: string;
	cover: string;
}

export interface MangaDetail {
	sourceId: string;
	slug: string;
	/** Internal identifier used by the source (numeric ID, URL path, etc.) */
	sourceIdentifier: string;
	title: string;
	cover: string;
	description: string;
	status: "ongoing" | "completed" | "hiatus" | "dropped" | "cancelled" | "unknown";
	genres: string[];
}

export interface Chapter {
	sourceId: string;
	mangaSlug: string;
	/** Chapter's own slug (used to build URLs / fetch pages) */
	slug: string;
	number: number;
	title: string;
	releasedAt: string;
}
