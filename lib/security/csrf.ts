import 'server-only';
import { type NextRequest } from 'next/server';

// Defense-in-depth CSRF check: verify Origin (or Referer) matches our host on state-changing requests.
// SameSite=Lax already blocks cross-site cookie sending, so this is belt-and-braces.
export function assertSameOrigin(req: NextRequest): { ok: true } | { ok: false; reason: string } {
  const method = req.method.toUpperCase();
  if (method === 'GET' || method === 'HEAD' || method === 'OPTIONS') {
    return { ok: true };
  }

  const host = req.headers.get('host');
  const origin = req.headers.get('origin');
  const referer = req.headers.get('referer');

  if (!host) return { ok: false, reason: 'Missing host header' };

  const isSelf = (raw: string | null): boolean => {
    if (!raw) return false;
    try {
      const url = new URL(raw);
      return url.host === host;
    } catch {
      return false;
    }
  };

  if (origin && isSelf(origin)) return { ok: true };
  if (referer && isSelf(referer)) return { ok: true };

  return { ok: false, reason: 'Cross-origin request blocked' };
}
