export default function SearchPage() {
	return (
		<div className="space-y-8">
			<div className="h-16 w-full rounded-xl border border-input bg-card/50 px-5 py-4 text-muted-foreground">
				Search manga...
			</div>

			<div className="flex flex-col items-center justify-center py-20">
				<p className="select-none font-heading text-5xl text-muted-foreground/10 md:text-7xl">
					風の漫画
				</p>
				<p className="mt-4 text-sm text-muted-foreground">
					Search for your next journey
				</p>
			</div>
		</div>
	);
}
