import Link from 'next/link';
import BlogEditor from '../BlogEditor';
import styles from '../../admin.module.css';

export const dynamic = 'force-dynamic';

export default function NewBlogPage() {
  return (
    <>
      <div className={styles.pageHeader}>
        <div>
          <h1>New post</h1>
          <p>Compose a draft, then toggle <strong>Published</strong> when ready.</p>
        </div>
        <Link href="/escaleadsadmin@44334/blogs" className={`${styles.button} ${styles.buttonGhost}`}>
          ← Back to all posts
        </Link>
      </div>

      <div className={styles.card}>
        <BlogEditor mode="create" />
      </div>
    </>
  );
}
