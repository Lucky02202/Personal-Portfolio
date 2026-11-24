export function cn(...parts: (string | false | null | undefined)[]) {
  return parts.filter(Boolean).join(" ");
}

const dateFmt = new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" });
const monthFmt = new Intl.DateTimeFormat("en-GB", { month: "short", year: "numeric", timeZone: "UTC" });

export function formatDate(value: string | null | undefined) {
  if (!value) return "";
  return dateFmt.format(new Date(value));
}

export function formatMonth(value: string | null | undefined) {
  if (!value) return "Present";
  return monthFmt.format(new Date(value));
}

export function formatRange(start: string | null, end: string | null) {
  if (!start) return "";
  return `${formatMonth(start)} — ${end ? formatMonth(end) : "Present"}`;
}

export function formatBytes(bytes: number | null | undefined) {
  if (!bytes && bytes !== 0) return "";
  if (bytes < 1024) return `${bytes} B`;
  const units = ["KB", "MB", "GB"];
  let n = bytes / 1024;
  let u = 0;
  while (n >= 1024 && u < units.length - 1) {
    n /= 1024;
    u++;
  }
  return `${n < 10 ? n.toFixed(1) : Math.round(n)} ${units[u]}`;
}

export function slugify(input: string) {
  return input
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

export function wordCount(markdown: string) {
  const text = markdown
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/`[^`]*`/g, " ")
    .replace(/!\[[^\]]*\]\([^)]*\)/g, " ")
    .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replace(/[#>*_~|-]/g, " ");
  return text.split(/\s+/).filter(Boolean).length;
}

/** ~220 wpm, plus a little for code blocks, which are read slowly. */
export function readingTime(markdown: string, override?: number | null) {
  if (override && override > 0) return override;
  const codeBlocks = (markdown.match(/```/g)?.length ?? 0) / 2;
  return Math.max(1, Math.round(wordCount(markdown) / 220 + codeBlocks * 0.3));
}

export function isExternal(href: string) {
  return /^https?:\/\//.test(href);
}
