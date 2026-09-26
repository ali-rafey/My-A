import Guide from './Guide';
import styles from '../admin.module.css';

export const dynamic = 'force-dynamic';

// Admin Guide — the owner's playbook for the four pillars the agency sells.
// The content lives in content.ts and diagrams.tsx; this page only frames it.

export default function AdminGuidePage() {
  return (
    <>
      <div className={styles.pageHeader}>
        <div>
          <h1>Admin Guide</h1>
          <p>The EscaLeads playbook: what each pillar includes, how to audit it, how to deliver it, and the numbers that prove it worked.</p>
        </div>
      </div>

      <Guide />
    </>
  );
}
