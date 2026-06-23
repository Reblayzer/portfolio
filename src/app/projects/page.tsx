import { Suspense } from "react";
import { Nav } from "@/components/nav";
import { Footer } from "@/components/footer";
import { ProjectsExplorer } from "@/components/projects-explorer";
import { getAllProjects, techTagOptions } from "@/lib/projects.server";
import { buildMetadata } from "@/lib/site-metadata";

export const metadata = buildMetadata({
  title: "Projects",
  description: "Everything I have built and am building, filterable by category and tech.",
  path: "/projects",
});

export default async function ProjectsPage() {
  const projects = await getAllProjects();
  const techOptions = techTagOptions(projects);

  return (
    <>
      <Nav />
      <main className="mx-auto max-w-3xl px-6 py-24">
        <p className="mb-3 font-mono text-xs uppercase tracking-[0.18em] text-muted-foreground">
          Projects
        </p>
        <h1 className="font-mono text-2xl font-medium tracking-tight md:text-3xl">
          Everything, filterable.
        </h1>
        <p className="mt-4 max-w-2xl text-sm text-muted-foreground">
          Shipped case studies and work in progress. Filter by category or tech, or search.
        </p>
        <div className="mt-10">
          <Suspense fallback={null}>
            <ProjectsExplorer projects={projects} techOptions={techOptions} />
          </Suspense>
        </div>
      </main>
      <Footer />
    </>
  );
}
