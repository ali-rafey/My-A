import { NextResponse, type NextRequest } from 'next/server';
import { requireAdmin } from '@/lib/auth/session';
import { createServiceClient } from '@/lib/supabase/server';
import { assertSameOrigin } from '@/lib/security/csrf';
import { rateLimit, clientKey } from '@/lib/rate-limit';

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

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const blocked = checkCsrfAndRate(req);
  if (blocked) return blocked;
  const denied = await ensureAdmin();
  if (denied) return denied;

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

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ lead: data });
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const blocked = checkCsrfAndRate(req);
  if (blocked) return blocked;
  const denied = await ensureAdmin();
  if (denied) return denied;

  const supabase = createServiceClient();
  const { error } = await supabase.from('leads').delete().eq('id', params.id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
