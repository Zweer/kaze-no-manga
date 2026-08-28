/**
 * MangaDex API response types (v5).
 * Docs: https://api.mangadex.org/docs/
 */

export interface MangaDexListResponse<T> {
	result: "ok" | "error";
	response: "collection";
	data: T[];
	limit: number;
	offset: number;
	total: number;
}

export interface MangaDexManga {
	id: string;
	type: "manga";
	attributes: {
		title: Record<string, string>;
		altTitles: Array<Record<string, string>>;
		description: Record<string, string>;
		status: string | null;
		tags: Array<{ attributes: { name: Record<string, string> } }>;
	};
	relationships: Array<{
		id: string;
		type: string;
		attributes?: {
			fileName?: string;
		};
	}>;
}

export interface MangaDexChapter {
	id: string;
	type: "chapter";
	attributes: {
		chapter: string | null;
		title: string | null;
		translatedLanguage: string;
		publishAt: string;
	};
}

export interface MangaDexAtHomeResponse {
	baseUrl: string;
	chapter: {
		hash: string;
		data: string[];
		dataSaver: string[];
	};
}
