'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import type { Prospect, ProspectStatusValue } from '@/lib/supabase/types';
import { PROSPECT_STATUS_LABELS, PROSPECT_STATUSES } from '@/lib/supabase/types';
import styles from '../admin.module.css';

// One dense line per prospect. The previous card rendered seven meta blocks, a quote and a gap
// list for every row, which made a 70-row list unscannable. Everything is still here - it now
// lives behind the expand toggle, so the default view is a list you can run your eye down.

function flagFor(country: string): string {
  const code = country.trim().toUpperCase();
  if (code.length !== 2) return '';
  const A = 0x1f1e6;
  return String.fromCodePoint(A + (code.charCodeAt(0) - 65), A + (code.charCodeAt(1) - 65));
}

async function readError(response: Response): Promise<string> {
  try {
    const data = (await response.json()) as { error?: string };
    return data.error || `${response.status} ${response.statusText}`;
  } catch {
    return `${response.status} ${response.statusText}`;
  }
}

function scoreTier(score: number): string {
  if (score >= 70) return styles.scoreHigh;
  if (score >= 45) return styles.scoreMid;
  return styles.scoreLow;
}

export default function ProspectRow({ prospect }: { prospect: Prospect }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [open, setOpen] = useState(false);
  const [status, setStatus] = useState<ProspectStatusValue>(prospect.status);
  const [notes, setNotes] = useState(prospect.notes ?? '');
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const patch = async (payload: Record<string, unknown>, onOk: () => void) => {
    setBusy(true);
    setError(null);
    setSaved(false);
    try {
      const response = await fetch(`/api/admin/prospects/${prospect.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!response.ok) throw new Error(await readError(response));
      onOk();
      setSaved(true);
      router.refresh();
      window.setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Update failed');
    } finally {
      setBusy(false);
    }
  };

  const changeStatus = (next: ProspectStatusValue) => {
    const previous = status;
    setStatus(next);
    patch({ status: next }, () => {}).catch(() => setStatus(previous));
  };

  const igUrl = prospect.instagram
    ? `https://instagram.com/${prospect.instagram.replace(/^@/, '')}`
    : null;
  const emailHref =
    prospect.contact_route === 'email' && prospect.contact_value
      ? `mailto:${prospect.contact_value}`
      : null;

  return (
    <div className={`${styles.rowItem} ${open ? styles.rowItemOpen : ''}`}>
      <div className={styles.rowMain}>
        <button
          type="button"
          className={styles.rowToggle}
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-label={`${open ? 'Hide' : 'Show'} details for ${prospect.brand}`}
        >
          <span className={open ? styles.caretOpen : styles.caret} aria-hidden="true">›</span>
        </button>

        <span className={`${styles.scoreChip} ${scoreTier(prospect.score)}`} title={prospect.score_reasons.join(' · ')}>
          {prospect.score}
        </span>

        <span className={styles.rowName}>
          <strong>{prospect.brand}</strong>
          {prospect.name ? <span className={styles.rowPerson}>{prospect.name}</span> : null}
        </span>

        <span className={styles.rowMeta}>
          {prospect.product_category}
          {prospect.country ? ` · ${flagFor(prospect.country)} ${prospect.country}` : ''}
          {prospect.founded_year ? ` · ${prospect.founded_year}` : ''}
        </span>

        <span className={styles.rowLinks}>
          {igUrl ? (
            <a href={igUrl} target="_blank" rel="noreferrer noopener" title={prospect.instagram} className={styles.iconLink}>IG</a>
          ) : null}
          {prospect.linkedin ? (
            <a href={prospect.linkedin} target="_blank" rel="noreferrer noopener" title="LinkedIn" className={styles.iconLink}>Li</a>
          ) : null}
          {emailHref ? (
            <a href={emailHref} title={prospect.contact_value} className={styles.iconLink}>@</a>
          ) : null}
          {prospect.website ? (
            <a href={prospect.website} target="_blank" rel="noreferrer noopener" title={prospect.website} className={styles.iconLink}>↗</a>
          ) : null}
        </span>

        <select
          className={styles.rowSelect}
          value={status}
          onChange={(e) => changeStatus(e.target.value as ProspectStatusValue)}
          disabled={busy}
          aria-label={`Status for ${prospect.brand}`}
        >
          {PROSPECT_STATUSES.map((value) => (
            <option key={value} value={value}>{PROSPECT_STATUS_LABELS[value]}</option>
          ))}
        </select>

        {saved ? <span className={styles.rowSaved}>✓</span> : null}
      </div>

      {open ? (
        <div className={styles.rowDetail}>
          <p className={styles.rowDetailText}>{prospect.signal_summary}</p>

          {prospect.signal_quote ? (
            <blockquote className={styles.prospectQuote}>“{prospect.signal_quote}”</blockquote>
          ) : null}

          {prospect.tech_gaps.length > 0 ? (
            <ul className={styles.prospectGaps}>
              {prospect.tech_gaps.map((gap) => <li key={gap}>{gap}</li>)}
            </ul>
          ) : null}

          <div className={styles.rowDetailLinks}>
            <a href={prospect.source_url} target="_blank" rel="noreferrer noopener">Source ↗</a>
            {prospect.phone ? <a href={`tel:${prospect.phone}`}>{prospect.phone}</a> : null}
            {!prospect.verified ? <span className={styles.rowUnverified}>Unverified</span> : null}
            {prospect.needs_manufacturing === 'yes' ? <span className={styles.rowTag}>Needs manufacturing</span> : null}
            {prospect.last_contacted_at ? (
              <span className={styles.muted}>Contacted {new Date(prospect.last_contacted_at).toLocaleDateString()}</span>
            ) : null}
          </div>

          <textarea
            className={styles.rowNotes}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            onBlur={() => { if (notes !== (prospect.notes ?? '')) patch({ notes }, () => {}); }}
            rows={2}
            placeholder="Notes — saved when you click away"
            aria-label={`Notes for ${prospect.brand}`}
          />

          {error ? <div className={styles.inlineError}>{error}</div> : null}
        </div>
      ) : null}
    </div>
  );
}
