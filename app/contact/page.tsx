import type { Metadata } from 'next';
import Contact from '@/sections/contact/Contact';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

export const metadata: Metadata = {
  title: 'Contact',
  description: 'Share your goals and we will respond with a clear next step.',
  alternates: { canonical: '/contact' },
  openGraph: {
    type: 'website',
    url: `${siteUrl}/contact`,
    title: 'Contact EscaLeads',
    description: 'Share your goals and we will respond with a clear next step.',
  },
};

export default function ContactPage() {
  return <Contact />;
}
