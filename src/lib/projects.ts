export type ProjectCategory =
  | "data-eng"
  | "cloud-devops"
  | "backend"
  | "ai-llm"
  | "frontend";

export type ProjectStatus = "shipped" | "in-progress";

export const CATEGORY_LABELS: Record<ProjectCategory, string> = {
  "data-eng": "Data Engineering",
  "cloud-devops": "Cloud & DevOps",
  backend: "Backend & APIs",
  "ai-llm": "AI & LLM",
  frontend: "Frontend & Full-stack",
};

export const CATEGORY_ORDER: ProjectCategory[] = [
  "data-eng",
  "cloud-devops",
  "backend",
  "ai-llm",
  "frontend",
];

export function normalizeTag(value: string): string {
  return value.toLowerCase().trim();
}

import { listFlagships } from "@/lib/mdx";
import { projectCards } from "@content/projects/_cards";

export type Project = {
  title: string;
  summary: string;
  category: ProjectCategory;
  tags: string[];
  status: ProjectStatus;
  year?: number;
  cover?: string;
  links: { repo?: string; live?: string };
  href?: string;
  featured?: boolean;
  impact?: string;
};

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

export function techTagOptions(projects: Project[]): string[] {
  const counts = new Map<string, { label: string; count: number }>();
  for (const p of projects) {
    for (const tag of p.tags) {
      const key = normalizeTag(tag);
      const entry = counts.get(key);
      if (entry) entry.count += 1;
      else counts.set(key, { label: tag, count: 1 });
    }
  }
  return [...counts.values()]
    .filter((e) => e.count >= 2)
    .sort((a, b) => b.count - a.count || a.label.localeCompare(b.label))
    .map((e) => e.label);
}

export function filterProjects(
  projects: Project[],
  opts: { category?: ProjectCategory; tags?: string[]; q?: string },
): Project[] {
  const query = opts.q?.trim().toLowerCase() ?? "";
  const tags = (opts.tags ?? []).map(normalizeTag);
  return projects.filter((p) => {
    if (opts.category && p.category !== opts.category) return false;
    if (tags.length && !p.tags.some((t) => tags.includes(normalizeTag(t)))) return false;
    if (query) {
      const haystack = [p.title, p.summary, CATEGORY_LABELS[p.category], ...p.tags]
        .join(" ")
        .toLowerCase();
      if (!haystack.includes(query)) return false;
    }
    return true;
  });
}
