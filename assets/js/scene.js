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

  // とびら（左右のかべぎわ、高さちがいの踊り場）
  const spots = [
    { x: 30, y: 300 }, { x: 370, y: 240 }, { x: 44, y: 180 }, { x: 356, y: 128 }, { x: 96, y: 92 },
  ];
  rooms.forEach((room, i) => {
    const s = spots[i % spots.length];
    const d = el('g', {
      class: 'door', tabindex: '-1', 'data-room': room.id,
      transform: `translate(${s.x} ${s.y})`, style: 'cursor:pointer',
    }, svg);
    // 踊り場
    el('rect', { x: -20, y: 22, width: 40, height: 5, rx: 2, fill: 'var(--frame)', opacity: '.9' }, d);
    // アーチの とびら
    el('path', { d: 'M-11 22 L-11 2 A11 11 0 0 1 11 2 L11 22 Z', fill: room.color, stroke: 'var(--window-edge)', 'stroke-width': 2 }, d);
    el('circle', { cx: 6, cy: 13, r: 1.6, fill: 'var(--window-edge)' }, d);
    // 番号
    el('circle', { cx: 0, cy: -16, r: 8, fill: 'var(--window-bg)', stroke: 'var(--window-edge)', 'stroke-width': 1.5 }, d);
    const t = el('text', { x: 0, y: -12, 'text-anchor': 'middle', 'font-size': 11, fill: 'var(--window-edge)', 'font-family': 'DotGothic16, sans-serif' }, d);
    t.textContent = String(room.no);
    d.addEventListener('click', () => onDoor && onDoor(room.id));
  });
}

