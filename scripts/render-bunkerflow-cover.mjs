import fs from "node:fs/promises";
import path from "node:path";
import { chromium } from "playwright";

const root = process.cwd();
const slug = "bunkerflow";
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

function rrect(cx, cy, w, h, label, { fill = WHITE, stroke = INK, tcolor = INK, sw = 2.5, r = 12, size = 23 } = {}) {
  const x = cx - w / 2;
  const y = cy - h / 2;
  return `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${r}" fill="${fill}" stroke="${stroke}" stroke-width="${sw}"/>${nodeLabel(cx, cy, label, { color: tcolor, size })}`;
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

function queue(cx, cy, w, h, label, { stroke = INK, size = 22 } = {}) {
  const x = cx - w / 2;
  const y = cy - h / 2;
  const rx = h * 0.16;
  const d = [
    `M ${x + rx} ${y}`,
    `L ${x + w - rx} ${y}`,
    `A ${rx} ${h / 2} 0 0 1 ${x + w - rx} ${y + h}`,
    `L ${x + rx} ${y + h}`,
    `A ${rx} ${h / 2} 0 0 1 ${x + rx} ${y}`,
    `Z`,
  ].join(" ");
  const cap = `M ${x + w - rx} ${y} A ${rx} ${h / 2} 0 0 0 ${x + w - rx} ${y + h}`;
  return `<path d="${d}" fill="${WHITE}" stroke="${stroke}" stroke-width="2.5"/><path d="${cap}" fill="none" stroke="${stroke}" stroke-width="2.5"/>${nodeLabel(cx - rx * 0.5, cy, label, { size })}`;
}

function groupBox(x, y, w, h, label) {
  return `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="16" fill="${GROUP}" stroke="${BORDER}" stroke-width="2"/><text x="${x + w / 2}" y="${y + 36}" font-family='${MONO}' font-size="24" fill="${MUTED}" text-anchor="middle">${esc(label)}</text>`;
}

function edge(points, { accent = false, label, lx, ly } = {}) {
  const color = accent ? ACCENT : LINE;
  const sw = accent ? 3.5 : 2.5;
  const marker = accent ? "url(#arrowAccent)" : "url(#arrow)";
  const d = points.map((p, i) => `${i === 0 ? "M" : "L"} ${p[0]} ${p[1]}`).join(" ");
  let labelSvg = "";
  if (label) {
    const w = label.length * 11 + 26;
    labelSvg = `<rect x="${lx - w / 2}" y="${ly - 19}" width="${w}" height="34" rx="6" fill="${WHITE}"/><text x="${lx}" y="${ly}" font-family='${MONO}' font-size="19" font-style="italic" fill="${MUTED}" text-anchor="middle" dominant-baseline="central">${esc(label)}</text>`;
  }
  return `<path d="${d}" fill="none" stroke="${color}" stroke-width="${sw}" marker-end="${marker}"/>${labelSvg}`;
}

// ---- layout ----
// Four bands left to right: the source systems, the gateway (its three
// adapters and the one pipeline they all converge on), the bus, and the
// landing stores. That convergence is the architectural argument, so it sits
// in the middle and is the only filled shape.
// Kept as narrow as the content allows: the cover scales the whole drawing to
// fit 16:9, so every unit of width costs type size in the rendered PNG.
const COL_SRC = 270;
const COL_ADAPT = 740;
const COL_PIPE = 1310;
const COL_BUS = 1870;
const COL_LAND = 2340;

const SRC_W = 380, SRC_H = 118;
const ADAPT_W = 320, ADAPT_H = 110;
const PIPE_W = 420, PIPE_H = 210;
const BUS_W = 300, BUS_H = 136;
const DB_W = 180, DB_H = 186;

// Group boxes
const BOX_TOP = 200;
const BOX_H = 1160;

// Source rows
const Y_DESK = 350;
const Y_ERP = 610;
const Y_TELEMETRY = 950;
const Y_PUSH = 1210;

// Adapter rows: batch serves the two REST sources, so it sits between them.
const Y_BATCH = 480;
const Y_KAFKA = 950;
const Y_API = 1210;

const Y_PIPE = 790;
const Y_TOPIC = 480;
const Y_DLQ = 1180;

const Y_LANDWORKER = 480;
const Y_STORES = 830;
const Y_DBX = 1190;

const parts = [];

// Group containers
parts.push(groupBox(60, BOX_TOP, 420, BOX_H, "Source systems (simulated)"));
parts.push(groupBox(540, BOX_TOP, 1040, BOX_H, "Ingestion gateway"));
parts.push(groupBox(1690, BOX_TOP, 360, BOX_H, "Azure Service Bus"));
parts.push(groupBox(2130, BOX_TOP, 420, BOX_H, "Landing"));

// ---- edges (drawn under the nodes) ----
const srcR = COL_SRC + SRC_W / 2;
const adaptL = COL_ADAPT - ADAPT_W / 2;
const adaptR = COL_ADAPT + ADAPT_W / 2;
const pipeL = COL_PIPE - PIPE_W / 2;
const pipeR = COL_PIPE + PIPE_W / 2;
const busL = COL_BUS - BUS_W / 2;

// sources -> adapters
parts.push(edge([[srcR, Y_DESK], [adaptL - 60, Y_DESK], [adaptL - 60, Y_BATCH - 26], [adaptL, Y_BATCH - 26]]));
parts.push(edge([[srcR, Y_ERP], [adaptL - 60, Y_ERP], [adaptL - 60, Y_BATCH + 26], [adaptL, Y_BATCH + 26]]));
parts.push(edge([[srcR, Y_TELEMETRY], [adaptL, Y_TELEMETRY]]));
parts.push(edge([[srcR, Y_PUSH], [adaptL, Y_PUSH]]));

// adapters -> the one pipeline
// Labels sit on the horizontal run before the bend, never over it.
parts.push(edge([[adaptR, Y_BATCH], [pipeL - 70, Y_BATCH], [pipeL - 70, Y_PIPE - 48], [pipeL, Y_PIPE - 48]], { accent: true, label: "batch", lx: adaptR + 62, ly: Y_BATCH - 24 }));
parts.push(edge([[adaptR, Y_KAFKA], [pipeL - 70, Y_KAFKA], [pipeL - 70, Y_PIPE + 12], [pipeL, Y_PIPE + 12]], { accent: true, label: "stream", lx: adaptR + 62, ly: Y_KAFKA - 24 }));
parts.push(edge([[adaptR, Y_API], [pipeL - 70, Y_API], [pipeL - 70, Y_PIPE + 62], [pipeL, Y_PIPE + 62]], { accent: true, label: "push", lx: adaptR + 62, ly: Y_API - 24 }));

// pipeline -> bus
parts.push(edge([[pipeR, Y_PIPE - 40], [busL - 45, Y_PIPE - 40], [busL - 45, Y_TOPIC], [busL, Y_TOPIC]], { accent: true, label: "accepted", lx: pipeR + 55, ly: Y_PIPE - 64 }));
parts.push(edge([[pipeR, Y_PIPE + 50], [busL - 45, Y_PIPE + 50], [busL - 45, Y_DLQ], [busL, Y_DLQ]], { label: "rejected", lx: pipeR + 55, ly: Y_PIPE + 26 }));

// topic -> landing worker
parts.push(edge([[COL_BUS + BUS_W / 2, Y_TOPIC], [COL_LAND - 160, Y_TOPIC]], { accent: true }));

// landing worker -> the two stores
const PG_X = COL_LAND - 105;
const PARQUET_X = COL_LAND + 105;
parts.push(edge([[PG_X, Y_LANDWORKER + 55], [PG_X, Y_STORES - DB_H / 2]]));
parts.push(edge([[PARQUET_X, Y_LANDWORKER + 55], [PARQUET_X, Y_STORES - DB_H / 2]]));

// parquet -> databricks
parts.push(edge([[PARQUET_X, Y_STORES + DB_H / 2], [PARQUET_X, Y_DBX - 130], [COL_LAND, Y_DBX - 130], [COL_LAND, Y_DBX - 55]]));

// ---- nodes ----
parts.push(rrect(COL_SRC, Y_DESK, SRC_W, SRC_H, "Trading desk\nREST, camelCase", { size: 24 }));
parts.push(rrect(COL_SRC, Y_ERP, SRC_W, SRC_H, "ERP\nREST, snake_case", { size: 24 }));
parts.push(rrect(COL_SRC, Y_TELEMETRY, SRC_W, SRC_H, "Port telemetry\nKafka topic", { size: 24 }));
parts.push(rrect(COL_SRC, Y_PUSH, SRC_W, SRC_H, "Any system\nPOST /ingest", { size: 24 }));

parts.push(rrect(COL_ADAPT, Y_BATCH, ADAPT_W, ADAPT_H, "Batch puller\nscheduled", { size: 24 }));
parts.push(rrect(COL_ADAPT, Y_KAFKA, ADAPT_W, ADAPT_H, "Kafka consumer", { size: 24 }));
parts.push(rrect(COL_ADAPT, Y_API, ADAPT_W, ADAPT_H, "REST gateway", { size: 24 }));

parts.push(rrect(COL_PIPE, Y_PIPE, PIPE_W, PIPE_H, "Ingestion pipeline\n\nnormalize · validate\ndedupe · publish", {
  fill: ACCENT, stroke: ACCENT, tcolor: WHITE, size: 25,
}));

parts.push(queue(COL_BUS, Y_TOPIC, BUS_W, BUS_H, "Topic", { stroke: ACCENT, size: 26 }));
parts.push(queue(COL_BUS, Y_DLQ, BUS_W, BUS_H, "Dead letter", { size: 24 }));

parts.push(rrect(COL_LAND, Y_LANDWORKER, 320, 110, "Landing worker", { size: 24 }));
parts.push(cylinder(PG_X, Y_STORES, DB_W, DB_H, "Postgres", { size: 24 }));
parts.push(cylinder(PARQUET_X, Y_STORES, DB_W, DB_H, "Parquet", { size: 24 }));
parts.push(rrect(COL_LAND, Y_DBX, 320, 110, "Databricks\nDelta tables", { size: 24 }));

// The canvas hugs the drawing: content runs from BOX_TOP to BOX_TOP + BOX_H,
// so it is shifted up to leave an even margin instead of a band of dead space
// top and bottom once the cover scales it to fit.
const MARGIN = 70;
const SHIFT = BOX_TOP - MARGIN;
const W = 2610;
const H = BOX_H + MARGIN * 2;
const diagramSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}">
<defs>
  <marker id="arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M 0 0 L 10 5 L 0 10 z" fill="${LINE}"/></marker>
  <marker id="arrowAccent" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M 0 0 L 10 5 L 0 10 z" fill="${ACCENT}"/></marker>
