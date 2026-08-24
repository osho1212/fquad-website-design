/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  compress: true,
  poweredByHeader: false,
  experimental: {
    serverComponentsExternalPackages: ['ffmpeg-static', 'ffprobe-static', 'fluent-ffmpeg', 'sharp'],
  },
  images: {
    unoptimized: false,
    formats: ['image/avif', 'image/webp'],
    minimumCacheTTL: 60,
  },
  headers: async () => {
    // Scoped to static media only. A blanket '/:path*' rule also matched HTML
    // documents and /_next/static chunks — which meant visitors could be served
    // an hour-old page and its stale JS after a deploy. Next already applies
    // immutable caching to its own hashed assets, so it needs no help here.
    return [
      {
        source: '/assets/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=3600, stale-while-revalidate=86400',
          },
        ],
      },
    ];
  },
};

module.exports = nextConfig;