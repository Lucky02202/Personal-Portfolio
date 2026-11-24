"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { forwardRef, useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState, useSyncExternalStore, useTransition } from "react";
import {
  ArrowLeft,
  Bold,
  CheckSquare,
  Code,
  Columns2,
  Eye,
  Heading2,
  Heading3,
  ImagePlus,
  Italic,
  Link2,
  List,
  ListOrdered,
  Loader2,
  Minus,
  PenLine,
  Quote,
  SquareCode,
  Strikethrough,
  Table,
  Trash2,
} from "lucide-react";
import { deletePost, previewMarkdown, savePost, type PostInput } from "@/lib/admin/actions";
import type { Category, Post, TocItem } from "@/lib/types";
import { applyFormat, insertText, shortcuts, type Format } from "./markdown-tools";
import { ImageInput, TagInput, Toggle } from "./inputs";
import { StatusBadge, postState } from "./status-badge";
import { Article } from "@/components/blog/article";
import { uploadFile } from "@/lib/admin/upload";
import { cn, readingTime, slugify, wordCount } from "@/lib/utils";

type Draft = Omit<Post, "id" | "created_at" | "updated_at">;
type Mode = "write" | "split" | "preview";

const empty: Draft = {
  slug: "",
  title: "",
  subtitle: "",
  content: "",
  cover_url: null,
  cover_alt: "",
  category: null,
  tags: [],
  status: "draft",
  published_at: null,
  featured: false,
  reading_minutes: null,
  seo_title: "",
  seo_description: "",
};

