"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { ArrowUpRight } from "lucide-react";
import { nav, site, socials } from "@/content/site";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "./theme-toggle";
import { GitHubIcon, LinkedInIcon } from "@/components/ui/icons";

function isActive(pathname: string, href: string) {
  return href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(`${href}/`);
}

export function Nav() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [lastPath, setLastPath] = useState(pathname);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close the menu on navigation (state reset during render, no effect needed).
  if (pathname !== lastPath) {
    setLastPath(pathname);
    setOpen(false);
  }

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    menuRef.current?.querySelector<HTMLElement>("a")?.focus();
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <>
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[70] focus:rounded-full focus:bg-fg focus:px-4 focus:py-2 focus:text-bg"
      >
        Skip to content
      </a>
      <header
        className={cn(
          "fixed inset-x-0 top-0 z-50 transition-[background-color,border-color,backdrop-filter] duration-300",
          scrolled || open
            ? "border-b border-line bg-bg/75 backdrop-blur-xl backdrop-saturate-150"
            : "border-b border-transparent",
        )}
      >
        <nav aria-label="Main" className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-5 sm:px-8">
          <Link href="/" className="group flex items-center gap-2.5" aria-label={`${site.name}, home`}>
            <span className="grid size-8 place-items-center rounded-lg border border-line-strong bg-surface font-mono text-[11px] font-semibold tracking-tight text-fg transition-colors group-hover:border-accent group-hover:text-accent">
              {site.initials}
            </span>
            <span className="hidden text-sm font-medium tracking-tight text-fg sm:inline">{site.firstName}</span>
          </Link>

          <ul className="hidden items-center gap-1 md:flex">
            {nav.map((item) => {
              const active = isActive(pathname, item.href);
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    aria-current={active ? "page" : undefined}
                    className={cn(
                      "relative rounded-full px-3.5 py-2 text-sm transition-colors",
                      active ? "text-fg" : "text-muted hover:text-fg",
                    )}
                  >
                    {item.label}
                    {active && (
                      <span className="absolute inset-x-3.5 -bottom-px h-px bg-gradient-to-r from-transparent via-accent to-transparent" />
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>

          <div className="flex items-center gap-1.5">
            <ThemeToggle />
            <Link href="/contact" className="btn btn-primary btn-sm hidden md:inline-flex">
              Contact
            </Link>
            <button
              type="button"
              className="relative grid size-10 place-items-center rounded-full md:hidden"
              aria-expanded={open}
              aria-controls="mobile-menu"
              aria-label={open ? "Close menu" : "Open menu"}
              onClick={() => setOpen((o) => !o)}
            >
              <span
                className={cn(
                  "absolute h-px w-5 bg-fg transition-transform duration-300",
                  open ? "rotate-45" : "-translate-y-[4px]",
                )}
              />
              <span
                className={cn(
                  "absolute h-px w-5 bg-fg transition-transform duration-300",
                  open ? "-rotate-45" : "translate-y-[4px]",
                )}
              />
            </button>
          </div>
        </nav>
      </header>

      {/* Mobile menu: a full-height sheet with large, thumb-friendly targets. */}
      <div
        id="mobile-menu"
        ref={menuRef}
        className={cn(
          "fixed inset-0 z-40 flex flex-col bg-bg/95 px-5 pb-8 pt-24 backdrop-blur-xl transition-[opacity,visibility] duration-300 md:hidden",
          open ? "visible opacity-100" : "invisible opacity-0",
        )}
        aria-hidden={!open}
        inert={!open}
      >
        <ul className="flex flex-col">
          {[...nav, { href: "/contact", label: "Contact" }].map((item, i) => {
            const active = isActive(pathname, item.href);
            return (
              <li
                key={item.href}
                className={cn(
                  "border-b border-line transition-[opacity,transform] duration-500",
                  open ? "translate-y-0 opacity-100" : "translate-y-3 opacity-0",
                )}
                style={{ transitionDelay: open ? `${60 + i * 35}ms` : "0ms" }}
              >
                <Link
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  className="flex items-center justify-between py-4 text-3xl font-medium tracking-[-0.03em]"
                >
                  <span className={active ? "text-fg" : "text-muted"}>{item.label}</span>
                  <span className="font-mono text-xs text-subtle">0{i + 1}</span>
                </Link>
              </li>
            );
          })}
        </ul>
        <div className="mt-auto flex items-center justify-between text-sm text-muted">
          <div className="flex gap-2">
            <a href={socials.github} className="grid size-10 place-items-center rounded-full border border-line" aria-label="GitHub">
              <GitHubIcon />
            </a>
            <a href={socials.linkedin} className="grid size-10 place-items-center rounded-full border border-line" aria-label="LinkedIn">
              <LinkedInIcon />
            </a>
          </div>
          <a href={`mailto:${site.email}`} className="inline-flex items-center gap-1">
            {site.email} <ArrowUpRight size={14} />
          </a>
        </div>
      </div>
    </>
  );
}
