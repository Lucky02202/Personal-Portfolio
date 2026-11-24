"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Sparkles } from "lucide-react";
import { importStarterContent } from "@/lib/admin/actions";

export function ImportStarter() {
  const [pending, start] = useTransition();
  const [msg, setMsg] = useState<string | null>(null);
  const router = useRouter();

  return (
    <div className="card mb-8 flex flex-col gap-4 border-dashed p-6 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <p className="flex items-center gap-2 font-medium text-fg">
          <Sparkles size={15} className="text-accent" /> Your database is empty
        </p>
        <p className="mt-1 text-sm text-muted">
          Import the starter content (sample posts, projects, resources and &ldquo;Currently&rdquo; items) to edit instead of starting from scratch. Nothing is overwritten.
        </p>
        {msg && <p className="mt-2 text-sm text-fg">{msg}</p>}
      </div>
      <button
        type="button"
        className="btn btn-primary btn-sm shrink-0"
        disabled={pending}
        onClick={() =>
          start(async () => {
            const r = await importStarterContent();
            setMsg(r.ok ? `Imported: ${r.imported.join(", ") || "nothing (tables weren't empty)"}` : r.error);
            router.refresh();
          })
        }
      >
        {pending && <Loader2 size={14} className="animate-spin" />} Import starter content
      </button>
    </div>
  );
}
