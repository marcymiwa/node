// シェア画像（assets/img/ogp.png 1200×630）を ページから 撮る。
// node tools/make-ogp.mjs
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const { chromium } = require('playwright');
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const MIME = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css', '.svg': 'image/svg+xml', '.png': 'image/png' };
const server = http.createServer((req, res) => {
  let p = decodeURIComponent(new URL(req.url, 'http://x').pathname); if (p.endsWith('/')) p += 'index.html';
  const f = path.join(ROOT, p); if (!f.startsWith(ROOT) || !fs.existsSync(f)) { res.writeHead(404); res.end(); return; }
  res.writeHead(200, { 'content-type': MIME[path.extname(f)] || 'application/octet-stream' }); fs.createReadStream(f).pipe(res);
});
await new Promise((r) => server.listen(0, r));
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 600, height: 315 }, deviceScaleFactor: 2 });
await page.goto(`http://127.0.0.1:${server.address().port}/index.html?time=17:00&lang=ja`, { waitUntil: 'load' });
await page.addStyleTag({ content: `
  .app { max-width: none; flex-direction: row; }
  .topbar { position: absolute; left: 24px; top: 24px; padding: 0; } .toggles { display: none; }
  .logo-niwa { font-size: 64px; } .logo-by { font-size: 22px; }
  .window-wrap { position: absolute; left: 24px; bottom: 24px; width: 250px; padding: 0; background: none; }
  .window { min-height: 0; } .menu, .window-head { display: none !important; }
  .stage { position: absolute; inset: 0 0 0 250px; } .doors { display: none; } .bubble { display: none !important; }` });
await page.waitForTimeout(1600);
await page.evaluate(() => { document.querySelector('#line').textContent = 'こんにちは！まーしーです！'; document.querySelector('#bubble').classList.remove('show'); });
await page.screenshot({ path: path.join(ROOT, 'assets/img/ogp.png') });
await browser.close(); server.close();
console.log('wrote assets/img/ogp.png');
