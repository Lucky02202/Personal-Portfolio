import { getDownloads } from "@/lib/content/queries";
import { Container, PageHeader } from "@/components/ui/primitives";
import { ResourceExplorer } from "@/components/downloads/resource-explorer";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Downloadable Content",
  description: "Free cheat sheets, checklists, templates and notes on Power Platform, development and productivity.",
  path: "/downloads",
});

export default async function DownloadsPage() {
  const items = await getDownloads();
  return (
    <Container>
      <PageHeader eyebrow="downloads" title="Resource library" accent="free to take.">
        <p>
          Cheat sheets, checklists, templates and notes. Things I made because I needed them, then cleaned up so
          they&apos;re useful to someone else. No sign-up, no email gate.
        </p>
      </PageHeader>
      {items.length ? (
        <ResourceExplorer items={items} />
      ) : (
        <div className="card px-6 py-20 text-center text-muted">The first resources are on their way.</div>
      )}
    </Container>
  );
}
