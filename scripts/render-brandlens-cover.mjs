// Renders the BrandLens 16:9 cover: a compact mock of the dashboard (overall
// visibility score, share-of-voice bars, and the three model chips) on the
// site palette. The case-study page supplies the title and tech separately.
//   node scripts/render-brandlens-cover.mjs
import fs from "node:fs/promises";
import path from "node:path";
import { chromium } from "playwright";

const root = process.cwd();
const outDir = path.join(root, "public", "projects", "brandlens");

const INK = "#0a0a0a";
const MUTED = "#52525b";
const ACCENT = "#2563eb";
const BORDER = "#e5e7eb";
const TRACK = "#eef0f3";
const GREY = "#c7ccd4";
const MONO = `ui-monospace, "SF Mono", "JetBrains Mono", "Cascadia Code", Menlo, monospace`;

const bars = [
  { name: "Figma", value: 46, brand: true },
  { name: "Canva", value: 24 },
  { name: "Sketch", value: 18 },
  { name: "Adobe XD", value: 12 },
];

const maxValue = Math.max(...bars.map((b) => b.value));

const barRows = bars
  .map((b) => {
    const width = (b.value / maxValue) * 100;
    const fill = b.brand ? ACCENT : GREY;
    const nameColor = b.brand ? INK : MUTED;
    const weight = b.brand ? 700 : 500;
    return `
      <div class="row">
        <span class="row-name" style="color:${nameColor};font-weight:${weight}">${b.name}</span>
        <span class="track"><span class="fill" style="width:${width}%;background:${fill}"></span></span>
        <span class="row-val">${b.value}%</span>
      </div>`;
  })
  .join("");

const chip = (label) => `<span class="chip">${label}</span>`;

const COVER_W = 1600;
const COVER_H = 900;

const html = `<!doctype html><html><head><meta charset="utf-8"><style>
  html, body { margin: 0; padding: 0; background: #ffffff; }
  * { box-sizing: border-box; font-family: ${MONO}; }
  .cover {
    width: ${COVER_W}px; height: ${COVER_H}px; padding: 96px;
    display: flex; align-items: center; gap: 80px; background: #ffffff;
  }
  .left { width: 560px; flex-shrink: 0; }
  .kicker { font-size: 22px; letter-spacing: 3px; text-transform: uppercase; color: ${MUTED}; }
  .title { font-size: 104px; font-weight: 700; color: ${INK}; letter-spacing: -3px; line-height: 1; margin: 24px 0 20px; }
  .title span { color: ${ACCENT}; }
  .subtitle { font-size: 30px; color: ${MUTED}; line-height: 1.4; margin-bottom: 44px; }
  .chips { display: flex; gap: 16px; }
  .chip { border: 2px solid ${BORDER}; color: ${INK}; border-radius: 999px; padding: 12px 22px; font-size: 22px; }
  .card { flex: 1; border: 2px solid ${BORDER}; border-radius: 24px; padding: 52px 56px; }
  .card-head { display: flex; align-items: baseline; justify-content: space-between; margin-bottom: 40px; }
  .card-label { font-size: 24px; color: ${MUTED}; }
  .score { font-size: 88px; font-weight: 700; color: ${ACCENT}; line-height: 1; }
  .score small { font-size: 30px; color: ${MUTED}; font-weight: 500; }
  .row { display: flex; align-items: center; gap: 22px; margin-bottom: 26px; }
  .row:last-child { margin-bottom: 0; }
  .row-name { width: 170px; font-size: 26px; }
  .track { flex: 1; height: 22px; background: ${TRACK}; border-radius: 11px; overflow: hidden; }
  .fill { display: block; height: 100%; border-radius: 11px; }
  .row-val { width: 70px; text-align: right; font-size: 24px; color: ${MUTED}; }
</style></head><body>
  <div class="cover">
    <div class="left">
      <div class="kicker">Brand visibility across LLMs</div>
      <div class="title">Brand<span>Lens</span></div>
      <div class="subtitle">How a brand shows up when people ask an assistant, scored per model.</div>
      <div class="chips">${chip("OpenAI")}${chip("Anthropic")}${chip("Perplexity")}</div>
    </div>
    <div class="card">
      <div class="card-head">
        <span class="card-label">Overall visibility · Figma</span>
        <span class="score">72<small>/100</small></span>
      </div>
      ${barRows}
    </div>
  </div>
</body></html>`;

await fs.mkdir(outDir, { recursive: true });

const browser = await chromium.launch();
try {
  const page = await browser.newPage({
    viewport: { width: COVER_W, height: COVER_H },
    deviceScaleFactor: 2,
  });
  await page.setContent(html, { waitUntil: "networkidle" });
  const cover = await page.$(".cover");
  await cover.screenshot({ path: path.join(outDir, "cover.png") });
} finally {
  await browser.close();
}

console.log(`Wrote public/projects/brandlens/cover.png`);
