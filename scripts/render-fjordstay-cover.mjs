// Renders the Fjordstay case-study cover: a full-bleed screenshot of the real
// running frontend, matching the Consentinel cover convention (no device
// frame, no decoration — the product is the cover).
//
//   cd ~/dev/fjordstay && docker compose up -d      # app on :3000
//   cd ~/dev/portfolio && node scripts/render-fjordstay-cover.mjs
//
// Options via env:
//   FJORDSTAY_URL   default http://localhost:3000
//   SCROLL          pixels to scroll before the shot (default 0)
import fs from "node:fs/promises";
import path from "node:path";
import { chromium } from "playwright";
import sharp from "sharp";

const root = process.cwd();
const slug = "fjordstay";
const outDir = path.join(root, "public", "projects", slug);

const BASE = process.env.FJORDSTAY_URL ?? "http://localhost:3000";
const SCROLL = Number(process.env.SCROLL ?? 0);

/*
 * 1600x900 at 1.6x gives the same 2560x1440 the other covers use, but a taller
 * viewport than 1280x720 — enough to hold the hero, the whole search panel and
 * the first row of photography without scrolling. That matters because the
 * site header is translucent with a backdrop blur: any scrolled position
 * smears whatever sits behind it, which reads as an artefact in a still.
 */
const WIDTH = 1600;
const HEIGHT = 900;
const SCALE = 1.6;

async function main() {
  await fs.mkdir(outDir, { recursive: true });

  const browser = await chromium.launch();
  const page = await browser.newPage({
    viewport: { width: WIDTH, height: HEIGHT },
    deviceScaleFactor: SCALE,
  });

  const response = await page.goto(BASE, { waitUntil: "networkidle", timeout: 60_000 });
  if (!response || !response.ok()) {
    throw new Error(
      `${BASE} returned ${response?.status() ?? "no response"} — is the Fjordstay stack running?`,
    );
  }

  // next/image lazy-loads; give the listing photography a chance to decode so
  // the cover is not a grid of empty boxes.
  await page.evaluate(async () => {
    await Promise.all(
      Array.from(document.images)
        .filter((img) => !img.complete)
        .map(
          (img) =>
            new Promise((res) => {
              img.onload = img.onerror = res;
            }),
        ),
    );
  });

  if (SCROLL) {
    await page.evaluate((y) => window.scrollTo(0, y), SCROLL);
    await page.waitForTimeout(400);
  }

  await page.waitForTimeout(600);

  const out = path.join(outDir, "cover.png");
  const shot = await page.screenshot({ type: "png" });
  await browser.close();

  /*
   * Playwright writes a fast, barely-compressed PNG — about 1MB for a page
   * with three photographs on it. Re-encoding at full effort roughly halves
   * that and is lossless; a palette would be smaller still but quantising to
   * 256 colours visibly bands the photography, which is the whole subject.
   */
  await sharp(shot)
    .png({ compressionLevel: 9, adaptiveFiltering: true, effort: 10 })
    .toFile(out);

  const { size } = await fs.stat(out);
  console.log(
    `cover.png  ${Math.round(WIDTH * SCALE)}x${Math.round(HEIGHT * SCALE)}  ${Math.round(size / 1024)}KB`,
  );
  console.log(out);
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
