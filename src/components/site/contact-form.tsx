"use client";

import { useActionState, useRef } from "react";
import { ArrowRight, Check, Loader2 } from "lucide-react";
import { sendMessage, type ContactState } from "@/app/(site)/contact/actions";
import { cn } from "@/lib/utils";

export function ContactForm() {
  const [state, action, pending] = useActionState<ContactState, FormData>(sendMessage, { status: "idle" });
  const formRef = useRef<HTMLFormElement>(null);
  const fields = state.status === "error" ? state.fields : undefined;

  if (state.status === "success") {
    return (
      <div className="card grid place-items-center px-6 py-16 text-center" role="status">
        <span className="grid size-12 place-items-center rounded-full bg-accent text-accent-ink">
          <Check size={20} />
        </span>
        <p className="mt-6 text-xl font-semibold tracking-[-0.02em] text-fg">Message sent. Thank you!</p>
        <p className="mt-2 max-w-sm text-muted">I&apos;ll get back to you as soon as I can, usually within a few days.</p>
      </div>
    );
  }

  return (
    <form ref={formRef} action={action} className="card space-y-5 p-6 sm:p-8" noValidate>
      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Name" name="name" autoComplete="name" error={fields?.name} required />
        <Field label="Email" name="email" type="email" autoComplete="email" error={fields?.email} required />
      </div>
      <Field label="Subject" name="subject" optional />
      <div>
        <label htmlFor="body" className="mb-2 block text-sm text-fg">
          Message
        </label>
        <textarea
          id="body"
          name="body"
          rows={6}
          required
          aria-invalid={!!fields?.body}
          aria-describedby={fields?.body ? "body-error" : undefined}
          placeholder="What's on your mind?"
          className={cn("field resize-y", fields?.body && "border-rose-400/60")}
        />
        {fields?.body && (
          <p id="body-error" className="mt-1.5 text-xs text-rose-400">
            {fields.body}
          </p>
        )}
      </div>
      {/* Honeypot */}
      <div aria-hidden="true" className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
        <label>
          Website <input type="text" name="website" tabIndex={-1} autoComplete="off" />
        </label>
      </div>
      <div className="flex flex-col-reverse gap-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-xs text-subtle" role={state.status === "error" ? "alert" : undefined}>
          {state.status === "error" ? <span className="text-rose-400">{state.message}</span> : "I'll only use your email to reply."}
        </p>
        <button type="submit" className="btn btn-primary" disabled={pending}>
          {pending ? <Loader2 size={15} className="animate-spin" /> : null}
          {pending ? "Sending…" : "Send message"}
          {!pending && <ArrowRight size={15} />}
        </button>
      </div>
    </form>
  );
}

function Field({
  label,
  name,
  type = "text",
  error,
  required,
  optional,
  autoComplete,
}: {
  label: string;
  name: string;
  type?: string;
  error?: string;
  required?: boolean;
  optional?: boolean;
  autoComplete?: string;
}) {
  return (
    <div>
      <label htmlFor={name} className="mb-2 flex items-baseline justify-between text-sm text-fg">
        {label}
        {optional && <span className="text-xs text-subtle">optional</span>}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        required={required}
        autoComplete={autoComplete}
        aria-invalid={!!error}
        aria-describedby={error ? `${name}-error` : undefined}
        className={cn("field", error && "border-rose-400/60")}
      />
      {error && (
        <p id={`${name}-error`} className="mt-1.5 text-xs text-rose-400">
          {error}
        </p>
      )}
    </div>
  );
}
