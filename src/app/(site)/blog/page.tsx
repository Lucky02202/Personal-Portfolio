import { getCategories, getPosts } from "@/lib/content/queries";
import { Container, PageHeader } from "@/components/ui/primitives";
import { FeaturedPostCard } from "@/components/blog/post-card";
import { BlogExplorer } from "@/components/blog/blog-explorer";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Blog",
  description: "Notes, guides and opinions on development, Power Platform, AI, productivity and learning in public.",
  path: "/blog",
});

export default async function BlogPage() {
  const [posts, categories] = await Promise.all([getPosts(), getCategories()]);
  const featured = posts.find((p) => p.featured);
  const names = Object.fromEntries(categories.map((c) => [c.slug, c.name]));

  return (
    <Container>
      <PageHeader eyebrow="blog" title="Writing" accent="& thinking out loud.">
        <p>
          Things I&apos;ve learned, things I&apos;m figuring out, and the occasional opinion. Mostly development,
          Power Platform and AI.{" "}
          <a href="/rss.xml" className="text-fg underline decoration-accent underline-offset-4">
            RSS
          </a>{" "}
          if that&apos;s your thing.
        </p>
      </PageHeader>

      {featured && (
        <section aria-label="Featured post" className="mb-14">
          <FeaturedPostCard post={featured} categories={names} />
        </section>
      )}

      <section aria-label="All posts">
        <BlogExplorer posts={posts} categories={categories} />
      </section>
    </Container>
  );
}
