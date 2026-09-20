# EscaLeads — Architecture Reference

A complete, session-to-session reference for the EscaLeads codebase. Pair this with `CLAUDE.md`, which contains the contributor contract (rules, frozen files, refusal cases). This document describes **what exists and how it fits together**; `CLAUDE.md` describes **what you are and aren't allowed to do**.

---

## 1. Project overview

**EscaLeads** is the production marketing site for a digital agency, deployed to Vercel at `escaleadsagency.vercel.app` (canonical) with `escaleads-nine.vercel.app` 307-redirecting to it. A single Next.js 14 App Router project combines:

- A **scroll-SPA homepage** at `/` that stitches six sections together under one URL (Home, Services, How It Works, Blogs preview, Our Work, Contact). The navbar smooth-scrolls between section `id`s.
- A **routed blog** at `/blogs` and `/blogs/[slug]`, server-rendered with ISR.
- A **hidden admin portal** at `/escaleadsadmin@44334` (the `@` is a literal path segment, not a parallel-route marker) for CMS and lead management.
- A **Supabase Postgres backend** with Row-Level Security (RLS) for two tables: `blogs` and `leads`.
- **Server-side lead capture** with IP + geolocation enrichment (Vercel edge headers, optionally upgraded by IPinfo).
- **Google Analytics 4** (measurement id `G-1K5C057XHQ`) on every public route, with manual SPA pageview tracking.

The site is live with real visitor traffic and real lead data. Every change behaves as a hot-fix on a production system.

---

## 2. Tech stack

All versions are pinned by `package.json`; do not upgrade without explicit instruction.

| Concern | Choice | Version / detail |
|---|---|---|
| Framework | Next.js | `^14.2.18`, App Router only |
| UI runtime | React | `^18.3.1` |
| Language | TypeScript | `^5.6.3`, strict mode |
| Database | Supabase Postgres + PostgREST | project ref `zhuawqmwdniersuahwcj` |
| Supabase JS | `@supabase/supabase-js` | `^2.46.1` |
| Supabase SSR | `@supabase/ssr` | `^0.5.2` (installed; not actively imported — server clients use the plain JS SDK) |
| Admin sessions | `iron-session` | `^8.0.4`, HMAC-signed HTTP-only cookie |
| HTML sanitization | `isomorphic-dompurify` | `^2.18.0`, **only** imported from `lib/sanitize-html.ts` |
| Styling | CSS Modules + 3 globals | no Tailwind, no styled-components, no CSS-in-JS |
| Fonts | `next/font` Inter | preload + `display: swap`, exposed as `--font-inter` CSS var |
| Hosting | Vercel | edge headers used for IP + geo |
| Analytics | GA4 (`G-1K5C057XHQ`) | inline `<script>` in `<head>` + client tracker |
| Lint | `eslint-config-next` | extends `next/core-web-vitals` |
| Typecheck | `tsc --noEmit` | `npm run typecheck` |
| Build | `next build` | `npm run build` |

NPM scripts in `package.json`:
- `dev` — `next dev`
- `build` — `next build`
- `start` — `next start`
- `lint` — `next lint`
- `typecheck` — `tsc --noEmit`

`tsconfig.json` paths: `@/*` → repo root (so `@/lib/...`, `@/components/...`, etc).

---

## 3. Folder structure

