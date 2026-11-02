// ヒント小屋の絵（SVG）。温室のドーム・とびら・小屋・まーしー・双葉と花。
// 絵は全部コードで描く（画像を読まないので軽い）。

const NS = 'http://www.w3.org/2000/svg';

function el(tag, attrs = {}, parent) {
  const n = document.createElementNS(NS, tag);
  for (const [k, v] of Object.entries(attrs)) n.setAttribute(k, v);
  if (parent) parent.appendChild(n);
  return n;
}

// 温室（格子のドーム）と、かべぎわの とびら
export function renderDome(svg, rooms, onDoor) {
  svg.textContent = '';
  // ガラスの面
  el('path', { class: 'pane', d: 'M10 400 L10 210 C10 80 120 10 200 10 C280 10 390 80 390 210 L390 400 Z' }, svg);
  const g = el('g', { class: 'lattice' }, svg);
  // 外わく
  el('path', { d: 'M10 400 L10 210 C10 80 120 10 200 10 C280 10 390 80 390 210 L390 400' }, g);
  // たての骨（子午線）
  for (const x of [60, 110, 155, 200, 245, 290, 340]) {
    const k = (x - 200) / 190;
    const top = 10 + 200 * (1 - Math.sqrt(Math.max(0, 1 - k * k)));
    el('path', { d: `M${x} 400 L${x} ${Math.max(top, 14) + 0}` }, g);
  }
  // よこの輪
  for (const y of [70, 130, 190, 250, 310]) {
    const dy = (210 - y) / 200;
    const half = y >= 210 ? 190 : 190 * Math.sqrt(Math.max(0, 1 - dy * dy));
    el('path', { d: `M${200 - half} ${y} L${200 + half} ${y}` }, g);
  }
  // 地面
  el('path', { class: 'ground-edge', d: 'M0 352 Q200 326 400 352 L400 400 L0 400 Z' }, svg);
  el('path', { class: 'ground', d: 'M0 358 Q200 334 400 358 L400 400 L0 400 Z' }, svg);

  // とびら は renderDoors（HTML の ボタン）で 置く。
  // SVG の なかに 置くと、背の ひくい 画面で 上の とびらが 切れて 押せなくなるため。
}

// とびら（左右の かべぎわ、高さちがいの 踊り場）。ステージに たいする % で 置く 本物の ボタン。
// 位置は 左右の かべに ジグザグ（PC版の 温室で 階段を のぼると とびらが ならぶ イメージ）。
const DOOR_SPOTS = [
  { side: 'left', x: 4, y: 72 },
  { side: 'right', x: 4, y: 58 },
  { side: 'left', x: 7, y: 42 },
  { side: 'right', x: 8, y: 26 },
  { side: 'left', x: 15, y: 13 },
];
export function renderDoors(container, rooms, onDoor, labelOf) {
  container.textContent = '';
  rooms.forEach((room, i) => {
    const s = DOOR_SPOTS[i % DOOR_SPOTS.length];
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'door';
    b.dataset.room = room.id;
    b.style.setProperty('--door', room.color);
    b.style[s.side] = `${s.x}%`;
    b.style.top = `${s.y}%`;
    b.setAttribute('aria-label', labelOf(room));
    b.innerHTML = `<span class="door-no" aria-hidden="true">${room.no}</span>`
      + '<svg viewBox="-20 -6 40 34" aria-hidden="true">'
      + '<rect x="-19" y="22" width="38" height="5" rx="2" fill="var(--frame)" stroke="var(--window-edge)" stroke-width="1.5"/>'
      + `<path d="M-11 22 L-11 2 A11 11 0 0 1 11 2 L11 22 Z" fill="${room.color}" stroke="var(--window-edge)" stroke-width="2.2"/>`
      + '<path d="M-7 20 L-7 3 A7 7 0 0 1 0 -4" fill="none" stroke="rgba(255,255,255,.55)" stroke-width="2" stroke-linecap="round"/>'
      + '<circle cx="6" cy="13" r="1.8" fill="var(--window-edge)"/></svg>';
    b.addEventListener('click', (e) => { e.stopPropagation(); onDoor && onDoor(room.id); });
    container.append(b);
  });
  return { relabel() { container.querySelectorAll('.door').forEach((b, i) => b.setAttribute('aria-label', labelOf(rooms[i]))); } };
}

// 小屋と まーしー（NIWA lab candy：ティールの柱・マゼンタとラベンダーの ひさし・ピンクの カウンター）
const INK = 'var(--window-edge)';
const HUT = {
  teal: '#2fb9a0', tealDark: '#177d79', magenta: '#d5087e', lav: '#b9a6e6',
  wallTop: '#f7c4d4', wall: '#e99eb7', side: '#f3b7c8', top: '#f7d3e3', counter: '#f0a8c4', counterDark: '#cf6e97',
  cream: '#fbeef0', signText: '#c2186b', pot: '#e4552d', potDark: '#b23a1c', indigo: '#280d88',
  hair: '#2d1420', skin: '#ffe2d2', cheek: '#ef6b84', dress: '#b58ae6', dressDark: '#8a62cf', leaf: '#3f8f4a',
};
const line = (w = 3) => ({ stroke: INK, 'stroke-width': w, 'stroke-linejoin': 'round', 'stroke-linecap': 'round' });

