import type {NextConfig} from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  // Removed static export to support API routes
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
