// NIWA ヒント小屋（スマホ版）: マーシーの窓の うごき。
// PC版（tower の会話）と おなじ ながれ:
//   はなす → 「やっほー！」+ ひとこと → コマンド（あそびかた / へやのこと / さくひん / まーしーのこと / またね）
//   へやのこと → へやを えらぶ → へやの はなし → つれていって → いってらっしゃい！ → へやの なか
//   まーしーのこと → 3 ページ → れんらく
//   またね → （へやを みたあと）おわかれ と いちらん / （まだ）またね！で とじる
// もどる は スタック（history）で、窓の ひとつ前の ばめんに もどる。

import { SITE, UI, ROOMS, GARDEN, WORKS, TALK } from './content.js';
import { renderDome, renderDoors, renderHut, motifSVG } from './scene.js';
import { startGlitter } from './glitter.js';
// 3D（three.js）は つかえる ときだけ あとから 読む。読めなくても 2D で うごく。
function supports3D() {
  try {
    const c = document.createElement('canvas');
    return !!(window.WebGLRenderingContext && (c.getContext('webgl2') || c.getContext('webgl')));
  } catch { return false; }
}
import { Sound } from './sound.js';

const $ = (s) => document.querySelector(s);
const app = $('#app');
const winEl = $('#window');
const lineEl = $('#line');
const srLine = $('#srLine'); // 読み上げ用: 1 行まるごとを 1 回だけ（1 字ずつ 読まれないように）
const moreEl = $('#more');
const menuEl = $('#menu');
const bodyEl = $('#windowBody');
const backBtn = $('#backBtn');
const bubbleEl = $('#bubble');
const sheetEl = $('#sheet');
const sheetScroll = $('#sheetScroll');
const speakerEl = $('#speaker');
const talkBtn = $('#talkBtn');
winEl.setAttribute('tabindex', '-1'); // シートを とじた あとの フォーカスの もどりさき

// ---------- 保存（できなくても動く） ----------
const store = {
  get(k) { try { return localStorage.getItem(k); } catch { return null; } },
  set(k, v) { try { localStorage.setItem(k, v); } catch { /* ignore */ } },
};
const session = {
  get(k) { try { return sessionStorage.getItem(k); } catch { return null; } },
  set(k, v) { try { sessionStorage.setItem(k, v); } catch { /* ignore */ } },
};

// ---------- ことば ----------
const params = new URLSearchParams(location.search);
let lang = params.get('lang') || store.get('niwa.lang') || ((navigator.language || 'ja').toLowerCase().startsWith('ja') ? 'ja' : 'en');
if (lang !== 'ja' && lang !== 'en') lang = 'ja';
const t = (o) => (o == null ? '' : typeof o === 'string' ? o : (o[lang] || o.ja || ''));
const circled = (n) => '①②③④⑤⑥⑦⑧⑨'[n - 1] || '';
const roomLabel = (r) => (r.no ? `${circled(r.no)} ${t(r.name)}` : t(r.name));

const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const sound = new Sound();

// ---------- 時間帯の空 ----------
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
  if (room3d) room3d.applyColors();
  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta) meta.content = { dawn: '#b9a6ff', day: '#8fc8ff', dusk: '#6b5bd6', night: '#141a3d' }[tod];
}

// ---------- 絵 ----------
const roomById = Object.fromEntries([...ROOMS, GARDEN].map((r) => [r.id, r]));
const workById = Object.fromEntries(WORKS.map((w) => [w.id, w]));
renderDome($('#dome'), ROOMS);
const doors = renderDoors($('#doors'), ROOMS, (id) => doorPrompt(id), (r) => `${roomLabel(r)}${t(TALK.door.is)}`);
const hut = renderHut($('#scene'));

// ---------- 訪問の ようす（PC版と おなじく、へやを みたかで あいさつが かわる） ----------
const visit = {
  get talked() { return session.get('niwa.talked') === '1'; },
  set talked(v) { session.set('niwa.talked', v ? '1' : '0'); },
  get rooms() { return (session.get('niwa.rooms') || '').split(',').filter(Boolean); },
  addRoom(id) { const s = new Set(this.rooms); s.add(id); session.set('niwa.rooms', [...s].join(',')); },
};

