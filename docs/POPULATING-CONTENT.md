# Populating the portfolio with real content

This is a handoff guide for an AI agent (Claude, etc.) that's been asked to
fill the portfolio site with Alexandro's real bio, projects, experience, and
résumé. Read this **first**, then ask the user where their source materials
live before changing anything.

---

## Where you are

You're in the `Portfolio` repo (`https://github.com/Reblayzer/portfolio`). The
site is fully built (Tasks 1–25 of `docs/superpowers/plans/2026-05-19-portfolio-site.md`)
and ready to deploy. What's missing is **real content** in the placeholder
files under `content/` and `public/`.

The design, components, routing, contact form, OG images, sitemap, and theme
are all done. **Do not redesign anything.** Your only job is to swap
placeholders for real values.

**Tech stack** (for reference, not for you to change):
Next.js 16 App Router · TypeScript strict · Tailwind v4 (CSS-first `@theme`) ·
shadcn/ui · Framer Motion · Geist (npm package) · React Hook Form + Zod ·
Resend · Upstash Ratelimit · next-mdx-remote · pnpm.

---

## House rules (the user cares about these)

1. **No em dashes (`—`) anywhere.** Use commas, periods, colons, or parens.
   This is a strict preference.
2. **Tone is restrained, confident, first-person, present tense.** Match the
   register of what's already in `content/site.ts` and the existing case study
   at `content/projects/portfolio-site.mdx`. Read those before writing new copy.
3. **Don't invent details.** If you don't have the answer (e.g., a project's
   real metric, a date, a stack item), ask. Don't make something up.
4. **Don't add new sections, routes, or components** without explicit user
   approval. The information architecture is locked.
5. **Don't change the design tokens** in `src/app/globals.css` or the
   component code. If something feels wrong visually, raise it; don't fix it.
6. **Don't commit secrets.** `.env.local` is gitignored; never put real API
   keys in `.env.example` or anywhere committed.

---

## Step 1: Ask the user where their materials live

Before reading any file, ask the user where to find:

- **Résumé / CV** (PDF preferred). Where on disk?
- **GitHub username / list of repos** to consider for the projects section
  (note: GitHub handle is `Reblayzer`; portfolio identity is `alexandro-bolfa`)
- **Side projects folder** if their projects live on disk as code
  (e.g., `~/Desktop/projects/`)
- **Screenshots / cover images** for projects, if any
- **LinkedIn URL** (current: `https://www.linkedin.com/in/alexandro-bolfa/`,
  confirm it's still right)
- **Contact email** (current: `contact@alexandro-bolfa.com`)
- **Bio / "about me" copy** in their head, or do they want you to draft it
  from the résumé?

The user may have all of this in a single folder; have them point you at it.

---

## Step 2: Read the materials

Use `Read`, `Glob`, and `Grep` to inventory whatever the user pointed you at:

```
# typical commands
ls <path>
Read <résumé.pdf>
ls <projects-dir>
Read <projects-dir>/<each>/README.md
```

Note for each project:
- Title (the marketing name, not the repo name unless they match)
- One-line summary (what it does, not how)
- Stack (the 2–4 most relevant techs to surface)
- Repo URL
- Live URL (if any)
- Whether the user wants this as a **flagship** (full case-study page with
  MDX writeup) or a **card** (compact card on the home page)

For experience, note for each role: title, company, dates (start/end as
`YYYY-MM` or `YYYY`), 2–3 bullets describing impact.

---

## Step 3: Map materials to files

| Source | Lands in | Shape |
|---|---|---|
| Résumé PDF | `public/resume.pdf` | Copy as-is, overwrite the placeholder |
| Bio paragraphs | `content/site.ts` → `about` | Two `as const` strings |
| One-line pitch | `content/site.ts` → `pitch` | One string, scans in <2s |
| Location | `content/site.ts` → `location` | E.g. `"Romania"` |
| Email | `content/site.ts` → `email` | Already `contact@alexandro-bolfa.com` |
| Socials | `content/site.ts` → `socials` | Array of `{ label, href }`. Current: GitHub + LinkedIn |
| Skill groups | `content/skills.ts` → `skillGroups` | Frontend / Backend / DevOps / Tools (rename groups if needed) |
| Experience | `content/experience.ts` → `experience`, `education` | Typed arrays; see existing shape |
| Non-flagship projects | `content/projects/_cards.ts` → `projectCards` | One entry per card |
| Flagship project | `content/projects/<slug>.mdx` | New MDX file with frontmatter + body |
| Flagship cover image | `public/projects/<slug>/cover.png` | 1600×900 PNG or JPG |

Each file already exports the type you need. Read it first; reuse the type;
don't redefine it.

### Flagship case-study frontmatter (must include all fields)

```yaml
---
title: "Project Name"
slug: "project-slug"
summary: "One sentence describing the project."
stack: ["Tech 1", "Tech 2", "Tech 3"]
role: "Your role (e.g. Designer & Engineer)"
year: 2026
links:
  live: "https://..."   # optional
  repo: "https://..."   # optional
cover: "/projects/project-slug/cover.png"
flagship: true
---
```

Body sections to write (matches the existing `portfolio-site.mdx` template):

1. `## The problem` — what you set out to solve, in 2–3 sentences.
2. `## Approach` — the call you made and why; one paragraph.
3. `## Architecture` — bullet list of the key technical decisions.
4. `## What I'd do differently` (optional) — what you'd revisit.

**Length:** 200–500 words is fine. Don't pad. Don't write "Conclusion".

---

## Step 4: Flagship vs card decision

The home page already has one flagship: the portfolio site itself
(`content/projects/portfolio-site.mdx`). The design accommodates **1–2
flagships total** plus a grid of cards.

For each project the user has, decide together:

- **Flagship** if: there's a real story to tell (problem → decisions →
  outcome), and the user is proud of the technical depth. Worth writing
  300+ words about.
