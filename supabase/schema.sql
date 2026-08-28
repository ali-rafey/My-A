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
  created_at  timestamptz not null default now(),
  ip_address  text,
  country     text,
  region      text,
  city        text
);

-- Idempotent column additions for tables created before geo tracking was added.
alter table public.leads add column if not exists ip_address text;
alter table public.leads add column if not exists country    text;
alter table public.leads add column if not exists region     text;
alter table public.leads add column if not exists city       text;

create index if not exists leads_created_at_idx on public.leads (created_at desc);
create index if not exists leads_read_idx       on public.leads (read, created_at desc);
create index if not exists leads_country_idx    on public.leads (country);

-- =============================================================================
-- ROW LEVEL SECURITY
-- The anon key (used in the browser) is heavily restricted:
--   blogs  → can only SELECT rows where published = true.
--   leads  → can only INSERT rows; cannot SELECT, UPDATE, or DELETE.
-- All admin operations use the SERVICE_ROLE key on the server, which bypasses RLS.
-- =============================================================================

alter table public.blogs enable row level security;
alter table public.leads enable row level security;

-- Service role MUST bypass RLS. If "force row level security" is on, even bypassrls roles get
-- filtered, which means the admin dashboard can SELECT some rows but UPDATE/DELETE silently match
-- 0 rows. Always-off-force is the only sane setting for these tables.
alter table public.blogs no force row level security;
alter table public.leads no force row level security;

-- Explicit table-level grants. RLS only filters which rows a role can touch — it does NOT grant
-- the underlying INSERT/SELECT/UPDATE/DELETE privilege. Supabase normally auto-grants these, but
-- a previous schema run, dashboard policy edit, or "Reset RLS" can drop them. Re-grant idempotently.
grant select, insert, update, delete on public.leads to service_role;
grant select, insert, update, delete on public.blogs to service_role;
grant insert on public.leads to anon, authenticated;
grant select on public.blogs to anon, authenticated;
grant usage  on schema public to anon, authenticated, service_role;

-- Drop existing policies so re-runs don't error.
drop policy if exists "Public can read published blogs" on public.blogs;
drop policy if exists "Public can insert leads"         on public.leads;
drop policy if exists "Public cannot read leads"        on public.leads;
drop policy if exists "Service role full access on leads" on public.leads;
drop policy if exists "Service role full access on blogs" on public.blogs;

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

-- Belt-and-suspenders policies for the service role. Strictly speaking, service_role has
-- BYPASSRLS so policies don't apply — but if force RLS ever gets re-enabled (Supabase Dashboard
-- → Authentication → Policies has a "Force RLS" toggle), these policies guarantee the admin
-- dashboard's UPDATE/DELETE keep working without silent zero-row matches.
create policy "Service role full access on leads"
  on public.leads
  for all
  to service_role
  using (true)
  with check (true);

create policy "Service role full access on blogs"
  on public.blogs
  for all
  to service_role
  using (true)
  with check (true);

-- =============================================================================
-- PROSPECT STATUS (outbound lead pipeline)
-- =============================================================================
-- The prospect RECORDS themselves live in data/prospects.csv, committed to the repo and
-- regenerated by research passes. Vercel's filesystem is read-only at runtime, so this table
-- holds ONLY the mutable working state, keyed by the CSV's stable `id` column. Joining at render
-- time keeps research data in version control (diffable, reviewable) while letting the admin UI
-- actually work the list.
--
-- prospect_id is TEXT, not uuid — it mirrors the human-readable slug in the CSV so a row survives
-- the CSV being regenerated, and so you can grep a status back to its source record by eye.

create table if not exists public.prospect_status (
  prospect_id       text primary key,
  status            text not null default 'new',
  notes             text,
  last_contacted_at timestamptz,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now(),
  constraint prospect_status_status_check check (
    status in ('new','researching','contacted','replied','call_booked','won','lost','not_a_fit')
  )
);

create index if not exists prospect_status_status_idx on public.prospect_status (status);
create index if not exists prospect_status_updated_idx on public.prospect_status (updated_at desc);

drop trigger if exists prospect_status_touch_updated_at on public.prospect_status;
create trigger prospect_status_touch_updated_at
  before update on public.prospect_status
  for each row execute function public.touch_updated_at();

-- RLS: this is admin-only working data. Unlike `leads`, anon gets NO access whatsoever — not even
-- insert. Only the service role (used exclusively server-side behind withAdminGuard) can touch it.
alter table public.prospect_status enable row level security;
alter table public.prospect_status no force row level security;

grant select, insert, update, delete on public.prospect_status to service_role;
revoke all on public.prospect_status from anon, authenticated;

drop policy if exists "Service role full access on prospect_status" on public.prospect_status;
create policy "Service role full access on prospect_status"
  on public.prospect_status
  for all
  to service_role
  using (true)
  with check (true);

-- =============================================================================
-- IMPORTANT: PostgREST (the API layer between your app and Postgres) caches the
-- schema. After ALTER TABLE / CREATE TABLE, the cache must be reloaded — otherwise
-- new columns return "column not found" errors even though they exist.
-- =============================================================================
notify pgrst, 'reload schema';
