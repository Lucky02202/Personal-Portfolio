import Image from "next/image";
import { Download as DownloadIcon } from "lucide-react";
import type { Download } from "@/lib/types";
import { formatBytes, formatDate } from "@/lib/utils";

const typeTone: Record<string, string> = {
  pdf: "text-rose-400",
  xlsx: "text-emerald-400",
  xls: "text-emerald-400",
  csv: "text-emerald-400",
  docx: "text-sky-400",
  pptx: "text-orange-400",
  zip: "text-violet-400",
  md: "text-accent",
};

/** A file "document" tile with the extension: an icon that says what you'll get. */
export function FileGlyph({ type }: { type: string }) {
  const ext = type.toLowerCase();
  return (
    <div className="relative h-16 w-13 shrink-0" aria-hidden="true">
      <svg viewBox="0 0 52 64" className="absolute inset-0 h-full w-full text-line-strong">
        <path
          d="M4 1h30l17 17v41a4 4 0 0 1-4 4H4a4 4 0 0 1-4-4V5a4 4 0 0 1 4-4Z"
          className="fill-[var(--bg-sunken)]"
          stroke="currentColor"
        />
        <path d="M34 1v13a4 4 0 0 0 4 4h13" fill="none" stroke="currentColor" />
      </svg>
      <span className={`absolute inset-x-0 bottom-3 text-center font-mono text-[10px] font-semibold uppercase ${typeTone[ext] ?? "text-muted"}`}>
        .{ext}
      </span>
    </div>
  );
}

export function ResourceCard({ item }: { item: Download }) {
  return (
    <article className="card card-lift group flex h-full flex-col p-5 sm:p-6">
      <div className="flex items-start gap-4">
        {item.preview_url ? (
          <div className="relative h-16 w-13 shrink-0 overflow-hidden rounded-md border border-line">
            <Image src={item.preview_url} alt="" fill sizes="52px" className="object-cover" />
          </div>
        ) : (
          <FileGlyph type={item.file_type} />
        )}
        <div className="min-w-0">
          <p className="font-mono text-xs text-accent">{item.category}</p>
          <h3 className="mt-1.5 font-semibold leading-snug tracking-[-0.015em] text-fg">{item.title}</h3>
        </div>
      </div>
      <p className="mt-4 text-sm leading-relaxed text-muted">{item.description}</p>
      <div className="mt-auto flex items-center justify-between gap-3 pt-6">
        <p className="font-mono text-[11px] text-subtle">
          {item.file_type.toUpperCase()}
          {item.file_size ? ` · ${formatBytes(item.file_size)}` : ""} · {formatDate(item.created_at)}
        </p>
        <a
          href={`/downloads/${item.slug}/file`}
          className="btn btn-ghost btn-sm group-hover:border-accent"
          download={item.file_name ?? true}
          aria-label={`Download ${item.title}`}
        >
          <DownloadIcon size={14} /> Download
        </a>
      </div>
    </article>
  );
}
