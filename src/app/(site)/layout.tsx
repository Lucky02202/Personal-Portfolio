import { Nav } from "@/components/site/nav";
import { Footer } from "@/components/site/footer";

export default function SiteLayout({ children }: LayoutProps<"/">) {
  return (
    <div className="relative flex min-h-dvh flex-col overflow-x-clip">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
        <div className="backdrop-glow" />
        <div className="backdrop-grid" />
      </div>
      <div aria-hidden="true" className="grain" />
      <Nav />
      <main id="main" className="flex-1 pt-16">
        {children}
      </main>
      <Footer />
    </div>
  );
}
