import type { Metadata } from 'next';
import Services from '@/sections/services/Services';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

export const metadata: Metadata = {
  title: 'Services',
  description:
    'High-performance web apps, mobile experiences, and AI automations engineered for growth.',
  alternates: { canonical: '/services' },
  openGraph: {
    type: 'website',
    url: `${siteUrl}/services`,
    title: 'EscaLeads Services',
    description:
      'High-performance web apps, mobile experiences, and AI automations engineered for growth.',
  },
};

export default function ServicesPage() {
  return <Services />;
}
