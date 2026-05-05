import 'server-only';

// =============================================================================
// Visitor IP + geolocation extractor
// =============================================================================
// Source of truth: request headers injected by the Vercel edge.
//
// IP HEADERS (in priority order — see getClientInfo):
//   1. x-real-ip                   — single value, set by Vercel after stripping any client-supplied
//                                    XFF. Most trustworthy on Vercel and most other PaaS edges.
//   2. x-forwarded-for (first hop) — comma-separated chain. On Vercel the first entry is the client
//                                    IP, but on platforms without an edge that strips client-supplied
//                                    XFF this can be spoofable. Fallback only.
//
// GEO HEADERS (set by Vercel's edge using MaxMind GeoLite2):
//   x-vercel-ip-country         — ISO-3166-1 alpha-2  (e.g. "GB")
//   x-vercel-ip-country-region  — ISO-3166-2 region   (e.g. "ENG")
//   x-vercel-ip-city            — city name, URL-encoded (e.g. "Brighton")
//   x-vercel-ip-latitude        — decimal lat as string
//   x-vercel-ip-longitude       — decimal lon as string
//   x-vercel-ip-timezone        — IANA timezone (e.g. "Europe/London")
//
// ACCURACY DISCLAIMER (read this before "fixing" a Brighton-vs-London report):
//   GeoLite2 maps each IP block to the centroid of its registered allocation, NOT to the subscriber's
//   address. UK consumer/mobile ISPs frequently anchor whole /16 blocks at a single regional POP, so
//   a London resident can appear as Brighton/Reading/Slough depending on their ISP. MaxMind's own
//   published city-level accuracy for the UK is ~60% within 50 km, dropping to 20–30% for mobile.
//   No code change in this file can improve that accuracy — the only fixes are (a) pay for a higher-
//   tier provider like IPinfo or MaxMind GeoIP2 Insights, or (b) ask the visitor for HTML5
//   Geolocation, which conflicts with the "no client-side disclosure" product requirement.
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

export function getClientInfo(headers: Headers): ClientInfo {
  // Prefer x-real-ip (single value, set by the edge, not client-controllable). Fall back to the
  // first hop of x-forwarded-for only if x-real-ip is absent. On Vercel both agree; on other hosts
  // x-real-ip is the safer default.
  const realIp = headers.get('x-real-ip')?.trim();
  const xff = headers.get('x-forwarded-for');
  const ip = (realIp || xff?.split(',')[0]?.trim() || '') || null;

  const country = headers.get('x-vercel-ip-country') || null;
  const region = headers.get('x-vercel-ip-country-region') || null;
  const cityRaw = headers.get('x-vercel-ip-city');
  const city = cityRaw ? safeDecode(cityRaw) : null;

  return { ip, country, region, city };
}

// Format a "City, Region, Country" string for display, gracefully omitting any null parts.
export function formatLocation(info: Pick<ClientInfo, 'city' | 'region' | 'country'>): string {
  const parts = [info.city, info.region, info.country].filter((p): p is string => Boolean(p));
  return parts.join(', ');
}