- **Card** if: it's a side project, a tutorial follow-along, a small
  utility, or anything the user can describe in one line. Most projects
  should be cards.

**Default to card unless the user explicitly wants a flagship.** Flagship
case studies are a real writing commitment; a thin case study is worse than
a great card.

---

## Step 5: Replace the placeholder résumé and cover image

Both currently exist as placeholders:

- `public/resume.pdf` is a placeholder. Overwrite with the real PDF.
- `public/projects/portfolio/cover.png` is a 1×1 transparent PNG and
  renders as a gray box. Either:
  - Replace with a 1600×900 PNG/JPG (a screenshot of the live site is
    the most direct choice), or
  - Ask the user to generate one (Figma, screenshot tool, etc.) and
    place it at that exact path.

Image paths in MDX frontmatter and `_cards.ts` are relative to `/public/`
(so `/projects/foo/cover.png` resolves to `public/projects/foo/cover.png`).

---

## Step 6: Verify before claiming done

After every batch of edits, run:

```
pnpm typecheck && pnpm lint && pnpm test && pnpm build
```

All four must exit 0. The test suite includes a check that
`getFlagshipBySlug` returns the right thing for the first flagship; if you
add or rename a flagship, you may need to update `tests/mdx.test.ts`.

If you want visual confirmation that the site still renders correctly with
the new content, the user can `pnpm dev` and you can drive Chromium with
Playwright (see how the previous session did it in the verification
report). The Playwright dev dep is already installed.

---

## Step 7: Commit and push

Commit each logical batch on its own. Reasonable commit messages:

- `content: real bio, pitch, socials`
- `content: skills (real stack)`
- `content: experience timeline + education`
- `content: <N> project cards`
- `content: flagship case study <slug>`
- `public: real resume.pdf + project cover images`

**Do not commit `.env.local`, `.verify-tmp/`, `node_modules/`, or any
screenshots from your verification runs** — `.gitignore` already excludes
these but double-check before pushing.

`main` is the deploy branch. Push to `origin/main`.

---

## What "done" looks like

The user can declare the content-population work complete when:

1. `content/site.ts` has real `name`, `pitch`, `about`, `location`, `email`,
   `socials`.
2. `content/skills.ts` has groups that reflect what the user actually
   reaches for.
3. `content/experience.ts` has the real timeline (roles + education).
4. `content/projects/_cards.ts` has 2–5 non-placeholder project cards.
5. `content/projects/portfolio-site.mdx` (and any additional flagships) has
   real writing, not the placeholder body.
6. `public/resume.pdf` is the real PDF.
7. `public/projects/*/cover.png` has real cover art for each flagship.
8. `pnpm typecheck && pnpm lint && pnpm test && pnpm build` exits 0.
9. The user has spot-checked the site at `pnpm dev` and approves the copy.

At that point, the site is ready to deploy (Task 26 of the original plan):
Vercel import, env vars, custom domain. The deploy guide is in
`docs/superpowers/plans/2026-05-19-portfolio-site.md` (Task 26).

---

## Files you should not touch unless asked

- `src/app/**` (routes, layouts, OG images, sitemap, robots, API)
- `src/components/**` (every UI component)
- `src/lib/**` (helpers)
- `tailwind.config.*`, `src/app/globals.css` (design tokens)
- `next.config.ts`, `tsconfig.json`, `eslint.config.mjs`, `vitest.config.ts`,
  `postcss.config.mjs`, `components.json`
- `package.json` (except adding deps for a clearly justified reason)
- `docs/superpowers/` (the spec and plan are historical artifacts)

If you find a real bug while populating content (broken link, busted layout
when the data is filled in, etc.), surface it to the user and ask before
fixing.
