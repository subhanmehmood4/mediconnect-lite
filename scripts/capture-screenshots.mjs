import { chromium } from "playwright";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const BASE = process.env.SCREENSHOT_BASE ?? "https://mediconnect-lite.vercel.app";
const OUT = path.resolve(__dirname, "../../public/images");

async function main() {
  const browser = await chromium.launch();
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 2,
  });
  const page = await context.newPage();

  await page.goto(`${BASE}/`, { waitUntil: "networkidle", timeout: 60000 });
  await page.waitForTimeout(1000);
  await page.screenshot({
    path: path.join(OUT, "mediconnect-landing.png"),
    fullPage: false,
  });

  await page.goto(`${BASE}/login`, { waitUntil: "networkidle", timeout: 60000 });
  await page.waitForTimeout(500);
  await page.screenshot({
    path: path.join(OUT, "mediconnect-login.png"),
    fullPage: false,
  });

  console.log("Screenshots saved to", OUT);
  console.log("For patient/doctor/video screens, run after demo login is configured.");
  await browser.close();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
