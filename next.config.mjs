// Next.js config
// Stack rationale (per Phase 2 brief):
// - Next.js 14 App Router: SSR + SSG + ISR for top-tier SEO. Homepage is SSG (static, zero client fetches), /blogs is ISR (revalidates without redeploy when admin publishes), /blogs/[slug] is generateStaticParams + ISR. Admin and API routes are dynamic.
// - Strict Content-Security-Policy via headers() below; report-only is intentionally not used because admin payloads are tightly scoped.
// - Image optimization with AVIF/WebP enabled out of the box.
// - poweredByHeader off to avoid leaking framework signature.

/** @type {import('next').NextConfig} */
const ContentSecurityPolicy = [
  "default-src 'self'",
  // next/script needs 'unsafe-inline' for the inline runtime; GA4 loads gtag.js from googletagmanager.com.
  "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.googletagmanager.com https://*.googletagmanager.com",
  "style-src 'self' 'unsafe-inline' fonts.googleapis.com",
  "font-src 'self' fonts.gstatic.com data:",
  // GA pixels and tag-manager preview UI need to load from these domains.
  "img-src 'self' data: blob: https:",
  // GA4 beacons hit google-analytics.com / analytics.google.com / *.g.doubleclick.net.
  "connect-src 'self' https://*.supabase.co wss://*.supabase.co https://www.google-analytics.com https://*.analytics.google.com https://*.googletagmanager.com https://*.g.doubleclick.net",
  "frame-ancestors 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "object-src 'none'",
  'upgrade-insecure-requests',
].join('; ');

const securityHeaders = [
  { key: 'Content-Security-Policy', value: ContentSecurityPolicy },
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=(), interest-cohort=()' },
  { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
  { key: 'X-DNS-Prefetch-Control', value: 'on' },
];

const nextConfig = {
  poweredByHeader: false,
  reactStrictMode: true,
  compress: true,
  images: {
    formats: ['image/avif', 'image/webp'],
    remotePatterns: [
      { protocol: 'https', hostname: '**' },
    ],
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: securityHeaders,
      },
      {
        // /meet-ali hosts the Pinch Portal, an in-browser camera experience.
        // Same locked-down headers as everywhere else, except camera is allowed
        // for our own origin on THIS route only (getUserMedia stays blocked on
        // every other page). Later entries override earlier ones per header key.
        source: '/meet-ali',
        headers: securityHeaders.map((h) =>
          h.key === 'Permissions-Policy'
            ? { key: h.key, value: h.value.replace('camera=()', 'camera=(self)') }
            : h,
        ),
      },
    ];
  },
  experimental: {
    serverActions: { bodySizeLimit: '1mb' },
  },
};

export default nextConfig;
