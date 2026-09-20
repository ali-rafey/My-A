import type { Metadata } from 'next';
import Services from '@/sections/services/Services';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

export const metadata: Metadata = {
  title: 'Services',
  description:
    'Market research, websites and Shopify stores, Meta and Google ads, and n8n automation: the four ways EscaLeads grows a business.',
  alternates: { canonical: '/services' },
  openGraph: {
    type: 'website',
    url: `${siteUrl}/services`,
    title: 'EscaLeads Services',
    description:
      'Market research, websites and Shopify stores, Meta and Google ads, and n8n automation: the four ways EscaLeads grows a business.',
  },
};

export default function ServicesPage() {
  return <Services />;
}
