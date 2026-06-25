// ambient-nanosuit.js — Nanosuit 2.0 signature backdrop.
// A hexagonal carbon weave that ENERGISES: waves of cyan light sweep across the
// surface — expanding rings, diagonal sweeps, and a constant idle shimmer — so
// the armor always looks alive, like the Crysis suit rippling as it adapts.
//
// Exposes window.createHexField(canvas, opts) -> { stop }. Used by the host
// backdrop (#ambient, behind the device) and by the in-app HexField canvas.

(function () {
  function createHexField(canvas, opts) {
    opts = opts || {};
    const ctx = canvas.getContext('2d');
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const SIZE = opts.size || 18;          // hex "radius" (flat-top)
    const BASE = opts.baseAlpha != null ? opts.baseAlpha : 0.08;
    const ringEvery = opts.ringEvery || 95;
    const sweepEvery = opts.sweepEvery || 320;
    const idleAmp = opts.idleAmp != null ? opts.idleAmp : 0.1;
    const intensity = opts.intensity != null ? opts.intensity : 1;

    let w = 0, h = 0, raf = 0, alive = true, t = 0;
    let hexes = [];          // {x, y}
    let weave = null;        // offscreen base weave

    // flat-top hex geometry
    const HW = SIZE * 2;             // full width
    const HH = Math.sqrt(3) * SIZE;  // full height
    const COLX = SIZE * 1.5;         // column spacing

    function hexPath(c, cx, cy, r) {
      c.beginPath();
      for (let i = 0; i < 6; i++) {
        const a = (Math.PI / 180) * (60 * i);
        const x = cx + r * Math.cos(a);
        const y = cy + r * Math.sin(a);
        i === 0 ? c.moveTo(x, y) : c.lineTo(x, y);
      }
      c.closePath();
    }

    function build() {
      const r = canvas.getBoundingClientRect();
      w = Math.max(1, r.width); h = Math.max(1, r.height);
      canvas.width = w * dpr; canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      hexes = [];
      const cols = Math.ceil(w / COLX) + 2;
      const rows = Math.ceil(h / HH) + 2;
      for (let cx = -1; cx < cols; cx++) {
        for (let cy = -1; cy < rows; cy++) {
          const x = cx * COLX;
          const y = cy * HH + (cx % 2 ? HH / 2 : 0);
          hexes.push({ x, y, p: (x * 0.012 + y * 0.009) });
        }
      }

      // static dim weave to an offscreen canvas
      weave = document.createElement('canvas');
      weave.width = canvas.width; weave.height = canvas.height;
      const wc = weave.getContext('2d');
      wc.setTransform(dpr, 0, 0, dpr, 0, 0);
      wc.strokeStyle = `rgba(0,212,255,${BASE})`;
      wc.lineWidth = 1;
      for (const hx of hexes) { hexPath(wc, hx.x, hx.y, SIZE - 1.2); wc.stroke(); }
    }

    // ---- waves ----
    const waves = [];
    function spawnRing() {
      waves.push({
        type: 'ring',
        x: Math.random() * w, y: Math.random() * h,
        r: 0, maxR: Math.hypot(w, h) * (0.45 + Math.random() * 0.35),
        speed: 1.4 + Math.random() * 1.4,
        width: 26 + Math.random() * 22,
        strength: 0.7 + Math.random() * 0.5,
      });
    }
    function spawnSweep() {
      const ang = (Math.random() < 0.5 ? 1 : -1) * (0.5 + Math.random() * 0.6);
      const dx = Math.cos(ang), dy = Math.sin(ang);
      // project corners to find the travel range along (dx,dy)
      const corners = [[0, 0], [w, 0], [0, h], [w, h]];
      let min = Infinity, max = -Infinity;
      for (const [px, py] of corners) { const pr = px * dx + py * dy; if (pr < min) min = pr; if (pr > max) max = pr; }
      waves.push({
        type: 'sweep', dx, dy,
        pos: min - 60, end: max + 60,
        speed: 2.6 + Math.random() * 1.8,
        width: 40 + Math.random() * 26,
        strength: 0.55 + Math.random() * 0.4,
      });
    }

    function energyAt(x, y) {
      let e = 0;
      for (const wv of waves) {
        if (wv.type === 'ring') {
          const d = Math.hypot(x - wv.x, y - wv.y);
          const fade = 1 - wv.r / wv.maxR;
          const g = Math.exp(-((d - wv.r) * (d - wv.r)) / (2 * wv.width * wv.width));
          e += g * wv.strength * fade;
        } else {
          const pr = x * wv.dx + y * wv.dy;
          const d = pr - wv.pos;
          const g = Math.exp(-(d * d) / (2 * wv.width * wv.width));
          e += g * wv.strength;
        }
      }
      return e;
    }

    function tick() {
      if (!alive) return;
      raf = requestAnimationFrame(tick);
      t++;
      try {
        // update waves
        if (t % ringEvery === 0) spawnRing();
        if (t % sweepEvery === 0) spawnSweep();
        for (let i = waves.length - 1; i >= 0; i--) {
          const wv = waves[i];
          if (wv.type === 'ring') { wv.r += wv.speed; if (wv.r > wv.maxR) waves.splice(i, 1); }
          else { wv.pos += wv.speed; if (wv.pos > wv.end) waves.splice(i, 1); }
        }

        ctx.clearRect(0, 0, w, h);
        if (weave) ctx.drawImage(weave, 0, 0, w, h);

        const time = t;
        ctx.globalCompositeOperation = 'lighter';
        for (const hx of hexes) {
          const idle = idleAmp * (0.5 + 0.5 * Math.sin(time * 0.018 - hx.p * 6));
          let e = energyAt(hx.x, hx.y) * intensity + idle;
          if (e < 0.06) continue;
          if (e > 1.25) e = 1.25;
          // colour: cyan -> bright cyan -> white as energy rises
          const k = Math.min(1, e);
          const r = Math.round(0 + 174 * k * k);
          const g = Math.round(212 + 43 * k);
          const b = 255;
      const a = Math.min(0.6, e * 0.42);
          hexPath(ctx, hx.x, hx.y, SIZE - 1.2);
          ctx.fillStyle = `rgba(${r},${Math.min(255,g)},${b},${a})`;
          ctx.fill();
          if (e > 0.6) {
            ctx.lineWidth = 1.2;
            ctx.strokeStyle = `rgba(${160 + 60 * k},255,255,${Math.min(0.9, e * 0.55)})`;
            ctx.stroke();
          }
        }
        ctx.globalCompositeOperation = 'source-over';
      } catch (err) {
        if (!window.__nsLogged) { console.error('HexField error:', err); window.__nsLogged = true; }
      }
    }

    build();
    // pre-seed a couple of waves so it's alive on first frame
    spawnRing(); spawnSweep();
    const ro = new ResizeObserver(build);
    ro.observe(canvas);
    tick();

    return { stop() { alive = false; cancelAnimationFrame(raf); ro.disconnect(); } };
  }

  window.createHexField = createHexField;

  // auto-attach to host backdrop if present
  const amb = document.getElementById('ambient');
  if (amb) createHexField(amb, { size: 24, baseAlpha: 0.05, idleAmp: 0.08, intensity: 0.9, ringEvery: 120 });
})();
