import { NextResponse, type NextRequest } from 'next/server';
import { revalidatePath } from 'next/cache';
import { createServiceClient } from '@/lib/supabase/server';
import { withAdminGuard } from '@/lib/admin-handler';
import { readProject } from '@/lib/content/project-input';
import type { ProjectInput } from '@/lib/supabase/types';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// A revalidation failure must never turn a successful write into a 500 — the
// row is already saved, and /our-work refreshes on its next ISR pass anyway.
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

export const GET = withAdminGuard(async (_req: NextRequest) => {
  const supabase = createServiceClient();
  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .order('sort_order', { ascending: true })
    .order('created_at', { ascending: false });

  if (error) {
    console.error('[admin/projects GET] supabase error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ projects: data ?? [] });
}, { csrf: false });

export const POST = withAdminGuard(async (req: NextRequest) => {
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
  const { data, error } = await supabase.from('projects').insert(row).select().single();

  if (error) {
    console.error('[admin/projects POST] supabase error:', error);
    if (error.code === '23505') {
      return NextResponse.json({ error: 'A project with this slug already exists.' }, { status: 409 });
    }
    if (error.code === '42P01') {
      return NextResponse.json(
        { error: 'The projects table does not exist yet. Run supabase/projects.sql in the Supabase SQL Editor.' },
        { status: 500 },
      );
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  safeRevalidate('/our-work');
  return NextResponse.json({ project: data }, { status: 201 });
});
