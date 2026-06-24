# CV PDF Generation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Generate a one-page, brand-matched CV at `public/resume.pdf` from in-repo content so the CV never drifts from the site, resolving Bug 2 of issue #3.

**Architecture:** A new `content/resume.ts` holds CV-curated content (reusing `site.ts`, `skills.ts`, and `education` from `experience.ts`). A standalone `/resume` Next route renders it print-styled with a fixed light palette. A local `scripts/generate-resume.mjs` spins up the Next server and uses Playwright to print the route to `public/resume.pdf`, which is committed like the diagram SVGs. The existing CV links already point at `/resume.pdf`, so no link change is needed.

**Tech Stack:** Next.js 16 (App Router, React 19), TypeScript, CSS Modules, Playwright (devDependency), Vitest (node env).

## Global Constraints

- **No em dashes (`—`)** anywhere in CV text. Use commas, periods, colons, or parentheses. En dash (`–`) is allowed only in date ranges.
- **Minimal PII on the public PDF:** name, location (Horsens, Denmark), email, GitHub, LinkedIn, personal site only. Never include DOB, street address, phone, or the reference's phone.
- **`/resume` route is noindex:** `robots: { index: false }`, not added to nav or `src/app/sitemap.ts`.
- **No browser tooling on deploy:** PDF and image optimization run locally via scripts; only the committed artifacts ship.
- **Two CV projects:** Consentinel (linked, `https://github.com/Reblayzer/consentinel`) and Niteshift (described, no link).
- **Vitest tests live in `tests/**/*.test.ts`** and run in the `node` environment (no DOM).
- **Content import aliases:** `@content/*` maps to `content/*`, `@/*` maps to `src/*`.

---

### Task 1: CV content module

**Files:**
- Create: `content/resume.ts`
- Test: `tests/resume.test.ts`

**Interfaces:**
- Consumes: `site` from `@content/site`, `skillGroups` from `@content/skills`, `education` from `@content/experience`.
- Produces (consumed by Task 3):
  - `resumeTitle: string`
  - `resumeProfile: string[]`
  - `resumeContact: { label: string; value: string; href?: string }[]`
  - `resumeExperience: { role: string; company: string; location: string; start: string; end: string; bullets: string[] }`
  - `resumeProjects: { name: string; blurb: string; detail: string; stack: string[]; link?: { label: string; href: string } }[]`
  - `resumeFocusAreas: { label: string; href: string }`
  - `resumeLanguages: { name: string; level: string }[]`

- [ ] **Step 1: Write the failing test**

Create `tests/resume.test.ts`:

```ts
import { describe, it, expect } from "vitest";
import * as resume from "@content/resume";

function collectStrings(value: unknown, acc: string[] = []): string[] {
  if (typeof value === "string") acc.push(value);
  else if (Array.isArray(value)) value.forEach((v) => collectStrings(v, acc));
  else if (value && typeof value === "object")
    Object.values(value).forEach((v) => collectStrings(v, acc));
  return acc;
}

const allText = collectStrings(resume).join("\n");

describe("resume content", () => {
  it("contains no em dashes", () => {
    expect(allText).not.toContain("—");
  });

  it("includes the mandatory Danish DU3 line", () => {
    expect(allText).toMatch(/DU3/);
  });

  it("includes an AI/LLM reference", () => {
    expect(allText).toMatch(/Claude Code|Copilot|LLM/);
  });

  it("does not leak private contact details", () => {
    for (const pii of ["50 21 00 57", "03/03/2003", "Bødkervej", "24 20 47 88"]) {
      expect(allText).not.toContain(pii);
    }
  });

  it("links Consentinel and not Niteshift", () => {
    const consentinel = resume.resumeProjects.find((p) => p.name === "Consentinel");
    const niteshift = resume.resumeProjects.find((p) => p.name === "Niteshift");
    expect(consentinel?.link?.href).toContain("github.com/Reblayzer/consentinel");
    expect(niteshift?.link).toBeUndefined();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- resume`
Expected: FAIL — cannot resolve `@content/resume` (module does not exist yet).

- [ ] **Step 3: Write the content module**

