"use client";

import { useActionState } from "react";
import { Loader2 } from "lucide-react";
import { signIn } from "@/lib/admin/actions";

export function LoginForm() {
  const [state, action, pending] = useActionState(signIn, {});
  return (
    <form action={action} className="card space-y-4 p-6">
      <div>
        <label htmlFor="email" className="mb-2 block text-sm text-fg">
          Email
        </label>
        <input id="email" name="email" type="email" autoComplete="username" required className="field" />
      </div>
      <div>
        <label htmlFor="password" className="mb-2 block text-sm text-fg">
          Password
        </label>
        <input id="password" name="password" type="password" autoComplete="current-password" required className="field" />
      </div>
      {state.error && (
        <p role="alert" className="text-sm text-rose-400">
          {state.error}
        </p>
      )}
      <button type="submit" className="btn btn-primary w-full" disabled={pending}>
        {pending && <Loader2 size={15} className="animate-spin" />}
        {pending ? "Signing in…" : "Sign in"}
      </button>
    </form>
  );
}
