import { chromium } from "playwright";

const BASE = "http://localhost:3000";
const out = ".verify-tmp";

const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 } });
const page = await ctx.newPage();

await page.goto(`${BASE}/`, { waitUntil: "networkidle" });

const sections = ["about", "skills", "experience", "work", "contact"];

for (const id of sections) {
  await page.evaluate((sid) => document.getElementById(sid)?.scrollIntoView({ behavior: "auto", block: "start" }), id);
  // wait for IntersectionObserver + framer-motion transition
  await page.waitForTimeout(900);
  await page.screenshot({ path: `${out}/section-${id}.png`, fullPage: false });
  const opacity = await page.locator(`section#${id}`).evaluate((el) => getComputedStyle(el).opacity);
  console.log(`#${id} opacity after scroll: ${opacity}`);
}

await browser.close();
