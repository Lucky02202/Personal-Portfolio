import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import type { PostSummary } from "@/lib/content/queries";
import { formatDate, cn } from "@/lib/utils";
import { GeneratedCover } from "@/components/ui/primitives";

export type CategoryNames = Record<string, string>;

function Cover({ post, label, className, sizes }: { post: PostSummary; label?: string; className?: string; sizes: string }) {
  if (post.cover_url) {
    return (
      <div className={cn("relative overflow-hidden bg-sunken", className)}>
        <Image
          src={post.cover_url}
          alt={post.cover_alt ?? ""}
          fill
          sizes={sizes}
          className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03]"
        />
      </div>
    );
  }
  return <GeneratedCover seed={post.slug} label={label} className={className} />;
}

function Meta({ post, category }: { post: PostSummary; category?: string }) {
  return (
    <p className="flex flex-wrap items-center gap-x-2 gap-y-1 font-mono text-xs text-subtle">
      {category && <span className="text-accent">{category}</span>}
      {category && <span aria-hidden="true">·</span>}
      <time dateTime={post.published_at ?? undefined}>{formatDate(post.published_at)}</time>
      <span aria-hidden="true">·</span>
      <span>{post.reading_minutes} min read</span>
    </p>
  );
}

export function PostCard({ post, categories }: { post: PostSummary; categories: CategoryNames }) {
  const category = post.category ? categories[post.category] : undefined;
  return (
    <Link href={`/blog/${post.slug}`} className="card group flex h-full flex-col overflow-hidden" prefetch>
      <Cover post={post} label={category} className="aspect-[16/9] border-b border-line" sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw" />
      <div className="flex flex-1 flex-col p-5 sm:p-6">
        <Meta post={post} category={category} />
        <h3 className="mt-3 text-lg font-semibold leading-snug tracking-[-0.02em] text-fg">{post.title}</h3>
        {post.subtitle && <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-muted">{post.subtitle}</p>}
        {post.tags.length > 0 && (
          <div className="mt-auto flex flex-wrap gap-1.5 pt-5">
            {post.tags.slice(0, 3).map((t) => (
              <span key={t} className="font-mono text-[11px] text-subtle">
                #{t}
              </span>
            ))}
          </div>
        )}
      </div>
    </Link>
  );
}

export function FeaturedPostCard({ post, categories }: { post: PostSummary; categories: CategoryNames }) {
  const category = post.category ? categories[post.category] : undefined;
  return (
    <Link href={`/blog/${post.slug}`} className="card group grid overflow-hidden md:grid-cols-[1.15fr_1fr]" prefetch>
      <Cover post={post} label={category} className="aspect-[16/10] border-b border-line md:aspect-auto md:min-h-[320px] md:border-b-0 md:border-r" sizes="(min-width: 768px) 55vw, 100vw" />
      <div className="flex flex-col p-6 sm:p-8">
        <span className="chip w-fit">
          <span className="pulse-dot" aria-hidden="true" /> Featured
        </span>
        <h3 className="mt-5 text-2xl font-semibold leading-tight tracking-[-0.03em] text-fg sm:text-3xl">{post.title}</h3>
        {post.subtitle && <p className="mt-3 leading-relaxed text-muted">{post.subtitle}</p>}
        <div className="mt-auto flex items-end justify-between gap-4 pt-8">
          <Meta post={post} category={category} />
          <span className="grid size-10 shrink-0 place-items-center rounded-full border border-line-strong transition-colors group-hover:border-accent group-hover:bg-accent group-hover:text-accent-ink">
            <ArrowUpRight size={16} />
          </span>
        </div>
      </div>
    </Link>
  );
}

/** Compact row for lists ("Recent", "Related", homepage). */
export function PostRow({ post, categories }: { post: PostSummary; categories: CategoryNames }) {
  const category = post.category ? categories[post.category] : undefined;
  return (
    <Link
      href={`/blog/${post.slug}`}
      className="group grid grid-cols-1 gap-2 border-b border-line py-5 transition-colors sm:grid-cols-[120px_1fr_auto] sm:items-baseline sm:gap-6"
      prefetch
    >
      <time dateTime={post.published_at ?? undefined} className="font-mono text-xs text-subtle">
        {formatDate(post.published_at)}
      </time>
      <div className="min-w-0">
        <h3 className="font-medium tracking-[-0.01em] text-fg transition-colors group-hover:text-accent">{post.title}</h3>
        {post.subtitle && <p className="mt-1 line-clamp-1 text-sm text-muted">{post.subtitle}</p>}
      </div>
      <span className="hidden font-mono text-xs text-subtle sm:block">
        {category ? `${category} · ` : ""}
        {post.reading_minutes}m
      </span>
    </Link>
  );
}
