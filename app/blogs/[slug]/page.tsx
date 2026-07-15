import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { getPublishedBlogBySlug, listPublishedBlogs } from '@/lib/content/blogs';
import { sanitizeRichHtml } from '@/lib/sanitize-html';
import { formatDate } from '@/lib/format';
import styles from '../blogs.module.css';

// Node runtime explicit — sanitize-html and the Supabase server client both depend on Node APIs.
// Without this, Vercel can pick the Edge runtime for ISR-rendered slugs, which fails to load these
// modules and produces an unrendered 500. The admin API routes already pin to nodejs for the same
// reason; the public blog detail page was relying on the implicit default and that wasn't holding.
export const runtime = 'nodejs';
export const revalidate = 60;

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

export async function generateStaticParams() {
  const blogs = await listPublishedBlogs();
  return blogs.map((blog) => ({ slug: blog.slug }));
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const blog = await getPublishedBlogBySlug(params.slug);
  if (!blog) {
    return {
      title: 'Post not found',
      description: 'The post you are looking for is not available.',
    };
  }

  const description = blog.meta_description ?? blog.title;
  const url = `${siteUrl}/blogs/${blog.slug}`;

  return {
    title: blog.title,
    description,
    alternates: { canonical: `/blogs/${blog.slug}` },
    keywords: blog.tags,
    openGraph: {
      type: 'article',
      url,
      title: blog.title,
      description,
      images: blog.cover_image ? [{ url: blog.cover_image, alt: blog.title }] : undefined,
      publishedTime: blog.created_at,
      modifiedTime: blog.updated_at,
      tags: blog.tags,
    },
    twitter: {
      card: 'summary_large_image',
      title: blog.title,
      description,
      images: blog.cover_image ? [blog.cover_image] : undefined,
    },
  };
}

export default async function BlogPostPage({ params }: { params: { slug: string } }) {
  const blog = await getPublishedBlogBySlug(params.slug);
  if (!blog) notFound();

  const safeContent = sanitizeRichHtml(blog.content);
  const url = `${siteUrl}/blogs/${blog.slug}`;

  const articleJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: blog.title,
    description: blog.meta_description ?? blog.title,
    image: blog.cover_image ? [blog.cover_image] : undefined,
    datePublished: blog.created_at,
    dateModified: blog.updated_at,
    author: { '@type': 'Organization', name: 'EscaLeads' },
    publisher: {
      '@type': 'Organization',
      name: 'EscaLeads',
      logo: { '@type': 'ImageObject', url: `${siteUrl}/logo-icon.png` },
    },
    mainEntityOfPage: { '@type': 'WebPage', '@id': url },
    keywords: blog.tags?.join(', '),
  };

  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: siteUrl },
      { '@type': 'ListItem', position: 2, name: 'Blog', item: `${siteUrl}/blogs` },
      { '@type': 'ListItem', position: 3, name: blog.title, item: url },
    ],
  };

  return (
    <div className={`${styles.page} container`}>
      <nav className={styles.breadcrumb} aria-label="Breadcrumb">
        <Link href="/">Home</Link>
        <span>/</span>
        <Link href="/blogs">Blog</Link>
        <span>/</span>
        <span aria-current="page">{blog.title}</span>
      </nav>

      <article className={styles.article}>
        {blog.cover_image ? (
          <Image
            src={blog.cover_image}
            alt={`Cover image for ${blog.title}`}
            width={1200}
            height={630}
            priority
            className={styles.articleCover}
          />
        ) : null}

        <h1 className={styles.articleTitle}>{blog.title}</h1>

        <div className={styles.articleMeta}>
          <time dateTime={blog.created_at}>{formatDate(blog.created_at)}</time>
          {blog.tags && blog.tags.length > 0 ? (
            <div className={styles.tags}>
              {blog.tags.map((tag) => (
                <span key={tag} className={styles.tag}>{tag}</span>
              ))}
            </div>
          ) : null}
        </div>

        <div
          className={styles.articleBody}
          dangerouslySetInnerHTML={{ __html: safeContent }}
        />
      </article>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
    </div>
  );
}
