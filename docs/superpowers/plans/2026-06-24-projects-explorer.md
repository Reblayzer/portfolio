# Projects Explorer and Portfolio Enhancements Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a searchable, filterable `/projects` explorer backed by a project taxonomy, tighten the home page to a featured set, and ship the supporting polish (impact lines, CV CTA, skills-to-projects links, architecture diagrams, per-project JSON-LD, analytics, accessibility).

**Architecture:** A single `lib/projects.ts` seam merges the two existing sources (MDX flagships via `lib/mdx.ts`, work-in-progress cards via `content/projects/_cards.ts`) into one `Project[]`. Filtering is a pure function. The explorer is a client component with URL-synced state; the page and home both read the unified list.

**Tech Stack:** Next.js 16 (App Router, RSC), TypeScript strict, Tailwind v4, Framer Motion, Vitest, pnpm, Vercel.

## Global Constraints

- No em dashes (the character `—`) anywhere in code or copy. Use commas, periods, colons, parentheses.
- No company or role names in public copy. No invented metrics.
- Tone: restrained, confident, first person, present tense.
- Do not change unrelated design tokens or component code.
- Each page renders its own `<Nav />` and `<Footer />` (the root layout only wraps `ThemeProvider`); follow `src/app/projects/[slug]/page.tsx`.
- Verification gate for every task: `pnpm typecheck && pnpm lint && pnpm test && pnpm build` all exit 0.
- Commit messages: conventional, and end with `Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>`.

---

## Phase 1: Foundation and explorer

### Task 1: Taxonomy types and backfill

**Files:**
- Create: `src/lib/projects.ts` (types only in this task; functions in Task 2)
- Modify: `src/lib/mdx.ts` (extend `FlagshipFrontmatter`)
- Modify: `content/projects/_cards.ts` (add `category` to type and every card)
- Modify: `content/projects/*.mdx` (8 files: add `category`, `featured`, optional `impact`)

**Interfaces:**
- Produces: `ProjectCategory`, `ProjectStatus`, `CATEGORY_LABELS`, `CATEGORY_ORDER`, `normalizeTag`.

- [ ] **Step 1: Create `src/lib/projects.ts` with the taxonomy types**

```ts
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
```

- [ ] **Step 2: Extend `FlagshipFrontmatter` in `src/lib/mdx.ts`**

Add the import at the top:

```ts
import type { ProjectCategory } from "@/lib/projects";
```

Add three fields to the `FlagshipFrontmatter` type:

```ts
  category: ProjectCategory;
  featured?: boolean;
  impact?: string;
```

In `parse()`, extend the returned object (after `cover`):

```ts
    category: (fm.category as ProjectCategory) ?? "backend",
    featured: fm.featured ?? false,
    impact: fm.impact,
```

(The `?? "backend"` is a safe default; every flagship gets an explicit category in Step 4.)

- [ ] **Step 3: Add `category` to `content/projects/_cards.ts`**

At the top of the file add:

```ts
import type { ProjectCategory } from "@/lib/projects";
```

Add `category` to the `ProjectCard` type (after `stack`):

```ts
  category: ProjectCategory;
```

Add one `category` line to each of the 32 card objects, using this map:

```
Aegis: "cloud-devops"            AgentGuard: "ai-llm"
Ansible Fleet Baseline: "cloud-devops"   AskDocs: "ai-llm"
Azure Secure Landing Zone: "cloud-devops"  BunkerFlow: "backend"
BunkerStream: "data-eng"         CampaignFlow: "data-eng"
Citera: "ai-llm"                 CityCatalog: "backend"
Coalesce: "data-eng"             DeltaPilot: "data-eng"
Deskhand: "ai-llm"               FieldBridge: "backend"
Fundament: "cloud-devops"        HarborWatch: "frontend"
HostStack: "cloud-devops"        Keystone: "backend"
MediaVault: "backend"            MeterFleet: "cloud-devops"
MixPilot: "backend"              NoticeBridge: "backend"
PipeForge: "cloud-devops"        ProcessBridge: "backend"
ShipBoard: "frontend"            SitRep: "frontend"
Stockpile: "backend"             Stocktide: "data-eng"
Threadline: "frontend"           Throughline: "ai-llm"
TradePort: "frontend"            WagerLedger: "backend"
```

