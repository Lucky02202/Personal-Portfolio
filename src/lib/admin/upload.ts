"use client";

import { browserClient } from "@/lib/supabase/browser";
import { MEDIA_BUCKET } from "@/lib/env";
import { slugify } from "@/lib/utils";

export interface Uploaded {
  url: string;
  path: string;
  name: string;
  size: number;
  ext: string;
}

const MAX = 50 * 1024 * 1024;

/**
 * Uploads straight from the browser to Supabase Storage as the signed-in user.
 * Storage RLS only lets admins write to the bucket, so this is safe without a
 * server hop (and avoids sending large files through a serverless function).
 */
export async function uploadFile(file: File, folder: "images" | "files" = "images"): Promise<Uploaded> {
  if (file.size > MAX) throw new Error("Files must be 50 MB or smaller.");
  if (folder === "images" && !file.type.startsWith("image/")) throw new Error("That isn't an image.");

  const dot = file.name.lastIndexOf(".");
  const ext = dot > 0 ? file.name.slice(dot + 1).toLowerCase().replace(/[^a-z0-9]/g, "") : "";
  const base = slugify(dot > 0 ? file.name.slice(0, dot) : file.name) || "file";
  const month = new Date().toISOString().slice(0, 7);
  const path = `${folder}/${month}/${crypto.randomUUID().slice(0, 8)}-${base}${ext ? `.${ext}` : ""}`;

  const db = browserClient();
  const { error } = await db.storage.from(MEDIA_BUCKET).upload(path, file, {
    cacheControl: "31536000",
    contentType: file.type || undefined,
    upsert: false,
  });
  if (error) throw new Error(error.message);
  const { data } = db.storage.from(MEDIA_BUCKET).getPublicUrl(path);
  return { url: data.publicUrl, path, name: file.name, size: file.size, ext };
}
