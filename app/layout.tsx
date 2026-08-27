import type { Metadata, Viewport } from "next";
import { Inter, Poppins } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";

const inter = Inter({
	variable: "--font-inter",
	subsets: ["latin"],
});

const poppins = Poppins({
	variable: "--font-poppins",
	subsets: ["latin"],
	weight: ["400", "500", "600", "700", "800", "900"],
});

export const metadata: Metadata = {
	title: {
		default: "Kaze no Manga — 風の漫画",
		template: "%s | Kaze no Manga",
	},
	description:
		"Never lose your place in manga again. Search, read, and track your manga progress across devices.",
	manifest: "/manifest.json",
	icons: {
		icon: [
			{ url: "/favicon.ico", sizes: "48x48" },
			{ url: "/icon-192.png", sizes: "192x192", type: "image/png" },
			{ url: "/icon-512.png", sizes: "512x512", type: "image/png" },
		],
		apple: { url: "/apple-touch-icon.png", sizes: "180x180" },
	},
	openGraph: {
		title: "Kaze no Manga — 風の漫画",
		description:
			"Never lose your place in manga again. Search, read, and track your manga progress across devices.",
		type: "website",
		siteName: "Kaze no Manga",
		images: [
			{
				url: "/og-image.png",
				width: 1200,
				height: 630,
				alt: "Kaze no Manga — 風の漫画",
			},
		],
	},
	twitter: {
		card: "summary_large_image",
		title: "Kaze no Manga — 風の漫画",
		description: "Never lose your place in manga again.",
		images: ["/twitter-image.png"],
	},
};

export const viewport: Viewport = {
	width: "device-width",
	initialScale: 1,
	themeColor: "#0d0b14",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
	return (
		<html lang="en" className={`${inter.variable} ${poppins.variable} dark`}>
			<body className="min-h-dvh antialiased">
				{children}
				<Toaster />
			</body>
		</html>
	);
}
