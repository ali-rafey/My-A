import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth/session';
import { createServiceClient } from '@/lib/supabase/server';

export const runtime = 'nodejs';

function csvEscape(value: unknown): string {
  if (value === null || value === undefined) return '';
  const str = String(value);
  if (/[",\n\r]/.test(str)) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

export async function GET() {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const supabase = createServiceClient();
  const { data, error } = await supabase
    .from('leads')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const rows = data ?? [];
  const header = ['id', 'name', 'email', 'phone', 'message', 'read', 'created_at'];
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
}
