import type { ProjectCard as ProjectCardData } from "@content/projects/_cards";
import { ExternalLink } from "lucide-react";

function GithubIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden
      className={className}
    >
      <path d="M12 .5C5.65.5.5 5.65.5 12c0 5.08 3.29 9.39 7.86 10.91.58.11.79-.25.79-.56v-2c-3.2.7-3.87-1.36-3.87-1.36-.52-1.32-1.27-1.67-1.27-1.67-1.04-.71.08-.7.08-.7 1.15.08 1.76 1.18 1.76 1.18 1.02 1.75 2.68 1.24 3.34.95.1-.74.4-1.24.73-1.53-2.55-.29-5.24-1.28-5.24-5.7 0-1.26.45-2.29 1.18-3.1-.12-.29-.51-1.46.11-3.05 0 0 .97-.31 3.17 1.18a11 11 0 0 1 5.78 0c2.2-1.49 3.16-1.18 3.16-1.18.63 1.59.24 2.76.12 3.05.74.81 1.18 1.84 1.18 3.1 0 4.43-2.7 5.4-5.27 5.69.41.36.78 1.06.78 2.14v3.17c0 .31.21.68.8.56C20.21 21.39 23.5 17.08 23.5 12 23.5 5.65 18.35.5 12 .5Z" />
    </svg>
  );
}

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
              <GithubIcon className="size-4" />
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
