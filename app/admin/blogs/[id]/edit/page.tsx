import Link from 'next/link';
import { notFound } from 'next/navigation';
import { adminGetBlog } from '@/lib/content/blogs';
import BlogEditor from '../../BlogEditor';
import styles from '../../../admin.module.css';
import { requireAdminPage } from '@/lib/auth/require-admin-page';

export const dynamic = 'force-dynamic';

export default async function EditBlogPage({ params }: { params: { id: string } }) {
  await requireAdminPage();
  const blog = await adminGetBlog(params.id).catch(() => null);
  if (!blog) notFound();

  return (
    <>
      <div className={styles.pageHeader}>
        <div>
          <h1>Edit post</h1>
          <p>{blog.published ? 'Currently published.' : 'Currently a draft.'}</p>
        </div>
        <Link href="/admin/blogs" className={`${styles.button} ${styles.buttonGhost}`}>
          ← Back to all posts
        </Link>
      </div>

      <div className={styles.card}>
        <BlogEditor mode="edit" initial={blog} />
      </div>
    </>
  );
}
