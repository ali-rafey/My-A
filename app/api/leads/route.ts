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

  // 3. Capture connection metadata for the admin dashboard. Vercel injects geo headers automatically;
  //    on other hosts those are null and only the IP is stored. Not surfaced to the client.
  const clientInfo = getClientInfo(req.headers);

  // 4. Insert via the anon client — RLS allows INSERT only.
  const supabase = createServerAnonClient();
  const { error } = await supabase.from('leads').insert({
    name,
    email,
    phone: phone || null,
    message,
    ip_address: clientInfo.ip,
    country: clientInfo.country,
    region: clientInfo.region,
    city: clientInfo.city,
  });

  if (error) {
    console.error('lead insert failed:', error.message);
    return NextResponse.json(
      { status: 'error', message: 'We could not save your message. Please try again.' },
      { status: 500 },
    );
  }

  return NextResponse.json(
    { status: 'success', message: 'Thanks — we will get back to you soon.' },
    { status: 201 },
  );
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
