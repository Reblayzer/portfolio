# Portfolio Site Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship the portfolio site at `alexandro-bolfa.com` per the spec at `docs/superpowers/specs/2026-05-19-portfolio-site-design.md`.

**Architecture:** Next.js 15 App Router, RSC-first, single-page home with anchored sections and dedicated `/projects/[slug]` case-study routes. Content lives in a top-level `content/` directory (MDX for flagship case studies, TypeScript data files for everything else). Contact form posts to a Route Handler that validates with Zod, rate-limits via Upstash, and delivers via Resend.

**Tech Stack:** Next.js 15 + TypeScript strict, Tailwind v4, shadcn/ui, Framer Motion, Geist (`geist` npm package), React Hook Form + Zod, Resend, Upstash Ratelimit + Redis, `next-mdx-remote`, `@vercel/og`, lucide-react, Vercel Analytics + Speed Insights. Package manager: **pnpm**. Test runner: **Vitest** (used selectively for logic units).

---

## File Structure

Files created or modified during implementation, grouped by responsibility:

**Configuration**
- `.gitignore`, `.env.example`, `.prettierrc`, `README.md`
- `package.json`, `pnpm-lock.yaml`, `tsconfig.json`
- `next.config.ts`, `postcss.config.mjs`, `eslint.config.mjs`
- `components.json` (shadcn config)
- `vitest.config.ts`

**App routes** (`src/app/`)
- `layout.tsx` — root layout, fonts, theme provider, metadata
- `page.tsx` — home page composing all sections
- `globals.css` — Tailwind v4 imports, `@theme` tokens, base styles
- `not-found.tsx`, `icon.tsx`, `opengraph-image.tsx`
- `robots.ts`, `sitemap.ts`
- `api/contact/route.ts` — contact-form handler
- `projects/[slug]/page.tsx` — case study page
- `projects/[slug]/opengraph-image.tsx` — per-case-study OG

**Components** (`src/components/`)
- `nav.tsx`, `footer.tsx`
- `theme-provider.tsx`, `theme-toggle.tsx`
- `fade-in-section.tsx` — scroll-fade motion wrapper
- `project-card.tsx`, `flagship-project-card.tsx`
- `contact-form.tsx` — client component, RHF + Zod
- `sections/hero.tsx`, `sections/about.tsx`, `sections/skills.tsx`, `sections/experience.tsx`, `sections/projects.tsx`, `sections/contact.tsx`
- `ui/` — shadcn primitives (button, input, textarea, label)
- `mdx-components.tsx` — MDX component overrides

**Libraries** (`src/lib/`)
- `utils.ts` — `cn()` helper (shadcn standard)
- `contact-schema.ts` — Zod schema (shared client + server)
- `rate-limit.ts` — Upstash rate-limiter
- `mdx.ts` — MDX file loader + frontmatter typing
- `site-metadata.ts` — reusable Next.js metadata builder

**Content** (`content/`)
- `site.ts`, `skills.ts`, `experience.ts`
- `projects/_cards.ts`
- `projects/portfolio-site.mdx`

**Public assets** (`public/`)
- `resume.pdf` (placeholder until real one is provided)
- `projects/portfolio/cover.png` (placeholder)

**Tests** (`tests/`)
- `contact-schema.test.ts`
- `mdx.test.ts`

---

## Pre-flight environment requirements

The engineer will need the following from the user during implementation:
- A **Resend** account → API key (Task 21) and a verified sending domain (or Resend's `onboarding@resend.dev` for dev)
- An **Upstash Redis** database → `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN` (Task 21)
- A **Vercel** account with CLI access (`pnpm dlx vercel login`) (Task 26)
- DNS access for `alexandro-bolfa.com` to point at Vercel (Task 26)
- (Optional) **Vercel MCP** wired in the dev environment — gives deploy/build inspection during implementation (Task 26)

Prompt the user for each value at the start of the task that needs it. Do not commit any real secrets — only `.env.example` with placeholder names.

---

## Task 1: Project bootstrap

**Files:**
- Create: `.gitignore`
- Create: `.env.example`
- Create: `.prettierrc`
- Create: `README.md`
- Create (via scaffolder): `package.json`, `tsconfig.json`, `next.config.ts`, `postcss.config.mjs`, `eslint.config.mjs`, `src/app/layout.tsx`, `src/app/page.tsx`, `src/app/globals.css`, `public/*`
- Create: `vitest.config.ts`
- Create: `tests/.gitkeep`

- [ ] **Step 1: Initialize git and create the ignore file BEFORE running any scaffolder**

```bash
cd c:/Users/bolfa/Portfolio
git init
git branch -m main
```

Create `.gitignore`:

```
# deps
node_modules/
.pnp.*
.yarn/

# build
.next/
out/
dist/
*.tsbuildinfo
next-env.d.ts

# env
.env
.env.local
.env.*.local

# logs / OS
*.log
.DS_Store
Thumbs.db

# editor
.idea/
.vscode/*
!.vscode/settings.json
!.vscode/extensions.json

# brainstorm artifacts (visual companion)
.superpowers/

# vercel
.vercel/

# test coverage
coverage/
```

- [ ] **Step 2: Scaffold Next.js 15 + TypeScript + Tailwind**

```bash
pnpm create next-app@latest . --ts --tailwind --eslint --app --src-dir --use-pnpm --import-alias "@/*" --no-turbopack
```

When prompted to overwrite, answer **yes** for any conflicting file. The `.gitignore` we already created will be merged or replaced — verify it still contains `.superpowers/` and `.env*` after; re-add them if missing.

Expected: `src/app/{layout,page}.tsx`, `src/app/globals.css`, `tailwind.config.ts` (or v4 inline — depends on version), `next.config.ts` exist.

- [ ] **Step 3: Pin Node engine and add the script set**

Open `package.json` and add (preserve existing scripts; merge):

```json
{
  "engines": { "node": ">=20" },
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "typecheck": "tsc --noEmit",
    "format": "prettier --write \"**/*.{ts,tsx,md,mdx,json,css}\"",
    "test": "vitest run",
    "test:watch": "vitest"
  }
}
```

- [ ] **Step 4: Add Prettier**

```bash
pnpm add -D prettier prettier-plugin-tailwindcss
```

Create `.prettierrc`:

```json
{
  "semi": true,
  "singleQuote": false,
  "trailingComma": "all",
  "printWidth": 100,
  "plugins": ["prettier-plugin-tailwindcss"]
}
```

- [ ] **Step 5: Add Vitest for logic-unit tests**

```bash
pnpm add -D vitest @vitest/ui
```

Create `vitest.config.ts`:

```ts
import { defineConfig } from "vitest/config";
import path from "node:path";

export default defineConfig({
  test: {
    environment: "node",
    include: ["tests/**/*.test.ts"],
  },
  resolve: {
    alias: { "@": path.resolve(__dirname, "src") },
  },
});
```

- [ ] **Step 6: Create `.env.example` and `README.md`**

`.env.example`:

```
# Resend (transactional email for contact form)
RESEND_API_KEY=
CONTACT_TO_EMAIL=alexandro@example.com
CONTACT_FROM_EMAIL=onboarding@resend.dev

# Upstash Ratelimit (Redis REST)
UPSTASH_REDIS_REST_URL=
UPSTASH_REDIS_REST_TOKEN=

# Site
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

`README.md`:

```markdown
# alexandro-bolfa.com

Personal portfolio. Built with Next.js 15, Tailwind v4, shadcn/ui.

## Develop

\`\`\`
pnpm install
cp .env.example .env.local   # fill in real values
pnpm dev
\`\`\`

## Verify before pushing

\`\`\`
pnpm typecheck && pnpm lint && pnpm test && pnpm build
\`\`\`

See `docs/superpowers/specs/2026-05-19-portfolio-site-design.md` for design.
```

- [ ] **Step 7: Sanity check the scaffold builds**

```bash
pnpm install
pnpm dev
```

Open `http://localhost:3000` — should show the default Next.js page. Stop the dev server.

```bash
pnpm typecheck
pnpm lint
pnpm build
```

Expected: all four commands exit 0.

- [ ] **Step 8: Commit**

```bash
git add -A
git commit -m "chore: bootstrap Next.js 15 + Tailwind + Prettier + Vitest"
```

---

## Task 2: Tailwind v4 theme tokens + base styles

**Files:**
- Modify: `src/app/globals.css`

- [ ] **Step 1: Replace `src/app/globals.css` with the design-token setup**

If the scaffold created a `tailwind.config.ts`, delete it — Tailwind v4 uses CSS-first config.

```bash
rm -f tailwind.config.ts tailwind.config.js
```

Write `src/app/globals.css`:

```css
@import "tailwindcss";

@theme {
  --color-background: #ffffff;
  --color-foreground: #0a0a0a;
  --color-muted-foreground: #52525b;
  --color-border: rgb(0 0 0 / 0.08);
  --color-accent: #2563eb;
  --color-accent-foreground: #ffffff;

  --font-sans: var(--font-geist-sans), ui-sans-serif, system-ui, sans-serif;
  --font-mono: var(--font-geist-mono), ui-monospace, SFMono-Regular, monospace;

  --radius-md: 0.5rem;
  --radius-lg: 0.75rem;
}

@layer base {
  :root {
    color-scheme: light;
  }
  .dark {
    color-scheme: dark;
    --color-background: #0a0a0a;
    --color-foreground: #fafafa;
    --color-muted-foreground: #a1a1aa;
    --color-border: rgb(255 255 255 / 0.08);
    --color-accent: #3b82f6;
    --color-accent-foreground: #0a0a0a;
  }

  html { -webkit-font-smoothing: antialiased; -moz-osx-font-smoothing: grayscale; }
  body {
    background-color: var(--color-background);
    color: var(--color-foreground);
    font-family: var(--font-sans);
  }

  /* Focus ring — accent blue, visible on all themes */
  :focus-visible {
    outline: 2px solid var(--color-accent);
    outline-offset: 2px;
    border-radius: 2px;
  }

  /* Respect reduced motion universally */
  @media (prefers-reduced-motion: reduce) {
    *, *::before, *::after {
      animation-duration: 0.001ms !important;
      animation-iteration-count: 1 !important;
      transition-duration: 0.001ms !important;
      scroll-behavior: auto !important;
    }
  }

  /* Smooth scrolling for in-page anchor nav */
  html { scroll-behavior: smooth; scroll-padding-top: 5rem; }
}
```

- [ ] **Step 2: Verify**

```bash
pnpm build
```

Expected: exit 0, no Tailwind errors.

- [ ] **Step 3: Commit**

```bash
git add -A
git commit -m "feat(theme): Tailwind v4 design tokens for light + dark"
```

---

## Task 3: shadcn/ui init + base primitives

**Files:**
- Create: `components.json` (via shadcn init)
- Create: `src/lib/utils.ts`
- Create: `src/components/ui/button.tsx`
- Create: `src/components/ui/input.tsx`
- Create: `src/components/ui/textarea.tsx`
- Create: `src/components/ui/label.tsx`

- [ ] **Step 1: Run shadcn init**

```bash
pnpm dlx shadcn@latest init
```

Answer prompts:
- Style: **New York** (or Default if New York is unavailable)
- Base color: **Neutral**
- CSS variables: **Yes**

This creates `components.json` and may modify `globals.css`. After it runs, re-open `src/app/globals.css` and confirm our `@theme` block from Task 2 is still intact. If shadcn rewrote it, restore Task 2's content and only keep any new `@layer base` shadcn additions that don't conflict.

- [ ] **Step 2: Add the primitives we'll use**

```bash
pnpm dlx shadcn@latest add button input textarea label
```

Expected: `src/components/ui/{button,input,textarea,label}.tsx` exist.

- [ ] **Step 3: Verify**

```bash
pnpm typecheck && pnpm build
```

Expected: exit 0.

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "feat(ui): init shadcn and add base primitives"
```

---

## Task 4: Geist fonts + theme provider + theme toggle

**Files:**
- Modify: `src/app/layout.tsx`
- Create: `src/components/theme-provider.tsx`
- Create: `src/components/theme-toggle.tsx`

- [ ] **Step 1: Install fonts, theme lib, icons**

```bash
pnpm add geist next-themes lucide-react
```

- [ ] **Step 2: Create the theme provider**

`src/components/theme-provider.tsx`:

```tsx
"use client";

import { ThemeProvider as NextThemesProvider } from "next-themes";
import type { ComponentProps } from "react";

export function ThemeProvider(props: ComponentProps<typeof NextThemesProvider>) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
      {...props}
    />
  );
}
```

- [ ] **Step 3: Create the theme toggle**

`src/components/theme-toggle.tsx`:

```tsx
"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