/** ISO → value for <input type="datetime-local"> in the browser's time zone. */
function toLocalInput(iso: string | null) {
  if (!iso) return "";
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

/** The current time, refreshed every 30 seconds (enough to flip "Publish" ↔ "Schedule"). */
const subscribeClock = (cb: () => void) => {
  const t = setInterval(cb, 30_000);
  return () => clearInterval(t);
};
const readClock = () => Math.floor(Date.now() / 30_000) * 30_000;
function useNow() {
  return useSyncExternalStore(subscribeClock, readClock, readClock);
}

const tools: { f: Format; icon: React.ComponentType<{ size?: number }>; label: string; key?: string }[] = [
  { f: "h2", icon: Heading2, label: "Heading" },
  { f: "h3", icon: Heading3, label: "Subheading" },
  { f: "bold", icon: Bold, label: "Bold", key: "B" },
  { f: "italic", icon: Italic, label: "Italic", key: "I" },
  { f: "strike", icon: Strikethrough, label: "Strikethrough" },
  { f: "link", icon: Link2, label: "Link", key: "K" },
  { f: "quote", icon: Quote, label: "Quote" },
  { f: "ul", icon: List, label: "Bulleted list" },
  { f: "ol", icon: ListOrdered, label: "Numbered list" },
  { f: "task", icon: CheckSquare, label: "Checklist" },
  { f: "code", icon: Code, label: "Inline code", key: "E" },
  { f: "codeblock", icon: SquareCode, label: "Code block" },
  { f: "table", icon: Table, label: "Table" },
  { f: "hr", icon: Minus, label: "Divider" },
];

export function PostEditor({
  id: initialId,
  initial,
  categories,
  allTags,
}: {
  id: string | null;
  initial: Draft | null;
  categories: Category[];
  allTags: string[];
}) {
  const router = useRouter();
  const [id, setId] = useState(initialId);
  const [post, setPost] = useState<Draft>(initial ?? empty);
  const [saved, setSaved] = useState(JSON.stringify(initial ?? empty));
  const [slugTouched, setSlugTouched] = useState(Boolean(initial?.slug));
  const [mode, setMode] = useState<Mode>("write");
  const [preview, setPreview] = useState<{ html: string; toc: TocItem[] } | null>(null);
  const [previewing, setPreviewing] = useState(false);
  const [message, setMessage] = useState<{ tone: "ok" | "error"; text: string } | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [pending, startTransition] = useTransition();
  const [uploading, setUploading] = useState(0);
  const [publishAt, setPublishAt] = useState(toLocalInput(initial?.published_at ?? null));
  const textarea = useRef<HTMLTextAreaElement>(null);
  const imageInput = useRef<HTMLInputElement>(null);

  const dirty = JSON.stringify(post) !== saved;
  const state = postState(post.status, post.published_at);
  const words = useMemo(() => wordCount(post.content), [post.content]);
  const minutes = readingTime(post.content, post.reading_minutes);

  const set = <K extends keyof Draft>(key: K, value: Draft[K]) => setPost((p) => ({ ...p, [key]: value }));

  // Keep the slug in sync with the title until it's edited by hand.
  const setTitle = (title: string) =>
    setPost((p) => ({ ...p, title, slug: slugTouched ? p.slug : slugify(title) }));

  // Warn before leaving with unsaved changes.
  useEffect(() => {
    if (!dirty) return;
    const h = (e: BeforeUnloadEvent) => e.preventDefault();
    window.addEventListener("beforeunload", h);
    return () => window.removeEventListener("beforeunload", h);
  }, [dirty]);

  // Live preview, debounced, rendered by the same pipeline as the public site.
  useEffect(() => {
    if (mode === "write") return;
    const t = setTimeout(async () => {
      setPreviewing(true);
      try {
        setPreview(await previewMarkdown(post.content));
      } catch {
        setPreview({ html: "<p><em>Preview unavailable.</em></p>", toc: [] });
      } finally {
        setPreviewing(false);
      }
    }, 350);
    return () => clearTimeout(t);
  }, [post.content, mode]);

  const save = useCallback(
    (overrides: Partial<Draft> = {}, note?: string) => {
      const next = { ...post, ...overrides };
      setMessage(null);
      setFieldErrors({});
      startTransition(async () => {
        const payload: PostInput = {
          ...next,
          reading_minutes: next.reading_minutes ?? null,
        };
        const r = await savePost(id, payload);
        if (!r.ok) {
          setMessage({ tone: "error", text: r.error });
          setFieldErrors(r.fieldErrors ?? {});
          return;
        }
        const stored = { ...next, slug: r.slug, published_at: r.published_at };
        setPost(stored);
        setSaved(JSON.stringify(stored));
        setPublishAt(toLocalInput(r.published_at));
        setMessage({ tone: "ok", text: note ?? "Saved" });
        if (!id) {
          setId(r.id);
          router.replace(`/admin/posts/${r.id}`);
        }
      });
    },
    [id, post, router],
  );

  // Cmd/Ctrl+S saves, keeping the current status.
  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "s") {
        e.preventDefault();
        if (!pending) save();
      }
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [save, pending]);

  const now = useNow();
  const chosenDate = publishAt ? new Date(publishAt).toISOString() : null;
  const isFuture = chosenDate ? new Date(chosenDate).getTime() > now + 60_000 : false;

  function publish() {
    const when = chosenDate ?? new Date().toISOString();
    save({ status: "published", published_at: when }, isFuture ? "Scheduled" : "Published");
  }

  async function insertImages(files: File[]) {
    const el = textarea.current;
    if (!el) return;
    for (const file of files.filter((f) => f.type.startsWith("image/"))) {
      setUploading((n) => n + 1);
      try {
        const { url } = await uploadFile(file, "images");
        const alt = file.name.replace(/\.[^.]+$/, "").replace(/[-_]+/g, " ");
        insertText(el, `\n![${alt}](${url})\n`);
      } catch (e) {
        setMessage({ tone: "error", text: `Upload failed: ${(e as Error).message}` });
      } finally {
        setUploading((n) => n - 1);
      }
    }
  }

  const categoryName = categories.find((c) => c.slug === post.category)?.name;

  return (
    <div className="-mx-4 -my-8 sm:-mx-8 md:-my-10 lg:-mx-12">
      {/* ------------------------------------------------------------ top bar */}
      <div className="sticky top-0 z-30 flex flex-wrap items-center gap-3 border-b border-line bg-bg/85 px-4 py-3 backdrop-blur-xl sm:px-8 lg:px-12">
        <Link href="/admin/posts" className="inline-flex items-center gap-1.5 text-sm text-muted hover:text-fg">
          <ArrowLeft size={14} /> Posts
        </Link>
        <StatusBadge state={state} />
        <span className="font-mono text-[11px] text-subtle" aria-live="polite">
          {pending ? "Saving…" : uploading ? "Uploading image…" : dirty ? "Unsaved changes" : message?.tone === "ok" ? message.text : id ? "All changes saved" : "New post"}
        </span>

        <div className="ml-auto flex items-center gap-2">
          <div className="hidden rounded-full border border-line p-0.5 sm:flex" role="group" aria-label="Editor view">
            {(
              [
                ["write", PenLine, "Write"],
                ["split", Columns2, "Split"],
                ["preview", Eye, "Preview"],
              ] as const
            ).map(([m, Icon, label]) => (
              <button
                key={m}
                type="button"
                aria-pressed={mode === m}
                onClick={() => setMode(m)}
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs transition-colors",
                  mode === m ? "bg-surface-hover text-fg" : "text-muted hover:text-fg",
                  m === "split" && "hidden lg:inline-flex",
                )}
              >
                <Icon size={13} /> {label}
              </button>
            ))}
          </div>
          <button type="button" className="btn btn-ghost btn-sm sm:hidden" onClick={() => setMode(mode === "preview" ? "write" : "preview")}>
            {mode === "preview" ? <PenLine size={13} /> : <Eye size={13} />}
          </button>
          {post.status === "draft" ? (
            <>
              <button type="button" className="btn btn-ghost btn-sm" disabled={pending} onClick={() => save({ status: "draft" }, "Draft saved")}>
                Save draft
              </button>
              <button type="button" className="btn btn-primary btn-sm" disabled={pending} onClick={publish}>
                {pending && <Loader2 size={13} className="animate-spin" />}
                {isFuture ? "Schedule" : "Publish"}
              </button>
            </>
          ) : (
            <>
              <button type="button" className="btn btn-ghost btn-sm" disabled={pending} onClick={() => save({ status: "draft" }, state === "scheduled" ? "Unscheduled" : "Unpublished")}>
                {state === "scheduled" ? "Unschedule" : "Unpublish"}
              </button>
              <button type="button" className="btn btn-primary btn-sm" disabled={pending} onClick={() => save({ published_at: chosenDate ?? post.published_at }, "Updated")}>
                {pending && <Loader2 size={13} className="animate-spin" />}
                Update
              </button>
            </>
          )}
        </div>
        {message?.tone === "error" && (
          <p role="alert" className="w-full text-sm text-rose-400">
            {message.text}
          </p>
        )}
      </div>

      <div className="grid xl:grid-cols-[minmax(0,1fr)_320px]">
        {/* --------------------------------------------------------- canvas */}
        <div className={cn("min-w-0", mode === "split" && "lg:grid lg:grid-cols-2 lg:divide-x lg:divide-line")}>
          {mode !== "preview" && (
            <div className="px-4 py-8 sm:px-8 lg:px-12">
              <div className="mx-auto max-w-[72ch]">
                <AutoTextarea
                  value={post.title}
                  onChange={(e) => setTitle(e.target.value.replace(/\n/g, " "))}
                  placeholder="Title"
                  rows={1}
                  aria-label="Title"
                  aria-invalid={!!fieldErrors.title}
                  className="overflow-hidden w-full resize-none bg-transparent text-4xl font-semibold leading-tight tracking-[-0.035em] text-fg outline-none placeholder:text-subtle/60"
                />
                <AutoTextarea
                  value={post.subtitle ?? ""}
                  onChange={(e) => set("subtitle", e.target.value.replace(/\n/g, " "))}
                  placeholder="Subtitle: one line that makes people want to read"
                  rows={1}
                  aria-label="Subtitle"
                  className="overflow-hidden mt-3 w-full resize-none bg-transparent text-lg leading-relaxed text-muted outline-none placeholder:text-subtle/60"
                />

                {/* toolbar */}
                <div className="sticky top-[57px] z-20 -mx-2 mt-6 flex flex-wrap items-center gap-0.5 border-y border-line bg-bg/90 px-1 py-1.5 backdrop-blur" role="toolbar" aria-label="Formatting">
                  {tools.map(({ f, icon: Icon, label, key }) => (
                    <button
                      key={f}
                      type="button"
                      title={key ? `${label} (⌘${key})` : label}
                      aria-label={label}
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => textarea.current && applyFormat(textarea.current, f)}
                      className="grid size-8 place-items-center rounded-md text-muted transition-colors hover:bg-surface-hover hover:text-fg"
                    >
                      <Icon size={15} />
                    </button>
                  ))}
                  <span className="mx-1 h-5 w-px bg-line" />
                  <button
                    type="button"
                    title="Insert image (or paste / drop one)"
                    aria-label="Insert image"
                    onClick={() => imageInput.current?.click()}
                    className="grid size-8 place-items-center rounded-md text-muted hover:bg-surface-hover hover:text-fg"
                  >
                    {uploading ? <Loader2 size={15} className="animate-spin" /> : <ImagePlus size={15} />}
                  </button>
                  <input
                    ref={imageInput}
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    onChange={(e) => {
                      insertImages([...(e.target.files ?? [])]);
                      e.target.value = "";
                    }}
                  />
                  <span className="ml-auto pr-2 font-mono text-[11px] text-subtle">
                    {words} words · {minutes} min
                  </span>
                </div>

                <AutoTextarea
                  ref={textarea}
                  value={post.content}
                  onChange={(e) => set("content", e.target.value)}
                  onKeyDown={(e) => {
                    const f = (e.metaKey || e.ctrlKey) && shortcuts[e.key.toLowerCase()];
                    if (f) {
                      e.preventDefault();
                      applyFormat(e.currentTarget, f);
                    }
                  }}
                  onPaste={(e) => {
                    const files = [...e.clipboardData.files];
                    if (files.some((f) => f.type.startsWith("image/"))) {
                      e.preventDefault();
                      insertImages(files);
                    }
                  }}
                  onDrop={(e) => {
                    const files = [...e.dataTransfer.files];
                    if (files.length) {
                      e.preventDefault();
                      insertImages(files);
                    }
                  }}
                  aria-label="Content (Markdown)"
                  placeholder={"Start writing…\n\nMarkdown works: ## headings, **bold**, `code`, ```code blocks```, > quotes, lists and tables.\nPaste or drop images to upload them."}
                  spellCheck
                  className="overflow-hidden mt-6 min-h-[60vh] w-full resize-none bg-transparent font-mono text-[15px] leading-[1.8] text-fg outline-none placeholder:text-subtle/60"
                />
              </div>
            </div>
          )}

          {mode !== "write" && (
            <div className={cn("relative min-w-0 px-4 sm:px-8 lg:px-12", mode === "split" && "lg:max-h-[calc(100dvh-57px)] lg:overflow-y-auto")}>
              <span className="absolute right-4 top-4 z-10 rounded-full border border-line bg-bg px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.08em] text-subtle">
                {previewing ? "Rendering…" : "Preview"}
              </span>
              <div>
                <Article
                  preview
                  compact={mode === "split"}
                  post={{
                    ...post,
                    reading_minutes: minutes,
                    updated_at: new Date().toISOString(),
                    published_at: post.status === "published" ? post.published_at : null,
                  }}
                  html={preview?.html ?? ""}
                  toc={preview?.toc ?? []}
                  categoryName={categoryName}
                />
              </div>
              <div className="h-24" />
            </div>
          )}
        </div>

        {/* ------------------------------------------------------- settings */}
        <aside className="space-y-8 border-t border-line px-4 py-8 sm:px-8 xl:sticky xl:top-[57px] xl:h-[calc(100dvh-57px)] xl:overflow-y-auto xl:border-l xl:border-t-0 xl:px-6" aria-label="Post settings">
          <Section title="Publishing">
            <label htmlFor="publish-at" className="mb-1.5 block text-xs text-muted">
              Publish date
            </label>
            <input id="publish-at" type="datetime-local" value={publishAt} onChange={(e) => setPublishAt(e.target.value)} className="field h-10 text-sm" />
            <p className="mt-1.5 text-xs text-subtle">
              {post.status === "draft"
                ? "Leave empty to publish now. Pick a future date to schedule."
                : state === "scheduled"
                  ? "Scheduled. It goes live automatically within ~15 minutes of this time."
                  : "Live on the site."}
            </p>
            <div className="mt-4">
              <Toggle id="featured" label="Featured post" checked={post.featured} onChange={(v) => set("featured", v)} />
            </div>
          </Section>

          <Section title="Details">
            <Labeled label="URL slug" htmlFor="slug" error={fieldErrors.slug}>
              <div className="field flex h-10 items-center gap-0.5 px-3 text-sm">
                <span className="text-subtle">/blog/</span>
                <input
                  id="slug"
                  value={post.slug}
                  onChange={(e) => {
                    setSlugTouched(true);
                    set("slug", slugify(e.target.value) || e.target.value.toLowerCase());
                  }}
                  className="min-w-0 flex-1 bg-transparent outline-none"
                />
              </div>
            </Labeled>
            <Labeled label="Category" htmlFor="category">
              <select id="category" value={post.category ?? ""} onChange={(e) => set("category", e.target.value || null)} className="field h-10 text-sm">
                <option value="">No category</option>
                {categories.map((c) => (
                  <option key={c.slug} value={c.slug}>
                    {c.name}
                  </option>
                ))}
              </select>
            </Labeled>
            <Labeled label="Tags" htmlFor="tags">
              <TagInput id="tags" value={post.tags} onChange={(v) => set("tags", v)} suggestions={allTags} />
            </Labeled>
            <Labeled label="Reading time" htmlFor="reading">
              <div className="flex items-center gap-2">
                <input
                  id="reading"
                  type="number"
                  min={1}
                  value={post.reading_minutes ?? ""}
                  placeholder={String(readingTime(post.content))}
                  onChange={(e) => set("reading_minutes", e.target.value ? Number(e.target.value) : null)}
                  className="field h-10 w-24 text-sm"
                />
                <span className="text-xs text-subtle">min · auto when empty</span>
              </div>
            </Labeled>
          </Section>

          <Section title="Cover image">
            <ImageInput value={post.cover_url} onChange={(v) => set("cover_url", v)} />
            <input
              value={post.cover_alt ?? ""}
              onChange={(e) => set("cover_alt", e.target.value)}
              placeholder="Alt text: describe the image"
              aria-label="Cover alt text"
              className="field mt-2 h-10 text-sm"
            />
            <p className="mt-1.5 text-xs text-subtle">Optional. Without one, a generated cover is used.</p>
          </Section>

          <Section title="Search & social">
            <Labeled label="SEO title" htmlFor="seo-title" hint={`${(post.seo_title || post.title).length}/60`}>
              <input id="seo-title" value={post.seo_title ?? ""} placeholder={post.title} onChange={(e) => set("seo_title", e.target.value)} className="field h-10 text-sm" />
            </Labeled>
            <Labeled label="Meta description" htmlFor="seo-desc" hint={`${(post.seo_description || post.subtitle || "").length}/160`}>
              <textarea
                id="seo-desc"
                rows={3}
                value={post.seo_description ?? ""}
                placeholder={post.subtitle ?? ""}
                onChange={(e) => set("seo_description", e.target.value)}
                className="field resize-none text-sm"
              />
            </Labeled>
            <div className="rounded-xl border border-line bg-sunken p-3.5" aria-label="Search result preview">
              <p className="truncate font-mono text-[11px] text-subtle">yoursite.com › blog › {post.slug || "…"}</p>
              <p className="mt-1 line-clamp-1 text-[15px] text-sky-400">{post.seo_title || post.title || "Untitled"}</p>
              <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-muted">{post.seo_description || post.subtitle || "Add a subtitle or meta description."}</p>
            </div>
          </Section>

          {id && (
            <Section title="Danger zone">
              <button
                type="button"
                className="btn btn-sm w-full border border-rose-400/30 text-rose-400 hover:bg-rose-400/10"
                onClick={() => {
                  if (!confirm(`Delete “${post.title || "this post"}”? This can't be undone.`)) return;
                  startTransition(async () => {
                    const r = await deletePost(id);
                    if (r.ok) {
                      setSaved(JSON.stringify(post)); // don't trigger the unsaved-changes prompt
                      router.push("/admin/posts");
                    } else setMessage({ tone: "error", text: r.error });
                  });
                }}
              >
                <Trash2 size={13} /> Delete post
              </button>
            </Section>
          )}
        </aside>
      </div>
    </div>
  );
}

