import "server-only";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { isSupabaseConfigured, supabaseAnonKey, supabaseUrl } from "@/lib/env";

let client: SupabaseClient | null = null;

/**
 * Cookie-less, anonymous client for public reads. Because it never touches the
 * request, it can be used inside `'use cache'` functions so pages prerender.
 * RLS limits it to published content.
 */
export function publicClient(): SupabaseClient | null {
  if (!isSupabaseConfigured) return null;
  client ??= createClient(supabaseUrl, supabaseAnonKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  return client;
}