export function ThemeToggle() {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  if (!mounted) {
    return <div className="size-9" aria-hidden />;
  }

  const isDark = (theme === "system" ? resolvedTheme : theme) === "dark";

  return (
    <button
      type="button"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      className="inline-flex size-9 items-center justify-center rounded-md text-foreground transition-colors hover:bg-foreground/5"
    >
      {isDark ? <Sun className="size-4" /> : <Moon className="size-4" />}
    </button>
  );
}
```

- [ ] **Step 4: Update the root layout to load Geist + wrap with ThemeProvider**

Replace `src/app/layout.tsx`:

```tsx
import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import { ThemeProvider } from "@/components/theme-provider";
import "./globals.css";

export const metadata: Metadata = {
  title: { default: "Alexandro Bolfa", template: "%s · Alexandro Bolfa" },
  description: "Software engineer — frontend-focused, full-stack capable.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning className={`${GeistSans.variable} ${GeistMono.variable}`}>
      <body className="min-h-dvh bg-background text-foreground antialiased">
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
```

> `next-themes` with `attribute="class"` writes `<html class="dark">` before paint, so there is no theme flash. The `suppressHydrationWarning` on `<html>` is required.

- [ ] **Step 5: Smoke-test the toggle**

Drop the toggle into the home page temporarily. Open `src/app/page.tsx` and replace:

```tsx
import { ThemeToggle } from "@/components/theme-toggle";

export default function Home() {
  return (
    <main className="p-8">
      <h1 className="font-mono text-3xl">Theme test</h1>
      <ThemeToggle />
    </main>
  );
}
```

```bash
pnpm dev
```

Visit `http://localhost:3000`. Click the toggle — page should swap light ↔ dark without flashing. Refresh — chosen theme persists.

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "feat(theme): Geist fonts, next-themes provider, no-flash toggle"
```

---

## Task 5: Reusable site-metadata helper

**Files:**
- Create: `src/lib/site-metadata.ts`

- [ ] **Step 1: Create the helper**

`src/lib/site-metadata.ts`:

```ts
import type { Metadata } from "next";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
const SITE_NAME = "Alexandro Bolfa";

export const siteUrl = SITE_URL;

export function buildMetadata(input: {
  title?: string;
  description: string;
  path?: string;
  ogImage?: string;
}): Metadata {
  const url = new URL(input.path ?? "/", SITE_URL).toString();
  const ogImage = input.ogImage ?? "/opengraph-image";
  return {
    metadataBase: new URL(SITE_URL),
    title: input.title,
    description: input.description,
    alternates: { canonical: url },
    openGraph: {
      type: "website",
      url,
      siteName: SITE_NAME,
      title: input.title ?? SITE_NAME,
      description: input.description,
      images: [{ url: ogImage }],
    },
    twitter: {
      card: "summary_large_image",
      title: input.title ?? SITE_NAME,
      description: input.description,
      images: [ogImage],
    },
  };
}
```

- [ ] **Step 2: Use it in the root layout**

Replace the inline `metadata` export in `src/app/layout.tsx`:

```tsx
import { buildMetadata } from "@/lib/site-metadata";

export const metadata = buildMetadata({
  description: "Software engineer — frontend-focused, full-stack capable.",
});
```

(The `title` falls back to the default via the template in the helper output. Leave the existing `<title>` template by also merging it manually: replace the export with the version below if you want both default + template:)

```tsx
import type { Metadata } from "next";
import { buildMetadata } from "@/lib/site-metadata";

export const metadata: Metadata = {
  ...buildMetadata({ description: "Software engineer — frontend-focused, full-stack capable." }),
  title: { default: "Alexandro Bolfa", template: "%s · Alexandro Bolfa" },
};
```

- [ ] **Step 3: Verify**

```bash
pnpm typecheck && pnpm build
```

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "feat(seo): site-metadata helper for consistent per-page metadata"
```

---

## Task 6: Content data files (placeholder content)

**Files:**
- Create: `content/site.ts`
- Create: `content/skills.ts`
- Create: `content/experience.ts`
- Create: `content/projects/_cards.ts`

> The user has flagged content as "Mostly TBD" — these files start with realistic placeholders that the user will fill in as projects/experience accrue. The shapes are stable; the strings are not. **Prompt Alexandro for his actual bio / pitch / socials before committing.**

- [ ] **Step 1: Prompt the user for the basics**

Ask Alexandro to provide (or confirm placeholders are fine for v1):
- Full name (default: "Alexandro Bolfa")
- One-line pitch (default: "Software engineer — frontend-focused, full-stack capable.")
- Location (default: "Romania")
- Contact email (default: `hello@alexandro-bolfa.com`)
- GitHub URL, LinkedIn URL, X/Twitter URL
- Two-paragraph About text

If Alexandro defers, use the defaults below — they're production-safe placeholders.

- [ ] **Step 2: Add the `tsconfig.json` path for `content/*`**

Open `tsconfig.json`. In `compilerOptions.paths`, add (alongside the existing `"@/*"` entry):

```json
"paths": {
  "@/*": ["./src/*"],
  "@content/*": ["./content/*"]
}
```

- [ ] **Step 3: Create `content/site.ts`**

```ts
export type SocialLink = { label: string; href: string };

export const site = {
  name: "Alexandro Bolfa",
  initials: "AB",
  pitch: "Software engineer — frontend-focused, full-stack capable.",
  about: [
    "I'm a new-grad software engineer who cares about how software feels to use. I focus on the frontend — performance, accessibility, the details of a well-built interface — and I'm comfortable on the backend and in the build/deploy pipeline.",
    "Right now I'm looking for a first full-time role on a product team that ships often and treats the frontend as a craft.",
  ] as const,
  location: "Romania",
  email: "hello@alexandro-bolfa.com",
  resumeHref: "/resume.pdf",
  socials: [
    { label: "GitHub", href: "https://github.com/alexandro-bolfa" },
    { label: "LinkedIn", href: "https://www.linkedin.com/in/alexandro-bolfa/" },
    { label: "X", href: "https://x.com/alexandro_bolfa" },
  ] satisfies SocialLink[],
} as const;
```

- [ ] **Step 4: Create `content/skills.ts`**

```ts
export type SkillGroup = {
  title: string;
  items: string[];
};

export const skillGroups: SkillGroup[] = [
  {
    title: "Frontend",
    items: ["TypeScript", "React", "Next.js", "Tailwind CSS", "shadcn/ui", "Framer Motion"],
  },
  {
    title: "Backend",
    items: ["Node.js", "Python", "PostgreSQL", "REST", "GraphQL"],
  },
  {
    title: "DevOps",
    items: ["Docker", "GitHub Actions", "Vercel", "AWS basics", "Linux"],
  },
  {
    title: "Tools",
    items: ["Git", "VS Code", "Figma", "Vitest", "Playwright"],
  },
];
```

- [ ] **Step 5: Create `content/experience.ts`**

```ts
export type ExperienceEntry = {
  role: string;
  company: string;
  start: string;
  end: string;
  bullets: string[];
};

export type EducationEntry = {
  degree: string;
  school: string;
  start: string;
  end: string;
  detail?: string;
};

export const experience: ExperienceEntry[] = [
  {
    role: "Software Engineering Intern",
    company: "Example Company",
    start: "2025-06",
    end: "2025-09",
    bullets: [
      "Replace this with a real bullet describing impact in a measurable way.",
      "Replace this with a real bullet describing the technical decisions you made.",
    ],
  },
];

export const education: EducationEntry[] = [
  {
    degree: "B.Sc. Computer Science",
    school: "Example University",
    start: "2022",
    end: "2026",
    detail: "Focus on web systems and human-computer interaction.",
  },
];
```

- [ ] **Step 6: Create `content/projects/_cards.ts`**

```ts
export type ProjectCard = {
  title: string;
  summary: string;
  stack: string[];
  links: { repo?: string; live?: string };
  cover?: string;
};

export const projectCards: ProjectCard[] = [
  {
    title: "Example Project",
    summary: "Replace with a real one-liner about what this project does.",
    stack: ["Next.js", "TypeScript"],
    links: { repo: "https://github.com/alexandro-bolfa/example", live: "https://example.com" },
  },
];
```

- [ ] **Step 7: Verify**

```bash
pnpm typecheck
```

- [ ] **Step 8: Commit**

```bash
git add -A
git commit -m "feat(content): placeholder data files for site, skills, experience, project cards"
```

---

## Task 7: Sticky nav

**Files:**
- Create: `src/components/nav.tsx`

- [ ] **Step 1: Create the nav**

`src/components/nav.tsx`:

```tsx
import Link from "next/link";
import { ThemeToggle } from "@/components/theme-toggle";
import { site } from "@content/site";

const links = [
  { href: "#about", label: "About" },
  { href: "#skills", label: "Skills" },
  { href: "#experience", label: "Experience" },
  { href: "#work", label: "Work" },
  { href: "#contact", label: "Contact" },
];

export function Nav() {
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur-md">
      <nav
        aria-label="Primary"
        className="mx-auto flex h-16 max-w-5xl items-center justify-between px-6"
      >
        <Link
          href="/"
          className="font-mono text-base font-bold tracking-tight text-accent"
          aria-label={`${site.name} — home`}
        >
          {site.initials}
        </Link>
        <ul className="hidden items-center gap-8 text-sm md:flex">
          {links.map((l) => (
            <li key={l.href}>
              <Link
                href={l.href}
                className="text-muted-foreground transition-colors hover:text-foreground"
              >
                {l.label}
              </Link>
            </li>
          ))}
        </ul>
        <div className="flex items-center gap-2">
          <a
            href={site.resumeHref}
            className="inline-flex h-9 items-center rounded-full bg-accent px-4 text-xs font-medium text-accent-foreground transition-opacity hover:opacity-90"
          >
            Resume
          </a>
          <ThemeToggle />
        </div>
      </nav>
    </header>
  );
}
```

- [ ] **Step 2: Verify it renders**

Temporarily wire it into `src/app/page.tsx`:

```tsx
import { Nav } from "@/components/nav";

export default function Home() {
  return (
    <>
      <Nav />
      <main className="mx-auto max-w-5xl px-6 py-32 text-center font-mono">Placeholder</main>
    </>
  );
}
```

```bash
pnpm dev
```

Verify: sticky nav appears, scroll behavior is correct, theme toggle works.

- [ ] **Step 3: Commit**

```bash
git add -A
git commit -m "feat(nav): sticky nav with anchor links, resume CTA, theme toggle"
```

---

## Task 8: Footer

**Files:**
- Create: `src/components/footer.tsx`

- [ ] **Step 1: Create the footer**

`src/components/footer.tsx`:

```tsx
import { site } from "@content/site";

const sourceRepo = "https://github.com/alexandro-bolfa/portfolio";

export function Footer() {
  return (
    <footer className="mt-32 border-t border-border">
      <div className="mx-auto flex max-w-5xl flex-col items-start justify-between gap-4 px-6 py-10 text-xs text-muted-foreground md:flex-row md:items-center">
        <p>© {new Date().getFullYear()} {site.name}. All rights reserved.</p>
        <p className="font-mono">
          Built with Next.js + Tailwind ·{" "}
          <a className="underline-offset-4 hover:text-foreground hover:underline" href={sourceRepo}>
            source
          </a>
        </p>
      </div>
    </footer>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add -A
git commit -m "feat(footer): minimal footer with credits and source link"
```

---

## Task 9: Fade-in section wrapper

**Files:**
- Create: `src/components/fade-in-section.tsx`

- [ ] **Step 1: Install Framer Motion**

```bash
pnpm add framer-motion
```

- [ ] **Step 2: Create the wrapper**

`src/components/fade-in-section.tsx`:

```tsx
"use client";

import { motion, useReducedMotion } from "framer-motion";
import type { ReactNode } from "react";

type Props = {
  children: ReactNode;
  className?: string;
  id?: string;
  as?: "section" | "div";
  delay?: number;
};

export function FadeInSection({ children, className, id, as = "section", delay = 0 }: Props) {
  const reduce = useReducedMotion();
  const Tag = as === "section" ? motion.section : motion.div;

  return (
    <Tag
      id={id}
      className={className}
      initial={reduce ? false : { opacity: 0, y: 8 }}
      whileInView={reduce ? undefined : { opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-10% 0px" }}
      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1], delay }}
    >
      {children}
    </Tag>
  );
}
```

- [ ] **Step 3: Commit**

```bash
git add -A
git commit -m "feat(motion): fade-in section wrapper respecting reduced motion"
```

---

## Task 10: Hero section

**Files:**
- Create: `src/components/sections/hero.tsx`

- [ ] **Step 1: Create the hero (no motion per spec)**

`src/components/sections/hero.tsx`:

```tsx
import Link from "next/link";
import { site } from "@content/site";

export function Hero() {
  return (
    <section
      id="top"
      className="mx-auto flex min-h-[calc(100dvh-4rem)] max-w-3xl flex-col items-center justify-center px-6 text-center"
    >
      <p className="mb-6 font-mono text-xs uppercase tracking-[0.18em] text-muted-foreground">
        {site.location} · Available for new-grad roles
      </p>
      <h1 className="font-mono text-5xl font-medium tracking-[-0.04em] text-foreground md:text-6xl">
        {site.name}
      </h1>
      <p className="mt-5 max-w-xl text-base text-muted-foreground md:text-lg">{site.pitch}</p>
      <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
        <Link
          href="#work"
          className="inline-flex h-10 items-center rounded-md bg-accent px-5 text-sm font-medium text-accent-foreground transition-opacity hover:opacity-90"
        >
          See work →
        </Link>
        <Link
          href="#contact"
          className="inline-flex h-10 items-center rounded-md border border-border px-5 text-sm font-medium text-foreground transition-colors hover:bg-foreground/5"
        >
          Get in touch
        </Link>
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Wire to home page temporarily and visually verify**

In `src/app/page.tsx`:

```tsx
import { Nav } from "@/components/nav";
import { Hero } from "@/components/sections/hero";

export default function Home() {
  return (
    <>
      <Nav />
      <Hero />
    </>
  );
}
```

```bash
pnpm dev
```

Verify in browser: name in Geist Mono, pitch below, two CTAs, "AB" in nav in electric blue, hero fills first viewport.

- [ ] **Step 3: Commit**

```bash
git add -A
git commit -m "feat(hero): centered hero, no motion, accent-blue CTA"
```

---

## Task 11: About section

**Files:**
- Create: `src/components/sections/about.tsx`

- [ ] **Step 1: Create the About section**

`src/components/sections/about.tsx`:

```tsx
import { FadeInSection } from "@/components/fade-in-section";
import { site } from "@content/site";

export function About() {
  return (
    <FadeInSection id="about" className="mx-auto max-w-3xl px-6 py-24">
      <p className="mb-3 font-mono text-xs uppercase tracking-[0.18em] text-muted-foreground">
        About
      </p>
      <h2 className="font-mono text-2xl font-medium tracking-tight md:text-3xl">
        What I do, briefly.
      </h2>
      <div className="mt-6 space-y-4 text-base leading-relaxed text-muted-foreground">
        {site.about.map((para, i) => (
          <p key={i}>{para}</p>
        ))}
      </div>
    </FadeInSection>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add -A
git commit -m "feat(sections): about section"
```

---

## Task 12: Skills section

**Files:**
- Create: `src/components/sections/skills.tsx`

- [ ] **Step 1: Create the Skills section**

`src/components/sections/skills.tsx`:

```tsx
import { FadeInSection } from "@/components/fade-in-section";
import { skillGroups } from "@content/skills";

export function Skills() {
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
                {group.items.map((item) => (
                  <li
                    key={item}
                    className="rounded-md border border-border bg-foreground/[0.02] px-2.5 py-1 font-mono text-xs text-foreground"
                  >
                    {item}
                  </li>
                ))}
              </ul>
            </dd>
          </div>
        ))}
      </dl>
    </FadeInSection>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add -A
git commit -m "feat(sections): skills grid grouped by category"
```

---

## Task 13: Experience section

**Files:**
- Create: `src/components/sections/experience.tsx`

- [ ] **Step 1: Create the Experience timeline**

`src/components/sections/experience.tsx`:

```tsx
import { FadeInSection } from "@/components/fade-in-section";
import { experience, education } from "@content/experience";

function formatRange(start: string, end: string) {
  return `${start} → ${end}`;
}

export function Experience() {
  return (
    <FadeInSection id="experience" className="mx-auto max-w-3xl px-6 py-24">
      <p className="mb-3 font-mono text-xs uppercase tracking-[0.18em] text-muted-foreground">
        Experience
      </p>
      <h2 className="font-mono text-2xl font-medium tracking-tight md:text-3xl">
        Where I've worked.
      </h2>
      <ol className="mt-10 space-y-10 border-l border-border pl-6">
        {experience.map((e, idx) => (
          <li key={`${e.company}-${idx}`} className="relative">
            <span
              className="absolute -left-[29px] top-2 size-2 rounded-full bg-accent"
              aria-hidden
            />
            <p className="font-mono text-xs uppercase tracking-[0.18em] text-muted-foreground">
              {formatRange(e.start, e.end)}
            </p>
            <p className="mt-1 text-base font-medium text-foreground">
              {e.role} · <span className="text-muted-foreground">{e.company}</span>
            </p>
            <ul className="mt-3 list-inside list-disc space-y-1 text-sm text-muted-foreground">
              {e.bullets.map((b, i) => <li key={i}>{b}</li>)}
            </ul>
          </li>
        ))}

        {education.map((ed) => (
          <li key={ed.school} className="relative">
            <span
              className="absolute -left-[29px] top-2 size-2 rounded-full border border-border bg-background"
              aria-hidden
            />
            <p className="font-mono text-xs uppercase tracking-[0.18em] text-muted-foreground">
              {formatRange(ed.start, ed.end)} · Education
            </p>
            <p className="mt-1 text-base font-medium text-foreground">
              {ed.degree} · <span className="text-muted-foreground">{ed.school}</span>
            </p>
            {ed.detail && (
              <p className="mt-2 text-sm text-muted-foreground">{ed.detail}</p>
            )}
          </li>
        ))}
      </ol>
    </FadeInSection>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add -A
git commit -m "feat(sections): experience timeline with active accent dot"
```

---

## Task 14: Project card components

**Files:**
- Create: `src/components/project-card.tsx`
- Create: `src/components/flagship-project-card.tsx`

- [ ] **Step 1: Create the non-flagship card**

`src/components/project-card.tsx`:

```tsx
import type { ProjectCard as ProjectCardData } from "@content/projects/_cards";
import { ExternalLink, Github } from "lucide-react";

export function ProjectCard({ project }: { project: ProjectCardData }) {
  return (
    <article className="group flex h-full flex-col rounded-lg border border-border bg-foreground/[0.01] p-5 transition-all hover:-translate-y-0.5 hover:border-foreground/20">
      <header className="flex items-start justify-between gap-3">
        <h3 className="text-base font-medium text-foreground">{project.title}</h3>
        <div className="flex items-center gap-2 text-muted-foreground">
          {project.links.repo && (
            <a
              href={project.links.repo}
              aria-label={`${project.title} source on GitHub`}
              className="transition-colors hover:text-foreground"
            >
              <Github className="size-4" />
            </a>
          )}
          {project.links.live && (
            <a
              href={project.links.live}
              aria-label={`${project.title} live site`}
              className="transition-colors hover:text-foreground"
            >
              <ExternalLink className="size-4" />
            </a>
          )}
        </div>
      </header>
      <p className="mt-2 text-sm text-muted-foreground">{project.summary}</p>
      <ul className="mt-auto flex flex-wrap gap-1.5 pt-4">
        {project.stack.map((t) => (
          <li
            key={t}
            className="rounded border border-border px-1.5 py-0.5 font-mono text-[10px] uppercase tracking-wider text-muted-foreground"
          >
            {t}
          </li>
        ))}
      </ul>
    </article>
  );
}
```

- [ ] **Step 2: Create the flagship card (larger, with case-study link)**

`src/components/flagship-project-card.tsx`:

```tsx
import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

type Props = {
  slug: string;
  title: string;
  summary: string;
  stack: readonly string[];
  cover?: string;
};

export function FlagshipProjectCard({ slug, title, summary, stack, cover }: Props) {
  return (
    <Link
      href={`/projects/${slug}`}
      className="group block overflow-hidden rounded-xl border border-border bg-foreground/[0.01] transition-all hover:-translate-y-0.5 hover:border-foreground/20"
    >
      {cover && (
        <div className="relative aspect-[16/9] overflow-hidden border-b border-border bg-foreground/[0.03]">
          <Image
            src={cover}
            alt=""
            fill
            sizes="(min-width: 768px) 720px, 100vw"
            className="object-cover transition-transform duration-500 group-hover:scale-[1.02]"
          />
        </div>
      )}
      <div className="p-6">
        <div className="flex items-start justify-between gap-4">
          <h3 className="text-xl font-medium text-foreground">{title}</h3>
          <ArrowUpRight className="size-5 shrink-0 text-muted-foreground transition-colors group-hover:text-accent" />
        </div>
        <p className="mt-2 text-sm text-muted-foreground">{summary}</p>
        <p className="mt-4 font-mono text-xs uppercase tracking-[0.18em] text-muted-foreground">
          Read case study →
        </p>
        <ul className="mt-4 flex flex-wrap gap-1.5">
          {stack.map((t) => (
            <li
              key={t}
              className="rounded border border-border px-1.5 py-0.5 font-mono text-[10px] uppercase tracking-wider text-muted-foreground"
            >
              {t}
            </li>
          ))}
        </ul>
      </div>
    </Link>
  );
}
```

- [ ] **Step 3: Commit**

```bash
git add -A
git commit -m "feat(projects): project card + flagship card components"
```

---

## Task 15: MDX loader + first flagship case study

**Files:**
- Create: `src/lib/mdx.ts`
- Create: `tests/mdx.test.ts`
- Create: `content/projects/portfolio-site.mdx`
- Create: `public/projects/portfolio/cover.png` (placeholder)
- Create: `src/components/mdx-components.tsx`

- [ ] **Step 1: Install MDX deps**

```bash
pnpm add next-mdx-remote gray-matter rehype-pretty-code shiki remark-gfm
pnpm add -D @types/mdx
```

- [ ] **Step 2: Write the failing test first**

`tests/mdx.test.ts`:

```ts
import { describe, it, expect } from "vitest";
import { getFlagshipBySlug, listFlagships } from "@/lib/mdx";

describe("mdx loader", () => {
  it("lists at least one flagship project", async () => {
    const items = await listFlagships();
    expect(items.length).toBeGreaterThanOrEqual(1);
    expect(items[0]).toMatchObject({
      slug: expect.any(String),
      title: expect.any(String),
    });
  });

  it("loads the portfolio-site flagship by slug with frontmatter and content", async () => {
    const project = await getFlagshipBySlug("portfolio-site");
    expect(project).not.toBeNull();
    expect(project!.title).toBe("Portfolio Site");
    expect(project!.flagship).toBe(true);
    expect(project!.body.length).toBeGreaterThan(50);
  });

  it("returns null for unknown slug", async () => {
    expect(await getFlagshipBySlug("does-not-exist")).toBeNull();
  });
});
```

- [ ] **Step 3: Run the test — confirm it fails**

```bash
pnpm test
```

Expected: FAIL because `@/lib/mdx` does not exist yet.

- [ ] **Step 4: Implement the loader**

`src/lib/mdx.ts`:

```ts
import fs from "node:fs/promises";
import path from "node:path";
import matter from "gray-matter";

export type FlagshipFrontmatter = {
  title: string;
  slug: string;
  summary: string;
  stack: string[];
  role: string;
  year: number;
  links: { live?: string; repo?: string };
  cover?: string;
  flagship: true;
};

export type FlagshipProject = FlagshipFrontmatter & { body: string };

const CONTENT_DIR = path.join(process.cwd(), "content", "projects");

async function readAllMdxFiles(): Promise<{ file: string; raw: string }[]> {
  const entries = await fs.readdir(CONTENT_DIR);
  const mdx = entries.filter((f) => f.endsWith(".mdx"));
  return Promise.all(
    mdx.map(async (file) => ({
      file,
      raw: await fs.readFile(path.join(CONTENT_DIR, file), "utf8"),
    })),
  );
}

function parse(file: string, raw: string): FlagshipProject {
  const { data, content } = matter(raw);
  const fm = data as Partial<FlagshipFrontmatter>;
  if (!fm.title || !fm.slug) {
    throw new Error(`MDX file ${file} is missing required frontmatter (title, slug)`);
  }
  return {
    title: fm.title,
    slug: fm.slug,
    summary: fm.summary ?? "",
    stack: fm.stack ?? [],
    role: fm.role ?? "",
    year: fm.year ?? new Date().getFullYear(),
    links: fm.links ?? {},
    cover: fm.cover,
    flagship: true,
    body: content,
  };
}

export async function listFlagships(): Promise<FlagshipProject[]> {
  const files = await readAllMdxFiles();
  const projects = files
    .map(({ file, raw }) => parse(file, raw))
    .filter((p) => p.flagship)
    .sort((a, b) => b.year - a.year);
  return projects;
}

export async function getFlagshipBySlug(slug: string): Promise<FlagshipProject | null> {
  const all = await listFlagships();
  return all.find((p) => p.slug === slug) ?? null;
}
```

- [ ] **Step 5: Create the first flagship MDX file**

`content/projects/portfolio-site.mdx`:

```mdx
---
title: "Portfolio Site"
slug: "portfolio-site"
summary: "Design, build, and ship my own portfolio on Vercel."
stack: ["Next.js 15", "TypeScript", "Tailwind v4", "shadcn/ui"]
role: "Designer & Engineer"
year: 2026
links:
  live: "https://alexandro-bolfa.com"
  repo: "https://github.com/alexandro-bolfa/portfolio"
cover: "/projects/portfolio/cover.png"
flagship: true
---

## The problem

I needed a portfolio that looked like 2026, not 2018. Recruiters spend 30 seconds on a portfolio at most, and an engineering manager who clicks through wants to know how I think, not just what I've built. Most templates do one or the other.

## Approach

I designed the site as a single-page hub for the 30-second scan, with dedicated case-study pages for the engineers who want depth. The aesthetic is intentionally restrained — mono base, electric blue accent, Geist Mono for display type. The signal is taste, not novelty.

## Architecture

- **Next.js 15 App Router** — React Server Components by default; client components only where they earn it (theme toggle, contact form, scroll-fade wrapper).
- **Tailwind v4** with `@theme` design tokens defined in CSS rather than `tailwind.config.ts`.
- **Content is git** — flagship case studies are MDX files in `content/projects/`; non-flagships, skills, and experience are typed TypeScript files.
- **Contact form** posts to a Route Handler that validates with the same Zod schema used on the client, rate-limits via Upstash Redis, and delivers via Resend.
- **Performance budget:** Lighthouse ≥ 95 across the board. Self-hosted Geist via `next/font`, all images via `next/image`, zero client-side data fetching on the home page.

## What I'd do differently

This section will grow as the site does — capture decisions I revisited later here.
```

- [ ] **Step 6: Create the placeholder cover image**

Use any 1600×900 PNG (a solid dark navy works as a placeholder). The simplest is to copy the favicon as a placeholder for now:

```bash
mkdir -p public/projects/portfolio
# Create a minimal 1px transparent PNG as a stand-in until a real cover exists
node -e "require('fs').writeFileSync('public/projects/portfolio/cover.png', Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=','base64'))"
```

> Replace `cover.png` with a real 1600×900 cover at any point — no code change needed.

- [ ] **Step 7: Create the MDX components map**

`src/components/mdx-components.tsx`:

```tsx
import type { MDXComponents } from "mdx/types";

export const mdxComponents: MDXComponents = {
  h2: ({ children }) => (
    <h2 className="mt-12 font-mono text-2xl font-medium tracking-tight text-foreground">
      {children}
    </h2>
  ),
  h3: ({ children }) => (
    <h3 className="mt-8 text-lg font-medium text-foreground">{children}</h3>
  ),
  p: ({ children }) => (
    <p className="mt-4 text-base leading-relaxed text-muted-foreground">{children}</p>
  ),
  ul: ({ children }) => (
    <ul className="mt-4 list-inside list-disc space-y-2 text-muted-foreground">{children}</ul>
  ),
  a: ({ href, children }) => (
    <a href={href} className="text-accent underline-offset-4 hover:underline">
      {children}
    </a>
  ),
  code: ({ children }) => (
    <code className="rounded bg-foreground/[0.06] px-1 py-0.5 font-mono text-[0.9em]">
      {children}
    </code>
  ),
};
```

- [ ] **Step 8: Run the test — confirm pass**

```bash
pnpm test
```

Expected: all three `tests/mdx.test.ts` cases PASS.

- [ ] **Step 9: Commit**

```bash
git add -A
git commit -m "feat(mdx): flagship case-study loader, first MDX file, mdx component map"
```

---

## Task 16: Projects section (assembles flagship + cards)

**Files:**
- Create: `src/components/sections/projects.tsx`

- [ ] **Step 1: Create the section**

`src/components/sections/projects.tsx`:

```tsx
import { FadeInSection } from "@/components/fade-in-section";
import { FlagshipProjectCard } from "@/components/flagship-project-card";
import { ProjectCard } from "@/components/project-card";
import { projectCards } from "@content/projects/_cards";
import { listFlagships } from "@/lib/mdx";

export async function Projects() {
  const flagships = await listFlagships();

  return (
    <FadeInSection id="work" className="mx-auto max-w-3xl px-6 py-24">
      <p className="mb-3 font-mono text-xs uppercase tracking-[0.18em] text-muted-foreground">
        Selected work
      </p>
      <h2 className="font-mono text-2xl font-medium tracking-tight md:text-3xl">
        Things I've built.
      </h2>

      <div className="mt-10 space-y-6">
        {flagships.map((p) => (
          <FlagshipProjectCard
            key={p.slug}
            slug={p.slug}
            title={p.title}
            summary={p.summary}
            stack={p.stack}
            cover={p.cover}
          />
        ))}
      </div>

      {projectCards.length > 0 && (
        <>
          <p className="mt-16 mb-6 font-mono text-xs uppercase tracking-[0.18em] text-muted-foreground">
            More projects
          </p>
          <div className="grid gap-4 sm:grid-cols-2">
            {projectCards.map((p) => (
              <ProjectCard key={p.title} project={p} />
            ))}
          </div>
        </>
      )}
    </FadeInSection>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add -A
git commit -m "feat(sections): projects section composing flagships + cards"
```

---

## Task 17: Case-study dynamic route

**Files:**
- Create: `src/app/projects/[slug]/page.tsx`

- [ ] **Step 1: Create the route**

`src/app/projects/[slug]/page.tsx`:

```tsx
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { MDXRemote } from "next-mdx-remote/rsc";
import remarkGfm from "remark-gfm";
import rehypePrettyCode from "rehype-pretty-code";
import { getFlagshipBySlug, listFlagships } from "@/lib/mdx";
import { Nav } from "@/components/nav";
import { Footer } from "@/components/footer";
import { mdxComponents } from "@/components/mdx-components";
import { buildMetadata } from "@/lib/site-metadata";

export const dynamicParams = false;

export async function generateStaticParams() {
  const items = await listFlagships();
  return items.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const project = await getFlagshipBySlug(slug);
  if (!project) return {};
  return buildMetadata({
    title: project.title,
    description: project.summary,
    path: `/projects/${project.slug}`,
  });
}

export default async function CaseStudyPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const project = await getFlagshipBySlug(slug);
  if (!project) notFound();

  return (
    <>
      <Nav />
      <main className="mx-auto max-w-3xl px-6 py-16">
        <Link
          href="/#work"
          className="mb-10 inline-block font-mono text-xs uppercase tracking-[0.18em] text-muted-foreground transition-colors hover:text-foreground"
        >
          ← Back to work
        </Link>
        <p className="font-mono text-xs uppercase tracking-[0.18em] text-muted-foreground">
          {project.role} · {project.year}
        </p>
        <h1 className="mt-2 font-mono text-4xl font-medium tracking-[-0.03em] md:text-5xl">
          {project.title}
        </h1>
        <p className="mt-4 text-lg text-muted-foreground">{project.summary}</p>

        <ul className="mt-6 flex flex-wrap gap-1.5">
          {project.stack.map((t) => (
            <li
              key={t}
              className="rounded border border-border px-1.5 py-0.5 font-mono text-[10px] uppercase tracking-wider text-muted-foreground"
            >
              {t}
            </li>
          ))}
        </ul>

        <div className="mt-6 flex flex-wrap gap-3 text-sm">
          {project.links.live && (
            <a className="text-accent underline-offset-4 hover:underline" href={project.links.live}>
              Live site ↗
            </a>
          )}
          {project.links.repo && (
            <a className="text-accent underline-offset-4 hover:underline" href={project.links.repo}>
              Source ↗
            </a>
          )}
        </div>

        {project.cover && (
          <div className="relative mt-10 aspect-[16/9] overflow-hidden rounded-xl border border-border bg-foreground/[0.03]">
            <Image
              src={project.cover}
              alt={`Cover image for ${project.title}`}
              fill
              sizes="(min-width: 768px) 720px, 100vw"
              priority
              className="object-cover"
            />
          </div>
        )}

        <article className="mt-10">
          <MDXRemote
            source={project.body}
            components={mdxComponents}
            options={{
              mdxOptions: {
                remarkPlugins: [remarkGfm],
                rehypePlugins: [[rehypePrettyCode, { theme: "github-dark" }]],
              },
            }}
          />
        </article>
      </main>
      <Footer />
    </>
  );
}
```

- [ ] **Step 2: Verify**

```bash
pnpm dev
```

Open `http://localhost:3000/projects/portfolio-site` — should render the case study with frontmatter header, cover, MDX body. Verify "Back to work" link, light/dark both look right.

- [ ] **Step 3: Commit**

```bash
git add -A
git commit -m "feat(case-study): /projects/[slug] dynamic route rendering MDX"
```

---

## Task 18: Compose the home page

**Files:**
- Modify: `src/app/page.tsx`

- [ ] **Step 1: Replace the home page composition**

`src/app/page.tsx`:

```tsx
import { Nav } from "@/components/nav";
import { Footer } from "@/components/footer";
import { Hero } from "@/components/sections/hero";
import { About } from "@/components/sections/about";
import { Skills } from "@/components/sections/skills";
import { Experience } from "@/components/sections/experience";
import { Projects } from "@/components/sections/projects";
import { Contact } from "@/components/sections/contact";

export default function Home() {
  return (
    <>
      <Nav />
      <main>
        <Hero />
        <About />
        <Skills />
        <Experience />
        <Projects />
        <Contact />
      </main>
      <Footer />
    </>
  );
}
```

> The `Contact` section import will fail until Task 20 lands. That is intentional — we'll fill it in next.

- [ ] **Step 2: Don't run typecheck/build yet** — it will fail on the missing `Contact` import. Skip straight to the next task.

---

## Task 19: Contact Zod schema (TDD)

**Files:**
- Create: `src/lib/contact-schema.ts`
- Create: `tests/contact-schema.test.ts`

- [ ] **Step 1: Install Zod**

```bash
pnpm add zod react-hook-form @hookform/resolvers
```

- [ ] **Step 2: Write the failing test first**

`tests/contact-schema.test.ts`:

```ts
import { describe, it, expect } from "vitest";
import { contactSchema } from "@/lib/contact-schema";

describe("contactSchema", () => {
  const valid = { name: "Ada Lovelace", email: "ada@example.com", message: "Hello!", website: "" };

  it("accepts a valid submission", () => {
    expect(contactSchema.safeParse(valid).success).toBe(true);
  });

  it("rejects missing name", () => {
    const result = contactSchema.safeParse({ ...valid, name: "" });
    expect(result.success).toBe(false);
  });

  it("rejects an invalid email", () => {
    const result = contactSchema.safeParse({ ...valid, email: "not-an-email" });
    expect(result.success).toBe(false);
  });

  it("rejects a too-short message", () => {
    const result = contactSchema.safeParse({ ...valid, message: "hi" });
    expect(result.success).toBe(false);
  });

  it("rejects a too-long message", () => {
    const result = contactSchema.safeParse({ ...valid, message: "a".repeat(5001) });
    expect(result.success).toBe(false);
  });

  it("rejects a filled honeypot (bot signal)", () => {
    const result = contactSchema.safeParse({ ...valid, website: "https://spam.example" });
    expect(result.success).toBe(false);
  });

  it("treats undefined honeypot as empty", () => {
    const { website: _website, ...withoutHoneypot } = valid;
    const result = contactSchema.safeParse(withoutHoneypot);
    expect(result.success).toBe(true);
  });
});
```

- [ ] **Step 3: Run test — confirm fail**

```bash
pnpm test
```

Expected: FAIL ("Cannot find module '@/lib/contact-schema'").

- [ ] **Step 4: Implement the schema**

`src/lib/contact-schema.ts`:

```ts
import { z } from "zod";

export const contactSchema = z.object({
  name: z.string().trim().min(1, "Please enter your name.").max(100),
  email: z.string().trim().email("Please enter a valid email address.").max(200),
  message: z
    .string()
    .trim()
    .min(10, "Message should be at least 10 characters.")
    .max(5000, "Message is too long."),
  // Honeypot — humans see/fill nothing; bots autofill anything.
  website: z
    .string()
    .max(0, "Spam detected.")
    .optional()
    .or(z.literal(undefined))
    .transform((v) => v ?? ""),
});

export type ContactInput = z.infer<typeof contactSchema>;
```

- [ ] **Step 5: Run test — confirm pass**

```bash
pnpm test
```

Expected: all 7 cases PASS.

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "feat(contact): Zod schema with email/length/honeypot validation"
```

---

## Task 20: Contact form (client) + Contact section

**Files:**
- Create: `src/components/contact-form.tsx`
- Create: `src/components/sections/contact.tsx`

- [ ] **Step 1: Create the contact form (client component)**

`src/components/contact-form.tsx`:

```tsx
"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { contactSchema, type ContactInput } from "@/lib/contact-schema";

type Status = "idle" | "submitting" | "success" | "error";

export function ContactForm() {
  const [status, setStatus] = useState<Status>("idle");
  const [serverMessage, setServerMessage] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ContactInput>({
    resolver: zodResolver(contactSchema),
    defaultValues: { name: "", email: "", message: "", website: "" },
  });

  const onSubmit = handleSubmit(async (values) => {
    setStatus("submitting");
    setServerMessage(null);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) {
        setStatus("error");
        setServerMessage(body?.error ?? "Something went wrong. Please try again.");
        return;
      }
      setStatus("success");
      setServerMessage("Thanks — your message is on its way.");
      reset();
    } catch {
      setStatus("error");
      setServerMessage("Network error. Please try again.");
    }
  });

  return (
    <form onSubmit={onSubmit} noValidate className="mt-8 grid gap-4" aria-describedby="contact-status">
      {/* Honeypot — visually hidden from humans, ignored by them */}
      <div aria-hidden className="absolute -left-[10000px] h-0 w-0 overflow-hidden">
        <label htmlFor="website">Website</label>
        <input id="website" type="text" tabIndex={-1} autoComplete="off" {...register("website")} />
      </div>

      <div className="grid gap-2">
        <Label htmlFor="name">Name</Label>
        <Input id="name" autoComplete="name" {...register("name")} aria-invalid={!!errors.name} />
        {errors.name && <p className="text-xs text-red-500">{errors.name.message}</p>}
      </div>

      <div className="grid gap-2">
        <Label htmlFor="email">Email</Label>
        <Input id="email" type="email" autoComplete="email" {...register("email")} aria-invalid={!!errors.email} />
        {errors.email && <p className="text-xs text-red-500">{errors.email.message}</p>}
      </div>

      <div className="grid gap-2">
        <Label htmlFor="message">Message</Label>
        <Textarea id="message" rows={5} {...register("message")} aria-invalid={!!errors.message} />
        {errors.message && <p className="text-xs text-red-500">{errors.message.message}</p>}
      </div>

      <div className="flex items-center gap-4">
        <Button type="submit" disabled={status === "submitting"} className="bg-accent text-accent-foreground hover:opacity-90">
          {status === "submitting" ? "Sending…" : "Send message"}
        </Button>
        <p
          id="contact-status"
          role="status"
          className={`text-xs ${status === "error" ? "text-red-500" : "text-muted-foreground"}`}
        >
          {serverMessage}
        </p>
      </div>
    </form>
  );
}
```

- [ ] **Step 2: Create the Contact section**

`src/components/sections/contact.tsx`:

```tsx
import { FadeInSection } from "@/components/fade-in-section";
import { ContactForm } from "@/components/contact-form";
import { site } from "@content/site";

export function Contact() {
  return (
    <FadeInSection id="contact" className="mx-auto max-w-3xl px-6 py-24">
      <p className="mb-3 font-mono text-xs uppercase tracking-[0.18em] text-muted-foreground">
        Contact
      </p>
      <h2 className="font-mono text-2xl font-medium tracking-tight md:text-3xl">
        Let's talk.
      </h2>
      <p className="mt-4 text-base text-muted-foreground">
        Open to new-grad full-time roles. The fastest way to reach me is{" "}
        <a className="text-accent underline-offset-4 hover:underline" href={`mailto:${site.email}`}>
          {site.email}
        </a>{" "}
        — or use the form below.
      </p>

      <div className="mt-6 flex flex-wrap items-center gap-4 text-sm">
        {site.socials.map((s) => (
          <a
            key={s.href}
            href={s.href}
            className="text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
          >
            {s.label}
          </a>
        ))}
        <a
          href={site.resumeHref}
          className="ml-auto inline-flex h-9 items-center rounded-full bg-accent px-4 text-xs font-medium text-accent-foreground transition-opacity hover:opacity-90"
        >
          Download résumé
        </a>
      </div>

      <ContactForm />
    </FadeInSection>
  );
}
```

- [ ] **Step 3: Verify the home page now builds**

```bash
pnpm typecheck && pnpm build
```

Expected: exit 0. The form will fail to submit at runtime (no API route yet) — that's the next task.

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "feat(contact): client form (RHF + Zod) and contact section"
```

---

## Task 21: Rate-limit helper + contact API route

**Files:**
- Create: `src/lib/rate-limit.ts`
- Create: `src/app/api/contact/route.ts`
- Modify: `.env.example` (already created — verify keys present)

- [ ] **Step 1: Prompt the user for credentials**

Ask Alexandro to provide:
- `RESEND_API_KEY` (from https://resend.com → API Keys)
- `CONTACT_TO_EMAIL` — the address that should receive contact-form messages
- `CONTACT_FROM_EMAIL` — must be either `onboarding@resend.dev` (for dev) or an address on a verified Resend domain
- `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN` (from https://console.upstash.com → Create Database → REST API)

Write all four into `.env.local` (which is git-ignored). Confirm `.env.example` exposes the same keys with empty values (already created in Task 1).

- [ ] **Step 2: Install dependencies**

```bash
pnpm add @upstash/ratelimit @upstash/redis resend
```

- [ ] **Step 3: Create the rate-limit helper**

`src/lib/rate-limit.ts`:

```ts
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

let limiter: Ratelimit | null = null;

function getLimiter(): Ratelimit | null {
  if (limiter) return limiter;
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) return null;

  limiter = new Ratelimit({
    redis: new Redis({ url, token }),
    limiter: Ratelimit.slidingWindow(5, "1 h"),
    analytics: false,
    prefix: "contact",
  });
  return limiter;
}

export async function checkRateLimit(identifier: string): Promise<{ ok: boolean; remaining: number }> {
  const l = getLimiter();
  if (!l) {
    // In dev (no Upstash creds) we fail open with a warning.
    if (process.env.NODE_ENV !== "production") {
      console.warn("[rate-limit] Upstash env vars missing — skipping rate limit (dev only).");
      return { ok: true, remaining: Infinity };
    }
    // In production this is a configuration error — fail closed.
    return { ok: false, remaining: 0 };
  }
  const result = await l.limit(identifier);
  return { ok: result.success, remaining: result.remaining };
}
```

- [ ] **Step 4: Create the contact route handler**

`src/app/api/contact/route.ts`:

```ts
import { NextResponse, type NextRequest } from "next/server";
import { Resend } from "resend";
import { contactSchema } from "@/lib/contact-schema";
import { checkRateLimit } from "@/lib/rate-limit";

export const runtime = "nodejs";

function clientIp(req: NextRequest): string {
  const fwd = req.headers.get("x-forwarded-for");
  if (fwd) return fwd.split(",")[0]!.trim();
  return req.headers.get("x-real-ip") ?? "unknown";
}

export async function POST(req: NextRequest) {
  let payload: unknown;
  try {
    payload = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON." }, { status: 400 });
  }

  const parsed = contactSchema.safeParse(payload);
  if (!parsed.success) {
    // Honeypot or validation — don't leak which.
    return NextResponse.json({ error: "Invalid submission." }, { status: 400 });
  }

  const { ok } = await checkRateLimit(`ip:${clientIp(req)}`);
  if (!ok) {
    return NextResponse.json({ error: "Too many requests. Try again later." }, { status: 429 });
  }

  const apiKey = process.env.RESEND_API_KEY;
  const to = process.env.CONTACT_TO_EMAIL;
  const from = process.env.CONTACT_FROM_EMAIL ?? "onboarding@resend.dev";
  if (!apiKey || !to) {
    console.error("[contact] Missing RESEND_API_KEY or CONTACT_TO_EMAIL");
    return NextResponse.json({ error: "Server misconfigured." }, { status: 500 });
  }

  const { name, email, message } = parsed.data;
  try {
    const resend = new Resend(apiKey);
    await resend.emails.send({
      from: `Portfolio Contact <${from}>`,
      to: [to],
      replyTo: email,
      subject: `New message from ${name}`,
      text: `From: ${name} <${email}>\n\n${message}`,
    });
  } catch (err) {
    console.error("[contact] Resend failed", err);
    return NextResponse.json({ error: "Could not send message." }, { status: 502 });
  }

  return NextResponse.json({ ok: true });
}
```

- [ ] **Step 5: Smoke test end-to-end**

```bash
pnpm dev
```

Open `http://localhost:3000`, scroll to Contact, fill the form, submit. Expected:
- Success toast appears, form resets.
- Email arrives at `CONTACT_TO_EMAIL`.
- Re-submitting 6 times within an hour returns "Too many requests" (assuming Upstash is configured).

Also test honeypot: temporarily add `value="x"` to the hidden `website` input in the form and submit — should return "Invalid submission."

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "feat(contact): API route with Zod, Upstash rate limit, Resend delivery"
```

---

## Task 22: OG image generation (home + case study)

**Files:**
- Create: `src/app/opengraph-image.tsx`
- Create: `src/app/projects/[slug]/opengraph-image.tsx`

- [ ] **Step 1: Create the home OG image**

`src/app/opengraph-image.tsx`:

```tsx
import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "Alexandro Bolfa — Software engineer";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          background: "#0a0a0a",
          color: "#fafafa",
          padding: "80px",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          fontFamily: "monospace",
        }}
      >
        <div style={{ color: "#3b82f6", fontSize: 28, letterSpacing: "0.18em", textTransform: "uppercase" }}>
          AB
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <div style={{ fontSize: 88, fontWeight: 500, letterSpacing: "-0.04em" }}>
            Alexandro Bolfa
          </div>
          <div style={{ fontSize: 32, color: "#a1a1aa" }}>
            Software engineer — frontend-focused, full-stack capable.
          </div>
        </div>
        <div style={{ fontSize: 22, color: "#71717a" }}>alexandro-bolfa.com</div>
      </div>
    ),
    size,
  );
}
```

- [ ] **Step 2: Create the per-case-study OG image**

`src/app/projects/[slug]/opengraph-image.tsx`:

```tsx
import { ImageResponse } from "next/og";
import { getFlagshipBySlug } from "@/lib/mdx";

