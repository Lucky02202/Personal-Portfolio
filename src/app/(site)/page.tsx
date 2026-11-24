import Link from "next/link";
import { ArrowRight, ArrowUpRight, FileText, MapPin } from "lucide-react";
import { getCategories, getDownloads, getNow, getPosts, getProjects } from "@/lib/content/queries";
import { hero, nowKinds, site, socials, contact } from "@/content/site";
import { Container, SectionHeading } from "@/components/ui/primitives";
import { NowTicker } from "@/components/home/now-ticker";
import { NowGrid } from "@/components/home/now-grid";
import { NowTerminal } from "@/components/home/now-terminal";
import { ProjectCard } from "@/components/projects/project-card";
import { FeaturedPostCard, PostRow } from "@/components/blog/post-card";
import { ResourceCard } from "@/components/downloads/resource-card";
import { GitHubIcon, LinkedInIcon } from "@/components/ui/icons";
import { jsonLd, personJsonLd } from "@/lib/seo";
import { formatDate } from "@/lib/utils";

export default async function HomePage() {
  const [{ items: now, updatedAt }, posts, projects, downloads, categories] = await Promise.all([
    getNow(),
    getPosts(),
    getProjects(),
    getDownloads(),
    getCategories(),
  ]);

  const categoryNames = Object.fromEntries(categories.map((c) => [c.slug, c.name]));
  const ticker = now
    .filter((i) => i.highlight)
    .map((i) => ({ verb: nowKinds[i.kind].verb, title: i.title, href: i.href }));
  // Featured first, topped up with the rest so the row is always full.
  const featuredProjects = [...projects.filter((p) => p.featured), ...projects.filter((p) => !p.featured)].slice(0, 3);
  const featuredPost = posts.find((p) => p.featured) ?? posts[0];
  const otherPosts = posts.filter((p) => p !== featuredPost).slice(0, 4);

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={jsonLd(personJsonLd())} />

      {/* ---------------------------------------------------------------- Hero */}
      <Container>
        <section className="grid items-center gap-14 pb-20 pt-14 sm:pt-24 lg:grid-cols-[1.25fr_1fr] lg:gap-16 lg:pb-28 lg:pt-28">
          <div className="min-w-0">
            <div className="rise inline-flex max-w-full items-center rounded-full border border-line bg-surface px-3.5 py-1.5 backdrop-blur">
              <NowTicker items={ticker} />
            </div>

            <h1 className="mt-8 text-[clamp(2.75rem,8vw,5.5rem)] font-semibold leading-[0.95] tracking-[-0.045em] text-fg">
              <span className="rise block" style={{ "--d": "80ms" } as React.CSSProperties}>
                {hero.greeting}
              </span>
              <span
                className="rise mt-2 block font-serif text-[0.82em] font-normal italic leading-[1.05] tracking-[-0.02em] text-muted"
                style={{ "--d": "180ms" } as React.CSSProperties}
              >
                This is my corner of the internet.
              </span>
            </h1>

            <p className="rise mt-8 max-w-xl text-lg leading-relaxed text-muted" style={{ "--d": "280ms" } as React.CSSProperties}>
              {hero.intro}
            </p>

            <dl
              className="rise mt-7 flex flex-wrap items-center gap-x-5 gap-y-2 font-mono text-[13px] text-subtle"
              style={{ "--d": "340ms" } as React.CSSProperties}
            >
              <div className="flex items-center gap-2">
                <dt className="sr-only">Role</dt>
                <dd className="text-fg">{site.role}</dd>
              </div>
              <div className="flex items-center gap-1.5">
                <dt className="sr-only">Location</dt>
                <MapPin size={13} aria-hidden="true" />
                <dd>{site.location}</dd>
              </div>
            </dl>

            <div className="rise mt-10 flex flex-wrap items-center gap-3" style={{ "--d": "420ms" } as React.CSSProperties}>
              <Link href="/projects" className="btn btn-primary group">
                Explore my work
                <ArrowRight size={15} className="transition-transform group-hover:translate-x-0.5" />
              </Link>
              <Link href="/blog" className="btn btn-ghost">
                Read the blog
              </Link>
              <div className="ml-1 flex items-center gap-1">
                <a href={site.resumeUrl} className="btn btn-sm text-muted hover:text-fg" aria-label="Resume (PDF)">
                  <FileText size={15} /> Resume
                </a>
                <a
                  href={socials.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="grid size-10 place-items-center rounded-full text-muted transition-colors hover:bg-surface-hover hover:text-fg"
                  aria-label="GitHub"
                >
                  <GitHubIcon size={17} />
                </a>
                <a
                  href={socials.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="grid size-10 place-items-center rounded-full text-muted transition-colors hover:bg-surface-hover hover:text-fg"
                  aria-label="LinkedIn"
                >
                  <LinkedInIcon size={17} />
                </a>
              </div>
            </div>
          </div>

          <div className="rise min-w-0 lg:pl-4" style={{ "--d": "380ms" } as React.CSSProperties}>
            <NowTerminal items={now} updatedAt={updatedAt} />
          </div>
        </section>
      </Container>

      {/* ----------------------------------------------------------- Currently */}
      <section aria-labelledby="currently" className="border-t border-line py-16 sm:py-20">
        <Container>
          <div className="mb-10 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between" data-reveal>
            <div>
              <p className="eyebrow mb-3">01 — Currently</p>
              <h2 id="currently" className="text-2xl font-semibold tracking-[-0.03em] text-fg sm:text-3xl">
                What I&apos;m up to <span className="font-serif font-normal italic text-muted">right now</span>
              </h2>
            </div>
            {updatedAt && (
              <p className="font-mono text-xs text-subtle">
                Updated {formatDate(updatedAt)}
              </p>
            )}
          </div>
          <NowGrid items={now} latestPost={posts[0]} />
        </Container>
      </section>

      {/* ------------------------------------------------------------ Projects */}
      {featuredProjects.length > 0 && (
        <section aria-label="Selected work" className="py-16 sm:py-20">
          <Container>
            <SectionHeading
              index="02 — Work"
              title="Things I've built, and am building"
              description="Personal projects, experiments, and professional work described at a level I'm allowed to share."
              href="/projects"
              hrefLabel="All projects"
            />
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {featuredProjects.map((p, i) => (
                <div key={p.id} data-reveal style={{ "--reveal-delay": `${i * 70}ms` } as React.CSSProperties}>
                  <ProjectCard project={p} />
                </div>
              ))}
            </div>
          </Container>
        </section>
      )}

      {/* ------------------------------------------------------------- Writing */}
      {featuredPost && (
        <section aria-label="Writing" className="py-16 sm:py-20">
          <Container>
            <SectionHeading
              index="03 — Writing"
              title="Notes, guides and opinions"
              description="Mostly about building software, automation and learning in public."
              href="/blog"
              hrefLabel="All posts"
            />
            <div data-reveal>
              <FeaturedPostCard post={featuredPost} categories={categoryNames} />
            </div>
            {otherPosts.length > 0 && (
              <div className="mt-6 border-t border-line" data-reveal>
                {otherPosts.map((p) => (
                  <PostRow key={p.id} post={p} categories={categoryNames} />
                ))}
              </div>
            )}
          </Container>
        </section>
      )}

      {/* ----------------------------------------------------------- Resources */}
      {downloads.length > 0 && (
        <section aria-label="Resources" className="py-16 sm:py-20">
          <Container>
            <SectionHeading
              index="04 — Resources"
              title="Things you can take with you"
              description="Cheat sheets, checklists and templates I made for myself and cleaned up for you."
              href="/downloads"
              hrefLabel="Resource library"
            />
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {downloads.slice(0, 3).map((d, i) => (
                <div key={d.id} data-reveal style={{ "--reveal-delay": `${i * 70}ms` } as React.CSSProperties}>
                  <ResourceCard item={d} />
                </div>
              ))}
            </div>
          </Container>
        </section>
      )}

      {/* ------------------------------------------------------------- Contact */}
      <section aria-label="Contact" className="pt-12">
        <Container>
          <Link
            href="/contact"
            className="card group relative flex flex-col gap-8 overflow-hidden p-8 sm:p-12 md:flex-row md:items-end md:justify-between"
            data-reveal
          >
            <div className="backdrop-grid opacity-60" aria-hidden="true" />
            <div className="relative">
              <p className="eyebrow mb-4">05 — Say hello</p>
              <p className="max-w-2xl text-2xl font-semibold leading-tight tracking-[-0.03em] text-fg sm:text-4xl">
                {contact.headline}
              </p>
            </div>
            <span className="btn btn-primary relative shrink-0 self-start md:self-auto">
              Get in touch <ArrowUpRight size={15} />
            </span>
          </Link>
        </Container>
      </section>
    </>
  );
}
