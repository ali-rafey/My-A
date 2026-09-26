import { NextRequest, NextResponse } from 'next/server';
import { SESSION_COOKIE_NAME } from '@/lib/auth/cookie';

// The admin portal. The filesystem folder is app/admin/.
const ADMIN_BASE = '/admin';

// The portal's previous address. Kept only to forward old bookmarks to the same
// page under /admin; nothing is served from it any more. Browsers send the "@"
// either literally or percent-encoded, so both spellings are matched.
const LEGACY_BASES = ['/escaleadsadmin@44334', '/escaleadsadmin%4044334'];

// Exactly /admin or anything under /admin/ — never a sibling like /administrator.
function isAdminPath(pathname: string): boolean {
  return pathname === ADMIN_BASE || pathname.startsWith(`${ADMIN_BASE}/`);
}

function isAdminRoot(pathname: string): boolean {
  return pathname === ADMIN_BASE || pathname === `${ADMIN_BASE}/`;
}

function legacyBase(pathname: string): string | undefined {
  return LEGACY_BASES.find((base) => pathname === base || pathname.startsWith(`${base}/`));
}

// First-line gate. We just check presence of the session cookie here — full HMAC validation happens
// in the page (via getAdminSession) and API routes (via requireAdmin), which redirect/refuse if invalid.
// This keeps middleware fast and edge-compatible without bundling iron-session into the edge runtime.
export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Temporary (307), not permanent: a cached permanent redirect would outlive
  // any later change to where the portal lives.
  const legacy = legacyBase(pathname);
  if (legacy) {
    const url = req.nextUrl.clone();
    url.pathname = `${ADMIN_BASE}${pathname.slice(legacy.length)}`;
    return NextResponse.redirect(url, 307);
  }

  if (!isAdminPath(pathname)) {
    return NextResponse.next();
  }

  const res = NextResponse.next();
  res.headers.set('X-Robots-Tag', 'noindex, nofollow, noarchive');

  if (isAdminRoot(pathname)) {
    return res;
  }

  const cookie = req.cookies.get(SESSION_COOKIE_NAME)?.value;
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
    '/admin',
    '/admin/:path*',
    '/escaleadsadmin@44334',
    '/escaleadsadmin@44334/:path*',
    '/escaleadsadmin%4044334',
    '/escaleadsadmin%4044334/:path*',
  ],
};