Create `content/resume.ts`:

```ts
import { site } from "@content/site";

export type ResumeContact = { label: string; value: string; href?: string };
export type ResumeExperience = {
  role: string;
  company: string;
  location: string;
  start: string;
  end: string;
  bullets: string[];
};
export type ResumeProject = {
  name: string;
  blurb: string;
  detail: string;
  stack: string[];
  link?: { label: string; href: string };
};
export type ResumeLanguage = { name: string; level: string };

export const resumeTitle = "Full-stack Software Engineer";

export const resumeProfile: string[] = [
  "Full-stack software engineer with two years shipping production features at Schneider Electric on the EcoStruxure Power SaaS platform, owning work from the REST endpoint and database query layer up to the view on top. B.Sc. in Software Technology Engineering from VIA University College, January 2026.",
  "I build software that holds up end to end: clean APIs, sound data models, and interfaces that feel good to use. LLM-guided development is part of how I work, with GitHub Copilot daily at Schneider and Claude Code plus custom skills and MCP servers on personal projects.",
  "Currently studying Danish (DU3 Module 3) and motivated to reach professional fluency.",
];

export const resumeContact: ResumeContact[] = [
  { label: "Location", value: site.location },
  { label: "Email", value: site.email, href: `mailto:${site.email}` },
  { label: "Site", value: "alexandro-bolfa.com", href: "https://alexandro-bolfa.com" },
  { label: "GitHub", value: "github.com/Reblayzer", href: "https://github.com/Reblayzer" },
  {
    label: "LinkedIn",
    value: "linkedin.com/in/alexandro-bolfa",
    href: "https://www.linkedin.com/in/alexandro-bolfa/",
  },
];

export const resumeExperience: ResumeExperience = {
  role: "Software Developer (Intern & Student Assistant)",
  company: "Schneider Electric, Digital Energy",
  location: "Kolding, Denmark",
  start: "Jan 2024",
  end: "Jan 2026",
  bullets: [
    "Shipped features end to end on the EcoStruxure Power SaaS platform as a member of an empowered Scrum team inside a global release train of eight distributed teams across Europe, North America and Asia (around 60 engineers).",
    "Delivered a full-stack feature owning the REST endpoint, the database query layer, and the Angular view: a new tab listing generated scheduled reports for UPS assets, with custom data-heavy table components and cell renderers.",
    "Ramped fast onto a second international release on a C#/.NET and React micro-frontend architecture, integrating a custom date-range picker into the in-house Quartz design system and becoming a reference person for teammates joining the same stack.",
    "Owned tasks through refinement, implementation, unit tests (xUnit, JUnit), code review, and CI/CD (Jenkins, GitHub Actions); worked with Kafka Streams, gRPC, SQL and NoSQL stores, and Azure, with GitHub Copilot in every coding session.",
  ],
};

export const resumeProjects: ResumeProject[] = [
  {
    name: "Consentinel",
    blurb: "Full-stack data-governance and compliance portal, built solo end to end.",
    detail:
      "Owners register dataset manifests, an API auto-classifies every column for personal data, and data subjects file right-to-be-forgotten requests through a stewarded approval workflow with an append-only audit trail. The dependency-free PII classifier combines value patterns with multilingual column-name hints, including the Danish CPR format.",
    stack: ["Python", "FastAPI", "PostgreSQL", "Next.js", "TypeScript", "Terraform", "Docker"],
    link: {
      label: "github.com/Reblayzer/consentinel",
      href: "https://github.com/Reblayzer/consentinel",
    },
  },
  {
    name: "Niteshift",
    blurb: "Blockchain incremental game, built with two collaborators over a year and counting.",
    detail:
      "I own the entire Unity and C# frontend: gameplay UI, HUD, the asset pipeline, and a building-and-street auto-connection system that detects neighbouring tiles, picks the right road variant, and rerenders dynamically as the player builds. Developed with Claude Code, custom skills, and MCP integrations.",
    stack: ["Unity", "C#", "Game state management"],
  },
];

export const resumeFocusAreas: { label: string; href: string } = {
  label: "Backend, Data Engineering, AI/LLM, Cloud/DevOps, Frontend",
  href: "https://alexandro-bolfa.com/projects",
};

export const resumeLanguages: ResumeLanguage[] = [
  { name: "English", level: "C1" },
  { name: "Italian", level: "C1" },
  { name: "Romanian", level: "B2" },
  { name: "German", level: "B2" },
  { name: "Danish", level: "A2 (studying DU3.M3)" },
];
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- resume`
Expected: PASS (5 tests).

