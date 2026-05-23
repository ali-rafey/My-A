import Link from 'next/link';
import { adminListBlogs } from '@/lib/content/blogs';
import { formatDate } from '@/lib/format';
import AdminSidebar from '../AdminSidebar';
import DeleteBlogButton from './DeleteBlogButton';
import styles from '../admin.module.css';

export const dynamic = 'force-dynamic';

export default async function AdminBlogsPage() {
  const blogs = await adminListBlogs().catch(() => []);

  return (
    <div className={styles.shell}>
      <AdminSidebar />
      <div className={styles.container}>
        <div className={styles.pageHeader}>
          <div>
            <h1>Blog Manager</h1>
            <p>{blogs.length} post{blogs.length === 1 ? '' : 's'} total.</p>
          </div>
          <Link className={styles.button} href="/escaleadsadmin@44334/blogs/new">
            + New post
          </Link>
        </div>

        {blogs.length === 0 ? (
          <div className={styles.empty}>
            No blog posts yet. Click <strong>New post</strong> to publish your first one.
          </div>
        ) : (
          <div className={`${styles.card} ${styles.tableCard}`}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Slug</th>
                  <th>Status</th>
                  <th>Updated</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {blogs.map((blog) => (
                  <tr key={blog.id}>
                    <td>
                      <strong>{blog.title}</strong>
                      {blog.meta_description ? (
                        <div className={styles.metaText}>
                          {blog.meta_description}
                        </div>
                      ) : null}
                    </td>
                    <td><code className={styles.mono}>{blog.slug}</code></td>
                    <td>
                      <span className={`${styles.badge} ${blog.published ? styles.badgePublished : styles.badgeDraft}`}>
                        {blog.published ? 'Published' : 'Draft'}
                      </span>
                    </td>
                    <td>{formatDate(blog.updated_at)}</td>
                    <td>
                      <div className={styles.tableActions}>
                        <Link
                          className={`${styles.button} ${styles.buttonGhost}`}
                          href={`/escaleadsadmin@44334/blogs/${blog.id}/edit`}
                        >
                          Edit
                        </Link>
                        {blog.published ? (
                          <Link
                            className={`${styles.button} ${styles.buttonGhost}`}
                            href={`/blogs/${blog.slug}`}
                            target="_blank"
                            rel="noreferrer"
                          >
                            View
                          </Link>
                        ) : null}
                        <DeleteBlogButton id={blog.id} title={blog.title} />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
