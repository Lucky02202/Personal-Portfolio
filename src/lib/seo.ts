import type { Metadata } from "next";
import { site, socials } from "@/content/site";

export function absoluteUrl(path = "/") {
  return new URL(path, site.url).toString();
}

/** Consistent per-page metadata with canonical URL and social cards. */
export function pageMetadata({
  title,
  description,
  path,
  type = "website",
  publishedTime,
  modifiedTime,
  tags,
  image,
}: {
  title?: string;
  description?: string;
  path: string;
  type?: "website" | "article" | "profile";
  publishedTime?: string;
  modifiedTime?: string;
  tags?: string[];
  image?: string;
}): Metadata {
  const desc = description ?? site.description;
  return {
    title,
    description: desc,
    alternates: { canonical: path },
    openGraph: {
      type,
      url: path,
      title: title ?? site.name,
      description: desc,
      siteName: site.name,
      locale: site.locale,
      ...(image ? { images: [{ url: image }] } : {}),
      ...(type === "article"
        ? { publishedTime, modifiedTime, authors: [site.name], tags }
        : {}),
    },
    twitter: {
      card: "summary_large_image",
      title: title ?? site.name,
      description: desc,
      creator: site.twitterHandle,
      ...(image ? { images: [image] } : {}),
    },
  };
}

export function personJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Person",
    name: site.name,
    jobTitle: site.role,
    url: site.url,
    description: site.description,
    sameAs: [socials.github, socials.linkedin, socials.x].filter(Boolean),
  };
}

/** Serialize JSON-LD safely for a <script> tag. */
export function jsonLd(data: object) {
  return { __html: JSON.stringify(data).replace(/</g, "\\u003c") };
}
