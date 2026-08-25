export default function SettingsPage() {
	return (
		<div className="space-y-6">
			<div className="space-y-2">
				<h1 className="font-heading text-3xl font-bold">Settings</h1>
				<div className="h-1 w-12 rounded-full bg-primary" />
			</div>

			<div className="space-y-4">
				<div className="rounded-xl border border-border bg-card p-4">
					<p className="text-sm text-muted-foreground">Appearance, account, and more.</p>
				</div>
			</div>
		</div>
	);
}