Each card object becomes, for example:

```ts
  {
    title: "Aegis",
    summary:
      "A .NET/C# command-line tool that provisions, releases, rolls back, and health-monitors an Azure-hosted web service.",
    stack: ["C#/.NET", "Azure", "Bicep", "GitHub Actions", "Application Insights"],
    category: "cloud-devops",
    links: {},
  },
```

- [ ] **Step 4: Add taxonomy frontmatter to the 8 flagship MDX files**

For each file under `content/projects/`, add `category` to the frontmatter, set `featured: true` on the six featured, and add an `impact` line to the three that already have an obvious one-liner. Use:

```
cdc-pipeline.mdx     -> category: "data-eng"   featured: true
consentinel.mdx      -> category: "backend"    featured: true
ledgernudge.mdx      -> category: "ai-llm"      featured: true
niteshift.mdx        -> category: "frontend"
nutrimind.mdx        -> category: "ai-llm"      featured: true
polysearch.mdx       -> category: "backend"    featured: true
portfolio-site.mdx   -> category: "frontend"
shopcraft.mdx        -> category: "frontend"   featured: true
```

Example (ledgernudge.mdx frontmatter, add the two lines marked NEW):

```yaml
---
title: "LedgerNudge"
slug: "ledgernudge"
summary: "..."
stack: [...]
role: "Full-stack engineer (solo build)"
year: 2026
category: "ai-llm"        # NEW
featured: true            # NEW
links: { repo: "..." }
cover: "/projects/ledgernudge/cover.png"
flagship: true
---
```

Add `impact` only where you can write one honest plain-language sentence from the existing case study (optional; safe to skip in this task). Example for ledgernudge:

```yaml
impact: "Chases unpaid invoices on its own, but a person signs off every message before it sends."
```

- [ ] **Step 5: Typecheck and build**

Run: `pnpm typecheck && pnpm build`
Expected: PASS. (No tests yet; Task 2 adds them.)

- [ ] **Step 6: Commit**

```bash
git add src/lib/projects.ts src/lib/mdx.ts content/projects/_cards.ts content/projects/*.mdx
git commit -m "feat(projects): add category, status, featured taxonomy to project data

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>"
```

---

### Task 2: Unified data layer

**Files:**
- Modify: `src/lib/projects.ts` (add the merge/sort/filter functions)
- Test: `tests/projects.test.ts`

**Interfaces:**
- Consumes: `listFlagships()` from `@/lib/mdx` (returns `FlagshipProject[]` with `slug, title, summary, stack, year, cover, links, category, featured, impact`); `projectCards` from `@content/projects/_cards`.
- Produces:
  - `type Project = { title: string; summary: string; category: ProjectCategory; tags: string[]; status: ProjectStatus; year?: number; cover?: string; links: { repo?: string; live?: string }; href?: string; featured?: boolean; impact?: string }`
  - `getAllProjects(): Promise<Project[]>`
  - `getFeaturedProjects(): Promise<Project[]>`
  - `techTagOptions(projects: Project[]): string[]`
  - `filterProjects(projects: Project[], opts: { category?: ProjectCategory; tags?: string[]; q?: string }): Project[]`

- [ ] **Step 1: Write the failing test**

Create `tests/projects.test.ts`:

```ts
import { describe, it, expect } from "vitest";
import {
  getAllProjects,
  getFeaturedProjects,
  techTagOptions,
  filterProjects,
  CATEGORY_LABELS,
  type Project,
} from "@/lib/projects";

const sample: Project[] = [
  { title: "Alpha", summary: "Kafka streaming pipeline", category: "data-eng", tags: ["Kafka", "Python"], status: "shipped", year: 2026 },
  { title: "Bravo", summary: "React storefront", category: "frontend", tags: ["React", "TypeScript"], status: "in-progress" },
  { title: "Charlie", summary: "Kafka gateway", category: "backend", tags: ["Kafka", ".NET 8"], status: "in-progress" },
];

describe("filterProjects", () => {
  it("returns all when no filters", () => {
    expect(filterProjects(sample, {})).toHaveLength(3);
  });
  it("filters by category", () => {
    const r = filterProjects(sample, { category: "frontend" });
    expect(r.map((p) => p.title)).toEqual(["Bravo"]);
  });
  it("filters by tag with OR semantics", () => {
    const r = filterProjects(sample, { tags: ["kafka"] });
    expect(r.map((p) => p.title).sort()).toEqual(["Alpha", "Charlie"]);
  });
  it("matches search across title, summary, category label, and tags", () => {
    expect(filterProjects(sample, { q: "storefront" }).map((p) => p.title)).toEqual(["Bravo"]);
    expect(filterProjects(sample, { q: "data engineering" }).map((p) => p.title)).toEqual(["Alpha"]);
    expect(filterProjects(sample, { q: "typescript" }).map((p) => p.title)).toEqual(["Bravo"]);
  });
  it("combines filters", () => {
    expect(filterProjects(sample, { category: "backend", tags: ["kafka"], q: "gateway" }).map((p) => p.title)).toEqual(["Charlie"]);
  });
  it("returns empty when nothing matches", () => {
    expect(filterProjects(sample, { q: "nope" })).toHaveLength(0);
  });
});

describe("techTagOptions", () => {
  it("returns only tags used by 2 or more projects", () => {
    expect(techTagOptions(sample)).toEqual(["Kafka"]);
  });
});

describe("getAllProjects (real data)", () => {
  it("merges flagships and cards with valid taxonomy", async () => {
    const all = await getAllProjects();
    expect(all.length).toBeGreaterThan(30);
    for (const p of all) {
      expect(CATEGORY_LABELS[p.category]).toBeTruthy();
      expect(["shipped", "in-progress"]).toContain(p.status);
      expect(p.tags.length).toBeGreaterThan(0);
    }
  });
  it("shipped projects sort before in-progress", async () => {
    const all = await getAllProjects();
    const firstWip = all.findIndex((p) => p.status === "in-progress");
    const lastShipped = all.map((p) => p.status).lastIndexOf("shipped");
    expect(lastShipped).toBeLessThan(firstWip);
  });
});

describe("getFeaturedProjects", () => {
  it("returns only featured flagships", async () => {
    const featured = await getFeaturedProjects();
    expect(featured.length).toBeGreaterThan(0);
    expect(featured.every((p) => p.featured && p.status === "shipped")).toBe(true);
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `pnpm test`
Expected: FAIL with errors that `getAllProjects`, `filterProjects`, etc. are not exported from `@/lib/projects`.

- [ ] **Step 3: Implement the functions in `src/lib/projects.ts`**

Append below the types from Task 1:

```ts
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
```

Note: `FlagshipFrontmatter` (Task 1) must include `category`, `featured`, `impact`. The `import type { ProjectCategory }` in `_cards.ts` and `mdx.ts` is type-only, so there is no runtime import cycle.

- [ ] **Step 4: Run the test to verify it passes**

Run: `pnpm test`
Expected: PASS (all `projects.test.ts` cases plus the existing `mdx.test.ts`).

- [ ] **Step 5: Commit**

```bash
git add src/lib/projects.ts tests/projects.test.ts
git commit -m "feat(projects): unified data layer with filter, sort, tag options

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>"
```

---

### Task 3: Unified ProjectCard and badges

**Files:**
- Create: `src/components/project-badges.tsx`
- Modify: `src/components/project-card.tsx` (rewrite to take a `Project`)
- Delete: `src/components/flagship-project-card.tsx`

**Interfaces:**
- Consumes: `Project`, `CATEGORY_LABELS` from `@/lib/projects`.
- Produces: `ProjectCard({ project }: { project: Project })`; `StatusBadge`, `CategoryBadge`.

- [ ] **Step 1: Create `src/components/project-badges.tsx`**

```tsx
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
```

- [ ] **Step 2: Rewrite `src/components/project-card.tsx`**

```tsx
import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, ExternalLink } from "lucide-react";
import type { Project } from "@/lib/projects";
import { StatusBadge, CategoryBadge } from "@/components/project-badges";

function GithubIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden className={className}>
      <path d="M12 .5C5.65.5.5 5.65.5 12c0 5.08 3.29 9.39 7.86 10.91.58.11.79-.25.79-.56v-2c-3.2.7-3.87-1.36-3.87-1.36-.52-1.32-1.27-1.67-1.27-1.67-1.04-.71.08-.7.08-.7 1.15.08 1.76 1.18 1.76 1.18 1.02 1.75 2.68 1.24 3.34.95.1-.74.4-1.24.73-1.53-2.55-.29-5.24-1.28-5.24-5.7 0-1.26.45-2.29 1.18-3.1-.12-.29-.51-1.46.11-3.05 0 0 .97-.31 3.17 1.18a11 11 0 0 1 5.78 0c2.2-1.49 3.16-1.18 3.16-1.18.63 1.59.24 2.76.12 3.05.74.81 1.18 1.84 1.18 3.1 0 4.43-2.7 5.4-5.27 5.69.41.36.78 1.06.78 2.14v3.17c0 .31.21.68.8.56C20.21 21.39 23.5 17.08 23.5 12 23.5 5.65 18.35.5 12 .5Z" />
    </svg>
  );
}

function CardInner({ project }: { project: Project }) {
  return (
    <>
      {project.cover && (
        <div className="relative aspect-[16/9] overflow-hidden border-b border-border bg-foreground/[0.03]">
          <Image
            src={project.cover}
            alt=""
            fill
            sizes="(min-width: 768px) 720px, 100vw"
            quality={100}
            className="object-cover transition-transform duration-500 group-hover:scale-[1.02]"
          />
        </div>
      )}
      <div className="flex h-full flex-col p-5">
        <div className="flex items-start justify-between gap-3">
          <h3 className="text-base font-medium text-foreground">{project.title}</h3>
          {project.href ? (
            <ArrowUpRight className="size-5 shrink-0 text-muted-foreground transition-colors group-hover:text-accent" />
          ) : (
            <div className="flex items-center gap-2 text-muted-foreground">
              {project.links.repo && (
                <a href={project.links.repo} aria-label={`${project.title} source on GitHub`} className="transition-colors hover:text-foreground">
                  <GithubIcon className="size-4" />
                </a>
              )}
              {project.links.live && (
                <a href={project.links.live} aria-label={`${project.title} live site`} className="transition-colors hover:text-foreground">
                  <ExternalLink className="size-4" />
                </a>
              )}
            </div>
          )}
        </div>
        <div className="mt-2 flex flex-wrap gap-1.5">
          <StatusBadge status={project.status} />
          <CategoryBadge category={project.category} />
        </div>
        <p className="mt-3 text-sm text-muted-foreground">{project.summary}</p>
        {project.href && (
          <p className="mt-3 font-mono text-xs uppercase tracking-[0.18em] text-muted-foreground">
            Read case study →
          </p>
        )}
        <ul className="mt-auto flex flex-wrap gap-1.5 pt-4">
          {project.tags.map((t) => (
            <li key={t} className="rounded border border-border px-1.5 py-0.5 font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
              {t}
            </li>
          ))}
        </ul>
      </div>
    </>
  );
}

