import Guide from './Guide';
import styles from '../admin.module.css';

export const dynamic = 'force-dynamic';

// Admin Guide — the owner's playbook for the four disciplines the agency sells.
// The content lives in content.ts and diagrams.tsx; this page only frames it.

export default function AdminGuidePage() {
  return (
    <>
      <div className={styles.pageHeader}>
        <div>
          <h1>Admin Guide</h1>
          <p>Your playbook: where you stand in each discipline, what scaled looks like, and what to do this month.</p>
        </div>
      </div>

      <Guide />
    </>
  );
}
