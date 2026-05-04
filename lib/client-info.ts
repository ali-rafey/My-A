import 'server-only';

// Extracts the visitor's IP and (when on Vercel) geolocation from request headers.
// Edge-safe — no Node-only deps, no extra network calls. Vercel injects the geo headers
// automatically based on the routing CDN's IP→geo lookup; on other hosts country/region/city
// will simply be null and we fall back to IP-only storage.
//
// PRIVACY NOTE: IP is PII under GDPR/UK GDPR when combined with other data. We only store this on
// /api/leads (after the user submitted a form to us — the strongest possible legitimate-interest
// signal) and only expose it on the authenticated admin dashboard. No client-side disclosure is
// rendered, per product requirement; if a privacy policy is added later, mention IP+geo capture.

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
  // Prefer the first hop in X-Forwarded-For, else x-real-ip. Both are set by Vercel's edge.
  const xff = headers.get('x-forwarded-for');
  const ip = (xff?.split(',')[0]?.trim() || headers.get('x-real-ip') || '').trim() || null;

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
