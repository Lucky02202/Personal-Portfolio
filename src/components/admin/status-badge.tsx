import { cn } from "@/lib/utils";

export type PostState = "draft" | "published" | "scheduled";

export function postState(status: string, publishedAt: string | null): PostState {
  if (status !== "published") return "draft";
  return publishedAt && new Date(publishedAt).getTime() > Date.now() ? "scheduled" : "published";
}

export function StatusBadge({ state }: { state: PostState }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 font-mono text-[11px]",
        state === "published" && "border-accent/40 text-accent",
        state === "scheduled" && "border-sky-400/40 text-sky-400",
        state === "draft" && "border-line-strong text-subtle",
      )}
    >
      <span className={cn("size-1.5 rounded-full", state === "published" ? "bg-accent" : state === "scheduled" ? "bg-sky-400" : "bg-subtle")} />
      {state}
    </span>
  );
}
