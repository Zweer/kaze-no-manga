import { comick } from "./sources/comick";
import { mangadex } from "./sources/mangadex";
import { omegascans } from "./sources/omegascans";
import type { MangaSource } from "./types";

/** All available manga sources, keyed by id */
const sources: Record<string, MangaSource> = {
	mangadex,
	comick,
	omegascans,
};

/** Get a source by id. Throws if not found. */
export function getSource(id: string): MangaSource {
	const source = sources[id];
	if (!source) {
		throw new Error(`Unknown source: ${id}`);
	}
	return source;
}

/** Get all registered source ids */
export function getSourceIds(): string[] {
	return Object.keys(sources);
}

/** Get all registered sources */
export function getAllSources(): MangaSource[] {
	return Object.values(sources);
}

/** Default source */
export const DEFAULT_SOURCE = "mangadex";

export type { Chapter, MangaDetail, MangaSource, MangaSummary, SearchResult } from "./types";
