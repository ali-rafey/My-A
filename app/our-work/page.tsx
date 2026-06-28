import type { Metadata } from 'next';
import WorkShowcase from '@/sections/our-work/WorkShowcase';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

export const metadata: Metadata = {
  title: 'Our Work',
  description:
    'Recent projects from EscaLeads — e-commerce platforms, CRM dashboards, and AI chatbots.',
  alternates: { canonical: '/our-work' },
  openGraph: {
    type: 'website',
    url: `${siteUrl}/our-work`,
    title: 'Our Work',
    description:
      'Recent projects from EscaLeads — e-commerce platforms, CRM dashboards, and AI chatbots.',
  },
};

export default function OurWorkPage() {
  return <WorkShowcase />;
}
