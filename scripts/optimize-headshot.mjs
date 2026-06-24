// One-off: optimize a source photo into public/headshot.jpg (512x512, center-cropped).
// Usage: node scripts/optimize-headshot.mjs <source-image-path>
// Uses Playwright's Chromium canvas so no extra image dependency is needed.
import { readFile, writeFile } from "node:fs/promises";
import { chromium } from "playwright";

const src = process.argv[2];
if (!src) {
  console.error("Usage: node scripts/optimize-headshot.mjs <source-image-path>");
  process.exit(1);
}

const SIZE = 512;
const buf = await readFile(src);
const dataUrl = `data:image/jpeg;base64,${buf.toString("base64")}`;

const browser = await chromium.launch();
try {
  const page = await browser.newPage();
  const out = await page.evaluate(
    async ({ dataUrl, size }) => {
      const img = new Image();
      img.src = dataUrl;
      await img.decode();
      const canvas = document.createElement("canvas");
      canvas.width = size;
      canvas.height = size;
      const ctx = canvas.getContext("2d");
      const side = Math.min(img.width, img.height);
      const sx = (img.width - side) / 2;
      const sy = (img.height - side) / 2;
      ctx.drawImage(img, sx, sy, side, side, 0, 0, size, size);
      return canvas.toDataURL("image/jpeg", 0.85);
    },
    { dataUrl, size: SIZE },
  );
  const base64 = out.replace(/^data:image\/jpeg;base64,/, "");
  await writeFile("public/headshot.jpg", Buffer.from(base64, "base64"));
  console.log("Wrote public/headshot.jpg");
} finally {
  await browser.close();
}
