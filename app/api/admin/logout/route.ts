import { NextResponse, type NextRequest } from 'next/server';
import { getAdminSession } from '@/lib/auth/session';
import { assertSameOrigin } from '@/lib/security/csrf';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const csrf = assertSameOrigin(req);
    if (!csrf.ok) {
      return NextResponse.json({ error: csrf.reason }, { status: 403 });
    }
    const session = await getAdminSession();
    session.destroy();
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('[admin/logout] uncaught error:', err);
    const message = err instanceof Error ? err.message : 'Unknown server error.';
    return NextResponse.json({ error: `Logout failed: ${message}` }, { status: 500 });
  }
}
