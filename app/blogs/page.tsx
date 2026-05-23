import type { Metadata } from 'next';
import Link from 'next/link';
import { listPublishedBlogs } from '@/lib/content/blogs';
import { formatDate } from '@/lib/format';
import styles from './blogs.module.css';

export const revalidate = 60; // ISR: refresh once a minute

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

export const metadata: Metadata = {
  title: 'Blog — Insights, systems, and growth',
  description:
    'Practical thinking from EscaLeads on product, engineering, automation, and how software accelerates business growth.',
  alternates: { canonical: '/blogs' },
  openGraph: {
    type: 'website',
    url: `${siteUrl}/blogs`,
    title: 'EscaLeads Blog',
    description:
      'Practical thinking from EscaLeads on product, engineering, automation, and how software accelerates business growth.',
  },
};

export default async function BlogsPage() {
  const blogs = await listPublishedBlogs();

  return (
    <section className={`${styles.section} section`}>
      <div className={`container ${styles.container}`}>
        <header className={styles.header}>
          <span className={styles.eyebrow}>
            <span className={styles.eyebrowDot} aria-hidden="true" />
            <span>Blog</span>
          </span>
          <h1 className={styles.title}>Ideas, systems, and growth insights.</h1>
          <p className={styles.subtitle}>
            Practical thinking from the work we do every day.
          </p>
        </header>

        {blogs.length === 0 ? (
          <div className={styles.empty}>New posts are on the way — check back soon.</div>
        ) : (
          <div className={styles.grid}>
            {blogs.map((blog) => {
              // Tab label: first tag if present, else "Article" fallback.
              // CSS uppercases it so authored case doesn't matter.
              const tabLabel =
                Array.isArray(blog.tags) && blog.tags.length > 0
                  ? blog.tags[0]
                  : 'Article';

              return (
                <Link
                  key={blog.id}
                  href={`/blogs/${blog.slug}`}
                  className={styles.card}
                >
                  <div className={styles.cornerTab}>
                    <span>{tabLabel}</span>
                  </div>

                  <div className={styles.cardBody}>
                    <h2 className={styles.cardHeadline}>{blog.title}</h2>
                    {blog.meta_description ? (
                      <p className={styles.cardDescription}>{blog.meta_description}</p>
                    ) : null}

                    <span className={styles.divider} aria-hidden="true" />

                    <div className={styles.cardFooter}>
                      <span className={styles.cardDate}>{formatDate(blog.created_at)}</span>
                      <span className={styles.cardArrow} aria-hidden="true">→</span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
