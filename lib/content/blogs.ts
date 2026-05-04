import 'server-only';
import { createServerAnonClient, createServiceClient } from '@/lib/supabase/server';
import type { Blog } from '@/lib/supabase/types';

// Public reads (RLS-enforced, only published rows).
// All failures (missing env, network, RLS) degrade to an empty result so the build/render never crashes —
// pages just show an empty state until Supabase is configured.
export async function listPublishedBlogs(): Promise<Blog[]> {
  try {
    const supabase = createServerAnonClient();
    const { data, error } = await supabase
      .from('blogs')
      .select('*')
      .eq('published', true)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('listPublishedBlogs failed:', error.message);
      return [];
    }
    return (data ?? []) as Blog[];
  } catch (err) {
    console.error('listPublishedBlogs unavailable:', err instanceof Error ? err.message : err);
    return [];
  }
}

export async function getPublishedBlogBySlug(slug: string): Promise<Blog | null> {
  try {
    const supabase = createServerAnonClient();
    const { data, error } = await supabase
      .from('blogs')
      .select('*')
      .eq('slug', slug)
      .eq('published', true)
      .maybeSingle();

    if (error) {
      console.error('getPublishedBlogBySlug failed:', error.message);
      return null;
    }
    return (data as Blog | null) ?? null;
  } catch (err) {
    console.error('getPublishedBlogBySlug unavailable:', err instanceof Error ? err.message : err);
    return null;
  }
}

// Admin reads (service role — sees drafts too). These DO throw on misconfiguration so
// the admin UI surfaces the problem clearly instead of silently showing zero rows.
export async function adminListBlogs(): Promise<Blog[]> {
  const supabase = createServiceClient();
  const { data, error } = await supabase
    .from('blogs')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error(error.message);
  }
  return (data ?? []) as Blog[];
}

export async function adminGetBlog(id: string): Promise<Blog | null> {
  const supabase = createServiceClient();
  const { data, error } = await supabase
    .from('blogs')
    .select('*')
    .eq('id', id)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }
  return (data as Blog | null) ?? null;
}
