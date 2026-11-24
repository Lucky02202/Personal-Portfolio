import Image from "next/image";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import type { PostSummary } from "@/lib/content/queries";
import type { TocItem } from "@/lib/types";
import { site } from "@/content/site";
import { formatDate } from "@/lib/utils";
import { GeneratedCover } from "@/components/ui/primitives";
import { ReadingProgress, Toc } from "./toc";

/**
 * The article layout. Shared by the public post page and the admin preview,
 * so what you preview is exactly what gets published.
 */
export function Article({
  post,
  html,
  toc,
  categoryName,
  preview = false,
  compact = false,
  footer,
}: {
  post: Pick<
    PostSummary,
    | "title"
    | "subtitle"
    | "slug"
    | "cover_url"
    | "cover_alt"
    | "tags"
    | "published_at"
    | "reading_minutes"
    | "updated_at"
  >;
  html: string;
  toc: TocItem[];
  categoryName?: string;
  preview?: boolean;
  /** Single column, no table of contents (used by the editor's split view). */
  compact?: boolean;
  footer?: React.ReactNode;
}) {
  return (
    <article>
      {!preview && <ReadingProgress />}
      <header className="mx-auto max-w-5xl pb-10 pt-12 sm:pt-20">
        <div className="max-w-3xl">
          {!preview && (
            <Link
              href="/blog"
              className="group inline-flex items-center gap-1.5 font-mono text-xs text-subtle hover:text-fg"
            >
              <ArrowLeft
                size={13}
                className="transition-transform group-hover:-translate-x-0.5"
              />{" "}
              All posts
            </Link>
          )}
          <p className="rise mt-8 font-mono text-xs uppercase tracking-[0.1em] text-accent">
            {categoryName ?? "Note"}
          </p>
          <h1
            className="rise mt-4 text-[clamp(2.1rem,5vw,3.4rem)] font-semibold leading-[1.08] tracking-[-0.04em] text-fg"
            style={{ "--d": "60ms" } as React.CSSProperties}
          >
            {post.title || "Untitled"}
          </h1>
          {post.subtitle && (
            <p
              className="rise mt-5 text-xl leading-relaxed text-muted"
              style={{ "--d": "120ms" } as React.CSSProperties}
            >
              {post.subtitle}
            </p>
          )}
          <div
            className="rise mt-8 flex flex-wrap items-center gap-x-4 gap-y-3 border-y border-line py-4 text-sm"
            style={{ "--d": "180ms" } as React.CSSProperties}
          >
            <span className="flex items-center gap-2.5">
              <span className="grid size-8 place-items-center rounded-full border border-line-strong bg-surface font-mono text-[10px] font-semibold text-fg">
                {site.initials}
              </span>
              <span className="text-fg">{site.name}</span>
            </span>
            <span className="font-mono text-xs text-subtle">
              {post.published_at ? (
                <time dateTime={post.published_at}>
                  {formatDate(post.published_at)}
                </time>
              ) : (
                "Not published"
              )}{" "}
              · {post.reading_minutes} min read
            </span>
            {post.tags.length > 0 && (
              <ul
                className="flex flex-wrap gap-1.5 sm:ml-auto"
                aria-label="Tags"
              >
                {post.tags.map((t) => (
                  <li key={t}>
                    {preview ? (
                      <span className="chip">#{t}</span>
                    ) : (
                      <Link
                        href={`/blog?tag=${encodeURIComponent(t)}`}
                        className="chip hover:text-fg"
                      >
                        #{t}
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </header>

      <div className="mx-auto mb-12 max-w-5xl">
        {post.cover_url ? (
          <div className="relative aspect-[2/1] overflow-hidden rounded-2xl border border-line bg-sunken">
            <Image
              src={post.cover_url}
              alt={post.cover_alt ?? ""}
              fill
              priority
              sizes="(min-width: 1024px) 1024px, 100vw"
              className="object-cover"
            />
          </div>
        ) : (
          <GeneratedCover
            seed={post.slug || post.title}
            className="aspect-[4/1] rounded-2xl border border-line"
          />
        )}
      </div>

      <div className={compact ? "mx-auto max-w-5xl" : "mx-auto grid max-w-5xl gap-12 lg:grid-cols-[minmax(0,1fr)_220px]"}>
        <div className="min-w-0">
          {!compact && toc.length > 2 && (
            <details className="card mb-10 p-4 lg:hidden">
              <summary className="cursor-pointer font-mono text-xs uppercase tracking-[0.08em] text-subtle">
                On this page
              </summary>
              <div className="mt-4">
                <Toc items={toc} />
              </div>
            </details>
          )}
          <div
            id="article-body"
            className="prose max-w-[68ch]"
            dangerouslySetInnerHTML={{ __html: html }}
          />
          {footer}
        </div>
        {!compact && toc.length > 0 && (
          <aside className="hidden lg:block" aria-label="Table of contents">
            <div className="sticky top-28">
              <p className="eyebrow mb-4">On this page</p>
              <Toc items={toc} />
            </div>
          </aside>
        )}
      </div>
    </article>
  );
}
