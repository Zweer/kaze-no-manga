"use client";

import { useRouter } from "next/navigation";
import { LogOut, User } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { signOut, useSession } from "@/lib/auth-client";

export function UserMenu() {
	const router = useRouter();
	const { data: session } = useSession();

	if (!session?.user) {
		return null;
	}

	const { user } = session;
	const initials = user.name
		?.split(" ")
		.map((n) => n[0])
		.join("")
		.toUpperCase() ?? "?";

	const handleSignOut = async () => {
		await signOut();
		router.refresh();
	};

	return (
		<DropdownMenu>
			<DropdownMenuTrigger className="cursor-pointer rounded-full outline-none ring-ring focus-visible:ring-2">
				<Avatar className="size-8">
					<AvatarImage src={user.image ?? undefined} alt={user.name ?? "User"} />
					<AvatarFallback className="bg-primary text-xs text-primary-foreground">
						{initials}
					</AvatarFallback>
				</Avatar>
			</DropdownMenuTrigger>
			<DropdownMenuContent align="end" className="w-48">
				<div className="px-2 py-1.5">
					<p className="text-sm font-medium">{user.name}</p>
					<p className="text-xs text-muted-foreground">{user.email}</p>
				</div>
				<DropdownMenuSeparator />
				<DropdownMenuItem
					className="cursor-pointer"
					onClick={() => router.push("/settings")}
				>
					<User className="mr-2 size-4" />
					Settings
				</DropdownMenuItem>
				<DropdownMenuSeparator />
				<DropdownMenuItem className="cursor-pointer" onClick={handleSignOut}>
					<LogOut className="mr-2 size-4" />
					Sign out
				</DropdownMenuItem>
			</DropdownMenuContent>
		</DropdownMenu>
	);
}
