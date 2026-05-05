# EscaLeads — AI Contributor Contract

This file is a **contract**, not a suggestion. Every AI assistant working in this repo (Claude, Cursor, Gemini, Copilot, anything else) MUST read this file in full before making any change. If you cannot follow these rules, refuse the task and ask the operator for clarification.

The same content lives in `CLAUDE.md`, `AGENTS.md`, `GEMINI.md`, and `.cursorrules` so every assistant sees it. When you change one, change them all.

---

## 1. Project overview

**EscaLeads** is the production website for a digital agency at `escaleadsagency.vercel.app`. It is a single Next.js 14 App Router project that combines:

- A homepage rendered as an SPA-style scroll experience (six sections share one URL).
- A real, routed `/blogs` listing and `/blogs/[slug]` detail pages, ISR-cached.
- A hidden admin portal at `/escaleadsadmin@44334` for CMS and lead management.
- A Supabase Postgres backend with RLS for `blogs` and `leads`.
- Lead capture from the public contact form, including server-side IP + Vercel geolocation.
- Google Analytics 4 (measurement ID `G-1K5C057XHQ`) on every public route.

The site is **already in production with real visitors and real lead data**. Treat every change as a hot-fix: smallest viable diff, no opportunistic refactors, no scope creep.

---

## 2. Locked tech stack

These versions and choices are decided. **Do not** upgrade, swap, or "modernize" them without an explicit instruction from the operator naming the package.

| Concern | Choice | Pinned at |
|---|---|---|
| Framework | Next.js | `^14.2.18` (App Router only — never Pages Router) |
| UI runtime | React | `^18.3.1` |
| Language | TypeScript | `^5.6.3`, strict mode on |
| Database / API | Supabase Postgres + PostgREST | project ref `zhuawqmwdniersuahwcj` |
| Supabase JS client | `@supabase/supabase-js` | `^2.46.1` |
| Admin sessions | `iron-session` | `^8.0.4`, HMAC-signed HTTP-only cookie |
| HTML sanitization | `isomorphic-dompurify` | `^2.18.0`, lazy-loaded |
| Styling | CSS Modules + three globals (`reset.css`, `tokens.css`, `global.css`) | no Tailwind, no styled-components, no CSS-in-JS |
| Fonts | `next/font` Inter | preload + `display: swap` |
| Hosting | Vercel | `escaleadsagency.vercel.app` is canonical, `escaleads-nine.vercel.app` is a 307 redirect |
| Analytics | GA4 | measurement id `G-1K5C057XHQ`, see `components/analytics/GoogleAnalytics.tsx` |
| Lint | `eslint-config-next` | strict; `npm run lint` MUST pass |
| Typecheck | `tsc --noEmit` | MUST pass |
| Build | `next build` | MUST pass cleanly before any push |

You MUST NOT introduce a new dependency without being explicitly asked. If a feature seems to need one, propose it in your reply and wait for approval before adding it to `package.json`.

---

## 3. Folder structure

