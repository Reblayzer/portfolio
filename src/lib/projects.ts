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