```
.
├── app/                              Next.js App Router
│   ├── layout.tsx                    root shell — Inter font, GA4 bootstrap (SSR <head>), JSON-LD
│   ├── page.tsx                      homepage — stacks 6 sections, revalidate 3600
│   ├── error.tsx / not-found.tsx / loading.tsx   top-level status pages
│   ├── status.module.css             shared styles for error/404/loading
│   ├── sitemap.ts                    /sitemap.xml — static entries + published blog slugs
│   ├── robots.ts                     /robots.txt — disallows admin + /api
│   ├── blogs/
│   │   ├── page.tsx                  /blogs — ISR 60s
│   │   ├── loading.tsx               skeleton shimmer
│   │   ├── blogs.module.css          shared by list + detail
│   │   └── [slug]/
│   │       ├── page.tsx              /blogs/[slug] — SSG + ISR, Article + BreadcrumbList JSON-LD
│   │       ├── not-found.tsx
│   │       └── loading.tsx
│   ├── api/                          server route handlers
│   │   ├── leads/route.ts            public POST — rate-limited, sanitized, schema-tolerant insert
│   │   └── admin/
│   │       ├── login/route.ts        iron-session login, timing-safe compare
│   │       ├── logout/route.ts       destroys the session cookie
│   │       ├── blogs/
│   │       │   ├── route.ts          GET (list) + POST (create) via withAdminGuard
│   │       │   └── [id]/route.ts     GET / PUT / DELETE per blog
│   │       ├── leads/
│   │       │   ├── route.ts          GET list
│   │       │   ├── [id]/route.ts     PATCH (mark read) + DELETE
│   │       │   └── export/route.ts   GET CSV download
│   │       └── diagnostics/route.ts  end-to-end self-test
│   └── escaleadsadmin@44334/         hidden admin (folder name is literal)
│       ├── layout.tsx                minimal — does NOT render the public Navbar
│       ├── page.tsx                  login OR dashboard (session-gated)
│       ├── LoginForm.tsx             client form posting /api/admin/login
│       ├── AdminTopbar.tsx           admin nav with logout
│       ├── admin.module.css          ALL admin styles (one big module)
│       ├── error.tsx / loading.tsx
│       ├── blogs/
│       │   ├── page.tsx              list with table + delete
│       │   ├── DeleteBlogButton.tsx
│       │   ├── BlogEditor.tsx        shared editor for new + edit, with live preview
│       │   ├── new/page.tsx
│       │   └── [id]/edit/page.tsx
│       ├── leads/
│       │   ├── page.tsx              card list with stats
│       │   ├── LeadRow.tsx           per-lead card with PATCH + DELETE
│       │   └── ExportButton.tsx      CSV download trigger
│       └── diagnostics/
│           ├── page.tsx
│           └── DiagnosticsRunner.tsx run + render results table
│
├── components/                       cross-route components
│   ├── navbar/
│   │   ├── Navbar.tsx                public navbar — scroll-spy + mobile drawer, bails on admin
│   │   └── Navbar.module.css
│   └── analytics/
│       └── GoogleAnalytics.tsx       client tracker — fires gtag config on every route change
│
├── sections/                         homepage section components
│   ├── home/
│   │   ├── Home.tsx                  server component (hero copy + panel)
│   │   ├── HeroActions.tsx           client component — the two CTA buttons
│   │   └── Home.module.css
│   ├── services/                     Services.tsx + .module.css   (static data from lib/content/static.ts)
│   ├── how-it-works/                 HowItWorks.tsx + .module.css (static data from lib/content/static.ts)
│   ├── blogs-preview/                BlogsPreview.tsx + .module.css  (async server — reads Supabase)
│   ├── our-work/                     OurWork.tsx + .module.css    (static data from lib/content/static.ts)
│   └── contact/                      Contact.tsx + .module.css    (client — posts /api/leads)
│
├── lib/                              non-React modules
│   ├── supabase/
│   │   ├── server.ts                 createServerAnonClient + createServiceClient, both no-store
│   │   └── types.ts                  Blog + Lead + BlogInput
│   ├── auth/
│   │   ├── session.ts                iron-session helpers (server-only); SessionConfigError
│   │   └── cookie.ts                 SESSION_COOKIE_NAME constant only — Edge-safe
│   ├── security/
│   │   └── csrf.ts                   assertSameOrigin — Origin/Referer check on state-changing reqs
│   ├── content/
│   │   ├── static.ts                 hardcoded services / workProjects / howItWorksSteps
│   │   └── blogs.ts                  public reads (error-tolerant) + admin reads (throw)
│   ├── admin-handler.ts              withAdminGuard — CSRF → rate → auth → handler → catch
│   ├── client-info.ts                IP + geo from x-vercel-ip-* + IPinfo upgrade
│   ├── format.ts                     formatDate / formatDateTime (Intl)
│   ├── rate-limit.ts                 in-memory token-bucket
│   ├── sanitize.ts                   plain-text sanitizer (NO DOMPurify import)
│   ├── sanitize-html.ts              rich-HTML sanitizer (lazy DOMPurify)
│   └── text-to-html.ts               plain-text → <p>/<br>/<a> for blog editor
│
├── styles/
│   ├── index.css                     @imports the three below
│   ├── reset.css                     CSS reset
│   ├── tokens.css                    design tokens (colors, type scale, spacing, radius, shadows)
│   └── global.css                    .section, .container, .eyebrow, .sectionTitle, .sectionLead, .spinner
│
├── supabase/
│   └── schema.sql                    single source of truth for DB schema, grants, RLS, policies
│
├── middleware.ts                     admin URL gate (Edge runtime, cookie-presence only)
├── next.config.mjs                   security headers (CSP/HSTS/etc.), image opts, server actions size
├── next-env.d.ts                     Next.js ambient types
├── tsconfig.json                     strict, @/* paths
├── package.json / package-lock.json
├── .eslintrc.json                    extends next/core-web-vitals
├── .gitignore
├── CLAUDE.md / AGENTS.md / GEMINI.md / .cursorrules
│                                     identical contributor contracts for each AI assistant
├── client/                           LEGACY (Vite prototype) — do not import, do not edit
└── server/                           LEGACY (FastAPI prototype) — do not import, do not edit
```

