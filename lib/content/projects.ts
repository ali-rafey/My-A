import 'server-only';
import { createServerAnonClient, createServiceClient } from '@/lib/supabase/server';
import type { Project } from '@/lib/supabase/types';

// Portfolio reads for /our-work and the admin's Work manager.
//
// Same split as lib/content/blogs.ts and for the same reasons: the public read
// swallows its errors and returns an empty list so a build can complete before
// the table exists (run supabase/projects.sql to create it), while the admin
// reads throw so the dashboard can show what actually went wrong.
//
// Order is the admin's: sort_order first (lower sorts earlier), newest first
// within a tie.

export async function listPublishedProjects(): Promise<Project[]> {
  try {
    const supabase = createServerAnonClient();
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .eq('published', true)
      .order('sort_order', { ascending: true })
      .order('created_at', { ascending: false });

    if (error) {
      console.error('listPublishedProjects failed:', error.message);
      return [];
    }
    return (data ?? []) as Project[];
  } catch (err) {
    console.error('listPublishedProjects unavailable:', err instanceof Error ? err.message : err);
    return [];
  }
}

export async function adminListProjects(): Promise<Project[]> {
  const supabase = createServiceClient();
  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .order('sort_order', { ascending: true })
    .order('created_at', { ascending: false });

  if (error) throw new Error(error.message);
  return (data ?? []) as Project[];
}

export async function adminGetProject(id: string): Promise<Project | null> {
  const supabase = createServiceClient();
  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .eq('id', id)
    .maybeSingle();

  if (error) throw new Error(error.message);
  return (data as Project | null) ?? null;
}
