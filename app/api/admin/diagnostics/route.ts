import { NextResponse, type NextRequest } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { withAdminGuard } from '@/lib/admin-handler';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

type Check = {
  name: string;
  ok: boolean;
  detail: string;
};

const REQUIRED_LEAD_COLUMNS = [
  'id', 'name', 'email', 'phone', 'message', 'read', 'created_at',
  'ip_address', 'country', 'region', 'city',
];

export const GET = withAdminGuard(async (_req: NextRequest) => {
  const checks: Check[] = [];

  // 1. Env vars present?
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const service = process.env.SUPABASE_SERVICE_ROLE_KEY;
  checks.push({
    name: 'NEXT_PUBLIC_SUPABASE_URL set',
    ok: !!url,
    detail: url ? url : 'MISSING',
  });
  checks.push({
    name: 'NEXT_PUBLIC_SUPABASE_ANON_KEY set',
    ok: !!anon,
    detail: anon ? `${anon.slice(0, 20)}…` : 'MISSING',
  });
  checks.push({
    name: 'SUPABASE_SERVICE_ROLE_KEY set',
    ok: !!service,
    detail: service ? `${service.slice(0, 20)}…` : 'MISSING',
  });
  checks.push({
    name: 'SESSION_SECRET set',
    ok: !!process.env.SESSION_SECRET && process.env.SESSION_SECRET.length >= 32,
    detail: process.env.SESSION_SECRET
      ? `${process.env.SESSION_SECRET.length} chars`
      : 'MISSING',
  });
  checks.push({
    name: 'ADMIN_USERNAME / ADMIN_PASSWORD set',
    ok: !!(process.env.ADMIN_USERNAME && process.env.ADMIN_PASSWORD),
    detail: process.env.ADMIN_USERNAME ? `user="${process.env.ADMIN_USERNAME}"` : 'MISSING',
  });

  if (!url || !anon || !service) {
    return NextResponse.json({ checks, halt: 'Missing env vars — fix in Vercel and redeploy.' });
  }

  const serviceClient = createClient(url, service, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const anonClient = createClient(url, anon, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  // 2. leads table exists + readable via service role
  {
    const { error, count } = await serviceClient
      .from('leads')
      .select('*', { count: 'exact', head: true });
    checks.push({
      name: 'leads table readable (service role)',
      ok: !error,
      detail: error ? `${error.code ?? ''} ${error.message}` : `OK — ${count ?? 0} rows`,
    });
  }

  // 3. blogs table exists + readable via service role
  {
    const { error, count } = await serviceClient
      .from('blogs')
      .select('*', { count: 'exact', head: true });
    checks.push({
      name: 'blogs table readable (service role)',
      ok: !error,
      detail: error ? `${error.code ?? ''} ${error.message}` : `OK — ${count ?? 0} rows`,
    });
  }

  // 4. Verify all expected columns are present on leads.
  //    information_schema is always queryable; this uses raw RPC-style SQL.
  {
    const { data, error } = await serviceClient
      .from('leads')
      .select(REQUIRED_LEAD_COLUMNS.join(','))
      .limit(0);
    if (error) {
      // Identify which column is missing from the error message if possible.
      const missing = REQUIRED_LEAD_COLUMNS.filter((c) => error.message?.includes(c));
      checks.push({
        name: 'leads has all required columns',
        ok: false,
        detail:
          `${error.code ?? ''} ${error.message} — missing: ${missing.join(', ') || 'unknown'}. ` +
          'Run "notify pgrst, \'reload schema\';" in Supabase SQL Editor and retry.',
      });
    } else {
      checks.push({
        name: 'leads has all required columns',
        ok: true,
        detail: `OK — confirmed ${REQUIRED_LEAD_COLUMNS.length} columns selectable (sample row count: ${data?.length ?? 0})`,
      });
    }
  }

  // 5. Insert via ANON client — this is the exact path /api/leads takes.
  let testId: string | null = null;
  {
    const { data, error } = await anonClient
      .from('leads')
      .insert({
        name: '__diagnostic__',
        email: 'diagnostic@example.invalid',
        phone: null,
        message: 'Self-test row from /escaleadsadmin@44334/diagnostics',
        ip_address: '0.0.0.0',
        country: 'XX',
        region: 'TEST',
        city: 'Test',
      })
      .select('id')
      .single();

    if (error) {
      checks.push({
        name: 'anon INSERT into leads (full row)',
        ok: false,
        detail: `${error.code ?? ''} ${error.message}. Check RLS policy "Public can insert leads".`,
      });
    } else {
      testId = data?.id ?? null;
      checks.push({
        name: 'anon INSERT into leads (full row)',
        ok: true,
        detail: `OK — inserted id ${testId}`,
      });
    }
  }

  // 6. Service-role can SELECT the row we just inserted.
  if (testId) {
    const { data, error } = await serviceClient
      .from('leads')
      .select('*')
      .eq('id', testId)
      .maybeSingle();
    checks.push({
      name: 'service-role SELECT diagnostic row',
      ok: !error && !!data,
      detail: error
        ? `${error.code ?? ''} ${error.message}`
        : data
          ? `OK — ip_address=${data.ip_address ?? 'null'}, country=${data.country ?? 'null'}`
          : 'Row not found (insert may have silently failed)',
    });
  }

  // 7. Service-role can DELETE the row.
  if (testId) {
    const { error } = await serviceClient.from('leads').delete().eq('id', testId);
    checks.push({
      name: 'service-role DELETE diagnostic row',
      ok: !error,
      detail: error ? `${error.code ?? ''} ${error.message}` : 'OK — cleaned up',
    });
  }

  return NextResponse.json({ checks, halt: null });
}, { csrf: false });