```
app/
  layout.tsx                          root shell (Inter font, JSON-LD Org + WebSite, GA4 mount)
  page.tsx                            homepage: assembles 6 sections in scroll order
  error.tsx / not-found.tsx / loading.tsx
  status.module.css                   shared styles for the three above
  sitemap.ts / robots.ts              auto-generated; admin Disallowed in robots
  blogs/
    page.tsx                          ISR list (revalidate 60)
    loading.tsx
    blogs.module.css                  shared by list and detail
    [slug]/
      page.tsx                        SSG + ISR + JSON-LD Article + BreadcrumbList
      not-found.tsx
      loading.tsx
  api/
    leads/route.ts                    public POST — rate-limited, sanitized, schema-tolerant insert
    admin/
      login/route.ts                  iron-session login, constant-time compare
      logout/route.ts
      blogs/(route|[id]/route).ts     CRUD, all wrapped in withAdminGuard
      leads/(route|[id]|export)/      list, mark read, delete, CSV
      diagnostics/route.ts            self-test endpoint
  escaleadsadmin@44334/               hidden admin URL — folder name is literal
    page.tsx                          login form OR dashboard depending on session
    layout.tsx                        intentionally minimal — no public Navbar here
    AdminTopbar.tsx
    LoginForm.tsx
    error.tsx / loading.tsx
    admin.module.css                  ALL admin styles
    blogs/
      page.tsx                        list + delete
      DeleteBlogButton.tsx
      BlogEditor.tsx                  HTML editor + live preview
      new/page.tsx
      [id]/edit/page.tsx
    leads/
      page.tsx                        table render
      LeadRow.tsx                     per-row actions; reads server JSON error body
      ExportButton.tsx
    diagnostics/
      page.tsx
      DiagnosticsRunner.tsx

components/
  navbar/Navbar.{tsx,module.css}      single source for the public navbar; bails on admin paths
  analytics/GoogleAnalytics.tsx       GA4 loader + manual SPA pageview tracker

sections/
  home/(Home.tsx|HeroActions.tsx|Home.module.css)
  services/(Services.tsx|Services.module.css)            from lib/content/static.ts
  how-it-works/(HowItWorks.tsx|HowItWorks.module.css)    from lib/content/static.ts
  blogs-preview/(BlogsPreview.tsx|BlogsPreview.module.css) reads Supabase
  our-work/(OurWork.tsx|OurWork.module.css)              from lib/content/static.ts
  contact/(Contact.tsx|Contact.module.css)               client form, posts /api/leads

lib/
  supabase/(server.ts|types.ts)       server-only clients with no-store fetch
  auth/
    session.ts                        iron-session helpers (server-only)
    cookie.ts                         edge-safe cookie-name constant ONLY
  security/csrf.ts                    Origin/Referer same-origin check
  content/
    static.ts                         services, work, how-it-works hardcoded data
    blogs.ts                          public Supabase reads (error-tolerant)
  client-info.ts                      x-vercel-ip-* + IP extraction (server-only)
  sanitize.ts                         plain-text sanitizer ONLY — NO DOMPurify import
  sanitize-html.ts                    rich-HTML sanitizer (lazy DOMPurify)
  rate-limit.ts                       in-memory token-bucket
  admin-handler.ts                    withAdminGuard — single auth+CSRF+rate+catch boundary
  format.ts

styles/
  index.css                           bundles the three below
  reset.css
  tokens.css                          design tokens; preserve VERBATIM
  global.css                          .section, .container, .eyebrow, .sectionTitle, etc.

supabase/schema.sql                   single source of truth for DB schema, grants, RLS

middleware.ts                         admin URL gate; pure cookie-presence check (Edge-safe)
next.config.mjs                       security headers (CSP/HSTS/etc.) + image opts
.env.local                            real secrets, gitignored
.env.local.example                    template
```

---

## 4. Non-negotiable AI rules

These are absolute. Violating them breaks production. If in doubt, ask first; do nothing while you wait.

### 4.1 Smallest possible change
- Make the **minimum diff** that solves the stated task. If the task is "fix the delete button," do not "while I'm here" reformat unrelated files.
- One concern per change. Do not bundle a bug fix with a refactor with a styling tweak.
- If you find unrelated issues, **flag them in your reply** and ask whether to fix them separately. Do not silently fix them.

### 4.2 Files you MUST NOT touch without explicit permission
The following paths are **frozen**. They contain security-critical or schema-critical code that has been tuned through real production incidents. Do not edit, refactor, or "clean up" any of them without the operator naming the file in their request.

- `middleware.ts`
- `lib/auth/session.ts`, `lib/auth/cookie.ts`
- `lib/security/csrf.ts`
- `lib/supabase/server.ts`
- `lib/admin-handler.ts`
- `lib/sanitize.ts`, `lib/sanitize-html.ts`
- `lib/rate-limit.ts`
- `next.config.mjs` — especially the `ContentSecurityPolicy` array and `securityHeaders`
- `supabase/schema.sql`
- `.env.local`, `.env.local.example`, `.env*`
- `app/api/admin/login/route.ts`, `app/api/admin/logout/route.ts`
- The folder name `app/escaleadsadmin@44334/` and the URL it produces
- The three global stylesheets in `styles/` (`reset.css`, `tokens.css`, `global.css`) — design tokens are referenced everywhere; renaming a token is a site-wide breakage