export const runtime = "nodejs";
export const alt = "Case study";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OpengraphImage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const project = await getFlagshipBySlug(slug);
  const title = project?.title ?? "Case study";
  const summary = project?.summary ?? "";

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          background: "#0a0a0a",
          color: "#fafafa",
          padding: "80px",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          fontFamily: "monospace",
        }}
      >
        <div style={{ color: "#3b82f6", fontSize: 24, letterSpacing: "0.18em", textTransform: "uppercase" }}>
          Case study
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          <div style={{ fontSize: 76, fontWeight: 500, letterSpacing: "-0.04em" }}>{title}</div>
          {summary && (
            <div style={{ fontSize: 28, color: "#a1a1aa", lineHeight: 1.4 }}>{summary}</div>
          )}
        </div>
        <div style={{ fontSize: 22, color: "#71717a" }}>alexandro-bolfa.com</div>
      </div>
    ),
    size,
  );
}
```

> The case-study OG runs on the Node runtime because it reads from disk via the MDX loader.

- [ ] **Step 3: Verify**

```bash
pnpm build
pnpm start
```

Open `http://localhost:3000/opengraph-image` — should show the 1200×630 PNG.
Open `http://localhost:3000/projects/portfolio-site/opengraph-image` — should show the case-study card.

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "feat(seo): @vercel/og images for home and case studies"
```

---

## Task 23: Sitemap, robots, JSON-LD

**Files:**
- Create: `src/app/sitemap.ts`
- Create: `src/app/robots.ts`
- Modify: `src/app/page.tsx` (add Person JSON-LD)
- Modify: `src/app/projects/[slug]/page.tsx` (add Article JSON-LD)

- [ ] **Step 1: Create the sitemap**

`src/app/sitemap.ts`:

```ts
import type { MetadataRoute } from "next";
import { listFlagships } from "@/lib/mdx";
import { siteUrl } from "@/lib/site-metadata";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const flagships = await listFlagships();
  const now = new Date();

  return [
    { url: `${siteUrl}/`, lastModified: now, changeFrequency: "monthly", priority: 1 },
    ...flagships.map((p) => ({
      url: `${siteUrl}/projects/${p.slug}`,
      lastModified: now,
      changeFrequency: "yearly" as const,
      priority: 0.8,
    })),
  ];
}
```

- [ ] **Step 2: Create robots.txt**

`src/app/robots.ts`:

```ts
import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/site-metadata";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/", disallow: "/api/" },
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
```

- [ ] **Step 3: Add Person JSON-LD to home**

Edit `src/app/page.tsx`. Add the import + script tag inside the `<>` fragment near the top:

```tsx
import { site } from "@content/site";
import { siteUrl } from "@/lib/site-metadata";

