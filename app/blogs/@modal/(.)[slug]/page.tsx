// Intercepting route — fires when the user clicks a card on /blogs (client-side nav). The URL
// becomes /blogs/<slug> but the listing stays mounted underneath; this server component renders
// inside the @modal parallel slot from app/blogs/layout.tsx, wrapped in BlogModalDialog for
// scrim + Escape + click-out behavior.
//
// Direct navigation (refresh, paste-URL, search-engine crawl) does NOT trigger an intercept and
// instead hits app/blogs/[slug]/page.tsx — the standalone, SSG'd, JSON-LD-rich version. So this
// file is a UX layer only; SEO is unaffected.
import { notFound } from 'next/navigation';
import Image from 'next/image';
import { getPublishedBlogBySlug } from '@/lib/content/blogs';
import { sanitizeRichHtml } from '@/lib/sanitize-html';
import { formatDate } from '@/lib/format';
import BlogModalDialog from '../../BlogModalDialog';
import blogsStyles from '../../blogs.module.css';
import modalStyles from '../../BlogModalDialog.module.css';

// Node runtime explicit — sanitize-html + Supabase server client both depend on Node APIs (same
// reason app/blogs/[slug]/page.tsx pins it). Without this, Vercel can route ISR'd intercepts
// through the Edge runtime which can't load these modules.
export const runtime = 'nodejs';
export const revalidate = 60;

export default async function InterceptedBlogModal({
  params,
}: {
  params: { slug: string };
}) {
  const blog = await getPublishedBlogBySlug(params.slug);
  if (!blog) notFound();

  // Already sanitized on save by the admin route — re-sanitize defensively so this layer never
  // emits anything the standalone page wouldn't also emit.
  const safeContent = sanitizeRichHtml(blog.content);

  return (
    <BlogModalDialog title={blog.title}>
      {blog.cover_image ? (
        <Image
          src={blog.cover_image}
          alt={`Cover image for ${blog.title}`}
          width={1200}
          height={630}
          className={modalStyles.cover}
        />
      ) : null}

      <span className={modalStyles.eyebrow}>
        <span className={modalStyles.eyebrowDot} aria-hidden="true" />
        Blog
      </span>

      <h1 className={modalStyles.title}>{blog.title}</h1>

      <div className={modalStyles.meta}>
        <time dateTime={blog.created_at}>{formatDate(blog.created_at)}</time>
        {blog.tags && blog.tags.length > 0 ? (
          <div className={blogsStyles.tags}>
            {blog.tags.map((tag) => (
              <span key={tag} className={blogsStyles.tag}>{tag}</span>
            ))}
          </div>
        ) : null}
      </div>

      {/* Reuse the existing .articleBody typography so the modal body looks identical to the
          standalone page — same h2/h3 sizes, list spacing, blockquote treatment, code blocks. */}
      <div
        className={blogsStyles.articleBody}
        dangerouslySetInnerHTML={{ __html: safeContent }}
      />
    </BlogModalDialog>
  );
}
