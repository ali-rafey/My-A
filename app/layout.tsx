import type { Metadata, Viewport } from 'next';
import { Inter, Playfair_Display } from 'next/font/google';
import Navbar from '@/components/navbar/Navbar';
import GoogleAnalytics from '@/components/analytics/GoogleAnalytics';
import StylesPreloader from './StylesPreloader';
import '@/styles/index.css';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
  preload: true,
});

// Playfair Display — high-contrast editorial serif. Used selectively for
// section headlines + display stats where a refined typographic break from
// Inter elevates the moment (e.g. the "Why Businesses Fail Online" bento).
const playfair = Playfair_Display({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-playfair',
  weight: ['400', '600', '700'],
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
const gaMeasurementId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID || 'G-1K5C057XHQ';

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: 'EscaLeads — Software Solutions for Global Business Growth',
    template: '%s | EscaLeads',
  },
  description:
    'EscaLeads designs and ships software, mobile apps, and AI automations that help businesses grow faster.',
  keywords: ['EscaLeads', 'software agency', 'web development', 'mobile apps', 'AI solutions', 'automation'],
  authors: [{ name: 'EscaLeads' }],
  creator: 'EscaLeads',
  publisher: 'EscaLeads',
  applicationName: 'EscaLeads',
  formatDetection: { email: false, telephone: false, address: false },
  alternates: { canonical: '/' },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: siteUrl,
    siteName: 'EscaLeads',
    title: 'EscaLeads — Software Solutions for Global Business Growth',
    description:
      'EscaLeads designs and ships software, mobile apps, and AI automations that help businesses grow faster.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'EscaLeads — Software Solutions for Global Business Growth',
    description:
      'EscaLeads designs and ships software, mobile apps, and AI automations that help businesses grow faster.',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, 'max-video-preview': -1, 'max-image-preview': 'large', 'max-snippet': -1 },
  },
  // Favicon/app icons resolve from the file convention (app/icon.png,
  // app/apple-icon.png) — no manual /favicon.ico reference (that file does not
  // exist and was 404ing).
};

export const viewport: Viewport = {
  themeColor: '#1A4FBF',
  width: 'device-width',
  initialScale: 1,
};

const orgJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'EscaLeads',
  url: siteUrl,
  logo: `${siteUrl}/logo-icon.png`,
  // Social/profile URLs for entity recognition (knowledge graph). Add the
  // agency's real LinkedIn / X / etc. profiles here to strengthen off-page SEO.
  sameAs: [] as string[],
  description:
    'EscaLeads designs and ships software, mobile apps, and AI automations that help businesses grow faster.',
};

const websiteJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: 'EscaLeads',
  url: siteUrl,
  potentialAction: {
    '@type': 'SearchAction',
    target: { '@type': 'EntryPoint', urlTemplate: `${siteUrl}/blogs?q={search_term_string}` },
    'query-input': 'required name=search_term_string',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  // Inline GA4 bootstrap. Lives in <head> as a plain <script> (not next/script) so it appears in
  // the SSR HTML response — required for Google Search Console GA verification, which scans the
  // static page body and does NOT execute JavaScript. send_page_view is suppressed because
  // <GoogleAnalytics /> fires its own pageview on every App Router route change (initial mount
  // included).
  const gaBootstrap = `window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
window.gtag = gtag;
gtag('js', new Date());
gtag('config', '${gaMeasurementId}', { send_page_view: false });`;

  return (
    <html
      lang="en"
      className={`${inter.variable} ${playfair.variable}`}
      // Inline background on the root element guarantees an opaque white at
      // the VERY FIRST paint — before any external/JS-injected CSS loads.
      // Without this, the brief window before the stylesheet applies leaves
      // <html> transparent, and the browser fills it (overscroll area, 100vh
      // gap, etc.) with the user's profile THEME colour for 1-2s. The matching
      // rule in global.css then keeps it white once CSS is in.
      style={{ backgroundColor: '#FFFFFF', colorScheme: 'light' }}
    >
      <head>
        {/* Critical inline CSS — render-blocking, applied before the external
            stylesheet so there is never a first-paint window where the root
            is unpainted and the browser theme colour can show through. */}
        <style
          dangerouslySetInnerHTML={{
            __html:
              'html,body{background:#fff;overscroll-behavior:none}',
          }}
        />

        {/* GA4 — server-rendered into the response body so Search Console can verify the property. */}
        {gaMeasurementId ? (
          <>
            <script
              async
              src={`https://www.googletagmanager.com/gtag/js?id=${gaMeasurementId}`}
            />
            <script dangerouslySetInnerHTML={{ __html: gaBootstrap }} />
          </>
        ) : null}

        {/* Structured data — also in <head> for SEO. */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(orgJsonLd) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }}
        />
      </head>
      <body style={{ backgroundColor: '#FFFFFF' }}>
        {/* Viewport backdrop — a real painted element fixed to the full visual
            viewport, behind all content (z-index: -1). This is the definitive
            guard against the browser's profile THEME colour ever showing
            through. Unlike an html/body background (which the browser stops
            propagating to the canvas when the root has overflow:hidden +
            height:100vh, as the Services scroll-lock sets — leaving a strip of
            raw browser canvas below the short html box), a position:fixed +
            inset:0 element ALWAYS covers the entire visible viewport,
            regardless of html height, overflow, address-bar state, or CSS
            load timing. Inline-styled + server-rendered so it's present at the
            very first paint with no stylesheet dependency. */}
        <div
          aria-hidden="true"
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: '#FFFFFF',
            zIndex: -1,
            pointerEvents: 'none',
          }}
        />

        {/* Bundles every section's CSS module into the layout's CSS chunk
            so client-side route transitions don't fetch new stylesheets
            mid-navigation (which produced a brief unstyled flash). */}
        <StylesPreloader />
        <Navbar />
        <main>{children}</main>
        {/* Client-only: tracks App Router route changes (gtag.js doesn't auto-pageview SPA navs). */}
        <GoogleAnalytics />
      </body>
    </html>
  );
}