// ...inside the JSX, just inside the fragment, before <Nav />:
<script
  type="application/ld+json"
  dangerouslySetInnerHTML={{
    __html: JSON.stringify({
      "@context": "https://schema.org",
      "@type": "Person",
      name: site.name,
      url: siteUrl,
      email: `mailto:${site.email}`,
      sameAs: site.socials.map((s) => s.href),
      jobTitle: "Software Engineer",
    }),
  }}
/>
```

- [ ] **Step 4: Add Article JSON-LD to case study**

Edit `src/app/projects/[slug]/page.tsx`. Inside the returned JSX just below `<Nav />`:

```tsx
<script
  type="application/ld+json"
  dangerouslySetInnerHTML={{
    __html: JSON.stringify({
      "@context": "https://schema.org",
      "@type": "Article",
      headline: project.title,
      description: project.summary,
      datePublished: `${project.year}-01-01`,
      author: { "@type": "Person", name: "Alexandro Bolfa" },
    }),
  }}
/>
```

- [ ] **Step 5: Verify**

```bash
pnpm build
pnpm start
```

- `http://localhost:3000/sitemap.xml` returns XML with home + each case-study URL.
- `http://localhost:3000/robots.txt` lists `User-agent: *` and the sitemap.
- View page source on `/` and `/projects/portfolio-site` — both contain `<script type="application/ld+json">`.

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "feat(seo): sitemap, robots, Person + Article JSON-LD"
```

---

## Task 24: Vercel Analytics + Speed Insights

**Files:**
- Modify: `src/app/layout.tsx`

- [ ] **Step 1: Install**

```bash
pnpm add @vercel/analytics @vercel/speed-insights
```

- [ ] **Step 2: Wire into layout**

In `src/app/layout.tsx`, add:

```tsx
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
```

Inside `<body>` after `<ThemeProvider>{children}</ThemeProvider>`:

```tsx
<Analytics />
<SpeedInsights />
```

- [ ] **Step 3: Verify**

```bash
pnpm build
```

> Components no-op in development; they report only when deployed on Vercel.

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "feat(analytics): Vercel Analytics + Speed Insights"
```

