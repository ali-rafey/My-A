'use client';

import { usePathname, useSearchParams } from 'next/navigation';
import { useEffect, Suspense } from 'react';

// Client-only pageview tracker. The gtag.js loader and init script are no longer rendered here —
// they live as plain <script> tags inside app/layout.tsx's <head> so they appear in the SSR HTML
// (required for Google Search Console's GA-based ownership verification, which scans raw HTML and
// does NOT execute JavaScript).
//
// This component is responsible only for emitting a `config` call on every App Router client-side
// route change. The initial pageview is fired by gtag's own auto-pageview behavior on first load,
// suppressed via send_page_view:false in the bootstrap, and replaced by the tracker's mount-time
// useEffect call. So the first paint AND all subsequent SPA route changes are tracked.

const DEFAULT_MEASUREMENT_ID = 'G-1K5C057XHQ';
const ADMIN_PATH_PREFIXES = ['/escaleadsadmin@44334', '/escaleadsadmin%4044334'];

declare global {
  interface Window {
    dataLayer: unknown[];
    gtag: (...args: unknown[]) => void;
  }
}

function Tracker({ measurementId }: { measurementId: string }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (typeof window === 'undefined' || typeof window.gtag !== 'function') return;
    if (ADMIN_PATH_PREFIXES.some((p) => pathname.startsWith(p))) return;

    const query = searchParams.toString();
    const url = query ? `${pathname}?${query}` : pathname;
    window.gtag('config', measurementId, { page_path: url });
  }, [pathname, searchParams, measurementId]);

  return null;
}

export default function GoogleAnalytics() {
  const measurementId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID || DEFAULT_MEASUREMENT_ID;
  if (!measurementId) return null;
  return (
    <Suspense fallback={null}>
      <Tracker measurementId={measurementId} />
    </Suspense>
  );
}
