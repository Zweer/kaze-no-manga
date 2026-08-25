import { DesktopNav, MobileNav, NoiseOverlay } from "@/components/layout";

export default function AppLayout({ children }: { children: React.ReactNode }) {
	return (
		<>
			<NoiseOverlay />
			<DesktopNav />
			<main className="mx-auto w-full max-w-5xl px-4 pb-24 pt-6 md:px-6 md:pb-6 md:pt-20">
				{children}
			</main>
			<MobileNav />
		</>
	);
}
