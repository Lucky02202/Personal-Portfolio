"use client";

import Link from "next/link";
import { useState } from "react";
import { ExternalLink, Search, Star } from "lucide-react";
import { StatusBadge, postState, type PostState } from "./status-badge";
import { cn, formatDate } from "@/lib/utils";

interface Row {
  id: string;
  title: string;
  slug: string;
  status: string;
  published_at: string | null;
  updated_at: string;
  category: string | null;
  featured: boolean;
}

export function PostsTable({ posts, categories }: { posts: Row[]; categories: Record<string, string> }) {
  const [filter, setFilter] = useState<PostState | "all">("all");
  const [q, setQ] = useState("");
  const withState = posts.map((p) => ({ ...p, state: postState(p.status, p.published_at) }));
  const counts = { all: posts.length, draft: 0, scheduled: 0, published: 0 };
  withState.forEach((p) => counts[p.state]++);
  const shown = withState.filter(
    (p) => (filter === "all" || p.state === filter) && (!q || p.title.toLowerCase().includes(q.toLowerCase())),
  );

  return (
    <div>
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex gap-1" role="group" aria-label="Filter by status">
          {(["all", "published", "scheduled", "draft"] as const).map((f) => (
            <button
              key={f}
              type="button"
              aria-pressed={filter === f}
              onClick={() => setFilter(f)}
              className={cn(
                "rounded-full px-3 py-1.5 text-[13px] capitalize transition-colors",
                filter === f ? "bg-surface-hover text-fg" : "text-muted hover:text-fg",
              )}
            >
              {f} <span className="font-mono text-[11px] text-subtle">{counts[f]}</span>
            </button>
          ))}
        </div>
        <label className="relative sm:w-64">
          <span className="sr-only">Search posts</span>
          <Search size={14} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-subtle" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search titles…" className="field h-9 pl-8 text-sm" />
        </label>
      </div>

      <div className="card overflow-hidden">
        <table className="w-full text-sm">
          <thead className="border-b border-line text-left font-mono text-[11px] uppercase tracking-[0.06em] text-subtle">
            <tr>
              <th className="px-5 py-3 font-normal">Title</th>
              <th className="hidden px-3 py-3 font-normal md:table-cell">Category</th>
              <th className="px-3 py-3 font-normal">Status</th>
              <th className="hidden px-3 py-3 font-normal sm:table-cell">Date</th>
              <th className="px-3 py-3 font-normal">
                <span className="sr-only">Actions</span>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {shown.map((p) => (
              <tr key={p.id} className="group hover:bg-surface">
                <td className="max-w-0 px-5 py-3.5">
                  <Link href={`/admin/posts/${p.id}`} className="flex items-center gap-2 truncate font-medium text-fg hover:text-accent">
                    {p.featured && <Star size={12} className="shrink-0 fill-accent text-accent" aria-label="Featured" />}
                    <span className="truncate">{p.title}</span>
                  </Link>
                  <span className="block truncate font-mono text-[11px] text-subtle">/{p.slug}</span>
                </td>
                <td className="hidden px-3 py-3.5 text-muted md:table-cell">{p.category ? categories[p.category] ?? p.category : "—"}</td>
                <td className="px-3 py-3.5">
                  <StatusBadge state={p.state} />
                </td>
                <td className="hidden whitespace-nowrap px-3 py-3.5 font-mono text-xs text-subtle sm:table-cell">
                  {p.state === "draft" ? `edited ${formatDate(p.updated_at)}` : formatDate(p.published_at)}
                </td>
                <td className="px-3 py-3.5 text-right">
                  {p.state === "published" && (
                    <a href={`/blog/${p.slug}`} target="_blank" className="inline-grid size-8 place-items-center rounded-md text-subtle hover:bg-surface-hover hover:text-fg" aria-label={`View ${p.title}`}>
                      <ExternalLink size={14} />
                    </a>
                  )}
                </td>
              </tr>
            ))}
            {shown.length === 0 && (
              <tr>
                <td colSpan={5} className="px-5 py-10 text-center text-muted">
                  No posts here yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
