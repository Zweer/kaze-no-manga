import type { LucideIcon } from "lucide-react";
import { BookOpen, Search } from "lucide-react";

export interface NavItem {
	href: string;
	label: string;
	icon: LucideIcon;
}

export const navItems: NavItem[] = [
	{ href: "/", label: "Search", icon: Search },
	{ href: "/library", label: "Library", icon: BookOpen },
];
