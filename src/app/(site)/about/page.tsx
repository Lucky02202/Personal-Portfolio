import Link from "next/link";
import { ArrowUpRight, MapPin } from "lucide-react";
import { about, journey, site, stack, socials } from "@/content/site";
import { getNow } from "@/lib/content/queries";
import { Container, PageHeader, SectionHeading } from "@/components/ui/primitives";
import { TechIcon, GitHubIcon, LinkedInIcon } from "@/components/ui/icons";
import { jsonLd, pageMetadata, personJsonLd } from "@/lib/seo";
import { cn } from "@/lib/utils";
import { nowKinds } from "@/content/site";

export const metadata = pageMetadata({
  title: "About",
  description: `About ${site.name}: background, how I work, what I use, and what I'm curious about.`,
  path: "/about",
  type: "profile",
});

export default async function AboutPage() {
  const { items } = await getNow();
  const current = items.filter((i) => i.kind === "building" || i.kind === "learning").slice(0, 3);

  return (
    <Container>
      <script type="application/ld+json" dangerouslySetInnerHTML={jsonLd(personJsonLd())} />
      <PageHeader eyebrow="about" title="Hi, I'm Laxmikant." accent="Nice to meet you." />

      {/* Intro + profile card */}
      <section className="grid gap-12 lg:grid-cols-[1.4fr_1fr]">
        <div>
          <h2 className="text-2xl font-semibold leading-snug tracking-[-0.03em] text-fg sm:text-3xl">{about.headline}</h2>
          <div className="mt-6 space-y-5 text-lg leading-relaxed text-muted">
            {about.intro.map((p) => (
              <p key={p}>{p}</p>
            ))}
          </div>
        </div>
        <aside className="card h-fit overflow-hidden" aria-label="Quick facts">
          <div className="gen-cover grid h-36 place-items-center border-b border-line">
            <span className="relative z-10 font-serif text-6xl italic text-fg">{site.initials}</span>
          </div>
          <dl className="divide-y divide-line text-sm">
            <Fact label="Role" value={site.role} />
            <Fact label="Based in" value={<span className="inline-flex items-center gap-1.5"><MapPin size={13} /> {site.location}</span>} />
            {current.map((c) => (
              <Fact key={c.id} label={nowKinds[c.kind].label} value={c.title} />
            ))}
          </dl>
          <div className="flex gap-2 border-t border-line p-4">
            <a href={socials.github} target="_blank" rel="noopener noreferrer" className="btn btn-ghost btn-sm flex-1">
              <GitHubIcon size={14} /> GitHub
            </a>
            <a href={socials.linkedin} target="_blank" rel="noopener noreferrer" className="btn btn-ghost btn-sm flex-1">
              <LinkedInIcon size={14} /> LinkedIn
            </a>
          </div>
        </aside>
      </section>

      {/* What I enjoy */}
      <section className="mt-28">
        <SectionHeading index="What I enjoy building" title="The kind of work that pulls me in" />
        <div className="grid gap-4 md:grid-cols-3">
          {about.enjoy.map((e, i) => (
            <article key={e.title} className="card p-6" data-reveal style={{ "--reveal-delay": `${i * 60}ms` } as React.CSSProperties}>
              <p className="font-mono text-xs text-accent">0{i + 1}</p>
              <h3 className="mt-6 font-semibold tracking-[-0.015em] text-fg">{e.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted">{e.body}</p>
            </article>
          ))}
        </div>
      </section>

      {/* Approach */}
      <section className="mt-28">
        <SectionHeading index="How I work" title="My approach to building software" />
        <ol className="grid gap-px overflow-hidden rounded-2xl border border-line bg-line sm:grid-cols-2">
          {about.approach.map((a, i) => (
            <li key={a.title} className="bg-bg p-6 sm:p-8" data-reveal>
              <p className="font-mono text-xs text-subtle">
                <span className="text-accent">{"//"}</span> principle {i + 1}
              </p>
              <h3 className="mt-4 text-lg font-semibold tracking-[-0.02em] text-fg">{a.title}</h3>
              <p className="mt-2 leading-relaxed text-muted">{a.body}</p>
            </li>
          ))}
        </ol>
      </section>

      {/* Stack */}
      <section className="mt-28" id="stack">
        <SectionHeading index="Tools" title="What I work with" description="Grouped by where I use them. No percentages: nobody is 85% good at CSS." />
        <div className="grid gap-4 md:grid-cols-2">
          {stack.map((g) => (
            <article
              key={g.group}
              className={cn("card p-6", g.group === "Currently learning" && "border-dashed")}
              data-reveal
            >
              <header className="flex items-baseline justify-between gap-4">
                <h3 className="font-semibold tracking-[-0.015em] text-fg">{g.group}</h3>
                <p className="text-right text-xs text-subtle">{g.note}</p>
              </header>
              <ul className="mt-5 flex flex-wrap gap-2">
                {g.items.map((t) => (
                  <li
                    key={t.name}
                    className="inline-flex items-center gap-2 rounded-lg border border-line bg-sunken px-3 py-2 text-sm text-muted transition-colors hover:border-line-strong hover:text-fg"
                  >
                    <TechIcon name={t.name} icon={t.icon} size={15} />
                    {t.name}
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>
        <div className="mt-8 flex flex-wrap items-center gap-2">
          <span className="eyebrow mr-2">Currently curious about</span>
          {about.interests.map((x) => (
            <span key={x} className="chip">
              {x}
            </span>
          ))}
        </div>
      </section>

      {/* Journey */}
      <section className="mt-28" aria-labelledby="journey">
        <SectionHeading index="Journey" title="How I got here, and where I'm going" />
        <ol id="journey" className="relative grid gap-8 md:grid-cols-4 md:gap-4">
          <span aria-hidden="true" className="absolute left-[7px] top-2 h-full w-px bg-line md:left-0 md:top-[7px] md:h-px md:w-full" />
          {journey.map((step, i) => (
            <li key={step.title} className="relative pl-9 md:pl-0 md:pt-10" data-reveal style={{ "--reveal-delay": `${i * 80}ms` } as React.CSSProperties}>
              <span
                aria-hidden="true"
                className={cn(
                  "absolute left-0 top-1 grid size-[15px] place-items-center rounded-full border bg-bg md:top-0",
                  step.kind === "now" ? "border-accent" : step.kind === "next" ? "border-dashed border-line-strong" : "border-line-strong",
                )}
              >
                <span className={cn("size-[5px] rounded-full", step.kind === "now" ? "bg-accent" : step.kind === "next" ? "bg-transparent" : "bg-subtle")} />
              </span>
              <p className={cn("font-mono text-xs", step.kind === "now" ? "text-accent" : "text-subtle")}>{step.period}</p>
              <h3 className="mt-2 font-semibold tracking-[-0.015em] text-fg">{step.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted">{step.body}</p>
            </li>
          ))}
        </ol>
        <div className="mt-12 flex flex-wrap gap-3">
          <Link href="/experience" className="btn btn-ghost">
            Full experience <ArrowUpRight size={15} />
          </Link>
          <Link href="/contact" className="btn btn-primary">
            Get in touch
          </Link>
        </div>
      </section>
    </Container>
  );
}

function Fact({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4 px-5 py-3.5">
      <dt className="font-mono text-xs text-subtle">{label}</dt>
      <dd className="text-right text-fg">{value}</dd>
    </div>
  );
}
