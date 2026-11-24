-- =============================================================================
-- Personal site schema
--
-- Security model
--   * Every table has row-level security (RLS) enabled.
--   * Anonymous visitors can only SELECT published content (and INSERT a
--     contact message). They can never update or delete anything.
--   * Writes require is_admin(): the signed-in user's id must be in
--     public.admins. Signing up alone grants nothing.
--   * The app never uses the service-role key, so these policies are the
--     final authority even if application code has a bug.
-- =============================================================================

create extension if not exists pgcrypto;

-- --------------------------------------------------------------------------
-- Admins
-- --------------------------------------------------------------------------
create table if not exists public.admins (
  user_id    uuid primary key references auth.users (id) on delete cascade,
  created_at timestamptz not null default now()
);
alter table public.admins enable row level security;

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (select 1 from public.admins where user_id = (select auth.uid()));
$$;

revoke all on function public.is_admin() from public;
grant execute on function public.is_admin() to anon, authenticated;

-- Admins can see the admin list (used to confirm their own access); nobody can
-- change it through the API. Add yourself in the SQL editor (see README).
drop policy if exists "admins read" on public.admins;
create policy "admins read" on public.admins for select to authenticated using (public.is_admin());

-- --------------------------------------------------------------------------
-- updated_at helper
-- --------------------------------------------------------------------------
create or replace function public.touch_updated_at()
returns trigger language plpgsql set search_path = '' as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- --------------------------------------------------------------------------
-- Categories
-- --------------------------------------------------------------------------
create table if not exists public.categories (
  id          uuid primary key default gen_random_uuid(),
  slug        text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  name        text not null check (char_length(name) between 1 and 60),
  description text,
  sort        int not null default 0
);

-- --------------------------------------------------------------------------
-- Posts
-- --------------------------------------------------------------------------
create table if not exists public.posts (
  id              uuid primary key default gen_random_uuid(),
  slug            text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  title           text not null check (char_length(title) between 1 and 200),
  subtitle        text,
  content         text not null default '',
  cover_url       text,
  cover_alt       text,
  category        text references public.categories (slug) on update cascade on delete set null,
  tags            text[] not null default '{}',
  status          text not null default 'draft' check (status in ('draft', 'published')),
  published_at    timestamptz,
  featured        boolean not null default false,
  reading_minutes int check (reading_minutes is null or reading_minutes > 0),
  seo_title       text,
  seo_description text,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),
  constraint published_needs_date check (status = 'draft' or published_at is not null)
);
create index if not exists posts_live_idx on public.posts (status, published_at desc);