### Per-folder purpose

- **`app/`** — every URL is a folder. App Router only. Server components by default; `'use client'` is opt-in.
- **`components/`** — reusable across multiple routes (navbar, analytics). Co-located `.module.css`.
- **`sections/`** — single-use components for the homepage. Each section gets its own folder so its CSS module stays close to its TSX.
- **`lib/`** — pure modules, no JSX. Anything that is "server-only" carries `import 'server-only'` at the top so it cannot be bundled to the client.
- **`styles/`** — the three globals. `tokens.css` is referenced by virtually every CSS Module — renaming a token is a site-wide breakage.
- **`supabase/`** — schema. Idempotent — re-runnable.
- **`client/` and `server/`** — legacy Vite/FastAPI prototype, gitignored builds, kept for reference only. Excluded from `tsconfig` and ESLint.

---

## 4. Routing

### Public routes (rendered)

| Path | Rendering | File | Notes |
|---|---|---|---|
| `/` | SSG-ish, `revalidate = 3600` | `app/page.tsx` | Six sections in scroll order, share-a-URL SPA UX |
| `/blogs` | ISR 60s | `app/blogs/page.tsx` | Lists all published blogs |
| `/blogs/[slug]` | SSG via `generateStaticParams` + ISR 60s | `app/blogs/[slug]/page.tsx` | Article + BreadcrumbList JSON-LD, OG/Twitter tags |
| `/sitemap.xml` | Generated | `app/sitemap.ts` | Static entries + dynamic published slugs |
| `/robots.txt` | Generated | `app/robots.ts` | Disallows admin + `/api/` |
| `/escaleadsadmin@44334` | `force-dynamic` | `app/escaleadsadmin@44334/page.tsx` | Login form when no session, dashboard when authenticated |
| `/escaleadsadmin@44334/blogs` | `force-dynamic` | `app/escaleadsadmin@44334/blogs/page.tsx` | Table of all blogs (drafts visible) |
| `/escaleadsadmin@44334/blogs/new` | `force-dynamic` | `.../blogs/new/page.tsx` | BlogEditor in create mode |
| `/escaleadsadmin@44334/blogs/[id]/edit` | `force-dynamic` | `.../blogs/[id]/edit/page.tsx` | BlogEditor in edit mode |
| `/escaleadsadmin@44334/leads` | `force-dynamic` | `.../leads/page.tsx` | Card list + summary stats + CSV export |
| `/escaleadsadmin@44334/diagnostics` | `force-dynamic` | `.../diagnostics/page.tsx` | Run-button + results table |

### API routes (Node runtime, force-dynamic)

| Method + Path | File | Guards | Purpose |
|---|---|---|---|
| `POST /api/leads` | `app/api/leads/route.ts` | CSRF, rate-limit (5/min/IP) | Public contact form sink. Validates + sanitizes, captures IP/geo, inserts via anon client. Schema-tolerant: retries without geo cols on PGRST204/42703. |
| `POST /api/admin/login` | `app/api/admin/login/route.ts` | CSRF, rate-limit (5/min/IP) | Compares username+password (timing-safe) against env vars, writes iron-session cookie (8h). |
| `POST /api/admin/logout` | `app/api/admin/logout/route.ts` | CSRF | Destroys the session cookie. |
| `GET /api/admin/blogs` | `app/api/admin/blogs/route.ts` | `withAdminGuard({csrf:false})` | Service-role list of all blogs (drafts included). |
| `POST /api/admin/blogs` | same | `withAdminGuard` | Create blog. Plain text → `textToHtml` → `sanitizeRichHtml`. Returns 409 on duplicate slug. |
| `GET /api/admin/blogs/:id` | `.../blogs/[id]/route.ts` | `withAdminGuard({csrf:false})` | Fetch one. |
| `PUT /api/admin/blogs/:id` | same | `withAdminGuard` | Update. Revalidates `/`, `/blogs`, `/blogs/<slug>` via `safeRevalidate`. No `.single()` — surfaces RLS-zero-row as 404. |
| `DELETE /api/admin/blogs/:id` | same | `withAdminGuard` | Pre-fetches slug, deletes, revalidates the same paths. No `.single()`. |
| `GET /api/admin/leads` | `app/api/admin/leads/route.ts` | `withAdminGuard({csrf:false})` | Service-role list of all leads, newest first. |
| `PATCH /api/admin/leads/:id` | `.../leads/[id]/route.ts` | `withAdminGuard` | Toggle `read` boolean. No `.single()`. |
| `DELETE /api/admin/leads/:id` | same | `withAdminGuard` | Delete a lead. No `.single()`. |
| `GET /api/admin/leads/export` | `.../leads/export/route.ts` | `withAdminGuard({csrf:false})` | CSV download with all columns. |
| `GET /api/admin/diagnostics` | `.../diagnostics/route.ts` | `withAdminGuard({csrf:false})` | 10-step self-test. Inserts via anon, reads/updates/deletes via service role, compares head-count vs full-select, prints visible rows. |

