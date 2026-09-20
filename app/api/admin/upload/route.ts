import { NextResponse, type NextRequest } from 'next/server';
import { createServiceClient } from '@/lib/supabase/server';
import { withAdminGuard } from '@/lib/admin-handler';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// Image upload for the admin editors: a file from the operator's machine goes
// into the public `media` bucket (see supabase/projects.sql) and the route
// hands back the URL to store on the row.
//
// The bucket is public for READS only. Writes never leave this route, which
// runs behind withAdminGuard (same-origin, rate limit, admin session) and uses
// the service role. Nothing here trusts the browser: the extension comes from
// the sniffed type, not the filename, and the stored name is generated.

const MAX_BYTES = 6 * 1024 * 1024;

// Sniffed from the first bytes rather than taken from the client's Content-Type,
// which is trivially spoofed. A file that is not one of these is refused.
const SIGNATURES: { ext: string; type: string; match: (b: Uint8Array) => boolean }[] = [
  { ext: 'jpg', type: 'image/jpeg', match: (b) => b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff },
  { ext: 'png', type: 'image/png', match: (b) => b[0] === 0x89 && b[1] === 0x50 && b[2] === 0x4e && b[3] === 0x47 },
  { ext: 'gif', type: 'image/gif', match: (b) => b[0] === 0x47 && b[1] === 0x49 && b[2] === 0x46 },
  {
    ext: 'webp',
    type: 'image/webp',
    match: (b) =>
      b[0] === 0x52 && b[1] === 0x49 && b[2] === 0x46 && b[3] === 0x46 &&
      b[8] === 0x57 && b[9] === 0x45 && b[10] === 0x42 && b[11] === 0x50,
  },
];

export const POST = withAdminGuard(async (req: NextRequest) => {
  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return NextResponse.json({ error: 'Expected a file upload.' }, { status: 400 });
  }

  const file = form.get('file');
  if (!(file instanceof File) || file.size === 0) {
    return NextResponse.json({ error: 'No file received.' }, { status: 400 });
  }
  if (file.size > MAX_BYTES) {
    return NextResponse.json(
      { error: `That image is ${(file.size / 1024 / 1024).toFixed(1)}MB. The limit is 6MB.` },
      { status: 413 },
    );
  }

  const bytes = new Uint8Array(await file.arrayBuffer());
  const kind = SIGNATURES.find((s) => s.match(bytes));
  if (!kind) {
    return NextResponse.json(
      { error: 'That file is not a JPEG, PNG, GIF or WebP image.' },
      { status: 415 },
    );
  }

  // Generated name: the operator's filename never reaches the storage path, so
  // it cannot smuggle a path segment or an extension of its own.
  const stamp = new Date().toISOString().slice(0, 10);
  const path = `uploads/${stamp}/${crypto.randomUUID()}.${kind.ext}`;

  const supabase = createServiceClient();
  const { error } = await supabase.storage
    .from('media')
    .upload(path, bytes, { contentType: kind.type, cacheControl: '31536000', upsert: false });

  if (error) {
    console.error('[admin/upload] storage error:', error);
    const missingBucket = /bucket not found/i.test(error.message);
    return NextResponse.json(
      {
        error: missingBucket
          ? 'The media bucket does not exist yet. Run supabase/projects.sql in the Supabase SQL Editor.'
          : error.message,
      },
      { status: 500 },
    );
  }

  const { data } = supabase.storage.from('media').getPublicUrl(path);
  return NextResponse.json({ url: data.publicUrl, path }, { status: 201 });
});
