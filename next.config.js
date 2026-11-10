/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  compress: true,
  poweredByHeader: false,
  // Packages with native binaries stay out of the server bundle.
  serverExternalPackages: ['ffmpeg-static', 'ffprobe-static', 'fluent-ffmpeg', 'sharp'],
  images: {
    unoptimized: false,
    formats: ['image/avif', 'image/webp'],
    minimumCacheTTL: 60,
  },
  headers: async () => {
    // Cache rules are scoped to static media only. A blanket '/:path*' rule also
    // matched HTML documents and /_next/static chunks — which meant visitors
    // could be served an hour-old page and its stale JS after a deploy. Next
    // already applies immutable caching to its own hashed assets.
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
      {
        // The hero film's frames are large and change only when the film does,
        // so repeat visitors keep them for a week instead of re-downloading.
        source: '/assets/hero/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=604800, stale-while-revalidate=86400',
          },
        ],
      },
      {
        // The admin must never appear in search results.
        source: '/admin/:path*',
        headers: [{ key: 'X-Robots-Tag', value: 'noindex, nofollow' }],
      },
      {
        // Baseline hardening for every response. No CSP here on purpose: the
        // site relies on inline theme/motion boot scripts and a Google Maps
        // embed, so a policy needs nonces and its own testing pass.
        source: '/:path*',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
          // Browsers ignore this over plain http, so it is safe to send everywhere.
          { key: 'Strict-Transport-Security', value: 'max-age=31536000; includeSubDomains' },
          // Only what is safe without nonces: no framing by other sites, no
          // plugins, no rewriting of <base>, forms may post only to this site.
          {
            key: 'Content-Security-Policy',
            value: "frame-ancestors 'self'; base-uri 'self'; form-action 'self'; object-src 'none'",
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=(), interest-cohort=()',
          },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
