import type { MangaSource } from "./types";
import { omegascans } from "./sources/omegascans";

/** All available manga sources, keyed by id */
const sources: Record<string, MangaSource> = {
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

/** Default source for MVP */
export const DEFAULT_SOURCE = "omegascans";

export type { MangaSource, SearchResult, MangaSummary, MangaDetail, Chapter } from "./types";
