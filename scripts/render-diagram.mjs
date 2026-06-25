// Renders the WagerLedger architecture diagram to an inline SVG and a 16:9 PNG
// cover. The diagram is hand-composed on a fixed grid so the layout is exact:
// equal Write/Read boxes, a perfectly straight query line, and the
// Wallet/Projector/Watcher nodes aligned in one column.
//   node scripts/render-diagram.mjs
import fs from "node:fs/promises";
import path from "node:path";
import { chromium } from "playwright";

const root = process.cwd();
const slug = "wagerledger";
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

function cylinder(cx, cy, w, h, label, { stroke = ACCENT } = {}) {
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
  return `<path d="${d}" fill="${WHITE}" stroke="${stroke}" stroke-width="2.5"/><path d="${top}" fill="none" stroke="${stroke}" stroke-width="2.5"/>${nodeLabel(cx, cy + ry * 0.6, label, { color: INK, size: 22 })}`;
}

function queue(cx, cy, w, h, label) {
  // horizontal cylinder (a la message queue)
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
  return `<path d="${d}" fill="${WHITE}" stroke="${INK}" stroke-width="2.5"/><path d="${cap}" fill="none" stroke="${INK}" stroke-width="2.5"/>${nodeLabel(cx - rx * 0.5, cy, label, { size: 22 })}`;
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

// ---- layout (fixed grid, generous spacing) ----
// Columns
const COL_PROC = 1480; // Wallet / Projector / Watcher (aligned)
const COL_DB = 2010; // KurrentDB / SQL Server (aligned)
const BOX_X = 1320;
const BOX_W = 820;
// Rows
const Y_SPINE = 550; // Client, API, RabbitMQ, Watcher share this level
const Y_WALLET = 170, Y_KURRENT = 350;
const Y_PROJECTOR = 730, Y_SQL = 915;
const WRITE_Y = 85;
const READ_Y = 645;
const BOX_H = 375;

// node geometry (generous internal padding around the text)
const PROC_W = 290, PROC_H = 104;
const DB_W = 185, DB_H = 172;
const RMQ_X = 955, RMQ_W = 205, RMQ_H = 128;
const API_X = 480, API_W = 280, API_H = 128;
const PROC_L = COL_PROC - PROC_W / 2; // 1345
const PROC_R = COL_PROC + PROC_W / 2; // 1615
const API_TOP = Y_SPINE - API_H / 2;
const API_BOTTOM = Y_SPINE + API_H / 2;
const DB_TOP_K = Y_KURRENT - DB_H / 2; // KurrentDB top
const DB_TOP_S = Y_SQL - DB_H / 2; // SQL top

const parts = [];

// Containers (equal size, stacked, aligned)
parts.push(groupBox(BOX_X, WRITE_Y, BOX_W, BOX_H, "Write side"));
parts.push(groupBox(BOX_X, READ_Y, BOX_W, BOX_H, "Read side"));

// Edges first (under nodes). Every final approach is a long straight segment,
// and no two arrows cross or overlap.
// command: Client -> API (straight, spine level)
parts.push(edge([[190, Y_SPINE], [API_X - API_W / 2, Y_SPINE]], { label: "command", lx: 250, ly: Y_SPINE - 20 }));
// publish: API -> RabbitMQ (straight, spine level)
parts.push(edge([[API_X + API_W / 2, Y_SPINE], [RMQ_X - RMQ_W / 2, Y_SPINE]], { label: "publish", lx: 730, ly: Y_SPINE - 20 }));
// deposits: RabbitMQ -> Watcher (straight, spine level)
parts.push(edge([[RMQ_X + RMQ_W / 2, Y_SPINE], [PROC_L, Y_SPINE]], { label: "deposits", lx: 1195, ly: Y_SPINE - 20 }));
// load + replay: API top -> up -> long right into Wallet left
parts.push(edge([[450, API_TOP], [450, Y_WALLET], [PROC_L, Y_WALLET]], { label: "load + replay", lx: 840, ly: Y_WALLET - 20 }));
// queries: API bottom -> down -> long right into SQL left (one corner)
parts.push(edge([[510, API_BOTTOM], [510, Y_SQL], [COL_DB - DB_W / 2, Y_SQL]], { accent: true, label: "queries", lx: 1180, ly: Y_SQL - 20 }));
// all events: RabbitMQ bottom -> down -> long right into Projector left
parts.push(edge([[RMQ_X, API_BOTTOM], [RMQ_X, Y_PROJECTOR], [PROC_L, Y_PROJECTOR]], { label: "all events", lx: 1250, ly: Y_PROJECTOR - 20 }));
// append events: Wallet right -> right -> long down into KurrentDB top
parts.push(edge([[PROC_R, Y_WALLET], [COL_DB, Y_WALLET], [COL_DB, DB_TOP_K]], { label: "append events", lx: 1810, ly: Y_WALLET - 20 }));
// project: Projector right -> right -> long down into SQL top
parts.push(edge([[PROC_R, Y_PROJECTOR], [COL_DB, Y_PROJECTOR], [COL_DB, DB_TOP_S]], { label: "project", lx: 1830, ly: Y_PROJECTOR - 20 }));

// Nodes
parts.push(person(150, Y_SPINE, "Client"));
parts.push(rrect(API_X, Y_SPINE, API_W, API_H, "ASP.NET Core API", { fill: ACCENT, stroke: ACCENT, tcolor: WHITE }));
parts.push(queue(RMQ_X, Y_SPINE, RMQ_W, RMQ_H, "RabbitMQ"));
parts.push(rrect(COL_PROC, Y_SPINE, PROC_W, PROC_H, "Deposit-limit\nwatcher", { size: 22 }));
// write side contents
parts.push(rrect(COL_PROC, Y_WALLET, PROC_W, PROC_H, "Wallet aggregate"));
parts.push(cylinder(COL_DB, Y_KURRENT, DB_W, DB_H, "KurrentDB"));
// read side contents
parts.push(rrect(COL_PROC, Y_PROJECTOR, PROC_W, PROC_H, "Projector"));
parts.push(cylinder(COL_DB, Y_SQL, DB_W, DB_H, "SQL Server"));

const W = 2280;
const H = 1110;
const diagramSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}">
<defs>
  <marker id="arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M 0 0 L 10 5 L 0 10 z" fill="${LINE}"/></marker>
  <marker id="arrowAccent" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M 0 0 L 10 5 L 0 10 z" fill="${ACCENT}"/></marker>
