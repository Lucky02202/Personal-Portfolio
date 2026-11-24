# Laxmikant Patil — personal site

A personal website: portfolio, blog, resource library, and a living "Currently" section, all managed from a private dashboard.

- **Next.js 16** (App Router, Cache Components) · **TypeScript** · **Tailwind CSS 4**
- **Supabase** for Postgres, authentication and file storage
- Markdown posts, rendered on the server with syntax highlighting
- Very little client-side JavaScript: a handful of small interactive islands

See [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) for why it's built this way.

---

## Quick start (no database needed)

```bash
npm install
npm run dev
```

Open http://localhost:3000. Without Supabase configured, the site serves the bundled starter content from `src/content/seed.ts`, so you can work on the design straight away. The admin at `/admin` shows setup instructions until you connect Supabase.

## Make it yours

Search the codebase for `TODO`. The main places to edit:

| What | Where |
| --- | --- |
| Name, role, location, email, socials, résumé link | `src/content/site.ts` → `site`, `socials` |
| Hero line, About page text, approach, interests | `src/content/site.ts` → `hero`, `about` |
| Journey timeline (education → now → next) | `src/content/site.ts` → `journey` |
| Tech stack groups | `src/content/site.ts` → `stack` |
| Your CV | put it at `public/files/resume.pdf` |
| Posts, projects, downloads, experience, "Currently" | the admin dashboard (`/admin`) |

The starter posts, projects and experience are examples written to show the features. Edit or delete them, and in particular review the professional project and experience entries so every claim is accurate.

## Connect Supabase (enables the admin)

1. **Create a project** at [supabase.com](https://supabase.com) (the free tier is fine).
2. **Run the schema.** Open *SQL Editor*, paste the contents of `supabase/migrations/0001_init.sql`, and run it. It creates the tables, row-level security policies and the `media` storage bucket. It's safe to re-run.
3. **Create your login.** In *Authentication → Users*, click *Add user* and create yourself with an email and password.
4. **Turn off public sign-ups.** In *Authentication → Sign In / Providers*, disable "Allow new users to sign up". (Even if someone did sign up, they'd have no rights. This just keeps the user list clean.)
5. **Make yourself an admin.** Copy your user's UID and run:
   ```sql
   insert into public.admins (user_id) values ('YOUR-USER-UID');
   ```
6. **Set environment variables.** Copy `.env.example` to `.env.local` and fill in `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` (*Project Settings → API Keys*).
7. **Restart** `npm run dev`, go to `/admin`, sign in, and click **Import starter content** to copy the examples into your database. From then on, the database is the source of truth.

## Writing and publishing

- **Posts** (`/admin/posts`): Markdown editor with a toolbar, keyboard shortcuts (⌘B, ⌘I, ⌘K, ⌘E, ⌘S to save), paste/drag-and-drop image upload, and Write / Split / Preview modes. The preview uses the exact renderer the public site uses.
  - **Save draft**: never visible publicly.
  - **Publish**: live immediately (the public cache is refreshed on save).
  - **Schedule**: pick a future publish date, then press *Schedule*. The post appears automatically within about 15 minutes of that time.
  - **Unpublish**: back to draft.
- **Currently** (`/admin/now`): what you're building, learning, exploring, reading and writing. Items marked *Rotate in the hero ticker* appear in the homepage hero.
- **Projects**: set *Visibility* to **Confidential** for professional work. Links, cover images and screenshots are then stripped on the server and never sent to visitors, even if those fields are filled in.
- **Downloads**: upload any file up to 50 MB. Type and size are detected automatically, and downloads are counted.
- **Inbox**: messages from the contact form.

## Deploying (Vercel)

1. Push this repo to GitHub and import it in Vercel.
2. Add the environment variables from `.env.example` (including `NEXT_PUBLIC_SITE_URL`).
3. Deploy. In Supabase → *Authentication → URL Configuration*, set the Site URL to your domain.

Any Node host works too (`npm run build && npm start`).

## Scripts

```bash
npm run dev        # local development
npm run build      # production build
npm run start      # serve the production build
npm run lint       # ESLint
npm run typecheck  # TypeScript
```

## Project structure

```
src/
  app/
    (site)/            public pages: home, about, projects, experience, blog, downloads, contact
    admin/             dashboard: login + (panel)/… (auth-gated)
    rss.xml/ sitemap.ts robots.ts opengraph-image.tsx
  components/          UI, grouped by area (site, home, blog, projects, downloads, admin, ui)
  content/
    site.ts            static profile content (edit this)
    seed.ts            starter content / fallback when no database
  lib/
    content/queries.ts public data layer (cached, tagged)
    admin/             auth checks, server actions, collection schemas, uploads
    markdown.ts        Markdown → sanitized, highlighted HTML
    supabase/          clients: public (cached reads), server (session), browser (uploads)
  proxy.ts             session refresh + redirect for /admin
supabase/migrations/   database schema + RLS policies
```
