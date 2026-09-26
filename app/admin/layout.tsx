import type { Metadata } from 'next';
import { getAdminSession } from '@/lib/auth/session';
import AdminSidebar from './AdminSidebar';
import styles from './admin.module.css';

export const metadata: Metadata = {
  title: 'Admin',
  description: 'EscaLeads admin portal.',
  robots: { index: false, follow: false, nocache: true, googleBot: { index: false, follow: false } },
};

// Layout mounts the admin shell (sidebar + scrollable container) ONCE and keeps it persistent
// across every admin route change — clicking between Dashboard / Blogs / Leads / Diagnostics
// only swaps `{children}`, so the sidebar no longer flashes or remounts.
//
// When the visitor isn't authenticated we render `{children}` unwrapped so the root page can
// show its own centered login layout (no sidebar context makes sense before login). This layout
// is NOT the gate for the other admin pages: each of them calls requireAdminPage() itself
// (lib/auth/require-admin-page.ts), because middleware only checks that a cookie is present and a
// page can be requested without its layout re-rendering.
export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getAdminSession();

  if (!session.isAdmin) {
    return <>{children}</>;
  }

  return (
    <div className={styles.shell}>
      <AdminSidebar />
      <div className={styles.container}>{children}</div>
    </div>
  );
}
