interface PageHeadingProps {
	title: string;
	children?: React.ReactNode;
}

export function PageHeading({ title, children }: PageHeadingProps) {
	return (
		<div className="flex items-center justify-between">
			<div className="space-y-2">
				<h1 className="font-heading text-3xl font-bold">{title}</h1>
				<div className="h-1 w-12 rounded-full bg-primary" />
			</div>
			{children}
		</div>
	);
}