### Middleware (`middleware.ts`)

Runs in the **Edge runtime**. Matches `/escaleadsadmin@44334` and its percent-encoded twin `/escaleadsadmin%4044334` (browsers vary on encoding `@`):

1. Sets `X-Robots-Tag: noindex, nofollow, noarchive` on every admin response.
2. For non-root admin paths, redirects to the admin root with `?redirect=...` if the iron-session cookie is **absent**. Cookie presence only — full HMAC validation happens server-side via `getAdminSession()`. This keeps iron-session out of the Edge bundle.

---

## 5. Major components and their purpose

### `app/layout.tsx`
Root HTML shell. Loads Inter via `next/font`, renders public Navbar above `<main>`, renders the client `<GoogleAnalytics />` after children. **GA4 bootstrap** lives as plain `<script>` tags directly in `<head>` (not `next/script`) so the SSR HTML contains them — required for Google Search Console's GA-based ownership verification, which scans raw HTML without executing JS. `send_page_view: false` is set in the inline bootstrap; the client `Tracker` fires the first and all subsequent pageviews. Two JSON-LD blobs (Organization + WebSite) are also in `<head>` for SEO.

### `components/navbar/Navbar.tsx`
Client component. Single source for the public navbar. Behaviour:
- Returns `null` when `pathname` starts with either admin prefix (so admin pages have no public chrome).
- Tracks `scrolled` (toggles a class after 60px of scroll).
- On `/`, sets up an `IntersectionObserver` (thresholds 0.45, rootMargin `-20% 0px -45% 0px`) to highlight the active nav item as the user scrolls.
- Section links smooth-scroll on `/`; when on any other path, navigates to `/#<id>`.
- Blogs link is a real `<Link>` to `/blogs` (the only `href`-driven nav item).
- Hamburger toggles a mobile drawer; `body.menuOpen` class freezes scroll. Drawer closes on resize >768px and on route change.

### `components/analytics/GoogleAnalytics.tsx`
Client-only tracker. The gtag.js loader and init are in `app/layout.tsx`'s `<head>`. This component is just a `useEffect` keyed on `pathname` + `searchParams` (via `usePathname()` / `useSearchParams()`, wrapped in `<Suspense>`) that calls `gtag('config', id, { page_path })` on every route change. Skips admin paths.

### Section components (`sections/...`)
Each homepage section is its own folder with `<Name>.tsx` + `<Name>.module.css`. All are server components except:
- `sections/home/HeroActions.tsx` — extracted client component for the two CTA buttons, so `Home.tsx` stays a server component.
- `sections/contact/Contact.tsx` — `'use client'` because it owns form state + submission.

`BlogsPreview` is an `async` server component that calls `listPublishedBlogs()` directly and renders the first three cards plus a "View all posts →" link.

### Admin pages
- `app/escaleadsadmin@44334/page.tsx` — session-gated. Without a session it returns `<LoginForm />`. With one, it renders four stat cards (total blogs, drafts, total leads, unread) computed with four parallel `count: 'exact', head: true` queries against the service-role client, plus quick links.
- `LoginForm.tsx` — client form posting `/api/admin/login`, reads `?redirect=` from `useSearchParams()` to bounce back to the originally requested page.
- `AdminTopbar.tsx` — client nav with Dashboard / Blogs / Leads / Diagnostics + a Logout button calling `/api/admin/logout`.
- `blogs/page.tsx` — table of all blogs (service role, so drafts are visible). Each row has Edit / View (if published) / Delete.
- `blogs/BlogEditor.tsx` — shared by new + edit. Plain-text textarea (admins do NOT need to write HTML — `textToHtml` wraps paragraphs and auto-links URLs on save; live preview uses the same function). Auto-slugify from title until the slug is manually touched.
- `leads/page.tsx` — card list grouped under a 3-card summary (total / unread / read). Each card is a `<LeadRow>` showing name, email, phone, location (flag emoji from `country` code), IP, message, and toggle/delete actions.
- `diagnostics/page.tsx` — single button that runs `GET /api/admin/diagnostics` and renders a pass/fail table.

