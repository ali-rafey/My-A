import Link from 'next/link';
import ProjectEditor from '../ProjectEditor';
import styles from '../../admin.module.css';
import { requireAdminPage } from '@/lib/auth/require-admin-page';

export const dynamic = 'force-dynamic';

export default async function NewProjectPage() {
  await requireAdminPage();
  return (
    <>
      <div className={styles.pageHeader}>
        <div>
          <h1>New project</h1>
          <p>Add a piece of work to /our-work.</p>
        </div>
        <Link className={`${styles.button} ${styles.buttonGhost}`} href="/admin/projects">
          Back to work
        </Link>
      </div>
      <div className={styles.card}>
        <ProjectEditor mode="create" />
      </div>
    </>
  );
}
