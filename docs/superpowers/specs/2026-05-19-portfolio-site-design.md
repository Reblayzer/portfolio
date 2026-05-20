# Portfolio Site — Design Spec

**Date:** 2026-05-19
**Owner:** Alexandro Bolfa
**Domain:** alexandro-bolfa.com
**Status:** Approved, ready for implementation planning

---

## Goal

Ship a personal portfolio site at `alexandro-bolfa.com` that:

1. Lets a recruiter or hiring manager understand who Alexandro is and what he can do in under 30 seconds.
2. Provides depth on demand — 1–2 flagship projects get full case-study pages for engineering managers who want to evaluate technical thinking.
3. Demonstrates current frontend craft and tooling literacy through the site itself (the portfolio is its own first case study).

## Audience & positioning

- **Primary audience:** recruiters and hiring managers screening new-grad software engineers.
- **Secondary audience:** engineering managers and senior devs who click through to case studies.
- **Positioning:** new-grad software engineer, frontend-focused, full-stack capable.
- **Tone:** minimal, refined, confident — Stripe / Linear / Vercel adjacent.

## Information architecture

```
/                       Single-page home (anchored sections)
/projects/[slug]        Full case-study page (per flagship project)
/resume.pdf             Static asset (in /public)
/api/contact            Route handler — accepts contact-form submissions
/sitemap.xml            Auto-generated
/robots.txt             Auto-generated
```

### Home-page sections (in scroll order)

1. **Hero** — Centered layout. Name, one-line pitch ("Software engineer — frontend-focused, full-stack capable"), two CTAs ("See work →" scrolls to projects; "Get in touch" scrolls to contact). No motion in hero.
2. **About** — 2–3 short paragraphs. Who Alexandro is, what he's looking for, what he cares about.
3. **Skills / Stack** — Visual grid grouped by category (Frontend, Backend, DevOps, Tools). Icon + name chips.
4. **Experience** — Vertical timeline. Each entry: role, company, dates, 2–3 bullets. Education at the bottom.
5. **Selected work** — Project grid. Flagship project(s) visually larger with "Read case study →"; non-flagship projects as compact cards (stack chips, GitHub + live demo links).
6. **Contact** — Big-type email, social icons (GitHub, LinkedIn, X), repeated Resume download button, working contact form.

### Sticky nav

Logo (initials "AB" in electric blue), section anchors, theme toggle, "Resume" download button as primary visual emphasis.

### Footer

Built-with credits, link to source repo, year.

### Out of scope

- Blog / writing section (designed to add later: `content/blog/*.mdx`)
- Command palette (⌘K) — overkill for this size; sticky nav covers it
- CMS — git is the CMS

## Visual design

### Color

Mono base + single accent.

| Token | Light | Dark |
|---|---|---|
| Background | `#ffffff` | `#0a0a0a` |
| Foreground | `#0a0a0a` | `#fafafa` |
| Muted foreground | `#52525b` | `#a1a1aa` |
| Border | `rgba(0,0,0,0.08)` | `rgba(255,255,255,0.08)` |
| Accent | `#2563eb` (electric blue, Tailwind `blue-600`) | `#3b82f6` (Tailwind `blue-500` for contrast) |

Accent is used for: brand mark ("AB"), primary CTA buttons, resume pill in nav, link hover, focus rings, active timeline dot.

### Typography

- **Display (hero name, section H2s):** Geist Mono, weight 500, tracked tight (`-0.04em` on hero name).
- **Body & UI:** Geist Sans, weights 400 / 500 / 600.
- **Labels, dates, stack chips:** Geist Mono small caps, uppercase, `letter-spacing: 0.08em`.
- Loaded via the official `geist` npm package (Vercel-published, self-hosted, zero layout shift, no external requests).

### Dark mode

- Both themes are real designs, not auto-inverted.
- Follows `prefers-color-scheme` by default.
- Toggle in nav lets user override; choice persists in `localStorage`.
- No theme-flash on load (inline script in `<head>`, standard `next-themes` pattern).

### Motion

- Subtle baseline only. Calm > clever.
- Sections fade + 8px translate on scroll-into-view (Framer Motion `whileInView`, run once).
- Nav theme toggle has a spring transition.
- Project cards have hover lift + cover-image scale.
- Page transitions cross-fade.
- **Hero has no motion.** A minimal centered hero should not move.
- All transforms disabled if `prefers-reduced-motion: reduce`.

## Tech stack

- **Framework:** Next.js 15, App Router, TypeScript strict.
- **Styling:** Tailwind CSS v4, shadcn/ui primitives (button, dialog, tooltip, dropdown, theme-toggle).
- **Motion:** Framer Motion (only where it earns its weight).
- **Forms:** React Hook Form + Zod for validation.
- **Email:** Resend SDK for contact-form delivery (free tier).
- **Content:** MDX for flagship case studies (via `@next/mdx` or `contentlayer`-style helper), TypeScript data files for everything else.
- **Icons:** lucide-react.
- **Linting / formatting:** ESLint + Prettier with project config.
- **Package manager:** pnpm.

