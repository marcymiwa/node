// NIWA ヒント小屋（スマホ版）: マーシーの窓の うごき。
// しくみ: 「ことば（lines）を じゅんに だす → メニューを だす」を くりかえす。
// もどる は スタック（history）で、窓の ひとつ前の ばめんに もどる。

import { SITE, UI, ROOMS, GARDEN, WORKS, TALK } from './content.js';
import { renderDome, renderHut, motifSVG } from './scene.js';
import { startGlitter } from './glitter.js';
import { Sound } from './sound.js';

const $ = (s) => document.querySelector(s);
const app = $('#app');
const lineEl = $('#line');
const moreEl = $('#more');
const menuEl = $('#menu');
const bodyEl = $('#windowBody');
const backBtn = $('#backBtn');
const bubbleEl = $('#bubble');
const sheetEl = $('#sheet');
const sheetScroll = $('#sheetScroll');
const speakerEl = $('#speaker');

// ---------- ことば ----------
const store = {
  get(k) { try { return localStorage.getItem(k); } catch { return null; } },
  set(k, v) { try { localStorage.setItem(k, v); } catch { /* 保存できなくても動く */ } },
};
const params = new URLSearchParams(location.search);
let lang = params.get('lang') || store.get('niwa.lang') || ((navigator.language || 'ja').startsWith('ja') ? 'ja' : 'en');
if (lang !== 'ja' && lang !== 'en') lang = 'ja';
const t = (o) => (o == null ? '' : typeof o === 'string' ? o : (o[lang] ?? o.ja ?? ''));
const fmt = (o, vars) => t(o).replace(/\{(\w+)\}/g, (_, k) => vars[k] ?? '');

const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const sound = new Sound();

// ---------- 時間帯 ----------
function timeOfDay(d = new Date()) {
  const forced = params.get('time');
  const h = forced ? Number(forced.split(':')[0]) : d.getHours();
  if (h >= 5 && h < 8) return 'dawn';
  if (h >= 8 && h < 16) return 'day';
  if (h >= 16 && h < 19) return 'dusk';
  return 'night';
}
function applyTime() {
  const tod = timeOfDay();
  app.dataset.tod = tod;
  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta) meta.content = { dawn: '#b9a6ff', day: '#8fc8ff', dusk: '#6b5bd6', night: '#141a3d' }[tod];
}

// ---------- 絵 ----------
const roomById = Object.fromEntries([...ROOMS, GARDEN].map((r) => [r.id, r]));
const workById = Object.fromEntries(WORKS.map((w) => [w.id, w]));
renderDome($('#dome'), ROOMS, (id) => openRoom(id, { fromDoor: true }));
const hut = renderHut($('#scene'));

// ---------- ふきだし ----------
let bubbleTimer = 0;
function say(text, ms = 3200) {
  bubbleEl.textContent = text;
  bubbleEl.classList.add('show');
  clearTimeout(bubbleTimer);
  bubbleTimer = setTimeout(() => bubbleEl.classList.remove('show'), ms);
}
let mutterIx = Math.floor(Math.random() * TALK.mutterings.length);
function mutter() {
  mutterIx = (mutterIx + 1) % TALK.mutterings.length;
  say(t(TALK.mutterings[mutterIx]));
  hut.marcy.classList.remove('hop');
  void hut.marcy.getBoundingClientRect();
  hut.marcy.classList.add('hop');
  sound.blip(660);
}
const activate = (node, fn) => {
  node.addEventListener('click', fn);
  node.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); fn(); } });
};
activate(hut.marcy, mutter);
activate(hut.sign, () => runCommand('howto'));

// ---------- 窓: ことばを じゅんに ----------
let queue = [];
let typing = null; // { full, i, timer }
let afterLines = null;

function showLines(lines, then) {
  queue = lines.slice();
  afterLines = then || null;
  hideMenu();
  nextLine();
}

