import type { NextConfig } from "next";

const nextConfig: NextConfig = {
	images: {
		remotePatterns: [
			{ protocol: "https", hostname: "uploads.mangadex.org" },
			{ protocol: "https", hostname: "meo.comick.pictures" },
			{ protocol: "https", hostname: "media.omegascans.org" },
		],
	},
};

export default nextConfig;
