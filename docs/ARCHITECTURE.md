# Architecture

## Goals, in priority order

1. **Easy to maintain for years.** Content changes shouldn't need code changes.
2. **Secure by default.** The admin can't be faked, and a bug in the app can't leak drafts or allow writes.
3. **Fast.** Public pages are prerendered and served from cache, with very little JavaScript.
4. **Cheap and simple to run.** One app and one managed backend, both with free tiers.

## The choice: Next.js + Supabase

| Option considered | Why not |
| --- | --- |
| Markdown/MDX files in git | Great for developers, but every post needs a commit. No drafts/scheduling UI, no uploads, no inbox. |
| Headless CMS (Sanity, Contentful…) | A second product to learn, its own editor and pricing tiers, and less control over the data model. |
| Git-based CMS (Keystatic, Decap) | Good middle ground, but scheduling, download counts and a contact inbox still need a database. |
| **Supabase** | Postgres, auth and file storage in one free service. Row-level security puts the security rules in the database itself. Standard SQL, so it's portable. |

## Content: database vs. code

| Lives in | Content | Why |
| --- | --- | --- |
| **Database** (edited in `/admin`) | posts, categories, projects, downloads (+ files in storage), experience, "Currently" items, contact messages | Changes often. Benefits from drafts, scheduling and uploads. |
| **Code** (`src/content/site.ts`) | name, bio, socials, About text, journey timeline, tech stack, nav | Changes rarely. Typed, reviewable, zero runtime cost. Can move to a `settings` table later without touching the UI. |

The UI never hardcodes content. Components receive typed data (`src/lib/types.ts`) from the data layer (`src/lib/content/queries.ts`).

## Rendering and caching

- Every public read goes through a `'use cache'` function that is tagged (`posts`, `projects`, …) and uses a 15-minute background revalidation profile.
- Pages built only from cached data are **prerendered into static HTML** at build time (see the `next build` output).
- Admin saves call `updateTag(tag)` in the server action, so the public site reflects the change on the next request.
- **Scheduled posts:** a post is "published with a future `published_at`". The database policy hides it until that time. The 15-minute background refresh picks it up, so there's no cron job.
- Search and filtering on `/blog`, `/projects` and `/downloads` run client-side over the prerendered list (post bodies aren't included), so those pages stay static.
- Reveal-on-scroll is pure CSS (scroll-driven animations). The card spotlight and code-copy buttons are handled by one small inline script, so they add no hydration cost.

## Security model

Defence in depth: each layer would be enough on its own for its job.

1. **Database (the real boundary).** Every table has RLS. Anonymous users can only `select` published rows and `insert` a contact message (which they can't read back). Writes require `is_admin()`, meaning your user id is in `public.admins`. Signing up grants nothing, and nobody can add themselves to `admins` through the API.
2. **No service-role key.** The app only ever uses the public (anon/publishable) key, so the policies above always apply, even to the admin. The admin's writes run as the signed-in user.
3. **Server checks.** Every admin page calls `requireAdmin()`, and every server action calls `adminDb()`. Both validate the session with Supabase Auth (`getUser()`, which hits the auth server, so forged cookies fail) and check admin membership.
4. **Proxy (`src/proxy.ts`).** Refreshes the session and redirects signed-out visitors to the login page. This is a convenience, not the boundary.
5. **Input validation.** Every action validates with zod. URLs must be `http(s)` or site-relative, which blocks `javascript:` links.
6. **Markdown sanitization.** Raw HTML in posts is dropped and the output is sanitized before highlighting, so post content can't inject scripts.
7. **Confidential projects** are stripped of links and images in the data layer, on the server, before rendering.
8. **Contact form:** honeypot field, per-IP rate limit, and database check constraints on length and email format.

The migration's policies were tested against Postgres 16 with simulated `anon`, non-admin and admin sessions (33 checks covering reads, writes, messages, storage uploads and admin escalation).

## Extending it later

The architecture leaves room for these without restructuring:

| Feature | How |
| --- | --- |
| Newsletter | `subscribers` table with an anon insert policy (like `messages`), plus a form on the blog. |
| Comments / guestbook | Table with `approved boolean`. Public select where approved, admin moderation in a new collection entry. |
| Now / Uses / Reading list pages | New table + an entry in `src/lib/admin/collections.ts` gives you the admin UI for free. Then add a page. |
| Project changelogs | `project_updates (project_id, date, body)` table, rendered on the project page. |
| GitHub activity, Spotify | A cached server function (`'use cache'` + `cacheLife('hours')`) that calls the API, rendered in a Suspense boundary. |
| Analytics | Vercel Analytics or Plausible: one script, no code changes elsewhere. |
| Search across the site | The client-side search works for hundreds of posts. Beyond that, use Postgres full-text search (`to_tsvector`) via an RPC. |
| Résumé generator | Experience and profile data are already structured. Add a print-styled `/resume` page. |
| Multi-language | `next-intl` or route groups per locale. Content tables get a `locale` column. |

**Adding a collection:** create the table and policies in a new migration, add an entry to `collections.ts` (fields drive the form and validation), add a cache tag and a query in `queries.ts`, then build the public page.