// つやつやの ティールの柱・梁（ネイルみたいな光）
function tealBar(parent, x, y, w, h, vertical = true) {
  const g = el('g', {}, parent);
  el('rect', { x, y, width: w, height: h, rx: 3, fill: HUT.teal }, g);
  if (vertical) {
    el('rect', { x: x + w * .6, y, width: w * .4, height: h, fill: HUT.tealDark, opacity: .6 }, g);
    el('path', { d: `M${x + w * .3} ${y + 7} L${x + w * .3} ${y + h * .42} M${x + w * .3} ${y + h * .5} L${x + w * .3} ${y + h * .56}`, stroke: '#fff', 'stroke-width': Math.min(3, w * .2), 'stroke-linecap': 'round', opacity: .7 }, g);
  } else {
    el('rect', { x, y: y + h * .6, width: w, height: h * .4, fill: HUT.tealDark, opacity: .6 }, g);
    el('path', { d: `M${x + 10} ${y + h * .3} L${x + w * .55} ${y + h * .3} M${x + w * .6} ${y + h * .3} L${x + w * .64} ${y + h * .3}`, stroke: '#fff', 'stroke-width': Math.min(3, h * .22), 'stroke-linecap': 'round', opacity: .65 }, g);
  }
  el('rect', { x, y, width: w, height: h, rx: 3, fill: 'none', ...line(3) }, g);
  return g;
}

// ステッカー（白いふち＋インクの線）
function sticker(parent, tag, attrs, fill) {
  const g = el('g', {}, parent);
  el(tag, { ...attrs, fill: INK, stroke: INK, 'stroke-width': 7, 'stroke-linejoin': 'round' }, g);
  el(tag, { ...attrs, fill: '#fff', stroke: '#fff', 'stroke-width': 4, 'stroke-linejoin': 'round' }, g);
  el(tag, { ...attrs, fill }, g);
  return g;
}

const HEART = (x, y, s) => `M${x} ${y + s * .9} C${x - s * 1.4} ${y} ${x - s * 1.1} ${y - s * 1.1} ${x} ${y - s * .35} C${x + s * 1.1} ${y - s * 1.1} ${x + s * 1.4} ${y} ${x} ${y + s * .9} Z`;
const STAR = (x, y, r) => {
  let d = '';
  for (let i = 0; i < 10; i++) {
    const a = -Math.PI / 2 + (i * Math.PI) / 5, rr = i % 2 ? r * .5 : r;
    d += `${i ? 'L' : 'M'}${(x + Math.cos(a) * rr).toFixed(1)} ${(y + Math.sin(a) * rr).toFixed(1)} `;
  }
  return d + 'Z';
};

// ころんとした花（鉢・地面 どちらにも）
function chunkyFlower(parent, x, y, petal, r = 4.6) {
  for (let i = 0; i < 5; i++) {
    const a = -Math.PI / 2 + (i / 5) * Math.PI * 2;
    el('circle', { cx: x + Math.cos(a) * r * 1.15, cy: y + Math.sin(a) * r * 1.15, r, fill: petal, ...line(1.4) }, parent);
  }
  el('circle', { cx: x, cy: y, r: r * .62, fill: '#ffd23a', ...line(1.4) }, parent);
}

// 植木鉢（テラコッタ）
function flowerPot(parent, x, base, flowers) {
  const g = el('g', {}, parent);
  flowers.forEach(([dx, dy, c]) => {
    el('path', { d: `M${x} ${base - 18} Q${x + dx * .4} ${base - 26} ${x + dx} ${base - 18 - dy}`, fill: 'none', stroke: HUT.leaf, 'stroke-width': 2.6, 'stroke-linecap': 'round' }, g);
  });
  el('path', { d: `M${x - 2} ${base - 22} C${x - 12} ${base - 30} ${x - 16} ${base - 24} ${x - 13} ${base - 20} C${x - 9} ${base - 18} ${x - 5} ${base - 19} ${x - 2} ${base - 22} Z`, fill: '#6fcf6a', ...line(1.4) }, g);
  el('path', { d: `M${x + 2} ${base - 24} C${x + 12} ${base - 32} ${x + 16} ${base - 26} ${x + 13} ${base - 22} C${x + 9} ${base - 20} ${x + 5} ${base - 21} ${x + 2} ${base - 24} Z`, fill: '#8fe07c', ...line(1.4) }, g);
  flowers.forEach(([dx, dy, c]) => chunkyFlower(g, x + dx, base - 18 - dy, c, 4.2));
  el('path', { d: `M${x - 11} ${base - 14} L${x + 11} ${base - 14} L${x + 8.5} ${base} L${x - 8.5} ${base} Z`, fill: HUT.pot, ...line(2.6) }, g);
  el('path', { d: `M${x + 4} ${base - 13} L${x + 2.5} ${base - 1}`, stroke: HUT.potDark, 'stroke-width': 3, 'stroke-linecap': 'round', opacity: .6 }, g);
  el('rect', { x: x - 14, y: base - 20, width: 28, height: 7, rx: 2.5, fill: HUT.pot, ...line(2.6) }, g);
  el('path', { d: `M${x - 10} ${base - 17.5} L${x - 2} ${base - 17.5}`, stroke: '#ffb08f', 'stroke-width': 2, 'stroke-linecap': 'round' }, g);
  return g;
}