- [ ] **Step 5: Typecheck**

Run: `npm run typecheck`
Expected: no errors.

- [ ] **Step 6: Commit**

```bash
git add content/resume.ts tests/resume.test.ts
git commit -m "feat(resume): CV content module with style and PII guards"
```

---

### Task 2: Optimized headshot asset

**Files:**
- Create: `scripts/optimize-headshot.mjs`
- Create (artifact): `public/headshot.jpg`

**Interfaces:**
- Consumes: a source image path (CLI arg). The user-provided photo is at the harness image cache (e.g. `/home/reblayzer/.claude/image-cache/<session>/1.jpeg`); confirm the current path with the user/operator before running.
- Produces: `public/headshot.jpg`, a 512x512 center-cropped JPEG (consumed by Task 3 as `/headshot.jpg`).

- [ ] **Step 1: Write the optimize script**

Create `scripts/optimize-headshot.mjs`:

```js
// One-off: optimize a source photo into public/headshot.jpg (512x512, center-cropped).
// Usage: node scripts/optimize-headshot.mjs <source-image-path>
// Uses Playwright's Chromium canvas so no extra image dependency is needed.
import { readFile, writeFile } from "node:fs/promises";
import { chromium } from "playwright";

const src = process.argv[2];
if (!src) {
  console.error("Usage: node scripts/optimize-headshot.mjs <source-image-path>");
  process.exit(1);
}

const SIZE = 512;
const buf = await readFile(src);
const dataUrl = `data:image/jpeg;base64,${buf.toString("base64")}`;

const browser = await chromium.launch();
try {
  const page = await browser.newPage();
  const out = await page.evaluate(
    async ({ dataUrl, size }) => {
      const img = new Image();
      img.src = dataUrl;
      await img.decode();
      const canvas = document.createElement("canvas");
      canvas.width = size;
      canvas.height = size;
      const ctx = canvas.getContext("2d");
      const side = Math.min(img.width, img.height);
      const sx = (img.width - side) / 2;
      const sy = (img.height - side) / 2;
      ctx.drawImage(img, sx, sy, side, side, 0, 0, size, size);
      return canvas.toDataURL("image/jpeg", 0.85);
    },
    { dataUrl, size: SIZE },
  );
  const base64 = out.replace(/^data:image\/jpeg;base64,/, "");
  await writeFile("public/headshot.jpg", Buffer.from(base64, "base64"));
  console.log("Wrote public/headshot.jpg");
} finally {
  await browser.close();
}
```

- [ ] **Step 2: Ensure Chromium is installed (one-time)**

Run: `npx playwright install chromium`
Expected: Chromium present (or "is already installed").

- [ ] **Step 3: Generate the headshot**

Run (substitute the confirmed source path):
`node scripts/optimize-headshot.mjs /home/reblayzer/.claude/image-cache/<session>/1.jpeg`
Expected: prints `Wrote public/headshot.jpg`.

- [ ] **Step 4: Verify the output**

Run: `file public/headshot.jpg`
Expected: `JPEG image data ... 512x512`.

- [ ] **Step 5: Commit**

```bash
git add scripts/optimize-headshot.mjs public/headshot.jpg
git commit -m "feat(resume): optimized headshot asset for the CV header"
```

---

### Task 3: The /resume print route

**Files:**
- Create: `src/app/resume/page.tsx`
- Create: `src/app/resume/resume.module.css`

