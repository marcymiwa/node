// もじだけの ページ（list.html）を content.js から つくる。JS が なくても 読める。
// node tools/build-list.mjs
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const { SITE, ROOMS, GARDEN, WORKS, TALK } = await import(pathToFileURL(path.join(ROOT, 'assets/js/content.js')).href);
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const byId = Object.fromEntries(WORKS.map((w) => [w.id, w]));
const me = TALK.commands.find((c) => c.id === 'me');
const contact = TALK.commands.find((c) => c.id === 'contact');

const section = (lang) => {
  const t = (o) => (o == null ? '' : typeof o === 'string' ? o : (o[lang] ?? o.ja ?? ''));
  const rooms = [GARDEN, ...ROOMS].map((r) => {
    const works = r.works.map((id) => byId[id]).filter(Boolean);
    return `<section class="room"><h3>${r.no ? `${r.no}. ` : ''}${esc(t(r.name))}</h3><p>${esc(t(r.about))}</p>
${works.length ? `<ul>${works.map((w) => `<li><strong>${esc(t(w.title))}</strong>${[w.year, t(w.place), t(w.format)].filter(Boolean).length ? ` <span class="m">— ${esc([w.year, t(w.place), t(w.format)].filter(Boolean).join(' / '))}</span>` : ''}${t(w.caption) ? `<br>${esc(t(w.caption))}` : ''}${(w.links || []).length ? `<br>${w.links.map((l) => `<a href="${esc(l.url)}">${esc(t(l.label))}</a>`).join(' · ')}` : ''}</li>`).join('\n')}</ul>` : ''}</section>`;
  }).join('\n');
  return `<article lang="${lang}" id="${lang}">
<h2>${lang === 'ja' ? 'まーしーのこと' : 'About Marcy'}</h2>
${(me?.lines || []).map((l) => `<p>${esc(t(l)).replace(/\n/g, '<br>')}</p>`).join('\n')}
<h2>${lang === 'ja' ? 'へや と さくひん' : 'Rooms and works'}</h2>
${rooms}
<h2>${lang === 'ja' ? 'れんらく' : 'Contact'}</h2>
${(contact?.lines || []).map((l) => `<p>${esc(t(l))}</p>`).join('\n')}
<p>${(contact?.links || []).map((l) => `<a href="${esc(l.url)}">${esc(t(l.label))}</a>`).join(' · ')}</p>
</article>`;
};

const html = `<!doctype html>
<html lang="ja">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>NIWA by Marcy Miwa — もじだけの ページ / Text only</title>
<meta name="description" content="NIWA（塔の中の温室）の さくひんを もじだけで まとめた ページ。">
<link rel="icon" href="assets/img/favicon.svg" type="image/svg+xml">
<style>
:root { --ink:#2a2140; --paper:#fff6e9; --pink:#f23a9a; }
* { box-sizing: border-box; }
body { margin:0; background:var(--paper); color:var(--ink); font: 17px/1.85 "Hiragino Maru Gothic ProN","Hiragino Sans","Yu Gothic","Noto Sans JP",system-ui,sans-serif; }
main { max-width: 680px; margin: 0 auto; padding: 24px 16px 64px; }
h1 { font-size: 28px; line-height:1.3; margin: 0 0 4px; }
h2 { font-size: 22px; margin: 40px 0 8px; border-bottom: 3px solid var(--ink); }
h3 { font-size: 19px; margin: 24px 0 4px; }
a { color: var(--ink); text-decoration-color: var(--pink); text-underline-offset: 3px; }
a:focus-visible { outline: 3px solid var(--pink); outline-offset: 2px; }
ul { padding-left: 1.2em; }
li { margin: 0 0 10px; }
.m { opacity:.75; }
nav { display:flex; flex-wrap:wrap; gap:12px; margin: 12px 0 0; }
nav a { display:inline-flex; align-items:center; min-height:44px; padding:0 14px; border:2px solid var(--ink); border-radius:999px; text-decoration:none; }
hr { border:0; border-top: 2px dashed rgba(42,33,64,.3); margin: 48px 0; }
</style>
</head>
<body>
<main>
<h1>NIWA <small>by Marcy Miwa</small></h1>
<p>もじだけの ページ / Text-only page</p>
<nav aria-label="ページ内リンク"><a href="index.html">ヒント小屋にもどる</a><a href="#ja">日本語</a><a href="#en">English</a></nav>
${section('ja')}
<hr>
${section('en')}
</main>
</body>
</html>
`;
fs.writeFileSync(path.join(ROOT, 'list.html'), html);
console.log('wrote list.html', html.length, 'bytes');
