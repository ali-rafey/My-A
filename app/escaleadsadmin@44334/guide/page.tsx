import styles from '../admin.module.css';

export const dynamic = 'force-dynamic';

// Admin Guide — the shell only, on purpose.
//
// The operator asked for the tab now and will say later what belongs in it.
// Whatever that turns out to be (how to publish a post, how to add a project,
// what the diagnostics mean, house style) drops straight into the card below.

export default function AdminGuidePage() {
  return (
    <>
      <div className={styles.pageHeader}>
        <div>
          <h1>Admin Guide</h1>
          <p>Reference and context for running this site.</p>
        </div>
      </div>

      <div className={styles.card}>
        <div className={styles.empty}>
          Nothing here yet &mdash; this page is waiting on its content.
        </div>
      </div>
    </>
  );
}
