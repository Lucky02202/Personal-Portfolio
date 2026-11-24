"use client";

import { useEffect, useState } from "react";
import type { TocItem } from "@/lib/types";
import { cn } from "@/lib/utils";

/** Table of contents that highlights the section you're reading. */
export function Toc({ items }: { items: TocItem[] }) {
  const [active, setActive] = useState<string | null>(null);

  useEffect(() => {
    const headings = items.map((i) => document.getElementById(i.id)).filter(Boolean) as HTMLElement[];
    if (!headings.length) return;
    const io = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]) setActive(visible[0].target.id);
      },
      { rootMargin: "-80px 0px -70% 0px" },
    );
    headings.forEach((h) => io.observe(h));
    return () => io.disconnect();
  }, [items]);

  return (
    <ol className="relative space-y-0.5 border-l border-line text-sm">
      {items.map((item) => (
        <li key={item.id}>
          <a
            href={`#${item.id}`}
            aria-current={active === item.id ? "location" : undefined}
            className={cn(
              "-ml-px block border-l py-1.5 leading-snug transition-colors",
              item.depth === 3 ? "pl-7 text-[13px]" : "pl-4",
              active === item.id ? "border-accent text-fg" : "border-transparent text-subtle hover:text-muted",
            )}
          >
            {item.text}
          </a>
        </li>
      ))}
    </ol>
  );
}

export function ReadingProgress() {
  const [p, setP] = useState(0);
  useEffect(() => {
    let raf = 0;
    const update = () => {
      raf = 0;
      const el = document.getElementById("article-body");
      if (!el) return;
      const r = el.getBoundingClientRect();
      const total = r.height - window.innerHeight * 0.6;
      setP(Math.min(1, Math.max(0, -r.top / Math.max(total, 1))));
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(raf);
    };
  }, []);
  return (
    <div aria-hidden="true" className="fixed inset-x-0 top-16 z-40 h-px">
      <div className="h-full origin-left bg-accent transition-transform duration-150" style={{ transform: `scaleX(${p})` }} />
    </div>
  );
}
