"use client";

import { Check, KeyRound, Plus } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { PageHeading } from "@/components/page-heading";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { authClient, useSession } from "@/lib/auth-client";
import { getInitials } from "@/lib/utils";

export default function SettingsPage() {
	const { data: session, isPending } = useSession();
	const [passkeyStatus, setPasskeyStatus] = useState<"idle" | "registering" | "success" | "error">(
		"idle",
	);

	const handleRegisterPasskey = async () => {
		try {
			setPasskeyStatus("registering");
			await authClient.passkey.addPasskey();
			setPasskeyStatus("success");
			toast.success("Passkey registered successfully");
		} catch {
			setPasskeyStatus("error");
			toast.error("Failed to register passkey");
		}
	};

	if (isPending) {
		return (
			<div className="space-y-6">
				<PageHeading title="Settings" />
				<Skeleton className="h-40 rounded-xl" />
			</div>
		);
	}

	if (!session?.user) {
		return (
			<div className="flex flex-col items-center py-20">
				<p className="text-muted-foreground">Sign in to view settings</p>
			</div>
		);
	}

	const { user } = session;

	return (
		<div className="space-y-6">
			<PageHeading title="Settings" />

			<Card>
				<CardHeader>
					<CardTitle>Account</CardTitle>
					<CardDescription>Your account information</CardDescription>
				</CardHeader>
				<CardContent>
					<div className="flex items-center gap-4">
						<Avatar className="size-14">
							<AvatarImage src={user.image ?? undefined} alt={user.name ?? "User"} />
							<AvatarFallback className="bg-primary text-primary-foreground">
								{getInitials(user.name)}
							</AvatarFallback>
						</Avatar>
						<div>
							<p className="font-medium">{user.name}</p>
							<p className="text-sm text-muted-foreground">{user.email}</p>
						</div>
					</div>
				</CardContent>
			</Card>

			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<KeyRound className="size-5" />
						Passkeys
					</CardTitle>
					<CardDescription>
						Use biometrics or a security key to sign in without a password
					</CardDescription>
				</CardHeader>
				<CardContent>
					<Button
						onClick={handleRegisterPasskey}
						disabled={passkeyStatus === "registering" || passkeyStatus === "success"}
						variant="outline"
						className="cursor-pointer gap-2"
					>
						{passkeyStatus === "success" ? (
							<>
								<Check className="size-4" />
								Passkey registered
							</>
						) : (
							<>
								<Plus className="size-4" />
								{passkeyStatus === "registering" ? "Registering..." : "Add a passkey"}
							</>
						)}
					</Button>
					{passkeyStatus === "error" && (
						<p className="mt-2 text-sm text-destructive">
							Failed to register passkey. Please try again.
						</p>
					)}
				</CardContent>
			</Card>

			<Separator />

			<p className="text-center text-xs text-muted-foreground">Kaze no Manga v0.1.0</p>
		</div>
	);
}
