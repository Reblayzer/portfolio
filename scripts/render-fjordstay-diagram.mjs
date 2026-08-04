// Renders the Fjordstay infrastructure diagram to an inline SVG for the case
// study page. Hand-composed on a fixed grid, same palette and shape helpers as
// the WagerLedger and BunkerFlow diagrams, so the set reads as one system.
//
// Only the SVG is written here — the Fjordstay cover is a screenshot of the
// real frontend (scripts/render-fjordstay-cover.mjs), not a diagram.
//
//   node scripts/render-fjordstay-diagram.mjs
import fs from "node:fs/promises";
import path from "node:path";

const root = process.cwd();
const slug = "fjordstay";
const outDir = path.join(root, "public", "projects", slug);

// ---- palette (matches the site) ----
const INK = "#0a0a0a";
const MUTED = "#52525b";
const LINE = "#71717a";
const ACCENT = "#2563eb";
const BORDER = "#e5e7eb";
const GROUP = "#fafafa";
const WHITE = "#ffffff";
const MONO = `ui-monospace, "SF Mono", "JetBrains Mono", "Cascadia Code", Menlo, monospace`;

// ---- shape helpers ----
const esc = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

function nodeLabel(cx, cy, text, { color = INK, size = 23, weight = 700 } = {}) {
  const lines = String(text).split("\n");
  const lh = size * 1.15;
  const start = cy - ((lines.length - 1) * lh) / 2;
  const spans = lines
    .map((ln, i) => `<tspan x="${cx}" y="${start + i * lh}">${esc(ln)}</tspan>`)
    .join("");
  return `<text font-family='${MONO}' font-size="${size}" font-weight="${weight}" fill="${color}" text-anchor="middle" dominant-baseline="central">${spans}</text>`;
}

function rrect(
  cx,
  cy,
  w,
  h,
  label,
  { fill = WHITE, stroke = INK, tcolor = INK, sw = 2.5, r = 12, size = 23, dash = null } = {},
) {
  const x = cx - w / 2;
  const y = cy - h / 2;
  const dashAttr = dash ? ` stroke-dasharray="${dash}"` : "";
  return `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${r}" fill="${fill}" stroke="${stroke}" stroke-width="${sw}"${dashAttr}/>${nodeLabel(cx, cy, label, { color: tcolor, size })}`;
}

function cylinder(cx, cy, w, h, label, { stroke = ACCENT, size = 22 } = {}) {
  const x = cx - w / 2;
  const y = cy - h / 2;
  const ry = w * 0.13;
  const d = [
    `M ${x} ${y + ry}`,
    `A ${w / 2} ${ry} 0 0 0 ${x + w} ${y + ry}`,
    `L ${x + w} ${y + h - ry}`,
    `A ${w / 2} ${ry} 0 0 1 ${x} ${y + h - ry}`,
    `Z`,
  ].join(" ");
  const top = `M ${x} ${y + ry} A ${w / 2} ${ry} 0 0 1 ${x + w} ${y + ry}`;
  return `<path d="${d}" fill="${WHITE}" stroke="${stroke}" stroke-width="2.5"/><path d="${top}" fill="none" stroke="${stroke}" stroke-width="2.5"/>${nodeLabel(cx, cy + ry * 0.6, label, { color: INK, size })}`;
}

function person(cx, cy, label) {
  const headR = 22;
  const head = `<circle cx="${cx}" cy="${cy - 34}" r="${headR}" fill="${WHITE}" stroke="${INK}" stroke-width="2.5"/>`;
  const body = `<path d="M ${cx - 34} ${cy + 26} a 34 34 0 0 1 68 0" fill="${WHITE}" stroke="${INK}" stroke-width="2.5"/>`;
  return `${head}${body}${nodeLabel(cx, cy + 58, label, { size: 21 })}`;
}

function groupBox(x, y, w, h, label) {
  return `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="16" fill="${GROUP}" stroke="${BORDER}" stroke-width="2"/><text x="${x + w / 2}" y="${y + 34}" font-family='${MONO}' font-size="24" fill="${MUTED}" text-anchor="middle">${esc(label)}</text>`;
}

function edge(points, { accent = false, label, lx, ly, dash = null } = {}) {
  const color = accent ? ACCENT : LINE;
  const sw = accent ? 3.5 : 2.5;
  const marker = accent ? "url(#arrowAccent)" : "url(#arrow)";
  const dashAttr = dash ? ` stroke-dasharray="${dash}"` : "";
  const d = points.map((p, i) => `${i === 0 ? "M" : "L"} ${p[0]} ${p[1]}`).join(" ");
  let labelSvg = "";
  if (label) {
    const w = label.length * 11 + 26;
    labelSvg = `<rect x="${lx - w / 2}" y="${ly - 19}" width="${w}" height="34" rx="6" fill="${WHITE}"/><text x="${lx}" y="${ly}" font-family='${MONO}' font-size="19" font-style="italic" fill="${MUTED}" text-anchor="middle" dominant-baseline="central">${esc(label)}</text>`;
  }
  return `<path d="${d}" fill="none" stroke="${color}" stroke-width="${sw}"${dashAttr} marker-end="${marker}"/>${labelSvg}`;
}

