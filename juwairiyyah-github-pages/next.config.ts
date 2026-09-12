import type { NextConfig } from 'next';

const nextConfig: NextConfig =
  process.env.GITHUB_PAGES_BUILD === '1'
    ? {
        output: 'export',
        trailingSlash: true,
        // Vinext currently prerenders / without prepending Next's basePath.
        // Vite owns the asset base; native page/deck URLs preserve location.pathname.
        assetPrefix: process.env.NEXT_PUBLIC_SITE_BASE_PATH || '',
        images: { unoptimized: true },
      }
    : {};

export default nextConfig;
