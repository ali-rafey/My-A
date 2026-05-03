-- =============================================================================
-- EscaLeads — Supabase Schema
-- Run this once in Supabase SQL Editor (or psql) on a fresh project.
-- Idempotent: safe to re-run.
-- =============================================================================

-- ---------- BLOGS ----------
create table if not exists public.blogs (
  id              uuid primary key default gen_random_uuid(),
  title           text not null,
  slug            text not null unique,
  content         text not null,
  cover_image     text,
  meta_description text,
  tags            text[] not null default '{}',
  published       boolean not null default false,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create index if not exists blogs_slug_idx       on public.blogs (slug);
create index if not exists blogs_created_at_idx on public.blogs (created_at desc);
create index if not exists blogs_published_idx  on public.blogs (published, created_at desc);

-- updated_at trigger
create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists blogs_touch_updated_at on public.blogs;
create trigger blogs_touch_updated_at
  before update on public.blogs
  for each row execute function public.touch_updated_at();

-- ---------- LEADS ----------
create table if not exists public.leads (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  email       text not null,
  phone       text,
  message     text not null,
  read        boolean not null default false,
  created_at  timestamptz not null default now()
);

create index if not exists leads_created_at_idx on public.leads (created_at desc);
create index if not exists leads_read_idx       on public.leads (read, created_at desc);

-- =============================================================================
-- ROW LEVEL SECURITY
-- The anon key (used in the browser) is heavily restricted:
--   blogs  → can only SELECT rows where published = true.
--   leads  → can only INSERT rows; cannot SELECT, UPDATE, or DELETE.
-- All admin operations use the SERVICE_ROLE key on the server, which bypasses RLS.
-- =============================================================================

alter table public.blogs enable row level security;
alter table public.leads enable row level security;

-- Drop existing policies so re-runs don't error.
drop policy if exists "Public can read published blogs" on public.blogs;
drop policy if exists "Public can insert leads"         on public.leads;
drop policy if exists "Public cannot read leads"        on public.leads;

-- Blogs: public read access, but only for published rows.
create policy "Public can read published blogs"
  on public.blogs
  for select
  to anon, authenticated
  using (published = true);

-- Leads: anyone can submit; nobody (with anon role) can read or modify.
create policy "Public can insert leads"
  on public.leads
  for insert
  to anon, authenticated
  with check (true);
