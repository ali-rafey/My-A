import 'server-only';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

function assertEnv(value: string | undefined, name: string): string {
  if (!value) {
    throw new Error(
      `Missing ${name}. Add it to .env.local — see .env.local.example for required keys.`,
    );
  }
  return value;
}

// Server-side anon client (RLS-enforced). Use for public reads.
export function createServerAnonClient() {
  return createClient(assertEnv(supabaseUrl, 'NEXT_PUBLIC_SUPABASE_URL'), assertEnv(anonKey, 'NEXT_PUBLIC_SUPABASE_ANON_KEY'), {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

// Service-role client. Bypasses RLS — only use server-side for trusted admin paths.
export function createServiceClient() {
  return createClient(assertEnv(supabaseUrl, 'NEXT_PUBLIC_SUPABASE_URL'), assertEnv(serviceKey, 'SUPABASE_SERVICE_ROLE_KEY'), {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
