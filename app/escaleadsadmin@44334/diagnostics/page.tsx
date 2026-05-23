import DiagnosticsRunner from './DiagnosticsRunner';
import styles from '../admin.module.css';

export const dynamic = 'force-dynamic';

export default function DiagnosticsPage() {
  return (
    <>
      <div className={styles.pageHeader}>
        <div>
          <h1>Diagnostics</h1>
          <p>Runs the same code path as the public contact form and the admin CRUD endpoints, then reports which step failed.</p>
        </div>
      </div>

      <div className={styles.card}>
        <DiagnosticsRunner />
      </div>
    </>
  );
}
