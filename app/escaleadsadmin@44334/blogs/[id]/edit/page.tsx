import Link from 'next/link';
import { notFound } from 'next/navigation';
import { adminGetBlog } from '@/lib/content/blogs';
import BlogEditor from '../../BlogEditor';
import styles from '../../../admin.module.css';

export const dynamic = 'force-dynamic';

export default async function EditBlogPage({ params }: { params: { id: string } }) {
  const blog = await adminGetBlog(params.id).catch(() => null);
  if (!blog) notFound();

  return (
    <>
      <div className={styles.pageHeader}>
        <div>
          <h1>Edit post</h1>
          <p>{blog.published ? 'Currently published.' : 'Currently a draft.'}</p>
        </div>
        <Link href="/escaleadsadmin@44334/blogs" className={`${styles.button} ${styles.buttonGhost}`}>
          ← Back to all posts
        </Link>
      </div>

      <div className={styles.card}>
        <BlogEditor mode="edit" initial={blog} />
      </div>
    </>
  );
}