function nextLine() {
  if (typing) { finishTyping(); return; }
  if (!queue.length) {
    moreEl.classList.remove('on');
    const fn = afterLines; afterLines = null;
    if (fn) fn();
    return;
  }
  typeLine(t(queue.shift()));
}

function typeLine(full) {
  moreEl.classList.remove('on');
  lineEl.textContent = '';
  const chars = Array.from(full);
  if (reduceMotion) { lineEl.textContent = full; doneTyping(); return; }
  typing = { full, i: 0, timer: 0 };
  const step = () => {
    if (!typing) return;
    typing.i += 1;
    lineEl.textContent = chars.slice(0, typing.i).join('');
    const ch = chars[typing.i - 1];
    if (ch && ch.trim() && typing.i % 2 === 0) sound.tick();
    if (typing.i >= chars.length) { doneTyping(); return; }
    const pause = /[、。！？!?,.\n…]/.test(ch) ? 110 : 34;
    typing.timer = setTimeout(step, pause);
  };
  step();
}
function finishTyping() {
  clearTimeout(typing.timer);
  lineEl.textContent = typing.full;
  doneTyping();
}
function doneTyping() {
  typing = null;
  // つぎが あるか、終わったあとに なにか あるときだけ ▼
  if (queue.length || afterLines) moreEl.classList.add('on');
  if (!queue.length && afterLines) {
    // メニューへ つづくときは すぐ出す（タップを へらす）
    const fn = afterLines;
    if (fn.auto) { afterLines = null; moreEl.classList.remove('on'); fn(); }
  }
}

bodyEl.addEventListener('click', () => { sound.unlock(); nextLine(); });
document.addEventListener('keydown', (e) => {
  if (!sheetEl.hidden) { if (e.key === 'Escape') closeSheet(); return; }
  if ((e.key === 'Enter' || e.key === ' ') && document.activeElement === document.body) { e.preventDefault(); nextLine(); }
  if (e.key === 'Escape' || e.key === 'Backspace') { if (!backBtn.hidden) { e.preventDefault(); goBack(); } }
  if (['ArrowDown', 'ArrowUp', 'ArrowLeft', 'ArrowRight'].includes(e.key) && !menuEl.hidden) moveCursor(e);
});

// ---------- メニュー ----------
let cursor = 0;
function hideMenu() { menuEl.hidden = true; menuEl.textContent = ''; }
function showMenu(items, { oneCol = false, label } = {}) {
  menuEl.textContent = '';
  menuEl.classList.toggle('one-col', oneCol);
  menuEl.setAttribute('aria-label', label || t(UI.window));
  items.forEach((it, i) => {
    const b = document.createElement('button');
    b.type = 'button';
    if (it.color) b.style.setProperty('--room-color', it.color);
    if (it.num != null) {
      const n = document.createElement('span'); n.className = 'num'; n.textContent = it.num; n.setAttribute('aria-hidden', 'true'); b.append(n);
    }
    const wrap = document.createElement('span');
    wrap.textContent = it.label;
    if (it.sub) { const s = document.createElement('span'); s.className = 'sub'; s.textContent = it.sub; wrap.append(s); }
    b.append(wrap);
    if (it.tag) { const tg = document.createElement('span'); tg.className = 'tag'; tg.textContent = it.tag; b.append(tg); }
    b.addEventListener('click', (e) => { e.stopPropagation(); sound.unlock(); sound.select(); it.action(); });
    b.addEventListener('pointerenter', () => setCursor(i, false));
    b.addEventListener('focus', () => setCursor(i, false));
    menuEl.append(b);
  });
  menuEl.hidden = false;
  menuEl.scrollTop = 0;
  setCursor(0, false);
}
function setCursor(i, focus = true) {
  const bs = [...menuEl.querySelectorAll('button')];
  if (!bs.length) return;
  cursor = (i + bs.length) % bs.length;
  bs.forEach((b, j) => b.classList.toggle('cur', j === cursor));
  if (focus) { bs[cursor].focus(); sound.tick(); }
}
function moveCursor(e) {
  e.preventDefault();
  const cols = menuEl.classList.contains('one-col') ? 1 : 2;
  const d = { ArrowDown: cols, ArrowUp: -cols, ArrowLeft: -1, ArrowRight: 1 }[e.key];
  setCursor(cursor + d);
}

