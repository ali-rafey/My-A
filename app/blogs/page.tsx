import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
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
    <div className={`${styles.page} container`}>
      <header className={styles.header}>
        <span className="eyebrow">Blog</span>
        <h1 className="sectionTitle">Ideas, systems, and growth insights</h1>
        <p className="sectionLead">
          Practical thinking from the work we do every day across product, engineering, and automation.
        </p>
      </header>

      {blogs.length === 0 ? (
        <div className={styles.empty}>New posts are on the way — check back soon.</div>
      ) : (
        <div className={styles.grid}>
          {blogs.map((blog) => (
            <Link key={blog.id} href={`/blogs/${blog.slug}`} className={styles.card}>
              {blog.cover_image ? (
                <Image
                  className={styles.cover}
                  src={blog.cover_image}
                  alt={`Cover image for ${blog.title}`}
                  width={600}
                  height={400}
                  loading="lazy"
                />
              ) : null}
              <span className={styles.date}>{formatDate(blog.created_at)}</span>
              <h2 className={styles.title}>{blog.title}</h2>
              {blog.meta_description ? (
                <p className={styles.excerpt}>{blog.meta_description}</p>
              ) : null}
              {blog.tags && blog.tags.length > 0 ? (
                <div className={styles.tags}>
                  {blog.tags.slice(0, 3).map((tag) => (
                    <span key={tag} className={styles.tag}>{tag}</span>
                  ))}
                </div>
              ) : null}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
