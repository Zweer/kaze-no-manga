import type { Metadata, Viewport } from "next";
import { Inter, Poppins } from "next/font/google";
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
	description: "Never lose your place in manga again. Search, read, and track your manga progress across devices.",
	openGraph: {
		title: "Kaze no Manga — 風の漫画",
		description: "Never lose your place in manga again. Search, read, and track your manga progress across devices.",
		type: "website",
		siteName: "Kaze no Manga",
	},
	twitter: {
		card: "summary",
		title: "Kaze no Manga — 風の漫画",
		description: "Never lose your place in manga again.",
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
			<body className="min-h-dvh antialiased">{children}</body>
		</html>
	);
}
