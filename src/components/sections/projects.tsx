import Link from "next/link";
import { FadeInSection } from "@/components/fade-in-section";
import { ProjectCard } from "@/components/project-card";
import { getFeaturedProjects } from "@/lib/projects.server";

export async function Projects() {
  const featured = await getFeaturedProjects();

  return (
    <FadeInSection id="work" className="mx-auto max-w-3xl px-6 py-24">
      <p className="mb-3 font-mono text-xs uppercase tracking-[0.18em] text-muted-foreground">
        Selected work
      </p>
      <h2 className="font-mono text-2xl font-medium tracking-tight md:text-3xl">
        Things I&apos;ve built.
      </h2>

      <div className="mt-10 grid gap-4 sm:grid-cols-2">
        {featured.map((p) => (
          <ProjectCard key={p.title} project={p} />
        ))}
      </div>

      <Link
        href="/projects"
        className="mt-8 inline-flex items-center font-mono text-xs uppercase tracking-[0.18em] text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
      >
        View all projects →
      </Link>
    </FadeInSection>
  );
}
