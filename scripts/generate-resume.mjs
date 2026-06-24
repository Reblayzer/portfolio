// Local build tool: render the /resume route to public/resume.pdf with Playwright.
// Not run on deploy; browser tooling stays off the deploy path (like the diagrams script).
// One-time setup: npx playwright install chromium
import { spawn } from "node:child_process";
import { setTimeout as sleep } from "node:timers/promises";
import { chromium } from "playwright";

const PORT = 3210;
const URL = `http://localhost:${PORT}/resume`;

async function waitForServer(url, timeoutMs = 60000) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    try {
      const res = await fetch(url);
      if (res.ok) return;
    } catch {
      // server not up yet
    }
    await sleep(500);
  }
  throw new Error(`Server did not become ready at ${url}`);
}

const server = spawn("npx", ["next", "dev", "-p", String(PORT)], { stdio: "inherit" });

let browser;
try {
  await waitForServer(URL);
  browser = await chromium.launch();
  const page = await browser.newPage();
  await page.goto(URL, { waitUntil: "networkidle" });
  await page.emulateMedia({ media: "print" });
  await page.pdf({
    path: "public/resume.pdf",
    format: "A4",
    printBackground: true,
    margin: { top: "0", bottom: "0", left: "0", right: "0" },
  });
  console.log("Wrote public/resume.pdf");
} finally {
  if (browser) await browser.close();
  server.kill("SIGTERM");
}
