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
  const { data, error } = await supabase
    .from('leads')
    .update({ read: Boolean(body.read) })
    .eq('id', params.id)
    .select()
    .single();

  if (error) {
    console.error('[admin/leads PATCH] supabase error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ lead: data });
});

export const DELETE = withAdminGuard(async (_req: NextRequest, { params }: { params: { id: string } }) => {
  const supabase = createServiceClient();
  const { error } = await supabase.from('leads').delete().eq('id', params.id);
  if (error) {
    console.error('[admin/leads DELETE] supabase error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
});