export function ProjectCard({ project }: { project: Project }) {
  const className =
    "group flex h-full flex-col overflow-hidden rounded-lg border border-border bg-foreground/[0.01] transition-all hover:-translate-y-0.5 hover:border-foreground/20";
  if (project.href) {
    return (
      <Link href={project.href} className={className}>
        <CardInner project={project} />
      </Link>
    );
  }
  return (
    <article className={className}>
      <CardInner project={project} />
    </article>
  );
}
```

- [ ] **Step 3: Delete the old flagship card**

```bash
git rm src/components/flagship-project-card.tsx
```

- [ ] **Step 4: Typecheck (expect failures in projects.tsx, fixed in Task 5)**

Run: `pnpm typecheck`
Expected: errors only in `src/components/sections/projects.tsx` (still importing the deleted component). That is fixed in Task 5. Do not commit yet; continue to Task 4, then Task 5, then run the full gate and commit once the section is updated.

Note: Tasks 3, 4, and 5 form one reviewable unit (they leave the build red in between). Commit at the end of Task 5.

---

### Task 4: The /projects explorer

**Files:**
- Create: `src/components/projects-explorer.tsx`
- Create: `src/app/projects/page.tsx`
- Modify: `src/app/sitemap.ts` (add the `/projects` entry)

**Interfaces:**
- Consumes: `Project`, `filterProjects`, `CATEGORY_LABELS`, `CATEGORY_ORDER`, `ProjectCategory` from `@/lib/projects`; `ProjectCard` from `@/components/project-card`.
- Produces: `ProjectsExplorer({ projects, techOptions }: { projects: Project[]; techOptions: string[] })`.

- [ ] **Step 1: Create `src/components/projects-explorer.tsx`**

```tsx
"use client";

