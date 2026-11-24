"use client";

import { useOptimistic, useTransition } from "react";
import { Mail, MailOpen, Reply, Trash2 } from "lucide-react";
import { deleteMessage, setMessageRead } from "@/lib/admin/actions";
import type { Message } from "@/lib/types";
import { cn } from "@/lib/utils";

type Op = { type: "read"; id: string; read: boolean } | { type: "delete"; id: string };

export function MessageList({ messages }: { messages: Message[] }) {
  const [, start] = useTransition();
  const [items, apply] = useOptimistic(messages, (list, op: Op) =>
    op.type === "delete" ? list.filter((m) => m.id !== op.id) : list.map((m) => (m.id === op.id ? { ...m, read: op.read } : m)),
  );

  if (!items.length) return <div className="card px-6 py-16 text-center text-muted">No messages yet.</div>;

  return (
    <ul className="space-y-3">
      {items.map((m) => (
        <li key={m.id}>
          <details
            className={cn("card group", !m.read && "border-line-strong")}
            onToggle={(e) => {
              if ((e.currentTarget as HTMLDetailsElement).open && !m.read)
                start(async () => {
                  apply({ type: "read", id: m.id, read: true });
                  await setMessageRead(m.id, true);
                });
            }}
          >
            <summary className="flex cursor-pointer list-none items-center gap-4 p-5">
              <span className={cn("size-2 shrink-0 rounded-full", m.read ? "bg-transparent" : "bg-accent")} aria-label={m.read ? undefined : "Unread"} />
              <span className="min-w-0 flex-1">
                <span className={cn("block truncate text-sm", m.read ? "text-muted" : "font-medium text-fg")}>
                  {m.name} <span className="font-normal text-subtle">· {m.email}</span>
                </span>
                <span className="block truncate text-sm text-subtle">{m.subject || m.body}</span>
              </span>
              <time className="shrink-0 font-mono text-[11px] text-subtle" dateTime={m.created_at}>
                {new Date(m.created_at).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" })}
              </time>
            </summary>
            <div className="border-t border-line px-5 py-5 pl-11">
              {m.subject && <p className="mb-3 font-medium text-fg">{m.subject}</p>}
              <p className="whitespace-pre-wrap text-sm leading-relaxed text-muted">{m.body}</p>
              <div className="mt-5 flex flex-wrap gap-2">
                <a href={`mailto:${m.email}?subject=${encodeURIComponent(`Re: ${m.subject || "your message"}`)}`} className="btn btn-primary btn-sm">
                  <Reply size={13} /> Reply
                </a>
                <button
                  type="button"
                  className="btn btn-ghost btn-sm"
                  onClick={() =>
                    start(async () => {
                      apply({ type: "read", id: m.id, read: !m.read });
                      await setMessageRead(m.id, !m.read);
                    })
                  }
                >
                  {m.read ? <Mail size={13} /> : <MailOpen size={13} />} Mark {m.read ? "unread" : "read"}
                </button>
                <button
                  type="button"
                  className="btn btn-sm text-rose-400 hover:bg-rose-400/10"
                  onClick={() => {
                    if (!confirm("Delete this message?")) return;
                    start(async () => {
                      apply({ type: "delete", id: m.id });
                      await deleteMessage(m.id);
                    });
                  }}
                >
                  <Trash2 size={13} /> Delete
                </button>
              </div>
            </div>
          </details>
        </li>
      ))}
    </ul>
  );
}
