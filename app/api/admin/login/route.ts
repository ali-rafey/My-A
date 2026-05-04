import { NextResponse, type NextRequest } from 'next/server';
import { getAdminSession, SessionConfigError } from '@/lib/auth/session';
import { rateLimit, clientKey } from '@/lib/rate-limit';
import { sanitizeText } from '@/lib/sanitize';
import { assertSameOrigin } from '@/lib/security/csrf';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let result = 0;
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return result === 0;
}

async function handleLogin(req: NextRequest): Promise<NextResponse> {
  const csrf = assertSameOrigin(req);
  if (!csrf.ok) {
    return NextResponse.json({ error: csrf.reason }, { status: 403 });
  }

  // Aggressive throttle on login attempts.
  const limited = rateLimit(clientKey(req.headers, 'admin-login'), 5);
  if (!limited.ok) {
    return NextResponse.json(
      { error: 'Too many attempts. Try again later.' },
      { status: 429, headers: { 'Retry-After': String(Math.ceil(limited.retryAfterMs / 1000)) } },
    );
  }

  const adminUser = process.env.ADMIN_USERNAME;
  const adminPass = process.env.ADMIN_PASSWORD;

  if (!adminUser || !adminPass) {
    console.error('[admin/login] ADMIN_USERNAME or ADMIN_PASSWORD not set in environment.');
    return NextResponse.json(
      {
        error:
          'Admin credentials are not configured on the server. Set ADMIN_USERNAME and ADMIN_PASSWORD in Vercel Environment Variables and redeploy.',
      },
      { status: 500 },
    );
  }

  let body: { username?: unknown; password?: unknown };
  try {
    body = (await req.json()) as { username?: unknown; password?: unknown };
  } catch {
    return NextResponse.json({ error: 'Invalid request.' }, { status: 400 });
  }

  const username = sanitizeText(body.username, 120);
  const password = typeof body.password === 'string' ? body.password : '';

  const userOk = timingSafeEqual(username, adminUser);
  const passOk = timingSafeEqual(password, adminPass);

  if (!userOk || !passOk) {
    return NextResponse.json({ error: 'Invalid credentials.' }, { status: 401 });
  }

  let session;
  try {
    session = await getAdminSession();
  } catch (err) {
    if (err instanceof SessionConfigError) {
      console.error('[admin/login] session config error:', err.message);
      return NextResponse.json({ error: err.message }, { status: 500 });
    }
    throw err;
  }

  session.isAdmin = true;
  session.username = adminUser;
  session.loginAt = Date.now();

  try {
    await session.save();
  } catch (err) {
    console.error('[admin/login] session.save() failed:', err);
    return NextResponse.json(
      { error: 'Could not write session cookie. Check that SESSION_SECRET is set and at least 32 chars.' },
      { status: 500 },
    );
  }

  return NextResponse.json({ ok: true });
}

export async function POST(req: NextRequest) {
  try {
    return await handleLogin(req);
  } catch (err) {
    // Last-resort safety net so the client always receives JSON, never a Vercel HTML error page.
    const message = err instanceof Error ? err.message : 'Unknown server error.';
    console.error('[admin/login] uncaught error:', err);
    return NextResponse.json({ error: `Login failed: ${message}` }, { status: 500 });
  }
}
