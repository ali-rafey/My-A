import { NextResponse, type NextRequest } from 'next/server';
import { createServiceClient } from '@/lib/supabase/server';
import { withAdminGuard } from '@/lib/admin-handler';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export const PATCH = withAdminGuard(async (req: NextRequest, { params }: { params: { id: string } }) => {
  let body: { read?: unknown };
  try {
    body = (await req.json()) as { read?: unknown };
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const supabase = createServiceClient();

  // Use plain UPDATE + SELECT (no .single()) so RLS-blocked-zero-row scenarios surface as a clear
  // 404 instead of PostgREST's confusing "Cannot coerce the result to a single JSON object".
  const { data, error } = await supabase
    .from('leads')
    .update({ read: Boolean(body.read) })
    .eq('id', params.id)
    .select();

  if (error) {
    console.error('[admin/leads PATCH] supabase error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  if (!data || data.length === 0) {
    return NextResponse.json(
      {
        error:
          `No row matched id ${params.id}. The lead may have been deleted, OR row-level security ` +
          `is blocking the service role. Run the policies in supabase/schema.sql and reload the ` +
          `schema cache: notify pgrst, 'reload schema';`,
      },
      { status: 404 },
    );
  }
  return NextResponse.json({ lead: data[0] });
});

export const DELETE = withAdminGuard(async (_req: NextRequest, { params }: { params: { id: string } }) => {
  const supabase = createServiceClient();

  // Use .select() to confirm exactly which rows were deleted — without it Postgres reports success
  // even when 0 rows match (DELETE WHERE no-match isn't an error). With it, a zero-length array
  // means the row wasn't there OR RLS blocked the delete, and we surface that as 404.
  const { data, error } = await supabase
    .from('leads')
    .delete()
    .eq('id', params.id)
    .select();

  if (error) {
    console.error('[admin/leads DELETE] supabase error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  if (!data || data.length === 0) {
    return NextResponse.json(
      {
        error:
          `Delete affected 0 rows. The lead with id ${params.id} either doesn't exist or ` +
          `row-level security is blocking the service role from deleting it. Confirm the ` +
          `"Service role full access on leads" policy exists in supabase/schema.sql, then ` +
          `run: notify pgrst, 'reload schema';`,
      },
      { status: 404 },
    );
  }
  return NextResponse.json({ ok: true, deleted: data.length });
});
