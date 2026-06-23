"use client";

import { useCallback, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { track } from "@vercel/analytics";
import {
  type Project,
  type ProjectCategory,
  CATEGORY_LABELS,
  CATEGORY_ORDER,
  filterProjects,
  normalizeTag,
} from "@/lib/projects";
import { ProjectCard } from "@/components/project-card";

const isCategory = (v: string | null): v is ProjectCategory =>
  v != null && (CATEGORY_ORDER as string[]).includes(v);

export function ProjectsExplorer({
  projects,
  techOptions,
}: {
  projects: Project[];
  techOptions: string[];
}) {
  const router = useRouter();
  const params = useSearchParams();
  const reduceMotion = useReducedMotion();

  const category = isCategory(params.get("category")) ? (params.get("category") as ProjectCategory) : undefined;
  const tags = params.getAll("tag");
  const q = params.get("q") ?? "";

  const setParams = useCallback(
    (mutate: (p: URLSearchParams) => void) => {
      const next = new URLSearchParams(params.toString());
      mutate(next);
      router.replace(`/projects${next.toString() ? `?${next}` : ""}`, { scroll: false });
    },
    [params, router],
  );

  const toggleCategory = (c: ProjectCategory) => {
    if (category !== c) track("filter_category", { category: c });
    setParams((p) => (category === c ? p.delete("category") : p.set("category", c)));
  };

  const toggleTag = (t: string) =>
    setParams((p) => {
      const norm = normalizeTag(t);
      const current = p.getAll("tag");
      p.delete("tag");
      const isRemoving = current.some((x) => normalizeTag(x) === norm);
      if (!isRemoving) track("filter_tech", { tag: normalizeTag(t) });
      const nextTags = isRemoving
        ? current.filter((x) => normalizeTag(x) !== norm)
        : [...current, t];
      for (const x of nextTags) p.append("tag", x);
    });

  const setQuery = (value: string) =>
    setParams((p) => (value ? p.set("q", value) : p.delete("q")));

  const clearAll = () => router.replace("/projects", { scroll: false });

  const results = useMemo(
    () => filterProjects(projects, { category, tags, q }),
    [projects, category, tags, q],
  );

  const hasFilters = Boolean(category) || tags.length > 0 || q.length > 0;
  const activeTag = (t: string) => tags.some((x) => normalizeTag(x) === normalizeTag(t));

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4">
        <input
          type="search"
          value={q}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search projects by name, summary, or tech"
          aria-label="Search projects"
          className="w-full rounded-md border border-border bg-transparent px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground"
        />

        <div className="flex flex-wrap gap-2">
          {CATEGORY_ORDER.map((c) => (
            <button
              key={c}
              type="button"
              aria-pressed={category === c}
              onClick={() => toggleCategory(c)}
              className={`rounded-full border px-3 py-1 text-xs transition-colors ${
                category === c
                  ? "border-accent bg-accent text-accent-foreground"
                  : "border-border text-muted-foreground hover:text-foreground"
              }`}
            >
              {CATEGORY_LABELS[c]}
            </button>
          ))}
        </div>

        <details className="text-sm">
          <summary className="cursor-pointer font-mono text-xs uppercase tracking-[0.18em] text-muted-foreground">
            Filter by tech
          </summary>
          <div className="mt-3 flex flex-wrap gap-2">
            {techOptions.map((t) => (
              <button
                key={t}
                type="button"
                aria-pressed={activeTag(t)}
                onClick={() => toggleTag(t)}
                className={`rounded border px-1.5 py-0.5 font-mono text-[10px] uppercase tracking-wider transition-colors ${
                  activeTag(t)
                    ? "border-accent text-foreground"
                    : "border-border text-muted-foreground hover:text-foreground"
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </details>

        <div className="flex items-center justify-between">
          <p aria-live="polite" className="text-sm text-muted-foreground">
            {results.length} {results.length === 1 ? "project" : "projects"}
          </p>
          {hasFilters && (
            <button type="button" onClick={clearAll} className="text-sm text-muted-foreground underline-offset-4 hover:underline">
              Clear filters
            </button>
          )}
        </div>
      </div>

      {results.length === 0 ? (
        <p className="py-12 text-center text-sm text-muted-foreground">
          No projects match these filters.
        </p>
      ) : (
        <motion.div layout={!reduceMotion} className="grid gap-4 sm:grid-cols-2">
          <AnimatePresence mode="popLayout">
            {results.map((p) => (
              <motion.div
                key={p.title}
                layout={!reduceMotion}
                initial={reduceMotion ? false : { opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={reduceMotion ? undefined : { opacity: 0, scale: 0.98 }}
                transition={{ duration: 0.18 }}
              >
                <ProjectCard project={p} />
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      )}
    </div>
  );
}
