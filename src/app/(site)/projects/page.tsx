import { getProjects } from "@/lib/content/queries";
import { Container, PageHeader } from "@/components/ui/primitives";
import { ProjectExplorer } from "@/components/projects/project-explorer";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Projects",
  description: "Professional work, personal projects, experiments and open source: what I've built and what I'm building.",
  path: "/projects",
});

export default async function ProjectsPage() {
  const projects = await getProjects();
  const building = projects.filter((p) => p.status === "building").length;

  return (
    <Container>
      <PageHeader eyebrow="projects" title="What I've built" accent="& what I'm building.">
        <p>
          A mix of professional work, side projects and experiments. Professional projects are described at a high
          level: what the problem was, how I approached it and what I learned, without anyone&apos;s confidential
          details.
        </p>
        {building > 0 && (
          <p className="mt-4 inline-flex items-center gap-2 font-mono text-sm text-subtle">
            <span className="pulse-dot" aria-hidden="true" /> {building} in progress right now
          </p>
        )}
      </PageHeader>
      <ProjectExplorer projects={projects} />
    </Container>
  );
}
