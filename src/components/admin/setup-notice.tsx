import { Database } from "lucide-react";

/** Shown in the admin when Supabase env vars are missing. */
export function SetupNotice({ compact = false }: { compact?: boolean }) {
  return (
    <div className="card p-6">
      <p className="flex items-center gap-2 font-medium text-fg">
        <Database size={16} className="text-accent" /> Connect Supabase to enable the admin
      </p>
      <p className="mt-2 text-sm leading-relaxed text-muted">
        The public site is running on the bundled starter content. To write and publish from here, create a free
        Supabase project and set these environment variables:
      </p>
      <pre className="mt-4 overflow-x-auto rounded-lg border border-line bg-sunken p-3 font-mono text-xs text-fg">
        {`NEXT_PUBLIC_SUPABASE_URL=…
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=…`}
      </pre>
      {!compact && (
        <ol className="mt-4 list-decimal space-y-1.5 pl-5 text-sm text-muted">
          <li>Run supabase/migrations/0001_init.sql in the SQL editor.</li>
          <li>Create your user under Authentication → Users and disable public sign-ups.</li>
          <li>Add yourself as an admin: insert into public.admins (user_id) values (&apos;your-user-id&apos;);</li>
          <li>Restart the app, sign in, and import the starter content from the dashboard.</li>
        </ol>
      )}
      <p className="mt-4 text-xs text-subtle">Full steps are in README.md.</p>
    </div>
  );
}
