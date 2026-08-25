"use client";

import { authClient, signIn } from "@/lib/auth-client";

export default function LoginPage() {
	const handleGoogleSignIn = async () => {
		await signIn.social({
			provider: "google",
			callbackURL: "/",
		});
	};

	const handlePasskeySignIn = async () => {
		await authClient.signIn.passkey();
	};

	return (
		<div className="flex min-h-screen items-center justify-center">
			<div className="w-full max-w-sm space-y-6 p-8">
				<div className="text-center">
					<h1 className="text-3xl font-bold">Kaze no Manga</h1>
					<p className="mt-2 text-sm text-gray-500">風の漫画</p>
				</div>

				<div className="space-y-3">
					<button
						onClick={handleGoogleSignIn}
						type="button"
						className="w-full rounded-lg bg-white px-4 py-3 text-sm font-medium text-gray-900 shadow-sm ring-1 ring-gray-300 hover:bg-gray-50"
					>
						Sign in with Google
					</button>

					<button
						onClick={handlePasskeySignIn}
						type="button"
						className="w-full rounded-lg bg-purple-600 px-4 py-3 text-sm font-medium text-white hover:bg-purple-700"
					>
						Sign in with Passkey
					</button>
				</div>
			</div>
		</div>
	);
}
