# Generated CV PDF from portfolio + MASTER_PROFILE

**Date:** 2026-06-24
**Status:** Approved (design)
**Resolves:** Issue #3, Bug 2 (the CV link 404s because `public/resume.pdf` does not exist)

## Problem

The "Download CV" hero button and the "CV" nav link both point at `/resume.pdf`,
but `public/resume.pdf` does not exist, so the link 404s on every page. We want a
real CV PDF that stays in sync with the site rather than a hand-authored file that
drifts.

## Goal

A one-page, brand-matched CV served at `public/resume.pdf`, generated from in-repo
content (portfolio content files + curated material from the `alex-work`
`MASTER_PROFILE.md`) so the CV never drifts from the site. No change is needed to
the existing links: they already point at `/resume.pdf`; the file simply starts
existing.

## Sources of truth

- **Portfolio content** (`content/site.ts`, `content/skills.ts`,
  `content/experience.ts`) for identity, skills, and education.
- **`MASTER_PROFILE.md`** (private `Reblayzer/alex-work` repo, `Data/MASTER_PROFILE.md`)
  for the expanded Schneider experience, the two CV projects, languages, and the
  two mandatory profile lines. Curated subset is copied into the repo as
  `content/resume.ts`; the original stays private.

## Decisions (from brainstorming)

1. **PII on the public PDF: minimal.** Name, location (Horsens, Denmark), email,
   GitHub, LinkedIn, personal site only. No date of birth, no street address, no
   phone number, and never the reference's phone number. The PDF is world
   downloadable and indexable.
2. **Projects: depth + a focus-areas pointer.** Two real deep entries (Niteshift,
   Consentinel) plus one "Focus areas" line linking to `/projects` for breadth.
   The ~32 project cards are work-in-progress ideas and must not be listed as a
   body of shipped work.
3. **Length: one page.**
4. **Design: match the portfolio brand.** Monochrome, Geist Mono for the name and
   headings, clean readable body. Includes the `ab-logo.svg` logo and a profile
   photo in the header.
5. **`/resume` route: viewable but noindex.** Renders as a real HTML page (nice
   fallback, shareable) but `robots: { index: false }`, not in nav, not in the
   sitemap. The PDF is generated from it.
6. **Generation pattern: local script, committed artifact.** Matches the repo's
   established pattern (committed diagram SVGs; commit `9a5767d` deliberately keeps
   browser tooling off the deploy path). No browser tooling runs on Vercel.

## Content (one page, no em dashes per the MASTER_PROFILE style rule)

1. **Header** — `ab-logo.svg`, name, one-line title, and a circular profile photo.
   Minimal contact: Horsens, Denmark; email; GitHub; LinkedIn; alexandro-bolfa.com.
2. **Profile** — 3 to 4 lines distilled from `site.about` plus the two mandatory
   `MASTER_PROFILE` lines: Danish (DU3 Module 3) and AI/LLM-guided development.
3. **Skills** — the five `skills.ts` categories.
4. **Experience** — Schneider Electric, expanded from `MASTER_PROFILE` section 5
   (global release train, both projects, end-to-end ownership, tech stack), sized
   to fill most of the page. Role: Software Developer (Intern & Student Assistant),
   01/2024 - 01/2026, Kolding, Denmark.
5. **Education** — VIA University College, B.Sc. Software Technology Engineering,
   08/2022 - 01/2026, with the Storage Connector bachelor project.
6. **Projects** — Niteshift (described, no link, private repo) and Consentinel
   (linked, public, CI-passing).
7. **Focus areas** — one line: Backend, Data Engineering, AI/LLM, Cloud/DevOps,
   Frontend, linking to `/projects`.
8. **Languages** — compact line: English C1, Italian C1, Romanian B2, German B2,
   Danish A2 (studying DU3.M3).

## Architecture

### `content/resume.ts` (new)
CV-curated content module. Imports `site` (identity, socials), `skillGroups`, and
`education` from the existing content files; defines only CV-specific extras:

- `resumeProfile: string[]` — the profile paragraph lines (includes the Danish and
  AI/LLM mandatory lines).