import { useCallback, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
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

  const toggleCategory = (c: ProjectCategory) =>
    setParams((p) => (category === c ? p.delete("category") : p.set("category", c)));

  const toggleTag = (t: string) =>
    setParams((p) => {
      const norm = normalizeTag(t);
      const current = p.getAll("tag");
      p.delete("tag");
      const nextTags = current.some((x) => normalizeTag(x) === norm)
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
```

- [ ] **Step 2: Create `src/app/projects/page.tsx`**

```tsx
import { Suspense } from "react";
import { Nav } from "@/components/nav";
import { Footer } from "@/components/footer";
import { ProjectsExplorer } from "@/components/projects-explorer";
import { getAllProjects, techTagOptions } from "@/lib/projects";
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
```

Note: confirm `buildMetadata` accepts `{ title, description, path }` (it is used the same way in `src/app/projects/[slug]/page.tsx`). If its signature differs, match that call site.

- [ ] **Step 3: Add `/projects` to the sitemap**

In `src/app/sitemap.ts`, add one entry to the returned array after the home entry:

```ts
    { url: `${siteUrl}/projects`, lastModified: now, changeFrequency: "monthly", priority: 0.9 },
```

---

### Task 5: Home featured section

**Files:**
- Modify: `src/components/sections/projects.tsx`

**Interfaces:**
- Consumes: `getFeaturedProjects` from `@/lib/projects`; `ProjectCard` from `@/components/project-card`.

- [ ] **Step 1: Rewrite `src/components/sections/projects.tsx`**

```tsx
import Link from "next/link";
import { FadeInSection } from "@/components/fade-in-section";
import { ProjectCard } from "@/components/project-card";
import { getFeaturedProjects } from "@/lib/projects";

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
```

This component is now `async`. Confirm it is rendered in a server context (it is: `src/app/page.tsx` renders `<Projects />` directly in the RSC tree). The old `Projects` was synchronous; making it async is supported because it is a server component.

- [ ] **Step 2: Run the full gate**

Run: `pnpm typecheck && pnpm lint && pnpm test && pnpm build`
Expected: all PASS. The errors from Task 3 (deleted flagship card) are now resolved because nothing imports it.

- [ ] **Step 3: Visual check**

Run `./node_modules/.bin/next start -p 8124` and confirm: the home "Selected work" shows the 6 featured cards plus "View all projects", and `/projects` shows the explorer with working category chips, tech filter, search, result count, and clear. Stop the server when done.

- [ ] **Step 4: Commit Tasks 3 to 5**

```bash
git add src/components/project-card.tsx src/components/project-badges.tsx src/components/projects-explorer.tsx src/app/projects/page.tsx src/components/sections/projects.tsx src/app/sitemap.ts
git commit -m "feat(projects): /projects explorer, unified card, home featured set

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>"
```

---

## Phase 2: Content enhancements

### Task 6: Impact line on the case study

**Files:**
- Modify: `src/app/projects/[slug]/page.tsx` (render `impact` when present)

**Interfaces:**
- Consumes: `project.impact` (already on `FlagshipProject` from Task 1).

- [ ] **Step 1: Render the impact lead line**

In `src/app/projects/[slug]/page.tsx`, immediately after the title/summary header block and before the cover image, add:

```tsx
        {project.impact && (
          <p className="mt-4 max-w-2xl text-base text-foreground">{project.impact}</p>
        )}
```

(Place it where it reads as a lead line under the existing summary. If `impact` is absent, nothing renders.)

- [ ] **Step 2: Gate and commit**

Run: `pnpm typecheck && pnpm lint && pnpm test && pnpm build`
Expected: PASS.

```bash
git add src/app/projects/[slug]/page.tsx
git commit -m "feat(projects): surface plain-language impact line on case studies

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>"
```

---

### Task 7: CV button

**Files:**
- Modify: `src/components/sections/hero.tsx` (add a Download CV action)
- Modify: `src/components/nav.tsx` (add a small CV link)

**Interfaces:** none new.

- [ ] **Step 1: Add the CV action to the hero**

In `src/components/sections/hero.tsx`, inside the actions `div`, after the "Get in touch" link, add:

```tsx
        <a
          href="/resume.pdf"
          className="inline-flex h-10 items-center rounded-md border border-border px-5 text-sm font-medium text-foreground transition-colors hover:bg-foreground/5"
        >
          Download CV
        </a>
```

- [ ] **Step 2: Add a CV link to the nav**

In `src/components/nav.tsx`, add a link to `/resume.pdf` alongside the existing nav links, labeled "CV". Match the existing nav link styling (copy the className from a sibling nav link in that file).

- [ ] **Step 3: Gate and commit**

Run: `pnpm typecheck && pnpm lint && pnpm build`
Expected: PASS.

```bash
git add src/components/sections/hero.tsx src/components/nav.tsx
git commit -m "feat(home): prominent Download CV action in hero and nav

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>"
```

---

### Task 8: Skills to projects links

**Files:**
- Modify: `src/components/sections/skills.tsx` (link skills that map to a project tag)

**Interfaces:**
- Consumes: `getAllProjects`, `normalizeTag` from `@/lib/projects`.

- [ ] **Step 1: Compute the linkable tag set and make `Skills` async**

Rewrite `src/components/sections/skills.tsx` so the `<li>` becomes a link when the skill maps to a tag:

```tsx
import Link from "next/link";
import { FadeInSection } from "@/components/fade-in-section";
import { skillGroups } from "@content/skills";
import { getAllProjects, normalizeTag } from "@/lib/projects";

export async function Skills() {
  const projects = await getAllProjects();
  const tagSet = new Set(projects.flatMap((p) => p.tags.map(normalizeTag)));

  return (
    <FadeInSection id="skills" className="mx-auto max-w-3xl px-6 py-24">
      <p className="mb-3 font-mono text-xs uppercase tracking-[0.18em] text-muted-foreground">
        Skills
      </p>
      <h2 className="font-mono text-2xl font-medium tracking-tight md:text-3xl">
        The stack I reach for.
      </h2>
      <dl className="mt-8 grid gap-x-10 gap-y-8 sm:grid-cols-2">
        {skillGroups.map((group) => (
          <div key={group.title}>
            <dt className="mb-3 font-mono text-xs uppercase tracking-[0.18em] text-muted-foreground">
              {group.title}
            </dt>
            <dd>
              <ul className="flex flex-wrap gap-1.5">
                {group.items.map((item) => {
                  const linkable = tagSet.has(normalizeTag(item));
                  const className =
                    "rounded-md border border-border bg-foreground/[0.02] px-2.5 py-1 font-mono text-xs text-foreground";
                  return (
                    <li key={item}>
                      {linkable ? (
                        <Link href={`/projects?tag=${encodeURIComponent(item)}`} className={`${className} transition-colors hover:border-foreground/30`}>
                          {item}
                        </Link>
                      ) : (
                        <span className={className}>{item}</span>
                      )}
                    </li>
                  );
                })}
              </ul>
            </dd>
          </div>
        ))}
      </dl>
    </FadeInSection>
  );
}
```

- [ ] **Step 2: Gate and visual check**

Run: `pnpm typecheck && pnpm lint && pnpm build`
Expected: PASS. Visually confirm that a skill present in projects (for example React or Kafka) links to `/projects?tag=...` and pre-selects that tech filter, while a skill like "Scrum" stays plain.

- [ ] **Step 3: Commit**

```bash
git add src/components/sections/skills.tsx
git commit -m "feat(skills): link skills to the filtered projects explorer

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>"
```

---

## Phase 3: Architecture diagrams

### Task 9: Mermaid pipeline, Architecture component, LedgerNudge diagram

**Files:**
- Modify: `package.json` (devDependency + `diagrams` script)
- Create: `docs/diagrams/ledgernudge.mmd`
- Create: `public/projects/ledgernudge/architecture.svg` (generated, committed)
- Create: `src/components/architecture.tsx`
- Modify: `src/components/mdx-components.tsx` (register `Architecture`)
- Modify: `content/projects/ledgernudge.mdx` (embed the diagram)

**Interfaces:**
- Produces: `Architecture({ src, caption }: { src: string; caption?: string })` usable inside MDX.

- [ ] **Step 1: Add the Mermaid CLI and a render script**

Run: `pnpm add -D @mermaid-js/mermaid-cli`

In `package.json` scripts, add:

```json
    "diagrams": "mmdc -i docs/diagrams/ledgernudge.mmd -o public/projects/ledgernudge/architecture.svg -b transparent"
```

- [ ] **Step 2: Write the Mermaid source**

Create `docs/diagrams/ledgernudge.mmd` (reuse the flow from the LedgerNudge repo README, theme-neutral):

```
flowchart LR
  Sched["dunning:advance (scheduled)"] -->|past-due step| Queue["Redis queue"]
  Queue -->|draft job| Draft["DunningDraftService"]
  Draft <-->|message draft| Claude["Anthropic Claude"]
  Draft -->|pending_approval| DB[("PostgreSQL")]
  Inbox["Operator inbox"] -->|approve| Queue
  Queue -->|send job| Send["MessageSender"]
  Send -->|email / SMS| Twilio["Twilio + email"]
  Inbox -->|create link| Stripe["Stripe"]
  Stripe -->|webhook| Recon["WebhookReconciler"] --> DB
  Twilio -->|inbound reply| Reply["InboundReplyService"]
  Reply <-->|classify| Claude
  Reply -->|dispute pauses sequence| DB
  DB --> Inbox
```

- [ ] **Step 3: Generate and commit the SVG**

Run: `mkdir -p public/projects/ledgernudge && pnpm diagrams`
Expected: `public/projects/ledgernudge/architecture.svg` is created. Open it to confirm it renders.

- [ ] **Step 4: Create the `Architecture` component**

Create `src/components/architecture.tsx`:

```tsx
import Image from "next/image";

export function Architecture({ src, caption }: { src: string; caption?: string }) {
  return (
    <figure className="my-8">
      <div className="overflow-x-auto rounded-xl border border-border bg-foreground/[0.02] p-4">
        <Image
          src={src}
          alt={caption ?? "Architecture diagram"}
          width={1200}
          height={500}
          className="h-auto w-full"
          unoptimized
        />
      </div>
      {caption && <figcaption className="mt-2 text-center text-xs text-muted-foreground">{caption}</figcaption>}
    </figure>
  );
}
```

(`unoptimized` because the source is already an SVG.)

- [ ] **Step 5: Register `Architecture` in MDX**

In `src/components/mdx-components.tsx`, import and add `Architecture` to the components map so MDX can use `<Architecture />`. Match the existing export shape in that file.

- [ ] **Step 6: Embed in the LedgerNudge case study**

In `content/projects/ledgernudge.mdx`, under the "## Architecture" heading, add:

```mdx
<Architecture src="/projects/ledgernudge/architecture.svg" caption="The dunning loop: draft, approve, send, reconcile, classify, pause." />
```

- [ ] **Step 7: Gate, visual check, commit**

Run: `pnpm typecheck && pnpm lint && pnpm test && pnpm build`
Expected: PASS. Visually confirm the diagram renders on `/projects/ledgernudge` in both themes.

```bash
git add package.json pnpm-lock.yaml docs/diagrams/ledgernudge.mmd public/projects/ledgernudge/architecture.svg src/components/architecture.tsx src/components/mdx-components.tsx content/projects/ledgernudge.mdx
git commit -m "feat(case-study): committed-SVG architecture diagrams, LedgerNudge first

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>"
```

---

## Phase 4: Cross-cutting

### Task 10: Per-project JSON-LD

**Files:**
- Modify: `src/app/projects/[slug]/page.tsx` (add a CreativeWork script)

**Interfaces:** none new.

- [ ] **Step 1: Add the CreativeWork JSON-LD**

In `src/app/projects/[slug]/page.tsx`, inside the returned fragment near the existing scripts, add:

```tsx
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "CreativeWork",
              name: project.title,
              description: project.summary,
              url: `${siteUrl}/projects/${project.slug}`,
              ...(project.links?.repo ? { codeRepository: project.links.repo } : {}),
            }),
          }}
        />
