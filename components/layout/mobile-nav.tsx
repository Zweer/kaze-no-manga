"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Search, BookOpen } from "lucide-react";
import { cn } from "@/lib/utils";
import { UserMenu } from "@/components/user-menu";

const navItems = [
	{ href: "/", icon: Search, label: "Search" },
	{ href: "/library", icon: BookOpen, label: "Library" },
];

export function MobileNav() {
	const pathname = usePathname();

	return (
		<nav className="fixed bottom-6 left-6 right-6 z-50 md:hidden">
			<div className="flex items-center justify-around rounded-3xl border border-white/10 bg-black/60 px-6 py-3 backdrop-blur-2xl">
				{navItems.map((item) => {
					const isActive = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
					return (
						<Link
							key={item.href}
							href={item.href}
							className="flex flex-col items-center gap-1"
						>
							<item.icon
								className={cn(
									"size-5 transition-colors",
									isActive ? "text-primary" : "text-muted-foreground",
								)}
							/>
							<span
								className={cn(
									"text-[10px] font-bold uppercase tracking-wider transition-colors",
									isActive ? "text-primary" : "text-muted-foreground",
								)}
							>
								{item.label}
							</span>
						</Link>
					);
				})}
				<UserMenu />
			</div>
		</nav>
	);
}
