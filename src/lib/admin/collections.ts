/**
 * Admin collection definitions. One schema per table drives:
 *  - the list page   (columns)
 *  - the edit form   (fields, rendered by <RecordForm />)
 *  - validation      (buildValidator() in actions.ts: the server never trusts the form)
 *
 * Adding a field: add the column in a migration, then add it here.
 * Adding a collection (e.g. a reading list): new table + new entry here.
 */
import { projectCategories, projectStatuses, nowKinds } from "@/content/site";

export type FieldType =
  | "text"
  | "slug"
  | "textarea"
  | "markdown"
  | "select"
  | "tags" // comma-separated → text[]
  | "lines" // one per line → text[]
  | "date"
  | "url" // http(s) only
  | "href" // internal path (/…) or http(s) URL
  | "image" // uploaded to storage → public URL
  | "images" // gallery → jsonb [{url, alt}]
  | "file" // uploaded to storage → file_url + name/type/size
  | "boolean"
  | "number";

export interface Field {
  name: string;
  label: string;
  type: FieldType;
  required?: boolean;
  help?: string;
  placeholder?: string;
  options?: { value: string; label: string }[];
  /** For slug fields: the field to generate from. */
  from?: string;
  /** Layout hint: half-width on wide screens. */
  half?: boolean;
  /** Suggestions for free-text fields. */
  suggestions?: string[];
  /** Initial value for new records. */
  defaultValue?: unknown;
}

export interface Collection {
  key: string;
  table: string;
  label: string;
  singular: string;
  description: string;
  /** Cache tag(s) to refresh after writes (see lib/content/queries.ts). */
  tags: string[];
  /** Public path to revalidate per record, if any. */
  publicPath?: (row: Record<string, unknown>) => string;
  order: { column: string; ascending: boolean }[];
  columns: { name: string; label: string; kind?: "badge" | "bool" | "date" }[];
  titleField: string;
  fields: Field[];
}

const opts = (o: Record<string, string>) => Object.entries(o).map(([value, label]) => ({ value, label }));

