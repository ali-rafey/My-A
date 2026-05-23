import { NextResponse, type NextRequest } from 'next/server';
import { revalidatePath } from 'next/cache';
import { createServiceClient } from '@/lib/supabase/server';
import { sanitizeText, slugify } from '@/lib/sanitize';
import { textToHtml } from '@/lib/text-to-html';
import { withAdminGuard } from '@/lib/admin-handler';
import type { BlogInput } from '@/lib/supabase/types';

// NOTE: sanitizeRichHtml is dynamically imported inside PUT (see below). Importing
// `@/lib/sanitize-html` at the top level pulls in isomorphic-dompurify → jsdom synchronously at
// module-init time, which has crashed this serverless function on Vercel cold starts (CLAUDE.md
// §6.3). The dynamic import defers jsdom loading until the handler actually runs, so the route
// module itself stays light and reliably initializes — important here because GET/DELETE on the
// same route file don't need sanitization but were being penalized by the eager import.

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// Wrap revalidatePath so a revalidation failure never bubbles up as a 500. By the time we call
// revalidate, the DB write has already succeeded — the user wants the row created/updated/deleted,
// not "the cache invalidated." If revalidatePath throws (e.g. the slug path no longer resolves
// through the route manifest after a delete, which is a known Next.js 14.2.x quirk), we log it and
// the relevant page will refresh on its next ISR cycle anyway (60s for /blogs, 3600s for /).
function safeRevalidate(path: string) {
  try {
    revalidatePath(path);
  } catch (err) {
    console.warn(
      `[revalidatePath] failed for "${path}" (continuing — write already succeeded):`,
      err instanceof Error ? err.message : err,
    );
  }
}

export const GET = withAdminGuard(async (_req: NextRequest, { params }: { params: { id: string } }) => {
  const supabase = createServiceClient();
  const { data, error } = await supabase
    .from('blogs')
    .select('*')
    .eq('id', params.id)
    .maybeSingle();

  if (error) {
    console.error('[admin/blogs/:id GET] supabase error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  if (!data) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json({ blog: data });
}, { csrf: false });

export const PUT = withAdminGuard(async (req: NextRequest, { params }: { params: { id: string } }) => {
  let body: Partial<BlogInput>;
  try {
    body = (await req.json()) as Partial<BlogInput>;
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const title = sanitizeText(body.title, 200);
  let slug = sanitizeText(body.slug, 80);
  if (!slug && title) slug = slugify(title);
  // Author types plain text in the editor; textToHtml wraps it into paragraphs (and passes
  // already-authored HTML through unchanged). sanitizeRichHtml then enforces the safe-tag list.
  // Dynamic import keeps jsdom out of module-init — see top-of-file comment.
  const { sanitizeRichHtml } = await import('@/lib/sanitize-html');
  const content = sanitizeRichHtml(textToHtml(typeof body.content === 'string' ? body.content : ''));
  const meta_description = body.meta_description ? sanitizeText(body.meta_description, 300) : null;
  const cover_image = body.cover_image ? sanitizeText(body.cover_image, 500) : null;
  const tags = Array.isArray(body.tags)
    ? body.tags.map((tag) => sanitizeText(tag, 40)).filter(Boolean).slice(0, 12)
    : [];
  const published = Boolean(body.published);

  if (!title || !slug || !content) {
    return NextResponse.json(
      { error: 'Title, slug, and content are required.' },
      { status: 400 },
    );
  }

  const supabase = createServiceClient();
  // No .single() — surface RLS-blocked-zero-row scenarios as a clear 404 instead of a confusing
  // "Cannot coerce the result to a single JSON object".
  const { data, error } = await supabase
    .from('blogs')
    .update({ title, slug, content, meta_description, cover_image, tags, published })
    .eq('id', params.id)
    .select();

  if (error) {
    console.error('[admin/blogs/:id PUT] supabase error:', error);
    if (error.code === '23505') {
      return NextResponse.json({ error: 'A post with this slug already exists.' }, { status: 409 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  if (!data || data.length === 0) {
    return NextResponse.json(
      {
        error:
          `No row matched id ${params.id}. The post may have been deleted, OR row-level security ` +
          `is blocking the service role. Run the policies in supabase/schema.sql.`,
      },
      { status: 404 },
    );
  }

  safeRevalidate('/blogs');
  if (slug) safeRevalidate(`/blogs/${slug}`);
  safeRevalidate('/');

  return NextResponse.json({ blog: data[0] });
});

export const DELETE = withAdminGuard(async (_req: NextRequest, { params }: { params: { id: string } }) => {
  const id = params?.id;
  if (!id) {
    return NextResponse.json({ error: 'Missing blog id in URL.' }, { status: 400 });
  }

  console.log('[admin/blogs DELETE] start id=', id);
  const supabase = createServiceClient();

  // Pre-fetch the slug so we can revalidate /blogs/<slug> after delete. Failure here is non-fatal:
  // we still proceed with the delete; we just can't revalidate the per-post page (it'll fall off
  // ISR within 60s anyway).
  let existingSlug: string | null = null;
  try {
    const { data, error } = await supabase
      .from('blogs')
      .select('slug')
      .eq('id', id)
      .maybeSingle();
    if (error) {
      console.warn('[admin/blogs DELETE] slug pre-fetch error (continuing):', error);
    } else {
      existingSlug = data?.slug ?? null;
    }
  } catch (err) {
    console.warn('[admin/blogs DELETE] slug pre-fetch threw (continuing):', err);
  }

  const { data, error } = await supabase.from('blogs').delete().eq('id', id).select();
  if (error) {
    console.error('[admin/blogs DELETE] supabase error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  if (!data || data.length === 0) {
    return NextResponse.json(
      {
        error:
          `Delete affected 0 rows. The post with id ${id} either doesn't exist or ` +
          `row-level security is blocking the service role from deleting it.`,
      },
      { status: 404 },
    );
  }

  console.log('[admin/blogs DELETE] success — deleted', data.length, 'row(s), slug was', existingSlug);

  safeRevalidate('/blogs');
  if (existingSlug) safeRevalidate(`/blogs/${existingSlug}`);
  safeRevalidate('/');

  return NextResponse.json({ ok: true, deleted: data.length });
});
