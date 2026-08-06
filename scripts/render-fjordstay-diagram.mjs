// Renders the Fjordstay infrastructure diagram to an inline SVG for the case
// study page. Hand-composed on a fixed grid, same shape helpers as the
// WagerLedger and BunkerFlow diagrams, so the set reads as one system.
//
// Only the SVG is written here — the Fjordstay cover is a screenshot of the
// real frontend (scripts/render-fjordstay-cover.mjs), not a diagram.
//
//   node scripts/render-fjordstay-diagram.mjs
//
// Two rules shape the layout, and every node position follows from them:
//
//   1. Every edge is a single straight line. No elbows. A corner is a place the
//      eye has to stop, and the previous version had nine of them carrying no
//      information at all.
//   2. No edge crosses another. Where two lines leave the same box they leave
//      from different points on the same side, rather than being routed around
//      each other afterwards.
//
// That is why the boxes sit where they do. Terraform is directly beneath the
// bucket and the database because that makes both of its edges vertical — not
// for balance, and it is a wide box for the same reason.
import fs from "node:fs/promises";
import path from "node:path";

const root = process.cwd();
const slug = "fjordstay";
const outDir = path.join(root, "public", "projects", slug);

/* ---- palette ---------------------------------------------------------------
 * The site's own theme tokens, so the diagram follows light and dark with the
 * page rather than shipping two files that can drift apart. Each carries its
 * light value as a fallback, which is what renders if the file is ever opened
 * on its own — outside the page a var() would resolve to nothing.
 *
 * This only works because the case study inlines the SVG into the document.
 * An <img> is a separate document and cannot see the .dark class next-themes
 * puts on <html>, so a file loaded that way is frozen in whichever palette it
 * was written with, however the reader has the site set.
 * -------------------------------------------------------------------------- */
const INK = "var(--color-foreground, #0a0a0a)";
const MUTED = "var(--color-muted-foreground, #52525b)";
const LINE = "var(--color-muted-foreground, #52525b)";
const ACCENT = "var(--color-accent, #2563eb)";
const ON_ACCENT = "var(--color-accent-foreground, #ffffff)";
const SURFACE = "var(--color-background, #ffffff)";
const GROUP = "var(--color-muted, #f4f4f5)";
const BORDER = "var(--color-border, rgb(0 0 0 / 0.12))";
const MONO = `ui-monospace, "SF Mono", "JetBrains Mono", "Cascadia Code", Menlo, monospace`;

// ---- shape helpers ----
const esc = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

/**
 * A node's label. A line beginning with ":" is a published port, drawn quieter
 * than the name above it — a detail you go looking for, not something to read
 * first.
 */
function nodeLabel(cx, cy, text, { color = INK, size = 23, port = MUTED } = {}) {
  const lines = String(text).split("\n");
  const lh = size * 1.2;
  const start = cy - ((lines.length - 1) * lh) / 2;
  const spans = lines
    .map((ln, i) => {
      const attrs = ln.startsWith(":")
        ? ` fill="${port}" font-size="${Math.round(size * 0.88)}" font-weight="400"`
        : "";
      return `<tspan x="${cx}" y="${start + i * lh}"${attrs}>${esc(ln)}</tspan>`;
    })
    .join("");
  return `<text font-family='${MONO}' font-size="${size}" font-weight="700" fill="${color}" text-anchor="middle" dominant-baseline="central">${spans}</text>`;
}

function rrect(
  cx,
  cy,
  w,
  h,
  label,
  {
    fill = SURFACE,
    stroke = INK,
    tcolor = INK,
    port = MUTED,
    sw = 2.5,
    r = 12,
    size = 23,
    dash = null,
  } = {},
) {
  const x = cx - w / 2;
  const y = cy - h / 2;
  const dashAttr = dash ? ` stroke-dasharray="${dash}"` : "";
  return `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${r}" fill="${fill}" stroke="${stroke}" stroke-width="${sw}"${dashAttr}/>${nodeLabel(cx, cy, label, { color: tcolor, size, port })}`;
}

