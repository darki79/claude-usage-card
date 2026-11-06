// Renders tools/screenshots/gallery.html and writes one PNG per style to docs/images/,
// plus docs/images/overview.png. Needs Playwright with Chromium:
//   npm i --no-save playwright && npx playwright install chromium
//   node tools/screenshots/shoot.mjs
import { createRequire } from "node:module";
import { fileURLToPath, pathToFileURL } from "node:url";
import path from "node:path";

// CommonJS lookup, so a globally installed Playwright (NODE_PATH) works too
const { chromium } = createRequire(import.meta.url)("playwright");
const here = path.dirname(fileURLToPath(import.meta.url));
const out = path.resolve(here, "../../docs/images");
const OVERVIEW = ["bars", "shell", "paper", "matrix", "cupertino"];

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1400, height: 1000 }, deviceScaleFactor: 2 });
const errors = [];
page.on("pageerror", (e) => errors.push(String(e)));
await page.goto(pathToFileURL(path.join(here, "gallery.html")).href);
await page.waitForTimeout(1500); // history requests and fonts
if (errors.length) throw new Error(errors.join("\n"));

const ids = await page.$$eval(".shot", (els) => els.map((e) => e.id));
for (const id of ids) {
  await page.locator(`#${id}`).screenshot({ path: path.join(out, `${id}.png`) });
  console.log(`docs/images/${id}.png`);
}

// overview: the chosen shots side by side, scaled to one height
await page.evaluate((list) => {
  const row = document.createElement("div");
  row.id = "overview";
  Object.assign(row.style, { display: "flex", gap: "0", alignItems: "flex-start", background: "#111", width: "max-content" });
  for (const id of list) row.appendChild(document.getElementById(id)); // move: clones would lose their state
  document.body.prepend(row);
}, OVERVIEW);
await page.waitForTimeout(300);
// 1x is enough for the wide overview and keeps the file small
await page.locator("#overview").screenshot({ path: path.join(out, "overview.png"), scale: "css" });
console.log("docs/images/overview.png");
await browser.close();
