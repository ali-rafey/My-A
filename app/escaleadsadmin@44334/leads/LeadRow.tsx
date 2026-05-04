'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import type { Lead } from '@/lib/supabase/types';
import styles from '../admin.module.css';

// Render a flag emoji for a 2-letter country code (purely cosmetic; falls back to empty string).
function flagFor(country: string | null): string {
  if (!country || country.length !== 2) return '';
  const A = 0x1f1e6;
  return String.fromCodePoint(A + (country.charCodeAt(0) - 65), A + (country.charCodeAt(1) - 65));
}

function formatLocation(lead: Pick<Lead, 'city' | 'region' | 'country'>): string {
  return [lead.city, lead.region, lead.country].filter(Boolean).join(', ');
}

export default function LeadRow({ lead, formattedDate }: { lead: Lead; formattedDate: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [read, setRead] = useState(lead.read);

  const toggleRead = async () => {
    setBusy(true);
    try {
      const response = await fetch(`/api/admin/leads/${lead.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ read: !read }),
      });
      if (!response.ok) throw new Error('Update failed');
      setRead((prev) => !prev);
      router.refresh();
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Update failed');
    } finally {
      setBusy(false);
    }
  };

  const remove = async () => {
    if (!confirm('Delete this lead? This cannot be undone.')) return;
    setBusy(true);
    try {
      const response = await fetch(`/api/admin/leads/${lead.id}`, { method: 'DELETE' });
      if (!response.ok) throw new Error('Delete failed');
      router.refresh();
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Delete failed');
    } finally {
      setBusy(false);
    }
  };

  return (
    <tr style={read ? { opacity: 0.7 } : undefined}>
      <td>
        <span className={`${styles.badge} ${read ? styles.badgeRead : styles.badgeUnread}`}>
          {read ? 'Read' : 'Unread'}
        </span>
      </td>
      <td><strong>{lead.name}</strong></td>
      <td>
        <a className={styles.linkRow} href={`mailto:${lead.email}`}>{lead.email}</a>
      </td>
      <td>{lead.phone ? <a className={styles.linkRow} href={`tel:${lead.phone}`}>{lead.phone}</a> : '—'}</td>
      <td>
        <div className={styles.leadDetails}>{lead.message}</div>
      </td>
      <td>
        {lead.city || lead.region || lead.country ? (
          <span title={[lead.city, lead.region, lead.country].filter(Boolean).join(', ')}>
            {flagFor(lead.country)} {formatLocation(lead) || '—'}
          </span>
        ) : (
          <span style={{ color: 'var(--color-silver-dark)' }}>—</span>
        )}
      </td>
      <td>
        {lead.ip_address ? (
          <code style={{ fontSize: '0.8rem', color: 'var(--color-silver-dark)' }}>{lead.ip_address}</code>
        ) : (
          <span style={{ color: 'var(--color-silver-dark)' }}>—</span>
        )}
      </td>
      <td>{formattedDate}</td>
      <td>
        <div className={styles.tableActions}>
          <button
            type="button"
            className={`${styles.button} ${styles.buttonGhost}`}
            onClick={toggleRead}
            disabled={busy}
          >
            {read ? 'Mark unread' : 'Mark read'}
          </button>
          <button
            type="button"
            className={`${styles.button} ${styles.buttonDanger}`}
            onClick={remove}
            disabled={busy}
          >
            Delete
          </button>
        </div>
      </td>
    </tr>
  );
}
