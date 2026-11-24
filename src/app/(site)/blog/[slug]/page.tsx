import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { ArrowUpRight } from "lucide-react";
import { getCategories, getPost, getPosts, type PostSummary } from "@/lib/content/queries";
import { site } from "@/content/site";
import { Container } from "@/components/ui/primitives";
import { Article } from "@/components/blog/article";
import { PostCard, PostRow } from "@/components/blog/post-card";
import { absoluteUrl, jsonLd, pageMetadata } from "@/lib/seo";

export async function generateStaticParams() {
  const posts = await getPosts();
  // Cache Components needs at least one param to validate the route at build time.
  return posts.length ? posts.map((p) => ({ slug: p.slug })) : [{ slug: "__none" }];
}

export async function generateMetadata({ params }: PageProps<"/blog/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const data = await getPost(slug);
  if (!data) return { title: "Post not found" };
  const { post } = data;
  return pageMetadata({
    title: post.seo_title || post.title,
    description: post.seo_description || post.subtitle || undefined,
    path: `/blog/${post.slug}`,
    type: "article",
    publishedTime: post.published_at ?? undefined,
    modifiedTime: post.updated_at,
    tags: post.tags,
    image: post.cover_url ?? undefined,
  });
}

/** Score other posts by shared category and tags. */
function related(post: PostSummary, all: PostSummary[]) {
  return all
    .filter((p) => p.id !== post.id)
    .map((p) => ({
      p,
      score: (p.category === post.category ? 2 : 0) + p.tags.filter((t) => post.tags.includes(t)).length,
    }))
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 3)
    .map((x) => x.p);
}

export default function PostPage(props: PageProps<"/blog/[slug]">) {
  return (
    <Suspense fallback={<ArticleSkeleton />}>
      <PostContent params={props.params} />
    </Suspense>
  );
}

async function PostContent({ params }: Pick<PageProps<"/blog/[slug]">, "params">) {
  const { slug } = await params;
  const [data, all, categories] = await Promise.all([getPost(slug), getPosts(), getCategories()]);
  if (!data) notFound();

  const { post, html, toc } = data;
  const names = Object.fromEntries(categories.map((c) => [c.slug, c.name]));
  const relatedPosts = related(post, all);
  const recent = all.filter((p) => p.id !== post.id && !relatedPosts.includes(p)).slice(0, 4);
  const url = absoluteUrl(`/blog/${post.slug}`);

  const schema = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.seo_description || post.subtitle || undefined,
    datePublished: post.published_at,
    dateModified: post.updated_at,
    url,
    mainEntityOfPage: url,
    image: post.cover_url ?? undefined,
    keywords: post.tags.join(", "),
    articleSection: post.category ? names[post.category] : undefined,
    timeRequired: `PT${post.reading_minutes}M`,
    author: { "@type": "Person", name: site.name, url: site.url },
  };

  return (
    <Container>
      <script type="application/ld+json" dangerouslySetInnerHTML={jsonLd(schema)} />
      <Article
        post={post}
        html={html}
        toc={toc}
        categoryName={post.category ? names[post.category] : undefined}
        footer={
          <aside className="card mt-16 flex max-w-[68ch] flex-col gap-4 p-6 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="font-medium text-fg">Thanks for reading.</p>
              <p className="mt-1 text-sm text-muted">Questions, corrections or a different opinion? I&apos;d like to hear it.</p>
            </div>
            <Link href="/contact" className="btn btn-ghost btn-sm shrink-0">
              Write to me <ArrowUpRight size={14} />
            </Link>
          </aside>
        }
      />

      {relatedPosts.length > 0 && (
        <section aria-labelledby="related" className="mx-auto mt-24 max-w-5xl">
          <h2 id="related" className="eyebrow mb-6">
            Related
          </h2>
          <div className="grid gap-4 md:grid-cols-3">
            {relatedPosts.map((p) => (
              <PostCard key={p.id} post={p} categories={names} />
            ))}
          </div>
        </section>
      )}

      {recent.length > 0 && (
        <section aria-labelledby="recent" className="mx-auto mt-20 max-w-5xl">
          <h2 id="recent" className="eyebrow mb-2">
            Recent posts
          </h2>
          <div>
            {recent.map((p) => (
              <PostRow key={p.id} post={p} categories={names} />
            ))}
          </div>
        </section>
      )}
    </Container>
  );
}

function ArticleSkeleton() {
  return (
    <Container>
      <div className="mx-auto max-w-3xl animate-pulse pt-28" aria-hidden="true">
        <div className="h-3 w-24 rounded bg-surface-hover" />
        <div className="mt-6 h-12 w-4/5 rounded bg-surface-hover" />
        <div className="mt-4 h-6 w-3/5 rounded bg-surface-hover" />
        <div className="mt-16 space-y-3">
          {Array.from({ length: 6 }, (_, i) => (
            <div key={i} className="h-4 rounded bg-surface" />
          ))}
        </div>
      </div>
    </Container>
  );
}
