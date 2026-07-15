import type { Metadata } from 'next';
import MeetAli from '@/sections/meet-ali/MeetAli';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

export const metadata: Metadata = {
  title: 'Meet Ali',
  description:
    "Ali's personal portfolio — who he is, what he builds, and an interactive lab: the Pinch Portal (real-time hand tracking in your browser) and his AI assistant.",
  alternates: { canonical: '/meet-ali' },
  openGraph: {
    type: 'website',
    url: `${siteUrl}/meet-ali`,
    title: 'Meet Ali — Portfolio & Interactive Lab',
    description:
      'Pinch with both hands and a live portal opens between them. Real-time hand tracking, fully in-browser.',
  },
};

export default function MeetAliPage() {
  return <MeetAli />;
}
