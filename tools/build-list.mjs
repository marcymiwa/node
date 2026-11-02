// もじだけの ページ（list.html）を content.js から つくる。JS が なくても 読める。
// ならびは PC版の list.html と おなじ: 代表作 → へや → 庭 → まーしーのこと → れんらく。
// node tools/build-list.mjs
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const { SITE, UI, ROOMS, GARDEN, WORKS, TALK } = await import(pathToFileURL(path.join(ROOT, 'assets/js/content.js')).href);
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const br = (s) => esc(s).replace(/\n/g, '<br>');
const byId = Object.fromEntries(WORKS.map((w) => [w.id, w]));
const circled = (n) => '①②③④⑤⑥⑦⑧⑨'[n - 1] || '';

const L = {
  featured: { ja: '代表作', en: 'Featured works' },
  rooms: { ja: 'へや', en: 'Rooms' },
  about: { ja: 'まーしーのこと', en: 'About Marcy' },
  contact: { ja: 'れんらく', en: 'Contact' },
  skills: { ja: 'スキル', en: 'Skills' },
  toc: { ja: 'もくじ', en: 'Contents' },
  hut: { ja: 'ヒント小屋へ', en: 'To the hint hut' },
  top: { ja: 'うえへ', en: 'Back to top' },
};

const section = (lang) => {
  const t = (o) => (o == null ? '' : typeof o === 'string' ? o : (o[lang] || o.ja || ''));
  const id = (s) => `${lang}-${s}`;
  const roomName = (r) => (r.id === 'garden' ? t(UI.garden) : `${circled(r.no)} ${t(r.name)}`);
  const roomOf = (w) => [...ROOMS, GARDEN].find((r) => r.id === w.room);
  // へやの どこ は PC版と おなじく へやの 名前に つける: ① 解築停留所(教室) / ① Kaichiku Teiryujo (Classroom)
  const roomVal = (w, r) => roomName(r) + (t(w.spot) ? (lang === 'ja' ? `(${t(w.spot)})` : ` (${t(w.spot)})`) : '');
  const ledeP = (o) => (t(o) ? `<p>${br(t(o))}</p>` : '');
  const workLi = (w) => {
    const r = roomOf(w);
    const meta = [w.year, t(w.format), r ? roomVal(w, r) : ''].filter(Boolean).join(' · ');
    const body = [t(w.lede), t(w.point) ? `→ ${t(w.point)}` : ''].filter(Boolean);
    return `<li><strong class="wt">${esc(t(w.title))}</strong>${t(w.subtitle) ? ` <span class="m">(${esc(t(w.subtitle))})</span>` : ''}<br><span class="m">${esc(meta)}</span>${body.map((b) => `<br>${br(b)}`).join('')}${
      t(w.caption) ? `<details><summary>${esc(t(UI.caption))}</summary><p class="deep">${br(t(w.caption))}</p></details>` : ''}</li>`;
  };
  const featured = WORKS.filter((w) => w.hero).map(workLi).join('\n');
  const rooms = ROOMS.map((r) => {
    const works = r.works.map((wid) => byId[wid]).filter(Boolean);
    return `<section class="room" style="--c:${r.color}"><h3>${esc(roomName(r))}${r.soon ? ` <span class="badge">${esc(t(UI.soon))}</span>` : ''}</h3>
${ledeP(r.lede)}
${works.length ? `<ul>${works.map(workLi).join('\n')}</ul>` : ''}
${r.items ? `<p>${r.items.map((it) => `<span class="pill">${esc(t(it))}</span>`).join(' ')}</p><p><a href="#${id('contact')}">→ ${esc(t(L.contact))}</a></p>` : ''}
${r.clips ? `<p class="m">${esc(t(UI.clips))}: ${r.clips.map((c) => esc(c.name)).join(' / ')}</p>` : ''}</section>`;
  }).join('\n');
  const garden = GARDEN.works.map((wid) => byId[wid]).filter(Boolean);
  return `<article lang="${lang}" id="${lang}">
<nav class="toc" aria-label="${esc(t(L.toc))}"><a href="#${id('featured')}">${esc(t(L.featured))}</a><a href="#${id('rooms')}">${esc(t(L.rooms))}</a><a href="#${id('garden')}">${esc(t(UI.garden))}</a><a href="#${id('about')}">${esc(t(L.about))}</a><a href="#${id('contact')}">${esc(t(L.contact))}</a></nav>
<h2 id="${id('featured')}">${esc(t(L.featured))}</h2>
<ul>${featured}</ul>
<h2 id="${id('rooms')}">${esc(t(L.rooms))}</h2>
${rooms}
<h2 id="${id('garden')}" class="garden">${esc(t(UI.garden))}</h2>
${ledeP(GARDEN.lede)}
<ul>${garden.map(workLi).join('\n')}</ul>
<h2 id="${id('about')}">${esc(t(L.about))}</h2>
<p><strong>${esc(t(UI.speaker))}</strong> — Marcy Miwa</p>
<p class="motto">${esc(t(TALK.about[0]))}</p>
<p>${esc(t(TALK.about[1]))}</p>
<p><span class="m">${esc(t(L.skills))}:</span> ${esc(t(TALK.about[2]))}</p>
<h2 id="${id('contact')}" class="contact">${esc(t(L.contact))}</h2>
<p><a href="mailto:${esc(SITE.contact.email)}">${esc(SITE.contact.email)}</a></p>
<p><a href="${esc(SITE.contact.instagram.url)}" rel="noopener">Instagram ${esc(SITE.contact.instagram.handle)}</a></p>
${SITE.contact.pdf ? `<p><a href="${esc(SITE.contact.pdf)}">PDF</a></p>` : ''}
<p><a href="#top">↑ ${esc(t(L.top))}</a></p>
</article>`;
};

