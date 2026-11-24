"use client";

import { useEffect, useMemo, useState } from "react";
import { Search, X } from "lucide-react";
import type { PostSummary } from "@/lib/content/queries";
import type { Category } from "@/lib/types";
import { cn } from "@/lib/utils";
import { PostCard } from "./post-card";

type Sort = "newest" | "oldest" | "quick";

/**
 * Client-side search, filtering and sorting. All published posts (without
 * their bodies) ship with the prerendered page, so filtering is instant and
 * the page stays fully static. State is mirrored to the URL so filters can be shared.
 */
export function BlogExplorer({ posts, categories }: { posts: PostSummary[]; categories: Category[] }) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<string | null>(null);
  const [tag, setTag] = useState<string | null>(null);
  const [sort, setSort] = useState<Sort>("newest");

  // Read the initial filters from the URL (after hydration, so the static HTML matches).
  useEffect(() => {
    const sp = new URLSearchParams(window.location.search);
    /* eslint-disable react-hooks/set-state-in-effect -- one-time sync from the URL */
    setQuery(sp.get("q") ?? "");
    setCategory(sp.get("category"));
    setTag(sp.get("tag"));
    const s = sp.get("sort");
    if (s === "oldest" || s === "quick") setSort(s);
    /* eslint-enable react-hooks/set-state-in-effect */
  }, []);

  useEffect(() => {
    const sp = new URLSearchParams();
    if (query) sp.set("q", query);
    if (category) sp.set("category", category);
    if (tag) sp.set("tag", tag);
    if (sort !== "newest") sp.set("sort", sort);
    const qs = sp.toString();
    window.history.replaceState(null, "", qs ? `?${qs}` : window.location.pathname);
  }, [query, category, tag, sort]);

  const names = useMemo(() => Object.fromEntries(categories.map((c) => [c.slug, c.name])), [categories]);
  const usedCategories = categories.filter((c) => posts.some((p) => p.category === c.slug));
  const tags = useMemo(() => {
    const counts = new Map<string, number>();
    posts.forEach((p) => p.tags.forEach((t) => counts.set(t, (counts.get(t) ?? 0) + 1)));
    return [...counts.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0])).slice(0, 16);
  }, [posts]);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    const terms = q.split(/\s+/).filter(Boolean);
    const filtered = posts.filter((p) => {
      if (category && p.category !== category) return false;
      if (tag && !p.tags.includes(tag)) return false;
      if (!terms.length) return true;
      const hay = [p.title, p.subtitle ?? "", p.tags.join(" "), names[p.category ?? ""] ?? ""].join(" ").toLowerCase();
      return terms.every((t) => hay.includes(t));
    });
    return filtered.sort((a, b) => {
      if (sort === "quick") return a.reading_minutes - b.reading_minutes;
      const d = +new Date(b.published_at!) - +new Date(a.published_at!);
      return sort === "oldest" ? -d : d;
    });
  }, [posts, query, category, tag, sort, names]);

  const active = Boolean(query || category || tag);

  return (
    <div>
      <div className="sticky top-16 z-20 -mx-5 border-b border-line bg-bg/80 px-5 py-4 backdrop-blur-xl sm:-mx-8 sm:px-8">
        <div className="flex flex-col gap-3 md:flex-row md:items-center">
          <label className="relative flex-1">
            <span className="sr-only">Search posts</span>
            <Search size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-subtle" />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search posts, tags, topics…"
              className="field h-11 pl-10"
            />
          </label>
          <div className="flex items-center gap-2">
            <label className="sr-only" htmlFor="sort">
              Sort posts
            </label>
            <select id="sort" value={sort} onChange={(e) => setSort(e.target.value as Sort)} className="field h-11 w-auto pr-8">
              <option value="newest">Newest first</option>
              <option value="oldest">Oldest first</option>
              <option value="quick">Quickest read</option>
            </select>
          </div>
        </div>
        <div className="no-scrollbar -mx-5 mt-3 flex gap-1.5 overflow-x-auto px-5 sm:mx-0 sm:flex-wrap sm:px-0" role="group" aria-label="Filter by category">
          <FilterChip active={!category} onClick={() => setCategory(null)}>
            All
          </FilterChip>
          {usedCategories.map((c) => (
            <FilterChip key={c.slug} active={category === c.slug} onClick={() => setCategory(category === c.slug ? null : c.slug)}>
              {c.name}
            </FilterChip>
          ))}
        </div>
      </div>

      {tags.length > 0 && (
        <div className="mt-6 flex flex-wrap items-center gap-x-3 gap-y-2" role="group" aria-label="Filter by tag">
          <span className="eyebrow">Tags</span>
          {tags.map(([t]) => (
            <button
              key={t}
              type="button"
              aria-pressed={tag === t}
              onClick={() => setTag(tag === t ? null : t)}
              className={cn(
                "font-mono text-xs transition-colors",
                tag === t ? "text-accent" : "text-subtle hover:text-fg",
              )}
            >
              #{t}
            </button>
          ))}
        </div>
      )}

      <div className="mt-8 flex items-center justify-between font-mono text-xs text-subtle" aria-live="polite">
        <span>
          {results.length} {results.length === 1 ? "post" : "posts"}
          {active && " found"}
        </span>
        {active && (
          <button
            type="button"
            onClick={() => {
              setQuery("");
              setCategory(null);
              setTag(null);
            }}
            className="inline-flex items-center gap-1 hover:text-fg"
          >
            <X size={12} /> Clear filters
          </button>
        )}
      </div>

      {results.length > 0 ? (
        <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {results.map((p) => (
            <PostCard key={p.id} post={p} categories={names} />
          ))}
        </div>
      ) : (
        <div className="card mt-5 grid place-items-center px-6 py-20 text-center">
          <p className="font-mono text-sm text-subtle">
            <span className="text-accent">$</span> grep &quot;{query || tag || category}&quot; ./posts
          </p>
          <p className="mt-3 text-muted">Nothing matches that yet. Maybe it&apos;s a post I should write.</p>
        </div>
      )}
    </div>
  );
}

function FilterChip({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={cn(
        "shrink-0 rounded-full border px-3.5 py-1.5 text-[13px] transition-colors",
        active ? "border-fg bg-fg text-bg" : "border-line text-muted hover:border-line-strong hover:text-fg",
      )}
    >
      {children}
    </button>
  );
}
