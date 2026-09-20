import type { Metadata } from 'next';
import { listPublishedBlogs } from '@/lib/content/blogs';
import { formatDate, readingMinutes } from '@/lib/format';
import BlogDeck, { type DeckPost } from './BlogDeck';
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

// The listing is one screen: a centred masthead over a deck that pages rather
// than a page that grows. This file stays a server component so the fetch, the
// copy and the crawlable index below all render on the server; only the deck's
// paging is client-side.

const tagOf = (tags: unknown): string =>
  Array.isArray(tags) && tags.length > 0 && typeof tags[0] === 'string' ? tags[0] : 'Article';

export default async function BlogsPage() {
  const blogs = await listPublishedBlogs();

  const posts: DeckPost[] = blogs.map((blog) => ({
    id: blog.id,
    slug: blog.slug,
    title: blog.title,
    excerpt: blog.meta_description ?? '',
    tag: tagOf(blog.tags),
    date: formatDate(blog.created_at),
    minutes: readingMinutes(blog.content),
    cover: blog.cover_image,
  }));

  return (
    <section className={`${styles.section} section`}>
      <div className={`container ${styles.container}`}>
        <header className={styles.masthead}>
          <span className={styles.eyebrow}>
            <span className={styles.eyebrowDot} aria-hidden="true" />
            <span>Our blog</span>
          </span>
          <h1 className={styles.title}>Latest thinking from the <em>team</em>.</h1>
          <p className={styles.subtitle}>
            Practical notes on design, engineering and growth &mdash; from the work
            we do every day.
          </p>
        </header>

        {posts.length === 0 ? (
          <div className={styles.empty}>New posts are on the way &mdash; check back soon.</div>
        ) : (
          <BlogDeck posts={posts} />
        )}
      </div>

      {/* The full index in plain markup. The deck's off-screen pages are
          aria-hidden, so this is what a screen reader and a crawler read. */}
      <ul className={styles.srOnly}>
        {posts.map((post) => (
          <li key={post.id}>
            <a href={`/blogs/${post.slug}`}>{post.title}</a>
            <p>{post.excerpt}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}
