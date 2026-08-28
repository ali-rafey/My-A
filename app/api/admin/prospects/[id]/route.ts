import { NextResponse, type NextRequest } from 'next/server';
import { createServiceClient } from '@/lib/supabase/server';
import { loadProspectRecords } from '@/lib/content/prospects';
import { sanitizeText } from '@/lib/sanitize';
import { withAdminGuard } from '@/lib/admin-handler';
import { PROSPECT_STATUSES, type ProspectStatusValue } from '@/lib/supabase/types';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export const PATCH = withAdminGuard(async (req: NextRequest, { params }: { params: { id: string } }) => {
  let body: { status?: unknown; notes?: unknown; last_contacted_at?: unknown };
  try {
    body = (await req.json()) as typeof body;
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  // The prospect id must exist in the CSV. Without this check the endpoint would let an
  // authenticated caller write arbitrary rows into prospect_status that no record ever joins to —
  // invisible garbage that would accumulate every time the CSV is regenerated.
  const known = loadProspectRecords().some((record) => record.id === params.id);
  if (!known) {
    return NextResponse.json(
      { error: `Unknown prospect id "${params.id}". It is not present in data/prospects.csv.` },
      { status: 404 },
    );
  }

  const status = typeof body.status === 'string' ? body.status : undefined;
  if (status !== undefined && !PROSPECT_STATUSES.includes(status as ProspectStatusValue)) {
    return NextResponse.json(
      { error: `Invalid status "${status}". Expected one of: ${PROSPECT_STATUSES.join(', ')}.` },
      { status: 400 },
    );
  }

  const notes = body.notes === undefined ? undefined : sanitizeText(body.notes, 4000);

  // Stamp last_contacted_at automatically when a prospect first moves to Contacted, so the
  // operator never has to remember to set it by hand.
  const contactedAt =
    status === 'contacted' ? new Date().toISOString() : undefined;

  const patch: Record<string, unknown> = { prospect_id: params.id };
  if (status !== undefined) patch.status = status;
  if (notes !== undefined) patch.notes = notes || null;
  if (contactedAt !== undefined) patch.last_contacted_at = contactedAt;

  if (Object.keys(patch).length === 1) {
    return NextResponse.json({ error: 'Nothing to update.' }, { status: 400 });
  }

  const supabase = createServiceClient();
  // Upsert because a prospect has no status row until it is first touched. No .single() — a
  // zero-row result is reported as an explicit 404 per the convention in the leads routes.
  const { data, error } = await supabase
    .from('prospect_status')
    .upsert(patch, { onConflict: 'prospect_id' })
    .select();

  if (error) {
    console.error('[admin/prospects PATCH] supabase error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  if (!data || data.length === 0) {
    return NextResponse.json(
      {
        error:
          `Upsert affected 0 rows for "${params.id}". Confirm the prospect_status table and its ` +
          `service-role policy exist (supabase/schema.sql), then run: notify pgrst, 'reload schema';`,
      },
      { status: 404 },
    );
  }

  return NextResponse.json({ status: data[0] });
});
