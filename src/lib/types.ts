/**
 * Content types. These mirror the Postgres tables in
 * `supabase/migrations/0001_init.sql` one-to-one (snake_case on purpose),
 * so the same shape flows from the database, the starter content and the admin.
 */

export type PostStatus = "draft" | "published";

export interface Category {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  sort: number;
}

export interface Post {
  id: string;
  slug: string;
  title: string;
  subtitle: string | null;
  content: string; // Markdown (GFM)
  cover_url: string | null;
  cover_alt: string | null;
  category: string | null; // category slug
  tags: string[];
  status: PostStatus;
  /** When the post goes live. In the future + status "published" = scheduled. */
  published_at: string | null;
  featured: boolean;
  /** Manual override; computed from the content when null. */
  reading_minutes: number | null;
  seo_title: string | null;
  seo_description: string | null;
  created_at: string;
  updated_at: string;
}

export type ProjectCategory = "professional" | "personal" | "experiment" | "open-source";
export type ProjectStatus = "building" | "shipped" | "maintained" | "paused" | "archived";
export type Visibility = "public" | "confidential";

export interface ProjectImage {
  url: string;
  alt: string;
}

export interface Project {
  id: string;
  slug: string;
  title: string;
  summary: string;
  description: string; // Markdown
  category: ProjectCategory;
  status: ProjectStatus;
  /**
   * "confidential" projects are rendered from summary/description/role/tech/learnings only.
   * Links and images are stripped on the server before anything reaches the browser.
   */
  visibility: Visibility;
  role: string | null;
  tech: string[];
  cover_url: string | null;
  images: ProjectImage[];
  github_url: string | null;
  demo_url: string | null;
  started_at: string | null; // YYYY-MM-DD
  ended_at: string | null;
  learnings: string[];
  challenges: string[];
  outcome: string | null;
  featured: boolean;
  published: boolean;
  sort: number;
  created_at: string;
  updated_at: string;
}

export interface Download {
  id: string;
  slug: string;
  title: string;
  description: string;
  category: string;
  file_url: string;
  file_name: string | null;
  file_type: string; // extension, e.g. "pdf"
  file_size: number | null; // bytes
  preview_url: string | null;
  published: boolean;
  download_count: number;
  created_at: string;
  updated_at: string;
}

export interface Experience {
  id: string;
  company: string;
  role: string;
  location: string | null;
  employment_type: string | null;
  start_date: string; // YYYY-MM-DD
  end_date: string | null; // null = present
  description: string | null;
  responsibilities: string[];
  contributions: string[];
  tech: string[];
  published: boolean;
  sort: number;
  created_at: string;
  updated_at: string;
}

export type NowKind = "building" | "learning" | "exploring" | "reading" | "writing";

export interface NowItem {
  id: string;
  kind: NowKind;
  title: string;
  detail: string | null;
  href: string | null;
  /** Highlighted items rotate in the hero ticker. */
  highlight: boolean;
  published: boolean;
  sort: number;
  created_at: string;
  updated_at: string;
}

export interface Message {
  id: string;
  name: string;
  email: string;
  subject: string | null;
  body: string;
  read: boolean;
  created_at: string;
}

export interface TocItem {
  id: string;
  text: string;
  depth: 2 | 3;
}
