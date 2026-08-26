/**
 * HeanCms API response types.
 * Based on reverse-engineering of the OmegaScans API.
 */

export interface HeanCmsSearchResponse {
	data: HeanCmsSeriesSummary[];
	meta: HeanCmsPaginationMeta | null;
}

export interface HeanCmsPaginationMeta {
	current_page: number;
	last_page: number;
	per_page: number;
	total: number;
}

export interface HeanCmsSeriesSummary {
	id: number;
	title: string;
	series_slug: string;
	thumbnail: string | null;
	status: string | null;
}

export interface HeanCmsSeriesDetail {
	id: number;
	title: string;
	series_slug: string;
	description: string | null;
	thumbnail: string | null;
	status: string | null;
	tags: HeanCmsTag[];
}

export interface HeanCmsTag {
	id: number;
	name: string;
}

export interface HeanCmsChapterListResponse {
	data: HeanCmsChapter[];
	meta: HeanCmsPaginationMeta;
}

export interface HeanCmsChapter {
	id: number;
	chapter_name: string | null;
	chapter_title: string | null;
	chapter_slug: string;
	price: number;
	created_at: string;
}

export interface HeanCmsChapterDetailResponse {
	chapter: HeanCmsChapterDetail;
}

export interface HeanCmsChapterDetail {
	id: number;
	chapter_slug: string;
	chapter_name: string | null;
	chapter_number: string;
	price: number;
	paywall: boolean;
	chapter_data: HeanCmsChapterData | null;
}

export interface HeanCmsChapterData {
	images: string[];
}
