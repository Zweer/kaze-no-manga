import { atsumaru } from "./sources/atsumaru";
import { comick } from "./sources/comick";
import { mangadex } from "./sources/mangadex";
import { omegascans } from "./sources/omegascans";
import { toongod } from "./sources/toongod";
import { toonily } from "./sources/toonily";
import { weebcentral } from "./sources/weebcentral";
import type { MangaSource } from "./types";

/** All available manga sources, keyed by id */
const sources: Record<string, MangaSource> = {
	mangadex,
	comick,
	omegascans,
	toonily,
	toongod,
	weebcentral,
	atsumaru,
};

/** Check if a source is enabled (defaults to true) */
function isEnabled(source: MangaSource): boolean {
	return source.enabled !== false;
}

/** Get a source by id. Throws if not found. Works for disabled sources too. */
export function getSource(id: string): MangaSource {
	const source = sources[id];
	if (!source) {
		throw new Error(`Unknown source: ${id}`);
	}
	return source;
}

/** Get all registered source ids (enabled only) */
export function getSourceIds(): string[] {
	return Object.values(sources)
		.filter(isEnabled)
		.map((s) => s.id);
}

/** Get all registered sources (enabled only) */
export function getAllSources(): MangaSource[] {
	return Object.values(sources).filter(isEnabled);
}

/** Default source */
export const DEFAULT_SOURCE = "mangadex";

export type { Chapter, MangaDetail, MangaSource, MangaSummary, SearchResult } from "./types";
