import { FadeInSection } from "@/components/fade-in-section";
import { FlagshipProjectCard } from "@/components/flagship-project-card";
import { ProjectCard } from "@/components/project-card";
import { projectCards } from "@content/projects/_cards";
import { listFlagships } from "@/lib/mdx";

export async function Projects() {
  const flagships = await listFlagships();

  return (
    <FadeInSection id="work" className="mx-auto max-w-3xl px-6 py-24">
      <p className="mb-3 font-mono text-xs uppercase tracking-[0.18em] text-muted-foreground">
        Selected work
      </p>
      <h2 className="font-mono text-2xl font-medium tracking-tight md:text-3xl">
        Things I&apos;ve built.
      </h2>

      <div className="mt-10 space-y-6">
        {flagships.map((p) => (
          <FlagshipProjectCard
            key={p.slug}
            slug={p.slug}
            title={p.title}
            summary={p.summary}
            stack={p.stack}
            cover={p.cover}
          />
        ))}
      </div>

      {projectCards.length > 0 && (
        <>
          <p className="mt-16 mb-2 font-mono text-xs uppercase tracking-[0.18em] text-muted-foreground">
            In progress
          </p>
          <p className="mb-6 max-w-2xl text-sm text-muted-foreground">
            Scoped projects in progress, each with a brief and a target stack.
            They graduate to case studies above once built.
          </p>
          <div className="grid gap-4 sm:grid-cols-2">
            {projectCards.map((p) => (
              <ProjectCard key={p.title} project={p} />
            ))}
          </div>
        </>
      )}
    </FadeInSection>
  );
}
