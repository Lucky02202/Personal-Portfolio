import Link from "next/link";
import { ArrowUpRight, BookOpen, Compass, GraduationCap, Hammer, PenLine } from "lucide-react";
import type { NowItem, NowKind } from "@/lib/types";
import type { PostSummary } from "@/lib/content/queries";
import { nowKinds } from "@/content/site";
import { cn, formatDate, isExternal } from "@/lib/utils";

const icons: Record<NowKind, React.ComponentType<{ size?: number; className?: string }>> = {
  building: Hammer,
  learning: GraduationCap,
  exploring: Compass,
  reading: BookOpen,
  writing: PenLine,
};

const order: NowKind[] = ["building", "learning", "exploring", "reading", "writing"];

function NowCard({
  kind,
  items,
  latestPost,
  className,
  delay,
}: {
  kind: NowKind;
  items: NowItem[];
  latestPost?: PostSummary;
  className?: string;
  delay: number;
}) {
  const Icon = icons[kind];
  return (
    <article
      className={cn("card flex flex-col p-5 sm:p-6", className)}
      data-reveal
      style={{ "--reveal-delay": `${delay}ms` } as React.CSSProperties}
    >
      <header className="flex items-center justify-between">
        <p className="eyebrow flex items-center gap-2">
          <Icon size={14} className="text-accent" />
          {nowKinds[kind].label}
        </p>
        {kind === "building" && (
          <span className="inline-flex items-center gap-1.5 font-mono text-[11px] text-subtle">
            <span className="pulse-dot" aria-hidden="true" /> active
          </span>
        )}
      </header>
      <ul className="mt-5 flex flex-1 flex-col gap-4">
        {items.map((item) => (
          <li key={item.id}>
            <NowEntry title={item.title} detail={item.detail} href={item.href} />
          </li>
        ))}
        {kind === "writing" && latestPost && (
          <li className={cn(items.length > 0 && "border-t border-line pt-4")}>
            <p className="mb-1 font-mono text-[11px] text-subtle">Latest · {formatDate(latestPost.published_at)}</p>
            <NowEntry title={latestPost.title} detail={null} href={`/blog/${latestPost.slug}`} />
          </li>
        )}
      </ul>
    </article>
  );
}

function NowEntry({ title, detail, href }: { title: string; detail: string | null; href: string | null }) {
  const body = (
    <>
      <span className="flex items-start justify-between gap-3 font-medium leading-snug tracking-[-0.015em] text-fg">
        {title}
        {href && (
          <ArrowUpRight
            size={15}
            className="mt-0.5 shrink-0 text-subtle transition-all group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-accent"
          />
        )}
      </span>
      {detail && <span className="mt-1 block text-sm leading-relaxed text-muted">{detail}</span>}
    </>
  );
  if (!href) return <div>{body}</div>;
  return isExternal(href) ? (
    <a href={href} target="_blank" rel="noopener noreferrer" className="group block">
      {body}
    </a>
  ) : (
    <Link href={href} className="group block">
      {body}
    </Link>
  );
}

/** The "Currently" bento grid. Kinds with nothing in them are skipped. */
export function NowGrid({ items, latestPost }: { items: NowItem[]; latestPost?: PostSummary }) {
  const groups = order
    .map((kind) => ({ kind, items: items.filter((i) => i.kind === kind) }))
    .filter((g) => g.items.length > 0 || (g.kind === "writing" && latestPost));

  // Layout: "building" is the headline tile (4 cols × 2 rows) when present. The next
  // two tiles stack beside it, and whatever is left shares the bottom row evenly.
  const hasHero = groups[0]?.kind === "building";
  const rest = hasHero ? groups.length - 3 : groups.length;
  const bottomSpan = rest <= 1 ? "md:col-span-6" : rest === 2 ? "md:col-span-3" : "md:col-span-2";

  function span(i: number) {
    if (hasHero) {
      if (i === 0) return "md:col-span-4 md:row-span-2";
      if (i <= 2) return "md:col-span-2";
    }
    return bottomSpan;
  }

  return (
    <div className="grid gap-4 md:grid-cols-6">
      {groups.map((g, i) => (
        <NowCard
          key={g.kind}
          kind={g.kind}
          items={g.items}
          latestPost={g.kind === "writing" ? latestPost : undefined}
          delay={i * 60}
          className={span(i)}
        />
      ))}
    </div>
  );
}
