# EscaLeads — Visual Architecture & Audit

A comprehensive **graphical** walkthrough of the EscaLeads codebase. Every block, arrow, and box below is a Mermaid diagram — GitHub renders them natively, so this file *is* the visualization. Pair this with `ARCHITECTURE.md` (text reference) and `CLAUDE.md` (the AI contributor contract).

> Scroll the table of contents below or read top-to-bottom — each section is self-contained and can be read in isolation.

## Table of contents

1. [System context (who talks to what)](#1-system-context)
2. [Tech stack — layered view](#2-tech-stack)
3. [Repository layout](#3-repository-layout)
4. [Routing map (every URL)](#4-routing-map)
5. [Database — ER + RLS](#5-database--er--rls)
6. [API surface](#6-api-surface)
7. [Request flows (sequence diagrams)](#7-request-flows)
8. [Authentication & security (layered defense)](#8-authentication--security)
9. [Data fetching strategies (which page is which)](#9-data-fetching-strategies)
10. [Sanitization pipeline](#10-sanitization-pipeline)
11. [Styling architecture](#11-styling-architecture)
12. [Build & deploy pipeline](#12-build--deploy-pipeline)
13. [SEO audit findings](#13-seo-audit-findings)

---

## 1. System context

The actors, the app, and every external system it touches. C4-style overview.

```mermaid
flowchart LR
    Visitor(["Visitor<br/>(prospect / lead)"])
    Admin(["Admin<br/>(operator)"])
    Bot(["Search engine bot<br/>(Googlebot, etc.)"])

    subgraph EscaLeads["EscaLeads (escaleadsagency.vercel.app)"]
        direction TB
        App["Next.js 14 App Router<br/>SSG · ISR · API routes"]
    end

    subgraph External["External services"]
        direction TB
        Supabase[("Supabase Postgres<br/>+ PostgREST<br/>(RLS on blogs, leads)")]
        GA4[("Google Analytics 4<br/>G-1K5C057XHQ")]
        IPInfo[("IPinfo.io<br/>(optional geo upgrade)")]
        Vercel["Vercel Edge<br/>(CDN + headers + ISR cache)"]
    end

    Visitor -- "browse, submit contact form" --> Vercel
    Admin   -- "/escaleadsadmin@44334" --> Vercel
    Bot     -- "crawl HTML + sitemap" --> Vercel
    Vercel  --> App
    App     -- "lead INSERT (anon RLS),<br/>blog SELECT (anon RLS, published only)" --> Supabase
    App     -- "blog CRUD + lead read/update<br/>(service-role, bypass RLS)" --> Supabase
    App     -- "geolocate by IP" --> IPInfo
    Visitor -- "gtag /collect" --> GA4

    classDef external fill:#f3f4f6,stroke:#9ca3af,color:#0f172a;
    class Supabase,GA4,IPInfo,Vercel external;
```

---

## 2. Tech stack

Pinned versions and intentional choices, from runtime to language. **No Tailwind, no styled-components, no Edge runtime for data routes.**

```mermaid
flowchart TB
    subgraph Hosting["Hosting & Edge"]
        VEdge["Vercel Edge Network<br/>(CDN, security headers, ISR cache)"]
        MW["middleware.ts<br/>(Edge runtime — cookie-presence gate only)"]
    end

    subgraph Runtime["Application runtime"]
        Next["Next.js 14.2.18 — App Router only"]
        React["React 18.3.1"]
        Node["Node.js (Vercel serverless functions)<br/>pinned via runtime = 'nodejs'"]
    end

    subgraph Lang["Language & build"]
        TS["TypeScript 5.6.3<br/>strict mode + noEmit typecheck"]
        ESLint["eslint-config-next<br/>(next/core-web-vitals)"]
    end

    subgraph Data["Data layer"]
        SupaJS["@supabase/supabase-js 2.46.1<br/>(no-store fetch override)"]
        Postgres[("Postgres + PostgREST<br/>RLS-protected")]
    end

    subgraph SecAuth["Auth & security"]
        Iron["iron-session 8.0.4<br/>HMAC-signed HTTP-only cookie"]
        CSRF["lib/security/csrf.ts<br/>Origin/Referer same-origin check"]
        Rate["lib/rate-limit.ts<br/>in-memory token bucket"]
        Sani["sanitize-html 2.17.4<br/>(parser-based allow-list, NO jsdom)"]
    end

    subgraph Style["Styling"]
        CSSMod["CSS Modules<br/>(one .module.css per component)"]
        Tokens["styles/tokens.css<br/>(--color-*, --space-*, --radius-*, --shadow-*)"]
        Fonts["next/font Inter + Playfair Display<br/>preload + display: swap"]
    end

    subgraph Analytics["Analytics"]
        GA["GA4 inline <script><br/>+ manual SPA pageview hook"]
    end

    VEdge --> MW --> Next
    Next --> React
    Next --> Node
    Next --> TS
    Node --> SupaJS --> Postgres
    Node --> Iron
    Node --> CSRF
    Node --> Rate
    Node --> Sani
    React --> CSSMod
    CSSMod --> Tokens
    React --> Fonts
    React --> GA
```

---

## 3. Repository layout

```
.
├── app/                                   Next.js App Router
│   ├── layout.tsx                         root shell, GA4 bootstrap, Org+WebSite JSON-LD
│   ├── page.tsx                           / homepage (stacks 6 sections, revalidate 3600)
│   ├── error.tsx / not-found.tsx / loading.tsx
│   ├── sitemap.ts / robots.ts             dynamic at build, includes published blog slugs
│   ├── services|how-it-works|our-work|contact/page.tsx
│   │
│   ├── blogs/
│   │   ├── layout.tsx                     {children} + {modal} parallel slot wrapper
│   │   ├── page.tsx                       /blogs listing (ISR 60s)
│   │   ├── BlogModalDialog.tsx            client overlay (scrim · ESC · scroll lock)
│   │   ├── BlogModalDialog.module.css
│   │   ├── [slug]/page.tsx                /blogs/<slug> SEO page (SSG + ISR, runtime=nodejs)
│   │   └── @modal/(.)[slug]/page.tsx      intercepting modal route (client-side nav only)
│   │
│   ├── api/
│   │   ├── leads/route.ts                 POST public — rate-limit, sanitize, schema-tolerant insert
│   │   └── admin/
│   │       ├── login/route.ts             iron-session login, timing-safe compare
│   │       ├── logout/route.ts
│   │       ├── blogs/route.ts             GET, POST (withAdminGuard)
│   │       ├── blogs/[id]/route.ts        GET, PUT, DELETE (withAdminGuard + safeRevalidate)
│   │       ├── leads/route.ts             GET
│   │       ├── leads/[id]/route.ts        PATCH (mark read), DELETE
│   │       ├── leads/export/route.ts      CSV download
│   │       └── diagnostics/route.ts       env + schema + CRUD self-test
│   │
│   └── escaleadsadmin@44334/              hidden admin (literal '@' is a path segment)
│       ├── layout.tsx                     async — checks session, mounts AdminSidebar shell
│       ├── page.tsx                       Login (logged-out) OR Dashboard (logged-in)
│       ├── AdminSidebar.tsx               persistent left nav (never remounts on navigation)
│       ├── LoginForm.tsx
│       ├── admin.module.css               admin-LOCAL palette (no bleed to public site)
│       ├── blogs/page.tsx · new/page.tsx · [id]/edit/page.tsx · BlogEditor.tsx
│       ├── leads/page.tsx · LeadRow.tsx · ExportButton.tsx
│       └── diagnostics/page.tsx · DiagnosticsRunner.tsx
│
├── components/
│   ├── navbar/Navbar.tsx                  expand-on-click navbar, bails on admin paths
│   └── analytics/GoogleAnalytics.tsx      manual SPA pageview tracker
│
├── sections/                              homepage section components
│   ├── home/Home.tsx + HeroActions.tsx    hero (server) + CTA buttons (client)
│   ├── services / how-it-works / our-work statically populated from lib/content/static.ts
│   ├── blogs-preview/BlogsPreview.tsx     async server — reads Supabase
│   └── contact/Contact.tsx                client form, posts /api/leads
│
├── lib/                                   non-React modules
│   ├── supabase/server.ts                 anon + service clients (both force cache: 'no-store')
│   ├── supabase/types.ts                  Blog · Lead · BlogInput
│   ├── auth/session.ts                    iron-session helpers (server-only)
│   ├── auth/cookie.ts                     cookie-name constant (Edge-safe)
│   ├── security/csrf.ts                   assertSameOrigin
│   ├── content/static.ts                  hardcoded services / projects / steps
│   ├── content/blogs.ts                   public reads (error-tolerant) + admin reads (throw)
│   ├── admin-handler.ts                   withAdminGuard — CSRF → rate → auth → handler → catch
│   ├── client-info.ts                     IP + geo from x-vercel-ip-* + IPinfo upgrade
│   ├── rate-limit.ts                      in-memory token bucket
│   ├── sanitize.ts                        plain-text sanitizer (regex, NO DOMPurify)
│   ├── sanitize-html.ts                   rich-HTML sanitizer (sanitize-html package, no jsdom)
│   ├── text-to-html.ts                    plain text → <p>/<br>/<a> for blog editor
│   └── format.ts                          formatDate / formatDateTime (Intl)
│
├── styles/
│   ├── index.css                          imports the three below
│   ├── reset.css
│   ├── tokens.css                         FROZEN — design tokens referenced everywhere
│   └── global.css                         .section · .container · .eyebrow · .sectionTitle
│
├── middleware.ts                          FROZEN — admin URL gate (Edge-safe)
├── next.config.mjs                        FROZEN — CSP, HSTS, image config, security headers
├── supabase/schema.sql                    single source of truth for DB schema + RLS
└── .env.local.example                     env var template
```

---

## 4. Routing map

Every URL the app exposes, color-coded by type. ƒ = serverless function, ● = SSG with revalidate, ○ = static, 🔒 = auth-gated.

```mermaid
flowchart TD
    Root[/"/"/]:::ssg
    Root --> Home["○ / — homepage<br/>revalidate 3600"]
    Root --> Services["○ /services"]
    Root --> HowItWorks["○ /how-it-works"]
    Root --> OurWork["○ /our-work"]
    Root --> Contact["○ /contact"]
    Root --> Sitemap["ƒ /sitemap.xml"]
    Root --> Robots["ƒ /robots.txt"]
    Root --> BlogList["○ /blogs<br/>ISR 60s"]
    BlogList --> BlogDetail["● /blogs/[slug]<br/>SSG + ISR 60s, runtime=nodejs<br/>Article + Breadcrumb JSON-LD"]
    BlogList -. "client-side nav<br/>(intercept)" .-> ModalRoute["ƒ /blogs/@modal/(.)[slug]<br/>Modal overlay"]

    Root --> Admin{{"🔒 /escaleadsadmin@44334"}}:::admin
    Admin --> AdminRoot["ƒ / (login OR dashboard)"]
    Admin --> AdminBlogList["ƒ /blogs"]
    AdminBlogList --> AdminBlogNew["ƒ /blogs/new"]
    AdminBlogList --> AdminBlogEdit["ƒ /blogs/[id]/edit"]
    Admin --> AdminLeads["ƒ /leads"]
    Admin --> AdminDiag["ƒ /diagnostics"]

    Root --> APIs[/"/api"/]:::api
    APIs --> APILeads["ƒ POST /api/leads — public<br/>(rate-limit, sanitize, anon-INSERT)"]
    APIs --> APIAdminPub["ƒ POST /api/admin/login<br/>ƒ POST /api/admin/logout"]
    APIs --> APIAdminBlogs["ƒ /api/admin/blogs · /:id<br/>GET, POST, PUT, DELETE 🔒"]
    APIs --> APIAdminLeads["ƒ /api/admin/leads · /:id · /export<br/>GET, PATCH, DELETE 🔒"]
    APIs --> APIDiag["ƒ /api/admin/diagnostics 🔒"]

    classDef ssg fill:#dcfce7,stroke:#16a34a;
    classDef admin fill:#fef3c7,stroke:#d97706;
    classDef api fill:#dbeafe,stroke:#2563eb;
```

---

## 5. Database — ER + RLS

Two tables in the `public` schema. RLS is enabled on both; service-role bypasses; anon is tightly scoped.

```mermaid
erDiagram
    blogs {
        uuid id PK "gen_random_uuid()"
        text title "not null"
        text slug UK "not null, unique"
        text content "not null (sanitized HTML)"
        text cover_image "nullable"
        text meta_description "nullable"
        text_array tags "default {}"
        boolean published "default false"
        timestamptz created_at "default now()"
        timestamptz updated_at "default now(), trigger-updated"
    }
    leads {
        uuid id PK "gen_random_uuid()"
        text name "not null"
        text email "not null"
        text phone "nullable"
        text message "not null"
        boolean read "default false"
        timestamptz created_at "default now()"
        text ip_address "nullable (server-only)"
        text country "nullable"
        text region "nullable"
        text city "nullable"
    }
```

### Row-Level Security policies

```mermaid
flowchart LR
    subgraph anon["anon role (browser via NEXT_PUBLIC_SUPABASE_ANON_KEY)"]
        direction TB
        AB["blogs:<br/>SELECT WHERE published = true"]
        AL["leads:<br/>INSERT only<br/>(name + email + message + ip + geo)"]
    end

    subgraph svc["service_role (server only via SUPABASE_SERVICE_ROLE_KEY)"]
        direction TB
        SB["blogs: ALL (full CRUD)<br/>+ belt-and-suspenders policy"]
        SL["leads: ALL (full CRUD)<br/>+ belt-and-suspenders policy"]
    end

    Browser["Browser → /api/leads<br/>uses ANON key on server"]
    Admin["Admin API routes →<br/>withAdminGuard → SERVICE key"]
    PublicBlog["Public /blogs* pages →<br/>ANON key (RLS filters drafts)"]

    Browser --> anon
    Admin --> svc
    PublicBlog --> anon
```

> Belt-and-suspenders: schema declares `alter table … no force row level security` AND explicit `"Service role full access"` policies. Dual safeguard against a dashboard "Force RLS" toggle silently zero-ing out admin UPDATE/DELETE.

---

## 6. API surface

| Method | Path | Auth | Purpose | Request body | Response |
|---|---|---|---|---|---|
| POST | `/api/leads` | public + rate-limit | Contact form submission | `{name, email, phone?, message}` | `200 {ok: true, id}` · `400` validation · `429` rate-limited |
| POST | `/api/admin/login` | public | Username/password sign-in | `{username, password}` | `200 {ok: true}` (sets HMAC cookie) · `401` |
| POST | `/api/admin/logout` | session | Destroys session cookie | — | `200 {ok: true}` |
| GET | `/api/admin/blogs` | session | List all blogs (incl. drafts) | — | `200 {blogs: Blog[]}` |
| POST | `/api/admin/blogs` | session + CSRF + rate | Create blog | `{title, slug, content, cover_image?, meta_description?, tags?, published}` | `201 {blog}` · `409` dup slug · `400` validation |
| GET | `/api/admin/blogs/[id]` | session | Get single blog | — | `200 {blog}` · `404` |
| PUT | `/api/admin/blogs/[id]` | session + CSRF + rate | Update blog + revalidate paths | same as POST | `200 {blog}` · `404` |
| DELETE | `/api/admin/blogs/[id]` | session + CSRF + rate | Delete blog + revalidate paths | — | `200 {ok, deleted}` · `404` |
| GET | `/api/admin/leads` | session | List all leads | — | `200 {leads: Lead[]}` |
| PATCH | `/api/admin/leads/[id]` | session + CSRF + rate | Toggle read | `{read: boolean}` | `200 {lead}` · `404` |
| DELETE | `/api/admin/leads/[id]` | session + CSRF + rate | Delete lead | — | `200 {ok}` · `404` |
| GET | `/api/admin/leads/export` | session | CSV download of all leads | — | `200 text/csv` with `Content-Disposition: attachment` |
| GET | `/api/admin/diagnostics` | session | End-to-end self-test (env + RLS + CRUD) | — | `200 {checks: Check[], halt}` |

Every admin route is wrapped in `withAdminGuard(handler, opts?)` from `lib/admin-handler.ts` — single boundary for CSRF, rate limit, session check, and JSON error response.

---

## 7. Request flows

### 7.1 Visitor submits the contact form

```mermaid
sequenceDiagram
    autonumber
    participant U as Visitor (browser)
    participant C as sections/contact/Contact.tsx<br/>(client)
    participant API as /api/leads<br/>(Node serverless)
    participant RL as lib/rate-limit.ts
    participant S as lib/sanitize.ts
    participant CI as lib/client-info.ts
    participant DB as Supabase (anon role)

    U->>C: Fills name + email + message, clicks Submit
    C->>API: POST JSON
    API->>RL: rateLimit(clientKey, 5/min)
    RL-->>API: ok / 429
    API->>S: sanitizeText(name 80, email 254, phone 40, message 2000)
    S-->>API: cleaned strings
    API->>S: isValidEmail(email)
    S-->>API: true / false
    API->>CI: extractIP + headers → x-vercel-ip-country/region/city
    CI-->>API: {ip, country, region, city}
    Note over API,DB: Try with IP/geo cols first
    API->>DB: insert(leads row)
    alt schema cache stale (PGRST204 / 42703)
        DB-->>API: column not found
        API->>DB: retry without IP/geo cols
    end
    DB-->>API: row id (RLS: anon INSERT only)
    API-->>C: 200 {ok: true}
    C->>U: "Thanks — we'll be in touch" UI
```

### 7.2 Admin login

```mermaid
sequenceDiagram
    autonumber
    participant U as Admin
    participant L as LoginForm.tsx
    participant API as /api/admin/login
    participant ENV as process.env (ADMIN_USERNAME / ADMIN_PASSWORD)
    participant Iron as iron-session

    U->>L: Enters credentials
    L->>API: POST {username, password}
    API->>API: Origin/Referer same-origin check
    API->>ENV: timing-safe equal
    ENV-->>API: match
    API->>Iron: setCookie HMAC-signed JWT (8h TTL)
    Iron-->>API: Set-Cookie header
    API-->>L: 200 {ok: true}
    L->>L: router.push(redirect) + router.refresh()
    L->>U: Dashboard renders<br/>(layout now sees session.isAdmin = true)
```

### 7.3 Admin creates a blog post

```mermaid
sequenceDiagram
    autonumber
    participant A as Admin
    participant BE as BlogEditor.tsx
    participant API as /api/admin/blogs (POST)
    participant W as withAdminGuard
    participant CSRF as lib/security/csrf.ts
    participant RL as lib/rate-limit.ts
    participant Sess as lib/auth/session.ts
    participant Txt as lib/text-to-html.ts
    participant SH as lib/sanitize-html.ts
    participant DB as Supabase (service-role)

    A->>BE: Fills form, clicks "Create post"
    BE->>API: POST JSON body
    API->>W: handler enters guard
    W->>CSRF: assertSameOrigin(req)
    CSRF-->>W: ok / 403
    W->>RL: rateLimit("admin-write", 60/min)
    RL-->>W: ok / 429
    W->>Sess: requireAdmin (HMAC verify cookie)
    Sess-->>W: session{isAdmin} / 401
    W->>Txt: textToHtml(content)<br/>plain text → <p>/<br>/<a>
    Txt-->>W: HTML string
    W->>SH: sanitizeRichHtml(html)<br/>parser-based allow-list
    SH-->>W: safe HTML
    W->>DB: insert(blog row) — service-role bypasses RLS
    alt duplicate slug
        DB-->>W: error code 23505
        W-->>BE: 409 {error: "A post with this slug already exists"}
    else success
        DB-->>W: row
        W-->>BE: 201 {blog}
    end
    BE->>A: router.push to edit page + refresh
```

### 7.4 Visitor opens blog from listing (modal flow)

```mermaid
sequenceDiagram
    autonumber
    participant U as Visitor
    participant L as /blogs (listing)
    participant ML as @modal/(.)[slug] (intercept)
    participant DLG as BlogModalDialog (client)
    participant DB as Supabase (anon, RLS)

    U->>L: Navigates to /blogs
    Note over L: SSG cached, ISR 60s
    L-->>U: HTML with blog cards
    U->>L: Clicks a card<br/>(Link href=/blogs/<slug>)
    Note over U,L: Same-origin client-side nav<br/>App Router detects intercept slot
    L->>ML: Render @modal slot for /blogs/<slug>
    ML->>DB: getPublishedBlogBySlug(slug)<br/>RLS: published = true
    DB-->>ML: row or null
    ML->>ML: sanitizeRichHtml(blog.content)
    ML->>DLG: Pass children with title + body
    DLG-->>U: Modal overlays page<br/>URL = /blogs/<slug>, listing remains under scrim
    U->>DLG: ESC key / scrim click / × button
    DLG->>DLG: router.back()
    DLG-->>U: Modal unmounts, URL back to /blogs
```

### 7.5 Visitor opens blog directly (SEO path)

```mermaid
sequenceDiagram
    autonumber
    participant B as Search engine bot / direct nav
    participant V as Vercel Edge
    participant ISR as ISR cache
    participant Page as /blogs/[slug]<br/>(runtime=nodejs)
    participant DB as Supabase (anon, RLS)

    B->>V: GET /blogs/<slug>
    V->>ISR: lookup
    alt cache HIT (fresh)
        ISR-->>V: prerendered HTML
    else cache STALE (>60s)
        ISR-->>V: stale HTML (served immediately)
        V-)Page: background revalidate
        Page->>DB: getPublishedBlogBySlug
        DB-->>Page: row
        Page->>Page: sanitizeRichHtml + generateMetadata
        Page->>ISR: updated HTML cached
    else cache MISS (new slug)
        V->>Page: render on demand
        Page->>DB: fetch
        DB-->>Page: row or null
        alt not found
            Page->>V: 404 (not-found.tsx)
        else found
            Page-->>V: HTML with<br/>Article JSON-LD + BreadcrumbList JSON-LD<br/>+ OG + Twitter
            V->>ISR: cache for future requests
        end
    end
    V-->>B: Full server-rendered HTML
```

### 7.6 Diagnostics self-test

```mermaid
sequenceDiagram
    autonumber
    participant A as Admin
    participant DR as DiagnosticsRunner
    participant API as /api/admin/diagnostics
    participant DB as Supabase (svc + anon)

    A->>DR: Clicks "Run diagnostics"
    DR->>API: GET (withAdminGuard, csrf:false)
    API->>API: check env vars present
    API->>DB: service-role SELECT count blogs / leads
    API->>DB: anon INSERT a synthetic lead row
    API->>DB: service-role SELECT the row back
    API->>DB: service-role UPDATE (read: true)
    API->>DB: service-role DELETE the row
    API->>DB: HEAD count vs SELECT — detect RLS divergence
    API-->>DR: {checks: Check[], halt}
    DR-->>A: Render colored rows (green=ok, red=fail)<br/>with actionable error hints
```

---

## 8. Authentication & security

Defense in depth, four layers. Each layer is a single source of truth — they don't duplicate logic.

```mermaid
flowchart TD
    Req(["Incoming request"])
    Req --> MW{"Layer 1: middleware.ts (Edge runtime)<br/>Path matches /escaleadsadmin@44334?"}
    MW -->|public path| PT["pass through →<br/>public Next.js routing"]
    MW -->|admin path, NO cookie| RD["302 redirect →<br/>/escaleadsadmin@44334"]
    MW -->|admin path, cookie present| AL["allow into route"]

    AL --> Type{"Route type"}
    Type -->|page| Page["app/escaleadsadmin@44334/layout.tsx<br/>async server component"]
    Page --> Sess1["getAdminSession() — HMAC verify cookie"]
    Sess1 --> SR{"session.isAdmin?"}
    SR -->|yes| Shell["render <shell><AdminSidebar /><br/><container>{children}</container>"]
    SR -->|no| Login["render {children}<br/>(root page shows LoginForm)"]

    Type -->|API| Guard["Layer 2: withAdminGuard wrapper"]
    Guard --> CSRF["1. assertSameOrigin<br/>(Origin or Referer must match host)"]
    CSRF -->|fail| R403["403 JSON {error}"]
    CSRF -->|ok| Rate["2. rateLimit clientKey + admin-write"]
    Rate -->|exceeded| R429["429 JSON + Retry-After"]
    Rate -->|ok| Sess2["3. requireAdmin (HMAC verify)"]
    Sess2 -->|fail| R401["401 JSON"]
    Sess2 -->|ok| Handler["4. handler runs<br/>(service-role Supabase client)"]
    Handler --> DB["Supabase"]
    DB --> RLS["Layer 4: RLS<br/>(anon scoped to published=true blogs<br/>+ INSERT-only leads;<br/>service-role bypasses + explicit policies)"]
    Handler -->|throws| R500["catch-all<br/>500 JSON {error}"]

    classDef gate fill:#fee2e2,stroke:#dc2626;
    classDef ok fill:#dcfce7,stroke:#16a34a;
    class CSRF,Rate,Sess2,RLS gate;
    class Handler,Shell ok;
```

> **Why middleware doesn't validate the cookie**: middleware runs in Edge runtime which can't import `iron-session` (pulls Node `crypto`). The cookie's HMAC is verified inside Node-runtime route handlers via `getAdminSession()`. Forging a cookie name passes the middleware; forging a valid HMAC signature is what's actually hard.

---

## 9. Data fetching strategies

Which strategy serves which route, and why.

```mermaid
flowchart LR
    subgraph SSG["○ Static / SSG (build-time HTML, never re-renders)"]
        S2["/services<br/>/how-it-works<br/>/our-work<br/>/contact"]
    end

    subgraph ISR["○ ISR (background revalidation)"]
        I1["/<br/>revalidate 3600s"]
        I2["/blogs<br/>revalidate 60s<br/>(reads Supabase via anon)"]
    end

    subgraph SSGISR["● SSG + ISR (generateStaticParams + revalidate)"]
        SI1["/blogs/[slug]<br/>revalidate 60s, runtime=nodejs<br/>(reads Supabase via anon, RLS published=true)"]
    end

    subgraph Dyn["ƒ Dynamic / SSR (force-dynamic + cache: 'no-store')"]
        D1["/escaleadsadmin@44334/**<br/>(session-gated, fresh every request)"]
        D2["/api/** route handlers"]
        D3["/blogs/@modal/(.)[slug]<br/>intercepting modal route, client-side nav only"]
    end

    subgraph Client["◐ Client (use client)"]
        C1["sections/contact/Contact.tsx<br/>(form state, POST /api/leads)"]
        C2["components/navbar/Navbar.tsx<br/>(scroll-spy + expand state)"]
        C3["components/analytics/GoogleAnalytics.tsx<br/>(usePathname route-change tracker)"]
        C4["app/escaleadsadmin@44334/* client components<br/>(BlogEditor, LeadRow, DiagnosticsRunner, etc.)"]
        C5["app/blogs/BlogModalDialog.tsx<br/>(scrim + ESC + scroll lock)"]
    end
```

**Cache-busting rationale (CLAUDE.md §6.6 / §6.16):** server-side Supabase clients pass a custom `global.fetch` that always sets `cache: 'no-store'`. Admin pages additionally export `dynamic = 'force-dynamic'`. Both are required — neither alone defeats every layer of Next.js's caching.

---

## 10. Sanitization pipeline

Two-pass sanitation on write, second-pass defense on read. **No jsdom anywhere** (the previous DOMPurify chain crashed on Vercel cold-starts).

```mermaid
flowchart LR
    In(["Admin types in editor textarea<br/>(plain text or pasted HTML)"]) --> T2H["lib/text-to-html.ts"]

    T2H --> Detect{"Block HTML tags<br/>at line start?"}
    Detect -->|plain text| Escape["escape entities<br/>split on blank lines → <p>...</p><br/>single \n → <br><br/>auto-link http(s) URLs → <a rel target>"]
    Detect -->|authored HTML| PassThrough["pass through unchanged"]

    Escape --> Raw["raw HTML string"]
    PassThrough --> Raw

    Raw --> SH1["lib/sanitize-html.ts<br/>sanitize-html package (parser-based allow-list)<br/><br/>Tags: p, br, strong, em, u, s, blockquote,<br/>code, pre, ul, ol, li, a, img, h1-h6,<br/>hr, figure, figcaption<br/>Attrs: a→href|title|rel|target<br/>     img→src|alt|title<br/>Schemes: http, https, mailto, tel"]
    SH1 --> Safe["sanitized HTML"]
    Safe --> DB[("blogs.content<br/>(stored as safe HTML)")]

    DB --> Read([" /blogs/<slug> page<br/>or @modal/(.)[slug] route"])
    Read --> SH2["sanitizeRichHtml again<br/>(defense in depth)"]
    SH2 --> Render["React<br/>dangerouslySetInnerHTML"]

    classDef step fill:#dbeafe,stroke:#2563eb;
    class T2H,SH1,SH2 step;
```

> The plain-text sanitizer `lib/sanitize.ts` is **deliberately separate** and has **NO** DOMPurify/sanitize-html import. Hot routes like `/api/leads` and `/api/admin/login` only need cheap regex stripping — pulling in the parser would inflate every cold-start.

---

## 11. Styling architecture

```mermaid
flowchart TB
    Index["styles/index.css<br/>(@import barrel)"]
    Index --> Reset["styles/reset.css<br/>baseline CSS reset"]
    Index --> Tokens["styles/tokens.css<br/><br/>--color-blue-primary: #1A4FBF<br/>--color-text-dark: #0D1B3E<br/>--color-white-glass: rgba(255,255,255,0.56)<br/>--space-2..32<br/>--radius-sm/md/lg/xl/full<br/>--shadow-sm/md/lg<br/>--font-inter (next/font CSS var)<br/>--font-playfair<br/><br/>FROZEN — used everywhere"]
    Index --> Global["styles/global.css<br/>.section · .container ·<br/>.eyebrow · .sectionTitle · .sectionLead"]

    Tokens --> Public["Public-site modules"]
    Public --> NavCSS["components/navbar/Navbar.module.css"]
    Public --> HomeCSS["sections/home/Home.module.css"]
    Public --> ServiceCSS["sections/*/*.module.css"]
    Public --> BlogCSS["app/blogs/blogs.module.css"]
    Public --> ModalCSS["app/blogs/BlogModalDialog.module.css"]

    Tokens -.does NOT inherit into.-> Admin["Admin module"]
    Admin --> AdminCSS["app/escaleadsadmin@44334/admin.module.css<br/><br/>Admin-LOCAL palette declared on .shell:<br/>--admin-bg: #FAFAFA<br/>--admin-sidebar: #0F172A<br/>--admin-text: #0F172A<br/>--admin-accent: #2563EB (1px only)<br/><br/>Isolation prevents bleed in either direction."]

    classDef frozen fill:#fee2e2,stroke:#dc2626;
    class Tokens frozen;
```

---

## 12. Build & deploy pipeline

```mermaid
sequenceDiagram
    autonumber
    participant Dev as Developer
    participant Local as Local checkout
    participant GH as GitHub (origin/main)
    participant Vercel as Vercel build
    participant Edge as Vercel Edge CDN
    participant Visitor

    Dev->>Local: code change
    Dev->>Local: npm run typecheck && npm run lint && npm run build
    Local-->>Dev: all green
    Dev->>Local: git commit
    Dev->>GH: git push origin HEAD:main
    GH-->>Vercel: webhook
    Vercel->>Vercel: npm ci → next build
    Note over Vercel: SSG pages prerendered (incl.<br/>generateStaticParams from Supabase)<br/>ISR cache initialized
    Vercel->>Edge: atomic deploy<br/>(serverless functions + static assets)
    Edge-->>Visitor: production URL live

    rect rgb(240, 250, 240)
    Note over Edge,Visitor: Subsequent requests
    Visitor->>Edge: GET /
    Edge-->>Visitor: SSG HTML from CDN (instant)
    Visitor->>Edge: GET /blogs/<slug>
    Edge-->>Visitor: ISR-cached HTML; background revalidate every 60s
    Visitor->>Edge: POST /api/leads
    Edge-->>Visitor: serverless function executes
    end
```

---

## 13. SEO audit findings

> Findings from the last audit pass on the live deploy. Severity by how much it blocks Google indexing.

### 🔴 Critical — blocks SEO indexing

```mermaid
flowchart LR
    Issue1["❌ NEXT_PUBLIC_SITE_URL unset on Vercel"]
    Issue1 --> Effect1["Canonical = http://localhost:3000<br/>Sitemap URLs = localhost<br/>robots.txt Host = localhost<br/>OG og:url = localhost<br/>JSON-LD URLs = localhost"]
    Effect1 --> Action1["FIX: Set in Vercel<br/>NEXT_PUBLIC_SITE_URL=https://escaleadsagency.vercel.app"]

    Issue2["❌ /favicon.ico → 404"]
    Issue2 --> Effect2["No tab icon, no Google snippet icon"]
    Effect2 --> Action2["FIX: Place favicon.ico in public/<br/>or update icons.icon = /logo-icon.png"]

    Issue3["❌ /og-image.png → 404"]
    Issue3 --> Effect3["No social share preview<br/>(LinkedIn, Slack, FB, Twitter)"]
    Effect3 --> Action3["FIX: Add 1200×630 og-image.png<br/>(or use existing /logo-icon.png as fallback)"]

    Issue4["❌ /apple-touch-icon.png → 404"]
    Issue4 --> Effect4["iOS home-screen icon missing"]
    Effect4 --> Action4["FIX: Add 180×180 png<br/>or point icons.apple to /logo-icon.png"]
```

### 🟡 High — incomplete SEO

| # | Issue | Fix |
|---|---|---|
| 5 | Sitemap missing `/services`, `/how-it-works`, `/our-work`, `/contact` | Add to `app/sitemap.ts` |
| 6 | No `og:image` in `<head>` anywhere | Add `openGraph.images` to root `metadata` |
| 7 | Sub-pages don't override Twitter card → every page tweets the homepage title | Add `twitter` per-page metadata |
| 8 | `searchAction` in WebSite JSON-LD points to `/blogs?q=` which isn't implemented | Remove (or implement search) |
| 9 | `sameAs: []` empty in Organization JSON-LD | Remove or populate with real social URLs |
| 10 | `/services`, `/how-it-works`, `/our-work`, `/contact` have NO `<h1>` (section components use `<h2>` because the homepage hero owns the page h1) | Either add page-level `<h1>` wrapper to each route OR add `as` prop to sections |

### 🟢 Already good

- Article + BreadcrumbList JSON-LD on `/blogs/[slug]` ✓
- Organization + WebSite JSON-LD globally ✓
- Per-page `title` + `description` + `canonical` (mechanically correct, just localhost-poisoned) ✓
- Security headers (CSP, HSTS, X-Frame-Options, Referrer-Policy, Permissions-Policy) on every response ✓
- `robots.txt` disallows admin + `/api` ✓
- All rendered `<Image>` components have `alt` text ✓
- Mobile viewport, theme color, format-detection meta ✓
- GA4 with manual SPA pageview hook (admin paths skipped) ✓
- Modal route is **not** in the SEO surface (intercepting routes only fire on client-side nav) ✓
- `/blogs/[slug]` pinned to `runtime = 'nodejs'` so ISR renders don't fall through to Edge ✓
