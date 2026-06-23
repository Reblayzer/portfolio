# Projects explorer and portfolio enhancements: design

Date: 2026-06-24
Status: Approved (pending spec review)

## Goal

Make the portfolio scale as the project count grows, and raise its impression on
both technical and non-technical viewers. Concretely: a searchable, filterable
`/projects` explorer; a project taxonomy (category, tech tags, status); a tighter
home page that features a curated set; and a set of polish items (impact lines, a
prominent CV, skills-to-projects linking, architecture diagrams, structured data,
analytics, accessibility).

This is one initiative delivered in four independently shippable phases.

## House rules (apply throughout)

- No em dashes anywhere. Use commas, periods, colons, or parentheses.
- Tone: restrained, confident, first person, present tense.
- No invented details, metrics, or company/role names in public copy.
- Do not change unrelated design tokens or components.
- Verify each phase: `pnpm typecheck && pnpm lint && pnpm test && pnpm build` all exit 0, plus a visual check.

## Locked decisions

1. A dedicated `/projects` page is the explorer; the home page shows a curated featured set with a "View all projects" link.
2. One primary category per project, plus tech tags. Categories: Data Engineering, Cloud & DevOps, Backend & APIs, AI & LLM, Frontend & Full-stack.
3. Lightweight client-side metadata search (title, summary, category, tech). No Pagefind for now.
4. Architecture diagrams are committed SVGs rendered from version-controlled Mermaid source. No runtime or build-time browser.
5. Data foundation: a unifying `lib/projects.ts` merges the two existing sources (MDX flagships, `_cards.ts` cards) into one `Project` shape.

## 1. Data model and taxonomy

### Types

```ts
// lib/projects.ts
export type ProjectCategory =
  | "data-eng"
  | "cloud-devops"
  | "backend"
  | "ai-llm"
  | "frontend";

export type ProjectStatus = "shipped" | "in-progress";

export type Project = {
  title: string;
  summary: string;
  category: ProjectCategory;
  tags: string[];           // reuses each project's existing `stack`
  status: ProjectStatus;
  year?: number;            // flagships only
  cover?: string;
  links: { repo?: string; live?: string };
  href?: string;            // "/projects/<slug>" for flagships; undefined for cards
  featured?: boolean;       // flagships only
  impact?: string;          // flagships only, optional
};

export const CATEGORY_LABELS: Record<ProjectCategory, string> = {
  "data-eng": "Data Engineering",
  "cloud-devops": "Cloud & DevOps",
  backend: "Backend & APIs",
  "ai-llm": "AI & LLM",
  frontend: "Frontend & Full-stack",
};
```

### Sources and fields added

- Flagship frontmatter gains: `category` (required), `featured?` (boolean), `impact?` (string). `status` defaults to `shipped`. `tags` comes from the existing `stack`.
- `ProjectCard` type in `_cards.ts` gains: `category` (required). `status` defaults to `in-progress`. `tags` comes from `stack`.
- `lib/mdx.ts` `FlagshipFrontmatter` extends with `category`, `featured?`, `impact?`.

### Normalization and merge

- `normalizeTag(s)`: lowercase and trim, used for matching and URL params.
- `getAllProjects(): Project[]` maps `listFlagships()` and `projectCards` into `Project`, setting `status`, `href` (flagships), `featured`, and `tags = stack`.
- Default order: shipped first sorted by `year` descending, then in-progress sorted alphabetically by title.
- `getFeaturedProjects()`: flagships with `featured: true`, in default order.
- Tech filter chips show only tags used by 2 or more projects (computed from `getAllProjects()`); search still matches any tag.

### Initial category assignment (tunable)

Flagships:

| Project | Category |
|---|---|
| Real-Time CDC Pipeline | data-eng |
| Consentinel | backend |
| LedgerNudge | ai-llm |
| Niteshift | frontend |
| NutriMind | ai-llm |
| PolySearch | backend |
| Portfolio Site | frontend |
| Shopcraft | frontend |

Featured on home (`featured: true`): LedgerNudge, Consentinel, Real-Time CDC Pipeline, PolySearch, NutriMind, Shopcraft (6 across all categories). Adjustable.

Work-in-progress cards:

| Project | Category |
|---|---|
| Aegis | cloud-devops |
| AgentGuard | ai-llm |
| Ansible Fleet Baseline | cloud-devops |
| AskDocs | ai-llm |
| Azure Secure Landing Zone | cloud-devops |
| BunkerFlow | backend |
| BunkerStream | data-eng |
| CampaignFlow | data-eng |
| Citera | ai-llm |
| CityCatalog | backend |
| Coalesce | data-eng |
| DeltaPilot | data-eng |
| Deskhand | ai-llm |
| FieldBridge | backend |
| Fundament | cloud-devops |
| HarborWatch | frontend |
| HostStack | cloud-devops |
| Keystone | backend |
| MediaVault | backend |
| MeterFleet | cloud-devops |
| MixPilot | backend |
| NoticeBridge | backend |
| PipeForge | cloud-devops |
| ProcessBridge | backend |
| ShipBoard | frontend |
| SitRep | frontend |
| Stockpile | backend |
| Stocktide | data-eng |
| Threadline | frontend |
| Throughline | ai-llm |
| TradePort | frontend |
| WagerLedger | backend |

## 2. Unified card and badges