// ---------- ふきだし ----------
let bubbleTimer = 0;
function say(text, ms = 3200) {
  // 窓が ひらいている ときは 窓の ほうを 読む（ふきだしは 見た目だけ）
  bubbleEl.setAttribute('aria-hidden', String(!winClosed));
  bubbleEl.textContent = text;
  bubbleEl.classList.add('show');
  clearTimeout(bubbleTimer);
  bubbleTimer = setTimeout(() => bubbleEl.classList.remove('show'), ms);
}
let lastMurmur = -1;
function randomMurmur() {
  // 前と おなじ ひとことは さける（PC版と おなじ）
  let i = Math.floor(Math.random() * TALK.murmurs.length);
  if (i === lastMurmur) i = (i + 1) % TALK.murmurs.length;
  lastMurmur = i;
  return TALK.murmurs[i];
}
function hop() {
  if (room3d) room3d.hop();
  hut.marcy.classList.remove('hop');
  void hut.marcy.getBoundingClientRect();
  hut.marcy.classList.add('hop');
}
function onMarcy() {
  sound.unlock();
  if (winClosed) { openTalk(); return; }
  say(t(randomMurmur()));
  hop();
  sound.blip(660);
}
const activate = (node, fn) => {
  node.addEventListener('click', (e) => { e.stopPropagation(); fn(); });
  node.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); e.stopPropagation(); fn(); } });
};
activate(hut.marcy, onMarcy);
const onSign = () => {
  sound.unlock();
  // とじていたら もどりさきに メニューを おいておく（もどれなく ならないように）
  if (winClosed) { openTalk(false); history.length = 0; history.push(menu); }
  scene(howto);
};
activate(hut.sign, onSign);

// ---------- 3D（かたむけると 庭に 立っている みたいに） ----------
let room3d = null;
async function start3D() {
  if (params.has('flat') || !supports3D()) return;
  try {
    const { startRoom3D } = await import('./room3d.js');
    room3d = await startRoom3D({
      stage: $('#stage'), hutSvg: $('#scene svg'), rooms: ROOMS, reduced: reduceMotion,
      onDoor: (id) => doorPrompt(id), onMarcy, onSign,
      onGyro: () => { const b = $('#gyroBtn'); if (b) b.hidden = true; },
    });
    app.classList.add('is3d');
    const ctl = $('#lookCtl'); ctl.hidden = false;
    const gyroBtn = $('#gyroBtn');
    if (room3d.needsPermission && !room3d.gyroOn) gyroBtn.hidden = false;
    gyroBtn.addEventListener('click', async (e) => {
      e.stopPropagation(); sound.unlock();
      const ok = await room3d.requestGyro();
      if (ok) { gyroBtn.hidden = true; say(t(UI.lookHint), 3000); } else say(t(UI.gyroNo), 3000);
    });
    if (params.has('debug')) {
      // 実機の たしかめ用: かたむきの 値と ようすを 画面の 上に 出す
      const hud = document.createElement('pre');
      hud.className = 'debug-hud';
      hud.setAttribute('aria-hidden', 'true');
      document.body.append(hud);
      const fmtv = (v) => (typeof v === 'number' ? v.toFixed(1) : String(v));
      setInterval(() => {
        const d = room3d.debug();
        hud.textContent = Object.entries(d).map(([k, v]) => `${k}: ${fmtv(v)}`).join('\n');
      }, 250);
    }
    $('#recenterBtn').addEventListener('click', (e) => { e.stopPropagation(); room3d.recenter(); sound.back(); });
    setTimeout(() => { if (!winClosed) say(t(UI.lookHint), 3600); }, 3800);
  } catch (err) {
    console.warn('3D を つかわず 2D で ひらきます', err);
    app.classList.remove('is3d');
  }
}

// ---------- 窓: ことばを じゅんに ----------
let queue = [];
let typing = null; // { full, i, timer }
let after = null;

const page = (...parts) => ({ ja: parts.map((p) => (typeof p === 'string' ? p : p.ja)).join('\n'), en: parts.map((p) => (typeof p === 'string' ? p : p.en)).join('\n') });