### Library modules
- **`lib/supabase/server.ts`** — two factories: `createServerAnonClient` (RLS-enforced, public reads) and `createServiceClient` (bypasses RLS, admin-only). Both pass a `global.fetch` that forces `cache: 'no-store'` on every Supabase HTTP call, defeating Next.js's data cache wrapper. This is what prevents the dashboard-vs-leads count mismatch.
- **`lib/supabase/types.ts`** — `Blog`, `Lead`, `BlogInput`.
- **`lib/auth/session.ts`** — `getAdminSession()` returns the iron-session typed as `{ isAdmin?, username?, loginAt? }`. `requireAdmin()` throws `'UNAUTHORIZED'` if not. `SessionConfigError` is thrown when `SESSION_SECRET` is missing or <32 chars; the call sites catch it and turn it into a JSON 500.
- **`lib/auth/cookie.ts`** — exports only `SESSION_COOKIE_NAME = 'escaleads_admin_session'`. No `iron-session` import → safe for middleware to use in Edge.
- **`lib/security/csrf.ts`** — `assertSameOrigin(req)` returns `{ok:true}` for GET/HEAD/OPTIONS and otherwise verifies that Origin or Referer matches the host header.
- **`lib/admin-handler.ts`** — `withAdminGuard(handler, opts)` wraps any handler with CSRF → rate limit → `requireAdmin` → catch. Always returns JSON, never an HTML 500. Order matters: CSRF first (cheapest), rate next, auth last (most expensive). `opts.csrf` / `opts.rateLimit` can disable each (e.g. GETs disable CSRF).
- **`lib/rate-limit.ts`** — in-memory token bucket keyed by IP. Default 10/min, configurable per-call. Opportunistic GC at 5000 entries.
- **`lib/sanitize.ts`** — `sanitizeText(value, maxLength)`, `isValidEmail(value)`, `slugify(value)`. **No DOMPurify import.** Imported by hot paths (`/api/admin/login`, `/api/leads`).
- **`lib/sanitize-html.ts`** — `sanitizeRichHtml(value)`. Imports `isomorphic-dompurify` (heavy — pulls jsdom). Only imported by `/api/admin/blogs/*` and `app/blogs/[slug]/page.tsx`. Allows `p, br, strong, em, u, s, blockquote, code, pre, ul, ol, li, a, img, h1-h6, hr, figure, figcaption` and a tight attribute list.
- **`lib/text-to-html.ts`** — Plain text → safe HTML. Detects already-authored HTML (block-level start tags) and passes it through unchanged. For plain text: HTML-escapes, splits on blank lines into `<p>`s, single newlines become `<br>`, and `https?://...` URLs become `<a target="_blank" rel="noopener noreferrer">`. Output is always run through `sanitizeRichHtml` next.
- **`lib/client-info.ts`** — `getClientInfo(headers)` returns `{ip, country, region, city}`. Reads `x-real-ip` → falls back to first IP in `x-forwarded-for` → null. Geo from `x-vercel-ip-country` / `x-vercel-ip-country-region` / `x-vercel-ip-city` (URL-decoded). When `IPINFO_TOKEN` env is set, upgrades accuracy via `ipinfo.io` (1.5s timeout, 1024-entry TTL cache, skips private IPs, never blocks the lead save). `formatLocation(...)` joins city/region/country with commas, omitting nulls.
- **`lib/content/blogs.ts`** — Four helpers: `listPublishedBlogs()` and `getPublishedBlogBySlug(slug)` swallow errors and return `[]` / `null` (so builds succeed before Supabase is configured); `adminListBlogs()` and `adminGetBlog(id)` throw on error so the admin UI surfaces problems.
- **`lib/content/static.ts`** — Hardcoded arrays for the homepage Services, Our Work, and How It Works sections.
- **`lib/format.ts`** — `formatDate` and `formatDateTime` via `Intl.DateTimeFormat` ('en-US').

---

## 6. Database schema

Defined in `supabase/schema.sql` (idempotent). Two tables in the `public` schema.

### `public.blogs`

| Column | Type | Default / notes |
|---|---|---|
| `id` | `uuid` PK | `gen_random_uuid()` |
| `title` | `text` not null | |
| `slug` | `text` not null **unique** | |
| `content` | `text` not null | sanitized rich HTML |
| `cover_image` | `text` nullable | URL |
| `meta_description` | `text` nullable | up to 300 chars (enforced client-side) |
| `tags` | `text[]` not null | default `'{}'`, max 12 (enforced in API) |
| `published` | `boolean` not null | default `false` |
| `created_at` | `timestamptz` not null | `now()` |
| `updated_at` | `timestamptz` not null | `now()`, auto-touched by trigger |

Indexes: `blogs_slug_idx`, `blogs_created_at_idx`, `blogs_published_idx (published, created_at desc)`.
Trigger: `blogs_touch_updated_at` calls `touch_updated_at()` before every UPDATE.

### `public.leads`

