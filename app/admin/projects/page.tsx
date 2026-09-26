/* eslint-disable @next/next/no-img-element */
import Link from 'next/link';
import { adminListProjects } from '@/lib/content/projects';
import type { Project } from '@/lib/supabase/types';
import { formatDate } from '@/lib/format';
import DeleteProjectButton from './DeleteProjectButton';
import styles from '../admin.module.css';

export const dynamic = 'force-dynamic';

export default async function AdminProjectsPage() {
  let projects: Project[];
  let loadError: string | null = null;
  try {
    projects = await adminListProjects();
  } catch (err) {
    projects = [];
    loadError = err instanceof Error ? err.message : 'Could not read projects.';
  }

  // The table is created by supabase/projects.sql, which has to be run by hand
  // in the SQL Editor. Say so plainly rather than showing a raw Postgres error.
  const missingTable = loadError ? /relation .*projects.* does not exist|schema cache/i.test(loadError) : false;

  return (
    <>
      <div className={styles.pageHeader}>
        <div>
          <h1>Work Manager</h1>
          <p>{projects.length} project{projects.length === 1 ? '' : 's'} total. Published ones appear on /our-work.</p>
        </div>
        <Link className={styles.button} href="/escaleadsadmin@44334/projects/new">
          + New project
        </Link>
      </div>

      {loadError ? (
        <div className={styles.error} role="alert">
          {missingTable
            ? 'The projects table does not exist yet. Open the Supabase SQL Editor and run supabase/projects.sql from the repo, then reload this page.'
            : loadError}
        </div>
      ) : null}

      {!loadError && projects.length === 0 ? (
        <div className={styles.empty}>
          No projects yet. Click <strong>New project</strong> to add the first one — until then
          /our-work shows an empty state.
        </div>
      ) : null}

      {projects.length > 0 ? (
        <div className={`${styles.card} ${styles.tableCard}`}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Project</th>
                <th>Category</th>
                <th>Order</th>
                <th>Status</th>
                <th>Updated</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {projects.map((project) => (
                <tr key={project.id}>
                  <td>
                    <div className={styles.rowWithThumb}>
                      <span className={styles.rowThumb}>
                        {project.image_url ? <img src={project.image_url} alt="" /> : null}
                      </span>
                      <span>
                        <strong>{project.title}</strong>
                        {project.summary ? (
                          <div className={styles.metaText}>{project.summary.slice(0, 90)}</div>
                        ) : null}
                      </span>
                    </div>
                  </td>
                  <td>{project.category || <span className={styles.metaText}>—</span>}</td>
                  <td><code className={styles.mono}>{project.sort_order}</code></td>
                  <td>
                    <span className={`${styles.badge} ${project.published ? styles.badgePublished : styles.badgeDraft}`}>
                      {project.published ? 'Published' : 'Draft'}
                    </span>
                  </td>
                  <td>{formatDate(project.updated_at)}</td>
                  <td>
                    <div className={styles.tableActions}>
                      <Link
                        className={`${styles.button} ${styles.buttonGhost}`}
                        href={`/escaleadsadmin@44334/projects/${project.id}/edit`}
                      >
                        Edit
                      </Link>
                      <DeleteProjectButton id={project.id} title={project.title} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}
    </>
  );
}
