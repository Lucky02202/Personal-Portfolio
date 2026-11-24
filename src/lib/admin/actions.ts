"use server";

import { updateTag } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { adminDb } from "./auth";
import { getCollection, type Collection, type Field } from "./collections";
import { renderMarkdown } from "@/lib/markdown";
import { serverClient } from "@/lib/supabase/server";
import { TAGS } from "@/lib/content/queries";
import { isSupabaseConfigured } from "@/lib/env";
import {
  seedCategories,
  seedDownloads,
  seedExperience,
  seedNow,
  seedPosts,
  seedProjects,
} from "@/content/seed";

/**
 * Every action here:
 *  1. calls adminDb(), which verifies the session AND admin membership server-side,
 *  2. validates its input with zod (the browser is never trusted),
 *  3. writes as the signed-in user, so Postgres RLS checks is_admin() again,
 *  4. refreshes the affected cache tags so the public site updates immediately.
 */

export type ActionResult<T = object> = ({ ok: true } & T) | { ok: false; error: string; fieldErrors?: Record<string, string> };

const slugRe = /^[a-z0-9]+(-[a-z0-9]+)*$/;
const httpUrl = z
  .string()
  .trim()
  .url()
  .refine((u) => /^https?:\/\//i.test(u), "Must start with http:// or https://");
const assetUrl = z
  .string()
  .trim()
  .refine((u) => /^https?:\/\//i.test(u) || /^\/(?!\/)/.test(u), "Must be an https:// URL or a /path");
const emptyToNull = (v: unknown) => (v === "" || v === undefined ? null : v);

function friendly(error: { message: string; code?: string }) {
  if (error.code === "23505") return "That slug is already in use. Pick another one.";
  if (error.code === "42501") return "You don't have permission to do that.";
  return error.message;
}

// ---------------------------------------------------------------------------
// Generic collections
// ---------------------------------------------------------------------------

function fieldSchema(f: Field): z.ZodTypeAny {
  const opt = (s: z.ZodTypeAny) => (f.required ? s : z.preprocess(emptyToNull, s.nullable()));
  switch (f.type) {
    case "text":
    case "textarea":
      return f.required ? z.string().trim().min(1, `${f.label} is required`).max(5000) : opt(z.string().trim().max(5000));
    case "markdown":
      return z.string().max(200_000).default("");
    case "slug":
      return z.string().trim().regex(slugRe, "Lowercase letters, numbers and dashes only");
    case "select":
      return z.enum((f.options ?? []).map((o) => o.value) as [string, ...string[]]);
    case "tags":
    case "lines":
      return z.array(z.string().trim().min(1).max(500)).max(100).default([]);
    case "date":
      return opt(z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Use YYYY-MM-DD"));
    case "url":
      return opt(httpUrl);
    case "href":
    case "image":
      return opt(assetUrl);
    case "images":
      return z.array(z.object({ url: assetUrl, alt: z.string().trim().max(300).default("") })).max(30).default([]);
    case "file":
      return z.object({
        url: assetUrl,
        name: z.string().max(300).nullable(),
        type: z.string().trim().toLowerCase().max(12),
        size: z.number().int().nonnegative().nullable(),
      });
    case "boolean":
      return z.boolean().default(false);
    case "number":
      return z.coerce.number().int().min(-100000).max(100000).default(0);
  }
}

function buildValidator(c: Collection) {
  return z.object(Object.fromEntries(c.fields.map((f) => [f.name, fieldSchema(f)])));
}

/** Map validated form values onto table columns (the file field expands to four columns). */
function toRow(c: Collection, values: Record<string, unknown>) {
  const row: Record<string, unknown> = {};
  for (const f of c.fields) {
    const v = values[f.name];
    if (f.type === "file") {
      const file = v as { url: string; name: string | null; type: string; size: number | null };
      Object.assign(row, { file_url: file.url, file_name: file.name, file_type: file.type, file_size: file.size });
    } else row[f.name] = v;
  }
  return row;
}

function refresh(c: Collection, rows: Record<string, unknown>[]) {
  c.tags.forEach((t) => updateTag(t));
  if (c.key === "projects") rows.forEach((r) => r.slug && updateTag(`project:${r.slug}`));
}

export async function saveRecord(
  key: string,
  id: string | null,
  values: Record<string, unknown>,
): Promise<ActionResult<{ id: string }>> {
  const c = getCollection(key);
  if (!c) return { ok: false, error: "Unknown collection" };
  const db = await adminDb();

  const parsed = buildValidator(c).safeParse(values);
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) fieldErrors[String(issue.path[0])] ??= issue.message;
    return { ok: false, error: "Please fix the highlighted fields.", fieldErrors };
  }
  const row = toRow(c, parsed.data);

  const before = id ? (await db.from(c.table).select("*").eq("id", id).maybeSingle()).data : null;
  const query = id ? db.from(c.table).update(row).eq("id", id) : db.from(c.table).insert(row);
  const { data, error } = await query.select("*").single();
  if (error) return { ok: false, error: friendly(error) };

  refresh(c, [data, ...(before ? [before] : [])]);
  return { ok: true, id: data.id as string };
}

export async function deleteRecord(key: string, id: string): Promise<ActionResult> {
  const c = getCollection(key);
  if (!c) return { ok: false, error: "Unknown collection" };
  const db = await adminDb();
  const { data, error } = await db.from(c.table).delete().eq("id", id).select("*");
  if (error) return { ok: false, error: friendly(error) };
  refresh(c, data ?? []);
  return { ok: true };
}

// ---------------------------------------------------------------------------
// Posts
// ---------------------------------------------------------------------------

const postSchema = z.object({
  title: z.string().trim().min(1, "Give it a title").max(200),
  slug: z.string().trim().regex(slugRe, "Lowercase letters, numbers and dashes only").max(100),
  subtitle: z.preprocess(emptyToNull, z.string().trim().max(400).nullable()),
  content: z.string().max(500_000),
  cover_url: z.preprocess(emptyToNull, assetUrl.nullable()),
  cover_alt: z.preprocess(emptyToNull, z.string().trim().max(300).nullable()),
  category: z.preprocess(emptyToNull, z.string().regex(slugRe).nullable()),
  tags: z.array(z.string().trim().toLowerCase().min(1).max(40)).max(20),
  status: z.enum(["draft", "published"]),
  published_at: z.preprocess(emptyToNull, z.string().datetime({ offset: true }).nullable()),
  featured: z.boolean(),
  reading_minutes: z.preprocess(emptyToNull, z.coerce.number().int().min(1).max(600).nullable()),
  seo_title: z.preprocess(emptyToNull, z.string().trim().max(200).nullable()),
  seo_description: z.preprocess(emptyToNull, z.string().trim().max(320).nullable()),
});

export type PostInput = z.input<typeof postSchema>;

export async function savePost(id: string | null, input: PostInput): Promise<ActionResult<{ id: string; slug: string; published_at: string | null }>> {
  const db = await adminDb();
  const parsed = postSchema.safeParse(input);
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) fieldErrors[String(issue.path[0])] ??= issue.message;
    return { ok: false, error: Object.values(fieldErrors)[0] ?? "Invalid post", fieldErrors };
  }
  const row = { ...parsed.data };
  // Publishing without a date means "now". Unpublishing keeps the date for reference.
  if (row.status === "published" && !row.published_at) row.published_at = new Date().toISOString();

  const before = id ? (await db.from("posts").select("slug").eq("id", id).maybeSingle()).data : null;
  const query = id ? db.from("posts").update(row).eq("id", id) : db.from("posts").insert(row);
  const { data, error } = await query.select("id, slug, published_at").single();
  if (error) return { ok: false, error: friendly(error) };

  updateTag(TAGS.posts);
  updateTag(`post:${data.slug}`);
  if (before?.slug && before.slug !== data.slug) updateTag(`post:${before.slug}`);
  return { ok: true, id: data.id, slug: data.slug, published_at: data.published_at };
}

