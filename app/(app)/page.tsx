export default function SearchPage() {
	return (
		<div className="space-y-6">
			<div className="space-y-2">
				<h1 className="font-heading text-4xl font-black md:text-6xl">Kaze</h1>
				<p className="text-sm text-muted-foreground">Search for your next journey</p>
			</div>

			<div className="h-16 w-full rounded-xl border border-input bg-card/50 px-5 py-4 text-muted-foreground">
				Search manga...
			</div>

			<div className="flex items-center justify-center py-20">
				<p className="text-4xl text-muted-foreground/20 font-heading select-none">風の漫画</p>
			</div>
		</div>
	);
}
