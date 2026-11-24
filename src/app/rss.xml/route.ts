import { getPosts } from "@/lib/content/queries";
import { site } from "@/content/site";
import { absoluteUrl } from "@/lib/seo";

const esc = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

/** RSS 2.0 feed of published posts. Prerendered, refreshed with the post cache. */
export async function GET() {
  const posts = await getPosts();
  const items = posts
    .slice(0, 50)
    .map((p) => {
      const url = absoluteUrl(`/blog/${p.slug}`);
      return `    <item>
      <title>${esc(p.title)}</title>
      <link>${url}</link>
      <guid isPermaLink="true">${url}</guid>
      <pubDate>${new Date(p.published_at!).toUTCString()}</pubDate>
      ${p.subtitle ? `<description>${esc(p.subtitle)}</description>` : ""}
      ${p.tags.map((t) => `<category>${esc(t)}</category>`).join("")}
    </item>`;
    })
    .join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${esc(site.name)}</title>
    <link>${absoluteUrl("/blog")}</link>
    <description>${esc(site.tagline)}</description>
    <language>en</language>
    <atom:link href="${absoluteUrl("/rss.xml")}" rel="self" type="application/rss+xml"/>
${items}
  </channel>
</rss>`;
  return new Response(xml, { headers: { "Content-Type": "application/rss+xml; charset=utf-8" } });
}
