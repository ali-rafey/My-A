import 'server-only';

// =============================================================================
// Visitor IP + geolocation extractor
// =============================================================================
// Source priority:
//   1. IPinfo.io  (when IPINFO_TOKEN is set — paid/free-keyed, ~85% UK city accuracy)
//   2. Vercel edge headers (free MaxMind GeoLite2, ~60% city accuracy, anchors to ISP POP)
//
// IP HEADERS (in priority order — see getClientInfo):
//   1. x-real-ip                   — single value, set by Vercel after stripping any client-supplied
//                                    XFF. Most trustworthy on Vercel and most other PaaS edges.
//   2. x-forwarded-for (first hop) — comma-separated chain. On Vercel the first entry is the client
//                                    IP, but on platforms without an edge that strips client-supplied
//                                    XFF this can be spoofable. Fallback only.
//
// VERCEL GEO HEADERS (fallback when IPinfo is unavailable):
//   x-vercel-ip-country         — ISO-3166-1 alpha-2  (e.g. "GB")
//   x-vercel-ip-country-region  — ISO-3166-2 region   (e.g. "ENG")
//   x-vercel-ip-city            — city name, URL-encoded
//
// PRIVACY NOTE: IP is PII under GDPR/UK GDPR when combined with other data. We only store this on
// /api/leads (after the user submitted a form to us — the strongest possible legitimate-interest
// signal) and only expose it on the authenticated admin dashboard. No client-side disclosure is
// rendered, per product requirement; if a privacy policy is added later, mention IP + geo capture.
// =============================================================================

export type ClientInfo = {
  ip: string | null;
  country: string | null;
  region: string | null;
  city: string | null;
};

function safeDecode(value: string): string {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

// ---------- IPinfo lookup (network) ----------

type IpinfoResponse = {
  ip?: string;
  city?: string;
  region?: string;
  country?: string;     // 2-letter code, e.g. "GB"
  loc?: string;         // "lat,lng"
  postal?: string;
  timezone?: string;
  org?: string;
  hostname?: string;
  bogon?: boolean;
};

// In-memory TTL cache so repeat submissions from the same IP within an hour cost zero API calls.
// Bounded to 1024 entries; LRU-ish via Map insertion order (oldest evicted first).
type CacheEntry = { data: IpinfoResponse; expiresAt: number };
const ipCache = new Map<string, CacheEntry>();
const CACHE_TTL_MS = 60 * 60 * 1000; // 1 hour
const CACHE_MAX = 1024;
const IPINFO_TIMEOUT_MS = 1500;

function isPrivateIp(ip: string): boolean {
  // Skip lookups for loopback/RFC-1918/IPv6 link-local — IPinfo can't resolve them anyway.
  return (
    ip === '127.0.0.1' ||
    ip === '::1' ||
    ip.startsWith('10.') ||
    ip.startsWith('192.168.') ||
    /^172\.(1[6-9]|2[0-9]|3[01])\./.test(ip) ||
    ip.toLowerCase().startsWith('fc') ||
    ip.toLowerCase().startsWith('fd') ||
    ip.toLowerCase().startsWith('fe80:')
  );
}

async function fetchIpinfo(ip: string, token: string): Promise<IpinfoResponse | null> {
  // Cache hit
  const cached = ipCache.get(ip);
  if (cached && cached.expiresAt > Date.now()) {
    return cached.data;
  }

  const ac = new AbortController();
  const timer = setTimeout(() => ac.abort(), IPINFO_TIMEOUT_MS);
  try {
    const url = `https://ipinfo.io/${encodeURIComponent(ip)}?token=${encodeURIComponent(token)}`;
    const res = await fetch(url, {
      headers: { Accept: 'application/json' },
      signal: ac.signal,
      cache: 'no-store',
    });
    if (!res.ok) {
      const body = await res.text().catch(() => '');
      console.warn(`[client-info] ipinfo non-ok ${res.status}: ${body.slice(0, 200)}`);
      return null;
    }
    const data = (await res.json()) as IpinfoResponse;
    if (data.bogon) return null;

    // Cache it. Evict oldest if at capacity.
    ipCache.set(ip, { data, expiresAt: Date.now() + CACHE_TTL_MS });
    if (ipCache.size > CACHE_MAX) {
      const oldestKey = ipCache.keys().next().value as string | undefined;
      if (oldestKey) ipCache.delete(oldestKey);
    }
    return data;
  } catch (err) {
    if (err instanceof Error && err.name === 'AbortError') {
      console.warn(`[client-info] ipinfo timed out after ${IPINFO_TIMEOUT_MS}ms for ${ip}`);
    } else {
      console.warn('[client-info] ipinfo fetch failed:', err instanceof Error ? err.message : err);
    }
    return null;
  } finally {
    clearTimeout(timer);
  }
}

// ---------- Public API ----------

export async function getClientInfo(headers: Headers): Promise<ClientInfo> {
  // 1. Extract IP (header-only).
  const realIp = headers.get('x-real-ip')?.trim();
  const xff = headers.get('x-forwarded-for');
  const ip = (realIp || xff?.split(',')[0]?.trim() || '') || null;

  // 2. Vercel-edge geo (free, low-accuracy fallback).
  const fallbackCountry = headers.get('x-vercel-ip-country') || null;
  const fallbackRegion = headers.get('x-vercel-ip-country-region') || null;
  const cityRaw = headers.get('x-vercel-ip-city');
  const fallbackCity = cityRaw ? safeDecode(cityRaw) : null;

  // 3. Upgrade with IPinfo when configured. Any failure (timeout, 401, 5xx, network) silently falls
  //    back to the Vercel headers — never blocks the lead submission.
  const token = process.env.IPINFO_TOKEN;
  if (ip && token && !isPrivateIp(ip)) {
    const info = await fetchIpinfo(ip, token);
    if (info) {
      return {
        ip,
        country: info.country || fallbackCountry,
        region: info.region || fallbackRegion,
        city: info.city || fallbackCity,
      };
    }
  }

  return { ip, country: fallbackCountry, region: fallbackRegion, city: fallbackCity };
}

// Format a "City, Region, Country" string for display, gracefully omitting any null parts.
export function formatLocation(info: Pick<ClientInfo, 'city' | 'region' | 'country'>): string {
  const parts = [info.city, info.region, info.country].filter((p): p is string => Boolean(p));
  return parts.join(', ');
}
