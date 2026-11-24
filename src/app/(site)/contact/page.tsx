import { ArrowUpRight, Mail, MapPin } from "lucide-react";
import { contact, site, socials } from "@/content/site";
import { Container, PageHeader } from "@/components/ui/primitives";
import { ContactForm } from "@/components/site/contact-form";
import { GitHubIcon, LinkedInIcon } from "@/components/ui/icons";
import { LocalTime } from "@/components/home/local-time";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Contact",
  description: `Get in touch with ${site.name} about a project, an idea, or just to talk about technology.`,
  path: "/contact",
});

export default function ContactPage() {
  const channels = [
    { label: "Email", value: site.email, href: `mailto:${site.email}`, icon: <Mail size={16} /> },
    { label: "LinkedIn", value: "Connect", href: socials.linkedin, icon: <LinkedInIcon size={16} /> },
    { label: "GitHub", value: "See the code", href: socials.github, icon: <GitHubIcon size={16} /> },
  ];

  return (
    <Container>
      <PageHeader eyebrow="contact" title="Say hello." accent="I'd like that.">
        <p>
          {contact.headline} {contact.body}
        </p>
      </PageHeader>

      <div className="grid gap-10 lg:grid-cols-[1fr_1.4fr]">
        <aside className="space-y-3">
          {channels.map((c) => (
            <a
              key={c.label}
              href={c.href}
              {...(c.href.startsWith("http") ? { target: "_blank", rel: "noopener noreferrer" } : {})}
              className="card group flex items-center gap-4 p-5"
            >
              <span className="grid size-10 place-items-center rounded-full border border-line text-muted transition-colors group-hover:border-accent group-hover:text-accent">
                {c.icon}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block font-mono text-xs text-subtle">{c.label}</span>
                <span className="block truncate text-fg">{c.value}</span>
              </span>
              <ArrowUpRight size={16} className="text-subtle transition-all group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-fg" />
            </a>
          ))}
          <div className="flex items-center justify-between rounded-[1.25rem] border border-dashed border-line px-5 py-4 font-mono text-xs text-subtle">
            <span className="inline-flex items-center gap-2">
              <MapPin size={13} /> {site.location}
            </span>
            <span>
              Local time <span className="text-fg"><LocalTime timeZone={site.timezone} /></span>
            </span>
          </div>
        </aside>
        <ContactForm />
      </div>
    </Container>
  );
}