### 4.3 No refactors of working code
- "I noticed this could be cleaner" is not a reason. Cleaner is the operator's call, not yours.
- Do not extract abstractions, move files, rename symbols, or introduce design patterns unless the task explicitly asks for it.
- If a function is ugly but works, leave it ugly. If a CSS rule is "weird" but produces the correct visual, leave it weird.

### 4.4 Always explain changes
Every reply that includes code changes must end with a short, concrete summary in this exact shape:

- **What changed** — one bullet per file, naming the file and the user-visible behavior.
- **Why** — the root cause / requirement, not a restatement of the diff.
- **What to test** — the specific click-paths or commands that verify the fix.

Do not write essays. Do not pad. Do not list "best practices considered."

### 4.5 No drive-by dependency additions
Do not add to `package.json` without being told. If a task seems to require a new package, stop and ask. Adding a dep changes the bundle, the install graph, and the security surface — it is never a small change.

### 4.6 No silent secret handling
- Never print, log, or commit a secret value (anon keys, service-role keys, session secret, admin password, DB URL, GA measurement ID is OK — it is public).
- Never read `.env.local` and paste its contents into a reply.
- If a fix needs a new env var, add it to `.env.local.example` with a placeholder, document it in the change summary, and tell the operator to add it in Vercel.

### 4.7 Always run the verification commands before claiming done
Before saying "done" or pushing, run:
```bash
npm run typecheck   # tsc --noEmit
npm run lint        # next lint
npm run build       # next build
```
If any of those fail, the change is not done. Fix or revert.

---

## 5. Stable features that MUST keep working

If your change breaks any of these without the operator explicitly asking for it, you have introduced a regression. Test every one before pushing.

1. **Homepage scroll SPA** — clicking Home / Services / How It Works / Our Work / Contact in the navbar smooth-scrolls to the matching `id` on `/`. The active section is highlighted via IntersectionObserver.
2. **Blogs nav link** — clicking "Blogs" in the navbar navigates to `/blogs` (a real page), NOT a scroll on the homepage. The homepage still has a Blogs preview section with `id="blogs"`, but its cards link to individual posts.
3. **Public blog listing** at `/blogs` (ISR 60s).
4. **Public blog detail** at `/blogs/[slug]` (SSG + ISR + Article JSON-LD + BreadcrumbList JSON-LD).
5. **Contact form** → `POST /api/leads` → row in Supabase `leads` table with IP, country, region, city.
6. **Admin login** at `/escaleadsadmin@44334`. Username/password from env. 8-hour iron-session cookie.
7. **Admin Blog CRUD** — list, create (HTML editor + live preview), edit, delete. Affected blog paths revalidated on save.
8. **Admin Leads management** — list, mark read/unread, delete, export CSV. Each row shows IP and Location.
9. **Admin Diagnostics page** at `/escaleadsadmin@44334/diagnostics` — runs the live self-test against env, schema, anon insert, service-role read/update/delete, count parity, and prints visible rows.
10. **`robots.txt`** disallows `/escaleadsadmin@44334`. **`sitemap.xml`** auto-includes published blog slugs.
11. **GA4** fires `g/collect` on every route change EXCEPT admin paths.
12. **Security headers** (CSP, HSTS, X-Frame-Options, X-Content-Type-Options, Referrer-Policy, Permissions-Policy) on every response.
13. **Mobile navbar drawer** — hamburger toggles a glass-morphic drawer on `≤768px`.
14. **Sections grow to fit on mobile** — on `≤768px` no section is forced to 100vh; hero copy is top-aligned.

---

## 6. Architectural decisions that look weird but are intentional

These are NOT bugs. Do not "fix" them. They each exist because of a specific failure mode encountered in production.

