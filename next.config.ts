import type {NextConfig} from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
  // Cloudflare Pages compatibility
  output: 'export',
  distDir: 'out',
  // Disable server-side features for static export
  // experimental: {
  //   esmExternals: 'loose'
  // }
};

export default nextConfig;