// まーしー と かんばん の よみあげ名（ことばを かえたら labelHut で かきかえる）
const HUT_LABELS = { marcy: 'まーしー（はなす）', sign: 'ヒント（あそびかた）' };

export function renderHut(container, { signText = 'ヒント' } = {}) {
  container.textContent = '';
  // svg ぜんたいは かくさない（まーしー と かんばん は ボタンなので よみあげに のこす）
  const svg = el('svg', { viewBox: '0 0 400 400', role: 'presentation' }, container);
  const reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const defs = el('defs', {}, svg);
  const grad = (tag, id, attrs, stops) => {
    const gr = el(tag, { id, ...attrs }, defs);
    stops.forEach(([o, c, op = 1]) => el('stop', { offset: o, 'stop-color': c, 'stop-opacity': op }, gr));
  };
  grad('linearGradient', 'hut-wall', { x1: 0, y1: 0, x2: 0, y2: 1 }, [['0', HUT.wallTop], ['1', HUT.wall]]);
  grad('radialGradient', 'hut-glow', { cx: '.5', cy: '.5', r: '.5' }, [['0', '#fff6dc', .95], ['.5', '#ffe9c4', .45], ['1', '#ffe9c4', 0]]);
  grad('radialGradient', 'hut-bell', { cx: '.35', cy: '.3', r: '.8' }, [['0', '#ffffff'], ['.35', '#dfe6ff'], ['.7', '#c7b6f2'], ['1', '#8fa0c8']]);
  grad('linearGradient', 'hut-holo', { x1: 0, y1: 0, x2: 1, y2: 0 }, [['0', '#ffb3e6'], ['.33', '#b3f0ff'], ['.66', '#fff1a8'], ['1', '#d9c2ff']]);
  grad('radialGradient', 'hut-beacon', { cx: '.5', cy: '.5', r: '.5' }, [['0', '#8fe6ff', .8], ['1', '#42b8e2', 0]]);

  // かげ
  el('ellipse', { cx: 200, cy: 349, rx: 156, ry: 11, fill: 'rgba(40,30,60,.22)' }, svg);

  // 赤い糸（小屋の よこから そとへ。ノードと結び目）
  const threads = el('g', { fill: 'none', stroke: 'var(--thread)', 'stroke-width': 2.2, 'stroke-linecap': 'round' }, svg);
  el('path', { d: 'M64 186 C44 192 30 206 4 214' }, threads);
  el('path', { d: 'M64 300 C42 296 24 282 2 284', 'stroke-width': 1.6, opacity: .8 }, threads);
  el('path', { d: 'M336 172 C360 166 376 150 398 144' }, threads);
  el('path', { d: 'M336 292 C358 290 378 304 398 300', 'stroke-width': 1.6, opacity: .8 }, threads);
  // 結び目（小さな わ）
  [[30, 203], [372, 154]].forEach(([x, y]) => {
    el('path', { d: `M${x - 4} ${y + 2} C${x - 6} ${y - 7} ${x + 6} ${y - 7} ${x + 4} ${y + 2} C${x + 2} ${y + 5} ${x - 2} ${y + 5} ${x - 4} ${y + 2} Z`, 'stroke-width': 2 }, threads);
  });
  [[64, 186], [336, 172], [64, 300], [336, 292]].forEach(([cx, cy]) => el('circle', { cx, cy, r: 4, fill: 'var(--thread)', stroke: INK, 'stroke-width': 1.2 }, svg));

  const hut = el('g', { class: 'hut' }, svg);

  // ---- なか（おく の かべ・天井・よこの かべ） ----
  const inner = el('g', {}, hut);
  el('rect', { x: 78, y: 156, width: 244, height: 100, fill: 'url(#hut-wall)' }, inner);
  // よこの かべ（てまえが あかるい）
  el('path', { d: 'M78 156 L118 172 L118 256 L78 256 Z', fill: HUT.side }, inner);
  el('path', { d: 'M322 156 L282 172 L282 256 L322 256 Z', fill: HUT.side }, inner);
  // 天井（マゼンタと クリームの しま）
  for (let i = 0; i < 8; i++) {
    const a = 78 + i * 30.5, b = 78 + (i + 1) * 30.5, c = 118 + i * 20.5, d = 118 + (i + 1) * 20.5;
    el('path', { d: `M${a} 156 L${b} 156 L${d} 172 L${c} 172 Z`, fill: i % 2 ? '#f6dccf' : HUT.magenta }, inner);
  }
  // おくの かどの ティールの ふち
  el('path', { d: 'M118 172 L282 172 M118 172 L118 256 M282 172 L282 256', stroke: HUT.teal, 'stroke-width': 3.5, fill: 'none' }, inner);
  // ランプの あかり
  el('ellipse', { class: 'hut-glow', cx: 166, cy: 196, rx: 70, ry: 54, fill: 'url(#hut-glow)' }, inner);
  // まるい窓（ポートホール）
  [[98, 198], [302, 198]].forEach(([cx, cy]) => {
    el('ellipse', { cx, cy, rx: 10, ry: 16, fill: '#bfe9ff', stroke: HUT.teal, 'stroke-width': 5 }, inner);
    el('ellipse', { cx, cy, rx: 12.5, ry: 18.5, fill: 'none', ...line(2) }, inner);
    el('path', { d: `M${cx} ${cy - 14} L${cx} ${cy + 14} M${cx - 8} ${cy} L${cx + 8} ${cy}`, stroke: HUT.teal, 'stroke-width': 2.4 }, inner);
    el('path', { d: `M${cx - 4} ${cy - 9} Q${cx - 6} ${cy - 4} ${cx - 5} ${cy}`, stroke: '#fff', 'stroke-width': 1.8, fill: 'none', 'stroke-linecap': 'round', opacity: .9 }, inner);
  });
  // たな と コップ 7こ
  el('path', { d: 'M142 216 L146 224 M262 216 L258 224', stroke: HUT.tealDark, 'stroke-width': 3, 'stroke-linecap': 'round' }, inner);
  el('rect', { x: 124, y: 211, width: 156, height: 6, rx: 2, fill: HUT.teal, ...line(2) }, inner);
  [[134, '#ff7eb6'], [148, '#ffc23a'], [162, '#9d6bff'], [238, '#fdf7ff'], [251, '#ff3b4e'], [264, '#ff9cc8'], [276, '#6f6bff']].forEach(([x, c]) => {
    el('path', { d: `M${x - 4.5} 198 L${x + 4.5} 198 L${x + 3.6} 211 L${x - 3.6} 211 Z`, fill: c, ...line(1.6) }, inner);
    el('path', { d: `M${x - 2} 201 L${x - 1.6} 207`, stroke: '#fff', 'stroke-width': 1.4, 'stroke-linecap': 'round', opacity: .8 }, inner);
  });
  // ペンダントランプ
  el('path', { d: 'M166 156 L166 172', stroke: INK, 'stroke-width': 1.6 }, inner);
  el('circle', { cx: 166, cy: 183, r: 4.6, fill: '#fff3d6', ...line(1.6) }, inner);
  el('path', { d: 'M161 172 L171 172 L177 181 L155 181 Z', fill: '#f26aa6', ...line(2) }, inner);
  el('path', { d: 'M162 175 L159 179', stroke: '#fff', 'stroke-width': 1.6, 'stroke-linecap': 'round', opacity: .8 }, inner);

  // ---- まーしー（3頭身・ながい黒髪・ラベンダーの ワンピース・手をふる） ----
  const m = el('g', { class: 'marcy bob', id: 'marcy', role: 'button', tabindex: '0', 'aria-label': HUT_LABELS.marcy }, svg);
  const mx = 200;
  // うしろ髪
  el('path', { d: `M${mx - 27} 204 C${mx - 30} 182 ${mx - 16} 174 ${mx} 174 C${mx + 16} 174 ${mx + 30} 182 ${mx + 27} 204 L${mx + 32} 268 L${mx - 32} 268 Z`, fill: HUT.hair, ...line(3) }, m);
  // ワンピース
  el('path', { d: `M${mx - 15} 230 C${mx - 8} 226 ${mx + 8} 226 ${mx + 15} 230 L${mx + 25} 272 L${mx - 25} 272 Z`, fill: HUT.dress, ...line(3) }, m);
  el('path', { d: `M${mx + 9} 236 L${mx + 16} 270`, stroke: HUT.dressDark, 'stroke-width': 4, 'stroke-linecap': 'round', opacity: .55 }, m);
  el('path', { d: `M${mx - 7} 229 Q${mx} 235 ${mx + 7} 229`, fill: 'none', stroke: '#fff', 'stroke-width': 2, 'stroke-linecap': 'round' }, m);
  // おろした うで（みぎがわ）
  el('path', { d: `M${mx + 19} 238 L${mx + 23} 258`, fill: 'none', stroke: INK, 'stroke-width': 8, 'stroke-linecap': 'round' }, m);
  el('path', { d: `M${mx + 19} 238 L${mx + 23} 258`, fill: 'none', stroke: HUT.skin, 'stroke-width': 3.6, 'stroke-linecap': 'round' }, m);
  el('circle', { cx: mx + 17, cy: 236, r: 7.5, fill: HUT.dress, ...line(2.6) }, m);
  // ふってる うで（ひだりがわ）
  const arm = el('g', { class: 'wave-arm' }, m);
  const armD = `M${mx - 19} 238 Q${mx - 31} 232 ${mx - 35} 214`;
  el('path', { d: armD, fill: 'none', stroke: INK, 'stroke-width': 8, 'stroke-linecap': 'round' }, arm);
  el('path', { d: armD, fill: 'none', stroke: HUT.skin, 'stroke-width': 3.6, 'stroke-linecap': 'round' }, arm);
  el('ellipse', { cx: mx - 36, cy: 209, rx: 5.2, ry: 6, fill: HUT.skin, ...line(2.4) }, arm);
  el('path', { d: `M${mx - 39} 206 L${mx - 39} 203 M${mx - 36} 205 L${mx - 36} 202`, stroke: INK, 'stroke-width': 1.2, 'stroke-linecap': 'round' }, arm);
  if (!reduce) {
    el('animateTransform', { attributeName: 'transform', type: 'rotate', values: `0 ${mx - 19} 238;-16 ${mx - 19} 238;0 ${mx - 19} 238`, dur: '1.1s', repeatCount: 'indefinite' }, arm);
  }
  el('circle', { cx: mx - 17, cy: 236, r: 7.5, fill: HUT.dress, ...line(2.6) }, m);
  // かお
  el('ellipse', { cx: mx, cy: 206, rx: 23, ry: 21, fill: HUT.skin, ...line(3) }, m);
  // まえがみ（ぱっつん）
  el('path', { d: `M${mx - 24} 210 C${mx - 27} 186 ${mx - 14} 177 ${mx} 177 C${mx + 14} 177 ${mx + 27} 186 ${mx + 24} 210 L${mx + 20} 198 Q${mx + 15} 201 ${mx + 10} 197 Q${mx + 5} 201 ${mx} 197 Q${mx - 5} 201 ${mx - 10} 197 Q${mx - 15} 201 ${mx - 20} 198 Z`, fill: HUT.hair, ...line(3) }, m);
  el('path', { d: `M${mx - 13} 185 Q${mx} 179 ${mx + 13} 185`, fill: 'none', stroke: '#8a5a72', 'stroke-width': 2.4, 'stroke-linecap': 'round', opacity: .8 }, m);
  // め
  const eyes = el('g', { class: 'blink' }, m);
  el('ellipse', { cx: mx - 9, cy: 207, rx: 3.3, ry: 4.6, fill: INK }, eyes);
  el('ellipse', { cx: mx + 9, cy: 207, rx: 3.3, ry: 4.6, fill: INK }, eyes);
  el('circle', { cx: mx - 8, cy: 205.3, r: 1.3, fill: '#fff' }, eyes);
  el('circle', { cx: mx + 10, cy: 205.3, r: 1.3, fill: '#fff' }, eyes);
  // ほっぺ・くち
  el('ellipse', { cx: mx - 15, cy: 214, rx: 4.4, ry: 2.8, fill: HUT.cheek, opacity: .7 }, m);
  el('ellipse', { cx: mx + 15, cy: 214, rx: 4.4, ry: 2.8, fill: HUT.cheek, opacity: .7 }, m);
  el('path', { d: `M${mx - 3} 215.5 Q${mx} 219 ${mx + 3} 215.5`, fill: 'none', stroke: '#c2185b', 'stroke-width': 1.8, 'stroke-linecap': 'round' }, m);

  // ---- 前の わく・カウンター ----
  const front = el('g', { class: 'hut-front' }, svg);
  // カウンターの前板（3まい）
  el('rect', { x: 62, y: 262, width: 276, height: 74, fill: HUT.counter, ...line(3) }, front);
  el('rect', { x: 63.5, y: 263.5, width: 273, height: 7, fill: HUT.counterDark, opacity: .45 }, front);
  [[80, 146], [158, 242], [254, 320]].forEach(([a, b]) => {
    el('path', { d: `M${a + 6} 330 L${b - 18} 274`, stroke: '#fff', 'stroke-width': 3, opacity: .22, 'stroke-linecap': 'round' }, front);
  });
  tealBar(front, 146, 262, 12, 74);
  tealBar(front, 242, 262, 12, 74);
  // 柱と梁
  tealBar(front, 60, 138, 20, 208);
  tealBar(front, 320, 138, 20, 208);
  tealBar(front, 56, 138, 288, 20, false);
  tealBar(front, 52, 334, 296, 14, false);
  // カウンターの天板
  el('rect', { x: 48, y: 248, width: 304, height: 15, rx: 5, fill: HUT.top, ...line(3) }, front);
  el('path', { d: 'M56 252.5 L344 252.5', stroke: '#fff', 'stroke-width': 3, 'stroke-linecap': 'round', opacity: .6 }, front);
  el('path', { d: 'M50 258 L350 258', stroke: HUT.counterDark, 'stroke-width': 1.5, opacity: .35 }, front);

  // ステッカー
  const st = el('g', { class: 'stickers' }, front);
  sticker(st, 'path', { d: HEART(98, 291, 10) }, '#ff4f9a');
  el('path', { d: 'M92 287 Q94 284 97 285', stroke: '#fff', 'stroke-width': 1.8, fill: 'none', 'stroke-linecap': 'round' }, st);
  const orchid = el('g', {}, st);
  const oval = (cx, cy, rx, ry) => `M${cx - rx} ${cy} a${rx} ${ry} 0 1 0 ${rx * 2} 0 a${rx} ${ry} 0 1 0 ${-rx * 2} 0 Z`;
  sticker(orchid, 'path', { d: [oval(128, 305, 4, 5.5), oval(121, 311, 6, 5), oval(135, 311, 6, 5), oval(124, 318, 3.6, 4.6), oval(132, 318, 3.6, 4.6)].join(' ') }, '#f58ad8');
  el('path', { d: 'M125 313 Q128 309 131 313 Q131 318 128 319 Q125 318 125 313 Z', fill: '#c2186b', stroke: INK, 'stroke-width': 1 }, orchid);
  el('circle', { cx: 128, cy: 312, r: 1.4, fill: '#ffd23a' }, orchid);
  const niwa = el('g', {}, st);
  const niwaText = (attrs) => {
    const t = el('text', { x: 200, y: 309, 'text-anchor': 'middle', 'font-size': 22, 'font-weight': 900, 'font-family': 'Arial Black, Zen Maru Gothic, sans-serif', 'letter-spacing': '1', ...attrs }, niwa);
    t.textContent = 'NIWA';
  };
  niwaText({ fill: INK, stroke: INK, 'stroke-width': 8, 'stroke-linejoin': 'round' });
  niwaText({ fill: '#fff', stroke: '#fff', 'stroke-width': 5, 'stroke-linejoin': 'round' });
  niwaText({ fill: HUT.indigo, stroke: '#6f86ff', 'stroke-width': .8 });
  sticker(st, 'path', { d: 'M232 284 Q233 289 238 290 Q233 291 232 296 Q231 291 226 290 Q231 289 232 284 Z' }, '#ffd23a');
  sticker(st, 'path', { d: STAR(298, 290, 12) }, '#ffa62b');
  el('circle', { cx: 294.5, cy: 290, r: 1.2, fill: INK }, st);
  el('circle', { cx: 301.5, cy: 290, r: 1.2, fill: INK }, st);
  el('path', { d: 'M295 293.5 Q298 296 301 293.5', fill: 'none', stroke: INK, 'stroke-width': 1.2, 'stroke-linecap': 'round' }, st);
  sticker(st, 'rect', { x: 266, y: 307, width: 20, height: 16, rx: 3 }, '#1e1b5e');
  [[271, 312], [279, 312]].forEach(([x, y]) => el('rect', { x, y, width: 2.2, height: 2.2, fill: '#5ff0ff' }, st));
  el('path', { d: 'M272 317 L273.5 318.5 L278.5 318.5 L280 317', fill: 'none', stroke: '#5ff0ff', 'stroke-width': 1.4 }, st);
  sticker(st, 'path', { d: HEART(330, 296, 5) }, '#ff4f9a');

  // カウンターの うえ：植木鉢・よびりん
  flowerPot(front, 102, 249, [[-6, 10, '#ff7eb6'], [5, 16, '#9d6bff'], [9, 4, '#ff3b4e']]);
  flowerPot(front, 298, 249, [[-7, 6, '#ff3b4e'], [3, 15, '#ff9cc8'], [9, 6, '#ffc23a']]);
  const bell = el('g', {}, front);
  el('rect', { x: 227, y: 245, width: 24, height: 5, rx: 2, fill: '#6b5f9e', ...line(2) }, bell);
  el('path', { d: 'M230 245 A9 9 0 0 1 248 245 Z', fill: 'url(#hut-bell)', ...line(2.2) }, bell);
  el('circle', { cx: 239, cy: 234.5, r: 2.2, fill: '#dfe6ff', ...line(1.6) }, bell);
  el('path', { d: 'M233.5 242 Q234 238 237 237', stroke: '#fff', 'stroke-width': 1.6, fill: 'none', 'stroke-linecap': 'round' }, bell);

  // 梁から さがる ID バッジ（NIWA）
  const badge = el('g', {}, front);
  el('path', { d: 'M121 158 L127 182 L133 158', fill: 'none', stroke: HUT.magenta, 'stroke-width': 3, 'stroke-linejoin': 'round' }, badge);
  el('circle', { cx: 127, cy: 183, r: 2.4, fill: 'none', stroke: '#e8b84a', 'stroke-width': 1.6 }, badge);
  el('rect', { x: 119, y: 185, width: 16, height: 21, rx: 2.5, fill: '#3a2a9a', ...line(1.8) }, badge);
  el('rect', { x: 120.5, y: 193, width: 13, height: 3, fill: 'url(#hut-holo)' }, badge);
  el('circle', { cx: 127, cy: 201, r: 2.4, fill: 'none', stroke: '#e8b84a', 'stroke-width': 1 }, badge);
  el('circle', { cx: 127, cy: 201, r: 1, fill: '#f06bd0' }, badge);
  el('path', { d: 'M122 189 L132 189', stroke: '#fff', 'stroke-width': 1.6, 'stroke-linecap': 'round', opacity: .85 }, badge);

  // ---- やね：しまの ひさし（ホタテの ふち）・玉かざり・青い ランプ ----
  const roof = el('g', { class: 'hut-roof' }, svg);
  const N = 9, T0 = 98, T1 = 302, B0 = 38, B1 = 362, TY = 98, BY = 132;
  const tw = (T1 - T0) / N, bw = (B1 - B0) / N;
  for (let i = 0; i < N; i++) {
    const c = i % 2 ? HUT.lav : HUT.magenta;
    el('path', { d: `M${T0 + i * tw} ${TY} L${T0 + (i + 1) * tw} ${TY} L${B0 + (i + 1) * bw} ${BY} L${B0 + i * bw} ${BY} Z`, fill: c }, roof);
  }
  el('path', { d: `M${T0 + 2} ${TY + 5} L${T1 - 2} ${TY + 5} L${T1 + 6} ${TY + 10} L${T0 - 6} ${TY + 10} Z`, fill: '#fff', opacity: .28 }, roof);
  el('path', { d: `M${T0} ${TY} L${T1} ${TY} L${B1} ${BY} L${B0} ${BY} Z`, fill: 'none', ...line(3) }, roof);
  for (let i = 0; i < N; i++) {
    const c = i % 2 ? HUT.lav : HUT.magenta;
    const a = B0 + i * bw, b = a + bw;
    el('path', { d: `M${a} ${BY} A${bw / 2} ${bw / 2 * .8} 0 0 0 ${b} ${BY} Z`, fill: c, ...line(2.6) }, roof);
    el('path', { d: `M${a + bw * .28} ${BY + 4} Q${a + bw * .34} ${BY + 9} ${a + bw * .46} ${BY + 11}`, fill: 'none', stroke: '#fff', 'stroke-width': 1.8, 'stroke-linecap': 'round', opacity: .5 }, roof);
  }
  [[T0 - 2, TY - 4], [T1 + 2, TY - 4]].forEach(([cx, cy]) => {
    el('circle', { cx, cy, r: 7.5, fill: HUT.magenta, ...line(2.6) }, roof);
    el('circle', { cx: cx - 2.4, cy: cy - 2.6, r: 2, fill: '#fff', opacity: .8 }, roof);
  });
  // 青い ランプ（よびだし）
  el('circle', { cx: 282, cy: 86, r: 16, fill: 'url(#hut-beacon)' }, roof);
  el('rect', { x: 271, y: 92, width: 22, height: 7, rx: 2.5, fill: '#2a3480', ...line(2.2) }, roof);
  el('path', { d: 'M274 92 L274 85 A8 8 0 0 1 290 85 L290 92 Z', fill: '#3f8fe0', ...line(2.2) }, roof);
  el('circle', { cx: 282, cy: 86, r: 3.2, fill: '#bff4ff' }, roof);
  el('path', { d: 'M277 85 Q277.5 81 280.5 79.5', stroke: '#fff', 'stroke-width': 1.6, fill: 'none', 'stroke-linecap': 'round', opacity: .85 }, roof);

  // ---- かんばん「ヒント」 ----
  const sign = el('g', { class: 'hut-sign', id: 'hutSign', role: 'button', tabindex: '0', 'aria-label': HUT_LABELS.sign }, svg);
  el('rect', { x: 134, y: 18, width: 132, height: 82, rx: 16, fill: HUT.teal, ...line(3) }, sign);
  el('path', { d: 'M150 22 L250 22', stroke: '#fff', 'stroke-width': 2.4, 'stroke-linecap': 'round', opacity: .55 }, sign);
  el('path', { d: 'M137 72 L137 84 Q137 96 150 97 L250 97 Q263 96 263 84 L263 72', fill: 'none', stroke: HUT.tealDark, 'stroke-width': 4, opacity: .6 }, sign);
  el('rect', { x: 144, y: 27, width: 112, height: 64, rx: 10, fill: HUT.cream, stroke: HUT.magenta, 'stroke-width': 3 }, sign);
  el('rect', { x: 144, y: 27, width: 112, height: 64, rx: 10, fill: 'none', ...line(1.4) }, sign);
  el('path', { d: 'M152 34 L176 34', stroke: '#fff', 'stroke-width': 3, 'stroke-linecap': 'round' }, sign);
  const signLabel = el('text', { x: 200, y: 71, 'text-anchor': 'middle', 'font-size': 32, 'font-weight': 700, fill: HUT.signText, style: 'font-family: var(--font-round)', 'letter-spacing': '2' }, sign);
  signLabel.textContent = signText;
  // 「？」バッジ
  el('circle', { cx: 264, cy: 20, r: 12, fill: '#e77f92', ...line(2.6) }, sign);
  el('circle', { cx: 260, cy: 15.5, r: 2.4, fill: '#fff', opacity: .7 }, sign);
  const q = el('text', { x: 264, y: 26.5, 'text-anchor': 'middle', 'font-size': 17, 'font-weight': 700, fill: '#fff', style: 'font-family: var(--font-round)' }, sign);
  q.textContent = '?';

  // 双葉と花（地面）
  const plants = el('g', {}, svg);
  const sprout = (x, y, s = 1) => {
    const g = el('g', { class: 'sprout', transform: `translate(${x} ${y}) scale(${s})` }, plants);
    el('path', { d: 'M0 0 L0 -16', stroke: '#4f9a4a', 'stroke-width': 3, 'stroke-linecap': 'round' }, g);
    el('path', { d: 'M0 -14 C-12 -24 -20 -14 -16 -9 C-10 -6 -4 -9 0 -14 Z', fill: '#7fd36b', stroke: '#3d7d3a', 'stroke-width': 1.5 }, g);
    el('path', { d: 'M0 -14 C12 -24 20 -14 16 -9 C10 -6 4 -9 0 -14 Z', fill: '#9be27f', stroke: '#3d7d3a', 'stroke-width': 1.5 }, g);
  };
  const flower = (x, y, c, s = 1) => {
    const g = el('g', { class: 'sprout', transform: `translate(${x} ${y}) scale(${s})` }, plants);
    el('path', { d: 'M0 0 L0 -18', stroke: '#4f9a4a', 'stroke-width': 3, 'stroke-linecap': 'round' }, g);
    el('path', { d: 'M0 -6 C-8 -12 -12 -6 -9 -3 C-6 -1 -3 -3 0 -6 Z', fill: '#7fd36b', stroke: '#3d7d3a', 'stroke-width': 1.3 }, g);
    chunkyFlower(g, 0, -22, c, 5);
  };
  sprout(26, 364, 1.1); flower(46, 372, '#ff8cc6', .95); flower(10, 380, '#ffffff', .75); sprout(78, 374, .75);
  sprout(322, 374, .8); flower(352, 370, '#9d7eff', 1); sprout(376, 362, 1.1); flower(390, 382, '#f6b6ff', .7);

  // かざりの 部品は よみあげない（まーしー と かんばん だけ のこす）。
  // 一番上の 部品の ならびは かえない（room3d.js が つかう）。
  [...svg.children].forEach((c) => { if (c !== m && c !== sign) c.setAttribute('aria-hidden', 'true'); });
  // かんばんの 文字は aria-label で よむので かくす
  sign.querySelectorAll('text').forEach((n) => n.setAttribute('aria-hidden', 'true'));

  return {
    marcy: m,
    sign,
    setSign(text) { signLabel.textContent = text; },
  };
}

