import { NextResponse, type NextRequest } from 'next/server';
import { revalidatePath } from 'next/cache';
import { requireAdmin } from '@/lib/auth/session';
import { createServiceClient } from '@/lib/supabase/server';
import { sanitizeText, sanitizeRichHtml, slugify } from '@/lib/sanitize';
import { assertSameOrigin } from '@/lib/security/csrf';
import { rateLimit, clientKey } from '@/lib/rate-limit';
import type { BlogInput } from '@/lib/supabase/types';

export const runtime = 'nodejs';

async function ensureAdmin() {
  try {
    await requireAdmin();
    return null;
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
}

function checkCsrfAndRate(req: NextRequest): NextResponse | null {
  const csrf = assertSameOrigin(req);
  if (!csrf.ok) {
    return NextResponse.json({ error: csrf.reason }, { status: 403 });
  }
  const limited = rateLimit(clientKey(req.headers, 'admin-write'), 60);
  if (!limited.ok) {
    return NextResponse.json(
      { error: 'Rate limit exceeded.' },
      { status: 429, headers: { 'Retry-After': String(Math.ceil(limited.retryAfterMs / 1000)) } },
    );
  }
  return null;
}

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const denied = await ensureAdmin();
  if (denied) return denied;

  const supabase = createServiceClient();
  const { data, error } = await supabase
    .from('blogs')
    .select('*')
    .eq('id', params.id)
    .maybeSingle();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  if (!data) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json({ blog: data });
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const blocked = checkCsrfAndRate(req);
  if (blocked) return blocked;
  const denied = await ensureAdmin();
  if (denied) return denied;

  let body: Partial<BlogInput>;
  try {
    body = (await req.json()) as Partial<BlogInput>;
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const title = sanitizeText(body.title, 200);
  let slug = sanitizeText(body.slug, 80);
  if (!slug && title) slug = slugify(title);
  const content = sanitizeRichHtml(body.content);
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
  const { data, error } = await supabase
    .from('blogs')
    .update({ title, slug, content, meta_description, cover_image, tags, published })
    .eq('id', params.id)
    .select()
    .single();

  if (error) {
    if (error.code === '23505') {
      return NextResponse.json({ error: 'A post with this slug already exists.' }, { status: 409 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  revalidatePath('/blogs');
  if (slug) revalidatePath(`/blogs/${slug}`);
  revalidatePath('/');

  return NextResponse.json({ blog: data });
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const blocked = checkCsrfAndRate(req);
  if (blocked) return blocked;
  const denied = await ensureAdmin();
  if (denied) return denied;

  const supabase = createServiceClient();
  const { data: existing } = await supabase
    .from('blogs')
    .select('slug')
    .eq('id', params.id)
    .maybeSingle();

  const { error } = await supabase.from('blogs').delete().eq('id', params.id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  revalidatePath('/blogs');
  if (existing?.slug) revalidatePath(`/blogs/${existing.slug}`);
  revalidatePath('/');

  return NextResponse.json({ ok: true });
}
