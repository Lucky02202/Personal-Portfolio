/**
 * Public Supabase config. The anon key is designed to be public: every table is
 * protected by row-level security, so the key alone can only read published content.
 * No service-role key is used anywhere in this app.
 */
export const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
export const supabaseAnonKey =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

export const MEDIA_BUCKET = "media";