// ---------- ばめん と もどる ----------
const history = [];
function scene(fn) {
  history.push(fn);
  backBtn.hidden = history.length <= 1;
  fn();
}
function goBack() {
  if (history.length <= 1) return;
  history.pop();
  backBtn.hidden = history.length <= 1;
  sound.back();
  history[history.length - 1]();
}
backBtn.addEventListener('click', (e) => { e.stopPropagation(); goBack(); });

const withMenu = (fn) => Object.assign(fn, { auto: true });

function home(first = false) {
  const lines = first ? TALK.greeting : TALK.again;
  showLines(lines, withMenu(() => showMenu(TALK.commands.map((c) => ({
    label: t(c.label), action: () => runCommand(c.id),
  })))));
}

function runCommand(id) {
  const c = TALK.commands.find((x) => x.id === id);
  if (!c) return;
  if (id === 'rooms') return scene(roomsMenu);
  if (id === 'take') return scene(takeMenu);
  if (id === 'works') return scene(worksMenu);
  scene(() => {
    showLines(c.lines || [], withMenu(() => {
      const items = [];
      (c.links || []).forEach((l) => items.push({ label: t(l.label), action: () => window.open(l.url, '_blank', 'noopener') }));
      if (id === 'howto' && SITE.pcUrl) items.push({ label: lang === 'ja' ? 'PC版を ひらく' : 'Open the PC version', action: () => window.open(SITE.pcUrl, '_blank', 'noopener') });
      if (id === 'bye') items.push({ label: t(UI.textOnly), action: () => { location.href = 'list.html'; } });
      items.push({ label: t(UI.back), action: goBack });
      showMenu(items, { oneCol: true });
    }));
  });
}

function roomItems(onPick) {
  return [...ROOMS, GARDEN].map((r) => ({
    num: r.no || '✿', color: r.color, label: t(r.name),
    sub: r.works.length ? `${r.works.length} ${lang === 'ja' ? 'さくひん' : r.works.length > 1 ? 'works' : 'work'}` : '',
    action: () => onPick(r.id),
  }));
}

function roomsMenu() {
  showLines(TALK.roomsIntro, withMenu(() => showMenu(roomItems((id) => scene(() => roomTalk(id))), { oneCol: true })));
}
function takeMenu() {
  showLines(TALK.takeIntro, withMenu(() => showMenu(roomItems((id) => openRoom(id)), { oneCol: true })));
}
function worksMenu() {
  showLines(TALK.worksIntro, withMenu(() => {
    showMenu([
      ...WORKS.filter((w) => w.featured).map((w) => ({ label: t(w.title), tag: '★', color: roomById[w.room]?.color, action: () => openWork(w.id) })),
      { label: lang === 'ja' ? 'ぜんぶ みる' : 'See them all', action: openAllWorks },
    ], { oneCol: true });
  }));
}

function roomTalk(id) {
  const r = roomById[id];
  if (!r) return;
  showLines([{ ja: `${r.no ? `とびら${'①②③④⑤⑥⑦⑧⑨'[r.no - 1]} ` : ''}${r.name.ja}`, en: `${r.no ? `Door ${r.no}: ` : ''}${r.name.en}` }, r.about], withMenu(() => {
    showMenu([
      { label: lang === 'ja' ? 'なかに はいる' : 'Go inside', action: () => openRoom(id) },
      { label: t(UI.back), action: goBack },
    ], { oneCol: true });
  }));
}