**Interfaces:**
- Consumes: all exports from `@content/resume` (Task 1), `site` from `@content/site`, `skillGroups` from `@content/skills`, `education` from `@content/experience`, `/ab-logo.svg` and `/headshot.jpg` (Task 2) from `public/`.
- Produces: a noindex `/resume` HTML page (consumed by Task 4's Playwright print).

- [ ] **Step 1: Write the print stylesheet**

Create `src/app/resume/resume.module.css`:

```css
@page {
  size: A4;
  margin: 14mm 16mm;
}

.page {
  width: 210mm;
  min-height: 297mm;
  margin: 0 auto;
  padding: 14mm 16mm;
  background: #ffffff;
  color: #0a0a0a;
  font-family: var(--font-geist-sans), ui-sans-serif, system-ui, sans-serif;
  font-size: 9.5pt;
  line-height: 1.45;
}

@media print {
  .page {
    width: auto;
    min-height: auto;
    padding: 0;
  }
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 10mm;
  margin-bottom: 6mm;
}

.headerLeft {
  flex: 1;
}

.logo {
  height: 9mm;
  width: auto;
  margin-bottom: 4mm;
  display: block;
}

.name {
  font-family: var(--font-geist-mono), ui-monospace, monospace;
  font-size: 22pt;
  font-weight: 500;
  letter-spacing: -0.04em;
  line-height: 1;
}

.title {
  font-family: var(--font-geist-mono), ui-monospace, monospace;
  font-size: 9.5pt;
  text-transform: uppercase;
  letter-spacing: 0.14em;
  color: #52525b;
  margin-top: 2mm;
}

.contact {
  margin-top: 4mm;
  display: flex;
  flex-wrap: wrap;
  gap: 1mm 5mm;
  font-size: 8.5pt;
  color: #27272a;
}

.contact a {
  color: #27272a;
  text-decoration: none;
}

.photo {
  width: 30mm;
  height: 30mm;
  border-radius: 50%;
  object-fit: cover;
  flex-shrink: 0;
}

.section {
  margin-bottom: 4.5mm;
}

.sectionTitle {
  font-family: var(--font-geist-mono), ui-monospace, monospace;
  font-size: 8pt;
  text-transform: uppercase;
  letter-spacing: 0.16em;
  color: #2563eb;
  border-bottom: 1px solid rgb(0 0 0 / 0.1);
  padding-bottom: 1.5mm;
  margin-bottom: 3mm;
}

.profile p {
  margin-bottom: 2mm;
}

.skillRow {
  display: flex;
  gap: 2mm;
  margin-bottom: 1.5mm;
}

.skillLabel {
  font-weight: 600;
  min-width: 32mm;
  flex-shrink: 0;
}

.skillItems {
  color: #27272a;
}

.entry {
  margin-bottom: 3mm;
}

.entryHead {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  gap: 4mm;
}

.entryRole {
  font-weight: 600;
}

.entryMeta {
  color: #52525b;
  font-size: 8.5pt;
  white-space: nowrap;
}

.entrySub {
  color: #52525b;
  font-size: 8.5pt;
  margin-bottom: 1.5mm;
}

.bullets {
  list-style: disc;
  padding-left: 4.5mm;
}

.bullets li {
  margin-bottom: 1mm;
}

.project {
  margin-bottom: 2.5mm;
}

.projectName {
  font-weight: 600;
}

.projectLink {
  color: #2563eb;
  text-decoration: none;
  font-size: 8.5pt;
  white-space: nowrap;
}

.projectStack {
  color: #52525b;
  font-size: 8pt;
  margin-top: 0.5mm;
}

.focus {
  font-size: 9pt;
  margin-top: 2mm;
}

.focus a {
  color: #2563eb;
  text-decoration: none;
}

.langs {
  display: flex;
  flex-wrap: wrap;
  gap: 1mm 5mm;
}
```

- [ ] **Step 2: Write the resume page**

Create `src/app/resume/page.tsx`:

```tsx
import type { Metadata } from "next";
import styles from "./resume.module.css";
import { site } from "@content/site";
import { skillGroups } from "@content/skills";
import { education } from "@content/experience";
import {
  resumeTitle,
  resumeProfile,
  resumeContact,
  resumeExperience,
  resumeProjects,
  resumeFocusAreas,
  resumeLanguages,
} from "@content/resume";

export const metadata: Metadata = {
  title: "CV",
  robots: { index: false, follow: false },
};

export default function ResumePage() {
  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <div className={styles.headerLeft}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/ab-logo.svg" alt="" className={styles.logo} />
          <h1 className={styles.name}>{site.name}</h1>
          <p className={styles.title}>{resumeTitle}</p>
          <div className={styles.contact}>
            {resumeContact.map((c) => (
              <span key={c.label}>{c.href ? <a href={c.href}>{c.value}</a> : c.value}</span>
            ))}
          </div>
        </div>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/headshot.jpg" alt={site.name} className={styles.photo} />
      </header>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Profile</h2>
        <div className={styles.profile}>
          {resumeProfile.map((p) => (
            <p key={p.slice(0, 24)}>{p}</p>
          ))}
        </div>
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Skills</h2>
        {skillGroups.map((g) => (
          <div key={g.title} className={styles.skillRow}>
            <span className={styles.skillLabel}>{g.title}</span>
            <span className={styles.skillItems}>{g.items.join(", ")}</span>
          </div>
        ))}
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Experience</h2>
        <div className={styles.entry}>
          <div className={styles.entryHead}>
            <span className={styles.entryRole}>
              {resumeExperience.role}, {resumeExperience.company}
            </span>
            <span className={styles.entryMeta}>
              {resumeExperience.start} – {resumeExperience.end}
            </span>
          </div>
          <div className={styles.entrySub}>{resumeExperience.location}</div>
          <ul className={styles.bullets}>
            {resumeExperience.bullets.map((b) => (
              <li key={b.slice(0, 24)}>{b}</li>
            ))}
          </ul>
        </div>
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Projects</h2>
        {resumeProjects.map((p) => (
          <div key={p.name} className={styles.project}>
            <div className={styles.entryHead}>
              <span className={styles.projectName}>{p.name}</span>
              {p.link ? (
                <a className={styles.projectLink} href={p.link.href}>
                  {p.link.label}
                </a>
              ) : null}
            </div>
            <div>
              {p.blurb} {p.detail}
            </div>
            <div className={styles.projectStack}>{p.stack.join(" · ")}</div>
          </div>
        ))}
        <p className={styles.focus}>
          Focus areas: {resumeFocusAreas.label}.{" "}
          <a href={resumeFocusAreas.href}>See the full project explorer.</a>
        </p>
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Education</h2>
        {education.map((e) => (
          <div key={e.degree} className={styles.entry}>
            <div className={styles.entryHead}>
              <span className={styles.entryRole}>
                {e.degree}, {e.school}
              </span>
              <span className={styles.entryMeta}>
                {e.start} – {e.end}
              </span>
            </div>
            {e.detail ? <div className={styles.entrySub}>{e.detail}</div> : null}
          </div>
        ))}
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Languages</h2>
        <div className={styles.langs}>
          {resumeLanguages.map((l) => (
            <span key={l.name}>
              {l.name} {l.level}
            </span>
          ))}
        </div>
      </section>
    </main>
  );
}
```

- [ ] **Step 3: Typecheck and lint**

Run: `npm run typecheck && npm run lint`
Expected: no errors.

- [ ] **Step 4: Render check in dev**

Run (in one shell): `npm run dev`
Then: `curl -s -o /dev/null -w "%{http_code}\n" http://localhost:3000/resume`
Expected: `200`. Open `http://localhost:3000/resume` in a browser and confirm: logo + name + photo header, all sections present, one page of content, light background, no site nav/footer. Stop the dev server afterward.

- [ ] **Step 5: Commit**

```bash
git add src/app/resume/page.tsx src/app/resume/resume.module.css
git commit -m "feat(resume): noindex print-styled /resume route"
```

---

### Task 4: PDF generation script and committed artifact

**Files:**
- Create: `scripts/generate-resume.mjs`
- Modify: `package.json` (add the `resume` script)
- Create (artifact): `public/resume.pdf`

**Interfaces:**
- Consumes: the `/resume` route (Task 3), Playwright (devDependency), Chromium (installed in Task 2 Step 2).
- Produces: `public/resume.pdf` (served at `/resume.pdf`, the existing CV link target).

- [ ] **Step 1: Write the generation script**

Create `scripts/generate-resume.mjs`:

```js
// Local build tool: render the /resume route to public/resume.pdf with Playwright.
// Not run on deploy; browser tooling stays off the deploy path (like the diagrams script).
// One-time setup: npx playwright install chromium
import { spawn } from "node:child_process";
import { setTimeout as sleep } from "node:timers/promises";
import { chromium } from "playwright";

const PORT = 3210;
const URL = `http://localhost:${PORT}/resume`;

async function waitForServer(url, timeoutMs = 60000) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    try {
      const res = await fetch(url);
      if (res.ok) return;
    } catch {
      // server not up yet
    }
    await sleep(500);
  }
  throw new Error(`Server did not become ready at ${url}`);
}

