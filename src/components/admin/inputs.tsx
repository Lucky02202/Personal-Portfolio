"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import { ImagePlus, Loader2, Trash2, Upload, X } from "lucide-react";
import { uploadFile, type Uploaded } from "@/lib/admin/upload";
import { cn, formatBytes } from "@/lib/utils";

/** Comma/Enter-separated tags with suggestions. */
export function TagInput({
  id,
  value,
  onChange,
  suggestions = [],
  placeholder = "Add a tag…",
  lowercase = true,
}: {
  id?: string;
  value: string[];
  onChange: (v: string[]) => void;
  suggestions?: string[];
  placeholder?: string;
  lowercase?: boolean;
}) {
  const [draft, setDraft] = useState("");
  const listId = id ? `${id}-suggestions` : undefined;
  const add = (raw: string) => {
    const parts = raw
      .split(",")
      .map((t) => (lowercase ? t.trim().toLowerCase().replace(/\s+/g, "-") : t.trim()))
      .filter(Boolean);
    const next = [...value];
    parts.forEach((p) => !next.includes(p) && next.push(p));
    onChange(next);
    setDraft("");
  };
  return (
    <div className="field flex min-h-11 flex-wrap items-center gap-1.5 px-2 py-1.5">
      {value.map((t) => (
        <span key={t} className="inline-flex items-center gap-1 rounded-md bg-surface-hover px-2 py-1 font-mono text-xs text-fg">
          {t}
          <button type="button" onClick={() => onChange(value.filter((x) => x !== t))} className="text-subtle hover:text-fg" aria-label={`Remove ${t}`}>
            <X size={11} />
          </button>
        </span>
      ))}
      <input
        id={id}
        list={listId}
        value={draft}
        onChange={(e) => (e.target.value.includes(",") ? add(e.target.value) : setDraft(e.target.value))}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            if (draft.trim()) add(draft);
          } else if (e.key === "Backspace" && !draft && value.length) onChange(value.slice(0, -1));
        }}
        onBlur={() => draft.trim() && add(draft)}
        placeholder={value.length ? "" : placeholder}
        className="min-w-24 flex-1 bg-transparent px-1 py-1 text-sm outline-none placeholder:text-subtle"
      />
      {listId && (
        <datalist id={listId}>
          {suggestions.filter((s) => !value.includes(s)).map((s) => (
            <option key={s} value={s} />
          ))}
        </datalist>
      )}
    </div>
  );
}

/** Image picker: upload, preview, replace, remove, or paste a URL. */
export function ImageInput({
  value,
  onChange,
  aspect = "aspect-[2/1]",
}: {
  value: string | null;
  onChange: (url: string | null) => void;
  aspect?: string;
}) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const input = useRef<HTMLInputElement>(null);

  async function handle(file: File | undefined) {
    if (!file) return;
    setBusy(true);
    setError(null);
    try {
      onChange((await uploadFile(file, "images")).url);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      <div
        className={cn(
          "relative grid place-items-center overflow-hidden rounded-xl border border-dashed border-line-strong bg-sunken",
          aspect,
        )}
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          handle(e.dataTransfer.files[0]);
        }}
      >
        {value ? (
          <>
            {/* Remote URLs may not be allowed by next/image yet, so use unoptimized here. */}
            <Image src={value} alt="" fill unoptimized className="object-cover" />
            <div className="absolute right-2 top-2 flex gap-1.5">
              <button type="button" onClick={() => input.current?.click()} className="btn btn-sm bg-bg/80 text-fg backdrop-blur">
                <Upload size={13} /> Replace
              </button>
              <button type="button" onClick={() => onChange(null)} className="btn btn-sm bg-bg/80 text-fg backdrop-blur" aria-label="Remove image">
                <Trash2 size={13} />
              </button>
            </div>
          </>
        ) : (
          <button type="button" onClick={() => input.current?.click()} className="flex flex-col items-center gap-2 p-6 text-sm text-muted hover:text-fg">
            {busy ? <Loader2 size={18} className="animate-spin" /> : <ImagePlus size={18} />}
            {busy ? "Uploading…" : "Upload or drop an image"}
          </button>
        )}
        <input ref={input} type="file" accept="image/*" className="hidden" onChange={(e) => handle(e.target.files?.[0])} />
      </div>
      {error && <p className="mt-1.5 text-xs text-rose-400">{error}</p>}
    </div>
  );
}

/** Any-file picker for the resource library. */
export function FileInput({
  value,
  onChange,
}: {
  value: { url: string; name: string | null; type: string; size: number | null } | null;
  onChange: (v: { url: string; name: string | null; type: string; size: number | null } | null) => void;
}) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const input = useRef<HTMLInputElement>(null);

  async function handle(file: File | undefined) {
    if (!file) return;
    setBusy(true);
    setError(null);
    try {
      const u: Uploaded = await uploadFile(file, "files");
      onChange({ url: u.url, name: u.name, type: u.ext || "file", size: u.size });
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      <div
        className="flex items-center gap-4 rounded-xl border border-dashed border-line-strong bg-sunken p-4"
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          handle(e.dataTransfer.files[0]);
        }}
      >
        <span className="grid size-11 shrink-0 place-items-center rounded-lg border border-line font-mono text-[10px] uppercase text-accent">
          {busy ? <Loader2 size={15} className="animate-spin text-muted" /> : value ? `.${value.type}` : <Upload size={15} className="text-muted" />}
        </span>
        <div className="min-w-0 flex-1">
          {value ? (
            <>
              <p className="truncate text-sm text-fg">{value.name ?? value.url}</p>
              <p className="font-mono text-[11px] text-subtle">{formatBytes(value.size)}</p>
            </>
          ) : (
            <p className="text-sm text-muted">{busy ? "Uploading…" : "Drop a file here, or choose one."}</p>
          )}
        </div>
        <button type="button" onClick={() => input.current?.click()} className="btn btn-ghost btn-sm" disabled={busy}>
          {value ? "Replace" : "Choose file"}
        </button>
        <input ref={input} type="file" className="hidden" onChange={(e) => handle(e.target.files?.[0])} />
      </div>
      {error && <p className="mt-1.5 text-xs text-rose-400">{error}</p>}
    </div>
  );
}

export function Toggle({ id, checked, onChange, label }: { id: string; checked: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <label htmlFor={id} className="flex cursor-pointer items-center justify-between gap-3 text-sm text-fg">
      {label}
      <button
        id={id}
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={cn(
          "relative h-5 w-9 shrink-0 rounded-full border transition-colors",
          checked ? "border-accent bg-accent" : "border-line-strong bg-sunken",
        )}
      >
        <span
          className={cn(
            "absolute top-1/2 size-3.5 -translate-y-1/2 rounded-full transition-all",
            checked ? "left-[18px] bg-accent-ink" : "left-0.5 bg-subtle",
          )}
        />
      </button>
    </label>
  );
}
