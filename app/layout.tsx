import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
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
  icons: { icon: '/favicon.ico' },
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
  logo: `${siteUrl}/og-image.png`,
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
    <html lang="en" className={inter.variable}>
      <head>
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
      <body>
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
