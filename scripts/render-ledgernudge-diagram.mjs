// Renders the LedgerNudge dunning-loop diagram.
//
//   node scripts/render-ledgernudge-diagram.mjs
//
// Replaces a Mermaid render of docs/diagrams/ledgernudge.mmd, which stays as
// the written source of the graph. Mermaid measures each label at generation
// time and sizes its box to fit; the committed SVG had been produced somewhere
// without the font it names, so half the labels were already clipped —
// "DunningDraftServi", "Anthropic Clauc", "PostgreSQ". Hand-composing it fixes
// that and gets the diagram onto the site's theme at the same time.
//
// Shapes, palette and the two layout rules live in scripts/lib/diagram.mjs.
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
  elbow,
  left,
  queue,
  right,
  rrect,
  top,
} from "./lib/diagram.mjs";

const root = process.cwd();
const slug = "ledgernudge";
const outDir = path.join(root, "public", "projects", slug);

/* ---- layout ----------------------------------------------------------------
 * It is a loop, so it is drawn as one, anticlockwise from the scheduler:
 *
 *   send      MessageSender ——→ Twilio ——→ InboundReplyService
 *                  ↑                              ↕ classify
 *   work   Sched → Redis queue ——→ Draft ——→ Anthropic Claude
 *                  ↑                 ↓
 *   store    Operator inbox ←—— PostgreSQL
 *                  ↓                 ↑
 *   money       Stripe ——→ WebhookReconciler
 *
 * The queue is the hub of the work band — the scheduler arrives from the left,
 * the draft service leaves to the right, the operator's approval comes up from
 * below and the send job leaves upward.
 *
 * Thirteen of the fourteen edges are straight. The exception is the reply
 * service writing a dispute to Postgres, which has to come back across two
 * bands; it is the one edge in the picture that the graph will not let lie
 * flat, and it is routed around the outside so it crosses nothing.
 * -------------------------------------------------------------------------- */

const Y_SEND = 220;
const Y_WORK = 700;
const Y_STORE = 1180;
const Y_MONEY = 1660;

const SCHED = { x: 260, y: Y_WORK, w: 400, h: 160 };
const QUEUE = { x: 900, y: Y_WORK, w: 330, h: 150 };
const DRAFT = { x: 1580, y: Y_WORK, w: 440, h: 150 };
const CLAUDE = { x: 2320, y: Y_WORK, w: 320, h: 150 };

const SEND = { x: 900, y: Y_SEND, w: 400, h: 150 };
const TWILIO = { x: 1580, y: Y_SEND, w: 360, h: 150 };
const REPLY = { x: 2320, y: Y_SEND, w: 440, h: 150 };

const INBOX = { x: 900, y: Y_STORE, w: 400, h: 150 };
const DB = { x: 1580, y: Y_STORE, w: 340, h: 190 };

const STRIPE = { x: 900, y: Y_MONEY, w: 320, h: 150 };
const RECON = { x: 1580, y: Y_MONEY, w: 460, h: 150 };

// The dispute edge runs down this column, clear of Claude's right edge.
const DISPUTE_X = 2700;
const DISPUTE_Y = 1240;

const parts = [];

// ---- edges first, so the nodes paint over the line ends ----
parts.push(edge([right(SCHED), Y_WORK], [left(QUEUE), Y_WORK]));
parts.push(
  edgeLabel((right(SCHED) + left(QUEUE)) / 2, Y_WORK - 26, "past-due step", {
    anchor: "middle",
  }),
);

parts.push(edge([right(QUEUE), Y_WORK], [left(DRAFT), Y_WORK]));
parts.push(
  edgeLabel((right(QUEUE) + left(DRAFT)) / 2, Y_WORK - 26, "draft job", {
    anchor: "middle",
  }),
);

parts.push(edge([right(DRAFT), Y_WORK], [left(CLAUDE), Y_WORK], { both: true }));
parts.push(
  edgeLabel((right(DRAFT) + left(CLAUDE)) / 2, Y_WORK - 26, "message draft", {
    anchor: "middle",
  }),
);

parts.push(edge([QUEUE.x, top(QUEUE)], [SEND.x, bottom(SEND)]));
parts.push(edgeLabel(QUEUE.x + 20, (top(QUEUE) + bottom(SEND)) / 2, "send job"));

parts.push(edge([right(SEND), Y_SEND], [left(TWILIO), Y_SEND]));
parts.push(
  edgeLabel((right(SEND) + left(TWILIO)) / 2, Y_SEND - 26, "email / SMS", {
    anchor: "middle",
  }),
);

parts.push(edge([right(TWILIO), Y_SEND], [left(REPLY), Y_SEND]));
parts.push(
  edgeLabel((right(TWILIO) + left(REPLY)) / 2, Y_SEND - 26, "inbound reply", {
    anchor: "middle",
  }),
);

