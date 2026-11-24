import Link from "next/link";
import { ArrowUpRight, Mail, Rss } from "lucide-react";
import { site, socials } from "@/content/site";
import { Container } from "@/components/ui/primitives";
import { GitHubIcon, LinkedInIcon } from "@/components/ui/icons";

const explore = [
  { href: "/about", label: "About" },
  { href: "/projects", label: "Projects" },
  { href: "/experience", label: "Experience" },
  { href: "/blog", label: "Blog" },
  { href: "/downloads", label: "Downloads" },
  { href: "/contact", label: "Contact" },
];

export function Footer() {
  const connect = [
    { href: socials.github, label: "GitHub", icon: <GitHubIcon size={14} /> },
    { href: socials.linkedin, label: "LinkedIn", icon: <LinkedInIcon size={14} /> },
    { href: `mailto:${site.email}`, label: "Email", icon: <Mail size={14} /> },
    { href: "/rss.xml", label: "RSS", icon: <Rss size={14} /> },
  ];

  return (
    <footer className="relative mt-32 border-t border-line">
      <Container className="py-14 sm:py-16">
        <div className="grid gap-12 md:grid-cols-[1.4fr_1fr_1fr]">
          <div>
            <p className="text-lg font-medium tracking-tight text-fg">{site.name}</p>
            <p className="mt-2 max-w-xs text-sm leading-relaxed text-muted">{site.tagline}</p>
            <p className="mt-6 inline-flex items-center gap-2 font-mono text-xs text-subtle">
              <span className="pulse-dot" aria-hidden="true" /> {site.location}
            </p>
          </div>
          <nav aria-label="Footer">
            <p className="eyebrow mb-4">Explore</p>
            <ul className="grid grid-cols-2 gap-x-6 gap-y-2.5 text-sm md:grid-cols-1">
              {explore.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="link-underline text-muted transition-colors hover:text-fg">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
          <div>
            <p className="eyebrow mb-4">Connect</p>
            <ul className="grid grid-cols-2 gap-x-6 gap-y-2.5 text-sm md:grid-cols-1">
              {connect.map((l) => (
                <li key={l.label}>
                  <a
                    href={l.href}
                    className="group inline-flex items-center gap-2 text-muted transition-colors hover:text-fg"
                    {...(l.href.startsWith("http") ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                  >
                    {l.icon}
                    {l.label}
                    <ArrowUpRight size={12} className="opacity-0 transition-opacity group-hover:opacity-100" />
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>
        <div className="mt-14 flex flex-col gap-3 border-t border-line pt-6 font-mono text-xs text-subtle sm:flex-row sm:items-center sm:justify-between">
          <p>
            © <CurrentYear /> {site.name}
          </p>
          <p>Designed & built by me, with Next.js</p>
        </div>
      </Container>
    </footer>
  );
}

async function CurrentYear() {
  "use cache";
  // Cached with the page shell and refreshed with it; the year is fine to be a little stale.
  return <>{new Date().getFullYear()}</>;
}
