import { chromium } from 'playwright-core';
import { spawn } from 'node:child_process';
const CHROME = process.env.CHROME_PATH || '/usr/bin/google-chrome';
const srv = spawn('node', ['server.mjs'], { stdio: ['ignore', 'pipe', 'inherit'] });
const ready = new Promise((r) => srv.stdout.once('data', r));
await ready;
const errors = [];
let browser;
try {
  browser = await chromium.launch({ executablePath: CHROME, headless: true });
  const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });
  page.on('console', (m) => m.type() === 'error' && errors.push(m.text()));
  page.on('pageerror', (e) => errors.push(`pageerror: ${e.message}`));
  page.on('response', (r) => r.status() >= 400 && errors.push(`http ${r.status()}`));
  await page.goto('http://127.0.0.1:4173', { waitUntil: 'networkidle' });
  const before = (await page.locator('#vote-count').textContent()).trim();
  const voteRes = page.waitForResponse(/\/api\/vote/);
  await Promise.all([voteRes, page.click('#upvote-btn')]);
  await page.waitForTimeout(150);
  const after = (await page.locator('#vote-count').textContent()).trim();
  await page.screenshot({ path: 'verify-board.png' });
  if (before !== '42' || after !== '43') errors.push(`dom: ${before}->${after}`);
  console.log(JSON.stringify({ok: !errors.length, dom: `${before}->${after}`, errors}));
  process.exitCode = errors.length ? 1 : 0;
} finally { await browser?.close(); srv.kill(); }