parts.push(edge([REPLY.x, bottom(REPLY)], [CLAUDE.x, top(CLAUDE)], { both: true }));
parts.push(edgeLabel(CLAUDE.x + 20, (bottom(REPLY) + top(CLAUDE)) / 2, "classify"));

parts.push(edge([DRAFT.x, bottom(DRAFT)], [DB.x, top(DB)]));
parts.push(edgeLabel(DRAFT.x + 20, (bottom(DRAFT) + top(DB)) / 2, "pending_approval"));

parts.push(edge([left(DB), Y_STORE], [right(INBOX), Y_STORE]));

parts.push(edge([INBOX.x, top(INBOX)], [QUEUE.x, bottom(QUEUE)]));
parts.push(
  edgeLabel(INBOX.x - 20, (top(INBOX) + bottom(QUEUE)) / 2, "approve", {
    anchor: "end",
  }),
);

parts.push(edge([INBOX.x, bottom(INBOX)], [STRIPE.x, top(STRIPE)]));
parts.push(
  edgeLabel(INBOX.x - 20, (bottom(INBOX) + top(STRIPE)) / 2, "create link", {
    anchor: "end",
  }),
);

parts.push(edge([right(STRIPE), Y_MONEY], [left(RECON), Y_MONEY]));
parts.push(
  edgeLabel((right(STRIPE) + left(RECON)) / 2, Y_MONEY - 26, "webhook", {
    anchor: "middle",
  }),
);

parts.push(edge([RECON.x, top(RECON)], [DB.x, bottom(DB)]));

// The one edge that cannot lie flat: out of the reply service, down the far
// right past Claude, and back into the store from the side.
parts.push(
  elbow([
    [right(REPLY), Y_SEND + 40],
    [DISPUTE_X, Y_SEND + 40],
    [DISPUTE_X, DISPUTE_Y],
    [right(DB), DISPUTE_Y],
  ]),
);
parts.push(edgeLabel(DISPUTE_X - 20, DISPUTE_Y - 26, "dispute pauses sequence", { anchor: "end" }));

// ---- nodes ----
parts.push(rrect(SCHED.x, SCHED.y, SCHED.w, SCHED.h, "dunning:advance\nscheduled", { size: 22 }));
parts.push(queue(QUEUE.x, QUEUE.y, QUEUE.w, QUEUE.h, "Redis queue", { size: 21 }));
parts.push(
  rrect(DRAFT.x, DRAFT.y, DRAFT.w, DRAFT.h, "DunningDraftService", {
    fill: ACCENT,
    stroke: ACCENT,
    tcolor: ON_ACCENT,
    size: 22,
  }),
);
parts.push(
  rrect(CLAUDE.x, CLAUDE.y, CLAUDE.w, CLAUDE.h, "Anthropic\nClaude", {
    size: 22,
    dash: "8 6",
  }),
);

parts.push(rrect(SEND.x, SEND.y, SEND.w, SEND.h, "MessageSender", { size: 22 }));
parts.push(
  rrect(TWILIO.x, TWILIO.y, TWILIO.w, TWILIO.h, "Twilio + email", { size: 22, dash: "8 6" }),
);
parts.push(rrect(REPLY.x, REPLY.y, REPLY.w, REPLY.h, "InboundReplyService", { size: 22 }));

parts.push(rrect(INBOX.x, INBOX.y, INBOX.w, INBOX.h, "Operator inbox", { size: 22 }));
parts.push(cylinder(DB.x, DB.y, DB.w, DB.h, "PostgreSQL", { size: 22 }));

parts.push(rrect(STRIPE.x, STRIPE.y, STRIPE.w, STRIPE.h, "Stripe", { size: 23, dash: "8 6" }));
parts.push(rrect(RECON.x, RECON.y, RECON.w, RECON.h, "WebhookReconciler", { size: 22 }));

// The dispute edge runs 300px further right than anything runs left, so the
// whole picture is nudged over to sit centred in its box.
const centred = [`<g transform="translate(40,0)">${parts.join("\n")}</g>`];

const svg = document({
  width: 2840,
  height: 1840,
  id: "ledgernudge-arch",
  title: "LedgerNudge dunning loop",
  desc: "A scheduled dunning:advance job puts past-due steps on a Redis queue. The queue feeds DunningDraftService, which drafts a message with Anthropic Claude and writes it to PostgreSQL as pending_approval. An operator inbox reads from Postgres; approving returns the job to the queue, which dispatches MessageSender to send email or SMS through Twilio. Inbound replies go to InboundReplyService, which classifies them with Claude and records disputes to Postgres, pausing the sequence. Separately the operator creates a Stripe payment link, and Stripe webhooks are reconciled back into Postgres.",
  parts: centred,
});

await fs.mkdir(outDir, { recursive: true });
await fs.writeFile(path.join(outDir, "architecture.svg"), svg, "utf8");
console.log(`Wrote ${path.relative(root, outDir)}/architecture.svg`);