</defs>
${parts.join("\n")}
</svg>`;

await fs.mkdir(outDir, { recursive: true });
await fs.writeFile(path.join(outDir, "architecture.svg"), diagramSvg, "utf8");

// ---- compose the 16:9 cover (diagram only; the page supplies title + tech) ----
const COVER_W = 1600;
const COVER_H = 900;
const html = `<!doctype html><html><head><meta charset="utf-8"><style>
  html, body { margin: 0; padding: 0; background: #ffffff; }
  .cover {
    width: ${COVER_W}px; height: ${COVER_H}px; box-sizing: border-box; padding: 56px 64px;
    display: flex; align-items: center; justify-content: center; background: #ffffff;
  }
  .cover svg { max-width: 100%; max-height: 100%; width: auto; height: auto; }
</style></head><body>
  <div class="cover">${diagramSvg}</div>
</body></html>`;

const browser = await chromium.launch();
try {
  const page = await browser.newPage({ viewport: { width: COVER_W, height: COVER_H }, deviceScaleFactor: 2 });
  await page.setContent(html, { waitUntil: "networkidle" });
  const cover = await page.$(".cover");
  await cover.screenshot({ path: path.join(outDir, "cover.png") });
} finally {
  await browser.close();
}

console.log(`Wrote ${path.relative(root, outDir)}/architecture.svg and cover.png`);
