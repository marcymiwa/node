// 温室に ただよう 光の粒（コスメのグリッター風）。素粒子の ふるまいの イメージ。
// 軽さ優先: 粒は 40 こ、画面が 見えていない ときは 止める。

export function startGlitter(canvas, { reduced = false } = {}) {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  const colors = ['#ffffff', '#ffd6f2', '#c9f6ff', '#fff3b8', '#e3d4ff', '#a8e032'];
  let w = 0, h = 0, dpr = 1;
  const N = reduced ? 14 : 40;
  const ps = [];
  const resize = () => {
    dpr = Math.min(2, window.devicePixelRatio || 1);
    w = canvas.clientWidth; h = canvas.clientHeight;
    canvas.width = Math.round(w * dpr); canvas.height = Math.round(h * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  };
  const spawn = (p = {}) => Object.assign(p, {
    x: Math.random() * w, y: Math.random() * h,
    r: .6 + Math.random() * 1.8,
    vx: (Math.random() - .5) * .12, vy: -(.05 + Math.random() * .18),
    ph: Math.random() * Math.PI * 2, sp: .02 + Math.random() * .04,
    c: colors[(Math.random() * colors.length) | 0],
  });
  resize();
  for (let i = 0; i < N; i++) ps.push(spawn());
  new ResizeObserver(resize).observe(canvas);

  const draw = () => {
    ctx.clearRect(0, 0, w, h);
    for (const p of ps) {
      p.ph += p.sp;
      const tw = (Math.sin(p.ph) + 1) / 2;
      ctx.globalAlpha = .25 + tw * .75;
      ctx.fillStyle = p.c;
      // 4 つの とげの きらきら
      const s = p.r * (1 + tw);
      ctx.beginPath();
      ctx.moveTo(p.x, p.y - s * 2); ctx.lineTo(p.x + s * .5, p.y - s * .5);
      ctx.lineTo(p.x + s * 2, p.y); ctx.lineTo(p.x + s * .5, p.y + s * .5);
      ctx.lineTo(p.x, p.y + s * 2); ctx.lineTo(p.x - s * .5, p.y + s * .5);
      ctx.lineTo(p.x - s * 2, p.y); ctx.lineTo(p.x - s * .5, p.y - s * .5);
      ctx.closePath(); ctx.fill();
      if (!reduced) { p.x += p.vx; p.y += p.vy; }
      if (p.y < -10 || p.x < -10 || p.x > w + 10) { spawn(p); p.y = h + 5; }
    }
    ctx.globalAlpha = 1;
  };

  let raf = 0;
  const loop = () => { draw(); raf = requestAnimationFrame(loop); };
  if (reduced) { draw(); return; }
  const onVis = () => { cancelAnimationFrame(raf); if (!document.hidden) loop(); };
  document.addEventListener('visibilitychange', onVis);
  loop();
}
