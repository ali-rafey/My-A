-- =============================================================================
-- EscaLeads — Projects (the /our-work portfolio) + media storage
-- Run this once in the Supabase SQL Editor. Idempotent: safe to re-run.
-- =============================================================================
-- Kept in its own file rather than folded into schema.sql, which the contributor
-- contract freezes. Once you are happy with it, move it into schema.sql yourself
-- so that file stays the single source of truth.
-- =============================================================================

-- ---------- PROJECTS ----------
create table if not exists public.projects (
  id           uuid primary key default gen_random_uuid(),
  title        text not null,
  slug         text not null unique,
  summary      text,                                  -- the write-up a card opens
  category     text,                                  -- the chip on the card
  image_url    text,                                  -- uploaded screenshot or photo
  tags         text[] not null default '{}',
  live_url     text,
  status_label text not null default 'Live',          -- the small line above the title
  sort_order   integer not null default 0,            -- lower sorts first
  published    boolean not null default false,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

create index if not exists projects_slug_idx      on public.projects (slug);
create index if not exists projects_order_idx     on public.projects (sort_order, created_at desc);
create index if not exists projects_published_idx on public.projects (published, sort_order, created_at desc);

-- Same trigger function schema.sql defines; created here too so this file can be
-- run on its own.
create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists projects_touch_updated_at on public.projects;
create trigger projects_touch_updated_at
  before update on public.projects
  for each row execute function public.touch_updated_at();

-- ---------- ROW LEVEL SECURITY ----------
-- Same shape as blogs: the anon key can read published rows and nothing else.
-- Every write goes through the service role, server-side, behind withAdminGuard.
alter table public.projects enable row level security;
alter table public.projects no force row level security;

grant select, insert, update, delete on public.projects to service_role;
grant select on public.projects to anon, authenticated;
grant usage  on schema public to anon, authenticated, service_role;

drop policy if exists "Public can read published projects" on public.projects;
drop policy if exists "Service role full access on projects" on public.projects;

create policy "Public can read published projects"
  on public.projects
  for select
  to anon, authenticated
  using (published = true);

-- Belt-and-suspenders, for the case where "force RLS" gets toggled on in the
-- dashboard and the service role stops bypassing.
create policy "Service role full access on projects"
  on public.projects
  for all
  to service_role
  using (true)
  with check (true);

-- ---------- MEDIA STORAGE ----------
-- One public bucket for admin-uploaded images (project screenshots, blog covers).
-- Public = anyone can READ a file by URL, which is what the website needs.
-- Writes are service-role only: the upload route is the sole way in.
insert into storage.buckets (id, name, public)
values ('media', 'media', true)
on conflict (id) do update set public = true;

drop policy if exists "Public can read media" on storage.objects;
create policy "Public can read media"
  on storage.objects
  for select
  to anon, authenticated
  using (bucket_id = 'media');

-- =============================================================================
-- PostgREST caches the schema. Without this the API keeps serving the old one
-- and the new table reads back as "relation does not exist".
-- =============================================================================
notify pgrst, 'reload schema';
