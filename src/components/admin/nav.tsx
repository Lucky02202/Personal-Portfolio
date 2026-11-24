"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Briefcase, Download, FolderKanban, Inbox, LayoutGrid, PenLine, Radio, Tags } from "lucide-react";
import { cn } from "@/lib/utils";

const items = [
  { href: "/admin", label: "Overview", icon: LayoutGrid },
  { href: "/admin/posts", label: "Posts", icon: PenLine },
  { href: "/admin/now", label: "Currently", icon: Radio },
  { href: "/admin/projects", label: "Projects", icon: FolderKanban },
  { href: "/admin/downloads", label: "Downloads", icon: Download },
  { href: "/admin/experience", label: "Experience", icon: Briefcase },
  { href: "/admin/categories", label: "Categories", icon: Tags },
  { href: "/admin/messages", label: "Inbox", icon: Inbox },
];

export function AdminNav() {
  const pathname = usePathname();
  return (
    <nav aria-label="Admin" className="no-scrollbar flex gap-1 overflow-x-auto px-3 pb-3 md:flex-col md:px-3 md:pb-0">
      {items.map(({ href, label, icon: Icon }) => {
        const active = href === "/admin" ? pathname === "/admin" : pathname.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "flex shrink-0 items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition-colors",
              active ? "bg-surface-hover text-fg" : "text-muted hover:bg-surface hover:text-fg",
            )}
          >
            <Icon size={15} className={active ? "text-accent" : undefined} />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
