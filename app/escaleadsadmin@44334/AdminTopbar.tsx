'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState } from 'react';
import styles from './admin.module.css';

const ADMIN_BASE = '/escaleadsadmin@44334';

const links = [
  { href: `${ADMIN_BASE}`, label: 'Dashboard', exact: true },
  { href: `${ADMIN_BASE}/blogs`, label: 'Blogs' },
  { href: `${ADMIN_BASE}/leads`, label: 'Leads' },
  { href: `${ADMIN_BASE}/diagnostics`, label: 'Diagnostics' },
];

export default function AdminTopbar() {
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
    <div className={styles.topbar}>
      <div className={styles.brand}>EscaLeads Admin</div>
      <nav className={styles.nav}>
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={`${styles.navLink} ${isActive(link.href, link.exact) ? styles.navLinkActive : ''}`}
          >
            {link.label}
          </Link>
        ))}
      </nav>
      <button type="button" className={styles.logout} onClick={handleLogout} disabled={busy}>
        {busy ? 'Logging out…' : 'Logout'}
      </button>
    </div>
  );
}
