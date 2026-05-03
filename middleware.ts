import { NextRequest, NextResponse } from 'next/server';
import { sessionOptions } from '@/lib/auth/session';

// The hidden admin URL. The "@" in the URL is allowed; the filesystem folder uses the same literal name.
const ADMIN_BASE = '/escaleadsadmin@44334';
const ADMIN_BASE_ENCODED = '/escaleadsadmin%4044334';

function isAdminPath(pathname: string): boolean {
  return pathname.startsWith(ADMIN_BASE) || pathname.startsWith(ADMIN_BASE_ENCODED);
}

function isAdminRoot(pathname: string): boolean {
  return (
    pathname === ADMIN_BASE ||
    pathname === `${ADMIN_BASE}/` ||
    pathname === ADMIN_BASE_ENCODED ||
    pathname === `${ADMIN_BASE_ENCODED}/`
  );
}

// First-line gate. We just check presence of the session cookie here — full HMAC validation happens
// in the page (via getAdminSession) and API routes (via requireAdmin), which redirect/refuse if invalid.
// This keeps middleware fast and edge-compatible without bundling iron-session into the edge runtime.
export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (!isAdminPath(pathname)) {
    return NextResponse.next();
  }

  const res = NextResponse.next();
  res.headers.set('X-Robots-Tag', 'noindex, nofollow, noarchive');

  if (isAdminRoot(pathname)) {
    return res;
  }

  const cookie = req.cookies.get(sessionOptions.cookieName)?.value;
  if (!cookie) {
    const url = req.nextUrl.clone();
    url.pathname = ADMIN_BASE;
    url.searchParams.set('redirect', pathname);
    return NextResponse.redirect(url);
  }

  return res;
}

export const config = {
  matcher: [
    '/escaleadsadmin@44334',
    '/escaleadsadmin@44334/:path*',
    '/escaleadsadmin%4044334',
    '/escaleadsadmin%4044334/:path*',
  ],
};
