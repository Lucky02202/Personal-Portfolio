import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";

export function Container({ className, children }: { className?: string; children: React.ReactNode }) {
  return <div className={cn("mx-auto w-full max-w-6xl px-5 sm:px-8", className)}>{children}</div>;
}

/** Page header used by every top-level page. */
export function PageHeader({
  eyebrow,
  title,
  accent,
  children,
}: {
  eyebrow: string;
  title: string;
  accent?: string;
  children?: React.ReactNode;
}) {
  return (
    <header className="pb-12 pt-16 sm:pb-16 sm:pt-24">
      <p className="eyebrow rise flex items-center gap-2">
        <span className="text-accent">~/</span>
        {eyebrow}
      </p>
      <h1
        className="rise mt-5 max-w-3xl text-4xl font-semibold leading-[1.05] tracking-[-0.035em] text-fg sm:text-6xl"
        style={{ "--d": "60ms" } as React.CSSProperties}
      >
        {title} {accent && <span className="font-serif font-normal italic tracking-[-0.01em] text-muted">{accent}</span>}
      </h1>
      {children && (
        <div
          className="rise mt-6 max-w-2xl text-lg leading-relaxed text-muted"
          style={{ "--d": "120ms" } as React.CSSProperties}
        >
          {children}
        </div>
      )}
    </header>
  );
}

export function SectionHeading({
  index,
  title,
  description,
  href,
  hrefLabel,
}: {
  index?: string;
  title: string;
  description?: string;
  href?: string;
  hrefLabel?: string;
}) {
  return (
    <div className="mb-8 flex flex-col gap-4 sm:mb-10 sm:flex-row sm:items-end sm:justify-between" data-reveal>
      <div>
        {index && <p className="eyebrow mb-3">{index}</p>}
        <h2 className="text-2xl font-semibold tracking-[-0.03em] text-fg sm:text-3xl">{title}</h2>
        {description && <p className="mt-2 max-w-xl text-muted">{description}</p>}
      </div>
      {href && (
        <Link href={href} className="group inline-flex items-center gap-1 text-sm text-muted transition-colors hover:text-fg">
          {hrefLabel ?? "View all"}
          <ArrowUpRight size={15} className="transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
        </Link>
      )}
    </div>
  );
}

export function Chip({ children, className }: { children: React.ReactNode; className?: string }) {
  return <span className={cn("chip", className)}>{children}</span>;
}

export function StatusDot({ tone = "accent" }: { tone?: "accent" | "muted" | "warn" }) {
  if (tone === "accent") return <span className="pulse-dot" aria-hidden="true" />;
  return (
    <span
      aria-hidden="true"
      className={cn("inline-block size-2 rounded-full", tone === "warn" ? "bg-amber-400/80" : "bg-subtle/60")}
    />
  );
}

/** Deterministic cover art for content without an image: no stock photos. */
export function GeneratedCover({
  seed,
  label,
  className,
}: {
  seed: string;
  label?: string;
  className?: string;
}) {
  let h = 0;
  for (const ch of seed) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  const gx = 10 + (h % 80);
  const gy = (h >> 3) % 60;
  const cx = gx * 4;
  const cy = gy * 2.5 + 20;
  return (
    <div
      className={cn("gen-cover", className)}
      style={{ "--gx": `${gx}%`, "--gy": `${gy}%` } as React.CSSProperties}
      aria-hidden="true"
    >
      {/* Topographic rings, positioned from the seed: every cover is unique but stable. */}
      <svg className="absolute inset-0 h-full w-full" viewBox="0 0 400 250" preserveAspectRatio="xMidYMid slice">
        {Array.from({ length: 9 }, (_, i) => (
          <ellipse
            key={i}
            cx={cx}
            cy={cy}
            rx={26 + i * 30 + ((h >> i) % 9)}
            ry={18 + i * 22 + ((h >> (i + 2)) % 7)}
            fill="none"
            stroke="var(--line-strong)"
            strokeWidth="0.7"
            opacity={1 - i * 0.09}
            transform={`rotate(${(h % 40) - 20} ${cx} ${cy})`}
          />
        ))}
        <circle cx={cx} cy={cy} r="2.5" fill="var(--accent)" />
      </svg>
      {label && (
        <span className="absolute bottom-4 left-5 z-10 font-mono text-[11px] uppercase tracking-[0.12em] text-subtle">
          {label}
        </span>
      )}
      <span className="absolute right-5 top-4 z-10 font-mono text-[11px] text-subtle/70">
        {(h % 0xffff).toString(16).padStart(4, "0")}
      </span>
    </div>
  );
}
