import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { ArrowLeft, ArrowUpRight, Lock } from "lucide-react";
import { getProject, getProjects } from "@/lib/content/queries";
import { projectCategories } from "@/content/site";
import { Container, GeneratedCover } from "@/components/ui/primitives";
import { ProjectCard, ProjectStatus } from "@/components/projects/project-card";
import { GitHubIcon } from "@/components/ui/icons";
import { pageMetadata } from "@/lib/seo";
import { formatRange } from "@/lib/utils";

export async function generateStaticParams() {
  const projects = await getProjects();
  return projects.length ? projects.map((p) => ({ slug: p.slug })) : [{ slug: "__none" }];
}

export async function generateMetadata({ params }: PageProps<"/projects/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const data = await getProject(slug);
  if (!data) return { title: "Project not found" };
  return pageMetadata({
    title: data.project.title,
    description: data.project.summary,
    path: `/projects/${slug}`,
    image: data.project.cover_url ?? undefined,
  });
}

export default function ProjectPage(props: PageProps<"/projects/[slug]">) {
  return (
    <Suspense fallback={<div className="min-h-[60vh]" />}>
      <ProjectContent params={props.params} />
    </Suspense>
  );
}

async function ProjectContent({ params }: Pick<PageProps<"/projects/[slug]">, "params">) {
  const { slug } = await params;
  const [data, all] = await Promise.all([getProject(slug), getProjects()]);
  if (!data) notFound();
  const { project, html } = data;
  const confidential = project.visibility === "confidential";
  const others = all.filter((p) => p.id !== project.id).slice(0, 2);

  const facts = [
    { label: "Role", value: project.role },
    { label: "Timeline", value: formatRange(project.started_at, project.ended_at) },
    { label: "Type", value: projectCategories[project.category] },
  ].filter((f) => f.value);

  return (
    <Container>
      <div className="mx-auto max-w-5xl pt-12 sm:pt-20">
        <Link href="/projects" className="group inline-flex items-center gap-1.5 font-mono text-xs text-subtle hover:text-fg">
          <ArrowLeft size={13} className="transition-transform group-hover:-translate-x-0.5" /> All projects
        </Link>

        <header className="mt-8 grid gap-10 lg:grid-cols-[1fr_300px]">
          <div>
            <div className="rise flex flex-wrap items-center gap-3">
              <ProjectStatus status={project.status} />
              {confidential && (
                <span className="chip">
                  <Lock size={11} /> Confidential
                </span>
              )}
            </div>
            <h1
              className="rise mt-5 text-[clamp(2.1rem,5vw,3.4rem)] font-semibold leading-[1.08] tracking-[-0.04em] text-fg"
              style={{ "--d": "60ms" } as React.CSSProperties}
            >
              {project.title}
            </h1>
            <p className="rise mt-5 max-w-2xl text-xl leading-relaxed text-muted" style={{ "--d": "120ms" } as React.CSSProperties}>
              {project.summary}
            </p>
            {(project.github_url || project.demo_url) && (
              <div className="rise mt-8 flex flex-wrap gap-3" style={{ "--d": "180ms" } as React.CSSProperties}>
                {project.demo_url && (
                  <a href={project.demo_url} target="_blank" rel="noopener noreferrer" className="btn btn-primary">
                    Live demo <ArrowUpRight size={15} />
                  </a>
                )}
                {project.github_url && (
                  <a href={project.github_url} target="_blank" rel="noopener noreferrer" className="btn btn-ghost">
                    <GitHubIcon size={15} /> Source
                  </a>
                )}
              </div>
            )}
          </div>
          <dl className="rise card grid h-fit gap-5 p-6" style={{ "--d": "180ms" } as React.CSSProperties}>
            {facts.map((f) => (
              <div key={f.label}>
                <dt className="eyebrow">{f.label}</dt>
                <dd className="mt-1.5 text-sm text-fg">{f.value}</dd>
              </div>
            ))}
            {project.tech.length > 0 && (
              <div>
                <dt className="eyebrow">Stack</dt>
                <dd className="mt-2.5 flex flex-wrap gap-1.5">
                  {project.tech.map((t) => (
                    <span key={t} className="chip">
                      {t}
                    </span>
                  ))}
                </dd>
              </div>
            )}
          </dl>
        </header>

        <div className="mt-14">
          {project.cover_url ? (
            <div className="relative aspect-[16/9] overflow-hidden rounded-2xl border border-line bg-sunken">
              <Image src={project.cover_url} alt={`${project.title} screenshot`} fill priority sizes="(min-width: 1024px) 1024px, 100vw" className="object-cover" />
            </div>
          ) : (
            <GeneratedCover seed={project.slug} label={projectCategories[project.category]} className="aspect-[3/1] rounded-2xl border border-line" />
          )}
        </div>

        {confidential && (
          <p className="mt-6 flex items-start gap-3 rounded-xl border border-line bg-surface p-4 text-sm text-muted">
            <Lock size={15} className="mt-0.5 shrink-0 text-accent" />
            This is professional work, so it&apos;s described at a high level only. No client names, screenshots or
            internal details. Happy to talk about the approach in more depth.
          </p>
        )}

        <div className="mt-14 grid gap-14 lg:grid-cols-[minmax(0,1fr)_300px]">
          <div className="prose max-w-[68ch]" dangerouslySetInnerHTML={{ __html: html }} />
          <div className="space-y-10">
            <ListBlock title="What I learned" items={project.learnings} />
            <ListBlock title="Challenges" items={project.challenges} />
            {project.outcome && (
              <div>
                <h2 className="eyebrow mb-3">Outcome</h2>
                <p className="text-sm leading-relaxed text-fg">{project.outcome}</p>
              </div>
            )}
          </div>
        </div>

        {project.images.length > 0 && (
          <section aria-label="Screenshots" className="mt-16 grid gap-4 sm:grid-cols-2">
            {project.images.map((img) => (
              <figure key={img.url} className="overflow-hidden rounded-2xl border border-line bg-sunken">
                <div className="relative aspect-[16/10]">
                  <Image src={img.url} alt={img.alt} fill sizes="(min-width: 640px) 50vw, 100vw" className="object-cover" />
                </div>
                {img.alt && <figcaption className="border-t border-line px-4 py-3 text-xs text-subtle">{img.alt}</figcaption>}
              </figure>
            ))}
          </section>
        )}

        {others.length > 0 && (
          <section aria-labelledby="more" className="mt-24">
            <h2 id="more" className="eyebrow mb-6">
              More projects
            </h2>
            <div className="grid gap-4 md:grid-cols-2">
              {others.map((p) => (
                <ProjectCard key={p.id} project={p} />
              ))}
            </div>
          </section>
        )}
      </div>
    </Container>
  );
}

function ListBlock({ title, items }: { title: string; items: string[] }) {
  if (!items.length) return null;
  return (
    <div>
      <h2 className="eyebrow mb-3">{title}</h2>
      <ul className="space-y-2.5">
        {items.map((i) => (
          <li key={i} className="flex gap-3 text-sm leading-relaxed text-muted">
            <span className="mt-2 h-px w-3 shrink-0 bg-accent" aria-hidden="true" />
            {i}
          </li>
        ))}
      </ul>
    </div>
  );
}