function cylinder(cx, cy, w, h, label, { stroke = ACCENT, size = 22 } = {}) {
  const x = cx - w / 2;
  const y = cy - h / 2;
  const ry = w * 0.12;
  const d = [
    `M ${x} ${y + ry}`,
    `A ${w / 2} ${ry} 0 0 0 ${x + w} ${y + ry}`,
    `L ${x + w} ${y + h - ry}`,
    `A ${w / 2} ${ry} 0 0 1 ${x} ${y + h - ry}`,
    `Z`,
  ].join(" ");
  const top = `M ${x} ${y + ry} A ${w / 2} ${ry} 0 0 1 ${x + w} ${y + ry}`;
  return `<path d="${d}" fill="${SURFACE}" stroke="${stroke}" stroke-width="2.5"/><path d="${top}" fill="none" stroke="${stroke}" stroke-width="2.5"/>${nodeLabel(cx, cy + ry * 0.5, label, { size })}`;
}

function person(cx, cy, label) {
  const head = `<circle cx="${cx}" cy="${cy - 34}" r="22" fill="${SURFACE}" stroke="${INK}" stroke-width="2.5"/>`;
  const body = `<path d="M ${cx - 34} ${cy + 26} a 34 34 0 0 1 68 0" fill="${SURFACE}" stroke="${INK}" stroke-width="2.5"/>`;
  return `${head}${body}${nodeLabel(cx, cy + 58, label, { size: 21 })}`;
}

function groupBox(x, y, w, h, label) {
  return `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="16" fill="${GROUP}" stroke="${BORDER}" stroke-width="2"/><text x="${x + 28}" y="${y + 38}" font-family='${MONO}' font-size="24" fill="${MUTED}" text-anchor="start">${esc(label)}</text>`;
}

/** A straight edge. Two points, never more. */
function edge([x1, y1], [x2, y2], { accent = false, dash = null } = {}) {
  const color = accent ? ACCENT : LINE;
  const sw = accent ? 3.5 : 2.5;
  const marker = accent ? "url(#arrowAccent)" : "url(#arrow)";
  const dashAttr = dash ? ` stroke-dasharray="${dash}"` : "";
  return `<path d="M ${x1} ${y1} L ${x2} ${y2}" fill="none" stroke="${color}" stroke-width="${sw}"${dashAttr} marker-end="${marker}"/>`;
}

/**
 * Edge labels sit beside their line, never across it, so none of them needs a
 * knock-out rectangle behind the text and nothing has to be painted over
 * anything else.
 */
function edgeLabel(x, y, text, { anchor = "start" } = {}) {
  return `<text x="${x}" y="${y}" font-family='${MONO}' font-size="19" font-style="italic" fill="${MUTED}" text-anchor="${anchor}" dominant-baseline="central">${esc(text)}</text>`;
}

/* ---- layout ----------------------------------------------------------------
 * The app is the hub and each neighbour sits on a different side of it, so all
 * four of its edges are straight:
 *
 *                    Claude API
 *                        |
 *     Guest/Host —  Next.js app  — PostgreSQL
 *                     |     |
 *              Prometheus   S3
 *
 * Prometheus and the bucket both hang off the bottom edge at different x, which
 * is what removes the crossing the previous version had between them. Terraform
 * then sits under both the bucket and the database.
 * -------------------------------------------------------------------------- */

const APP = { x: 780, y: 450, w: 420, h: 200 };
const CLAUDE = { x: 780, y: 160, w: 380, h: 130 };
const DB = { x: 1520, y: 450, w: 360, h: 210 };
const S3 = { x: 1040, y: 800, w: 340, h: 200 };
const PROM = { x: 620, y: 800, w: 340, h: 140 };
const GRAF = { x: 620, y: 1060, w: 330, h: 140 };
const TF = { x: 1280, y: 1330, w: 740, h: 150 };

const BOX = { x: 390, y: 280, w: 1390, h: 920 };

const top = (n) => n.y - n.h / 2;
const bottom = (n) => n.y + n.h / 2;
const left = (n) => n.x - n.w / 2;
const right = (n) => n.x + n.w / 2;

// The two points on the app's bottom edge, far enough apart that the vertical
// lines below the app never meet.
const SCRAPE_X = 680;
const PHOTO_X = 950;

const parts = [];

// Compose owns everything except Claude (a third-party API) and Terraform (a
// tool that provisions into the box rather than running inside it).
parts.push(groupBox(BOX.x, BOX.y, BOX.w, BOX.h, "docker compose"));

// ---- edges first, so the nodes paint over the line ends ----
parts.push(edge([210, 390], [left(APP), 415]));
parts.push(edge([210, 570], [left(APP), 500]));

parts.push(edge([right(APP), APP.y], [left(DB), DB.y], { accent: true }));
parts.push(
  edgeLabel((right(APP) + left(DB)) / 2, APP.y - 26, "queries", {
    anchor: "middle",
  }),
);

