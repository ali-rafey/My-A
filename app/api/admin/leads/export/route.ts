import { NextResponse, type NextRequest } from 'next/server';
import { createServiceClient } from '@/lib/supabase/server';
import { withAdminGuard } from '@/lib/admin-handler';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function csvEscape(value: unknown): string {
  if (value === null || value === undefined) return '';
  const str = String(value);
  if (/[",\n\r]/.test(str)) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

export const GET = withAdminGuard(async (_req: NextRequest) => {
  const supabase = createServiceClient();
  const { data, error } = await supabase
    .from('leads')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('[admin/leads/export] supabase error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const rows = data ?? [];
  const header = [
    'id', 'name', 'email', 'phone', 'message', 'read', 'created_at',
    'ip_address', 'country', 'region', 'city',
  ];
  const lines = [header.join(',')];

  for (const lead of rows) {
    lines.push([
      lead.id,
      lead.name,
      lead.email,
      lead.phone ?? '',
      lead.message,
      lead.read ? 'true' : 'false',
      lead.created_at,
      lead.ip_address ?? '',
      lead.country ?? '',
      lead.region ?? '',
      lead.city ?? '',
    ].map(csvEscape).join(','));
  }

  const csv = lines.join('\n');
  const filename = `leads-${new Date().toISOString().slice(0, 10)}.csv`;

  return new NextResponse(csv, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="${filename}"`,
      'Cache-Control': 'no-store',
    },
  });
}, { csrf: false });