### 6.1 The admin URL contains an `@` character
`/escaleadsadmin@44334` is intentional and matches the folder name `app/escaleadsadmin@44334/`. Next.js parallel routes use a **leading** `@` (e.g. `@modal`); a mid-name `@` is a regular path segment. The middleware matches BOTH `/escaleadsadmin@44334` and the percent-encoded `/escaleadsadmin%4044334` because some browsers encode and some don't.

### 6.2 The Blogs section exists on BOTH the homepage AND `/blogs`
The homepage's `#blogs` section is a 3-card preview that links to individual posts. The `/blogs` page is the full listing. This duplication is a product requirement (preserve original layout while adding a routed listing for SEO), not a refactor candidate.

### 6.3 `lib/sanitize.ts` does NOT import DOMPurify
This is deliberate. Importing `isomorphic-dompurify` loads `jsdom` synchronously at module-init time. On Vercel cold starts that has caused full route crashes. `lib/sanitize.ts` exposes regex-only `sanitizeText`, `slugify`, `isValidEmail`. Rich-HTML sanitization for blog content lives in `lib/sanitize-html.ts` and is only imported by the blog editor and the blog post page. **Do not consolidate them.**

### 6.4 `lib/auth/cookie.ts` exists separately from `lib/auth/session.ts`
The middleware runs in the Edge runtime and cannot import `iron-session` (it pulls Node `crypto`). `lib/auth/cookie.ts` exports only the cookie-name constant and is Edge-safe. `lib/auth/session.ts` does the actual session work and is server-only. **Do not consolidate them.**

### 6.5 The middleware only checks cookie presence, not validity
The Edge middleware checks that the iron-session cookie exists. The actual HMAC validation happens in route handlers via `getAdminSession()` (which throws on tamper). This is a deliberate split — keeping iron-session out of the Edge bundle is a hard requirement.

### 6.6 Both server-side Supabase clients force `cache: 'no-store'`
`lib/supabase/server.ts` passes a `global.fetch` that always sets `cache: 'no-store'`. This is required because Next.js wraps native fetch with its data cache, and supabase-js uses native fetch — without no-store, two consecutive server-side queries (e.g. dashboard count and leads list) can return inconsistent snapshots. Removing this WILL reintroduce the dashboard-vs-leads-page count mismatch.

### 6.7 `lib/content/blogs.ts` swallows errors and returns empty results
Public read helpers (`listPublishedBlogs`, `getPublishedBlogBySlug`) wrap Supabase calls in try/catch and return `[]` / `null` on failure. This is deliberate so a Vercel build can complete even before env vars are configured (the page renders empty rather than 500ing). Admin reads (`adminListBlogs`, `adminGetBlog`) deliberately throw — the admin UI surfaces the error.

### 6.8 `/api/leads` does a schema-tolerant insert
The lead route tries an insert with the IP/geo columns first; if Postgres returns code `42703` (`undefined_column`) or PostgREST `PGRST204`, it retries without those columns and logs a hint. This protects against environments where `supabase/schema.sql` has not been fully applied. Do not "simplify" this back to a single-attempt insert.

### 6.9 `withAdminGuard` is the single boundary for admin API routes
Every admin API route is wrapped in `withAdminGuard(handler, opts?)` from `lib/admin-handler.ts`. This handles CSRF, rate limit, `requireAdmin`, and outer try/catch (always returning JSON, never an HTML error page). Do not bypass it. Do not write ad-hoc auth checks in handlers.

### 6.10 PATCH/DELETE handlers do NOT use `.single()`
`app/api/admin/leads/[id]/route.ts` and `app/api/admin/blogs/[id]/route.ts` use `update().select()` (without `.single()`) and inspect `data.length`. With `.single()`, a zero-row UPDATE produces "Cannot coerce the result to a single JSON object" which is opaque. Without it, we explicitly return 404 with an actionable error. **Keep it that way.**

### 6.11 RLS on `leads` allows anon INSERT only; SERVICE ROLE has explicit full-access policies
`supabase/schema.sql` enables RLS on both tables, grants `anon, authenticated` only the minimum needed, and adds explicit "Service role full access on leads/blogs" policies. The service-role policies are belt-and-suspenders for the case where Force RLS gets toggled in the Supabase dashboard. Do not remove them.

