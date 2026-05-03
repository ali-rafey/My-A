import Link from 'next/link';
import { listPublishedBlogs } from '@/lib/content/blogs';
import { formatDate } from '@/lib/format';
import styles from './BlogsPreview.module.css';

export default async function BlogsPreview() {
  const blogs = await listPublishedBlogs();
  const latest = blogs.slice(0, 3);

  return (
    <section className={`${styles.section} section`} id="blogs">
      <div className="container">
        <div className={styles.header}>
          <span className="eyebrow">Blogs</span>
          <h2 className="sectionTitle">Ideas, systems, and growth insights</h2>
          <p className="sectionLead">
            Practical thinking from the work we do every day across product, engineering, and automation.
          </p>
        </div>

        {latest.length === 0 ? (
          <div className={styles.empty}>New posts are on the way — check back soon.</div>
        ) : (
          <>
            <div className={styles.grid}>
              {latest.map((blog) => (
                <Link key={blog.id} href={`/blogs/${blog.slug}`} className={styles.card}>
                  <span className={styles.date}>{formatDate(blog.created_at)}</span>
                  <h3 className={styles.title}>{blog.title}</h3>
                  <p className={styles.text}>{blog.meta_description ?? ''}</p>
                </Link>
              ))}
            </div>
            <Link href="/blogs" className={styles.viewAll}>
              View all posts →
            </Link>
          </>
        )}
      </div>
    </section>
  );
}
