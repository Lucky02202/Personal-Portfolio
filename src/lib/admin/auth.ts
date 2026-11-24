import "server-only";
import { cache } from "react";
import { redirect } from "next/navigation";
import { serverClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/env";

/**
 * Admin data access layer.
 *
 * `getAdmin()` validates the session with Supabase Auth (getUser() hits the
 * auth server, so a forged cookie fails) and then asks the database whether
 * this user is in `public.admins`. Only then is the user treated as an admin.
 */
export const getAdmin = cache(async () => {
  if (!isSupabaseConfigured) return null;
  const db = await serverClient();
  const {
    data: { user },
  } = await db.auth.getUser();
  if (!user) return null;
  const { data: isAdmin, error } = await db.rpc("is_admin");
  if (error || !isAdmin) return null;
  return { db, user: { id: user.id, email: user.email ?? "" } };
});

/** For pages: redirect to login when not an admin. */
export async function requireAdmin() {
  const admin = await getAdmin();
  if (!admin) redirect("/admin/login");
  return admin;
}

/** For server actions: throw (never redirect silently) when not an admin. */
export async function adminDb() {
  const admin = await getAdmin();
  if (!admin) throw new Error("Not authorised");
  return admin.db;
}
