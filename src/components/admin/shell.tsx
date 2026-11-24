import Link from "next/link";
import { ArrowUpRight, LogOut } from "lucide-react";
import { signOut } from "@/lib/admin/actions";
import { site } from "@/content/site";
import { AdminNav } from "./nav";
import { ThemeToggle } from "@/components/site/theme-toggle";

export function AdminShell({ email, children }: { email: string | null; children: React.ReactNode }) {
  return (
    <div className="flex min-h-dvh flex-col md:flex-row">
      <aside className="border-b border-line bg-sunken/60 md:sticky md:top-0 md:flex md:h-dvh md:w-60 md:shrink-0 md:flex-col md:border-b-0 md:border-r">
        <div className="flex h-14 items-center justify-between px-4 md:h-16 md:px-5">
          <Link href="/admin" className="flex items-center gap-2.5">
            <span className="grid size-7 place-items-center rounded-md border border-line-strong font-mono text-[10px] font-semibold text-fg">
              {site.initials}
            </span>
            <span className="text-sm font-medium text-fg">Studio</span>
          </Link>
          <div className="flex items-center gap-1 md:hidden">
            <ThemeToggle />
          </div>
        </div>
        <AdminNav />
        <div className="mt-auto hidden border-t border-line p-4 md:block">
          <Link href="/" target="_blank" className="flex items-center justify-between rounded-lg px-2 py-2 text-sm text-muted hover:bg-surface-hover hover:text-fg">
            View site <ArrowUpRight size={14} />
          </Link>
          {email && (
            <div className="mt-3 flex items-center justify-between gap-2 px-2">
              <span className="truncate font-mono text-[11px] text-subtle" title={email}>
                {email}
              </span>
              <div className="flex items-center">
                <ThemeToggle className="grid size-8 place-items-center rounded-md text-subtle hover:bg-surface-hover hover:text-fg" />
                <form action={signOut}>
                  <button type="submit" className="grid size-8 place-items-center rounded-md text-subtle hover:bg-surface-hover hover:text-fg" aria-label="Sign out" title="Sign out">
                    <LogOut size={14} />
                  </button>
                </form>
              </div>
            </div>
          )}
        </div>
      </aside>
      <main className="min-w-0 flex-1 px-4 py-8 sm:px-8 md:py-10 lg:px-12">{children}</main>
    </div>
  );
}

/** Consistent page header inside the admin. */
export function AdminHeader({
  title,
  description,
  actions,
}: {
  title: string;
  description?: string;
  actions?: React.ReactNode;
}) {
  return (
    <header className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h1 className="text-2xl font-semibold tracking-[-0.03em] text-fg">{title}</h1>
        {description && <p className="mt-1 text-sm text-muted">{description}</p>}
      </div>
      {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
    </header>
  );
}