export async function deletePost(id: string): Promise<ActionResult> {
  const db = await adminDb();
  const { data, error } = await db.from("posts").delete().eq("id", id).select("slug");
  if (error) return { ok: false, error: friendly(error) };
  updateTag(TAGS.posts);
  data?.forEach((p) => updateTag(`post:${p.slug}`));
  return { ok: true };
}

/** Render Markdown with the exact pipeline used on the public site. */
export async function previewMarkdown(markdown: string) {
  await adminDb();
  return renderMarkdown(markdown.slice(0, 500_000));
}

// ---------------------------------------------------------------------------
// Messages
// ---------------------------------------------------------------------------

export async function setMessageRead(id: string, read: boolean): Promise<ActionResult> {
  const db = await adminDb();
  const { error } = await db.from("messages").update({ read }).eq("id", id);
  return error ? { ok: false, error: friendly(error) } : { ok: true };
}

export async function deleteMessage(id: string): Promise<ActionResult> {
  const db = await adminDb();
  const { error } = await db.from("messages").delete().eq("id", id);
  return error ? { ok: false, error: friendly(error) } : { ok: true };
}

// ---------------------------------------------------------------------------
// Starter content
// ---------------------------------------------------------------------------

/** Copies the bundled starter content into empty tables. Never overwrites anything. */
export async function importStarterContent(): Promise<ActionResult<{ imported: string[] }>> {
  const db = await adminDb();
  const strip = <T extends { id: string }>(rows: T[]) =>
    rows.map((r) => {
      const { id, ...rest } = r as T & { created_at?: string; updated_at?: string };
      void id;
      delete rest.created_at;
      delete rest.updated_at;
      return rest;
    });

  const plan: [string, Record<string, unknown>[]][] = [
    ["categories", strip(seedCategories)],
    ["posts", strip(seedPosts)],
    ["projects", strip(seedProjects)],
    ["downloads", strip(seedDownloads)],
    ["experience", strip(seedExperience)],
    ["now_items", strip(seedNow)],
  ];

  const imported: string[] = [];
  for (const [table, rows] of plan) {
    const { count, error: countError } = await db.from(table).select("id", { count: "exact", head: true });
    if (countError) return { ok: false, error: `${table}: ${countError.message}` };
    if ((count ?? 0) > 0) continue;
    const { error } = await db.from(table).insert(rows);
    if (error) return { ok: false, error: `${table}: ${error.message}` };
    imported.push(table);
  }
  Object.values(TAGS).forEach((t) => updateTag(t));
  return { ok: true, imported };
}

// ---------------------------------------------------------------------------
// Auth
// ---------------------------------------------------------------------------

export async function signIn(_prev: { error?: string }, form: FormData): Promise<{ error?: string }> {
  if (!isSupabaseConfigured) return { error: "Supabase isn't configured yet. See the README." };
  const parsed = z
    .object({ email: z.string().trim().email(), password: z.string().min(1).max(200) })
    .safeParse({ email: form.get("email"), password: form.get("password") });
  if (!parsed.success) return { error: "Enter your email and password." };

  const db = await serverClient();
  const { error } = await db.auth.signInWithPassword(parsed.data);
  // Same message for every failure, so the form doesn't reveal which emails exist.
  if (error) return { error: "Those details didn't work." };

  const { data: isAdmin } = await db.rpc("is_admin");
  if (!isAdmin) {
    await db.auth.signOut();
    return { error: "This account doesn't have admin access." };
  }
  redirect("/admin");
}

export async function signOut() {
  if (isSupabaseConfigured) {
    const db = await serverClient();
    await db.auth.signOut();
  }
  redirect("/admin/login");
}
