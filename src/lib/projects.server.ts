import { listFlagships } from "@/lib/mdx";
import { projectCards } from "@content/projects/_cards";
import type { Project, ProjectCategory } from "@/lib/projects";

// Re-export pure utilities so server callers can use a single import.
export type { Project, ProjectCategory };
export { techTagOptions } from "@/lib/projects";

function sortProjects(projects: Project[]): Project[] {
  const shipped = projects
    .filter((p) => p.status === "shipped")
    .sort((a, b) => (b.year ?? 0) - (a.year ?? 0));
  const inProgress = projects
    .filter((p) => p.status === "in-progress")
    .sort((a, b) => a.title.localeCompare(b.title));
  return [...shipped, ...inProgress];
}

export async function getAllProjects(): Promise<Project[]> {
  const flagships = await listFlagships();
  const fromFlagships: Project[] = flagships.map((f) => ({
    title: f.title,
    summary: f.summary,
    category: f.category,
    tags: f.stack,
    status: "shipped",
    year: f.year,
    cover: f.cover,
    links: f.links,
    href: `/projects/${f.slug}`,
    featured: f.featured ?? false,
    impact: f.impact,
  }));
  const fromCards: Project[] = projectCards.map((c) => ({
    title: c.title,
    summary: c.summary,
    category: c.category,
    tags: c.stack,
    status: "in-progress",
    cover: c.cover,
    links: c.links,
  }));
  return sortProjects([...fromFlagships, ...fromCards]);
}

export async function getFeaturedProjects(): Promise<Project[]> {
  return (await getAllProjects()).filter((p) => p.featured);
}
