import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import Navbar from '@/components/navbar/Navbar';
import '@/styles/index.css';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
  preload: true,
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

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
  return (
    <html lang="en" className={inter.variable}>
      <body>
        <Navbar />
        <main>{children}</main>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(orgJsonLd) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }}
        />
      </body>
    </html>
  );
}
