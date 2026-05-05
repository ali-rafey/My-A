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

async function readError(response: Response): Promise<string> {
  try {
    const data = (await response.json()) as { error?: string };
    return data.error || `${response.status} ${response.statusText}`;
  } catch {
    return `${response.status} ${response.statusText}`;
  }
}

export default function LeadRow({ lead, formattedDate }: { lead: Lead; formattedDate: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [read, setRead] = useState(lead.read);
  const [error, setError] = useState<string | null>(null);
  const location = formatLocation(lead);
  const flag = flagFor(lead.country);

  const toggleRead = async () => {
    setBusy(true);
    setError(null);
    try {
      const response = await fetch(`/api/admin/leads/${lead.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ read: !read }),
      });
      if (!response.ok) throw new Error(await readError(response));
      setRead((prev) => !prev);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Update failed');
    } finally {
      setBusy(false);
    }
  };

  const remove = async () => {
    if (!confirm(`Delete the lead from ${lead.name}? This cannot be undone.`)) return;
    setBusy(true);
    setError(null);
    try {
      const response = await fetch(`/api/admin/leads/${lead.id}`, { method: 'DELETE' });
      if (!response.ok) throw new Error(await readError(response));
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Delete failed');
      setBusy(false);
    }
    // On success the row will be removed by router.refresh(), so no setBusy(false) is needed.
  };

  return (
    <article className={`${styles.card} ${styles.leadCard} ${read ? styles.leadCardRead : styles.leadCardUnread}`}>
      <div className={styles.leadCardHeader}>
        <div className={styles.leadIdentity}>
          <div className={styles.leadHeaderMeta}>
            <span className={`${styles.badge} ${read ? styles.badgeRead : styles.badgeUnread}`}>
              {read ? 'Read' : 'Unread'}
            </span>
            <span className={styles.leadTimestampValue}>Received {formattedDate}</span>
          </div>
          <h2 className={styles.leadName}>{lead.name}</h2>
        </div>
      </div>

      <div className={styles.leadMetaGrid}>
        <div className={styles.leadMetaItem}>
          <span className={styles.leadMetaLabel}>Email</span>
          <a className={styles.linkRow} href={`mailto:${lead.email}`}>{lead.email}</a>
        </div>

        <div className={styles.leadMetaItem}>
          <span className={styles.leadMetaLabel}>Phone</span>
          {lead.phone ? <a className={styles.linkRow} href={`tel:${lead.phone}`}>{lead.phone}</a> : <span className={styles.muted}>—</span>}
        </div>

        <div className={styles.leadMetaItem}>
          <span className={styles.leadMetaLabel}>Location</span>
          {location ? (
            <span className={styles.leadMetaValue} title={location}>
              {flag ? `${flag} ${location}` : location}
            </span>
          ) : (
            <span className={styles.muted}>—</span>
          )}
        </div>

        <div className={styles.leadMetaItem}>
          <span className={styles.leadMetaLabel}>IP address</span>
          {lead.ip_address ? (
            <code className={`${styles.mono} ${styles.leadCode}`}>{lead.ip_address}</code>
          ) : (
            <span className={styles.muted}>—</span>
          )}
        </div>

        <div className={`${styles.leadMetaItem} ${styles.leadMessageCard}`}>
          <span className={styles.leadMetaLabel}>Message</span>
          <div className={styles.leadDetails}>{lead.message}</div>
        </div>
      </div>

      <div className={styles.leadActions}>
        <button
          type="button"
          className={`${styles.button} ${styles.buttonGhost} ${styles.buttonSmall}`}
          onClick={toggleRead}
          disabled={busy}
        >
          {read ? 'Mark unread' : 'Mark read'}
        </button>
        <button
          type="button"
          className={`${styles.button} ${styles.buttonDanger} ${styles.buttonSmall}`}
          onClick={remove}
          disabled={busy}
        >
          {busy ? 'Deleting…' : 'Delete'}
        </button>
      </div>

      {error ? (
        <div className={`${styles.error} ${styles.leadError}`} role="alert">{error}</div>
      ) : null}
    </article>
  );
}
