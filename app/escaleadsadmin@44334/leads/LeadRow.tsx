'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import type { Lead } from '@/lib/supabase/types';
import styles from '../admin.module.css';

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
