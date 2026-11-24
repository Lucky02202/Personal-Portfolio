"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Eye, Loader2, Plus, Trash2, X } from "lucide-react";
import { deleteRecord, previewMarkdown, saveRecord } from "@/lib/admin/actions";
import { getCollection, type Field } from "@/lib/admin/collections";
import { FileInput, ImageInput, TagInput, Toggle } from "./inputs";
import { cn, slugify } from "@/lib/utils";

type Values = Record<string, unknown>;

function initialValue(f: Field, row: Values | null): unknown {
  if (f.type === "file") {
    return row?.file_url
      ? { url: row.file_url, name: row.file_name ?? null, type: row.file_type ?? "file", size: row.file_size ?? null }
      : null;
  }
  const v = row?.[f.name];
  if (v !== undefined && v !== null) return v;
  if (f.defaultValue !== undefined) return f.defaultValue;
  switch (f.type) {
    case "tags":
    case "lines":
    case "images":
      return [];
    case "boolean":
      return false;
    case "number":
      return 0;
    case "select":
      return f.options?.[0]?.value ?? "";
    case "image":
      return null;
    default:
      return "";
  }
}

/** Schema-driven form for every admin collection except posts. */
export function RecordForm({ collectionKey, id, row }: { collectionKey: string; id: string | null; row: Values | null }) {
  const c = getCollection(collectionKey)!;
  const router = useRouter();
  const [values, setValues] = useState<Values>(() => Object.fromEntries(c.fields.map((f) => [f.name, initialValue(f, row)])));
  const [slugTouched, setSlugTouched] = useState(Boolean(row));
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [message, setMessage] = useState<string | null>(null);
  const [pending, start] = useTransition();

  const set = (name: string, v: unknown) =>
    setValues((prev) => {
      const next = { ...prev, [name]: v };
      // Auto-fill slug fields from their source until edited by hand.
      if (!slugTouched) c.fields.filter((f) => f.type === "slug" && f.from === name).forEach((f) => (next[f.name] = slugify(String(v))));
      return next;
    });

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setErrors({});
    setMessage(null);
    const clean = { ...values };
    c.fields
      .filter((f) => f.type === "lines")
      .forEach((f) => (clean[f.name] = ((clean[f.name] as string[]) ?? []).map((l) => l.trim()).filter(Boolean)));
    start(async () => {
      const r = await saveRecord(c.key, id, clean);
      if (!r.ok) {
        setErrors(r.fieldErrors ?? {});
        setMessage(r.error);
        return;
      }
      router.push(`/admin/${c.key}`);
      router.refresh();
    });
  }

  function remove() {
    if (!id || !confirm(`Delete this ${c.singular}? This can't be undone.`)) return;
    start(async () => {
      const r = await deleteRecord(c.key, id);
      if (!r.ok) setMessage(r.error);
      else {
        router.push(`/admin/${c.key}`);
        router.refresh();
      }
    });
  }

  return (
    <form onSubmit={submit} className="space-y-8" noValidate>
      <div className="grid gap-x-5 gap-y-6 sm:grid-cols-2">
        {c.fields.map((f) => (
          <div key={f.name} className={cn(!f.half && "sm:col-span-2")}>
            {f.type !== "boolean" && (
              <label htmlFor={f.name} className="mb-2 flex items-baseline justify-between text-sm text-fg">
                <span>
                  {f.label}
                  {f.required && <span className="ml-1 text-accent">*</span>}
                </span>
              </label>
            )}
            <FieldInput
              field={f}
              value={values[f.name]}
              onChange={(v) => {
                if (f.type === "slug") setSlugTouched(true);
                set(f.name, v);
              }}
              invalid={!!errors[f.name]}
            />
            {errors[f.name] ? (
              <p className="mt-1.5 text-xs text-rose-400">{errors[f.name]}</p>
            ) : (
              f.help && <p className="mt-1.5 text-xs leading-relaxed text-subtle">{f.help}</p>
            )}
          </div>
        ))}
      </div>

      <div className="sticky bottom-0 -mx-4 flex flex-wrap items-center gap-3 border-t border-line bg-bg/90 px-4 py-4 backdrop-blur sm:-mx-8 sm:px-8 lg:-mx-12 lg:px-12">
        <button type="submit" className="btn btn-primary btn-sm" disabled={pending}>
          {pending && <Loader2 size={13} className="animate-spin" />} {id ? "Save changes" : `Create ${c.singular}`}
        </button>
        <button type="button" className="btn btn-ghost btn-sm" onClick={() => router.push(`/admin/${c.key}`)}>
          Cancel
        </button>
        {message && (
          <p role="alert" className="text-sm text-rose-400">
            {message}
          </p>
        )}
        {id && (
          <button type="button" onClick={remove} className="btn btn-sm ml-auto text-rose-400 hover:bg-rose-400/10" disabled={pending}>
            <Trash2 size={13} /> Delete
          </button>
        )}
      </div>
    </form>
  );
}