const html = `<!doctype html>
<html lang="ja">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>NIWA by Marcy Miwa — もじだけのページ / Text-only page</title>
<meta name="description" content="こんにちは！まーしーです！ 作品の一覧(文字だけの版)。">
<meta property="og:title" content="NIWA by Marcy Miwa">
<meta property="og:description" content="こんにちは！まーしーです！">
<link rel="icon" href="assets/img/favicon.svg" type="image/svg+xml">
<style>
:root { --ink:#2a2140; --paper:#fff6e9; --pink:#f23a9a; --blue:#2f4fb8; --lilac:#9d7eff; --lime:#a8e032; --sun:#ffbe2e; }
* { box-sizing: border-box; }
body { margin:0; background:var(--paper); color:var(--ink); font: 17px/1.85 "Hiragino Maru Gothic ProN","Hiragino Sans","Yu Gothic","Noto Sans JP",system-ui,sans-serif; }
main { max-width: 680px; margin: 0 auto; padding: 24px 16px 64px; }
.kind { display:inline-block; margin:0 0 10px; padding:2px 12px; border:2px solid var(--ink); border-radius:999px; font-size:16px; }
h1 { font-size: 40px; line-height:1.15; margin: 0 0 4px; color: var(--pink); text-shadow: 3px 3px 0 var(--blue); letter-spacing:.12em; }
h1 small { display:block; font-size:17px; color: var(--ink); text-shadow:none; letter-spacing:.02em; }
h2 { font-size: 21px; margin: 44px 0 10px; padding: 6px 16px 5px; width: fit-content; border: 2px solid var(--ink); border-radius: 999px; background: linear-gradient(180deg,#e2d7ff,#b9a2ff); }
h2.garden { background: linear-gradient(180deg,#e4f7b4,var(--lime)); }
h2.contact { background: linear-gradient(180deg,#ffe6a8,var(--sun)); }
h3 { font-size: 19px; margin: 26px 0 4px; padding-left: 12px; border-left: 8px solid var(--c, var(--lilac)); }
a { color: var(--ink); text-decoration: underline dashed var(--pink); text-underline-offset: 4px; }
a:focus-visible, summary:focus-visible { outline: 3px dashed var(--pink); outline-offset: 3px; }
ul { padding-left: 1.2em; }
li { margin: 0 0 14px; }
.wt { font-size: 18px; }
.m { opacity:.75; }
.badge, .pill { display:inline-block; padding: 0 10px; border:2px solid var(--ink); border-radius:999px; font-size:16px; line-height:1.6; background:#ffe6a8; }
.pill { background:#fff8f2; }
.motto { font-family: "Hiragino Mincho ProN","Yu Mincho",serif; font-size: 19px; }
.deep { font-family: "Hiragino Mincho ProN","Yu Mincho",serif; line-height: 2.05; }
details summary { cursor: pointer; min-height: 44px; display:flex; align-items:center; }
nav { display:flex; flex-wrap:wrap; gap:10px; margin: 12px 0 0; }
nav a { display:inline-flex; align-items:center; min-height:44px; padding:0 14px; border:2px solid var(--ink); border-radius:999px; text-decoration:none; background:#fff8f2; }
.toc { margin-top: 28px; }
hr { border:0; border-top: 2px dashed rgba(42,33,64,.3); margin: 56px 0; }
footer { margin-top: 48px; font-size:16px; opacity:.8; }
</style>
</head>
<body>
<main id="top">
<p class="kind">もじだけの ページ / Text-only page</p>
<h1>NIWA <small>by Marcy Miwa</small></h1>
<p>こんにちは！まーしーです！</p>
<nav aria-label="Language / ヒント小屋"><a href="index.html">${esc(L.hut.ja)} / ${esc(L.hut.en)}</a><a href="#ja" lang="ja">日本語</a><a href="#en" lang="en">English</a></nav>
${section('ja')}
<hr>
${section('en')}
<footer>NIWA by Marcy Miwa</footer>
</main>
</body>
</html>
`;
fs.writeFileSync(path.join(ROOT, 'list.html'), html);
console.log('wrote list.html', html.length, 'bytes');
