// Renders the WagerLedger architecture diagram, and the 16:9 cover PNG built
// from it.
//
//   node scripts/render-diagram.mjs
//
// Shapes, palette and the two layout rules live in scripts/lib/diagram.mjs.
// Here that means all eight edges are single straight lines and none of them
// cross — the previous version routed five of them through corners.
import fs from "node:fs/promises";
import path from "node:path";
import { chromium } from "playwright";
import {
  ACCENT,
  LIGHT_VARS,
  ON_ACCENT,
  bottom,
  cylinder,
  document,
  edge,
  edgeLabel,
  groupBox,
  left,
  person,
  queue,
  right,
  rrect,
  top,
} from "./lib/diagram.mjs";

const root = process.cwd();
const slug = "wagerledger";
const outDir = path.join(root, "public", "projects", slug);

/* ---- layout ----------------------------------------------------------------
 *   write   Wallet aggregate ——→ KurrentDB
 *              ↑
 *   spine   Client → API ——→ RabbitMQ ——→ Deposit-limit watcher
 *              ↓                ↓
 *   read    SQL Server ←—— Projector
 *
 * The CQRS split read top to bottom, and the API is the hub: the client
 * arrives from the left, the broker leaves to the right, the write side is
 * straight up and the read side straight down.
 *
 * The read band flows right to left. That is not decoration — it is what lets
 * the query edge and the projection edge reach the same store from opposite
 * sides instead of being routed around each other.
 * -------------------------------------------------------------------------- */

const Y_WRITE = 260;
const Y_SPINE = 650;
const Y_READ = 1060;

const CLIENT = { x: 200, y: Y_SPINE };
const API = { x: 720, y: Y_SPINE, w: 380, h: 170 };
const RMQ = { x: 1400, y: Y_SPINE, w: 330, h: 170 };
const WATCH = { x: 2020, y: Y_SPINE, w: 380, h: 170 };

const WALLET = { x: 720, y: Y_WRITE, w: 380, h: 150 };
const KURRENT = { x: 1400, y: Y_WRITE, w: 320, h: 190 };

const SQL = { x: 720, y: Y_READ, w: 320, h: 190 };
const PROJ = { x: 1400, y: Y_READ, w: 380, h: 150 };

// Equal bands, aligned — the split is symmetrical and should look it.
const BAND = { x: 470, w: 1190, h: 280 };
const WRITE_BOX = { ...BAND, y: 120 };
const READ_BOX = { ...BAND, y: 920 };

const parts = [];

parts.push(groupBox(WRITE_BOX.x, WRITE_BOX.y, WRITE_BOX.w, WRITE_BOX.h, "Write side"));
parts.push(groupBox(READ_BOX.x, READ_BOX.y, READ_BOX.w, READ_BOX.h, "Read side"));

// ---- edges first, so the nodes paint over the line ends ----
parts.push(edge([250, Y_SPINE], [left(API), Y_SPINE]));
parts.push(edgeLabel((250 + left(API)) / 2, Y_SPINE - 26, "command", { anchor: "middle" }));

parts.push(edge([API.x, top(API)], [WALLET.x, bottom(WALLET)]));
parts.push(edgeLabel(API.x + 20, (top(API) + bottom(WALLET)) / 2, "load + replay"));

parts.push(edge([right(WALLET), Y_WRITE], [left(KURRENT), Y_WRITE]));
parts.push(
  edgeLabel((right(WALLET) + left(KURRENT)) / 2, Y_WRITE - 26, "append events", {
    anchor: "middle",
  }),
);

parts.push(edge([right(API), Y_SPINE], [left(RMQ), Y_SPINE]));
parts.push(
  edgeLabel((right(API) + left(RMQ)) / 2, Y_SPINE - 26, "publish", {
    anchor: "middle",
  }),
);

parts.push(edge([right(RMQ), Y_SPINE], [left(WATCH), Y_SPINE]));
parts.push(
  edgeLabel((right(RMQ) + left(WATCH)) / 2, Y_SPINE - 26, "deposits", {
    anchor: "middle",
  }),
);

parts.push(edge([RMQ.x, bottom(RMQ)], [PROJ.x, top(PROJ)]));
parts.push(edgeLabel(RMQ.x + 20, (bottom(RMQ) + top(PROJ)) / 2, "all events"));

parts.push(edge([left(PROJ), Y_READ], [right(SQL), Y_READ]));
parts.push(
  edgeLabel((left(PROJ) + right(SQL)) / 2, Y_READ - 26, "project", {
    anchor: "middle",
  }),
);

parts.push(edge([API.x, bottom(API)], [SQL.x, top(SQL)], { accent: true }));
parts.push(edgeLabel(API.x - 20, (bottom(API) + top(SQL)) / 2, "queries", { anchor: "end" }));

// ---- nodes ----
parts.push(person(CLIENT.x, CLIENT.y, "Client"));
parts.push(
  rrect(API.x, API.y, API.w, API.h, "ASP.NET Core API", {
    fill: ACCENT,
    stroke: ACCENT,
    tcolor: ON_ACCENT,
  }),
);
parts.push(queue(RMQ.x, RMQ.y, RMQ.w, RMQ.h, "RabbitMQ"));
parts.push(rrect(WATCH.x, WATCH.y, WATCH.w, WATCH.h, "Deposit-limit\nwatcher", { size: 22 }));

parts.push(rrect(WALLET.x, WALLET.y, WALLET.w, WALLET.h, "Wallet aggregate", { size: 22 }));
parts.push(cylinder(KURRENT.x, KURRENT.y, KURRENT.w, KURRENT.h, "KurrentDB"));

parts.push(rrect(PROJ.x, PROJ.y, PROJ.w, PROJ.h, "Projector", { size: 22 }));
parts.push(cylinder(SQL.x, SQL.y, SQL.w, SQL.h, "SQL Server"));

const W = 2320;
const H = 1330;

const diagramSvg = document({
  width: W,
  height: H,
  id: "wagerledger-arch",
  title: "WagerLedger architecture",
  desc: "A client sends commands to an ASP.NET Core API. On the write side the API loads and replays a wallet aggregate, which appends events to KurrentDB. The API publishes to RabbitMQ, which feeds a deposit-limit watcher and a projector. On the read side the projector builds a SQL Server read model, which the API queries directly.",
  parts,
});

await fs.mkdir(outDir, { recursive: true });
await fs.writeFile(path.join(outDir, "architecture.svg"), diagramSvg, "utf8");

/* ---- cover -----------------------------------------------------------------
 * The diagram's colours are theme variables, which resolve against the page it
 * is inlined into. A cover PNG has no page, so the light values are pinned on
 * the wrapper rather than left to the fallbacks — the same result today, but it
 * means the cover cannot drift if a fallback is ever edited.
 * -------------------------------------------------------------------------- */
const COVER_W = 1600;
const COVER_H = 900;
const vars = Object.entries(LIGHT_VARS)
  .map(([name, value]) => `${name}: ${value};`)
  .join(" ");

const html = `<!doctype html><html><head><meta charset="utf-8"><style>
  :root { ${vars} }
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
  const page = await browser.newPage({
    viewport: { width: COVER_W, height: COVER_H },
    deviceScaleFactor: 2,
  });
  await page.setContent(html, { waitUntil: "networkidle" });
  await (await page.$(".cover")).screenshot({ path: path.join(outDir, "cover.png") });
} finally {
  await browser.close();
}

console.log(`Wrote ${path.relative(root, outDir)}/architecture.svg and cover.png`);
