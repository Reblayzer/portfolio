import type { Project } from "@/lib/projects";
import { CATEGORY_LABELS } from "@/lib/projects";

export function StatusBadge({ status }: { status: Project["status"] }) {
  const label = status === "shipped" ? "Shipped" : "In progress";
  return (
    <span className="rounded border border-border px-1.5 py-0.5 font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
      {label}
    </span>
  );
}

export function CategoryBadge({ category }: { category: Project["category"] }) {
  return (
    <span className="rounded border border-border px-1.5 py-0.5 font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
      {CATEGORY_LABELS[category]}
    </span>
  );
}