### 6.12 IP and geolocation are captured server-side only
`lib/client-info.ts` reads `x-vercel-ip-*` headers and the `x-forwarded-for` IP. These are written into the `leads` row. There is **no client-side disclosure** by product decision. If the operator later asks for a privacy notice, that's a separate task.

### 6.13 GA4 suppresses the auto-pageview and emits one manually per route change
`components/analytics/GoogleAnalytics.tsx` sets `send_page_view: false` in the initial `gtag('config', ...)` and fires `gtag('config', id, { page_path })` from a `useEffect` keyed on `usePathname()` and `useSearchParams()`. This is required for App Router SPA navigation — gtag.js does not auto-track client-side route changes. Admin paths are skipped.

### 6.14 The contact form is a client component; everything else on the homepage is server-rendered
`sections/contact/Contact.tsx` is `'use client'`. The other five sections are server components. The hero's two CTA buttons are split into a tiny `HeroActions.tsx` client component so the rest of `Home.tsx` can stay a server component. Don't promote whole sections to client just because one piece needs interactivity.

### 6.15 Schema migrations require a PostgREST schema-cache reload
After ALTER TABLE in Supabase SQL Editor, you must run `notify pgrst, 'reload schema';` or the API keeps serving the old schema. `supabase/schema.sql` ends with that NOTIFY for this reason. If you make schema changes and admin endpoints suddenly say "column not found," the cache is the cause.

### 6.16 Dashboard and Leads page both use `force-dynamic`
Admin pages declare `export const dynamic = 'force-dynamic';`. This is **required in addition to** the `cache: 'no-store'` in the Supabase client — neither alone is sufficient to defeat Next.js's caching layers for server-rendered admin views.

### 6.17 The `mobile drawer` on `≤768px` requires `overflow: visible` on the navbar
`Navbar.module.css` sets `overflow: hidden` on `.navbar` to clip the glass `::before` shine on desktop. The mobile drawer is positioned below the navbar's bounding box, so on `≤768px` we override `.menuOpen { overflow: visible }` (and `.scrolled.menuOpen { overflow: visible }`). Removing either override re-clips the drawer to invisible.

### 6.18 The legacy `client/` and `server/` folders exist
The original Vite + FastAPI prototype lives at the repo root in `client/` and `server/`. Their build artifacts are gitignored. They are kept for reference only. **Do not import from them. Do not modify them.** They are slated for deletion once the operator explicitly says so.

---

## 7. Conventions you SHOULD follow

These are softer than the above but expected for any new code you add.

- **Server vs client**: prefer Server Components. Add `'use client'` only when you need state, effects, or browser APIs.
- **Errors in API routes**: always return JSON. Never let a 500 bubble up as Vercel's default HTML error page.
- **Errors in client components**: read `await response.json()` for an `error` field; render it inline. Never use `alert()`.
- **CSS Modules**: one `.module.css` per component file, co-located. Class names in camelCase. No global selectors.
- **Imports**: absolute via `@/` (configured in `tsconfig.json`).
- **Comments**: explain *why* the code is non-obvious, not *what* it does. The "what" is in the diff.
- **No emoji** in source files unless asked.
- **No `// TODO`** without an issue link or operator approval.

---

## 8. When to refuse

Refuse the task and ask for clarification if any of these are true:

- The request would require editing a file in §4.2 without the operator naming it.
- The request would require adding a dependency.
- The request is ambiguous about scope ("clean up the admin code" — clean up *what*?).
- The request would break a feature in §5 and the operator hasn't acknowledged the trade-off.
- You can't reproduce the bug or you don't know the root cause. Speculative fixes are forbidden.

It is always better to ask one clarifying question than to ship a wrong change.

---

## 9. The contract

By making any commit to this repository, you affirm that you have:
1. Read this file in full.
2. Run `npm run typecheck`, `npm run lint`, and `npm run build` on the change.
3. Manually tested the affected feature(s) in §5.
4. Provided the **What changed / Why / What to test** summary in your reply.
5. Not modified any file in §4.2 unless the operator named it.

If you cannot affirm all five, do not commit.