// まーしー と かんばん の よみあげ名を かえる（ことばの きりかえ用）
// labelHut(hut, { marcy: 'Marcy (talk)', sign: 'Hint (how to play)' })
export function labelHut(hut, { marcy, sign } = {}) {
  if (marcy) hut.marcy.setAttribute('aria-label', marcy);
  if (sign) hut.sign.setAttribute('aria-label', sign);
}

// 作品の 小さな絵（モチーフごと）。画像がなくても さみしくないように。
export function motifSVG(motif, color = '#9d7eff') {
  const c = color;
  const ink = '#2a2140';
  const bg = `<rect width="120" height="90" fill="${c}" opacity=".18"/>`;
  const shapes = {
    mirror: `<ellipse cx="60" cy="45" rx="26" ry="32" fill="#e3f4ff" stroke="${ink}" stroke-width="3"/><path d="M48 30 Q60 20 70 34" stroke="#fff" stroke-width="4" fill="none" stroke-linecap="round"/><path d="M20 70 Q40 50 52 58 M100 70 Q80 50 68 58" stroke="${c}" stroke-width="5" fill="none" stroke-linecap="round"/>`,
    spiral: `<path d="M60 78 C20 78 20 20 60 20 C92 20 92 66 62 66 C40 66 40 34 60 34 C74 34 74 54 62 54" fill="none" stroke="${ink}" stroke-width="4" stroke-linecap="round"/><path d="M60 78 C20 78 20 20 60 20 C92 20 92 66 62 66" fill="none" stroke="${c}" stroke-width="2" stroke-dasharray="4 5"/>`,
    lip: `<path d="M30 46 Q45 28 60 40 Q75 28 90 46 Q75 66 60 64 Q45 66 30 46 Z" fill="${c}" stroke="${ink}" stroke-width="3"/><path d="M34 46 Q60 52 86 46" stroke="${ink}" stroke-width="2.5" fill="none"/>`,
    drop: `<path d="M60 16 C76 40 84 50 84 60 A24 24 0 0 1 36 60 C36 50 44 40 60 16 Z" fill="#c9f6ff" stroke="${ink}" stroke-width="3"/><circle cx="52" cy="58" r="5" fill="#fff"/>`,
    knot: `<path d="M20 45 C40 15 60 75 60 45 C60 15 80 75 100 45" fill="none" stroke="#d4122e" stroke-width="4" stroke-linecap="round"/><circle cx="60" cy="45" r="8" fill="#d4122e" stroke="${ink}" stroke-width="2.5"/>`,
    spark: `<path d="M60 14 L68 38 L94 40 L72 54 L80 78 L60 63 L40 78 L48 54 L26 40 L52 38 Z" fill="#ffbe2e" stroke="${ink}" stroke-width="3" stroke-linejoin="round"/>`,
    node: `<path d="M30 30 L60 60 L92 34 M60 60 L60 80" stroke="${ink}" stroke-width="3"/><rect x="18" y="20" width="24" height="18" rx="4" fill="${c}" stroke="${ink}" stroke-width="2.5"/><rect x="80" y="24" width="24" height="18" rx="4" fill="#33d6b4" stroke="${ink}" stroke-width="2.5"/><rect x="48" y="52" width="24" height="18" rx="4" fill="#ffbe2e" stroke="${ink}" stroke-width="2.5"/>`,
    wave: `<path d="M10 50 Q25 20 40 50 T70 50 T100 50 T130 50" fill="none" stroke="${ink}" stroke-width="3"/><circle cx="34" cy="30" r="6" fill="#ff33a8"/><circle cx="72" cy="66" r="9" fill="#33d6b4"/><circle cx="96" cy="28" r="4" fill="#a8e032"/>`,
    choco: `<rect x="30" y="22" width="60" height="46" rx="6" fill="#7a4a2a" stroke="${ink}" stroke-width="3"/><path d="M50 22 L50 68 M70 22 L70 68 M30 45 L90 45" stroke="#5a321b" stroke-width="3"/><path d="M78 22 L90 10" stroke="#d9b36b" stroke-width="4"/>`,
    lamp: `<path d="M42 50 L52 22 L68 22 L78 50 Z" fill="#fff3b8" stroke="${ink}" stroke-width="3" stroke-linejoin="round"/><path d="M60 50 L60 72 M46 74 L74 74" stroke="${ink}" stroke-width="3" stroke-linecap="round"/><circle cx="60" cy="40" r="22" fill="#ffbe2e" opacity=".25"/>`,
  };
  return `<svg viewBox="0 0 120 90" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">${bg}${shapes[motif] || shapes.node}</svg>`;
}