/** A textarea that grows with its content (works in every browser, unlike field-sizing). */
const AutoTextarea = forwardRef<HTMLTextAreaElement, React.TextareaHTMLAttributes<HTMLTextAreaElement>>(
  function AutoTextarea({ value, ...props }, forwarded) {
    const inner = useRef<HTMLTextAreaElement | null>(null);
    useLayoutEffect(() => {
      const el = inner.current;
      if (!el) return;
      el.style.height = "auto";
      el.style.height = `${el.scrollHeight}px`;
    }, [value]);
    return (
      <textarea
        {...props}
        value={value}
        ref={(el) => {
          inner.current = el;
          if (typeof forwarded === "function") forwarded(el);
          else if (forwarded) forwarded.current = el;
        }}
      />
    );
  },
);

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="eyebrow mb-4">{title}</h2>
      <div className="space-y-4">{children}</div>
    </section>
  );
}

function Labeled({
  label,
  htmlFor,
  hint,
  error,
  children,
}: {
  label: string;
  htmlFor: string;
  hint?: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label htmlFor={htmlFor} className="mb-1.5 flex items-baseline justify-between text-xs text-muted">
        {label}
        {hint && <span className="font-mono text-[10px] text-subtle">{hint}</span>}
      </label>
      {children}
      {error && <p className="mt-1 text-xs text-rose-400">{error}</p>}
    </div>
  );
}
