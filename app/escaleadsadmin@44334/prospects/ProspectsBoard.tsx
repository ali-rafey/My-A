'use client';

import { useMemo, useState } from 'react';
import type { Prospect, ProspectStatusValue } from '@/lib/supabase/types';
import { PROSPECT_STATUS_LABELS, PROSPECT_STATUSES } from '@/lib/supabase/types';
import ProspectRow from './ProspectRow';
import styles from '../admin.module.css';

type Filter = 'all' | 'open' | ProspectStatusValue;

// "Open" is the default because it answers the only question that matters when you sit down to do
// outreach: who have I not dealt with yet. Won/lost/not-a-fit stay one click away.
const CLOSED: ProspectStatusValue[] = ['won', 'lost', 'not_a_fit'];

export default function ProspectsBoard({ prospects }: { prospects: Prospect[] }) {
  const [filter, setFilter] = useState<Filter>('open');
  const [market, setMarket] = useState<string>('all');
  const [query, setQuery] = useState('');
  const [socialOnly, setSocialOnly] = useState(false);

  const markets = useMemo(
    () => Array.from(new Set(prospects.map((p) => p.market).filter(Boolean))).sort(),
    [prospects],
  );

  const visible = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return prospects.filter((p) => {
      if (filter === 'open' && CLOSED.includes(p.status)) return false;
      if (filter !== 'all' && filter !== 'open' && p.status !== filter) return false;
      if (market !== 'all' && p.market !== market) return false;
      // Contactability filter. Socials are now a hard requirement for outreach, so this hides
      // every prospect there is no way to open a conversation with.
      if (socialOnly && !p.instagram && !p.linkedin) return false;
      if (needle) {
        const haystack = [p.name, p.brand, p.product_category, p.signal_summary, p.country]
          .join(' ')
          .toLowerCase();
        if (!haystack.includes(needle)) return false;
      }
      return true;
    });
  }, [prospects, filter, market, query, socialOnly]);

  const counts = useMemo(() => {
    const map = new Map<string, number>();
    for (const p of prospects) map.set(p.status, (map.get(p.status) ?? 0) + 1);
    return map;
  }, [prospects]);

  const openCount = prospects.filter((p) => !CLOSED.includes(p.status)).length;

  return (
    <>
      <div className={styles.prospectFilters}>
        <div className={styles.prospectFilterRow}>
          <button
            type="button"
            className={`${styles.filterChip} ${filter === 'open' ? styles.filterChipActive : ''}`}
            onClick={() => setFilter('open')}
          >
            Open ({openCount})
          </button>
          <button
            type="button"
            className={`${styles.filterChip} ${filter === 'all' ? styles.filterChipActive : ''}`}
            onClick={() => setFilter('all')}
          >
            All ({prospects.length})
          </button>
          {PROSPECT_STATUSES.map((status) => {
            const count = counts.get(status) ?? 0;
            if (count === 0) return null;
            return (
              <button
                key={status}
                type="button"
                className={`${styles.filterChip} ${filter === status ? styles.filterChipActive : ''}`}
                onClick={() => setFilter(status)}
              >
                {PROSPECT_STATUS_LABELS[status]} ({count})
              </button>
            );
          })}
        </div>

        <div className={styles.prospectFilterRow}>
          <input
            type="search"
            className={styles.prospectSearch}
            placeholder="Search name, brand, category…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            aria-label="Search prospects"
          />
          <button
            type="button"
            className={`${styles.filterChip} ${socialOnly ? styles.filterChipActive : ''}`}
            onClick={() => setSocialOnly((v) => !v)}
            title="Only prospects with an Instagram or LinkedIn you can contact"
          >
            Has socials
          </button>
          {markets.length > 1 ? (
            <select
              className={styles.prospectSelect}
              value={market}
              onChange={(e) => setMarket(e.target.value)}
              aria-label="Filter by market"
            >
              <option value="all">All markets</option>
              {markets.map((m) => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
          ) : null}
        </div>
      </div>

      {visible.length === 0 ? (
        <div className={styles.empty}>No prospects match these filters.</div>
      ) : (
        <div className={styles.rowList}>
          {visible.map((prospect) => (
            <ProspectRow key={prospect.id} prospect={prospect} />
          ))}
        </div>
      )}
    </>
  );
}