```

Add `import { siteUrl } from "@/lib/site-metadata";` if it is not already imported.

- [ ] **Step 2: Gate and commit**

Run: `pnpm typecheck && pnpm lint && pnpm build`
Expected: PASS.

```bash
git add src/app/projects/[slug]/page.tsx
git commit -m "feat(seo): per-project CreativeWork structured data

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>"
```

---

### Task 11: Analytics on filter usage

**Files:**
- Modify: `src/components/projects-explorer.tsx` (fire `track` on category and tech filter)

**Interfaces:**
- Consumes: `track` from `@vercel/analytics` (already a dependency).

- [ ] **Step 1: Fire events on filter changes**

In `src/components/projects-explorer.tsx`, import:

```tsx
import { track } from "@vercel/analytics";
```

In `toggleCategory`, when selecting (not clearing), call:

```tsx
    if (category !== c) track("filter_category", { category: c });
```

In `toggleTag`, when adding a tag (not removing), call:

```tsx
      track("filter_tech", { tag: normalizeTag(t) });
```

Do not track the search query contents. (Optional: fire `track("search_used")` with no value if you want a usage signal; do not include the text.)

- [ ] **Step 2: Gate and commit**

Run: `pnpm typecheck && pnpm lint && pnpm test && pnpm build`
Expected: PASS.

```bash
git add src/components/projects-explorer.tsx
git commit -m "feat(analytics): track category and tech filter usage

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>"
```

---

## Self-review notes

- Spec coverage: data model (Tasks 1, 2), unified card and badges (Task 3), explorer with URL sync, search, animation, a11y (Task 4), home featured (Task 5), impact line (Task 6), CV (Task 7), skills links (Task 8), diagrams (Task 9), JSON-LD (Task 10), analytics (Task 11). Out-of-scope items (Pagefind, planned status, live Mermaid, pagination) are intentionally absent.
- Type consistency: `Project`, `ProjectCategory`, `ProjectStatus`, `getAllProjects`, `getFeaturedProjects`, `filterProjects`, `techTagOptions`, `normalizeTag`, `CATEGORY_LABELS`, `CATEGORY_ORDER` are used with the same names and signatures across tasks.
- Known caveat: tech tags come straight from `stack`, so near-duplicate variants (for example ".NET 8" vs "C#/.NET") count separately; the 2-or-more rule limits clutter. Canonicalizing tech names is a future refinement, not in scope.
