import Link from 'next/link';
import { notFound } from 'next/navigation';
import { adminGetProject } from '@/lib/content/projects';
import ProjectEditor from '../../ProjectEditor';
import styles from '../../../admin.module.css';

export const dynamic = 'force-dynamic';

export default async function EditProjectPage({ params }: { params: { id: string } }) {
  const project = await adminGetProject(params.id);
  if (!project) notFound();

  return (
    <>
      <div className={styles.pageHeader}>
        <div>
          <h1>Edit project</h1>
          <p>{project.title}</p>
        </div>
        <Link className={`${styles.button} ${styles.buttonGhost}`} href="/escaleadsadmin@44334/projects">
          Back to work
        </Link>
      </div>
      <div className={styles.card}>
        <ProjectEditor mode="edit" initial={project} />
      </div>
    </>
  );
}