export const collections: Record<string, Collection> = {
  projects: {
    key: "projects",
    table: "projects",
    label: "Projects",
    singular: "project",
    description: "Professional work, side projects and experiments.",
    tags: ["projects"],
    publicPath: (r) => `/projects/${r.slug}`,
    order: [
      { column: "sort", ascending: true },
      { column: "created_at", ascending: false },
    ],
    titleField: "title",
    columns: [
      { name: "category", label: "Category", kind: "badge" },
      { name: "status", label: "Status", kind: "badge" },
      { name: "visibility", label: "Visibility", kind: "badge" },
      { name: "published", label: "Public", kind: "bool" },
    ],
    fields: [
      { name: "title", label: "Title", type: "text", required: true },
      { name: "slug", label: "URL slug", type: "slug", from: "title", required: true, half: true },
      { name: "category", label: "Category", type: "select", options: opts(projectCategories), required: true, half: true },
      {
        name: "visibility",
        label: "Visibility",
        type: "select",
        required: true,
        half: true,
        options: [
          { value: "public", label: "Public: show everything" },
          { value: "confidential", label: "Confidential: high-level only" },
        ],
        help: "Confidential projects never show links, cover images or screenshots, even if they're filled in. Keep company and client names out of every field.",
      },
      { name: "status", label: "Status", type: "select", options: opts(projectStatuses), required: true, half: true },
      { name: "summary", label: "Short description", type: "textarea", required: true, help: "One or two sentences, shown on cards." },
      { name: "description", label: "Detailed description", type: "markdown", help: "Markdown. Shown on the project page." },
      { name: "role", label: "My role", type: "text", half: true },
      { name: "tech", label: "Technologies", type: "tags", placeholder: "Power Apps, SharePoint, …", half: true },
      { name: "started_at", label: "Started", type: "date", half: true },
      { name: "ended_at", label: "Ended", type: "date", half: true, help: "Leave empty if ongoing." },
      { name: "learnings", label: "Key things I learned", type: "lines", help: "One per line." },
      { name: "challenges", label: "Challenges", type: "lines", help: "One per line." },
      { name: "outcome", label: "Outcome", type: "textarea" },
      { name: "github_url", label: "GitHub URL", type: "url", half: true },
      { name: "demo_url", label: "Live demo URL", type: "url", half: true },
      { name: "cover_url", label: "Cover image", type: "image" },
      { name: "images", label: "Screenshots", type: "images" },
      { name: "featured", label: "Feature on the homepage", type: "boolean", half: true },
      { name: "published", label: "Published", type: "boolean", half: true },
      { name: "sort", label: "Sort order", type: "number", half: true, help: "Lower numbers first." },
    ],
  },

  downloads: {
    key: "downloads",
    table: "downloads",
    label: "Downloads",
    singular: "resource",
    description: "Files in the resource library.",
    tags: ["downloads"],
    order: [{ column: "created_at", ascending: false }],
    titleField: "title",
    columns: [
      { name: "category", label: "Category", kind: "badge" },
      { name: "file_type", label: "Type", kind: "badge" },
      { name: "download_count", label: "Downloads" },
      { name: "published", label: "Public", kind: "bool" },
    ],
    fields: [
      { name: "title", label: "Title", type: "text", required: true },
      { name: "slug", label: "URL slug", type: "slug", from: "title", required: true, half: true },
      {
        name: "category",
        label: "Category",
        type: "text",
        required: true,
        half: true,
        suggestions: ["Power Apps", "Power Automate", "Excel", "Templates", "Guides", "Checklists", "Developer notes", "Presentations"],
      },
      { name: "description", label: "Description", type: "textarea", required: true },
      { name: "file_url", label: "File", type: "file", required: true, help: "PDF, Excel, Word, PowerPoint, ZIP, Markdown… up to 50 MB." },
      { name: "preview_url", label: "Preview image", type: "image", help: "Optional. A file-type icon is shown otherwise." },
      { name: "published", label: "Published", type: "boolean" },
    ],
  },

  experience: {
    key: "experience",
    table: "experience",
    label: "Experience",
    singular: "role",
    description: "Your professional timeline.",
    tags: ["experience"],
    order: [{ column: "start_date", ascending: false }],
    titleField: "role",
    columns: [
      { name: "company", label: "Company" },
      { name: "start_date", label: "Start", kind: "date" },
      { name: "end_date", label: "End", kind: "date" },
      { name: "published", label: "Public", kind: "bool" },
    ],
    fields: [
      { name: "role", label: "Role", type: "text", required: true, half: true },
      { name: "company", label: "Company", type: "text", required: true, half: true, help: "Use a generic description if the name is confidential." },
      { name: "location", label: "Location", type: "text", half: true },
      { name: "employment_type", label: "Type", type: "text", half: true, suggestions: ["Full-time", "Contract", "Internship", "Freelance", "Part-time"] },
      { name: "start_date", label: "Start date", type: "date", required: true, half: true },
      { name: "end_date", label: "End date", type: "date", half: true, help: "Leave empty for your current role." },
      { name: "description", label: "Description", type: "textarea" },
      { name: "responsibilities", label: "Responsibilities", type: "lines", help: "One per line." },
      { name: "contributions", label: "Major contributions", type: "lines", help: "One per line." },
      { name: "tech", label: "Technologies", type: "tags" },
      { name: "published", label: "Published", type: "boolean", half: true, defaultValue: true },
      { name: "sort", label: "Sort order", type: "number", half: true },
    ],
  },

  now: {
    key: "now",
    table: "now_items",
    label: "Currently",
    singular: "item",
    description: "What you're building, learning, exploring, reading and writing right now.",
    tags: ["now"],
    order: [{ column: "sort", ascending: true }],
    titleField: "title",
    columns: [
      { name: "kind", label: "Kind", kind: "badge" },
      { name: "highlight", label: "In hero", kind: "bool" },
      { name: "published", label: "Public", kind: "bool" },
      { name: "updated_at", label: "Updated", kind: "date" },
    ],
    fields: [
      { name: "kind", label: "Kind", type: "select", required: true, options: Object.entries(nowKinds).map(([value, k]) => ({ value, label: k.label })), half: true },
      { name: "title", label: "Title", type: "text", required: true, half: true },
      { name: "detail", label: "Detail", type: "textarea", help: "A short line of context." },
      { name: "href", label: "Link", type: "href", placeholder: "/projects/… or https://…", help: "Optional. Internal path or full URL." },
      { name: "highlight", label: "Rotate in the hero ticker", type: "boolean", half: true },
      { name: "published", label: "Published", type: "boolean", half: true, defaultValue: true },
      { name: "sort", label: "Sort order", type: "number", half: true },
    ],
  },

  categories: {
    key: "categories",
    table: "categories",
    label: "Categories",
    singular: "category",
    description: "Blog categories.",
    tags: ["categories", "posts"],
    order: [{ column: "sort", ascending: true }],
    titleField: "name",
    columns: [
      { name: "slug", label: "Slug" },
      { name: "sort", label: "Order" },
    ],
    fields: [
      { name: "name", label: "Name", type: "text", required: true, half: true },
      { name: "slug", label: "Slug", type: "slug", from: "name", required: true, half: true, help: "Changing it updates existing posts automatically." },
      { name: "description", label: "Description", type: "textarea" },
      { name: "sort", label: "Sort order", type: "number" },
    ],
  },
};

export function getCollection(key: string): Collection | null {
  return Object.hasOwn(collections, key) ? collections[key] : null;
}
