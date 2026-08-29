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
  const withSocial = prospects.filter((p) => p.instagram || p.linkedin).length;

  return (
    <>
      <div className={styles.pageHeader}>
        <div>
          <h1>Prospects</h1>

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
          <div className={styles.statStrip}>
            <span><strong>{prospects.length}</strong> sourced</span>
            <span><strong>{hot}</strong> high fit</span>
            <span><strong>{withSocial}</strong> with socials</span>
            <span><strong>{contacted}</strong> contacted</span>
            <span><strong>{replied}</strong> replied+</span>
          </div>

          <ProspectsBoard prospects={prospects} />
        </>
      ) : null}
    </>
  );
}
