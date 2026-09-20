import { sanitizeText, slugify } from '@/lib/sanitize';
import type { ProjectInput } from '@/lib/supabase/types';

// Field cleaning shared by the create and update routes. It lives here rather
// than in either route file because a Next.js route module may only export
// HTTP methods and route config — an extra export there fails the build.
export function readProject(body: Partial<ProjectInput>) {
  const title = sanitizeText(body.title, 120);
  let slug = sanitizeText(body.slug, 80);
  if (!slug && title) slug = slugify(title);

  return {
    title,
    slug,
    summary: body.summary ? sanitizeText(body.summary, 1200) : null,
    category: body.category ? sanitizeText(body.category, 40) : null,
    image_url: body.image_url ? sanitizeText(body.image_url, 600) : null,
    live_url: body.live_url ? sanitizeText(body.live_url, 600) : null,
    status_label: sanitizeText(body.status_label, 40) || 'Live',
    sort_order: Number.isFinite(Number(body.sort_order)) ? Number(body.sort_order) : 0,
    tags: Array.isArray(body.tags)
      ? body.tags.map((tag) => sanitizeText(tag, 40)).filter(Boolean).slice(0, 8)
      : [],
    published: Boolean(body.published),
  };
}