function openRoom(id, { fromDoor = false } = {}) {
  const r = roomById[id];
  if (!r) return;
  if (fromDoor) { say(t(r.name), 1800); }
  scene(() => {
    const works = r.works.map((w) => workById[w]).filter(Boolean);
    const lines = [{ ja: fmt(TALK.enterRoom, { room: r.name.ja }), en: fmt(TALK.enterRoom, { room: r.name.en }) }];
    if (!works.length) lines.push(TALK.roomEmpty);
    showLines(lines, withMenu(() => {
      showMenu([
        ...works.map((w) => ({ label: t(w.title), sub: [w.year, t(w.format)].filter(Boolean).join(' / '), color: r.color, action: () => openWork(w.id) })),
        { label: t(UI.back), action: goBack },
      ], { oneCol: true });
    }));
  });
}

// ---------- 作品の窓 ----------
let lastFocus = null;
function openSheet(html, roomColor) {
  lastFocus = document.activeElement;
  sheetScroll.innerHTML = html;
  sheetEl.style.setProperty('--room-color', roomColor || 'var(--lilac)');
  sheetEl.hidden = false;
  sheetScroll.scrollTop = 0;
  $('#sheetClose').focus();
  sound.open();
}
function closeSheet() {
  sheetEl.hidden = true;
  sound.back();
  if (lastFocus && lastFocus.focus) lastFocus.focus();
}
$('#sheetClose').addEventListener('click', closeSheet);
sheetEl.addEventListener('click', (e) => { if (e.target === sheetEl) closeSheet(); });
sheetEl.addEventListener('keydown', (e) => {
  if (e.key !== 'Tab') return;
  const f = [...sheetEl.querySelectorAll('button, a[href], summary, [tabindex="0"]')].filter((n) => n.offsetParent !== null);
  if (!f.length) return;
  const first = f[0], last = f[f.length - 1];
  if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
  else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
});

const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

function workHTML(w) {
  const r = roomById[w.room];
  const cap = t(w.caption);
  const visual = w.image
    ? `<img src="${esc(w.image)}" alt="${esc(t(w.alt) || t(w.title))}" loading="lazy" decoding="async">`
    : motifSVG(w.motif, r?.color);
  const rows = [
    [t(UI.room), r ? `${r.no ? `${r.no}. ` : ''}${t(r.name)}` : ''],
    [t(UI.year), w.year],
    [t(UI.place), t(w.place)],
    [t(UI.format), t(w.format)],
    [t(UI.materials), t(w.materials)],
    ...(w.credits || []).map((c) => [t(c.role), t(c.name)]),
  ].filter(([, v]) => v);
  const links = (w.links || []).map((l) => `<li><a class="link-btn" href="${esc(l.url)}" target="_blank" rel="noopener">${esc(t(l.label))} <span aria-hidden="true">↗</span></a></li>`).join('');
  return `
    <p class="work-kicker">${r ? esc(`${r.no ? `${r.no} ` : ''}${t(r.name)}`) : ''}</p>
    <h2 class="work-title" id="sheetTitle">${esc(t(w.title))}</h2>
    <p class="work-meta">${esc([w.year, t(w.place), t(w.format)].filter(Boolean).join(' / '))}</p>
    <figure class="work-visual">${visual}</figure>
    ${cap ? `<p class="work-caption">${esc(cap).replace(/\n/g, '<br>')}</p>` : `<p class="work-caption">${esc(t(UI.tbd))}</p>`}
    ${t(w.point) ? `<p class="work-point">${esc(t(w.point))}</p>` : ''}
    ${t(w.detail) ? `<p class="work-caption">${esc(t(w.detail)).replace(/\n/g, '<br>')}</p>` : ''}
    <details class="details"><summary>${esc(t(UI.details))}</summary><dl>${rows.map(([k, v]) => `<dt>${esc(k)}</dt><dd>${esc(v)}</dd>`).join('')}</dl></details>
    ${links ? `<ul class="links">${links}</ul>` : ''}
    ${r && r.id !== 'garden' ? `<p class="pc-note">${esc(t(UI.pcOnly))}</p>` : ''}
  `;
}

