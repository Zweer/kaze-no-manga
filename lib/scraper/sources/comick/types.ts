/**
 * Comick API response types.
 * Based on api.comick.io endpoints.
 */

export interface ComickSearchResult {
	hid: string;
	title: string;
	slug: string;
	cover_url: string | null;
	md_covers: ComickCover[];
	status: number | null;
	genres: ComickGenre[];
	desc: string | null;
}

export interface ComickCover {
	b2key: string;
	w: number;
	h: number;
}

export interface ComickGenre {
	name: string;
	slug: string;
}

export interface ComickChaptersResponse {
	chapters: ComickChapter[];
	total: number;
}

export interface ComickChapter {
	hid: string;
	chap: string | null;
	title: string | null;
	lang: string;
	created_at: string;
	group_name: string[];
}

export interface ComickChapterImage {
	b2key: string;
	w: number;
	h: number;
}
