import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Admin',
  description: 'EscaLeads admin portal.',
  robots: { index: false, follow: false, nocache: true, googleBot: { index: false, follow: false } },
};

// We override the public-site Navbar by NOT rendering it here.
// The root layout still wraps everything; admin pages use their own AdminTopbar.
export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