// 小屋と まーしー
export function renderHut(container, { signText = 'ヒント' } = {}) {
  container.textContent = '';
  const svg = el('svg', { viewBox: '0 0 400 400', role: 'img', 'aria-hidden': 'true' }, container);

  const defs = el('defs', {}, svg);
  const holo = el('linearGradient', { id: 'holo', x1: 0, y1: 0, x2: 1, y2: 1 }, defs);
  [['0', '#ffd6f2'], ['.35', '#c9f6ff'], ['.7', '#fff3b8'], ['1', '#e3d4ff']].forEach(([o, c]) => el('stop', { offset: o, 'stop-color': c }, holo));
  const wood = el('linearGradient', { id: 'wood', x1: 0, y1: 0, x2: 0, y2: 1 }, defs);
  [['0', '#f2c58f'], ['1', '#d99a5b']].forEach(([o, c]) => el('stop', { offset: o, 'stop-color': c }, wood));
  const inside = el('radialGradient', { id: 'inside', cx: '.5', cy: '.4', r: '.8' }, defs);
  [['0', '#fff1c9'], ['1', '#ffcf86']].forEach(([o, c]) => el('stop', { offset: o, 'stop-color': c }, inside));

  // かげ
  el('ellipse', { cx: 200, cy: 352, rx: 132, ry: 14, fill: 'rgba(40,30,60,.18)' }, svg);

  // 双葉と花（左右）
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
    for (let i = 0; i < 5; i++) {
      const a = (i / 5) * Math.PI * 2;
      el('circle', { cx: Math.cos(a) * 6, cy: -22 + Math.sin(a) * 6, r: 5, fill: c, stroke: 'var(--window-edge)', 'stroke-width': 1.2 }, g);
    }
    el('circle', { cx: 0, cy: -22, r: 3.6, fill: '#ffbe2e', stroke: 'var(--window-edge)', 'stroke-width': 1.2 }, g);
  };
  sprout(40, 360, 1.1); flower(74, 358, '#ff8cc6'); sprout(104, 366, .8);
  sprout(300, 366, .85); flower(330, 360, '#9d7eff', 1.05); sprout(364, 362, 1.1); flower(18, 372, '#ffffff', .8);

  // 小屋
  const hut = el('g', { class: 'hut' }, svg);
  // ゆか・土台
  el('rect', { x: 92, y: 330, width: 216, height: 18, rx: 6, fill: '#b5774a', stroke: 'var(--window-edge)', 'stroke-width': 3 }, hut);
  // 柱とかべ
  el('rect', { x: 104, y: 196, width: 192, height: 140, rx: 8, fill: 'url(#wood)', stroke: 'var(--window-edge)', 'stroke-width': 3 }, hut);
  // 板のすじ
  for (let x = 124; x < 296; x += 20) el('path', { d: `M${x} 200 L${x} 334`, stroke: 'rgba(120,70,30,.25)', 'stroke-width': 2 }, hut);
  // 窓口（なかが見える）
  el('rect', { x: 128, y: 214, width: 144, height: 84, rx: 10, fill: 'url(#inside)', stroke: 'var(--window-edge)', 'stroke-width': 3 }, hut);
  // 窓口のなかの棚（本・びん）
  const shelf = el('g', {}, hut);
  el('rect', { x: 136, y: 236, width: 128, height: 4, fill: '#c98d58' }, shelf);
  [['#f23a9a', 140], ['#33d6b4', 150], ['#6f86ff', 158], ['#ffbe2e', 240], ['#9d7eff', 250]].forEach(([c, x]) => el('rect', { x, y: 222, width: 8, height: 14, rx: 2, fill: c, stroke: 'var(--window-edge)', 'stroke-width': 1 }, shelf));
  el('circle', { cx: 230, cy: 229, r: 6, fill: '#c9f6ff', stroke: 'var(--window-edge)', 'stroke-width': 1 }, shelf);

  // まーしー（3頭身・長い髪）
  const m = el('g', { class: 'marcy bob', id: 'marcy', role: 'button', tabindex: '0' }, svg);
  const mx = 200, my = 300;
  // かみ（うしろ）
  el('path', { d: `M${mx - 34} ${my - 58} C${mx - 46} ${my - 120} ${mx + 46} ${my - 120} ${mx + 34} ${my - 58} L${mx + 38} ${my - 14} C${mx + 20} ${my - 8} ${mx - 20} ${my - 8} ${mx - 38} ${my - 14} Z`, fill: '#3a2a3f', stroke: 'var(--window-edge)', 'stroke-width': 3 }, m);
  // からだ
  el('path', { d: `M${mx - 22} ${my} L${mx - 18} ${my - 32} C${mx - 10} ${my - 40} ${mx + 10} ${my - 40} ${mx + 18} ${my - 32} L${mx + 22} ${my} Z`, fill: '#9d7eff', stroke: 'var(--window-edge)', 'stroke-width': 3 }, m);
  el('path', { d: `M${mx - 6} ${my - 36} L${mx} ${my - 28} L${mx + 6} ${my - 36}`, fill: 'none', stroke: '#fff', 'stroke-width': 2.5, 'stroke-linejoin': 'round' }, m);
  // て（ふってる）
  const arm = el('g', { class: 'wave-arm' }, m);
  el('path', { d: `M${mx + 18} ${my - 28} Q${mx + 34} ${my - 40} ${mx + 36} ${my - 58}`, fill: 'none', stroke: 'var(--window-edge)', 'stroke-width': 9, 'stroke-linecap': 'round' }, arm);
  el('path', { d: `M${mx + 18} ${my - 28} Q${mx + 34} ${my - 40} ${mx + 36} ${my - 58}`, fill: 'none', stroke: '#9d7eff', 'stroke-width': 4.5, 'stroke-linecap': 'round' }, arm);
  el('circle', { cx: mx + 37, cy: my - 61, r: 6, fill: '#ffe0cc', stroke: 'var(--window-edge)', 'stroke-width': 2.5 }, arm);
  // かお
  el('ellipse', { cx: mx, cy: my - 66, rx: 30, ry: 28, fill: '#ffe6d6', stroke: 'var(--window-edge)', 'stroke-width': 3 }, m);
  // まえがみ
  el('path', { d: `M${mx - 31} ${my - 66} C${mx - 32} ${my - 98} ${mx + 32} ${my - 98} ${mx + 31} ${my - 66} C${mx + 20} ${my - 80} ${mx + 4} ${my - 84} ${mx - 2} ${my - 76} C${mx - 10} ${my - 84} ${mx - 22} ${my - 80} ${mx - 31} ${my - 66} Z`, fill: '#3a2a3f', stroke: 'var(--window-edge)', 'stroke-width': 3, 'stroke-linejoin': 'round' }, m);
  // め
  const eyes = el('g', { class: 'blink' }, m);
  el('ellipse', { cx: mx - 11, cy: my - 62, rx: 3.6, ry: 5, fill: 'var(--window-edge)' }, eyes);
  el('ellipse', { cx: mx + 11, cy: my - 62, rx: 3.6, ry: 5, fill: 'var(--window-edge)' }, eyes);
  el('circle', { cx: mx - 10, cy: my - 64, r: 1.3, fill: '#fff' }, eyes);
  el('circle', { cx: mx + 12, cy: my - 64, r: 1.3, fill: '#fff' }, eyes);
  // ほっぺ・くち
  el('ellipse', { cx: mx - 19, cy: my - 52, rx: 5, ry: 3, fill: '#ff9cc6', opacity: '.8' }, m);
  el('ellipse', { cx: mx + 19, cy: my - 52, rx: 5, ry: 3, fill: '#ff9cc6', opacity: '.8' }, m);
  el('path', { d: `M${mx - 5} ${my - 50} Q${mx} ${my - 45} ${mx + 5} ${my - 50}`, fill: 'none', stroke: 'var(--window-edge)', 'stroke-width': 2.2, 'stroke-linecap': 'round' }, m);
  // 蘭の かみかざり
  const orchid = el('g', { transform: `translate(${mx - 24} ${my - 88})` }, m);
  [[-5, 0], [5, 0], [0, -6], [-4, 6], [4, 6]].forEach(([x, y]) => el('ellipse', { cx: x, cy: y, rx: 4.5, ry: 3.4, fill: '#f6b6ff', stroke: 'var(--window-edge)', 'stroke-width': 1.2 }, orchid));
  el('circle', { cx: 0, cy: 1, r: 2.4, fill: '#ff33a8' }, orchid);

  // カウンター（まーしーの こしから下を かくす）
  el('rect', { x: 120, y: 294, width: 160, height: 20, rx: 6, fill: '#c98d58', stroke: 'var(--window-edge)', 'stroke-width': 3 }, svg);
  el('rect', { x: 120, y: 294, width: 160, height: 6, rx: 3, fill: 'rgba(255,255,255,.35)' }, svg);

  // やね
  el('path', { d: 'M84 202 L200 130 L316 202 Z', fill: '#f23a9a', stroke: 'var(--window-edge)', 'stroke-width': 3, 'stroke-linejoin': 'round' }, svg);
  for (let i = 0; i < 6; i++) {
    const x1 = 100 + i * 20, x2 = 300 - i * 20;
    if (x1 < x2) el('path', { d: `M${x1} ${202 - (i % 2) * 2} L${x2} ${202 - (i % 2) * 2}`, stroke: 'rgba(255,255,255,.0)' }, svg);
  }
  el('path', { d: 'M110 186 L200 130 L290 186', fill: 'none', stroke: 'rgba(255,255,255,.45)', 'stroke-width': 4, 'stroke-linecap': 'round' }, svg);
  // ひさし
  el('rect', { x: 78, y: 198, width: 244, height: 12, rx: 6, fill: '#ffbe2e', stroke: 'var(--window-edge)', 'stroke-width': 3 }, svg);

  // かんばん「ヒント」
  const sign = el('g', { class: 'hut-sign', id: 'hutSign', role: 'button', tabindex: '0' }, svg);
  el('path', { d: 'M184 136 L184 120 M216 136 L216 120', stroke: 'var(--window-edge)', 'stroke-width': 3 }, sign);
  el('rect', { x: 146, y: 88, width: 108, height: 36, rx: 10, fill: 'url(#holo)', stroke: 'var(--window-edge)', 'stroke-width': 3 }, sign);
  const st = el('text', { x: 200, y: 114, 'text-anchor': 'middle', 'font-size': 22, fill: 'var(--window-edge)', 'font-family': 'DotGothic16, sans-serif', 'letter-spacing': '2' }, sign);
  st.textContent = signText;

  // ステッカー（小屋に ぺたぺた）
  const stickers = el('g', {}, svg);
  const sticker = (x, y, r, fill, label, rot = 0) => {
    const g = el('g', { transform: `translate(${x} ${y}) rotate(${rot})` }, stickers);
    el('circle', { r: r + 2.5, fill: '#fff', stroke: 'var(--window-edge)', 'stroke-width': 1.5 }, g);
    el('circle', { r, fill }, g);
    if (label) {
      const t = el('text', { y: 4, 'text-anchor': 'middle', 'font-size': r * .95, fill: '#fff', 'font-family': 'DotGothic16, sans-serif' }, g);
      t.textContent = label;
    }
  };
  sticker(118, 318, 9, '#33d6b4', '★', -12);
  sticker(286, 316, 10, '#6f86ff', '→', 10);
  sticker(276, 224, 7, '#ff6a2b', '!', 8);
  // 星形ステッカー
  const star = el('path', { d: 'M0 -11 L3 -3 L11 -3 L5 2 L7 10 L0 5 L-7 10 L-5 2 L-11 -3 L-3 -3 Z', transform: 'translate(124 226) rotate(-8)', fill: '#ffbe2e', stroke: 'var(--window-edge)', 'stroke-width': 1.5 }, stickers);
  star.setAttribute('stroke-linejoin', 'round');

  // 赤い糸（小屋から そとへ。ノードと結び目）
  el('path', { d: 'M296 250 C340 240 360 210 384 200', fill: 'none', stroke: 'var(--thread)', 'stroke-width': 2.2, 'stroke-linecap': 'round' }, svg);
  el('path', { d: 'M104 262 C70 270 40 300 14 304', fill: 'none', stroke: 'var(--thread)', 'stroke-width': 2.2, 'stroke-linecap': 'round' }, svg);
  el('circle', { cx: 296, cy: 250, r: 4, fill: 'var(--thread)', stroke: 'var(--window-edge)', 'stroke-width': 1.2 }, svg);
  el('circle', { cx: 104, cy: 262, r: 4, fill: 'var(--thread)', stroke: 'var(--window-edge)', 'stroke-width': 1.2 }, svg);

  return {
    marcy: m,
    sign,
    setSign(text) { st.textContent = text; },
  };
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
