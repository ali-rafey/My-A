import type { Metadata } from 'next';
import HowItWorks from '@/sections/how-it-works/HowItWorks';
import WhyBusinessesFail from '@/sections/how-it-works/WhyBusinessesFail';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

export const metadata: Metadata = {
  title: 'How It Works',
  description:
    'A simple, transparent process — discovery, build, growth. Plus the numbers that explain why most businesses fail online.',
  alternates: { canonical: '/how-it-works' },
  openGraph: {
    type: 'website',
    url: `${siteUrl}/how-it-works`,
    title: 'How EscaLeads Works',
    description:
      'A simple, transparent process — discovery, build, growth. Plus the numbers that explain why most businesses fail online.',
  },
};

export default function HowItWorksPage() {
  return (
    <>
      <HowItWorks />
      <WhyBusinessesFail />
    </>
  );
}
