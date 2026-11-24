"use client";

import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import type { Download } from "@/lib/types";
import { cn } from "@/lib/utils";
import { ResourceCard } from "./resource-card";

export function ResourceExplorer({ items }: { items: Download[] }) {
  const [category, setCategory] = useState<string | null>(null);
  const [type, setType] = useState<string | null>(null);
  const [query, setQuery] = useState("");

  const categories = useMemo(() => [...new Set(items.map((i) => i.category))].sort(), [items]);
  const types = useMemo(() => [...new Set(items.map((i) => i.file_type.toLowerCase()))].sort(), [items]);

  const shown = items.filter((i) => {
    if (category && i.category !== category) return false;
    if (type && i.file_type.toLowerCase() !== type) return false;
    const q = query.trim().toLowerCase();
    return !q || `${i.title} ${i.description} ${i.category}`.toLowerCase().includes(q);
  });

  return (
    <div className="grid gap-10 lg:grid-cols-[220px_1fr]">
      <aside className="lg:sticky lg:top-24 lg:h-fit" aria-label="Filters">
        <label className="relative block">
          <span className="sr-only">Search resources</span>
          <Search size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-subtle" />
          <input
            type="search"
            className="field h-10 pl-9 text-sm"
            placeholder="Search…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </label>
        <FilterGroup label="Category" options={categories} value={category} onChange={setCategory} />
        <FilterGroup label="File type" options={types} value={type} onChange={setType} format={(t) => `.${t}`} />
      </aside>

      <div>
        <p className="mb-5 font-mono text-xs text-subtle">
          {shown.length} of {items.length} resources
        </p>
        {shown.length ? (
          <div className="grid gap-4 md:grid-cols-2">
            {shown.map((i) => (
              <ResourceCard key={i.id} item={i} />
            ))}
          </div>
        ) : (
          <div className="card grid place-items-center px-6 py-16 text-center text-muted">Nothing here with those filters.</div>
        )}
      </div>
    </div>
  );
}

function FilterGroup({
  label,
  options,
  value,
  onChange,
  format = (s) => s,
}: {
  label: string;
  options: string[];
  value: string | null;
  onChange: (v: string | null) => void;
  format?: (s: string) => string;
}) {
  if (options.length < 2) return null;
  return (
    <fieldset className="mt-8">
      <legend className="eyebrow mb-3">{label}</legend>
      <div className="no-scrollbar -mx-5 flex gap-1.5 overflow-x-auto px-5 lg:mx-0 lg:flex-col lg:gap-0.5 lg:px-0">
        {[null, ...options].map((o) => (
          <button
            key={o ?? "all"}
            type="button"
            aria-pressed={value === o}
            onClick={() => onChange(o)}
            className={cn(
              "shrink-0 rounded-full border px-3 py-1.5 text-left text-[13px] transition-colors lg:rounded-lg lg:border-0 lg:px-3",
              value === o ? "border-fg bg-fg text-bg lg:bg-surface-hover lg:text-fg" : "border-line text-muted hover:text-fg",
            )}
          >
            {o === null ? "All" : format(o)}
          </button>
        ))}
      </div>
    </fieldset>
  );
}
