export interface MockManga {
	slug: string;
	source: string;
	title: string;
	cover: string;
	description: string;
	status: "ongoing" | "completed" | "hiatus";
	genres: string[];
	chapters: MockChapter[];
}

export interface MockChapter {
	number: number;
	title: string;
	pages: number;
	releasedAt: string;
}

export interface LibraryEntry {
	manga: MockManga;
	status: "reading" | "plan_to_read" | "completed" | "on_hold" | "dropped";
	currentChapter: number;
	addedAt: string;
}

export const mockManga: MockManga[] = [
	{
		slug: "solo-leveling",
		source: "omegascans",
		title: "Solo Leveling",
		cover: "https://picsum.photos/seed/solo-leveling/300/420",
		description:
			"In a world where hunters — human warriors who possess supernatural abilities — must battle deadly monsters to protect the human race from total annihilation, a notoriously weak hunter named Sung Jinwoo finds himself in a constantly life-threatening situation.",
		status: "completed",
		genres: ["Action", "Adventure", "Fantasy"],
		chapters: Array.from({ length: 20 }, (_, i) => ({
			number: i + 1,
			title: `Chapter ${i + 1}`,
			pages: 18 + Math.floor(Math.random() * 10),
			releasedAt: new Date(2024, 0, 1 + i * 7).toISOString(),
		})),
	},
	{
		slug: "tower-of-god",
		source: "omegascans",
		title: "Tower of God",
		cover: "https://picsum.photos/seed/tower-of-god/300/420",
		description:
			"What do you desire? Money and wealth? Honor and pride? Authority and power? Revenge? Or something that transcends them all? Whatever you desire — it's here.",
		status: "ongoing",
		genres: ["Action", "Adventure", "Drama", "Fantasy"],
		chapters: Array.from({ length: 30 }, (_, i) => ({
			number: i + 1,
			title: `Chapter ${i + 1}`,
			pages: 20 + Math.floor(Math.random() * 15),
			releasedAt: new Date(2024, 0, 1 + i * 7).toISOString(),
		})),
	},
	{
		slug: "omniscient-reader",
		source: "omegascans",
		title: "Omniscient Reader's Viewpoint",
		cover: "https://picsum.photos/seed/omniscient-reader/300/420",
		description:
			"Dokja was an average office worker whose sole hobby was reading a web novel called 'Three Ways to Survive the Apocalypse.' One day, the novel becomes reality.",
		status: "ongoing",
		genres: ["Action", "Adventure", "Fantasy", "Sci-Fi"],
		chapters: Array.from({ length: 25 }, (_, i) => ({
			number: i + 1,
			title: `Chapter ${i + 1}`,
			pages: 22 + Math.floor(Math.random() * 8),
			releasedAt: new Date(2024, 1, 1 + i * 5).toISOString(),
		})),
	},
	{
		slug: "eleceed",
		source: "omegascans",
		title: "Eleceed",
		cover: "https://picsum.photos/seed/eleceed/300/420",
		description:
			"Jiwoo is a kind-hearted young man who harnesses the power of super speed. He encounters Kayden, a secret agent hiding in the body of a fat old cat.",
		status: "ongoing",
		genres: ["Action", "Comedy", "Supernatural"],
		chapters: Array.from({ length: 15 }, (_, i) => ({
			number: i + 1,
			title: `Chapter ${i + 1}`,
			pages: 16 + Math.floor(Math.random() * 12),
			releasedAt: new Date(2024, 2, 1 + i * 7).toISOString(),
		})),
	},
	{
		slug: "the-beginning-after-the-end",
		source: "omegascans",
		title: "The Beginning After the End",
		cover: "https://picsum.photos/seed/tbate/300/420",
		description:
			"King Grey has unrivaled strength, wealth, and prestige in a world governed by martial ability. However, solitude lingers closely behind those with great power.",
		status: "ongoing",
		genres: ["Action", "Adventure", "Fantasy", "Romance"],
		chapters: Array.from({ length: 18 }, (_, i) => ({
			number: i + 1,
			title: `Chapter ${i + 1}`,
			pages: 20 + Math.floor(Math.random() * 10),
			releasedAt: new Date(2024, 3, 1 + i * 7).toISOString(),
		})),
	},
	{
		slug: "windbreaker",
		source: "omegascans",
		title: "Wind Breaker",
		cover: "https://picsum.photos/seed/wind-breaker/300/420",
		description:
			"Jay is a student at a school for aspiring professional cyclists. With a sharp mind for strategy and a natural talent for cycling, he joins the school's competitive team.",
		status: "hiatus",
		genres: ["Sports", "Drama", "School Life"],
		chapters: Array.from({ length: 12 }, (_, i) => ({
			number: i + 1,
			title: `Chapter ${i + 1}`,
			pages: 24 + Math.floor(Math.random() * 6),
			releasedAt: new Date(2024, 4, 1 + i * 10).toISOString(),
		})),
	},
];

export const mockLibrary: LibraryEntry[] = [
	{
		manga: mockManga[0]!,
		status: "reading",
		currentChapter: 12,
		addedAt: "2024-01-15T00:00:00Z",
	},
	{
		manga: mockManga[1]!,
		status: "reading",
		currentChapter: 8,
		addedAt: "2024-02-01T00:00:00Z",
	},
	{
		manga: mockManga[2]!,
		status: "plan_to_read",
		currentChapter: 0,
		addedAt: "2024-03-10T00:00:00Z",
	},
	{
		manga: mockManga[4]!,
		status: "completed",
		currentChapter: 18,
		addedAt: "2024-01-20T00:00:00Z",
	},
	{
		manga: mockManga[5]!,
		status: "on_hold",
		currentChapter: 5,
		addedAt: "2024-05-01T00:00:00Z",
	},
];
