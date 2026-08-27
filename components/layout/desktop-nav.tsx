"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { UserMenu } from "@/components/user-menu";
import { cn } from "@/lib/utils";
import { navItems } from "./nav-items";

export function DesktopNav() {
	const pathname = usePathname();

	return (
		<header className="fixed top-0 right-0 left-0 z-50 hidden md:block">
			<div className="mx-auto flex max-w-5xl items-center justify-between border-b border-white/5 bg-background/40 px-6 py-4 backdrop-blur-2xl">
				<Link href="/" className="flex items-center">
					<Image
						src="/images/wordmark.png"
						alt="Kaze no Manga"
						width={120}
						height={40}
						className="h-8 w-auto"
						priority
					/>
				</Link>

				<div className="flex items-center gap-4">
					<nav aria-label="Main navigation" className="flex items-center gap-1">
						{navItems.map((item) => {
							const isActive =
								item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
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
					<UserMenu />
				</div>
			</div>
		</header>
	);
}
