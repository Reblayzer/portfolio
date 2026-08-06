// Renders the BunkerFlow architecture diagram, and the 16:9 cover PNG built
// from it. (The file is named for the cover for historical reasons; it writes
// both, the same way scripts/render-diagram.mjs does for WagerLedger.)
//
//   node scripts/render-bunkerflow-cover.mjs
//
// Shapes, palette and the two layout rules live in scripts/lib/diagram.mjs.
// Nine of this diagram's thirteen edges used to be elbows, almost all of them
// fan-in: four sources into three adapters, three adapters into one pipeline.
// Fan-in does not actually need corners — a diagonal is still a single
// straight line — so the elbows are gone and nothing crosses.
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
  groupBox,
  midLabel,
  left,
  queue,
  right,
  rrect,
  top,
} from "./lib/diagram.mjs";

const root = process.cwd();
const slug = "bunkerflow";
const outDir = path.join(root, "public", "projects", slug);

/* ---- layout ----------------------------------------------------------------
 * Left to right, one band per boundary:
 *
 *   sources ——→ adapters ——→ pipeline ——→ service bus ——→ landing
 *
 * The three adapters converge on a single pipeline, which is the whole point of
 * the design, so the three edges into it are drawn as straight diagonals
 * meeting the same left edge at three different heights. They stay in order
 * along both ends, which is what keeps them from crossing.
 *
 * Databricks sits under Parquet rather than centred in the landing band,
 * because that is what it actually reads.
 * -------------------------------------------------------------------------- */

const COL_SRC = 300;
const COL_ADAPT = 1000;
const COL_PIPE = 1700;
const COL_BUS = 2350;

const Y_DESK = 300;
const Y_ERP = 620;
const Y_TELEMETRY = 940;
const Y_PUSH = 1260;

// The batch puller serves both REST sources, so it sits between them.
const Y_BATCH = 460;
const Y_KAFKA = 940;
const Y_API = 1260;

const Y_PIPE = 780;
const Y_TOPIC = 460;
const Y_DLQ = 1100;

const DESK = { x: COL_SRC, y: Y_DESK, w: 380, h: 140 };
const ERP = { x: COL_SRC, y: Y_ERP, w: 380, h: 140 };
const TELEM = { x: COL_SRC, y: Y_TELEMETRY, w: 380, h: 140 };
const ANY = { x: COL_SRC, y: Y_PUSH, w: 380, h: 140 };

const BATCH = { x: COL_ADAPT, y: Y_BATCH, w: 380, h: 140 };
const KAFKA = { x: COL_ADAPT, y: Y_KAFKA, w: 380, h: 120 };
const REST = { x: COL_ADAPT, y: Y_API, w: 380, h: 120 };

const PIPE = { x: COL_PIPE, y: Y_PIPE, w: 440, h: 260 };

const TOPIC = { x: COL_BUS, y: Y_TOPIC, w: 340, h: 150 };
const DLQ = { x: COL_BUS, y: Y_DLQ, w: 340, h: 150 };

const WORKER = { x: 2960, y: 460, w: 380, h: 130 };
const PG = { x: 2820, y: 830, w: 240, h: 200 };
const PARQUET = { x: 3100, y: 830, w: 240, h: 200 };
const DBX = { x: 3100, y: 1180, w: 330, h: 130 };

const BAND = { y: 160, h: 1260 };

const parts = [];

parts.push(groupBox(60, BAND.y, 480, BAND.h, "Source systems (simulated)"));
parts.push(groupBox(600, BAND.y, 1400, BAND.h, "Ingestion gateway"));
parts.push(groupBox(2120, BAND.y, 460, BAND.h, "Azure Service Bus"));
parts.push(groupBox(2660, BAND.y, 660, BAND.h, "Landing"));

// ---- edges first, so the nodes paint over the line ends ----

// Two REST sources into the one batch puller. Aimed at different heights on the
// same edge so they arrive in the order they left.
parts.push(edge([right(DESK), Y_DESK], [left(BATCH), Y_BATCH - 26]));
parts.push(edge([right(ERP), Y_ERP], [left(BATCH), Y_BATCH + 26]));
parts.push(edge([right(TELEM), Y_TELEMETRY], [left(KAFKA), Y_KAFKA]));
parts.push(edge([right(ANY), Y_PUSH], [left(REST), Y_API]));

