import 'server-only';
import { cookies } from 'next/headers';
import { getIronSession, type SessionOptions } from 'iron-session';

export type AdminSession = {
  isAdmin?: boolean;
  username?: string;
  loginAt?: number;
};

const sessionPassword = process.env.SESSION_SECRET;

if (sessionPassword && sessionPassword.length < 32) {
  // Surfaces as a server-side error before any login attempt.
  console.error('SESSION_SECRET must be at least 32 characters.');
}

export const sessionOptions: SessionOptions = {
  password: sessionPassword || 'dev-only-fallback-do-not-use-in-prod-32-chars',
  cookieName: 'escaleads_admin_session',
  cookieOptions: {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 8, // 8 hours
  },
};

export async function getAdminSession() {
  return getIronSession<AdminSession>(cookies(), sessionOptions);
}

export async function requireAdmin(): Promise<AdminSession> {
  const session = await getAdminSession();
  if (!session.isAdmin) {
    throw new Error('UNAUTHORIZED');
  }
  return session;
}
