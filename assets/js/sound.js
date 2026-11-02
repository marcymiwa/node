// 小さな ピコピコ音（WebAudio で その場で つくる。音のファイルは 読まない）。
// はじめは OFF。ON にしても、さいしょの タップまでは 鳴らない（ブラウザの きまり）。

export class Sound {
  constructor() { this.enabled = false; this.ctx = null; this.last = 0; }

  unlock() {
    if (!this.enabled) return;
    if (!this.ctx) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return;
      this.ctx = new AC();
    }
    if (this.ctx.state === 'suspended') this.ctx.resume();
  }

  toggle() { this.enabled = !this.enabled; if (this.enabled) this.unlock(); }

  beep(freq, dur = 0.06, type = 'square', gain = 0.04) {
    if (!this.enabled) return;
    this.unlock();
    const c = this.ctx; if (!c) return;
    const now = c.currentTime;
    const o = c.createOscillator();
    const g = c.createGain();
    o.type = type; o.frequency.setValueAtTime(freq, now);
    g.gain.setValueAtTime(gain, now);
    g.gain.exponentialRampToValueAtTime(0.0001, now + dur);
    o.connect(g).connect(c.destination);
    o.start(now); o.stop(now + dur + 0.02);
  }

  tick() {
    const n = performance.now();
    if (n - this.last < 45) return; // うるさく ならないように
    this.last = n;
    this.beep(880 + Math.random() * 120, 0.03, 'square', 0.025);
  }
  blip(f = 660) { this.beep(f, 0.08, 'triangle', 0.05); setTimeout(() => this.beep(f * 1.5, 0.08, 'triangle', 0.05), 70); }
  select() { this.beep(1046, 0.05, 'square', 0.035); setTimeout(() => this.beep(1568, 0.07, 'square', 0.035), 50); }
  back() { this.beep(523, 0.06, 'square', 0.03); }
  open() { this.beep(784, 0.06, 'triangle', 0.05); setTimeout(() => this.beep(1175, 0.09, 'triangle', 0.05), 60); }
}