// Three adapters, one pipeline. Every one of these is a diagonal, so the
// labels ride the midpoint rather than sitting beside a start point.
const BATCH_RUN = [
  [right(BATCH), Y_BATCH],
  [left(PIPE), Y_PIPE - 80],
];
const KAFKA_RUN = [
  [right(KAFKA), Y_KAFKA],
  [left(PIPE), Y_PIPE],
];
const REST_RUN = [
  [right(REST), Y_API],
  [left(PIPE), Y_PIPE + 80],
];
parts.push(edge(...BATCH_RUN, { accent: true }));
parts.push(midLabel(...BATCH_RUN, "batch", { away: -34 }));
parts.push(edge(...KAFKA_RUN, { accent: true }));
parts.push(midLabel(...KAFKA_RUN, "stream"));
parts.push(edge(...REST_RUN, { accent: true }));
parts.push(midLabel(...REST_RUN, "push"));

// Accepted to the topic, rejected to the dead-letter queue.
const OK_RUN = [
  [right(PIPE), Y_PIPE - 60],
  [left(TOPIC), Y_TOPIC],
];
const BAD_RUN = [
  [right(PIPE), Y_PIPE + 60],
  [left(DLQ), Y_DLQ],
];
parts.push(edge(...OK_RUN, { accent: true }));
parts.push(midLabel(...OK_RUN, "accepted"));
parts.push(edge(...BAD_RUN));
parts.push(midLabel(...BAD_RUN, "rejected", { away: -34 }));

parts.push(edge([right(TOPIC), Y_TOPIC], [left(WORKER), WORKER.y], { accent: true }));

parts.push(edge([PG.x, bottom(WORKER)], [PG.x, top(PG)]));
parts.push(edge([PARQUET.x, bottom(WORKER)], [PARQUET.x, top(PARQUET)]));
parts.push(edge([DBX.x, bottom(PARQUET)], [DBX.x, top(DBX)]));

// ---- nodes ----
parts.push(rrect(DESK.x, DESK.y, DESK.w, DESK.h, "Trading desk\nREST, camelCase", { size: 23 }));
parts.push(rrect(ERP.x, ERP.y, ERP.w, ERP.h, "ERP\nREST, snake_case", { size: 23 }));
parts.push(rrect(TELEM.x, TELEM.y, TELEM.w, TELEM.h, "Port telemetry\nKafka topic", { size: 23 }));
parts.push(rrect(ANY.x, ANY.y, ANY.w, ANY.h, "Any system\nPOST /ingest", { size: 23 }));

parts.push(rrect(BATCH.x, BATCH.y, BATCH.w, BATCH.h, "Batch puller\nscheduled", { size: 23 }));
parts.push(rrect(KAFKA.x, KAFKA.y, KAFKA.w, KAFKA.h, "Kafka consumer", { size: 23 }));
parts.push(rrect(REST.x, REST.y, REST.w, REST.h, "REST gateway", { size: 23 }));

parts.push(
  rrect(
    PIPE.x,
    PIPE.y,
    PIPE.w,
    PIPE.h,
    "Ingestion pipeline\n\nnormalize · validate\ndedupe · publish",
    { fill: ACCENT, stroke: ACCENT, tcolor: ON_ACCENT, size: 24 },
  ),
);

parts.push(queue(TOPIC.x, TOPIC.y, TOPIC.w, TOPIC.h, "Topic", { stroke: ACCENT, size: 25 }));
parts.push(queue(DLQ.x, DLQ.y, DLQ.w, DLQ.h, "Dead letter", { size: 23 }));

parts.push(rrect(WORKER.x, WORKER.y, WORKER.w, WORKER.h, "Landing worker", { size: 23 }));
parts.push(cylinder(PG.x, PG.y, PG.w, PG.h, "Postgres", { size: 22 }));
parts.push(cylinder(PARQUET.x, PARQUET.y, PARQUET.w, PARQUET.h, "Parquet", { size: 22 }));
parts.push(rrect(DBX.x, DBX.y, DBX.w, DBX.h, "Databricks\nDelta tables", { size: 23 }));

const W = 3380;
const H = 1580;

const diagramSvg = document({
  width: W,
  height: H,
  id: "bunkerflow-arch",
  title: "BunkerFlow architecture",
  desc: "Four simulated sources feed three thin adapters: a trading desk and an ERP, both REST, share a scheduled batch puller; port telemetry arrives over Kafka; and any system can push to a REST gateway. All three adapters converge on one ingestion pipeline that normalizes, validates, dedupes and publishes. Accepted records go to an Azure Service Bus topic and rejected ones to a dead-letter queue. A landing worker reads the topic and writes Postgres for the query API and date-partitioned Parquet for the lakehouse, which Databricks reads into Delta tables.",
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
    width: ${COVER_W}px; height: ${COVER_H}px; box-sizing: border-box; padding: 48px 56px;
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
