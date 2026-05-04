import 'server-only';
import { NextResponse, type NextRequest } from 'next/server';
import { requireAdmin, SessionConfigError } from '@/lib/auth/session';
import { assertSameOrigin } from '@/lib/security/csrf';
import { rateLimit, clientKey } from '@/lib/rate-limit';

type Handler = (req: NextRequest, ctx: any) => Promise<NextResponse> | NextResponse;

type Options = {
  // Skip CSRF (e.g. for plain GETs that don't change state).
  csrf?: boolean;
  // Skip rate limit (e.g. for read-heavy GETs).
  rateLimit?: boolean;
};

// Single boundary used by every admin route. Always returns JSON, never an HTML error page.
// Order: CSRF -> rate-limit -> auth -> handler -> catch.
export function withAdminGuard(handler: Handler, opts: Options = {}): Handler {
  const useCsrf = opts.csrf !== false;
  const useRate = opts.rateLimit !== false;

  return async (req, ctx) => {
    try {
      if (useCsrf) {
        const csrf = assertSameOrigin(req);
        if (!csrf.ok) {
          return NextResponse.json({ error: csrf.reason }, { status: 403 });
        }
      }

      if (useRate) {
        const limited = rateLimit(clientKey(req.headers, 'admin-write'), 60);
        if (!limited.ok) {
          return NextResponse.json(
            { error: 'Rate limit exceeded.' },
            {
              status: 429,
              headers: { 'Retry-After': String(Math.ceil(limited.retryAfterMs / 1000)) },
            },
          );
        }
      }

      try {
        await requireAdmin();
      } catch (err) {
        if (err instanceof SessionConfigError) {
          console.error('[admin] session config error:', err.message);
          return NextResponse.json({ error: err.message }, { status: 500 });
        }
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }

      return await handler(req, ctx);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown server error.';
      console.error('[admin] uncaught error in', req.method, req.nextUrl?.pathname, err);
      return NextResponse.json(
        {
          error: message,
          ...(process.env.NODE_ENV !== 'production'
            ? { stack: err instanceof Error ? err.stack : undefined }
            : {}),
        },
        { status: 500 },
      );
    }
  };
}
