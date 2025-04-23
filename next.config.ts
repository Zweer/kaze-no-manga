import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    remotePatterns: [
      { hostname: 'media.omegascans.org' },
    ],
  },
};

export default nextConfig;