- `resumeContact` — the minimal contact subset (label/value/href), no PII beyond
  location, email, and links.
- `resumeExperience` — the expanded Schneider entry (role, company, location,
  period, bullets). Curated separately from the portfolio's concise
  `experience.ts` version; minor intentional duplication, different audience.
- `resumeProjects: { name, blurb, detail, link?, stack }[]` — Niteshift (no link)
  and Consentinel (link `https://github.com/Reblayzer/consentinel`).
- `resumeFocusAreas: { label: string; href: string }` — the categories line and
  the `/projects` link.
- `resumeLanguages: { name, level }[]`.

Type-annotated, under the project's file-size and style conventions, no em dashes.

### `src/app/resume/page.tsx` (new)
Standalone server component rendering the CV from `content/resume.ts`.

- `export const metadata = { robots: { index: false }, title: "CV" }`.
- Does not import `Nav` or `Footer` (the root layout does not inject them).
- Uses a **fixed light print palette** (white background, near-black text, the
  site accent), independent of the site's dark/light theme, so the PDF is always a
  light document. Does not consume the themeable CSS variables.
- Uses Geist Mono / Geist Sans (already provided as CSS variables by the root
  layout) for brand consistency.
- An A4-sized container with `@page { size: A4; margin: ... }` print rules and a
  small amount of component-scoped CSS (a CSS module or a `<style>` block) for
  print sizing. Photo rendered as a circular crop referencing `/headshot.jpg`.

### `public/headshot.jpg` (new asset)
The attached beach photo, optimized to a ~512x512 square JPEG (target well under
the current 360 KB original) and committed. Referenced by the resume page.

### `scripts/generate-resume.mjs` (new)
Local generation script:

1. Start the Next server on a fixed port (e.g. `next dev -p 3210`), as a child
   process.
2. Poll `http://localhost:3210/resume` until it returns 200 (with a timeout).
3. Launch Playwright Chromium, navigate to the route, `emulateMedia({ media: "print" })`,
   and `page.pdf({ path: "public/resume.pdf", format: "A4", printBackground: true,
   margin: {...} })`.
4. Close the browser and terminate the server child process (including on error).

Playwright is already a devDependency; Chromium is installed once with
`npx playwright install chromium` (documented in the spec and a script comment).

### `package.json`
Add `"resume": "node scripts/generate-resume.mjs"`.

### `public/resume.pdf`
Committed artifact, like the diagram SVGs.

### Links
`src/components/nav.tsx` and `src/components/sections/hero.tsx` already point at
`/resume.pdf`. No change required.

## Testing (TDD, runs in the existing node vitest env)

`tests/resume.test.ts`, asserting on `content/resume.ts` (all data-level, no DOM):

- **Style rule:** no em dash (`—`) appears in any CV string field (recursive walk).
- **Mandatory lines:** the profile contains the Danish (DU3) line and an AI/LLM
  reference.
- **No PII leak:** the phone (`50 21 00 57`), DOB (`03/03/2003`), street
  (`Bødkervej`), and the reference's phone (`24 20 47 88`) do not appear anywhere
  in the module.
- **Projects:** Consentinel has the public repo link; Niteshift has no link/url.

Component DOM rendering is not unit-tested (no jsdom infra in this repo, consistent
with existing tests). The generation script is a local build tool and is not
unit-tested.

## Out of scope

- Per-role tailored CV variants (the `MASTER_PROFILE` lead-project switching).
  This generates one general CV; tailoring stays a manual exercise.
- Running PDF generation on deploy. It is a local, committed-artifact workflow.
- Cover-letter or LinkedIn generation.

## Risks / assumptions

- **One assumption that could be wrong:** that a `next dev` server renders the
  `/resume` route faithfully enough for `page.pdf` (fonts loaded, no hydration
  gaps). Mitigation: poll for 200 and add a short settle/`networkidle` wait before
  printing; if dev proves flaky, fall back to `next build` + `next start`.
- Chromium must be installed locally for the script (one-time `npx playwright
  install chromium`).
- The photo on a public PDF is intended and EU-conventional; the user opted in.
