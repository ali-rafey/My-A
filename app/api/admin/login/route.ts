import { NextResponse, type NextRequest } from 'next/server';
import { getAdminSession } from '@/lib/auth/session';
import { rateLimit, clientKey } from '@/lib/rate-limit';
import { sanitizeText } from '@/lib/sanitize';
import { assertSameOrigin } from '@/lib/security/csrf';

export const runtime = 'nodejs';

function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let result = 0;
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return result === 0;
}

export async function POST(req: NextRequest) {
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
    console.error('ADMIN_USERNAME or ADMIN_PASSWORD not set.');
    return NextResponse.json({ error: 'Server not configured.' }, { status: 500 });
  }

  let body: { username?: unknown; password?: unknown };
  try {
    body = (await req.json()) as { username?: unknown; password?: unknown };
  } catch {
    return NextResponse.json({ error: 'Invalid request.' }, { status: 400 });
  }

  const username = sanitizeText(body.username, 120);
  const password = typeof body.password === 'string' ? body.password : '';

  // Constant-time comparison so the response time doesn't leak which field was wrong.
  const userOk = timingSafeEqual(username, adminUser);
  const passOk = timingSafeEqual(password, adminPass);

  if (!userOk || !passOk) {
    return NextResponse.json({ error: 'Invalid credentials.' }, { status: 401 });
  }

  const session = await getAdminSession();
  session.isAdmin = true;
  session.username = adminUser;
  session.loginAt = Date.now();
  await session.save();

  return NextResponse.json({ ok: true });
}
