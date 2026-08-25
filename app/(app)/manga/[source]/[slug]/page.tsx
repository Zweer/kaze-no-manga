export default function MangaDetailPage() {
	return (
		<div className="space-y-6">
			<div className="space-y-2">
				<h1 className="font-heading text-3xl font-bold">Manga Title</h1>
				<p className="text-sm text-muted-foreground">Source • Status</p>
			</div>

			<div className="aspect-[3/4] w-48 rounded-xl bg-card" />

			<div className="space-y-2">
				<h2 className="font-heading text-xl font-semibold">Chapters</h2>
				<p className="text-muted-foreground">Chapter list will appear here.</p>
			</div>
		</div>
	);
}
