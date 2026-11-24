"use client";

import { useState } from "react";
import type { Project, ProjectCategory } from "@/lib/types";
import { projectCategories } from "@/content/site";
import { cn } from "@/lib/utils";
import { ProjectCard } from "./project-card";

export function ProjectExplorer({ projects }: { projects: Project[] }) {
  const [filter, setFilter] = useState<ProjectCategory | "all">("all");
  const used = (Object.keys(projectCategories) as ProjectCategory[]).filter((c) => projects.some((p) => p.category === c));
  const shown = filter === "all" ? projects : projects.filter((p) => p.category === filter);

  return (
    <div>
      <div className="no-scrollbar -mx-5 flex gap-1 overflow-x-auto border-b border-line px-5 sm:mx-0 sm:px-0" role="group" aria-label="Filter by category">
        {(["all", ...used] as const).map((c) => {
          const count = c === "all" ? projects.length : projects.filter((p) => p.category === c).length;
          const active = filter === c;
          return (
            <button
              key={c}
              type="button"
              aria-pressed={active}
              onClick={() => setFilter(c)}
              className={cn(
                "relative shrink-0 px-4 py-3 text-sm transition-colors",
                active ? "text-fg" : "text-muted hover:text-fg",
              )}
            >
              {c === "all" ? "All" : projectCategories[c]}
              <span className="ml-1.5 font-mono text-xs text-subtle">{count}</span>
              {active && <span className="absolute inset-x-3 -bottom-px h-px bg-accent" />}
            </button>
          );
        })}
      </div>
      <div className="mt-8 grid gap-4 md:grid-cols-2">
        {shown.map((p, i) => (
          <div key={p.id} className="page-enter" style={{ animationDelay: `${i * 50}ms` }}>
            <ProjectCard project={p} size="lg" />
          </div>
        ))}
      </div>
    </div>
  );
}
