import Image from "next/image";
import Link from "next/link";

export default function NotFound() {
	return (
		<div className="flex min-h-dvh flex-col items-center justify-center gap-6 px-4">
			<Image
				src="/images/manga-wind.png"
				alt=""
				width={300}
				height={200}
				className="w-48 opacity-30 md:w-64"
			/>
			<div className="text-center">
				<p className="font-heading text-6xl font-black text-muted-foreground/20">404</p>
				<h1 className="mt-2 font-heading text-2xl font-bold">Page not found</h1>
				<p className="mt-2 text-sm text-muted-foreground">
					The page you're looking for doesn't exist or has been moved.
				</p>
			</div>
			<Link
				href="/"
				className="rounded-lg bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
			>
				Go home
			</Link>
		</div>
	);
}