</defs>
<g transform="translate(0, ${-SHIFT})">
${parts.join("\n")}
</g>
</svg>`;

await fs.mkdir(outDir, { recursive: true });
await fs.writeFile(path.join(outDir, "architecture.svg"), diagramSvg, "utf8");

// ---- compose the 16:9 cover (diagram only; the page supplies title + tech) ----
const COVER_W = 1600;
const COVER_H = 900;
const html = `<!doctype html><html><head><meta charset="utf-8"><style>
  html, body { margin: 0; padding: 0; background: #ffffff; }
  .cover {
    width: ${COVER_W}px; height: ${COVER_H}px; box-sizing: border-box; padding: 48px 56px;
    display: flex; align-items: center; justify-content: center; background: #ffffff;
  }
  .cover svg { max-width: 100%; max-height: 100%; width: auto; height: auto; }
</style></head><body>
  <div class="cover">${diagramSvg}</div>
</body></html>`;

const browser = await chromium.launch();
try {
  // 3x rather than 2x: this diagram is wider than the others, so it scales
  // down further to fit and its type needs the extra device pixels to stay
  // crisp on a high-DPI screen.
  const page = await browser.newPage({ viewport: { width: COVER_W, height: COVER_H }, deviceScaleFactor: 3 });
  await page.setContent(html, { waitUntil: "networkidle" });
  const cover = await page.$(".cover");
  await cover.screenshot({ path: path.join(outDir, "cover.png") });
} finally {
  await browser.close();
}

console.log(`Wrote ${path.relative(root, outDir)}/architecture.svg and cover.png`);