| Column | Type | Default / notes |
|---|---|---|
| `id` | `uuid` PK | `gen_random_uuid()` |
| `name` | `text` not null | |
| `email` | `text` not null | |
| `phone` | `text` nullable | |
| `message` | `text` not null | |
| `read` | `boolean` not null | default `false` |
| `created_at` | `timestamptz` not null | `now()` |
| `ip_address` | `text` nullable | added later via `alter table add column if not exists` |
| `country` | `text` nullable | added later |
| `region` | `text` nullable | added later |
| `city` | `text` nullable | added later |

Indexes: `leads_created_at_idx`, `leads_read_idx (read, created_at desc)`, `leads_country_idx`.

### RLS and grants

Both tables have RLS enabled and **`no force row level security`** so the service role's BYPASSRLS works.

Policies:
- `blogs` — `Public can read published blogs` (`select` for `anon, authenticated` where `published = true`).
- `leads` — `Public can insert leads` (`insert` for `anon, authenticated` with no read).
- Belt-and-suspenders: `Service role full access on leads` + `Service role full access on blogs` (`for all to service_role using (true) with check (true)`) — protects against a dashboard toggle re-enabling Force RLS.

Grants:
- `service_role`: full `select, insert, update, delete` on both tables.
- `anon, authenticated`: `insert` on `leads`, `select` on `blogs`, `usage` on schema.

After any `ALTER TABLE`, `notify pgrst, 'reload schema';` is run at the bottom of `schema.sql` to refresh PostgREST's schema cache (otherwise "column not found" errors persist).

---

## 7. API endpoints — detailed contracts

### `POST /api/leads`

**Public.** Request body JSON: `{ name, email, phone?, message }`.

Pipeline:
1. `assertSameOrigin(req)` — 403 on cross-origin.
2. `rateLimit(ip, 5/min)` — 429 with `Retry-After` header.
3. Parse + `sanitizeText` each field; validate required + `isValidEmail`.
4. `getClientInfo(headers)` — adds `ip_address, country, region, city`. Network call to IPinfo is best-effort; timeouts fall back to Vercel headers.
5. Anon-client insert with all columns. On `42703` / `PGRST204` (missing geo cols), retries with only the base columns and logs a hint to run `supabase/schema.sql`.

Response codes: `201` on success, `400` on bad input, `403` CSRF, `429` rate, `500` insert error.

### `POST /api/admin/login`

Body `{ username, password }`. Timing-safe compare against `ADMIN_USERNAME` / `ADMIN_PASSWORD` env. On success, sets iron-session cookie (`isAdmin: true, username, loginAt`) with 8h `maxAge`. Returns `401` on bad creds, `429` on >5 attempts/min/IP, `500` with an actionable message if env vars or `SESSION_SECRET` are unset/short.

### `POST /api/admin/logout`

CSRF-checked, destroys the session. Always JSON.

### Admin CRUD (under `withAdminGuard`)

Every admin route returns JSON with shape `{ error }` on failure (status code carries semantics) or domain-shaped payloads on success (`{ blog }`, `{ blogs }`, `{ lead }`, `{ leads }`, `{ ok: true, deleted: N }`).

**Important PATCH/DELETE invariant:** `app/api/admin/leads/[id]/route.ts` and `app/api/admin/blogs/[id]/route.ts` use `.update(...).select()` / `.delete().select()` **without `.single()`** so that a zero-row match produces a clear `404` with an actionable error message (RLS misconfiguration is the usual cause). With `.single()`, PostgREST returns the opaque "Cannot coerce the result to a single JSON object".

**Revalidation:** Blog PUT/DELETE call `safeRevalidate('/blogs')`, `safeRevalidate('/blogs/<slug>')`, and `safeRevalidate('/')`. `safeRevalidate` swallows errors because the write has already succeeded; a `revalidatePath` failure (Next 14.2.x has a quirk where deleted slugs throw) shouldn't 500 the user's action.

### `GET /api/admin/diagnostics`

Runs a 10-step self-test using the same code paths the real routes take:
1. Env vars present?
2. `leads` readable via service role (HEAD count)
3. `blogs` readable via service role (HEAD count)
4. `leads` has all required columns (selectable)
5. **Anon INSERT** into `leads` (the `/api/leads` happy path)
6. Service-role SELECT of the just-inserted row
7. Service-role UPDATE of it
8. Service-role DELETE of it
9. HEAD count == SELECT row count for `leads` (the dashboard-vs-page parity check)
10. Print visible rows for visual comparison.

Errors include specific SQL hints (e.g. `grant insert on public.leads to anon, authenticated; notify pgrst, 'reload schema';`).

---

## 8. Auth and security

