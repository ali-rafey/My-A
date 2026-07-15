import type { MetadataRoute } from 'next';

// Web app manifest — a recognised technical-SEO / mobile signal (installability,
// theme colour, app name). Served same-origin, allowed by the CSP default-src.
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'EscaLeads — Software Solutions for Global Business Growth',
    short_name: 'EscaLeads',
    description:
      'EscaLeads designs and ships software, mobile apps, and AI automations that help businesses grow faster.',
    start_url: '/',
    display: 'standalone',
    background_color: '#FFFFFF',
    theme_color: '#1A4FBF',
    icons: [
      { src: '/logo-icon.png', sizes: '500x500', type: 'image/png', purpose: 'any' },
      { src: '/logo-icon.png', sizes: '500x500', type: 'image/png', purpose: 'maskable' },
    ],
  };
}
