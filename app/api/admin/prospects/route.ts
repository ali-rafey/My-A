import { NextResponse, type NextRequest } from 'next/server';
import { getProspects } from '@/lib/content/prospects';
import { withAdminGuard } from '@/lib/admin-handler';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export const GET = withAdminGuard(async (_req: NextRequest) => {
  const prospects = await getProspects();
  return NextResponse.json({ prospects });
}, { csrf: false }); // read-only
