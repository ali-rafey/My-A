import { NextResponse, type NextRequest } from 'next/server';
import { getAdminSession } from '@/lib/auth/session';
import { assertSameOrigin } from '@/lib/security/csrf';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  const csrf = assertSameOrigin(req);
  if (!csrf.ok) {
    return NextResponse.json({ error: csrf.reason }, { status: 403 });
  }
  const session = await getAdminSession();
  session.destroy();
  return NextResponse.json({ ok: true });
}
