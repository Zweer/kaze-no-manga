"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const navItems = [
	{ href: "/", label: "Search" },
	{ href: "/library", label: "Library" },
	{ href: "/settings", label: "Settings" },
];

export function DesktopNav() {
	const pathname = usePathname();

	return (
		<header className="fixed top-0 right-0 left-0 z-50 hidden md:block">
			<div className="mx-auto flex max-w-5xl items-center justify-between border-b border-white/5 bg-background/40 px-6 py-4 backdrop-blur-2xl">
				<Link href="/" className="flex items-baseline gap-2">
					<span className="font-heading text-xl font-bold">Kaze</span>
					<span className="text-xs text-muted-foreground">風の漫画</span>
				</Link>

				<nav className="flex items-center gap-1">
					{navItems.map((item) => {
						const isActive = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
						return (
							<Link
								key={item.href}
								href={item.href}
								className={cn(
									"relative rounded-lg px-4 py-2 text-sm font-medium transition-colors",
									isActive ? "text-foreground" : "text-muted-foreground hover:text-foreground",
								)}
							>
								{item.label}
								{isActive && (
									<span className="absolute bottom-1 left-1/2 size-1 -translate-x-1/2 rounded-full bg-primary" />
								)}
							</Link>
						);
					})}
				</nav>
			</div>
		</header>
	);
}
