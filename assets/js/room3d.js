// スマホを かたむけると、まーしーの 庭（ヒント小屋の まえ）に 立っているように 見える 3D。
// - 小屋は 2D の 絵（scene.js の SVG）を 部品ごとに 板にして、奥行きを ずらして ならべる（ジオラマ）。
//   なか → まーしー → カウンター → やね・かんばん の じゅんに てまえ。かたむけると ずれて 立体に 見える。
// - まわりは 本物の 3D: 温室の 格子の ドーム・地面・かべの とびら ①〜⑤・ただよう 光の粒。
// - 見まわし: ジャイロ（端末の むき）か、指で ドラッグ。ふりかえると 温室と とびらが 見える。
// - タップ: まーしー・かんばん・とびら（絵の すきとおった ところは あたらない）。

import * as THREE from '../vendor/three.module.min.js';

const S = 400;            // SVG の viewBox の 大きさ
const M = 0.0107;         // SVG 1 単位 = 何 m か（小屋の はば 約 3.3 m）
const GROUND = 348;       // SVG で 地面の 高さ
const EYE = new THREE.Vector3(0, 1.42, 3.7); // 見る人の 目
const LOOK_Y = 1.5;

// 小屋の 部品（scene.js の グループ）と 奥行き（m、- が おく）
const LAYERS = [
  { sel: ':scope > g.hut', z: -1.0 },
  { sel: ':scope > g.marcy', z: -0.5, key: 'marcy' },
  { sel: ':scope > g.hut-front', z: 0 },
  { sel: ':scope > g.hut-roof', z: 0.12 },
  { sel: ':scope > g.hut-sign', z: 0.06, key: 'sign' },
];

