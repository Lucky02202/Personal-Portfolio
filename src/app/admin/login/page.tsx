import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { LoginForm } from "@/components/admin/login-form";
import { SetupNotice } from "@/components/admin/setup-notice";
import { isSupabaseConfigured } from "@/lib/env";
import { site } from "@/content/site";

export const metadata = { title: "Sign in" };

export default function LoginPage() {
  return (
    <main className="relative grid min-h-dvh place-items-center overflow-hidden px-5 py-16">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        <div className="backdrop-glow" />
        <div className="backdrop-grid" />
      </div>
      <div className="relative w-full max-w-sm">
        <Link href="/" className="mb-10 inline-flex items-center gap-1.5 font-mono text-xs text-subtle hover:text-fg">
          <ArrowLeft size={13} /> {site.name}
        </Link>
        <p className="eyebrow flex items-center gap-2">
          <span className="text-accent">~/</span>admin
        </p>
        <h1 className="mt-3 text-3xl font-semibold tracking-[-0.03em] text-fg">Welcome back.</h1>
        <p className="mt-2 text-sm text-muted">Sign in to write, publish and manage the site.</p>
        <div className="mt-8">{isSupabaseConfigured ? <LoginForm /> : <SetupNotice compact />}</div>
      </div>
    </main>
  );
}
