'use client';

// Left-anchored sidebar that replaces the previous AdminTopbar. Renders the brand mark, primary
// admin nav, and a logout action pinned to the bottom. The pages themselves keep the same shell
// structure (<div className={styles.shell}>) — the shell now renders flex row, so this sidebar
// sits to the left of the page container without touching any page-level markup.
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState } from 'react';
import styles from './admin.module.css';

const ADMIN_BASE = '/escaleadsadmin@44334';

type NavItem = { href: string; label: string; exact?: boolean };

const PRIMARY_LINKS: NavItem[] = [
  { href: `${ADMIN_BASE}`, label: 'Dashboard', exact: true },
  { href: `${ADMIN_BASE}/blogs`, label: 'Blogs' },
  { href: `${ADMIN_BASE}/leads`, label: 'Leads' },
  { href: `${ADMIN_BASE}/diagnostics`, label: 'Diagnostics' },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  const handleLogout = async () => {
    setBusy(true);
    try {
      await fetch('/api/admin/logout', { method: 'POST' });
      router.push(ADMIN_BASE);
      router.refresh();
    } finally {
      setBusy(false);
    }
  };

  const isActive = (href: string, exact?: boolean) =>
    exact ? pathname === href : pathname.startsWith(href);

  return (
    <aside className={styles.sidebar} aria-label="Admin navigation">
      <div className={styles.brand}>
        <span className={styles.brandMark} aria-hidden="true" />
        <span className={styles.brandText}>EscaLeads</span>
      </div>

      <nav className={styles.nav}>
        <div className={styles.navSectionLabel}>Workspace</div>
        {PRIMARY_LINKS.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={`${styles.navLink} ${isActive(link.href, link.exact) ? styles.navLinkActive : ''}`}
          >
            <span className={styles.navLinkIndicator} aria-hidden="true" />
            <span>{link.label}</span>
          </Link>
        ))}
      </nav>

      <div className={styles.sidebarFooter}>
        <button
          type="button"
          className={styles.logout}
          onClick={handleLogout}
          disabled={busy}
        >
          {busy ? 'Signing out…' : 'Sign out'}
        </button>
      </div>
    </aside>
  );
}
