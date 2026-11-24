import Link from "next/link";
import { ArrowUpRight, Plus } from "lucide-react";
import { requireAdmin } from "@/lib/admin/auth";
import { AdminHeader } from "@/components/admin/shell";
import { ImportStarter } from "@/components/admin/import-starter";
import { StatusBadge, postState } from "@/components/admin/status-badge";
import { formatDate } from "@/lib/utils";

export const metadata = { title: "Overview" };

export default async function OverviewPage() {
  const { db } = await requireAdmin();
  const now = new Date().toISOString();
  const count = (q: PromiseLike<{ count: number | null }>) => Promise.resolve(q).then((r) => r.count ?? 0);
  const head = { count: "exact" as const, head: true };

  const [total, live, drafts, scheduled, projects, downloads, nowItems, unread, recent, dlRows] = await Promise.all([
    count(db.from("posts").select("id", head)),
    count(db.from("posts").select("id", head).eq("status", "published").lte("published_at", now)),
    count(db.from("posts").select("id", head).eq("status", "draft")),
    count(db.from("posts").select("id", head).eq("status", "published").gt("published_at", now)),
    count(db.from("projects").select("id", head)),
    count(db.from("downloads").select("id", head)),
    count(db.from("now_items").select("id", head)),
    count(db.from("messages").select("id", head).eq("read", false)),
    db.from("posts").select("id, title, status, published_at, updated_at").order("updated_at", { ascending: false }).limit(6),
    db.from("downloads").select("download_count"),
  ]);
  const totalDownloads = (dlRows.data ?? []).reduce((s, r) => s + (r.download_count ?? 0), 0);
  const empty = total + projects + downloads + nowItems === 0;

  const stats = [
    { label: "Published posts", value: live, href: "/admin/posts" },
    { label: "Drafts", value: drafts, href: "/admin/posts" },
    { label: "Scheduled", value: scheduled, href: "/admin/posts" },
    { label: "Projects", value: projects, href: "/admin/projects" },
    { label: "Resources", value: downloads, href: "/admin/downloads", sub: `${totalDownloads} downloads` },
    { label: "Unread messages", value: unread, href: "/admin/messages" },
  ];

  return (
    <div className="max-w-5xl">
      <AdminHeader
        title="Overview"
        description="Everything on the site, in one place."
        actions={
          <>
            <Link href="/admin/now" className="btn btn-ghost btn-sm">
              Update “Currently”
            </Link>
            <Link href="/admin/posts/new" className="btn btn-primary btn-sm">
              <Plus size={14} /> New post
            </Link>
          </>
        }
      />

      {empty && <ImportStarter />}

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-3">
        {stats.map((s) => (
          <Link key={s.label} href={s.href} className="card p-5">
            <p className="font-mono text-xs text-subtle">{s.label}</p>
            <p className="mt-3 text-3xl font-semibold tracking-[-0.03em] text-fg tabular-nums">{s.value}</p>
            {s.sub && <p className="mt-1 font-mono text-[11px] text-subtle">{s.sub}</p>}
          </Link>
        ))}
      </div>

      <section className="mt-10">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="eyebrow">Recently edited</h2>
          <Link href="/admin/posts" className="text-xs text-muted hover:text-fg">
            All posts →
          </Link>
        </div>
        <div className="card divide-y divide-line">
          {(recent.data ?? []).length === 0 && <p className="p-5 text-sm text-muted">No posts yet. Write the first one.</p>}
          {(recent.data ?? []).map((p) => (
            <Link key={p.id} href={`/admin/posts/${p.id}`} className="flex items-center justify-between gap-4 px-5 py-3.5 hover:bg-surface">
              <span className="min-w-0 truncate text-sm text-fg">{p.title}</span>
              <span className="flex shrink-0 items-center gap-3">
                <StatusBadge state={postState(p.status, p.published_at)} />
                <span className="hidden font-mono text-[11px] text-subtle sm:inline">{formatDate(p.updated_at)}</span>
              </span>
            </Link>
          ))}
        </div>
      </section>

      <section className="mt-10 grid gap-3 sm:grid-cols-3">
        {[
          { href: "/admin/projects/new", label: "Add a project" },
          { href: "/admin/downloads/new", label: "Upload a resource" },
          { href: "/admin/experience/new", label: "Add experience" },
        ].map((a) => (
          <Link key={a.href} href={a.href} className="card flex items-center justify-between p-4 text-sm text-muted hover:text-fg">
            {a.label} <ArrowUpRight size={14} />
          </Link>
        ))}
      </section>
    </div>
  );
}
