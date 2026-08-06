// Shared drawing kit for the architecture diagrams.
//
// There were three copies of these helpers, one per diagram script, and they
// had already drifted — different line heights, different cylinder proportions,
// three separate hardcoded palettes. One module so the set genuinely reads as
// one system rather than three that resemble each other.
//
// Two rules the diagrams are built to, and the reason `edge` takes two points:
//
//   1. Every edge is a single straight line. A corner is a place the eye has to
//      stop, and a corner that carries no information is a stop for nothing.
//      Node positions follow from this, not the other way round.
//   2. No edge crosses another. Two lines leaving the same box leave from
//      different points on the same side rather than being routed around each
//      other afterwards.
//
// `elbow` exists for the one case per diagram where the graph genuinely cannot
// be laid out flat. It is deliberately more awkward to call than `edge`.

/* ---- palette ---------------------------------------------------------------
 * The site's own theme tokens, so a diagram follows light and dark with the
 * page instead of shipping two files that drift apart. Each carries its light
 * value as a fallback, which is what renders when the file is opened on its own
 * or screenshotted for a cover — outside the page a var() resolves to nothing.
 *
 * This only pays off when the SVG is inlined into the document. An <img> is a
 * separate document and cannot see the .dark class next-themes puts on <html>,
 * so a file loaded that way is frozen in one palette on a page that may be the
 * other. See src/components/architecture.tsx.
 * -------------------------------------------------------------------------- */
export const INK = "var(--color-foreground, #0a0a0a)";
export const MUTED = "var(--color-muted-foreground, #52525b)";
export const LINE = "var(--color-muted-foreground, #52525b)";
export const ACCENT = "var(--color-accent, #2563eb)";
export const ON_ACCENT = "var(--color-accent-foreground, #ffffff)";
export const SURFACE = "var(--color-background, #ffffff)";
export const GROUP = "var(--color-muted, #f4f4f5)";
export const BORDER = "var(--color-border, rgb(0 0 0 / 0.12))";

/** The light values, for rendering a diagram outside the page (cover PNGs). */
export const LIGHT_VARS = {
  "--color-foreground": "#0a0a0a",
  "--color-muted-foreground": "#52525b",
  "--color-accent": "#2563eb",
  "--color-accent-foreground": "#ffffff",
  "--color-background": "#ffffff",
  "--color-muted": "#fafafa",
  "--color-border": "#e5e7eb",
};

export const MONO = `ui-monospace, "SF Mono", "JetBrains Mono", "Cascadia Code", Menlo, monospace`;

export const esc = (s) =>
  String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

// ---- geometry ----
export const top = (n) => n.y - n.h / 2;
export const bottom = (n) => n.y + n.h / 2;
export const left = (n) => n.x - n.w / 2;
export const right = (n) => n.x + n.w / 2;

/**
 * A node's label. A line beginning with ":" is a published port, drawn quieter
 * than the name above it — a detail you go looking for, not something to read
 * first.
 *
 * Every text node names its own font. Inside the page an unspecified
 * font-family inherits the site's sans, which changes the metrics the layout
 * was measured against; that is what clips the labels on generated diagrams.
 */
