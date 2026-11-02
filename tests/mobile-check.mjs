// スマホ幅で ひらいて: 横に はみ出さないか・16px より小さい字が ないか・エラーが ないか・
// 会話 → メニュー → へや → 作品の窓 まで すすめるか。スクリーンショットも 撮る。
// node tests/mobile-check.mjs [outDir]
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
let chromium;
try { ({ chromium } = require('playwright')); } catch { ({ chromium } = await import('playwright')); }

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const OUT = path.resolve(process.argv[2] || path.join(ROOT, 'tests/shots'));
fs.mkdirSync(OUT, { recursive: true });
const MIME = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css', '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg', '.webp': 'image/webp', '.json': 'application/json' };
const server = http.createServer((req, res) => {
  let p = decodeURIComponent(new URL(req.url, 'http://x').pathname);
  if (p.endsWith('/')) p += 'index.html';
  const f = path.join(ROOT, p);
  if (!f.startsWith(ROOT) || !fs.existsSync(f)) { res.writeHead(404); res.end(); return; }
  res.writeHead(200, { 'content-type': MIME[path.extname(f)] || 'application/octet-stream' });
  fs.createReadStream(f).pipe(res);
});
await new Promise((r) => server.listen(0, r));
const base = `http://127.0.0.1:${server.address().port}`;

const browser = await chromium.launch();
const problems = [];
const sizes = [{ name: 'se', w: 375, h: 667 }, { name: 'iphone', w: 390, h: 844 }, { name: 'small', w: 320, h: 568 }];

async function audit(page, label) {
  const r = await page.evaluate(() => {
    const out = { overflowX: document.documentElement.scrollWidth > window.innerWidth + 1, small: [] };
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
    const seen = new Set();
    while (walker.nextNode()) {
      const n = walker.currentNode; if (!n.textContent.trim()) continue;
      const e = n.parentElement; if (!e || seen.has(e)) continue; seen.add(e);
      if (e.closest('svg,[hidden],.skip,noscript')) continue;
      const cs = getComputedStyle(e); if (cs.display === 'none' || cs.visibility === 'hidden') continue;
      const rect = e.getBoundingClientRect(); if (!rect.width || !rect.height) continue;
      const fs = parseFloat(cs.fontSize); if (fs < 15.9) out.small.push(`${e.tagName}.${e.className} ${fs}px "${n.textContent.trim().slice(0, 20)}"`);
    }
    return out;
  });
  if (r.overflowX) problems.push(`${label}: horizontal overflow`);
  r.small.forEach((s) => problems.push(`${label}: small text ${s}`));
}

for (const s of sizes) {
  const ctx = await browser.newContext({ viewport: { width: s.w, height: s.h }, deviceScaleFactor: 2, isMobile: true, hasTouch: true, locale: 'ja-JP' });
  const page = await ctx.newPage();
  page.on('pageerror', (e) => problems.push(`${s.name}: pageerror ${e.message}`));
  page.on('console', (m) => { if (m.type() === 'error' && !/fonts\.g/.test(m.text() + (m.location()?.url || ''))) problems.push(`${s.name}: console ${m.text()}`); });
  await page.route(/fonts\.(googleapis|gstatic)\.com/, (r) => r.abort());
  await page.goto(`${base}/index.html?time=14:00&flat=1`, { waitUntil: 'load' });
  await page.waitForTimeout(600);
  // 会話を すすめて メニューまで
  for (let i = 0; i < 6 && await page.locator('#menu').isHidden(); i++) { await page.locator('#windowBody').click(); await page.waitForTimeout(250); }
  await page.waitForTimeout(300);
  await page.screenshot({ path: path.join(OUT, `${s.name}-1-menu.png`) });
  await audit(page, `${s.name}/menu`);
  if (await page.locator('#menu').isHidden()) problems.push(`${s.name}: menu never appeared`);

  const advance = async () => { for (let i = 0; i < 8 && await page.locator('#menu').isHidden(); i++) { await page.locator('#windowBody').click(); await page.waitForTimeout(220); } };
  // へやのこと → 個展CURA → つれていって → へやの なか → 作品
  await page.locator('#menu .item', { hasText: 'へやのこと' }).click();
  await advance();
  await page.screenshot({ path: path.join(OUT, `${s.name}-2-rooms.png`) });
  await page.locator('#menu .item', { hasText: '個展CURA' }).click();
  await advance();
  await page.locator('#menu .item', { hasText: 'つれていって' }).click();
  await page.waitForSelector('#sheet:not([hidden])', { timeout: 5000 });
  await page.waitForTimeout(300);
  await page.screenshot({ path: path.join(OUT, `${s.name}-3-room.png`) });
  await page.locator('#sheet .work-row').first().click();
  await page.waitForTimeout(350);
  await page.screenshot({ path: path.join(OUT, `${s.name}-3-work.png`) });
  await audit(page, `${s.name}/work`);
  await page.locator('#sheetClose').click();
  // とびらを タップ（④ VJ）
  await page.locator('#doors .door[data-room="vj"]').click();
  await advance();
  await page.screenshot({ path: path.join(OUT, `${s.name}-3-door.png`) });
  if (!(await page.locator('#line').textContent()).includes('はいる')) problems.push(`${s.name}: door prompt missing はいる？`);
  await page.locator('#backBtn').click();
  await advance();
  // またね（へやを みたあと → おわかれ と いちらん）
  await page.locator('#menu .item', { hasText: 'またね' }).click();
  await advance();
  await page.screenshot({ path: path.join(OUT, `${s.name}-3-bye.png`) });
  if (!(await page.locator('#menu').textContent()).includes('さくひん いちらん')) problems.push(`${s.name}: farewell menu missing works list`);

  // 夜 + 英語
  await page.goto(`${base}/index.html?time=21:00&lang=en&flat=1`, { waitUntil: 'load' });
  await page.waitForTimeout(500);
  for (let i = 0; i < 6 && await page.locator('#menu').isHidden(); i++) { await page.locator('#windowBody').click(); await page.waitForTimeout(250); }
  await page.screenshot({ path: path.join(OUT, `${s.name}-4-night-en.png`) });
  await audit(page, `${s.name}/night-en`);
  await page.evaluate(() => window.__niwa.openWorksList());
  await page.waitForTimeout(300);
  await page.screenshot({ path: path.join(OUT, `${s.name}-5-all.png`) });
  await audit(page, `${s.name}/all`);

  // もじだけの ページ
  await page.goto(`${base}/list.html`, { waitUntil: 'load' });
  await audit(page, `${s.name}/list`);
  if (s.name === 'se') await page.screenshot({ path: path.join(OUT, `${s.name}-6-list.png`) });
  await ctx.close();
}

await browser.close();
server.close();
if (problems.length) { console.log('PROBLEMS:\n' + [...new Set(problems)].join('\n')); process.exitCode = 1; }
else console.log('OK — no overflow, no text under 16px, no errors. Shots in', OUT);