function openWork(id) {
  const w = workById[id];
  if (!w) return;
  openSheet(workHTML(w), roomById[w.room]?.color);
  if (history.length) say(t(w.title), 2200);
}

function openAllWorks() {
  const groups = [GARDEN, ...ROOMS].map((r) => {
    const items = r.works.map((id) => workById[id]).filter(Boolean);
    if (!items.length) return '';
    return `<h3 class="work-meta" style="margin:16px 0 4px">${esc(`${r.no ? `${r.no}. ` : ''}${t(r.name)}`)}</h3>
      <ul class="works-grid">${items.map((w) => `<li><button type="button" data-work="${esc(w.id)}" style="--room-color:${r.color}">
        <span class="thumb">${motifSVG(w.motif, r.color)}</span>
        <span><span class="t">${esc(t(w.title))}</span><span class="m">${esc([w.year, t(w.format)].filter(Boolean).join(' / '))}</span></span>
      </button></li>`).join('')}</ul>`;
  }).join('');
  openSheet(`<h2 class="work-title" id="sheetTitle">${esc(t(UI.allWorks))}</h2>${groups}`);
  sheetScroll.querySelectorAll('[data-work]').forEach((b) => b.addEventListener('click', () => {
    sheetScroll.innerHTML = workHTML(workById[b.dataset.work]);
    sheetEl.style.setProperty('--room-color', roomById[workById[b.dataset.work].room]?.color);
    sheetScroll.scrollTop = 0;
    sound.open();
  }));
}

// ---------- ことばの きりかえ ----------
function applyLang() {
  document.documentElement.lang = lang;
  document.querySelectorAll('[data-i18n]').forEach((n) => { const k = n.dataset.i18n; if (UI[k]) n.textContent = t(UI[k]); });
  document.querySelectorAll('[data-i18n-aria]').forEach((n) => { const k = n.dataset.i18nAria; if (UI[k]) n.setAttribute('aria-label', t(UI[k])); });
  $('#langToggle').querySelectorAll('[lang]').forEach((s) => s.classList.toggle('on', s.lang === lang));
  speakerEl.textContent = t(UI.speaker);
  $('#stage').setAttribute('aria-label', t(UI.stage));
  $('#windowWrap').setAttribute('aria-label', t(UI.window));
  hut.setSign(lang === 'ja' ? 'ヒント' : 'HINT');
  updateSoundChip();
}
$('#langToggle').addEventListener('click', () => {
  lang = lang === 'ja' ? 'en' : 'ja';
  store.set('niwa.lang', lang);
  applyLang();
  // いまの ばめんを ことばを かえて やりなおす
  if (!sheetEl.hidden) closeSheet();
  if (history.length) history[history.length - 1]();
});

// ---------- おと ----------
function updateSoundChip() {
  const b = $('#soundToggle');
  b.setAttribute('aria-pressed', String(sound.enabled));
  b.querySelector('.chip-state').textContent = t(sound.enabled ? UI.soundOn : UI.soundOff);
}
$('#soundToggle').addEventListener('click', () => {
  sound.toggle();
  store.set('niwa.sound', sound.enabled ? '1' : '0');
  updateSoundChip();
  if (sound.enabled) sound.select();
});
if (store.get('niwa.sound') === '1') sound.enabled = true; // 実際に鳴るのは さいしょの タップの あと

// ---------- はじまり ----------
applyTime();
setInterval(applyTime, 60 * 1000);
applyLang();
startGlitter($('#glitter'), { reduced: reduceMotion });
history.push(() => home(false));
setTimeout(() => { say(lang === 'ja' ? 'やっほー！' : 'Hi!', 2600); home(true); }, reduceMotion ? 0 : 450);

// テスト・デバッグ用
window.__niwa = { runCommand, openRoom, openWork, openAllWorks, goBack, get lang() { return lang; } };
