import { redirect } from 'next/navigation';
import { getAdminSession } from '@/lib/auth/session';

// The server-side gate for every admin page except the root (/admin), which
// shows the login form itself.
//
// Why each page, not just the middleware or the layout:
//   • middleware.ts only checks that a session cookie is PRESENT — it cannot
//     run iron-session on the Edge (see CLAUDE.md §6.5) — so a cookie with any
//     value gets past it.
//   • The admin layout cannot be the gate either: a page segment can be
//     requested on its own (client navigation fetches only the page), without
//     its layout re-rendering.
// So every page verifies the sealed session here, BEFORE it reads any data.
// Call it first, outside any try/catch — redirect() works by throwing.
export async function requireAdminPage(): Promise<void> {
  const session = await getAdminSession();
  if (!session.isAdmin) redirect('/admin');
}
