import { NextResponse, type NextRequest } from 'next/server';
import { revalidatePath } from 'next/cache';
import { createServiceClient } from '@/lib/supabase/server';
import { withAdminGuard } from '@/lib/admin-handler';
import type { ProjectInput } from '@/lib/supabase/types';
import { readProject } from '@/lib/content/project-input';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

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
    .from('projects')
    .select('*')
    .eq('id', params.id)
    .maybeSingle();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  if (!data) return NextResponse.json({ error: 'Project not found.' }, { status: 404 });
  return NextResponse.json({ project: data });
}, { csrf: false });

export const PUT = withAdminGuard(async (req: NextRequest, { params }: { params: { id: string } }) => {
  let body: Partial<ProjectInput>;
  try {
    body = (await req.json()) as Partial<ProjectInput>;
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const row = readProject(body);
  if (!row.title || !row.slug) {
    return NextResponse.json({ error: 'Title and slug are required.' }, { status: 400 });
  }

  const supabase = createServiceClient();
  // No .single(): a zero-row update should read as a clear 404, not as
  // "cannot coerce the result to a single JSON object".
  const { data, error } = await supabase
    .from('projects')
    .update(row)
    .eq('id', params.id)
    .select();

  if (error) {
    console.error('[admin/projects PUT] supabase error:', error);
    if (error.code === '23505') {
      return NextResponse.json({ error: 'A project with this slug already exists.' }, { status: 409 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  if (!data || data.length === 0) {
    return NextResponse.json({ error: 'Project not found.' }, { status: 404 });
  }

  safeRevalidate('/our-work');
  return NextResponse.json({ project: data[0] });
});

export const DELETE = withAdminGuard(async (_req: NextRequest, { params }: { params: { id: string } }) => {
  const supabase = createServiceClient();
  const { data, error } = await supabase
    .from('projects')
    .delete()
    .eq('id', params.id)
    .select();

  if (error) {
    console.error('[admin/projects DELETE] supabase error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  if (!data || data.length === 0) {
    return NextResponse.json({ error: 'Project not found.' }, { status: 404 });
  }

  safeRevalidate('/our-work');
  return NextResponse.json({ ok: true });
});
