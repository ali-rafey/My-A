import type { Metadata } from 'next';
import HowItWorks from '@/sections/how-it-works/HowItWorks';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

export const metadata: Metadata = {
  title: 'How It Works',
  description: 'A simple, transparent process — discovery, build, growth.',
  alternates: { canonical: '/how-it-works' },
  openGraph: {
    type: 'website',
    url: `${siteUrl}/how-it-works`,
    title: 'How EscaLeads Works',
    description: 'A simple, transparent process — discovery, build, growth.',
  },
};

export default function HowItWorksPage() {
  return <HowItWorks />;
}
