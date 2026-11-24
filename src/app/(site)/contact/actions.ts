"use server";

import { headers } from "next/headers";
import { z } from "zod";
import { publicClient } from "@/lib/supabase/public";

export type ContactState =
  | { status: "idle" }
  | { status: "success" }
  | { status: "error"; message: string; fields?: Partial<Record<"name" | "email" | "body", string>> };

const schema = z.object({
  name: z.string().trim().min(1, "Please tell me your name.").max(120),
  email: z.string().trim().email("That email doesn't look right.").max(254),
  subject: z.string().trim().max(200).optional(),
  body: z.string().trim().min(10, "A little more detail, please (10+ characters).").max(5000),
});

// Best-effort in-memory rate limit (per server instance). The database's own
// constraints and RLS are the real protection; this just slows down bursts.
const hits = new Map<string, number[]>();
function limited(key: string, max = 3, windowMs = 10 * 60_000) {
  const now = Date.now();
  const recent = (hits.get(key) ?? []).filter((t) => now - t < windowMs);
  recent.push(now);
  hits.set(key, recent);
  return recent.length > max;
}

export async function sendMessage(_prev: ContactState, form: FormData): Promise<ContactState> {
  // Honeypot: real people never see or fill this field.
  if (form.get("website")) return { status: "success" };

  const parsed = schema.safeParse({
    name: form.get("name"),
    email: form.get("email"),
    subject: form.get("subject") || undefined,
    body: form.get("body"),
  });
  if (!parsed.success) {
    const f = parsed.error.flatten().fieldErrors;
    return {
      status: "error",
      message: "Please check the highlighted fields.",
      fields: { name: f.name?.[0], email: f.email?.[0], body: f.body?.[0] },
    };
  }

  const h = await headers();
  const ip = h.get("x-forwarded-for")?.split(",")[0]?.trim() || h.get("x-real-ip") || "unknown";
  if (limited(ip)) {
    return { status: "error", message: "That's a few messages in a short time. Try again in a few minutes." };
  }

  const db = publicClient();
  if (!db) {
    return {
      status: "error",
      message: "The contact form isn't connected yet. Please use the email address on this page instead.",
    };
  }

  const { error } = await db.from("messages").insert({
    name: parsed.data.name,
    email: parsed.data.email,
    subject: parsed.data.subject ?? null,
    body: parsed.data.body,
  });
  if (error) {
    console.error("contact insert failed", error.message);
    return { status: "error", message: "Something went wrong on my side. Please try email instead." };
  }

  await notify(parsed.data).catch((e) => console.error("contact notify failed", e));
  return { status: "success" };
}

/** Optional email notification via Resend (set RESEND_API_KEY + CONTACT_NOTIFY_EMAIL). */
async function notify(m: z.infer<typeof schema>) {
  const key = process.env.RESEND_API_KEY;
  const to = process.env.CONTACT_NOTIFY_EMAIL;
  if (!key || !to) return;
  await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from: process.env.CONTACT_FROM_EMAIL ?? "Website <onboarding@resend.dev>",
      to,
      reply_to: m.email,
      subject: `New message: ${m.subject || m.name}`,
      text: `From: ${m.name} <${m.email}>\n\n${m.body}`,
    }),
  });
}