- **Hidden URL** `/escaleadsadmin@44334`. The `@` is a literal segment, not a parallel-route marker (which would require a leading `@`). Middleware matches both encoded and decoded forms.
- **Iron-session** HMAC-signed HTTP-only cookie. 8h max age. `secure` in production, `sameSite: 'lax'`. `SESSION_SECRET` must be ≥32 chars (validated lazily at request time so cold start doesn't crash).
- **Split sessions vs cookie module** — `lib/auth/cookie.ts` exports only the cookie name (Edge-safe, no Node `crypto`). `lib/auth/session.ts` does iron-session work and is server-only. Middleware imports the former; route handlers import the latter.
- **Two-stage auth check** — Edge middleware redirects to the admin root if the session cookie is absent. Route handlers / pages then validate the HMAC via `getAdminSession()` / `requireAdmin()`. A forged-but-present cookie passes the middleware gate and dies at the route handler.
- **CSRF defense in depth** — `SameSite=Lax` blocks third-party cookie sends; `assertSameOrigin` adds Origin/Referer matching on all state-changing requests.
- **Timing-safe credential compare** in `/api/admin/login` (custom xor-OR over equal-length strings; bails early on length mismatch but the secrets are constant-length in practice).
- **Rate limiting** — `lib/rate-limit.ts` in-memory token bucket. `/api/admin/login` and `/api/leads` use 5/min/IP; default admin write is 60/min/IP. Per-instance, not global — fine for current Vercel scale.
- **CSP and headers** — `next.config.mjs` ships strict CSP (only googletagmanager + supabase + GA + g.doubleclick whitelisted), `frame-ancestors 'none'`, `Strict-Transport-Security` 2-year preload, `Referrer-Policy: strict-origin-when-cross-origin`, `Permissions-Policy` denying camera/mic/geolocation/interest-cohort, `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`.
- **`X-Robots-Tag: noindex`** added to every admin response by middleware. `robots.txt` also disallows `/escaleadsadmin@44334` and `/api/`.
- **`poweredByHeader: false`** in `next.config.mjs` so the framework signature doesn't leak.

---

## 9. Important patterns and conventions

These are the load-bearing patterns that explain "why is this code shaped that way?":

### 9.1 Plain-text vs rich-HTML sanitizer split
`lib/sanitize.ts` is dependency-free; `lib/sanitize-html.ts` lazily imports `isomorphic-dompurify`. **Reason:** DOMPurify pulls jsdom at module-init time. If it were imported anywhere on a hot path (e.g. `/api/admin/login`), Vercel cold starts crashed. Keep them split. Routes that need rich-HTML sanitization (`/api/admin/blogs/*`, `app/blogs/[slug]/page.tsx`) import the heavy one; everyone else imports the cheap one.

### 9.2 Edge-safe cookie module separate from session
See §8. `cookie.ts` exists only so middleware can know the cookie name without bundling iron-session.

### 9.3 Single admin boundary
`withAdminGuard` is the only auth checkpoint for admin API routes. Order: CSRF → rate-limit → `requireAdmin` → handler → catch. Always JSON output. Do not bypass this with ad-hoc auth in a handler.

### 9.4 No `.single()` on admin PATCH/DELETE
`.single()` makes zero-row matches throw PGRST-something opaque. Without it, a clear `404` is returned with an actionable error message (usually pointing at missing RLS service-role policy).

### 9.5 `cache: 'no-store'` everywhere on the server Supabase client
Without it, Next.js's data-cache wrapper around `fetch` can serve stale snapshots — that produced the original "dashboard says 7, leads page says 4" bug.

### 9.6 `force-dynamic` on every admin page
Admin pages set `export const dynamic = 'force-dynamic'` so they always re-render from live DB state. This is required **in addition** to the `no-store` fetch — neither alone is sufficient to defeat all caching layers.

### 9.7 Schema-tolerant lead insert
`/api/leads` tries the full insert first; on `42703` / `PGRST204` (missing geo column), it retries without those columns. This lets the site work even before the operator runs the latest `supabase/schema.sql`.

### 9.8 Errors degrade gracefully on public reads, loudly on admin reads
- `listPublishedBlogs` / `getPublishedBlogBySlug` swallow errors → page renders empty state.
- `adminListBlogs` / `adminGetBlog` throw → admin UI shows the failure.
This is so a fresh Vercel deploy with no env vars can still build successfully.

### 9.9 `safeRevalidate`
`revalidatePath` failures don't bubble to 500 the user's write. The write already succeeded; ISR will refresh within 60s anyway.

### 9.10 Server-first components
Homepage sections are server components except where interaction is needed (Contact form, HeroActions buttons). Don't promote whole sections to client just because one piece needs `useState`.

### 9.11 Admin layout intentionally minimal
`app/escaleadsadmin@44334/layout.tsx` does NOT render the public Navbar (the Navbar itself also returns null on admin paths — belt-and-braces). Admin uses its own `AdminTopbar`.

### 9.12 IP and geo are server-only
`lib/client-info.ts` is `import 'server-only'`. Values are stored on the lead row and shown only in the authenticated admin dashboard. No client-side disclosure by product decision.

### 9.13 GA4 SSR-rendered into `<head>`
Search Console verification reads raw HTML without executing JS, so the gtag loader and init must appear in the SSR response. `app/layout.tsx` renders them as plain `<script>` tags (not `next/script`). `send_page_view: false` keeps gtag.js from auto-firing; the client `GoogleAnalytics` component fires one config on every App Router route change (initial mount included).

### 9.14 Section IDs are the navigation contract
`#home`, `#services`, `#how-it-works`, `#blogs`, `#our-work`, `#contact` are wired into both the Navbar and the section components. Renaming an `id` breaks scroll nav.

### 9.15 The Blogs preview on the homepage and `/blogs` listing coexist intentionally
The `#blogs` section on `/` is a 3-card preview linking to individual posts. `/blogs` is the full routed listing for SEO. Not a refactor candidate.

### 9.16 CSS Modules + 3 globals only
Each component has a co-located `.module.css`. The three globals (`reset.css`, `tokens.css`, `global.css`) provide the reset, the design tokens (every CSS Module references `var(--color-...)`, etc.), and a few utility classes (`.section`, `.container`, `.eyebrow`, `.sectionTitle`, `.sectionLead`, `.spinner`). No Tailwind, no CSS-in-JS.

### 9.17 Imports are absolute via `@/*`
Configured in `tsconfig.json` (`baseUrl: "."`, `paths: { "@/*": ["./*"] }`). Use `@/lib/...` etc., never `../../../lib/...`.

### 9.18 Comments explain *why*, not *what*
The codebase is dense with comments at the spots that look weird but exist for a reason (no-store fetch, schema-tolerant insert, no-single() on PATCH/DELETE, etc.). Match this when adding new non-obvious code; otherwise skip comments.

### 9.19 Legacy `client/` and `server/` folders
Vite + FastAPI prototype. Build artifacts gitignored. Excluded from tsconfig and ESLint. Kept for reference, slated for deletion when the operator says so. Do not import from them.

### 9.20 Identical contracts across AI assistant files
`CLAUDE.md`, `AGENTS.md`, `GEMINI.md`, and `.cursorrules` contain the same rules verbatim. When one changes, change them all.

---

## 10. Environment variables

Required in `.env.local` (and in Vercel Project Settings):

| Var | Purpose |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Anon (RLS-enforced) key, used server-side too |
| `SUPABASE_SERVICE_ROLE_KEY` | Service-role key, bypasses RLS — server-only |
| `SESSION_SECRET` | iron-session HMAC key, ≥32 chars (`openssl rand -base64 32`) |
| `ADMIN_USERNAME` | Login username |
| `ADMIN_PASSWORD` | Login password |
| `NEXT_PUBLIC_SITE_URL` | Canonical URL (used in sitemap, OG tags, metadataBase) |
| `NEXT_PUBLIC_GA_MEASUREMENT_ID` | Default `G-1K5C057XHQ` |
| `IPINFO_TOKEN` | *Optional.* Upgrades lead geolocation accuracy from Vercel's GeoLite2 baseline |
| `RATE_LIMIT_PER_MINUTE` | *Optional.* Overrides the default rate-limit (10/min) |

There is no `.env.local.example` checked in currently; if a fix needs a new env var, add it there with a placeholder per `CLAUDE.md` §4.6.

---

## 11. Verification commands

Before claiming any change is done:

```bash
npm run typecheck   # tsc --noEmit
npm run lint        # next lint
npm run build       # next build
```

All three must pass cleanly. Additionally manually exercise the affected feature(s) from `CLAUDE.md` §5 (the stable features list).

---

## 12. Quick mental map

If you only remember a few things:

- **Public site is server-rendered, blogs use ISR, admin is force-dynamic.**
- **Public anon Supabase client = RLS-enforced reads + lead inserts. Service-role client = admin only, bypasses RLS, never exposed.**
- **Every admin API route is wrapped in `withAdminGuard`. Every admin page checks the session itself.**
- **Middleware is Edge runtime, cookie-presence only. Full validation lives in route handlers.**
- **DOMPurify is heavy — only `lib/sanitize-html.ts` is allowed to import it. Everything else uses `lib/sanitize.ts`.**
- **The hidden admin URL is a literal folder name with `@` in it; both encoded and decoded variants are matched.**
- **Supabase changes need `notify pgrst, 'reload schema';` to take effect.**