-- --------------------------------------------------------------------------
-- Projects
-- --------------------------------------------------------------------------
create table if not exists public.projects (
  id          uuid primary key default gen_random_uuid(),
  slug        text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  title       text not null,
  summary     text not null default '',
  description text not null default '',
  category    text not null default 'personal'
              check (category in ('professional', 'personal', 'experiment', 'open-source')),
  status      text not null default 'building'
              check (status in ('building', 'shipped', 'maintained', 'paused', 'archived')),
  visibility  text not null default 'public' check (visibility in ('public', 'confidential')),
  role        text,
  tech        text[] not null default '{}',
  cover_url   text,
  images      jsonb not null default '[]'::jsonb,
  github_url  text,
  demo_url    text,
  started_at  date,
  ended_at    date,
  learnings   text[] not null default '{}',
  challenges  text[] not null default '{}',
  outcome     text,
  featured    boolean not null default false,
  published   boolean not null default false,
  sort        int not null default 0,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- --------------------------------------------------------------------------
-- Downloads (files live in the "media" storage bucket)
-- --------------------------------------------------------------------------
create table if not exists public.downloads (
  id             uuid primary key default gen_random_uuid(),
  slug           text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  title          text not null,
  description    text not null default '',
  category       text not null default 'General',
  file_url       text not null,
  file_name      text,
  file_type      text not null default 'pdf',
  file_size      bigint,
  preview_url    text,
  published      boolean not null default false,
  download_count int not null default 0,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

-- Counting downloads is the only write anonymous visitors can trigger, and only
-- through this function (which can do nothing but add 1).
create or replace function public.increment_download(p_slug text)
returns void language sql security definer set search_path = '' as $$
  update public.downloads set download_count = download_count + 1
  where slug = p_slug and published;
$$;
revoke all on function public.increment_download(text) from public;
grant execute on function public.increment_download(text) to anon, authenticated;

-- --------------------------------------------------------------------------
-- Experience
-- --------------------------------------------------------------------------
create table if not exists public.experience (
  id               uuid primary key default gen_random_uuid(),
  company          text not null,
  role             text not null,
  location         text,
  employment_type  text,
  start_date       date not null,
  end_date         date,
  description      text,
  responsibilities text[] not null default '{}',
  contributions    text[] not null default '{}',
  tech             text[] not null default '{}',
  published        boolean not null default true,
  sort             int not null default 0,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

-- --------------------------------------------------------------------------
-- "Currently" items
-- --------------------------------------------------------------------------
create table if not exists public.now_items (
  id         uuid primary key default gen_random_uuid(),
  kind       text not null check (kind in ('building', 'learning', 'exploring', 'reading', 'writing')),
  title      text not null,
  detail     text,
  href       text,
  highlight  boolean not null default false,
  published  boolean not null default true,
  sort       int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- --------------------------------------------------------------------------
-- Contact messages
-- --------------------------------------------------------------------------
create table if not exists public.messages (
  id         uuid primary key default gen_random_uuid(),
  name       text not null check (char_length(name) between 1 and 120),
  email      text not null check (char_length(email) between 3 and 254 and email ~ '^[^@\s]+@[^@\s]+\.[^@\s]+$'),
  subject    text check (subject is null or char_length(subject) <= 200),
  body       text not null check (char_length(body) between 1 and 5000),
  read       boolean not null default false,
  created_at timestamptz not null default now()
);

-- --------------------------------------------------------------------------
-- Triggers
-- --------------------------------------------------------------------------
do $$
declare t text;
begin
  foreach t in array array['posts', 'projects', 'downloads', 'experience', 'now_items'] loop
    execute format('drop trigger if exists touch_%1$s on public.%1$s', t);
    execute format(
      'create trigger touch_%1$s before update on public.%1$s for each row execute function public.touch_updated_at()', t);
  end loop;
end $$;

-- --------------------------------------------------------------------------
-- Row-level security
-- --------------------------------------------------------------------------
alter table public.categories enable row level security;
alter table public.posts      enable row level security;
alter table public.projects   enable row level security;
alter table public.downloads  enable row level security;
alter table public.experience enable row level security;
alter table public.now_items  enable row level security;
alter table public.messages   enable row level security;

-- Public reads: published content only. Scheduled posts stay hidden until their time.
drop policy if exists "public read" on public.categories;
create policy "public read" on public.categories for select using (true);

drop policy if exists "public read" on public.posts;
create policy "public read" on public.posts for select
  using (status = 'published' and published_at <= now());

drop policy if exists "public read" on public.projects;
create policy "public read" on public.projects for select using (published);

drop policy if exists "public read" on public.downloads;
create policy "public read" on public.downloads for select using (published);

drop policy if exists "public read" on public.experience;
create policy "public read" on public.experience for select using (published);

drop policy if exists "public read" on public.now_items;
create policy "public read" on public.now_items for select using (published);

-- Admins: full access to content tables.
do $$
declare t text;
begin
  foreach t in array array['categories', 'posts', 'projects', 'downloads', 'experience', 'now_items', 'messages'] loop
    execute format('drop policy if exists "admin all" on public.%I', t);
    execute format(
      'create policy "admin all" on public.%I for all to authenticated using (public.is_admin()) with check (public.is_admin())', t);
  end loop;
end $$;

-- Anyone can send a message (validated by the check constraints above),
-- but nobody except admins can read them.
drop policy if exists "anyone can send" on public.messages;
create policy "anyone can send" on public.messages for insert to anon, authenticated
  with check (read = false);

-- Table privileges (RLS still applies on top of these).
grant select on public.categories, public.posts, public.projects, public.downloads,
  public.experience, public.now_items to anon, authenticated;
grant insert on public.messages to anon, authenticated;
grant select, insert, update, delete on public.categories, public.posts, public.projects,
  public.downloads, public.experience, public.now_items, public.messages to authenticated;
grant select on public.admins to authenticated;

-- --------------------------------------------------------------------------
-- Storage: one public bucket for covers, screenshots and downloadable files.
-- Files are public to read (they're published content); only admins can write.
-- --------------------------------------------------------------------------
insert into storage.buckets (id, name, public, file_size_limit)
values ('media', 'media', true, 52428800) -- 50 MB
on conflict (id) do update set public = excluded.public, file_size_limit = excluded.file_size_limit;

drop policy if exists "media admin insert" on storage.objects;
create policy "media admin insert" on storage.objects for insert to authenticated
  with check (bucket_id = 'media' and public.is_admin());

drop policy if exists "media admin update" on storage.objects;
create policy "media admin update" on storage.objects for update to authenticated
  using (bucket_id = 'media' and public.is_admin()) with check (bucket_id = 'media' and public.is_admin());

drop policy if exists "media admin delete" on storage.objects;
create policy "media admin delete" on storage.objects for delete to authenticated
  using (bucket_id = 'media' and public.is_admin());
