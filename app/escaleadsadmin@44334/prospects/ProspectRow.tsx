'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import type { Prospect, ProspectStatusValue } from '@/lib/supabase/types';
import { PROSPECT_STATUS_LABELS, PROSPECT_STATUSES } from '@/lib/supabase/types';
import styles from '../admin.module.css';

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
  const [status, setStatus] = useState<ProspectStatusValue>(prospect.status);
  const [notes, setNotes] = useState(prospect.notes ?? '');
  const [notesOpen, setNotesOpen] = useState(false);
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

  const flag = flagFor(prospect.country);
  const contactHref =
    prospect.contact_route === 'email' && prospect.contact_value
      ? `mailto:${prospect.contact_value}`
      : prospect.contact_value.startsWith('http')
        ? prospect.contact_value
        : null;

  return (
    <article className={`${styles.card} ${styles.leadCard} ${styles.prospectCard}`}>
      <div className={styles.leadCardHeader}>
        <div className={styles.leadIdentity}>
          <div className={styles.leadHeaderMeta}>
            <span className={`${styles.scoreBadge} ${scoreTier(prospect.score)}`} title={prospect.score_reasons.join(' · ')}>
              {prospect.score}
            </span>
            <span className={styles.badge}>{PROSPECT_STATUS_LABELS[status]}</span>
            {prospect.needs_manufacturing === 'yes' ? (
              <span className={`${styles.badge} ${styles.badgeManufacturing}`}>Needs manufacturing</span>
            ) : null}
            {prospect.verified ? (
              <span className={`${styles.badge} ${styles.badgeRead}`}>Verified</span>
            ) : (
              <span className={`${styles.badge} ${styles.badgeUnverified}`}>Unverified</span>
            )}
          </div>
          <h2 className={styles.leadName}>
            {prospect.brand}
            {prospect.name ? <span className={styles.prospectPerson}> — {prospect.name}</span> : null}
          </h2>
          <p className={styles.prospectRole}>
            {[prospect.role, prospect.product_category, [flag, prospect.country].filter(Boolean).join(' ')]
              .filter(Boolean)
              .join(' · ')}
          </p>
        </div>
      </div>

      <div className={styles.prospectSignal}>
        <span className={styles.leadMetaLabel}>Why they are a fit</span>
        <p className={styles.prospectSignalText}>{prospect.signal_summary}</p>
        {prospect.signal_quote ? (
          <blockquote className={styles.prospectQuote}>“{prospect.signal_quote}”</blockquote>
        ) : null}
      </div>

      <div className={styles.leadMetaGrid}>
        <div className={styles.leadMetaItem}>
          <span className={styles.leadMetaLabel}>Source</span>
          <a className={styles.linkRow} href={prospect.source_url} target="_blank" rel="noreferrer noopener">
            {prospect.source_platform || 'View source'} ↗
          </a>
        </div>

        <div className={styles.leadMetaItem}>
          <span className={styles.leadMetaLabel}>Website</span>
          {prospect.website ? (
            <a className={styles.linkRow} href={prospect.website} target="_blank" rel="noreferrer noopener">
              {prospect.website.replace(/^https?:\/\//, '')} ↗
            </a>
          ) : (
            <span className={styles.muted}>None found</span>
          )}
        </div>

        <div className={styles.leadMetaItem}>
          <span className={styles.leadMetaLabel}>Contact ({prospect.contact_route || 'unknown'})</span>
          {contactHref ? (
            <a className={styles.linkRow} href={contactHref} target="_blank" rel="noreferrer noopener">
              {prospect.contact_value}
            </a>
          ) : (
            <span className={styles.leadMetaValue}>{prospect.contact_value || '—'}</span>
          )}
        </div>

        <div className={styles.leadMetaItem}>
          <span className={styles.leadMetaLabel}>Signal date</span>
          <span className={styles.leadMetaValue}>{prospect.signal_date || '—'}</span>
        </div>

        {prospect.tech_gaps.length > 0 ? (
          <div className={`${styles.leadMetaItem} ${styles.leadMessageCard}`}>
            <span className={styles.leadMetaLabel}>Openings to lead with</span>
            <ul className={styles.prospectGaps}>
              {prospect.tech_gaps.map((gap) => (
                <li key={gap}>{gap}</li>
              ))}
            </ul>
          </div>
        ) : null}
      </div>

      <div className={styles.leadActions}>
        <select
          className={styles.prospectSelect}
          value={status}
          onChange={(e) => changeStatus(e.target.value as ProspectStatusValue)}
          disabled={busy}
          aria-label={`Status for ${prospect.brand}`}
        >
          {PROSPECT_STATUSES.map((value) => (
            <option key={value} value={value}>{PROSPECT_STATUS_LABELS[value]}</option>
          ))}
        </select>

        <button
          type="button"
          className={`${styles.button} ${styles.buttonGhost} ${styles.buttonSmall}`}
          onClick={() => setNotesOpen((open) => !open)}
        >
          {notesOpen ? 'Hide notes' : prospect.notes ? 'Edit notes' : 'Add notes'}
        </button>

        {prospect.last_contacted_at ? (
          <span className={styles.metaText}>
            Contacted {new Date(prospect.last_contacted_at).toLocaleDateString()}
          </span>
        ) : null}
        {saved ? <span className={styles.success}>Saved</span> : null}
      </div>

      {notesOpen ? (
        <div className={styles.prospectNotes}>
          <textarea
            className={styles.prospectTextarea}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={4}
            placeholder="What you sent, what they said, what to do next…"
            aria-label={`Notes for ${prospect.brand}`}
          />
          <button
            type="button"
            className={`${styles.button} ${styles.buttonSmall}`}
            onClick={() => patch({ notes }, () => setNotesOpen(false))}
            disabled={busy}
          >
            {busy ? 'Saving…' : 'Save notes'}
          </button>
        </div>
      ) : null}

      {error ? <div className={styles.inlineError}>{error}</div> : null}
    </article>
  );
}
