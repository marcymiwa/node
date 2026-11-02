// 3D の ヒント小屋: ひらく → 見まわす（ドラッグ）→ ふりかえる → まーしーを タップ → とびらを タップ。
// node tests/room3d-check.mjs [outDir]
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const { chromium } = require('playwright');
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const OUT = path.resolve(process.argv[2] || path.join(ROOT, 'tests/shots'));
fs.mkdirSync(OUT, { recursive: true });
const MIME = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css', '.svg': 'image/svg+xml', '.png': 'image/png' };
const server = http.createServer((req, res) => {
  let p = decodeURIComponent(new URL(req.url, 'http://x').pathname); if (p.endsWith('/')) p += 'index.html';
  const f = path.join(ROOT, p); if (!f.startsWith(ROOT) || !fs.existsSync(f)) { res.writeHead(404); res.end(); return; }
  res.writeHead(200, { 'content-type': MIME[path.extname(f)] || 'application/octet-stream' }); fs.createReadStream(f).pipe(res);
});
await new Promise((r) => server.listen(0, r));
const base = `http://127.0.0.1:${server.address().port}`;
const browser = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
const problems = [];
const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true, locale: 'ja-JP' });
const page = await ctx.newPage();
page.on('pageerror', (e) => problems.push(`pageerror ${e.message}`));
page.on('console', (m) => { if (m.type() === 'error' && !/fonts\.g/.test(m.text() + (m.location()?.url || ''))) problems.push(`console ${m.text()}`); });
await page.route(/fonts\.(googleapis|gstatic)\.com/, (r) => r.abort());
await page.goto(`${base}/index.html?time=14:00&lang=ja`, { waitUntil: 'load' });
await page.waitForFunction(() => document.querySelector('#app').classList.contains('is3d'), null, { timeout: 15000 }).catch(() => problems.push('3D did not start'));
await page.waitForTimeout(1500);
await page.screenshot({ path: path.join(OUT, '3d-1-front.png') });
const box = await page.locator('canvas.room3d').boundingBox();
const drag = async (dx, dy) => {
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
  await page.mouse.down(); await page.mouse.move(box.x + box.width / 2 + dx, box.y + box.height / 2 + dy, { steps: 8 }); await page.mouse.up();
  await page.waitForTimeout(900);
};
await drag(-90, 0);
await page.screenshot({ path: path.join(OUT, '3d-2-turn.png') });
await page.evaluate(() => window.__niwa.room3d.look(180));
await page.waitForTimeout(1500);
await page.screenshot({ path: path.join(OUT, '3d-3-behind.png') });
await page.evaluate(() => window.__niwa.room3d.look(-75));
await page.waitForTimeout(1500);
await page.screenshot({ path: path.join(OUT, '3d-4-door.png') });
// まんなかを タップ → 正面に もどして まーしー
await page.locator('#recenterBtn').click();
await page.waitForTimeout(1500);
const before = await page.locator('#bubble').textContent();
// まーしーの 顔の あたり（画面を さがす）
let hitMarcy = false;
for (const fy of [0.42, 0.48, 0.52, 0.38, 0.56]) {
  await page.mouse.click(box.x + box.width * 0.5, box.y + box.height * fy);
  await page.waitForTimeout(250);
  const after = await page.locator('#bubble').textContent();
  if (after && after !== before && !after.includes('かたむける')) { hitMarcy = true; break; }
}
if (!hitMarcy) problems.push('tap on Marcy in 3D did not mumble');
await page.screenshot({ path: path.join(OUT, '3d-5-marcy.png') });
await page.goto(`${base}/index.html?time=21:00&lang=en`, { waitUntil: 'load' });
await page.waitForTimeout(2500);
await page.screenshot({ path: path.join(OUT, '3d-6-night.png') });
await browser.close(); server.close();
if (problems.length) { console.log('PROBLEMS:\n' + problems.join('\n')); process.exitCode = 1; } else console.log('OK 3D', OUT);
