/**
 * Atsumaru API response types (atsu.moe).
 * Search uses Typesense; detail/chapters/pages use REST API.
 */

// ─── Typesense Search ─────────────────────────────────────────

export interface AtsSearchResponse {
	hits: AtsSearchHit[];
	found: number;
	out_of: number;
	page: number;
}

export interface AtsSearchHit {
	document: AtsSearchDocument;
}

export interface AtsSearchDocument {
	id: string;
	title: string;
	status: string | null;
	type: string | null;
	genreIds: string[];
	chapterCount: number;
	isAdult: boolean;
	medium: string;
	views: number;
	mbRating: number | null;
}

// ─── Popular / Browse ─────────────────────────────────────────

export interface AtsBrowseResponse {
	items: AtsBrowseItem[];
}

export interface AtsBrowseItem {
	id: string;
	title: string;
	image: string;
	smallImage: string;
	mediumImage: string;
	largeImage: string;
	type: string;
	medium: string;
	views: string;
}

// ─── Manga Detail ─────────────────────────────────────────────

export interface AtsMangaDetailResponse {
	mangaPage: AtsMangaDetail;
}

export interface AtsMangaDetail {
	id: string;
	title: string;
	synopsis: string | null;
	status: string | null;
	type: string | null;
	genres: AtsGenre[];
	tags: AtsTag[];
	poster: AtsPoster | null;
	authors: AtsAuthor[];
}

export interface AtsGenre {
	name: string;
}

export interface AtsTag {
	name: string;
}

export interface AtsPoster {
	image: string;
	smallImage: string;
	mediumImage: string;
	largeImage: string;
}

export interface AtsAuthor {
	name: string;
	type: string;
}

// ─── Chapters ─────────────────────────────────────────────────

export interface AtsChaptersResponse {
	chapters: AtsChapter[];
}

export interface AtsChapter {
	id: string;
	title: string;
	number: number;
	createdAt: number;
	index: number;
	pageCount: number;
	scanlationMangaId: string | null;
}

// ─── Chapter Pages ────────────────────────────────────────────

export interface AtsReadResponse {
	readChapter: AtsReadChapter;
}

export interface AtsReadChapter {
	id: string;
	title: string;
	pages: AtsPage[];
}

export interface AtsPage {
	id: string;
	image: string;
	number: number;
}