function showLines(lines, then) {
  // うちかけの 行は すてて、あたらしい ばめんを すぐ 出す
  if (typing) { clearTimeout(typing.timer); typing = null; }
  queue = lines.slice();
  after = then || null;
  hideMenu();
  nextLine();
}
function nextLine() {
  if (typing) { finishTyping(); return; }
  if (!queue.length) {
    moreEl.classList.remove('on');
    const fn = after; after = null;
    if (fn) fn();
    return;
  }
  typeLine(t(queue.shift()));
}
function typeLine(full) {
  moreEl.classList.remove('on');
  srLine.textContent = full;
  const chars = Array.from(full);
  if (reduceMotion) { lineEl.textContent = full; doneTyping(); return; }
  lineEl.textContent = '';
  // PC版の はやさ: 日本語 30 字/秒、英語 60 字/秒
  const base = 1000 / (lang === 'ja' ? 30 : 60);
  typing = { full, i: 0, timer: 0 };
  const step = () => {
    if (!typing) return;
    typing.i += 1;
    lineEl.textContent = chars.slice(0, typing.i).join('');
    const ch = chars[typing.i - 1];
    if (ch && ch.trim() && typing.i % 2 === 0) sound.tick();
    if (typing.i >= chars.length) { doneTyping(); return; }
    typing.timer = setTimeout(step, /[、。！？!?\n…]/.test(ch) ? base * 3 : base);
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
  if (!queue.length && after && after.auto) {
    // 最後の ページの あとに メニューが 出るときは、すぐ出す（タップを へらす）
    const fn = after; after = null; fn();
    return;
  }
  if (queue.length || after) moreEl.classList.add('on');
}
const thenMenu = (fn) => Object.assign(fn, { auto: true });

bodyEl.addEventListener('click', () => { sound.unlock(); nextLine(); });

// ---------- メニュー ----------
let cursor = 0;
function hideMenu() { menuEl.hidden = true; menuEl.textContent = ''; }
function showMenu(items, { oneCol = false } = {}) {
  menuEl.textContent = '';
  menuEl.classList.toggle('one-col', oneCol);
  items.forEach((it, i) => {
    const b = document.createElement(it.href ? 'a' : 'button');
    if (it.href) { b.href = it.href; if (it.newTab) { b.target = '_blank'; b.rel = 'noopener'; } } else b.type = 'button';
    b.className = 'item';
    if (it.color) b.style.setProperty('--room-color', it.color);
    if (it.num != null) {
      const n = document.createElement('span'); n.className = 'num'; n.textContent = it.num; n.setAttribute('aria-hidden', 'true'); b.append(n);
    }
    const wrap = document.createElement('span');
    wrap.className = 'label';
    wrap.textContent = it.label;
    if (it.sub) { const s = document.createElement('span'); s.className = 'sub'; s.textContent = it.sub; wrap.append(s); }
    b.append(wrap);
    if (it.tag) { const tg = document.createElement('span'); tg.className = 'tag'; tg.textContent = it.tag; b.append(tg); }
    b.addEventListener('click', (e) => {
      e.stopPropagation(); sound.unlock(); sound.select();
      if (it.action) { e.preventDefault(); it.action(); }
    });
    b.addEventListener('pointerenter', () => setCursor(i, false));
    b.addEventListener('focus', () => setCursor(i, false));
    menuEl.append(b);
  });
  menuEl.hidden = false;
  menuEl.scrollTop = 0;
  setCursor(0, false);
}
function setCursor(i, focus = true) {
  const bs = [...menuEl.querySelectorAll('.item')];
  if (!bs.length) return;
  cursor = (i + bs.length) % bs.length;
  bs.forEach((b, j) => b.classList.toggle('cur', j === cursor));
  if (focus) { bs[cursor].focus(); sound.tick(); }
}
function moveCursor(e) {
  e.preventDefault();
  const cols = menuEl.classList.contains('one-col') ? 1 : 2;
  const d = { ArrowDown: cols, ArrowUp: -cols, ArrowLeft: -1, ArrowRight: 1, s: cols, w: -cols }[e.key];
  setCursor(cursor + d);
}

// ---------- ばめん と もどる ----------
const history = [];
let goTimer = 0; // 「いってらっしゃい！」の あとで へやを ひらく タイマー
const cancelGo = () => { clearTimeout(goTimer); goTimer = 0; };
function scene(fn) {
  cancelGo();
  history.push(fn);
  backBtn.hidden = history.length <= 1;
  fn();
}
function goBack() {
  cancelGo();
  if (history.length <= 1) return;
  history.pop();
  backBtn.hidden = history.length <= 1;
  sound.back();
  history[history.length - 1]();
}
function toMenu() {
  // コマンドに もどる（ほかに ききたいことは ある？）
  history.length = 0;
  scene(menu);
}
backBtn.addEventListener('click', (e) => { e.stopPropagation(); goBack(); });

// キーボード（PC版の 窓と おなじ: Enter/Space/E = けってい、Esc/Backspace = もどる、↑↓ = カーソル）
document.addEventListener('keydown', (e) => {
  if (!sheetEl.hidden) { if (e.key === 'Escape') { e.preventDefault(); closeSheet(); } return; }
  // ボタンや リンク、role="button" の 絵（まーしー・かんばん）に いるときは、そちらに まかせる
  const ae = document.activeElement;
  const onItem = !!(ae && ae.closest && ae.closest('button, a, [role="button"]'));
  if (['ArrowDown', 'ArrowUp', 'ArrowLeft', 'ArrowRight'].includes(e.key) && !menuEl.hidden) { moveCursor(e); return; }
  if ((e.key === 'Enter' || e.key === ' ' || e.key === 'e') && !onItem) {
    e.preventDefault();
    if (winClosed) { openTalk(); return; }
    if (!menuEl.hidden && !typing) { const b = menuEl.querySelectorAll('.item')[cursor]; if (b) b.click(); return; }
    nextLine();
    return;
  }
  if (e.key === 'Escape' || (e.key === 'Backspace' && !onItem)) {
    if (!backBtn.hidden) { e.preventDefault(); goBack(); }
  }
});

// ---------- 窓を とじる / ひらく ----------
let winClosed = false;
function closeTalk() {
  cancelGo();
  if (typing) { clearTimeout(typing.timer); typing = null; }
  queue = []; after = null;
  winClosed = true;
  history.length = 0;
  winEl.classList.add('closed');
  talkBtn.hidden = false;
  hideMenu();
  lineEl.textContent = '';
  srLine.textContent = '';
  moreEl.classList.remove('on');
  backBtn.hidden = true;
}
function openTalk(greet = true) {
  winClosed = false;
  winEl.classList.remove('closed');
  talkBtn.hidden = true;
  if (greet) { history.length = 0; scene(opening); }
}
talkBtn.addEventListener('click', (e) => { e.stopPropagation(); sound.unlock(); sound.open(); openTalk(); hop(); });

// ---------- 会話の ばめん ----------
function mainMenuItems() {
  return TALK.menu.map((c) => ({
    label: t(c.label),
    // さくひん は PC版と おなじく ことば なしで いちらんを ひらく（メニューは そのまま）
    action: () => (c.id === 'works' ? openWorksList() : scene({ howto, rooms: roomsList, about, bye }[c.id])),
  }));
}

// はじめの あいさつ（PC版: はじめて → やっほー！+自己紹介、ひとこと / それから → やっほー！+ひとこと / へやを みたあと → +おわかれ）
function opening() {
  const pages = [];
  const visited = visit.rooms.length > 0;
  const first = !visit.talked;
  if (first) {
    pages.push(page(TALK.hello, TALK.intro), randomMurmur());
  } else {
    pages.push(page(TALK.hello, randomMurmur()));
    if (visited) pages.push(SITE.contact.pdf ? TALK.farewellPdf : TALK.farewell);
  }
  say(t(TALK.hello), 2400);
  showLines(pages, thenMenu(() => {
    // あいさつが おわってから「はなした」に する。もどる で あいさつを くりかえさない ように、そこを メニューに かえる
    visit.talked = true;
    if (history[0] === opening) history[0] = menu;
    showMenu(mainMenuItems());
  }));
}

function menu() {
  showLines([TALK.menuAgain], thenMenu(() => showMenu(mainMenuItems())));
}

// あそびかたの あとは PC版と おなじく「ほかに ききたいことは ある？」へ
function menuPc() {
  showLines([TALK.menuAgain], thenMenu(() => showMenu([...mainMenuItems(), { label: t(UI.openPc), href: SITE.pcUrl }])));
}
function howto() {
  showLines(TALK.howto, () => {
    history.length = 0;
    scene(SITE.pcUrl ? menuPc : menu);
  });
}

function roomItems(onPick) {
  return ROOMS.map((r) => ({
    num: circled(r.no), color: r.color, label: t(r.name),
    tag: r.soon ? t(UI.soon) : '',
    action: () => onPick(r.id),
  }));
}
function roomsList() {
  showLines([TALK.roomsAsk], thenMenu(() => showMenu([
    ...roomItems((id) => scene(() => roomPage(id))),
    { label: t(UI.back), action: goBack },
  ], { oneCol: true })));
}

const ledeOf = (r, l) => (r.lede == null ? '' : typeof r.lede === 'string' ? r.lede : (r.lede[l] || ''));
function roomLede(r) {
  // じゅんびちゅうの へやは、ことばに まだ なければ たす（PC版と おなじ）
  const lede = { ja: ledeOf(r, 'ja'), en: ledeOf(r, 'en') };
  if (r.soon && !lede.ja.includes(UI.soon.ja)) {
    lede.ja = [lede.ja, UI.soon.ja].filter(Boolean).join('\n');
    lede.en = [lede.en, UI.soon.en].filter(Boolean).join('\n');
  }
  return lede;
}
function roomPage(id) {
  const r = roomById[id];
  const lede = roomLede(r);
  const text = {
    ja: [roomLabelFor(r, 'ja'), lede.ja].filter(Boolean).join('\n'),
    en: [roomLabelFor(r, 'en'), lede.en].filter(Boolean).join('\n'),
  };
  showLines([text], thenMenu(() => showMenu([
    { label: t(TALK.take), action: () => goTo(id) },
    { label: t(UI.back), action: goBack },
  ], { oneCol: true })));
}
const roomLabelFor = (r, l) => (r.no ? `${circled(r.no)} ${r.name[l]}` : r.name[l]);

function goTo(id) {
  showLines([TALK.going], null);
  sound.open();
  cancelGo();
  goTimer = setTimeout(() => { goTimer = 0; openRoom(id); }, reduceMotion ? 0 : 900);
}

// かべの とびらを タップ → 「① 解築停留所の とびらだ。… はいる？」
function doorPrompt(id) {
  const r = roomById[id];
  if (!r) return;
  sound.unlock(); sound.select();
  if (winClosed) openTalk(false);
  if (!sheetEl.hidden) closeSheet(true);
  // とびらの はなしが つづけて つみかさならない ように、上の とびらは いれかえる
  if (history.length && history[history.length - 1].door) history.pop();
  if (!history.length) history.push(menu);
  const fn = () => {
    const lede = roomLede(r);
    const text = {
      ja: [`${roomLabelFor(r, 'ja')}${TALK.door.is.ja}`, lede.ja, TALK.door.ask.ja].filter(Boolean).join('\n'),
      en: [`${roomLabelFor(r, 'en')}${TALK.door.is.en}`, lede.en, TALK.door.ask.en].filter(Boolean).join('\n'),
    };
    showLines([text], thenMenu(() => showMenu([
      { label: t(TALK.enter), action: () => openRoom(id) },
      { label: t(TALK.cancel), action: goBack },
    ])));
  };
  fn.door = id;
  scene(fn);
}

function about() {
  showLines(TALK.about, thenMenu(() => contact()));
}
function contactItems() {
  return [
    { label: t(TALK.mail), sub: SITE.contact.email, href: `mailto:${SITE.contact.email}` },
    { label: 'Instagram', sub: SITE.contact.instagram.handle, href: SITE.contact.instagram.url, newTab: true },
  ];
}
function contact() {
  showLines([TALK.contact], thenMenu(() => showMenu([
    ...contactItems(),
    { label: t(UI.back), action: goBack },
  ], { oneCol: true })));
}

function bye() {
  if (!visit.rooms.length) {
    // まだ へやを みていない → 「またね！」で とじる
    showLines([TALK.byeShort], null);
    setTimeout(() => { if (lineEl.textContent === t(TALK.byeShort)) closeTalk(); }, reduceMotion ? 600 : 1100 + 400);
    return;
  }
  showLines([SITE.contact.pdf ? TALK.farewellPdf : TALK.farewell], thenMenu(() => showMenu([
    { label: t(UI.allWorks), action: openWorksList },
    ...(SITE.contact.pdf ? [{ label: 'PDF', href: SITE.contact.pdf, newTab: true }] : []),
    { label: t(UI.textOnly), href: SITE.textUrl },
    { label: t(TALK.contactLabel), action: () => scene(contact) },
    { label: t(UI.close), action: closeTalk },
  ], { oneCol: true })));
}

// ---------- 作品の窓・へやの なか（シート） ----------
let lastFocus = null;
function openSheet(html, { color, kind = 'work' } = {}) {
  if (sheetEl.hidden) lastFocus = document.activeElement;
  sheetScroll.innerHTML = html;
  sheetEl.dataset.kind = kind;
  sheetEl.style.setProperty('--room-color', color || 'var(--lilac)');
  sheetEl.hidden = false;
  sheetScroll.scrollTop = 0;
  bindSheetLinks();
  $('#sheetClose').focus({ preventScroll: true });
  sound.open();
}
function closeSheet(silent = false) {
  if (sheetEl.hidden) return;
  sheetEl.hidden = true;
  if (!silent) sound.back();
  // まえの ばしょが きえていたら、窓（メニュー）か「はなす」に もどす
  const target = (lastFocus && lastFocus.focus && lastFocus !== document.body && document.contains(lastFocus))
    ? lastFocus
    : (winClosed ? talkBtn : (menuEl.querySelector('.item.cur') || winEl));
  target.focus({ preventScroll: true });
}
$('#sheetClose').addEventListener('click', () => closeSheet());
sheetEl.addEventListener('click', (e) => { if (e.target === sheetEl) closeSheet(); });
sheetEl.addEventListener('keydown', (e) => {
  if (e.key !== 'Tab') return;
  const f = [...sheetEl.querySelectorAll('button, a[href], summary')].filter((n) => n.offsetParent !== null);
  if (!f.length) return;
  const first = f[0], last = f[f.length - 1];
  if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
  else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
});
function bindSheetLinks() {
  sheetScroll.querySelectorAll('[data-work]').forEach((b) => b.addEventListener('click', () => openWork(b.dataset.work)));
  sheetScroll.querySelectorAll('[data-room]').forEach((b) => b.addEventListener('click', () => openRoom(b.dataset.room)));
  sheetScroll.querySelectorAll('[data-act="contact"]').forEach((b) => b.addEventListener('click', () => { closeSheet(); if (winClosed) openTalk(false); if (!history.length) history.push(menu); scene(contact); }));
  sheetScroll.querySelectorAll('[data-act="list"]').forEach((b) => b.addEventListener('click', openWorksList));
}

const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const br = (s) => esc(s).replace(/\n/g, '<br>');

function workRowHTML(w) {
  const r = roomById[w.room];
  const place = r ? (r.id === 'garden' ? t(UI.garden) : roomLabel(r)) : '';
  return `<li><button type="button" class="work-row" data-work="${esc(w.id)}" style="--room-color:${r?.color || 'var(--lilac)'}">
    <span class="thumb">${motifSVG(w.motif, r?.color)}</span>
    <span class="row-text"><span class="t">${w.hero ? `<span class="star" aria-label="${esc(t(UI.featured))}">★</span>` : ''}${esc(t(w.title))}</span>
    <span class="m">${esc([w.year, place].filter(Boolean).join(' · '))}</span></span>
  </button></li>`;
}

// PC版と おなじ: 「① 解築停留所(教室)」/「① Kaichiku Teiryujo (Classroom)」
function roomVal(w, r) {
  if (!r) return '';
  if (r.id === 'garden') return t(UI.garden);
  const spot = t(w.spot);
  return roomLabel(r) + (spot ? (lang === 'ja' ? `(${spot})` : ` (${spot})`) : '');
}

function workHTML(w) {
  const r = roomById[w.room];
  const rows = [
    [t(UI.year), w.year],
    [t(UI.place), t(w.place)],
    [t(UI.format), t(w.format)],
    [t(UI.room), roomVal(w, r)],
  ].filter(([, v]) => v);
  const sub = t(w.subtitle);
  return `
    <p class="work-kicker">${esc(r ? (r.id === 'garden' ? t(UI.garden) : roomLabel(r)) : '')}${w.hero ? ` <span class="star">★ ${esc(t(UI.featured))}</span>` : ''}</p>
    <h2 class="work-title" id="sheetTitle">${esc(t(w.title))}</h2>
    ${sub ? `<p class="work-sub">${esc(sub)}</p>` : ''}
    <p class="work-meta">${esc([w.year, t(w.format)].filter(Boolean).join(' · '))}</p>
    <figure class="work-visual">${motifSVG(w.motif, r?.color)}</figure>
    ${t(w.lede) ? `<p class="work-lede">${br(t(w.lede))}</p>` : ''}
    ${t(w.approach) ? `<p class="work-label">${esc(t(UI.approach))}</p><p class="work-lede">${br(t(w.approach))}</p>` : ''}
    ${t(w.point) ? `<div class="work-point"><p class="work-label">${esc(t(UI.point))}</p><p>${br(t(w.point))}</p></div>` : ''}
    <dl class="facts">${rows.map(([k, v]) => `<dt>${esc(k)}</dt><dd>${esc(v)}</dd>`).join('')}</dl>
    ${t(w.caption) ? `<details class="details"><summary>${esc(t(UI.caption))}</summary><p class="deep">${br(t(w.caption))}</p></details>` : ''}
    ${r && r.id !== 'garden' ? `<p class="pc-note">${esc(t(UI.pcOnly))}${SITE.pcUrl ? ` <a href="${esc(SITE.pcUrl)}">${esc(t(UI.openPc))} →</a>` : ''}</p>` : ''}
    <p class="sheet-foot"><button type="button" class="link-btn" data-act="list">← ${esc(t(UI.allWorks))}</button></p>
  `;
}

function openWork(id) {
  const w = workById[id];
  if (!w) return;
  openSheet(workHTML(w), { color: roomById[w.room]?.color, kind: 'work' });
}

function openWorksList() {
  const heroes = WORKS.filter((w) => w.hero);
  const rest = WORKS.filter((w) => !w.hero);
  openSheet(`
    <h2 class="sheet-title" id="sheetTitle">${esc(t(UI.allWorks))}</h2>
    <ul class="works-grid">${heroes.map(workRowHTML).join('')}</ul>
    <ul class="works-grid">${rest.map(workRowHTML).join('')}</ul>
    <p class="sheet-foot"><a class="link-btn" href="${esc(SITE.textUrl)}">${esc(t(UI.textOnly))}</a>${SITE.contact.pdf ? ` <a class="link-btn" href="${esc(SITE.contact.pdf)}" target="_blank" rel="noopener">PDF</a>` : ''}</p>
  `, { kind: 'list' });
}

// へやの なか（スマホでは シートで みせる）
function openRoom(id) {
  const r = roomById[id];
  if (!r) return;
  visit.addRoom(id);
  const works = r.works.map((w) => workById[w]).filter(Boolean);
  let inside = '';
  if (works.length) inside += `<ul class="works-grid">${works.map(workRowHTML).join('')}</ul>`;
  if (r.clips) {
    inside += `<p class="work-label">${esc(t(UI.clips))}</p><ul class="clips">${r.clips.map((c) => `<li><span class="clip-sw" style="background:linear-gradient(135deg, ${c.colors.join(', ')})" aria-hidden="true"></span><span>${esc(c.id)} — ${esc(c.name)}</span></li>`).join('')}</ul>`;
  }
  if (r.items) {
    inside += `<p class="work-label">${esc(t(UI.items))}</p><ul class="chips">${r.items.map((it) => `<li>${esc(t(it))}</li>`).join('')}</ul>
      <p class="sheet-foot"><button type="button" class="link-btn" data-act="contact">→ ${esc(t(TALK.contactLabel))}</button></p>`;
  }
  openSheet(`
    <p class="work-kicker">${r.no ? esc(circled(r.no)) : '✿'} ${r.soon ? `<span class="star">${esc(t(UI.soon))}</span>` : ''}</p>
    <h2 class="work-title" id="sheetTitle">${esc(t(r.name))}</h2>
    ${t(r.lede) ? `<p class="work-lede">${br(t(r.lede))}</p>` : ''}
    ${inside}
    ${r.id !== 'garden' ? `<p class="pc-note">${esc(t(UI.pcOnly))}${SITE.pcUrl ? ` <a href="${esc(SITE.pcUrl)}">${esc(t(UI.openPc))} →</a>` : ''}</p>` : ''}
  `, { color: r.color, kind: 'room' });
  // 窓は「ほかに ききたいことは ある？」に もどしておく
  if (!winClosed) toMenu();
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
  if (room3d) room3d.setSign();
  doors.relabel();
  updateSoundChip();
}
$('#langToggle').addEventListener('click', () => {
  lang = lang === 'ja' ? 'en' : 'ja';
  store.set('niwa.lang', lang);
  applyLang();
  closeSheet(true);
  cancelGo();
  if (!winClosed && history.length) history[history.length - 1]();
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
start3D();
setTimeout(() => scene(opening), reduceMotion ? 0 : 450);

// テスト・デバッグ用
window.__niwa = { get room3d() { return room3d; }, doorPrompt, openRoom, openWork, openWorksList, goBack, closeTalk, openTalk, get lang() { return lang; } };