/* ---- layout ----------------------------------------------------------------
 * Three bands, so nothing has to cross anything:
 *   runtime    app -> Postgres, app -> photo bucket, app -> Claude
 *   observing  Prometheus scrapes the app, Grafana reads Prometheus
 *   provision  Terraform, outside the Compose box, reaching into it
 * -------------------------------------------------------------------------- */

const APP = { x: 620, y: 340, w: 400, h: 190 };
const DB = { x: 1300, y: 340, w: 320, h: 200 };
const S3 = { x: 1300, y: 640, w: 320, h: 180 };
const CLAUDE = { x: 1960, y: 340, w: 340, h: 150 };
const PROM = { x: 620, y: 880, w: 380, h: 140 };
const GRAF = { x: 1050, y: 880, w: 320, h: 140 };
const TF = { x: 1000, y: 1210, w: 440, h: 150 };

const parts = [];

// Compose owns everything except Claude (a third-party API) and Terraform
// (a tool that provisions into the box rather than running in it).
parts.push(groupBox(380, 90, 1250, 970, "docker compose"));

// ---- edges first, so nodes paint over the line ends ----
parts.push(
  edge([
    [218, 250],
    [APP.x - APP.w / 2, 300],
  ]),
);
parts.push(
  edge([
    [218, 430],
    [APP.x - APP.w / 2, 380],
  ]),
);

parts.push(
  edge(
    [
      [APP.x + APP.w / 2, 340],
      [DB.x - DB.w / 2, 340],
    ],
    { accent: true, label: "queries", lx: 980, ly: 315 },
  ),
);

parts.push(
  edge(
    [
      [560, APP.y + APP.h / 2],
      [560, S3.y],
      [S3.x - S3.w / 2, S3.y],
    ],
    { label: "photos", lx: 880, ly: 615 },
  ),
);

// Up and over the data stores rather than threading between them.
parts.push(
  edge(
    [
      [APP.x, APP.y - APP.h / 2],
      [APP.x, 150],
      [CLAUDE.x, 150],
      [CLAUDE.x, CLAUDE.y - CLAUDE.h / 2],
    ],
    { label: "drafts listing copy", lx: 1460, ly: 128 },
  ),
);

parts.push(
  edge(
    [
      [700, PROM.y - PROM.h / 2],
      [700, APP.y + APP.h / 2],
    ],
    { label: "scrapes /api/metrics", lx: 700, ly: 762 },
  ),
);

parts.push(
  edge([
    [GRAF.x - GRAF.w / 2, 880],
    [PROM.x + PROM.w / 2, 880],
  ]),
);

parts.push(
  edge(
    [
      [1150, TF.y - TF.h / 2],
      [1150, 1100],
      [S3.x, 1100],
      [S3.x, S3.y + S3.h / 2],
    ],
    { label: "bucket + policy", lx: 1420, ly: 1100 },
  ),
);
parts.push(
  edge(
    [
      [TF.x + TF.w / 2, TF.y],
      [1720, TF.y],
      [1720, 340],
      [DB.x + DB.w / 2, 340],
    ],
    { label: "roles + grants", lx: 1720, ly: 700 },
  ),
);

// ---- nodes ----
parts.push(person(150, 250, "Guest"));
parts.push(person(150, 430, "Host"));

parts.push(
  rrect(APP.x, APP.y, APP.w, APP.h, "Next.js app\nGraphQL + metrics\n:3000", {
    fill: ACCENT,
    stroke: ACCENT,
    tcolor: WHITE,
    size: 22,
  }),
);
parts.push(cylinder(DB.x, DB.y, DB.w, DB.h, "PostgreSQL 16\nexclusion constraint", { size: 21 }));
parts.push(cylinder(S3.x, S3.y, S3.w, S3.h, "S3 (LocalStack)\nlisting photos", { size: 21 }));
parts.push(
  rrect(CLAUDE.x, CLAUDE.y, CLAUDE.w, CLAUDE.h, "Claude API\nlisting agent", {
    size: 22,
    dash: "8 6",
  }),
);
parts.push(rrect(PROM.x, PROM.y, PROM.w, PROM.h, "Prometheus\n:9090", { size: 22 }));
parts.push(rrect(GRAF.x, GRAF.y, GRAF.w, GRAF.h, "Grafana\n:3001", { size: 22 }));
parts.push(rrect(TF.x, TF.y, TF.w, TF.h, "Terraform", { size: 24 }));

const W = 2240;
const H = 1360;
const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}">
<defs>
  <marker id="arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M 0 0 L 10 5 L 0 10 z" fill="${LINE}"/></marker>
  <marker id="arrowAccent" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M 0 0 L 10 5 L 0 10 z" fill="${ACCENT}"/></marker>
</defs>
${parts.join("\n")}
</svg>`;

await fs.mkdir(outDir, { recursive: true });
await fs.writeFile(path.join(outDir, "architecture.svg"), svg, "utf8");
console.log(`Wrote ${path.relative(root, outDir)}/architecture.svg  ${W}x${H}`);