const server = spawn("npx", ["next", "dev", "-p", String(PORT)], { stdio: "inherit" });

let browser;
try {
  await waitForServer(URL);
  browser = await chromium.launch();
  const page = await browser.newPage();
  await page.goto(URL, { waitUntil: "networkidle" });
  await page.emulateMedia({ media: "print" });
  await page.pdf({
    path: "public/resume.pdf",
    format: "A4",
    printBackground: true,
    margin: { top: "0", bottom: "0", left: "0", right: "0" },
  });
  console.log("Wrote public/resume.pdf");
} finally {
  if (browser) await browser.close();
  server.kill("SIGTERM");
}
```

- [ ] **Step 2: Add the npm script**

In `package.json`, add to `"scripts"` (after `"diagrams"`):

```json
    "resume": "node scripts/generate-resume.mjs"
```

- [ ] **Step 3: Generate the PDF**

Run: `npm run resume`
Expected: prints `Wrote public/resume.pdf` and exits cleanly (server terminated).

- [ ] **Step 4: Verify the artifact**

Run: `file public/resume.pdf`
Expected: `PDF document`. Open it and confirm it is a single A4 page matching the route render (header with logo + photo, all sections, no em dashes).

- [ ] **Step 5: Verify the CV link resolves (no 404)**

Run (in one shell): `npm run dev`
Then: `curl -s -o /dev/null -w "%{http_code}\n" http://localhost:3000/resume.pdf`
Expected: `200`. Stop the dev server afterward.