function FieldInput({ field: f, value, onChange, invalid }: { field: Field; value: unknown; onChange: (v: unknown) => void; invalid: boolean }) {
  const cls = cn("field", invalid && "border-rose-400/60");
  switch (f.type) {
    case "text":
    case "url":
    case "href":
    case "slug":
      return (
        <>
          <input
            id={f.name}
            type={f.type === "url" ? "url" : "text"}
            value={String(value ?? "")}
            placeholder={f.placeholder}
            list={f.suggestions ? `${f.name}-list` : undefined}
            onChange={(e) => onChange(f.type === "slug" ? slugify(e.target.value) || e.target.value.toLowerCase() : e.target.value)}
            className={cn(cls, f.type === "slug" && "font-mono text-sm")}
            aria-invalid={invalid}
          />
          {f.suggestions && (
            <datalist id={`${f.name}-list`}>
              {f.suggestions.map((s) => (
                <option key={s} value={s} />
              ))}
            </datalist>
          )}
        </>
      );
    case "textarea":
      return <textarea id={f.name} rows={3} value={String(value ?? "")} placeholder={f.placeholder} onChange={(e) => onChange(e.target.value)} className={cls} aria-invalid={invalid} />;
    case "markdown":
      return <MarkdownField id={f.name} value={String(value ?? "")} onChange={onChange} />;
    case "select":
      return (
        <select id={f.name} value={String(value ?? "")} onChange={(e) => onChange(e.target.value)} className={cls}>
          {f.options?.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      );
    case "tags":
      return <TagInput id={f.name} value={(value as string[]) ?? []} onChange={onChange} placeholder={f.placeholder} lowercase={false} />;
    case "lines":
      return (
        <textarea
          id={f.name}
          rows={4}
          value={((value as string[]) ?? []).join("\n")}
          onChange={(e) => onChange(e.target.value.split("\n"))}
          onBlur={(e) => onChange(e.target.value.split("\n").map((l) => l.trim()).filter(Boolean))}
          className={cls}
        />
      );
    case "date":
      return <input id={f.name} type="date" value={String(value ?? "")} onChange={(e) => onChange(e.target.value)} className={cn(cls, "h-11")} />;
    case "number":
      return <input id={f.name} type="number" value={String(value ?? 0)} onChange={(e) => onChange(e.target.valueAsNumber || 0)} className={cn(cls, "h-11")} />;
    case "boolean":
      return (
        <div className="rounded-xl border border-line bg-sunken px-4 py-3">
          <Toggle id={f.name} label={f.label} checked={Boolean(value)} onChange={onChange} />
        </div>
      );
    case "image":
      return <ImageInput value={(value as string | null) ?? null} onChange={onChange} />;
    case "file":
      return <FileInput value={value as Parameters<typeof FileInput>[0]["value"]} onChange={onChange} />;
    case "images":
      return <ImagesField value={(value as { url: string; alt: string }[]) ?? []} onChange={onChange} />;
  }
}

function MarkdownField({ id, value, onChange }: { id: string; value: string; onChange: (v: string) => void }) {
  const [html, setHtml] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  return (
    <div className="overflow-hidden rounded-xl border border-line">
      <div className="flex items-center justify-between border-b border-line bg-surface px-3 py-1.5">
        <span className="font-mono text-[11px] text-subtle">Markdown</span>
        <button
          type="button"
          className="inline-flex items-center gap-1.5 text-xs text-muted hover:text-fg"
          onClick={async () => {
            if (html !== null) return setHtml(null);
            setBusy(true);
            try {
              setHtml((await previewMarkdown(value)).html);
            } finally {
              setBusy(false);
            }
          }}
        >
          {busy ? <Loader2 size={12} className="animate-spin" /> : <Eye size={12} />} {html !== null ? "Edit" : "Preview"}
        </button>
      </div>
      {html !== null ? (
        <div className="prose max-w-none p-4 text-[15px]" dangerouslySetInnerHTML={{ __html: html }} />
      ) : (
        <textarea id={id} rows={10} value={value} onChange={(e) => onChange(e.target.value)} className="block w-full resize-y bg-sunken p-4 font-mono text-sm leading-relaxed text-fg outline-none" />
      )}
    </div>
  );
}

function ImagesField({ value, onChange }: { value: { url: string; alt: string }[]; onChange: (v: { url: string; alt: string }[]) => void }) {
  const [adding, setAdding] = useState(false);
  return (
    <div className="space-y-3">
      {value.map((img, i) => (
        <div key={img.url + i} className="flex items-center gap-3 rounded-xl border border-line bg-sunken p-2">
          {/* eslint-disable-next-line @next/next/no-img-element -- small admin thumbnail of an arbitrary URL */}
          <img src={img.url} alt="" className="h-12 w-20 rounded-md object-cover" />
          <input
            value={img.alt}
            placeholder="Caption / alt text"
            onChange={(e) => onChange(value.map((x, j) => (j === i ? { ...x, alt: e.target.value } : x)))}
            className="field h-10 flex-1 text-sm"
          />
          <button type="button" onClick={() => onChange(value.filter((_, j) => j !== i))} className="grid size-9 place-items-center rounded-md text-subtle hover:text-fg" aria-label="Remove screenshot">
            <X size={14} />
          </button>
        </div>
      ))}
      {adding ? (
        <ImageInput
          value={null}
          aspect="aspect-[4/1]"
          onChange={(url) => {
            if (url) onChange([...value, { url, alt: "" }]);
            setAdding(false);
          }}
        />
      ) : (
        <button type="button" onClick={() => setAdding(true)} className="btn btn-ghost btn-sm">
          <Plus size={13} /> Add screenshot
        </button>
      )}
    </div>
  );
}
