import { NextResponse } from "next/server";
import { getSource } from "@/lib/scraper";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function GET(): Promise<NextResponse> {
	const source = getSource("omegascans");
	const manga = await source.getManga("my-illustrator");
	const chapters = await source.getChapters(manga);

	let totalImages = 0;
	let totalBytes = 0;
	const chapterStats: { slug: string; images: number; bytes: number }[] = [];

	// Sample first 5 chapters to estimate
	const sample = chapters.slice(0, 5);

	for (const ch of sample) {
		const pages = await source.getChapterPages(ch);
		let chapterBytes = 0;

		// Fetch HEAD for each image to get content-length
		for (const url of pages) {
			try {
				const res = await fetch(url, { method: "HEAD" });
				const size = Number(res.headers.get("content-length") ?? 0);
				chapterBytes += size;
			} catch {
				// skip
			}
		}

		totalImages += pages.length;
		totalBytes += chapterBytes;
		chapterStats.push({
			slug: ch.slug,
			images: pages.length,
			bytes: chapterBytes,
		});
	}

	const avgImagesPerChapter = totalImages / sample.length;
	const avgBytesPerChapter = totalBytes / sample.length;
	const estimatedTotalBytes = avgBytesPerChapter * chapters.length;

	return NextResponse.json({
		manga: manga.title,
		totalChapters: chapters.length,
		sampledChapters: sample.length,
		sampleStats: chapterStats,
		averages: {
			imagesPerChapter: Math.round(avgImagesPerChapter),
			mbPerChapter: (avgBytesPerChapter / 1024 / 1024).toFixed(2),
		},
		estimated: {
			totalImages: Math.round(avgImagesPerChapter * chapters.length),
			totalMB: (estimatedTotalBytes / 1024 / 1024).toFixed(2),
			totalGB: (estimatedTotalBytes / 1024 / 1024 / 1024).toFixed(3),
		},
		note: "Based on HEAD requests (content-length) of first 5 chapters",
	});
}
