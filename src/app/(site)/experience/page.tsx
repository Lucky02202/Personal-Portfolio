import { getExperience } from "@/lib/content/queries";
import { Container, PageHeader } from "@/components/ui/primitives";
import { pageMetadata } from "@/lib/seo";
import { formatRange, cn } from "@/lib/utils";
import { site } from "@/content/site";
import { ArrowUpRight, FileText } from "lucide-react";

export const metadata = pageMetadata({
  title: "Experience",
  description: `Where ${site.name} has worked, what the work involved, and what came out of it.`,
  path: "/experience",
});

function duration(start: string, end: string | null) {
  const a = new Date(start);
  const b = end ? new Date(end) : null;
  if (!b) return null; // "Present" durations would need the current date; the range already says it.
  let months = (b.getUTCFullYear() - a.getUTCFullYear()) * 12 + (b.getUTCMonth() - a.getUTCMonth()) + 1;
  const y = Math.floor(months / 12);
  months %= 12;
  return [y && `${y} yr${y > 1 ? "s" : ""}`, months && `${months} mo`].filter(Boolean).join(" ");
}

export default async function ExperiencePage() {
  const roles = await getExperience();

  return (
    <Container>
      <PageHeader eyebrow="experience" title="Where I've worked" accent="& what I did there.">
        <p>
          The professional side of things. Client and company work is described at a high level. Ask me if you want
          more detail on the approach.
        </p>
        <a href={site.resumeUrl} className="btn btn-ghost btn-sm mt-6">
          <FileText size={14} /> Download résumé
        </a>
      </PageHeader>

      <ol className="relative max-w-5xl">
        {/* the rail */}
        <span aria-hidden="true" className="absolute bottom-4 left-[7px] top-3 w-px bg-gradient-to-b from-accent via-line-strong to-transparent sm:left-[183px]" />
        {roles.map((r, i) => {
          const current = !r.end_date;
          const len = duration(r.start_date, r.end_date);
          return (
            <li key={r.id} className="relative grid gap-4 pb-14 pl-9 sm:grid-cols-[160px_1fr] sm:gap-12 sm:pl-0" data-reveal>
              <div className="sm:pt-1 sm:text-right">
                <p className="font-mono text-xs text-fg">{formatRange(r.start_date, r.end_date)}</p>
                {len && <p className="mt-1 font-mono text-xs text-subtle">{len}</p>}
              </div>
              <span
                aria-hidden="true"
                className={cn(
                  "absolute left-0 top-1.5 grid size-[15px] place-items-center rounded-full border bg-bg sm:left-[176px]",
                  current ? "border-accent" : "border-line-strong",
                )}
              >
                <span className={cn("size-[5px] rounded-full", current ? "bg-accent" : "bg-subtle")} />
              </span>
              <article className={cn("card p-6 sm:p-7", i === 0 && "border-line-strong")}>
                <header className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h2 className="text-lg font-semibold tracking-[-0.02em] text-fg">{r.role}</h2>
                    <p className="mt-1 text-muted">
                      {r.company}
                      {r.location && <span className="text-subtle"> · {r.location}</span>}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    {current && (
                      <span className="chip">
                        <span className="pulse-dot" aria-hidden="true" /> Current
                      </span>
                    )}
                    {r.employment_type && <span className="chip">{r.employment_type}</span>}
                  </div>
                </header>
                {r.description && <p className="mt-4 leading-relaxed text-muted">{r.description}</p>}

                {(r.responsibilities.length > 0 || r.contributions.length > 0) && (
                  <div className="mt-6 grid gap-6 md:grid-cols-2">
                    {r.responsibilities.length > 0 && (
                      <div>
                        <h3 className="eyebrow mb-3">What I do</h3>
                        <ul className="space-y-2">
                          {r.responsibilities.map((x) => (
                            <li key={x} className="flex gap-3 text-sm leading-relaxed text-muted">
                              <span className="mt-2.5 h-px w-3 shrink-0 bg-subtle" aria-hidden="true" />
                              {x}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {r.contributions.length > 0 && (
                      <div>
                        <h3 className="eyebrow mb-3">Highlights</h3>
                        <ul className="space-y-2">
                          {r.contributions.map((x) => (
                            <li key={x} className="flex gap-3 text-sm leading-relaxed text-fg">
                              <ArrowUpRight size={14} className="mt-1 shrink-0 text-accent" aria-hidden="true" />
                              {x}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}

                {r.tech.length > 0 && (
                  <ul className="mt-6 flex flex-wrap gap-1.5 border-t border-line pt-5" aria-label="Technologies">
                    {r.tech.map((t) => (
                      <li key={t} className="chip">
                        {t}
                      </li>
                    ))}
                  </ul>
                )}
              </article>
            </li>
          );
        })}
      </ol>
    </Container>
  );
}
