import 'server-only';
import { cookies } from 'next/headers';
import { getIronSession, type SessionOptions } from 'iron-session';
import { SESSION_COOKIE_NAME } from './cookie';

export { SESSION_COOKIE_NAME };

export type AdminSession = {
  isAdmin?: boolean;
  username?: string;
  loginAt?: number;
};

export class SessionConfigError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'SessionConfigError';
  }
}

// Build sessionOptions on demand (not at module load) so that missing/short SESSION_SECRET surfaces
// as a thrown SessionConfigError inside the request handler — where it can be caught and turned
// into a proper JSON 500 — instead of crashing the whole serverless function during cold start.
export function getSessionOptions(): SessionOptions {
  const password = process.env.SESSION_SECRET;
  if (!password) {
    throw new SessionConfigError(
      'SESSION_SECRET is not set. Add it as an Environment Variable in Vercel → Project Settings.',
    );
  }
  if (password.length < 32) {
    throw new SessionConfigError(
      `SESSION_SECRET must be at least 32 characters (got ${password.length}). Generate with: openssl rand -base64 32`,
    );
  }
  return {
    password,
    cookieName: SESSION_COOKIE_NAME,
    cookieOptions: {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 8, // 8 hours
    },
  };
}

export async function getAdminSession() {
  return getIronSession<AdminSession>(cookies(), getSessionOptions());
}

export async function requireAdmin(): Promise<AdminSession> {
  const session = await getAdminSession();
  if (!session.isAdmin) {
    throw new Error('UNAUTHORIZED');
  }
  return session;
}
