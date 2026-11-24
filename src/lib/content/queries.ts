import "server-only";
import { cacheLife, cacheTag } from "next/cache";
import { publicClient } from "@/lib/supabase/public";
import { renderMarkdown } from "@/lib/markdown";
import { readingTime } from "@/lib/utils";
import {
  seedCategories,
  seedDownloads,
  seedExperience,
  seedNow,
  seedPosts,
  seedProjects,
} from "@/content/seed";
import type { Category, Download, Experience, NowItem, Post, Project } from "@/lib/types";

/**
 * Public data access layer.
 *
 * Every function is `'use cache'` + tagged, so pages prerender into the static
 * shell and stay fast. The admin calls `updateTag(tag)` after each write, so
 * changes show up immediately.
 *
 * When Supabase isn't configured, the same functions serve the starter content.
 */

export const TAGS = {
  posts: "posts",
  categories: "categories",
  projects: "projects",
  downloads: "downloads",
  experience: "experience",
  now: "now",
} as const;

/**
 * Content is refreshed on demand by the admin (updateTag), and in the background
 * every 15 minutes. That background refresh is what makes scheduled posts
 * appear on their own, without a cron job.
 */
const CONTENT_LIFE = { stale: 300, revalidate: 900, expire: 60 * 60 * 24 * 7 };

export type PostSummary = Omit<Post, "content"> & { reading_minutes: number };

function fail(what: string, error: { message: string }): never {
  throw new Error(`Failed to load ${what}: ${error.message}`);
}

function isLive(p: Pick<Post, "status" | "published_at">, now: number) {
  return p.status === "published" && !!p.published_at && new Date(p.published_at).getTime() <= now;
}

function summarize(post: Post): PostSummary {
  const { content, ...rest } = post;
  return { ...rest, reading_minutes: readingTime(content, post.reading_minutes) };
}

/**
 * Confidential projects never send links or screenshots to the client. This is
 * enforced here, on the server, rather than by hiding things in the UI.
 */
function toPublicProject(p: Project): Project {
  if (p.visibility !== "confidential") return p;
  return { ...p, github_url: null, demo_url: null, images: [], cover_url: null };
}

async function loadPosts(): Promise<Post[]> {
  const db = publicClient();
  if (!db) {
    const now = Date.now();
    return seedPosts.filter((p) => isLive(p, now));
  }
  const { data, error } = await db
    .from("posts")
    .select("*")
    .eq("status", "published")
    .lte("published_at", new Date().toISOString())
    .order("published_at", { ascending: false });
  if (error) fail("posts", error);
  return data as Post[];
}

export async function getPosts(): Promise<PostSummary[]> {
  "use cache";
  cacheLife(CONTENT_LIFE);
  cacheTag(TAGS.posts);
  const posts = await loadPosts();
  return posts
    .map(summarize)
    .sort((a, b) => +new Date(b.published_at!) - +new Date(a.published_at!));
}

export async function getPost(slug: string) {
  "use cache";
  cacheLife(CONTENT_LIFE);
  cacheTag(TAGS.posts, `post:${slug}`);
  const posts = await loadPosts();
  const post = posts.find((p) => p.slug === slug);
  if (!post) return null;
  const { html, toc } = await renderMarkdown(post.content);
  return { post: summarize(post), html, toc };
}

export async function getCategories(): Promise<Category[]> {
  "use cache";
  cacheLife(CONTENT_LIFE);
  cacheTag(TAGS.categories);
  const db = publicClient();
  if (!db) return seedCategories;
  const { data, error } = await db.from("categories").select("*").order("sort");
  if (error) fail("categories", error);
  return data as Category[];
}

export async function getProjects(): Promise<Project[]> {
  "use cache";
  cacheLife(CONTENT_LIFE);
  cacheTag(TAGS.projects);
  const db = publicClient();
  let rows: Project[];
  if (!db) rows = seedProjects.filter((p) => p.published);
  else {
    const { data, error } = await db.from("projects").select("*").eq("published", true).order("sort");
    if (error) fail("projects", error);
    rows = data as Project[];
  }
  return rows.map(toPublicProject).sort((a, b) => a.sort - b.sort);
}

export async function getProject(slug: string) {
  "use cache";
  cacheLife(CONTENT_LIFE);
  cacheTag(TAGS.projects, `project:${slug}`);
  const projects = await getProjects();
  const project = projects.find((p) => p.slug === slug);
  if (!project) return null;
  const { html } = await renderMarkdown(project.description || "");
  return { project, html };
}

export async function getDownloads(): Promise<Download[]> {
  "use cache";
  cacheLife(CONTENT_LIFE);
  cacheTag(TAGS.downloads);
  const db = publicClient();
  if (!db) return seedDownloads.filter((d) => d.published);
  const { data, error } = await db
    .from("downloads")
    .select("*")
    .eq("published", true)
    .order("created_at", { ascending: false });
  if (error) fail("downloads", error);
  return data as Download[];
}

export async function getExperience(): Promise<Experience[]> {
  "use cache";
  cacheLife(CONTENT_LIFE);
  cacheTag(TAGS.experience);
  const db = publicClient();
  let rows: Experience[];
  if (!db) rows = seedExperience.filter((e) => e.published);
  else {
    const { data, error } = await db.from("experience").select("*").eq("published", true);
    if (error) fail("experience", error);
    rows = data as Experience[];
  }
  // Current roles first, then most recent start date; `sort` breaks ties.
  return rows.sort(
    (a, b) =>
      Number(!!a.end_date) - Number(!!b.end_date) ||
      +new Date(b.start_date) - +new Date(a.start_date) ||
      a.sort - b.sort,
  );
}

export async function getNow(): Promise<{ items: NowItem[]; updatedAt: string | null }> {
  "use cache";
  cacheLife(CONTENT_LIFE);
  cacheTag(TAGS.now);
  const db = publicClient();
  let items: NowItem[];
  if (!db) items = seedNow.filter((n) => n.published);
  else {
    const { data, error } = await db.from("now_items").select("*").eq("published", true).order("sort");
    if (error) fail("now items", error);
    items = data as NowItem[];
  }
  const updatedAt = items.reduce<string | null>(
    (max, i) => (!max || i.updated_at > max ? i.updated_at : max),
    null,
  );
  return { items, updatedAt };
}
