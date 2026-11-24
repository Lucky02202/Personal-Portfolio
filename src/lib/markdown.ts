import "server-only";
import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkGfm from "remark-gfm";
import remarkRehype from "remark-rehype";
import rehypeSanitize, { defaultSchema, type Options as SanitizeSchema } from "rehype-sanitize";
import rehypeSlug from "rehype-slug";
import rehypeAutolinkHeadings from "rehype-autolink-headings";
import rehypePrettyCode from "rehype-pretty-code";
import rehypeStringify from "rehype-stringify";
import { bundledLanguages } from "shiki";
import { visit } from "unist-util-visit";
import { toString } from "hast-util-to-string";
import type { Element, Root } from "hast";
import type { TocItem } from "@/lib/types";

/**
 * One renderer for everything: published articles, project write-ups and the
 * admin preview. Markdown → sanitized HTML → highlighted code.
 *
 * Raw HTML in Markdown is dropped (not just escaped) and the output is sanitized
 * before highlighting, so even a compromised admin account can't inject scripts.
 */

const schema: SanitizeSchema = {
  ...defaultSchema,
  // Keep heading ids unprefixed; rehype-slug adds them after sanitizing anyway.
  clobberPrefix: "",
  attributes: {
    ...defaultSchema.attributes,
    code: [...(defaultSchema.attributes?.code ?? []), ["className", /^language-./]],
    // GFM footnotes and task lists
    li: [...(defaultSchema.attributes?.li ?? []), ["className", "task-list-item"]],
    input: [...(defaultSchema.attributes?.input ?? []), ["type", "checkbox"], "checked", "disabled"],
  },
};

const knownLangs = new Set([...Object.keys(bundledLanguages), "text", "plaintext", "txt", "ansi"]);

/** Unknown languages (e.g. ```powerfx) fall back to plain text instead of failing. */
function normalizeCodeLanguages() {
  return (tree: Root) => {
    visit(tree, "element", (node: Element) => {
      if (node.tagName !== "code") return;
      const cls = (node.properties.className as string[] | undefined) ?? [];
      const lang = cls.find((c) => c.startsWith("language-"))?.slice(9);
      if (lang && !knownLangs.has(lang)) {
        node.properties.className = ["language-text"];
      }
    });
  };
}

function enhance(toc: TocItem[]) {
  return () => (tree: Root) => {
    visit(tree, "element", (node: Element) => {
      if ((node.tagName === "h2" || node.tagName === "h3") && node.properties.id) {
        toc.push({ id: String(node.properties.id), text: toString(node).trim(), depth: node.tagName === "h2" ? 2 : 3 });
      }
      if (node.tagName === "img") {
        node.properties.loading = "lazy";
        node.properties.decoding = "async";
      }
      if (node.tagName === "a" && typeof node.properties.href === "string" && /^https?:\/\//.test(node.properties.href)) {
        node.properties.target = "_blank";
        node.properties.rel = ["noopener", "noreferrer"];
      }
      if (node.tagName === "table") {
        // Wrap tables so they can scroll horizontally on small screens.
        const table: Element = { ...node };
        node.tagName = "div";
        node.properties = { className: ["table-wrap"] };
        node.children = [table];
        return "skip";
      }
    });
  };
}

/** Adds a copy button to each highlighted code block (handled by the boot script). */
function copyButtons() {
  return (tree: Root) => {
    visit(tree, "element", (node: Element) => {
      if (node.tagName !== "figure" || !("dataRehypePrettyCodeFigure" in node.properties)) return;
      node.children.push({
        type: "element",
        tagName: "button",
        properties: { type: "button", className: ["copy-btn"], ariaLabel: "Copy code" },
        children: [{ type: "text", value: "Copy" }],
      });
      return "skip";
    });
  };
}

export async function renderMarkdown(markdown: string): Promise<{ html: string; toc: TocItem[] }> {
  const toc: TocItem[] = [];
  const file = await unified()
    .use(remarkParse)
    .use(remarkGfm)
    .use(remarkRehype)
    .use(rehypeSanitize, schema)
    .use(normalizeCodeLanguages)
    .use(rehypeSlug)
    .use(enhance(toc))
    .use(rehypeAutolinkHeadings, {
      behavior: "append",
      properties: { className: ["heading-anchor"], ariaLabel: "Link to this section", tabIndex: -1 },
      content: { type: "text", value: "#" },
    })
    .use(rehypePrettyCode, {
      theme: { dark: "github-dark-dimmed", light: "github-light" },
      keepBackground: false,
      defaultLang: { block: "text", inline: "text" },
    })
    .use(copyButtons)
    .use(rehypeStringify)
    .process(markdown);
  return { html: String(file), toc };
}