---

## Task 25: Local verification gate

**Files:** none (verification only)

- [ ] **Step 1: Run the full local check**

```bash
pnpm typecheck && pnpm lint && pnpm test && pnpm build
```

Expected: all four exit 0. Fix any issues before proceeding.

- [ ] **Step 2: Manual visual sweep**

Run `pnpm dev`, then in a browser open `http://localhost:3000` and verify each item:

1. Hero centers vertically and horizontally; Geist Mono name, electric-blue CTA.
2. Theme toggle in nav swaps light ↔ dark with no flash; preference persists on reload.
3. Sticky nav blurs the background as you scroll.
4. Sections fade in on first appearance only (they don't re-fade if you scroll back).
5. Skills chips render in a grid, grouped by category.
6. Experience timeline shows the accent dot for current entries and an outline dot for education.
7. Selected work shows the flagship card with cover image; clicking it navigates to the case study.
8. Case study `/projects/portfolio-site` renders the MDX body with styled `h2`/`h3`/`p`.
9. Contact form: empty submit shows inline errors; valid submit shows "Thanks — your message is on its way."; check the test message landed at `CONTACT_TO_EMAIL`.
10. Tab through the page — focus rings are visible in electric blue everywhere.
11. Resize to 375px width — layout reflows, nothing overflows horizontally.
12. Set OS to `prefers-reduced-motion: reduce` — scroll-fade animations stop running.

- [ ] **Step 3: Lighthouse check**

In Chrome DevTools, run Lighthouse (mobile, all categories) against `http://localhost:3000`. Targets per spec: **≥ 95** in all four. Fix anything below the bar before deploying:
- Performance < 95 → check image sizes / fonts / unused JS
- A11y < 95 → check contrast, missing labels, heading order

- [ ] **Step 4: Commit (if any fixes were needed)**

```bash
git add -A
git commit -m "fix: local verification fixes" # only if anything changed
```

---

## Task 26: Deploy to Vercel + domain wiring

**Files:** none new (Vercel CLI / dashboard work)

- [ ] **Step 1: Push the repo to GitHub**

```bash
gh repo create alexandro-bolfa/portfolio --private --source=. --remote=origin --push
```

(Or use the GitHub UI; the rest of the steps work either way.)

- [ ] **Step 2: Import into Vercel**

```bash
pnpm dlx vercel login
pnpm dlx vercel link
```

Choose `alexandro-bolfa/portfolio` and the personal Vercel account.

- [ ] **Step 3: Configure environment variables**

```bash
pnpm dlx vercel env add RESEND_API_KEY production
pnpm dlx vercel env add CONTACT_TO_EMAIL production
pnpm dlx vercel env add CONTACT_FROM_EMAIL production
pnpm dlx vercel env add UPSTASH_REDIS_REST_URL production
pnpm dlx vercel env add UPSTASH_REDIS_REST_TOKEN production
pnpm dlx vercel env add NEXT_PUBLIC_SITE_URL production
```

For `NEXT_PUBLIC_SITE_URL` enter `https://alexandro-bolfa.com`.

Repeat the same six commands with `preview` to populate preview deployments (use the same values, or fresh test Resend/Upstash creds if you want to isolate).

> Vercel MCP alternative: if the Vercel MCP is wired into the dev environment, the same env-var operations can be done via the MCP tools — list them with `mcp__vercel__*` from the assistant's tool list. The CLI works regardless.

- [ ] **Step 4: First deploy**

```bash
pnpm dlx vercel --prod
```

Expected: deploy succeeds, returns a `*.vercel.app` URL. Open it and run the same visual sweep from Task 25 step 2.

- [ ] **Step 5: Attach the custom domain**

In the Vercel dashboard → Project → Settings → Domains:
1. Add `alexandro-bolfa.com` (apex).
2. Add `www.alexandro-bolfa.com` and set redirect to apex.
3. Follow Vercel's DNS prompts. The two options:
   - **Use Vercel nameservers** (easiest): update the registrar's NS records.
   - **Use your DNS provider**: add the `A` record (Vercel's IP) for apex and the `CNAME` for `www`.
4. Wait for the SSL cert to provision (typically < 5 min).

- [ ] **Step 6: Production smoke test**

Once DNS resolves:

- Open `https://alexandro-bolfa.com` — site loads, HTTPS, no certificate warning.
- Open `https://www.alexandro-bolfa.com` — redirects to apex.
- Open `https://alexandro-bolfa.com/projects/portfolio-site` — case study loads.
- Open `https://alexandro-bolfa.com/resume.pdf` — placeholder PDF downloads (replace with real PDF before sharing).
- Submit the contact form with a real message — verify it lands in `CONTACT_TO_EMAIL`.
- Test the OG image: paste `https://alexandro-bolfa.com` into the LinkedIn post composer — confirm the OG image renders.
- Run mobile Lighthouse against the production URL — confirm ≥ 95 in all four categories.

- [ ] **Step 7: Final commit**

If any fixes were needed during deployment (env-var typos, DNS quirks captured as config):

```bash
git add -A
git commit -m "chore(deploy): production deploy + custom-domain wiring"
git push
```

---

## Done — definition of "shipped"

All success criteria from the spec must hold:

1. ✅ Live at `https://alexandro-bolfa.com` with `www.` redirect.
2. ✅ Lighthouse home page ≥ 95 in all four categories on mobile and desktop.
3. ✅ Flagship case study live at `/projects/portfolio-site`.
4. ✅ Skills, experience, contact links, and resume download populated.
5. ✅ Contact form successfully delivers a test message via Resend.
6. ✅ Light and dark modes verified at standard breakpoints.
7. ✅ No console errors, no TypeScript errors, ESLint clean.

Anything that fails one of these is not done yet — go back and fix before declaring v1.

---

## Post-v1 follow-ups (not in this plan)

These are deliberately not in scope; capture them when the time comes:
- Replace placeholder content (`content/*.ts` + `content/projects/portfolio-site.mdx`) with real bio, skills, experience, and case-study writing.
- Replace `public/resume.pdf` and `public/projects/portfolio/cover.png` with real assets.
- Add a second flagship case study (the design already accommodates 1–2).
- Add the blog (`content/blog/*.mdx`) when there's something to post.
