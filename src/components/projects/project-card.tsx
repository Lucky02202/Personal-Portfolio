import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, Lock } from "lucide-react";
import type { Project } from "@/lib/types";
import { projectCategories, projectStatuses } from "@/content/site";
import { GeneratedCover, StatusDot } from "@/components/ui/primitives";
import { cn } from "@/lib/utils";

export function ProjectStatus({ status }: { status: Project["status"] }) {
  const tone = status === "building" ? "accent" : status === "paused" ? "warn" : "muted";
  return (
    <span className="inline-flex items-center gap-2 font-mono text-xs text-muted">
      <StatusDot tone={tone} />
      {projectStatuses[status]}
    </span>
  );
}

export function ConfidentialBadge({ className }: { className?: string }) {
  return (
    <span className={cn("chip", className)} title="Professional work, described at a high level only">
      <Lock size={11} aria-hidden="true" /> Confidential
    </span>
  );
}

export function ProjectCard({ project, size = "md" }: { project: Project; size?: "md" | "lg" }) {
  const year = project.started_at ? new Date(project.started_at).getUTCFullYear() : null;
  return (
    <Link href={`/projects/${project.slug}`} className="card group flex h-full flex-col overflow-hidden" prefetch>
      {project.cover_url ? (
        <div className={cn("relative overflow-hidden border-b border-line bg-sunken", size === "lg" ? "aspect-[16/9]" : "aspect-[2/1]")}>
          <Image
            src={project.cover_url}
            alt=""
            fill
            sizes="(min-width: 768px) 50vw, 100vw"
            className="object-cover transition-transform duration-700 group-hover:scale-[1.03]"
          />
        </div>
      ) : (
        <GeneratedCover
          seed={project.slug}
          label={projectCategories[project.category]}
          className={cn("border-b border-line", size === "lg" ? "aspect-[16/9]" : "aspect-[2/1]")}
        />
      )}
      <div className="flex flex-1 flex-col p-5 sm:p-6">
        <div className="flex items-center justify-between gap-3">
          <ProjectStatus status={project.status} />
          <div className="flex items-center gap-2">
            {project.visibility === "confidential" && <ConfidentialBadge />}
            {year && <span className="font-mono text-xs text-subtle">{year}</span>}
          </div>
        </div>
        <h3 className="mt-4 flex items-start justify-between gap-3 text-lg font-semibold leading-snug tracking-[-0.02em] text-fg">
          {project.title}
          <ArrowUpRight
            size={17}
            className="mt-1 shrink-0 text-subtle transition-all group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-accent"
          />
        </h3>
        <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-muted">{project.summary}</p>
        {project.tech.length > 0 && (
          <ul className="mt-auto flex flex-wrap gap-1.5 pt-5" aria-label="Technologies">
            {project.tech.slice(0, 5).map((t) => (
              <li key={t} className="chip">
                {t}
              </li>
            ))}
          </ul>
        )}
      </div>
    </Link>
  );
}
