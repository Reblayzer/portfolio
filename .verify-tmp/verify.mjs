import { chromium } from "playwright";

const BASE = "http://localhost:3000";
const out = ".verify-tmp";
const results = [];

function log(name, ok, detail) {
  const icon = ok ? "✅" : "❌";
  results.push({ name, ok, detail });
  console.log(`${icon} ${name}${detail ? ` — ${detail}` : ""}`);
}

const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 } });
const page = await ctx.newPage();

const errors = [];
page.on("pageerror", (err) => errors.push(`pageerror: ${err.message}`));
page.on("console", (msg) => {
  if (msg.type() === "error") errors.push(`console.error: ${msg.text()}`);
});

// --- 1. Home page renders ---
try {
  const resp = await page.goto(`${BASE}/`, { waitUntil: "networkidle" });
  log("GET /", resp?.ok() === true, `HTTP ${resp?.status()}`);

  const h1 = await page.locator("h1").first().textContent();
  log("hero h1 text", h1?.trim() === "Alexandro Bolfa", `got: "${h1}"`);

  const accentBtn = page.getByRole("link", { name: /See work/ }).first();
  const accentColor = await accentBtn.evaluate((el) => getComputedStyle(el).backgroundColor);
  log(
    "hero primary CTA uses accent bg",
    accentColor === "rgb(37, 99, 235)" || accentColor === "rgb(59, 130, 246)",
    `bg: ${accentColor}`,
  );

  await page.screenshot({ path: `${out}/01-home-light.png`, fullPage: false });
} catch (e) {
  log("GET / threw", false, e.message);
}

// --- 2. Theme toggle works ---
try {
  const initialClass = await page.evaluate(() => document.documentElement.className);
  const toggleBtn = page.getByRole("button", { name: /Switch to (dark|light) mode/ });
  await toggleBtn.click();
  await page.waitForTimeout(200);
  const afterClass = await page.evaluate(() => document.documentElement.className);
  log("theme toggle flips html class", initialClass !== afterClass, `before: "${initialClass}", after: "${afterClass}"`);

  await page.screenshot({ path: `${out}/02-home-dark.png`, fullPage: false });
} catch (e) {
  log("theme toggle threw", false, e.message);
}

// --- 3. All section anchors present ---
try {
  const ids = await page.evaluate(() =>
    Array.from(document.querySelectorAll("section[id]")).map((s) => s.id),
  );
  const required = ["top", "about", "skills", "experience", "work", "contact"];
  const missing = required.filter((id) => !ids.includes(id));
  log("all required section anchors present", missing.length === 0, missing.length ? `missing: ${missing.join(", ")}` : `present: ${ids.join(", ")}`);
} catch (e) {
  log("section anchors threw", false, e.message);
}

// --- 4. Full-page screenshot ---
try {
  // back to light mode for the full-page shot
  const toggleBtn = page.getByRole("button", { name: /Switch to (dark|light) mode/ });
  await toggleBtn.click();
  await page.waitForTimeout(200);
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(200);
  await page.screenshot({ path: `${out}/03-home-full.png`, fullPage: true });
  log("full-page screenshot captured", true);
} catch (e) {
  log("full-page screenshot threw", false, e.message);
}

// --- 5. Case study page ---
try {
  const resp = await page.goto(`${BASE}/projects/portfolio-site`, { waitUntil: "networkidle" });
  log("GET /projects/portfolio-site", resp?.ok() === true, `HTTP ${resp?.status()}`);

  const csH1 = await page.locator("h1").first().textContent();
  log("case-study h1", csH1?.trim() === "Portfolio Site", `got: "${csH1}"`);

  const mdxH2Count = await page.locator("article h2").count();
  log("case-study MDX h2 rendered", mdxH2Count >= 3, `count: ${mdxH2Count}`);

  await page.screenshot({ path: `${out}/04-case-study.png`, fullPage: true });

  const backLink = page.getByRole("link", { name: /Back to work/ });
  await backLink.click();
  await page.waitForURL(/\/#work$|\/$|\/#/);
  log("back-to-work link works", page.url().includes("#work") || page.url().endsWith("/"), `landed at: ${page.url()}`);
} catch (e) {
  log("case study threw", false, e.message);
}

// --- 6. Contact form: empty submit shows inline errors ---
try {
  await page.goto(`${BASE}/#contact`, { waitUntil: "networkidle" });
  await page.waitForTimeout(300);

  const submitBtn = page.getByRole("button", { name: /Send message/ });
  await submitBtn.click();
  await page.waitForTimeout(400);

  const errorTexts = await page.locator("form .text-red-500").allTextContents();
  const required = ["name", "email", "message"];
  const found = required.filter((field) => errorTexts.some((t) => t.toLowerCase().includes(field)));
  log(
    "empty submit shows inline errors for all fields",
    found.length === required.length,
    `errors shown: ${errorTexts.join(" | ")}`,
  );

  await page.screenshot({ path: `${out}/05-contact-empty-errors.png`, fullPage: false });
} catch (e) {
  log("contact validation threw", false, e.message);
}

// --- 7. Contact form: valid submit gets a server response ---
try {
  await page.goto(`${BASE}/#contact`, { waitUntil: "networkidle" });
  await page.waitForTimeout(300);

  await page.locator("#name").fill("Test User");
  await page.locator("#email").fill("test@example.com");
  await page.locator("#message").fill("This is a test message from the verify script. It must be at least ten characters long.");

  const submitBtn = page.getByRole("button", { name: /Send message/ });
  await submitBtn.click();
  await page.waitForTimeout(2000);

  const status = await page.locator("#contact-status").textContent();
  log(
    "valid submit returns a server response",
    !!status && status.length > 0,
    `status: "${status}"`,
  );
  // Expected in dev: "Server misconfigured" because RESEND_API_KEY not set
} catch (e) {
  log("contact valid submit threw", false, e.message);
}

// --- 8. Mobile viewport ---
try {
  const mobile = await ctx.newPage();
  await mobile.setViewportSize({ width: 375, height: 812 });
  const resp = await mobile.goto(`${BASE}/`, { waitUntil: "networkidle" });
  log("GET / @ 375px", resp?.ok() === true, `HTTP ${resp?.status()}`);

  const hScroll = await mobile.evaluate(() => document.documentElement.scrollWidth > window.innerWidth);
  log("no horizontal overflow @ 375px", !hScroll, hScroll ? "page is wider than viewport" : "OK");

  await mobile.screenshot({ path: `${out}/06-mobile.png`, fullPage: true });
  await mobile.close();
} catch (e) {
  log("mobile viewport threw", false, e.message);
}

// --- 9. Console / page errors ---
log("no console.error or pageerror during run", errors.length === 0, errors.length ? errors.join(" | ") : "clean");

await browser.close();

const failed = results.filter((r) => !r.ok).length;
console.log(`\n${results.length - failed}/${results.length} checks passed`);
process.exit(failed === 0 ? 0 : 1);
