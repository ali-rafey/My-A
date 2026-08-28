import { getProspects } from '@/lib/content/prospects';
import type { Prospect } from '@/lib/supabase/types';
import ProspectsBoard from './ProspectsBoard';
import ProspectsExportButton from './ProspectsExportButton';
import styles from '../admin.module.css';

export const dynamic = 'force-dynamic';

export default async function AdminProspectsPage() {
  // getProspects throws on a Supabase failure by design — a silent fallback would render every
  // prospect as "New" and the operator would re-contact people they had already emailed.
  let prospects: Prospect[];
  let loadError: string | null = null;
  try {
    prospects = await getProspects();
  } catch (err) {
    prospects = [];
    loadError = err instanceof Error ? err.message : 'Could not load prospects.';
  }

  const contacted = prospects.filter((p) =>
    ['contacted', 'replied', 'call_booked', 'won'].includes(p.status),
  ).length;
  const hot = prospects.filter((p) => p.score >= 70).length;
  const replied = prospects.filter((p) => ['replied', 'call_booked', 'won'].includes(p.status)).length;

  return (
    <>
      <div className={styles.pageHeader}>
        <div>
          <h1>Prospects</h1>
          <p>
            {prospects.length} sourced · {hot} high-fit · {contacted} contacted
          </p>
        </div>
        <ProspectsExportButton />
      </div>

      {loadError ? (
        <div className={styles.error} role="alert">
          {loadError}
        </div>
      ) : null}

      {prospects.length === 0 && !loadError ? (
        <div className={styles.empty}>
          No prospects yet. Research passes write verified leads into{' '}
          <code className={styles.mono}>data/prospects.csv</code>; they appear here automatically
          once committed and deployed.
        </div>
      ) : null}

      {prospects.length > 0 ? (
        <>
          <div className={styles.leadSummaryGrid}>
            <div className={`${styles.card} ${styles.leadSummaryCard}`}>
              <div className={styles.leadSummaryValue}>{prospects.length}</div>
              <div className={styles.leadSummaryLabel}>Total sourced</div>
            </div>
            <div className={`${styles.card} ${styles.leadSummaryCard}`}>
              <div className={styles.leadSummaryValue}>{hot}</div>
              <div className={styles.leadSummaryLabel}>High fit (70+)</div>
            </div>
            <div className={`${styles.card} ${styles.leadSummaryCard}`}>
              <div className={styles.leadSummaryValue}>{contacted}</div>
              <div className={styles.leadSummaryLabel}>Contacted</div>
            </div>
            <div className={`${styles.card} ${styles.leadSummaryCard}`}>
              <div className={styles.leadSummaryValue}>{replied}</div>
              <div className={styles.leadSummaryLabel}>Replied or better</div>
            </div>
          </div>

          <ProspectsBoard prospects={prospects} />
        </>
      ) : null}
    </>
  );
}
