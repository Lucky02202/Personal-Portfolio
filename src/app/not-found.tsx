import Link from "next/link";

export default function NotFound() {
  return (
    <main className="grid min-h-dvh place-items-center px-6">
      <div className="text-center">
        <p className="font-mono text-sm text-subtle">
          <span className="text-accent">$</span> cd ./this-page
        </p>
        <p className="mt-2 font-mono text-sm text-subtle">no such file or directory</p>
        <h1 className="mt-8 text-5xl font-semibold tracking-[-0.04em] text-fg">404</h1>
        <p className="mt-3 text-muted">This page doesn&apos;t exist, or it moved.</p>
        <div className="mt-8 flex justify-center gap-3">
          <Link href="/" className="btn btn-primary">Go home</Link>
          <Link href="/blog" className="btn btn-ghost">Read the blog</Link>
        </div>
      </div>
    </main>
  );
}
