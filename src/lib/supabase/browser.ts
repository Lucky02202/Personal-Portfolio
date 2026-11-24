"use client";
import { createBrowserClient } from "@supabase/ssr";
import { supabaseAnonKey, supabaseUrl } from "@/lib/env";

/** Browser client used by the admin for direct-to-storage uploads (RLS: admins only). */
export function browserClient() {
  return createBrowserClient(supabaseUrl, supabaseAnonKey);
}
