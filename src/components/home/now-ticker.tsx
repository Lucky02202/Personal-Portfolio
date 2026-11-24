"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowRight } from "lucide-react";

export interface TickerItem {
  verb: string;
  title: string;
  href: string | null;
}

/** "Currently building → Intelligent Tracker", rotating through highlighted items. */
export function NowTicker({ items }: { items: TickerItem[] }) {
  const [i, setI] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (items.length < 2 || paused) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const id = window.setInterval(() => setI((n) => (n + 1) % items.length), 3400);
    return () => window.clearInterval(id);
  }, [items.length, paused]);

  if (!items.length) return null;
  const item = items[i];
  const content = (
    <>
      <span className="shrink-0 whitespace-nowrap text-subtle">{item.verb}</span>
      <ArrowRight size={14} className="shrink-0 text-accent" aria-hidden="true" />
      <span className="truncate text-fg">{item.title}</span>
    </>
  );

  return (
    <div
      className="flex min-w-0 items-center gap-3 font-mono text-[13px]"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
    >
      <span className="pulse-dot shrink-0" aria-hidden="true" />
      {/* Screen readers get the full list once, rather than a changing live region. */}
      <ul className="sr-only">
        {items.map((it) => (
          <li key={it.verb + it.title}>
            {it.verb}: {it.title}
          </li>
        ))}
      </ul>
      <div className="relative min-w-0 overflow-hidden" aria-hidden="true">
        {item.href ? (
          <Link key={i} href={item.href} tabIndex={-1} className="ticker-in flex min-w-0 items-center gap-2 hover:underline">
            {content}
          </Link>
        ) : (
          <span key={i} className="ticker-in flex min-w-0 items-center gap-2">
            {content}
          </span>
        )}
      </div>
    </div>
  );
}
