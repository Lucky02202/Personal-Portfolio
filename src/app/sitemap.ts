import type { MetadataRoute } from "next";
import { getPosts, getProjects } from "@/lib/content/queries";
import { absoluteUrl } from "@/lib/seo";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [posts, projects] = await Promise.all([getPosts(), getProjects()]);
  const pages = ["/", "/about", "/projects", "/experience", "/blog", "/downloads", "/contact"].map((p) => ({
    url: absoluteUrl(p),
    changeFrequency: p === "/" || p === "/blog" ? ("weekly" as const) : ("monthly" as const),
    priority: p === "/" ? 1 : 0.7,
  }));
  return [
    ...pages,
    ...posts.map((p) => ({ url: absoluteUrl(`/blog/${p.slug}`), lastModified: p.updated_at, priority: 0.8 })),
    ...projects.map((p) => ({ url: absoluteUrl(`/projects/${p.slug}`), lastModified: p.updated_at, priority: 0.6 })),
  ];
}