parts.push(edge([APP.x, top(APP)], [CLAUDE.x, bottom(CLAUDE)], { dash: "8 6" }));
parts.push(edgeLabel(APP.x + 20, (top(APP) + bottom(CLAUDE)) / 2, "drafts listing copy"));

parts.push(edge([PHOTO_X, bottom(APP)], [PHOTO_X, top(S3)]));
parts.push(edgeLabel(PHOTO_X + 20, (bottom(APP) + top(S3)) / 2, "photos"));

parts.push(edge([SCRAPE_X, top(PROM)], [SCRAPE_X, bottom(APP)]));
parts.push(
  edgeLabel(SCRAPE_X - 20, (bottom(APP) + top(PROM)) / 2, "scrapes /api/metrics", {
    anchor: "end",
  }),
);

parts.push(edge([GRAF.x, top(GRAF)], [GRAF.x, bottom(PROM)]));

parts.push(edge([S3.x, top(TF)], [S3.x, bottom(S3)]));
parts.push(edgeLabel(S3.x + 20, (bottom(S3) + top(TF)) / 2, "bucket + policy"));

parts.push(edge([DB.x, top(TF)], [DB.x, bottom(DB)]));
parts.push(edgeLabel(DB.x + 20, 900, "roles + grants"));

// ---- nodes ----
parts.push(person(170, 390, "Guest"));
parts.push(person(170, 570, "Host"));

parts.push(
  rrect(APP.x, APP.y, APP.w, APP.h, "Next.js app\nGraphQL + metrics\n:3000", {
    fill: ACCENT,
    stroke: ACCENT,
    tcolor: ON_ACCENT,
    port: ON_ACCENT,
    size: 22,
  }),
);
parts.push(
  rrect(CLAUDE.x, CLAUDE.y, CLAUDE.w, CLAUDE.h, "Claude API\nlisting agent", {
    size: 22,
    dash: "8 6",
  }),
);
parts.push(
  cylinder(DB.x, DB.y, DB.w, DB.h, "PostgreSQL 16\nexclusion constraint\n:5433", { size: 21 }),
);
parts.push(
  cylinder(S3.x, S3.y, S3.w, S3.h, "S3 (LocalStack)\nlisting photos\n:4566", {
    size: 21,
  }),
);
parts.push(rrect(PROM.x, PROM.y, PROM.w, PROM.h, "Prometheus\n:9090", { size: 22 }));
parts.push(rrect(GRAF.x, GRAF.y, GRAF.w, GRAF.h, "Grafana\n:3001", { size: 22 }));
parts.push(rrect(TF.x, TF.y, TF.w, TF.h, "Terraform", { size: 24 }));

const W = 1880;
const H = 1500;

/*
 * data-inline tells the Architecture component to put this file in the page
 * rather than load it through an <img>, which is what lets the var(--color-…)
 * fills above resolve against the site's theme. It is opt-in per file because
 * inlining also exposes a diagram to the page's inherited styles, and a
 * generated diagram whose boxes were measured against a different font would
 * have its labels clipped.
 *
 * Every text node here names its own font for the same reason: inside the
 * page, an unspecified font-family would inherit the site's sans and change
 * the metrics this layout was drawn against.
 */
const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" data-inline="true" role="img" aria-labelledby="fjordstay-arch-title fjordstay-arch-desc">
<title id="fjordstay-arch-title">Fjordstay infrastructure</title>
<desc id="fjordstay-arch-desc">Guests and hosts reach a Next.js app serving GraphQL on port 3000. The app queries PostgreSQL 16, which holds the booking overlap exclusion constraint, on port 5433; reads listing photos from an S3 bucket served by LocalStack on port 4566; and calls the Claude API to draft listing copy. Prometheus on port 9090 scrapes the app's metrics endpoint, and Grafana on port 3001 reads Prometheus. All of those run in one docker compose stack. Terraform sits outside it and provisions the database roles and the bucket policy.</desc>
<defs>
  <marker id="arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M 0 0 L 10 5 L 0 10 z" fill="${LINE}"/></marker>
  <marker id="arrowAccent" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M 0 0 L 10 5 L 0 10 z" fill="${ACCENT}"/></marker>
</defs>
${parts.join("\n")}
</svg>`;

await fs.mkdir(outDir, { recursive: true });
await fs.writeFile(path.join(outDir, "architecture.svg"), svg, "utf8");
console.log(`Wrote ${path.relative(root, outDir)}/architecture.svg  ${W}x${H}`);