- Consolidate `FlagshipProjectCard` and `ProjectCard` into one `ProjectCard` taking a `Project`.
- Renders: cover when present (16:9, `quality={100}`), a status badge ("Shipped" or "In progress", text label not color-only), a category badge, title, summary, tech chips.
- Footer adapts: when `href` is set, "Read case study ->" links to it; otherwise repo/live icons when links exist, else nothing.
- Reused by the home featured row and the explorer grid. Honors `prefers-reduced-motion`.
- New small `StatusBadge` and `CategoryBadge` presentational components.

## 3. The /projects explorer

- New `src/app/projects/page.tsx` (server) loads `getAllProjects()` and renders a client `ProjectsExplorer` with the list and the computed tech-tag options.
- Filter bar:
  - Category: single-select chips (All plus the 5), each with a count.
  - Tech: multi-select chips (tags used by 2+ projects), inside a collapsible "Filter by tech".
  - Search input over title, summary, category label, and tags.
  - Live result count ("12 projects") in an `aria-live="polite"` region.
  - "Clear" action shown when any filter is active.
- State is URL-synced via `useSearchParams` and `router.replace`: `?category=ai-llm&tag=kafka&tag=react&q=...`. Reading on load hydrates the filters, so views are shareable and back-button friendly.
- `filterProjects(projects, { category, tags, q })` is a pure function:
  - category: exact match, or all when undefined.
  - tags: OR semantics (project matches if it has any selected tag).
  - q: case-insensitive substring over title, summary, category label, and tags.
- Framer Motion `layout` animation on the grid as the filtered set changes, with an `AnimatePresence` for enter/exit. Disabled under reduced motion.
- Empty state: a short message plus a "Clear filters" button.
- Accessibility: chips are real `<button>`s with `aria-pressed`; the search input has a visible label or `aria-label`; focus states are visible.
- Page-level metadata: title and description for `/projects`; included in the sitemap.

## 4. Home page changes

- The home `Projects` section becomes "Featured", rendering `getFeaturedProjects()` (the 6 above) via the unified card, followed by a "View all projects ->" link to `/projects`.
- The 32 in-progress cards are removed from the home page; they live in the explorer. The current "In progress" inline block on the home page is deleted.

## 5. Content enhancements

- Impact line: optional `impact` on flagship frontmatter, surfaced as a lead line near the top of the case-study page, and optionally on the featured card. Added incrementally; not every flagship needs one at first.
- CV: a "Download CV" button in the hero next to the existing actions, plus a small nav link, pointing at the existing `/resume.pdf`.
- Skills to projects: in the Skills section, a skill item becomes a link to `/projects?tag=<normalizeTag(skill)>` when it maps to a tag present in `getAllProjects()`. Non-matching skills (Scrum, Clean Architecture, etc.) stay plain text. The mapping is computed, so it stays correct as projects change.

## 6. Architecture diagrams

- For flagships with a real architecture story, keep a Mermaid source at `docs/diagrams/<slug>.mmd` and a committed render at `public/projects/<slug>/architecture.svg`.
- Rendered locally with the Mermaid CLI (`@mermaid-js/mermaid-cli`, a dev dependency) via a `pnpm diagrams` script. Output committed. No runtime library and no build-time browser.
- Theme-neutral colors so the SVG reads in light and dark.
- Embedded in the case study via a small `<Architecture src=... caption=... />` MDX component that renders the image with a title for accessibility.
- Start with LedgerNudge (its Mermaid diagram already exists in the LedgerNudge repo README and can be reused). Roll out to other flagships incrementally.

## 7. Cross-cutting

- Structured data: add `CreativeWork` JSON-LD on `/projects/[slug]` (name, description, author, url, optional codeRepository). The Person JSON-LD on the home page stays.
- Analytics: fire Vercel Analytics custom events via `track()` when a category or tech filter is applied (event name plus the category or tag value). Do not send raw search text; if a search-usage signal is wanted, send only a boolean or the query length, never the contents.
- Accessibility: covered in the explorer; diagram SVGs carry a title; the CV button is labeled.

## 8. Testing and verification

- Vitest unit tests for the pure functions:
  - `getAllProjects()` returns a merged list where every item has a valid `category`, a `status`, and non-empty `tags`.
  - `filterProjects()` covers: category match, tag OR semantics, search match, and combinations, including the empty-result case.
  - `getFeaturedProjects()` returns only `featured` flagships.
- Existing MDX loader tests stay; update them only if the loader signature changes.
- Per-phase gate: `pnpm typecheck && pnpm lint && pnpm test && pnpm build` all green, plus a visual check of `/projects` and the home page. Scan for em dashes and company names in any new copy.

## 9. Phasing

Each phase is a self-contained, committable unit.

1. Foundation and explorer: `lib/projects.ts`, taxonomy fields, backfill all 40 categories and statuses, unified `ProjectCard` plus badges, `filterProjects()`, `/projects` page with filters, search, URL sync, and animation, and the home "Featured" change. Tests for the pure functions.
2. Content: impact lines (where ready), CV button, skills-to-projects links.
3. Diagrams: Mermaid CLI dev setup, the `pnpm diagrams` script, `<Architecture>` component, and the LedgerNudge diagram. Additional flagship diagrams as follow-ups.
4. Cross-cutting: per-project JSON-LD, analytics events, and a final accessibility pass.

## Out of scope (named, not built)

- Full-text search across case-study bodies (Pagefind). Lightweight metadata search is the chosen first step; this is the upgrade path if needed.
- A third "planned" status. Two states only.
- Live Mermaid rendering in the browser.
- Pagination on `/projects` (not needed at current scale; revisit past a few hundred projects).
