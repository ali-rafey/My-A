import { NextResponse, type NextRequest } from 'next/server';
import { getProspects } from '@/lib/content/prospects';
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

// Exports the MERGED view — research record plus live pipeline state. This is deliberately not the
// same file as data/prospects.csv: that one is the research input and stays in git, this one is a
// point-in-time snapshot of where every prospect stands, for working offline or in a spreadsheet.
export const GET = withAdminGuard(async (_req: NextRequest) => {
  const prospects = await getProspects();

  const header = [
    'id', 'name', 'role', 'brand', 'brand_stage', 'product_category', 'country', 'market',
    'score', 'status', 'last_contacted_at', 'notes',
    'signal_type', 'signal_summary', 'signal_quote', 'signal_date',
    'source_platform', 'source_url', 'website', 'tech_gaps',
    'needs_tech', 'needs_manufacturing', 'contact_route', 'contact_value',
    'instagram', 'linkedin', 'phone', 'founded_year',
    'verified', 'verified_on',
  ];

  const lines = [header.join(',')];
  for (const p of prospects) {
    lines.push([
      p.id, p.name, p.role, p.brand, p.brand_stage, p.product_category, p.country, p.market,
      p.score, p.status, p.last_contacted_at ?? '', p.notes ?? '',
      p.signal_type, p.signal_summary, p.signal_quote, p.signal_date,
      p.source_platform, p.source_url, p.website, p.tech_gaps.join(' | '),
      p.needs_tech ? 'yes' : 'no', p.needs_manufacturing, p.contact_route, p.contact_value,
      p.instagram, p.linkedin, p.phone, p.founded_year,
      p.verified ? 'yes' : 'no', p.verified_on,
    ].map(csvEscape).join(','));
  }

  const filename = `prospects-${new Date().toISOString().slice(0, 10)}.csv`;
  return new NextResponse(lines.join('\n'), {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="${filename}"`,
      'Cache-Control': 'no-store',
    },
  });
}, { csrf: false });