- [ ] **Step 6: Full verification suite**

Run: `npm run typecheck && npm run lint && npm test`
Expected: all pass.

- [ ] **Step 7: Commit**

```bash
git add scripts/generate-resume.mjs package.json public/resume.pdf
git commit -m "feat(resume): generate committed resume.pdf via Playwright, resolves #3"
```

---

## Self-Review

**Spec coverage:**
- Minimal PII → Task 1 content + test (Step 1/3); enforced by the PII test.
- Depth + focus-areas projects → Task 1 `resumeProjects` + `resumeFocusAreas`, rendered in Task 3.
- One page → Task 3 CSS (A4, compact sizing); verified in Task 3 Step 4 and Task 4 Step 4.
- Portfolio brand + logo + photo → Task 2 (photo), Task 3 (Geist fonts, logo, fixed light palette).
- noindex /resume, not in nav/sitemap → Task 3 metadata; sitemap is an allowlist so no change needed.
- Local committed-artifact generation → Task 4 script + committed `public/resume.pdf`.
- Links already point at `/resume.pdf` → no change; verified in Task 4 Step 5.
- No em dashes → Task 1 test.
- Tests in node env → `tests/resume.test.ts` is data-only.

**Placeholder scan:** No TBD/TODO; all code blocks complete. The only variable is the headshot source path (Task 2 Step 3), which is inherently session-specific and flagged to confirm before running.

**Type consistency:** `resumeExperience` is a single object (not an array) in both Task 1 (definition) and Task 3 (consumption). `resumeProjects[].link` is optional in the type, the test, and the render. `resumeContact[].href` optional in type and render. Names match across tasks (`resumeProfile`, `resumeFocusAreas`, `resumeLanguages`, etc.).
