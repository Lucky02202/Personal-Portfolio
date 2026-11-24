import { site } from "@/content/site";
import { ogImage, ogSize } from "@/lib/og";

export const size = ogSize;
export const contentType = "image/png";
export const alt = site.name;

export default function Image() {
  return ogImage({ eyebrow: site.role, title: `Hi, I'm ${site.firstName}.`, subtitle: site.tagline });
}
