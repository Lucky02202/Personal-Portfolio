import { getPost, getPosts } from "@/lib/content/queries";
import { ogImage, ogSize } from "@/lib/og";

export const size = ogSize;
export const contentType = "image/png";
export const alt = "Blog post";

export async function generateStaticParams() {
  const posts = await getPosts();
  return posts.length ? posts.map((p) => ({ slug: p.slug })) : [{ slug: "__none" }];
}

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const data = await getPost(slug);
  return ogImage({
    eyebrow: "Blog",
    title: data?.post.title ?? "Writing",
    subtitle: data?.post.subtitle,
  });
}