export function nodeLabel(cx, cy, text, { color = INK, size = 23, port = MUTED } = {}) {
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

export function rrect(
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

/** A datastore. Same proportions everywhere, which the three copies had lost. */
export function cylinder(cx, cy, w, h, label, { stroke = ACCENT, size = 22 } = {}) {
  const x = cx - w / 2;
  const y = cy - h / 2;
  const ry = w * 0.12;
  const body = [
    `M ${x} ${y + ry}`,
    `A ${w / 2} ${ry} 0 0 0 ${x + w} ${y + ry}`,
    `L ${x + w} ${y + h - ry}`,
    `A ${w / 2} ${ry} 0 0 1 ${x} ${y + h - ry}`,
    `Z`,
  ].join(" ");
  const lid = `M ${x} ${y + ry} A ${w / 2} ${ry} 0 0 1 ${x + w} ${y + ry}`;
  return `<path d="${body}" fill="${SURFACE}" stroke="${stroke}" stroke-width="2.5"/><path d="${lid}" fill="none" stroke="${stroke}" stroke-width="2.5"/>${nodeLabel(cx, cy + ry * 0.5, label, { size })}`;
}

/** A broker or queue: the datastore glyph turned on its side. */
export function queue(cx, cy, w, h, label, { stroke = INK, size = 22 } = {}) {
  const x = cx - w / 2;
  const y = cy - h / 2;
  const rx = h * 0.16;
  const body = [
    `M ${x + rx} ${y}`,
    `A ${rx} ${h / 2} 0 0 0 ${x + rx} ${y + h}`,
    `L ${x + w - rx} ${y + h}`,
    `A ${rx} ${h / 2} 0 0 0 ${x + w - rx} ${y}`,
    `Z`,
  ].join(" ");
  const cap = `M ${x + w - rx} ${y} A ${rx} ${h / 2} 0 0 1 ${x + w - rx} ${y + h}`;
  return `<path d="${body}" fill="${SURFACE}" stroke="${stroke}" stroke-width="2.5"/><path d="${cap}" fill="none" stroke="${stroke}" stroke-width="2.5"/>${nodeLabel(cx - rx * 0.4, cy, label, { size })}`;
}

export function person(cx, cy, label) {
  const head = `<circle cx="${cx}" cy="${cy - 34}" r="22" fill="${SURFACE}" stroke="${INK}" stroke-width="2.5"/>`;
  const body = `<path d="M ${cx - 34} ${cy + 26} a 34 34 0 0 1 68 0" fill="${SURFACE}" stroke="${INK}" stroke-width="2.5"/>`;
  return `${head}${body}${nodeLabel(cx, cy + 58, label, { size: 21 })}`;
}

/** A boundary — a compose stack, a bounded context, a side of a CQRS split. */
export function groupBox(x, y, w, h, label) {
  return `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="16" fill="${GROUP}" stroke="${BORDER}" stroke-width="2"/><text x="${x + 28}" y="${y + 38}" font-family='${MONO}' font-size="24" fill="${MUTED}" text-anchor="start">${esc(label)}</text>`;
}

/** A straight edge. Two points, never more — see the note at the top. */
export function edge([x1, y1], [x2, y2], { accent = false, dash = null, both = false } = {}) {
  const color = accent ? ACCENT : LINE;
  const sw = accent ? 3.5 : 2.5;
  const head = accent ? "url(#arrowAccent)" : "url(#arrow)";
  const dashAttr = dash ? ` stroke-dasharray="${dash}"` : "";
  const startAttr = both ? ` marker-start="${head}"` : "";
  return `<path d="M ${x1} ${y1} L ${x2} ${y2}" fill="none" stroke="${color}" stroke-width="${sw}"${dashAttr}${startAttr} marker-end="${head}"/>`;
}

/**
 * An edge with corners, for the one relationship per diagram that a flat layout
 * genuinely cannot reach. Takes the whole point list, so the corners are
 * visible at the call site rather than hidden behind a convenience.
 */
export function elbow(points, { accent = false, dash = null } = {}) {
  const color = accent ? ACCENT : LINE;
  const sw = accent ? 3.5 : 2.5;
  const dashAttr = dash ? ` stroke-dasharray="${dash}"` : "";
  const d = points.map((p, i) => `${i === 0 ? "M" : "L"} ${p[0]} ${p[1]}`).join(" ");
  return `<path d="${d}" fill="none" stroke="${color}" stroke-width="${sw}"${dashAttr} marker-end="${accent ? "url(#arrowAccent)" : "url(#arrow)"}"/>`;
}

/**
 * Edge labels sit beside their line, never across it, so none of them needs a
 * knock-out rectangle behind the text and nothing is painted over anything
 * else.
 */
export function edgeLabel(x, y, text, { anchor = "start" } = {}) {
  return `<text x="${x}" y="${y}" font-family='${MONO}' font-size="19" font-style="italic" fill="${MUTED}" text-anchor="${anchor}" dominant-baseline="central">${esc(text)}</text>`;
}

/**
 * Wraps the parts in an SVG document.
 *
 * `data-inline` is what tells the Architecture component to put this file in
 * the page rather than load it through an <img>, which is what lets the
 * var(--color-…) fills resolve against the site's theme. It is opt-in per file
 * because inlining also exposes a diagram to the page's inherited styles.
 *
 * `title` and `desc` are read by screen readers, which otherwise get an image
 * with no content at all.
 */
export function document({ width, height, id, title, desc, parts }) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" data-inline="true" role="img" aria-labelledby="${id}-title ${id}-desc">
<title id="${id}-title">${esc(title)}</title>
<desc id="${id}-desc">${esc(desc)}</desc>
<defs>
  <marker id="arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M 0 0 L 10 5 L 0 10 z" fill="${LINE}"/></marker>
  <marker id="arrowAccent" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M 0 0 L 10 5 L 0 10 z" fill="${ACCENT}"/></marker>
</defs>
${parts.join("\n")}
</svg>`;
}
