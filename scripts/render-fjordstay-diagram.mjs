// Renders the Fjordstay infrastructure diagram.
//
//   node scripts/render-fjordstay-diagram.mjs
//
// Only the SVG is written here — the Fjordstay cover is a screenshot of the
// real frontend (scripts/render-fjordstay-cover.mjs), not a diagram.
//
// Shapes, palette and the two layout rules live in scripts/lib/diagram.mjs.
// Here that means every edge is a single straight line and none of them cross;
// the node positions follow from that. Terraform sits directly beneath both the
// bucket and the database so both of its edges are vertical, which is also why
// it is a wide box.
import fs from "node:fs/promises";
import path from "node:path";
import {
  ACCENT,
  ON_ACCENT,
  bottom,
  cylinder,
  document,
  edge,
  edgeLabel,
  groupBox,
  left,
  person,
  right,
  rrect,
  top,
} from "./lib/diagram.mjs";

const root = process.cwd();
const slug = "fjordstay";
const outDir = path.join(root, "public", "projects", slug);

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
 * is what removes the crossing between them. Terraform then sits under both the
 * bucket and the database.
 * -------------------------------------------------------------------------- */

const APP = { x: 780, y: 450, w: 420, h: 200 };
const CLAUDE = { x: 780, y: 160, w: 380, h: 130 };
const DB = { x: 1520, y: 450, w: 360, h: 210 };
const S3 = { x: 1040, y: 800, w: 340, h: 200 };
const PROM = { x: 620, y: 800, w: 340, h: 140 };
const GRAF = { x: 620, y: 1060, w: 330, h: 140 };
const TF = { x: 1280, y: 1330, w: 740, h: 150 };

const BOX = { x: 390, y: 280, w: 1390, h: 920 };

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
  cylinder(DB.x, DB.y, DB.w, DB.h, "PostgreSQL 16\nexclusion constraint\n:5433", {
    size: 21,
  }),
);
parts.push(
  cylinder(S3.x, S3.y, S3.w, S3.h, "S3 (LocalStack)\nlisting photos\n:4566", {
    size: 21,
  }),
);
parts.push(rrect(PROM.x, PROM.y, PROM.w, PROM.h, "Prometheus\n:9090", { size: 22 }));
parts.push(rrect(GRAF.x, GRAF.y, GRAF.w, GRAF.h, "Grafana\n:3001", { size: 22 }));
parts.push(rrect(TF.x, TF.y, TF.w, TF.h, "Terraform", { size: 24 }));

const svg = document({
  width: 1880,
  height: 1500,
  id: "fjordstay-arch",
  title: "Fjordstay infrastructure",
  desc: "Guests and hosts reach a Next.js app serving GraphQL on port 3000. The app queries PostgreSQL 16, which holds the booking overlap exclusion constraint, on port 5433; reads listing photos from an S3 bucket served by LocalStack on port 4566; and calls the Claude API to draft listing copy. Prometheus on port 9090 scrapes the app's metrics endpoint, and Grafana on port 3001 reads Prometheus. All of those run in one docker compose stack. Terraform sits outside it and provisions the database roles and the bucket policy.",
  parts,
});

await fs.mkdir(outDir, { recursive: true });
await fs.writeFile(path.join(outDir, "architecture.svg"), svg, "utf8");
console.log(`Wrote ${path.relative(root, outDir)}/architecture.svg`);