function cssVars(root) {
  const cs = getComputedStyle(root);
  // 値の " は ' に（属性の なかに 入ると SVG が こわれて 絵が 出なくなる。かんばんの 字の 書体で おきた）
  return (str) => str.replace(/var\((--[\w-]+)\)/g, (_, v) => (cs.getPropertyValue(v).trim() || '#000').replace(/"/g, "'"));
}

// SVG の 一部だけを 画像（canvas）に する
function layerCanvas(svg, keep, resolve, px = 1024) {
  const clone = svg.cloneNode(true);
  [...clone.children].forEach((c, i) => {
    if (c.tagName.toLowerCase() === 'defs') return;
    if (!keep(svg.children[i])) c.remove();
  });
  clone.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
  clone.setAttribute('width', px); clone.setAttribute('height', px);
  clone.removeAttribute('class'); clone.removeAttribute('style');
  const src = resolve(new XMLSerializer().serializeToString(clone));
  return new Promise((ok) => {
    const img = new Image();
    const c = document.createElement('canvas'); c.width = c.height = px;
    img.onload = () => { c.getContext('2d').drawImage(img, 0, 0, px, px); ok(c); };
    img.onerror = () => ok(c);
    img.src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(src)}`;
  });
}

function alphaAt(canvas, uv) {
  if (!canvas) return 1;
  const x = Math.min(canvas.width - 1, Math.max(0, Math.floor(uv.x * canvas.width)));
  const y = Math.min(canvas.height - 1, Math.max(0, Math.floor((1 - uv.y) * canvas.height)));
  try { return canvas.getContext('2d').getImageData(x, y, 1, 1).data[3] / 255; } catch { return 1; }
}

function sparkleTexture() {
  const c = document.createElement('canvas'); c.width = c.height = 64;
  const g = c.getContext('2d');
  const grd = g.createRadialGradient(32, 32, 0, 32, 32, 32);
  grd.addColorStop(0, 'rgba(255,255,255,1)'); grd.addColorStop(.25, 'rgba(255,255,255,.65)'); grd.addColorStop(1, 'rgba(255,255,255,0)');
  g.fillStyle = grd; g.fillRect(0, 0, 64, 64);
  g.fillStyle = '#fff';
  g.beginPath(); g.moveTo(32, 2); g.lineTo(36, 28); g.lineTo(62, 32); g.lineTo(36, 36); g.lineTo(32, 62); g.lineTo(28, 36); g.lineTo(2, 32); g.lineTo(28, 28); g.closePath(); g.fill();
  return new THREE.CanvasTexture(c);
}

function skyTexture(top, bottom, ground) {
  const c = document.createElement('canvas'); c.width = 4; c.height = 256;
  const g = c.getContext('2d');
  const grd = g.createLinearGradient(0, 0, 0, 256);
  grd.addColorStop(0, top); grd.addColorStop(.47, bottom); grd.addColorStop(.5, bottom); grd.addColorStop(.53, ground); grd.addColorStop(1, ground);
  g.fillStyle = grd; g.fillRect(0, 0, 4, 256);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

function doorTexture(color, no) {
  const c = document.createElement('canvas'); c.width = 256; c.height = 384;
  const g = c.getContext('2d');
  const ink = '#2a2140';
  // アーチの とびら
  g.lineWidth = 12; g.strokeStyle = ink; g.fillStyle = color;
  g.beginPath(); g.moveTo(40, 370); g.lineTo(40, 170); g.arc(128, 170, 88, Math.PI, 0); g.lineTo(216, 370); g.closePath(); g.fill(); g.stroke();
  g.strokeStyle = 'rgba(255,255,255,.55)'; g.lineWidth = 10; g.lineCap = 'round';
  g.beginPath(); g.moveTo(72, 350); g.lineTo(72, 175); g.arc(128, 175, 56, Math.PI, Math.PI * 1.45); g.stroke();
  g.fillStyle = ink; g.beginPath(); g.arc(180, 280, 10, 0, Math.PI * 2); g.fill();
  // 番号の まる
  g.fillStyle = '#fff6e9'; g.strokeStyle = ink; g.lineWidth = 8;
  g.beginPath(); g.arc(128, 60, 44, 0, Math.PI * 2); g.fill(); g.stroke();
  g.fillStyle = ink; g.font = 'bold 56px "DotGothic16", "Hiragino Maru Gothic ProN", sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle';
  g.fillText(String(no), 128, 64);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return { tex: t, canvas: c };
}

export function supports3D() {
  try {
    const c = document.createElement('canvas');
    return !!(window.WebGLRenderingContext && (c.getContext('webgl2') || c.getContext('webgl')));
  } catch { return false; }
}

export async function startRoom3D({ stage, hutSvg, rooms, onDoor, onMarcy, onSign, reduced = false, colors }) {
  const resolve = cssVars(document.querySelector('#app'));
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, powerPreference: 'low-power' });
  renderer.setPixelRatio(Math.min(2, window.devicePixelRatio || 1));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.domElement.className = 'room3d';
  renderer.domElement.setAttribute('aria-hidden', 'true');
  stage.prepend(renderer.domElement);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(62, 1, 0.05, 120);
  camera.position.copy(EYE);
  camera.rotation.order = 'YXZ';

  // ---- 空・地面・温室 ----
  const sky = new THREE.Mesh(new THREE.SphereGeometry(60, 32, 16), new THREE.MeshBasicMaterial({ side: THREE.BackSide, depthWrite: false }));
  scene.add(sky);
  const ground = new THREE.Mesh(new THREE.CircleGeometry(30, 64), new THREE.MeshLambertMaterial({ color: 0x9fd38a }));
  ground.rotation.x = -Math.PI / 2; ground.position.y = -0.001;
  scene.add(ground);
  // 小屋への こみち（ラベンダーの タイル）
  const tiles = new THREE.Group();
  for (let i = 0; i < 9; i++) {
    const tile = new THREE.Mesh(new THREE.BoxGeometry(1.1, 0.04, 0.7), new THREE.MeshLambertMaterial({ color: i % 2 ? 0xd9ccff : 0xe6dcff }));
    tile.position.set(0, 0.02, 0.6 + i * 0.8);
    tiles.add(tile);
  }
  scene.add(tiles);
  // 温室の 格子（たての 骨 と よこの 輪）。たまご型の ドーム。骨は 細い つつ（線だと 細すぎて 見えない）
  const R = 10, H = 1.6; // 半径 と たての のび
  const frameMat = new THREE.MeshLambertMaterial({ color: 0xf4efe6 });
  const lattice = new THREE.Group();
  const domePt = (a, ph) => new THREE.Vector3(Math.sin(a) * R * Math.cos(ph), R * H * Math.sin(ph), -Math.cos(a) * R * Math.cos(ph));
  for (let k = 0; k < 20; k++) {
    const a = (k / 20) * Math.PI * 2;
    const curve = new THREE.CatmullRomCurve3(Array.from({ length: 13 }, (_, i) => domePt(a, (i / 12) * Math.PI / 2)));
    lattice.add(new THREE.Mesh(new THREE.TubeGeometry(curve, 24, 0.05, 5, false), frameMat));
  }
  for (let j = 1; j < 7; j++) {
    const ph = (j / 7) * Math.PI / 2;
    const curve = new THREE.CatmullRomCurve3(Array.from({ length: 40 }, (_, i) => domePt((i / 40) * Math.PI * 2, ph)), true);
    lattice.add(new THREE.Mesh(new THREE.TubeGeometry(curve, 80, 0.045, 5, true), frameMat));
  }
  scene.add(lattice);
  // ガラス（うすい）
  const glass = new THREE.Mesh(new THREE.SphereGeometry(R, 48, 24, 0, Math.PI * 2, 0, Math.PI / 2),
    new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: .1, side: THREE.BackSide, depthWrite: false }));
  glass.scale.y = H;
  scene.add(glass);

  // ---- 光 ----
  const hemi = new THREE.HemisphereLight(0xfff6e9, 0x6fae63, 1.6);
  scene.add(hemi);
  const sun = new THREE.DirectionalLight(0xffffff, 1.2); sun.position.set(4, 10, 6);
  scene.add(sun);

  // ---- かべぞいの らせん階段 と とびら ----
  // 庭から かべぞいに 階段が のぼっていき、踊り場ごとに アーチの とびら（ワークブックの スケッチ）。
  const hits = []; // { mesh, kind, id, canvas }
  const A0 = 70, STEP = 68, H0 = 0.5, DH = 1.35; // とびら ①の 角度（度）・とびらの 間の 角度・高さ
  const doorAt = (i) => ({ deg: A0 + i * STEP, h: H0 + i * DH });
  const wallR = R - 0.9;
  const steps = new THREE.InstancedMesh(new THREE.BoxGeometry(0.9, 0.12, 0.34), new THREE.MeshLambertMaterial({ color: 0xffffff }), 140);
  const stepColor = new THREE.Color();
  const tmp = new THREE.Object3D();
  let si = 0;
  const lastDeg = A0 + (rooms.length - 1) * STEP;
  for (let deg = A0 - 55; deg <= lastDeg && si < 140; deg += 4) {
    const k = (deg - (A0 - 55)) / (lastDeg - (A0 - 55));
    const h = Math.max(0.06, k * (H0 + (rooms.length - 1) * DH));
    const a = THREE.MathUtils.degToRad(deg);
    tmp.position.set(Math.sin(a) * wallR, h, -Math.cos(a) * wallR);
    tmp.rotation.set(0, -a, 0);
    tmp.updateMatrix();
    steps.setMatrixAt(si, tmp.matrix);
    steps.setColorAt(si, stepColor.set(si % 2 ? 0xd9ccff : 0xf4efe6));
    si++;
  }
  steps.count = si;
  scene.add(steps);
  rooms.forEach((room, i) => {
    const at = doorAt(i);
    const a = THREE.MathUtils.degToRad(at.deg);
    const g = new THREE.Group();
    g.position.set(Math.sin(a) * (R - 0.35), at.h, -Math.cos(a) * (R - 0.35));
    g.lookAt(0, at.h, 0);
    const { tex, canvas } = doorTexture(room.color, room.no);
    const door = new THREE.Mesh(new THREE.PlaneGeometry(1.3, 1.95), new THREE.MeshBasicMaterial({ map: tex, transparent: true, alphaTest: 0.02 }));
    door.position.set(0, 0.98 + 0.06, 0);
    g.add(door);
    // 踊り場
    const land = new THREE.Mesh(new THREE.BoxGeometry(1.9, 0.14, 1.2), new THREE.MeshLambertMaterial({ color: room.color }));
    land.position.set(0, 0, 0.55);
    g.add(land);
    if (at.h > 0.2) {
      const post = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, at.h, 8), new THREE.MeshLambertMaterial({ color: 0x2fb9a0 }));
      post.position.set(0, -at.h / 2, 1.05);
      g.add(post);
    }
    scene.add(g);
    hits.push({ mesh: door, kind: 'door', id: room.id, canvas });
  });

  // ---- 小屋（2D の 絵を 板に して 奥行きを ずらす） ----
  const D = EYE.z;
  const hut = new THREE.Group();
  scene.add(hut);
  const layerMeshes = {};
  const svgChildren = [...hutSvg.children];
  const layerOf = new Map();
  LAYERS.forEach((L) => { const n = hutSvg.querySelector(L.sel); if (n) layerOf.set(n, L); });
  // どの 部品にも 入らない もの（草花・赤い糸）は いちばん てまえの 板に
  const front = { z: 0.55, key: 'plants' };
  const groups = [...LAYERS, front];
  await Promise.all(groups.map(async (L) => {
    const keep = L === front
      ? (n) => !layerOf.has(n) && n.tagName.toLowerCase() !== 'ellipse'
      : (n) => layerOf.get(n) === L;
    const canvas = await layerCanvas(hutSvg, keep, resolve);
    const tex = new THREE.CanvasTexture(canvas);
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.anisotropy = 4;
    const k = (D - L.z) / D; // 目から 見た 大きさを そろえる
    const size = S * M * k;
    const mesh = new THREE.Mesh(new THREE.PlaneGeometry(size, size),
      new THREE.MeshBasicMaterial({ map: tex, transparent: true, alphaTest: 0.02, depthWrite: L.key !== 'plants' }));
    const yc = (GROUND - S / 2) * M; // 板の まんなかの 高さ（z=0 の とき）
    mesh.position.set(0, LOOK_Y + (yc - LOOK_Y) * k, L.z);
    mesh.renderOrder = Math.round((L.z + 2) * 100);
    hut.add(mesh);
    layerMeshes[L.key || L.sel] = mesh;
    if (L.key === 'marcy') hits.push({ mesh, kind: 'marcy', canvas });
    if (L.key === 'sign') hits.push({ mesh, kind: 'sign', canvas });
    if (L.key === 'plants') hits.push({ mesh, kind: 'none', canvas });
    if (!L.key || L.key === 'sign') hits.push({ mesh, kind: 'block', canvas });
  }));
  // 小屋の かげ
  const shadow = new THREE.Mesh(new THREE.CircleGeometry(1.9, 40), new THREE.MeshBasicMaterial({ color: 0x281e3c, transparent: true, opacity: .18, depthWrite: false }));
  shadow.rotation.x = -Math.PI / 2; shadow.scale.set(1, .35, 1); shadow.position.set(0, 0.005, -0.2);
  scene.add(shadow);
  // カウンターの 下に 小さな 床（板の すきまから 地面が 見えないように）
  const floor = new THREE.Mesh(new THREE.BoxGeometry(3.3, 0.06, 1.2), new THREE.MeshLambertMaterial({ color: 0xf2b8cc }));
  floor.position.set(0, 0.03, -0.5);
  scene.add(floor);

  // ---- 光の粒（コスメの グリッター） ----
  const N = reduced ? 120 : 360;
  const pos = new Float32Array(N * 3);
  const speed = new Float32Array(N);
  for (let i = 0; i < N; i++) {
    const r = 1.2 + Math.random() * (R - 1.5), a = Math.random() * Math.PI * 2;
    pos[i * 3] = Math.sin(a) * r; pos[i * 3 + 1] = Math.random() * 9; pos[i * 3 + 2] = -Math.cos(a) * r;
    speed[i] = 0.05 + Math.random() * 0.18;
  }
  const pgeo = new THREE.BufferGeometry(); pgeo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  const pcol = new Float32Array(N * 3);
  const palette = ['#ffffff', '#ffd6f2', '#c9f6ff', '#fff3b8', '#e3d4ff', '#a8e032'].map((c) => new THREE.Color(c));
  for (let i = 0; i < N; i++) { const c = palette[i % palette.length]; pcol.set([c.r, c.g, c.b], i * 3); }
  pgeo.setAttribute('color', new THREE.BufferAttribute(pcol, 3));
  const sparkles = new THREE.Points(pgeo, new THREE.PointsMaterial({
    size: 0.16, map: sparkleTexture(), vertexColors: true, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, sizeAttenuation: true,
  }));
  scene.add(sparkles);

  // ---- 時間帯の 色 ----
  function applyColors() {
    const app = document.querySelector('#app');
    const cs = getComputedStyle(app);
    const top = cs.getPropertyValue('--sky-top').trim() || '#8fc8ff';
    const bottom = cs.getPropertyValue('--sky-bottom').trim() || '#ffeccc';
    const gcol = cs.getPropertyValue('--ground').trim() || '#9fd38a';
    sky.material.map = skyTexture(top, bottom, gcol); sky.material.needsUpdate = true;
    ground.material.color.set(gcol);
    const night = app.dataset.tod === 'night';
    hemi.intensity = night ? 0.9 : 1.6;
    sun.intensity = night ? 0.3 : 1.2;
    frameMat.color.set(night ? 0xb9b3d6 : 0xf4efe6);
  }
  applyColors();

  // ---- 見まわし（ジャイロ + ドラッグ） ----
  let yaw = 0, pitch = 0;           // ドラッグの ぶん
  let gyro = null;                  // { q } 端末の むき
  let gyroBase = null;              // さいしょの むき（小屋が 正面に 来るように）
  const qTarget = new THREE.Quaternion();
  const zee = new THREE.Vector3(0, 0, 1);
  const q1 = new THREE.Quaternion(-Math.sqrt(0.5), 0, 0, Math.sqrt(0.5)); // カメラを 端末の 背中むきに
  const euler = new THREE.Euler();
  const q0 = new THREE.Quaternion();
  const screenAngle = () => THREE.MathUtils.degToRad((screen.orientation && screen.orientation.angle) || window.orientation || 0);

  function onOrient(e) {
    if (e.alpha == null && e.beta == null) return;
    const a = THREE.MathUtils.degToRad(e.alpha || 0), b = THREE.MathUtils.degToRad(e.beta || 0), g = THREE.MathUtils.degToRad(e.gamma || 0);
    euler.set(b, a, -g, 'YXZ');
    const q = new THREE.Quaternion().setFromEuler(euler).multiply(q1).multiply(q0.setFromAxisAngle(zee, -screenAngle()));
    if (!gyroBase) {
      // いま むいている 方位を 小屋の 正面に する（上下の かたむきは そのまま）
      const e2 = new THREE.Euler().setFromQuaternion(q, 'YXZ');
      gyroBase = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), -e2.y);
    }
    gyro = gyroBase.clone().multiply(q);
  }
  let listening = false;
  function listenGyro() {
    if (listening) return;
    listening = true;
    window.addEventListener('deviceorientation', onOrient, true);
  }
  const needsPermission = typeof DeviceOrientationEvent !== 'undefined' && typeof DeviceOrientationEvent.requestPermission === 'function';
  if (!needsPermission) listenGyro();
  async function requestGyro() {
    if (!needsPermission) { listenGyro(); gyroBase = null; return true; }
    try {
      const r = await DeviceOrientationEvent.requestPermission();
      if (r === 'granted') { listenGyro(); gyroBase = null; return true; }
    } catch { /* ゆるされなかった */ }
    return false;
  }

  // ドラッグ / タップ
  const el = renderer.domElement;
  let down = null;
  el.addEventListener('pointerdown', (e) => { down = { x: e.clientX, y: e.clientY, yaw, pitch, moved: false }; el.setPointerCapture(e.pointerId); });
  el.addEventListener('pointermove', (e) => {
    if (!down) return;
    const dx = e.clientX - down.x, dy = e.clientY - down.y;
    if (Math.abs(dx) + Math.abs(dy) > 6) down.moved = true;
    const k = (Math.PI * 1.1) / el.clientWidth;
    yaw = down.yaw + dx * k;
    pitch = THREE.MathUtils.clamp(down.pitch + dy * k * 0.8, -1.1, 1.1);
  });
  el.addEventListener('pointerup', (e) => { if (down && !down.moved) tap(e); down = null; });
  el.addEventListener('pointercancel', () => { down = null; });

  const ray = new THREE.Raycaster();
  const ndc = new THREE.Vector2();
  function tap(e) {
    const r = el.getBoundingClientRect();
    ndc.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1);
    ray.setFromCamera(ndc, camera);
    const list = ray.intersectObjects(hits.map((h) => h.mesh), false);
    for (const it of list) {
      const h = hits.find((x) => x.mesh === it.object && (x.kind !== 'block' || true));
      const cands = hits.filter((x) => x.mesh === it.object);
      const a = alphaAt(h.canvas, it.uv);
      if (a < 0.15) continue; // すきとおった ところは とおりぬける
      const kind = cands.find((x) => x.kind === 'marcy' || x.kind === 'sign' || x.kind === 'door');
      if (!kind) return; // かべや カウンターに あたった
      if (kind.kind === 'marcy') onMarcy();
      else if (kind.kind === 'sign') onSign();
      else if (kind.kind === 'door') onDoor(kind.id);
      return;
    }
  }

  // ---- 大きさ と 描画 ----
  function resize() {
    const w = stage.clientWidth, h = stage.clientHeight;
    if (!w || !h) return;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    // 細長い 画面でも 小屋が 横に 入るように、よこの 見える はばを たもつ
    const wantHalfW = 2.15; // m（小屋の はば の 半分 + すこし）
    const vfov = 2 * Math.atan(wantHalfW / camera.aspect / (EYE.z - 0)) * 180 / Math.PI;
    camera.fov = THREE.MathUtils.clamp(vfov, 50, 92);
    camera.updateProjectionMatrix();
  }
  new ResizeObserver(resize).observe(stage);
  resize();

  const base = new THREE.Quaternion().setFromEuler(new THREE.Euler(Math.atan2(LOOK_Y + 0.55 - EYE.y, EYE.z), 0, 0, "YXZ")); // かんばんまで 見えるように すこし 上を むく
  const dragQ = new THREE.Quaternion();
  const clock = new THREE.Clock();
  let raf = 0, running = true;
  const marcyMesh = layerMeshes.marcy;
  const marcyY = marcyMesh ? marcyMesh.position.y : 0;
  let hopT = -1;

  function frame() {
    const dt = Math.min(0.05, clock.getDelta());
    const t = clock.elapsedTime;
    dragQ.setFromEuler(new THREE.Euler(pitch, yaw, 0, 'YXZ'));
    if (gyro) qTarget.copy(dragQ).multiply(gyro);
    else qTarget.copy(dragQ).multiply(base);
    camera.quaternion.slerp(qTarget, gyro ? 0.35 : 0.2);
    // 見まわすと 目も すこし うごく（頭を うごかしている 感じ）
    const fwd = new THREE.Vector3(0, 0, -1).applyQuaternion(camera.quaternion);
    camera.position.set(EYE.x + fwd.x * 0.25, EYE.y + fwd.y * 0.12, EYE.z + fwd.z * 0.1 + 0.1);
    if (!reduced) {
      const p = pgeo.attributes.position.array;
      for (let i = 0; i < N; i++) { p[i * 3 + 1] += speed[i] * dt; if (p[i * 3 + 1] > 9) p[i * 3 + 1] = 0; }
      pgeo.attributes.position.needsUpdate = true;
      sparkles.material.size = 0.14 + Math.sin(t * 2) * 0.02;
      if (marcyMesh) {
        let y = marcyY + Math.sin(t * 2.6) * 0.012;
        if (hopT >= 0) { const k = (t - hopT) / 0.5; if (k > 1) hopT = -1; else y += Math.sin(k * Math.PI) * 0.12; }
        marcyMesh.position.y = y;
      }
    }
    renderer.render(scene, camera);
    raf = requestAnimationFrame(frame);
  }
  frame();
  document.addEventListener('visibilitychange', () => {
    cancelAnimationFrame(raf);
    if (!document.hidden && running) { clock.getDelta(); frame(); }
  });

  return {
    canvas: el,
    needsPermission,
    requestGyro,
    get gyroOn() { return !!gyro; },
    hop() { hopT = clock.elapsedTime; },
    recenter() { yaw = 0; pitch = 0; gyroBase = null; },
    applyColors,
    async setSign() {
      const L = LAYERS.find((x) => x.key === 'sign');
      const mesh = layerMeshes.sign; if (!mesh) return;
      const canvas = await layerCanvas(hutSvg, (n) => n.matches && n.matches(L.sel.replace(':scope > ', '')), resolve);
      mesh.material.map.image = canvas; mesh.material.map.needsUpdate = true;
      const h = hits.find((x) => x.kind === 'sign'); if (h) h.canvas = canvas;
    },
    look(deg) { yaw = THREE.MathUtils.degToRad(deg); },
    stop() { running = false; cancelAnimationFrame(raf); },
  };
}
