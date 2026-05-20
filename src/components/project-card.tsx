import type { ProjectCard as ProjectCardData } from "@content/projects/_cards";
import { ExternalLink, Github } from "lucide-react";

export function ProjectCard({ project }: { project: ProjectCardData }) {
  return (
    <article className="group flex h-full flex-col rounded-lg border border-border bg-foreground/[0.01] p-5 transition-all hover:-translate-y-0.5 hover:border-foreground/20">
      <header className="flex items-start justify-between gap-3">
        <h3 className="text-base font-medium text-foreground">{project.title}</h3>
        <div className="flex items-center gap-2 text-muted-foreground">
          {project.links.repo && (
            <a
              href={project.links.repo}
              aria-label={`${project.title} source on GitHub`}
              className="transition-colors hover:text-foreground"
            >
              <Github className="size-4" />
            </a>
          )}
          {project.links.live && (
            <a
              href={project.links.live}
              aria-label={`${project.title} live site`}
              className="transition-colors hover:text-foreground"
            >
              <ExternalLink className="size-4" />
            </a>
          )}
        </div>
      </header>
      <p className="mt-2 text-sm text-muted-foreground">{project.summary}</p>
      <ul className="mt-auto flex flex-wrap gap-1.5 pt-4">
        {project.stack.map((t) => (
          <li
            key={t}
            className="rounded border border-border px-1.5 py-0.5 font-mono text-[10px] uppercase tracking-wider text-muted-foreground"
          >
            {t}
          </li>
        ))}
      </ul>
    </article>
  );
}
