import { NextResponse, type NextRequest } from 'next/server';
import { createServerAnonClient } from '@/lib/supabase/server';
import { sanitizeText, isValidEmail } from '@/lib/sanitize';
import { rateLimit, clientKey } from '@/lib/rate-limit';
import { assertSameOrigin } from '@/lib/security/csrf';
import { getClientInfo } from '@/lib/client-info';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

type LeadPayload = {
  name?: unknown;
  email?: unknown;
  phone?: unknown;
  message?: unknown;
};

async function handleLead(req: NextRequest): Promise<NextResponse> {
  // 1. Origin check — defense-in-depth on top of SameSite=Lax cookies.
  const csrf = assertSameOrigin(req);
  if (!csrf.ok) {
    return NextResponse.json({ status: 'error', message: csrf.reason }, { status: 403 });
  }

  // 2. Rate limit per IP — 5 submissions per minute.
  const limited = rateLimit(clientKey(req.headers, 'leads'), 5);
  if (!limited.ok) {
    return NextResponse.json(
      { status: 'error', message: 'Too many submissions. Please wait a moment and try again.' },
      { status: 429, headers: { 'Retry-After': String(Math.ceil(limited.retryAfterMs / 1000)) } },
    );
  }

  // 2. Parse and validate payload.
  let payload: LeadPayload;
  try {
    payload = (await req.json()) as LeadPayload;
  } catch {
    return NextResponse.json(
      { status: 'error', message: 'Invalid JSON body.' },
      { status: 400 },
    );
  }

  const name = sanitizeText(payload.name, 120);
  const email = sanitizeText(payload.email, 254);
  const phone = sanitizeText(payload.phone, 40);
  const message = sanitizeText(payload.message, 5000);

  if (!name || !email || !message) {
    return NextResponse.json(
      { status: 'error', message: 'Name, email, and message are required.' },
      { status: 400 },
    );
  }

  if (!isValidEmail(email)) {
    return NextResponse.json(
      { status: 'error', message: 'Please enter a valid email address.' },
      { status: 400 },
    );
  }

  // 3. Capture connection metadata for the admin dashboard. IPinfo (when IPINFO_TOKEN is set)
  //    upgrades accuracy from Vercel's GeoLite2 baseline; otherwise falls back to Vercel headers.
  //    Not surfaced to the client. Network call has a 1.5s timeout — never blocks lead saving.
  const clientInfo = await getClientInfo(req.headers);

  // 4. Insert via the anon client — RLS allows INSERT only.
  //    Schema-tolerant: if the IP/geo columns aren't present yet (because the migration hasn't been
  //    run on this Supabase project), Postgres returns 42703 (undefined_column) or PostgREST PGRST204
  //    ("Could not find the 'ip_address' column"). We retry with the base columns so the lead still
  //    saves, and log a loud hint that the migration is pending.
  const supabase = createServerAnonClient();
  const baseRow = {
    name,
    email,
    phone: phone || null,
    message,
  };
  const fullRow = {
    ...baseRow,
    ip_address: clientInfo.ip,
    country: clientInfo.country,
    region: clientInfo.region,
    city: clientInfo.city,
  };

  let { error } = await supabase.from('leads').insert(fullRow);

  if (error && isMissingColumnError(error)) {
    console.warn(
      '[api/leads] geo/ip columns missing on leads table — falling back to base insert. ' +
      'Run supabase/schema.sql in the Supabase SQL Editor to add ip_address/country/region/city columns. ' +
      'PG error:',
      error.code,
      error.message,
    );
    const retry = await supabase.from('leads').insert(baseRow);
    error = retry.error;
  }

  if (error) {
    console.error('[api/leads] insert failed:', {
      code: error.code,
      message: error.message,
      details: (error as { details?: string }).details,
      hint: (error as { hint?: string }).hint,
    });
    return NextResponse.json(
      {
        status: 'error',
        message: 'We could not save your message. Please try again in a moment.',
        // Surface a debug hint in non-production so the operator can act on it.
        ...(process.env.NODE_ENV !== 'production'
          ? { debug: error.message }
          : {}),
      },
      { status: 500 },
    );
  }

  return NextResponse.json(
    { status: 'success', message: 'Thanks — we will get back to you soon.' },
    { status: 201 },
  );
}

function isMissingColumnError(error: { code?: string; message?: string }): boolean {
  // 42703 = undefined_column (Postgres). PGRST204 = PostgREST schema-cache miss.
  if (error.code === '42703' || error.code === 'PGRST204') return true;
  const msg = error.message?.toLowerCase() ?? '';
  return /could not find the .* column|does not exist/.test(msg) &&
    /(ip_address|country|region|city)/.test(msg);
}

export async function POST(req: NextRequest) {
  try {
    return await handleLead(req);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown server error.';
    console.error('[api/leads] uncaught error:', err);
    return NextResponse.json(
      { status: 'error', message: `We could not process your request: ${message}` },
      { status: 500 },
    );
  }
}
