'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import type { Lead } from '@/lib/supabase/types';
import styles from '../admin.module.css';

// Compact one-line row, matching the Prospects list. The previous card rendered a five-cell meta
// grid plus the full message body for every lead, so a screen held about three of them.

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

export default function LeadRow({
  lead,
  formattedDate,
  rank,
}: {
  lead: Lead;
  formattedDate: string;
  rank: number;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [open, setOpen] = useState(false);
  const [read, setRead] = useState(lead.read);
  const [error, setError] = useState<string | null>(null);
  const location = formatLocation(lead);

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
  };

  return (
    <div className={`${styles.rowItem} ${open ? styles.rowItemOpen : ''}`}>
      <div className={styles.rowMain}>
        <button
          type="button"
          className={styles.rowToggle}
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-label={`${open ? 'Hide' : 'Show'} message from ${lead.name}`}
        >
          <span className={open ? styles.caretOpen : styles.caret} aria-hidden="true">›</span>
        </button>

        <span className={styles.rowRank}>{rank}</span>

        <span className={read ? styles.dotRead : styles.dotUnread} aria-hidden="true" />

        <span className={styles.rowName}>
          <strong>{lead.name}</strong>
        </span>

        <span className={styles.rowMeta}>
          {lead.email}
          {location ? ` · ${flagFor(lead.country)} ${location}` : ''}
        </span>

        <span className={styles.rowDate}>{formattedDate}</span>

        <span className={styles.rowLinks}>
          <a href={`mailto:${lead.email}`} className={styles.iconLink} title={lead.email}>@</a>
          {lead.phone ? (
            <a href={`tel:${lead.phone}`} className={styles.iconLink} title={lead.phone}>T</a>
          ) : null}
        </span>

        <button
          type="button"
          className={styles.rowAction}
          onClick={toggleRead}
          disabled={busy}
        >
          {read ? 'Unread' : 'Read'}
        </button>
      </div>

      {open ? (
        <div className={styles.rowDetail}>
          <p className={styles.rowDetailText}>{lead.message}</p>
          <div className={styles.rowDetailLinks}>
            {lead.phone ? <span>{lead.phone}</span> : null}
            {lead.ip_address ? <code className={styles.mono}>{lead.ip_address}</code> : null}
            <button
              type="button"
              className={styles.rowDanger}
              onClick={remove}
              disabled={busy}
            >
              {busy ? 'Deleting…' : 'Delete'}
            </button>
          </div>
          {error ? <div className={styles.inlineError}>{error}</div> : null}
        </div>
      ) : null}
    </div>
  );
}