## Content model

Content lives in a top-level `content/` directory; the app reads it at build time.

```
content/
├── projects/
│   ├── portfolio-site.mdx      ← flagship case study (MDX, full body)
│   ├── <other-flagship>.mdx    ← flagship case study
│   └── _cards.ts               ← non-flagship project cards (typed array)
├── experience.ts               ← roles + education (typed)
├── skills.ts                   ← grouped tech stack (typed)
└── site.ts                     ← bio, hero copy, social links, email
```

### Flagship project (`content/projects/*.mdx`)

```yaml
---
title: "Portfolio Site"
slug: "portfolio-site"
summary: "Design, build, and ship my own portfolio on Vercel."
stack: ["Next.js 15", "TypeScript", "Tailwind", "shadcn/ui"]
role: "Designer & Engineer"
year: 2026
links:
  live: "https://alexandro-bolfa.com"
  repo: "https://github.com/<user>/portfolio"
cover: "/projects/portfolio/cover.png"
flagship: true
---

## The problem
...case-study body in MDX, can embed components...
```

### Non-flagship project (entry in `content/projects/_cards.ts`)

```ts
{
  title: "Project Name",
  summary: "One-line description.",
  stack: ["Next.js", "Postgres"],
  links: { repo: "...", live: "..." },
  cover: "/projects/foo.png",
}
```

### Why this shape

- MDX for flagships supports rich long-form content with embedded components.
- TS data files for cards / skills / experience are typesafe, fast, and easy to refactor.
- Single `site.ts` for global copy keeps changes in one place.
- Zero CMS, zero auth, zero cost.
- Project images live in `/public/projects/<slug>/`; rendered with `next/image`.
- The same pattern extends to `content/blog/*.mdx` later without restructuring.

## Contact form

- Lives in the home-page Contact section.
- Fields: name, email, message, honeypot (`website`, hidden from humans).
- Client-side: React Hook Form + Zod schema for validation; inline errors.
- Submission posts to `/api/contact` (Next.js Route Handler).
- Server: validates with the same Zod schema, drops requests with a non-empty honeypot, sends email via Resend to Alexandro's address.
- Rate-limited via Upstash Ratelimit (Redis, edge-compatible, free tier) — keyed by client IP. In-memory rate limiting is not used because Vercel serverless invocations don't share memory reliably.
- No reCAPTCHA — honeypot + Upstash rate limit is sufficient for this scale.

## Performance, SEO, accessibility

### Performance

- Lighthouse ≥ 95 across all four categories.
- Self-hosted Geist via `next/font` (zero layout shift, no external requests).
- All images via `next/image` with explicit dimensions.
- No client-side data fetching on the home page; everything is RSC-rendered at build time.

### SEO

- Per-page metadata (`title`, `description`, OpenGraph, Twitter card) via the Next.js Metadata API.
- Auto-generated OG images per page using `@vercel/og` so case-study links preview well on LinkedIn/Twitter.
- Sitemap (`/sitemap.xml`) and robots (`/robots.txt`) generated at build time.
- Structured data (JSON-LD) for `Person` on home, `Article` on case studies.

### Accessibility

- Semantic HTML, single `<h1>` per page, logical heading order.
- Keyboard-navigable; visible focus rings in electric blue.
- WCAG AA contrast verified in both themes (light and dark).
- All shadcn primitives used as-is (already a11y-correct).
- All form fields have associated labels; errors announced to screen readers.

## Analytics

- Vercel Analytics + Vercel Speed Insights (free tier, no cookies, privacy-friendly).
- No third-party analytics (no GA, no Plausible).

## Hosting & deployment

- Deployed on Vercel.
- Domain: apex `alexandro-bolfa.com` with `www.` → apex redirect, both HTTPS.
- `main` branch = production; PRs get preview URLs automatically.
- Environment variables stored in Vercel (Resend API key, contact-email address, Upstash Redis URL + token).
- Vercel MCP wired into the dev environment for deploy / build inspection during implementation.

## Success criteria

The site is considered done for v1 when:

1. Live at `https://alexandro-bolfa.com` with `www.` redirect.
2. Lighthouse home page ≥ 95 in all four categories on mobile and desktop.
3. At least one flagship case study (the portfolio site itself) is written and live at `/projects/portfolio-site`.
4. Skills, experience, contact links, and resume download are populated and accurate.
5. Contact form successfully delivers a test message via Resend.
6. Light and dark modes are visually verified at standard breakpoints (mobile, tablet, desktop).
7. No console errors; no TypeScript errors; ESLint clean.

## Open items for the implementation plan

- Final bio / hero copy — Alexandro to draft during implementation.
- Other flagship case study (beyond the portfolio site itself) — TBD; site is designed to accommodate one or two more.
- Exact list of skills, experience entries, and external project links — to be filled in `content/*.ts` files during implementation.
