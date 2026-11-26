/* =========================================================================
   The Chain — /demo/training/ (3.100.0). Attrapp av träningsappen i Nanosuit.
   Bläddra: flikar, pass i kedjan. Allt annat är låst (data-demo-lock, se demo.js).
   Ingen nätverkstrafik, ingen lagring. All data nedan är påhittad.
   ========================================================================= */
(() => {
  'use strict';
  const $ = (s, r = document) => r.querySelector(s);
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

  // ---------- påhittad kedja ----------
  // state: done | active | next | later. Vilodag = 'V' (som i appen).
  const PASSES = [
    { id: 'A', name: 'Legs A', sub: 'Quads · glutes', state: 'done', ex: [
      { n: 'Back Squat', tag: 'ramp', sets: [['60', '8', 1], ['90', '5', 1], ['120', '5'], ['120', '5'], ['120', '5']] },
      { n: 'Romanian Deadlift', sets: [['100', '8'], ['100', '8'], ['100', '8']] },
      { n: 'Walking Lunge', tag: 'uni', sets: [['20', '12'], ['20', '12']] },
    ] },
    { id: 'B', name: 'Pull A', sub: 'Back · biceps', state: 'done', ex: [
      { n: 'Pull-up', tag: 'bw', sets: [['+15', '6'], ['+15', '6'], ['+15', '5']] },
      { n: 'Barbell Row', sets: [['80', '8'], ['80', '8'], ['80', '8']] },
      { n: 'Hammer Curl', sets: [['16', '10'], ['16', '10']] },
    ] },
    { id: 'C', name: 'Push A', sub: 'Chest · shoulders · triceps', state: 'active', ex: [
      { n: 'Bench Press', tag: 'ramp', saved: true, sets: [['50', '8', 1], ['70', '5', 1], ['90', '5'], ['90', '5'], ['90', '4']] },
      { n: 'Overhead Press', sets: [['55', '6'], ['55', '6'], ['', '']] },
      { n: 'Dips', tag: 'bw', sets: [['+10', ''], ['+10', ''], ['+10', '']] },
      { n: 'Plank', timed: true, sets: [['2:30'], ['']] },
    ] },
    { id: 'V', name: 'Rest day', sub: 'Recover', state: 'next', rest: true, ex: [] },
    { id: 'D', name: 'Legs B', sub: 'Hamstrings · calves', state: 'later', ex: [
      { n: 'Deadlift', tag: 'ramp', sets: [['100', '5', 1], ['140', '3'], ['140', '3'], ['140', '3']] },
      { n: 'Leg Press', sets: [['180', '10'], ['180', '10'], ['180', '10']] },
    ] },
    { id: 'E', name: 'Pull B', sub: 'Back · rear delts', state: 'later', ex: [
      { n: 'Chin-up', tag: 'bw', sets: [['+10', '8'], ['+10', '8'], ['+10', '7']] },
      { n: 'Face Pull', sets: [['25', '15'], ['25', '15']] },
    ] },
  ];
  const LAST = { 'Bench Press': '90 × 5, 5, 4 · 4 days ago', 'Overhead Press': '52.5 × 6, 6, 6', 'Dips': '+10 × 10, 9, 8', 'Plank': '2:30, 2:10',
    'Back Squat': '117.5 × 5, 5, 5', 'Romanian Deadlift': '95 × 8, 8, 8', 'Walking Lunge': '18 × 12, 12', 'Pull-up': '+12.5 × 6, 6, 6',
    'Barbell Row': '77.5 × 8, 8, 8', 'Hammer Curl': '14 × 12, 10', 'Deadlift': '135 × 3, 3, 3', 'Leg Press': '170 × 10, 10, 10',
    'Chin-up': '+7.5 × 8, 8, 8', 'Face Pull': '22.5 × 15, 15' };

  let current = 'C';

  function renderStrip() {
    $('#strip').innerHTML = PASSES.map((p) => {
      const cls = ['chain-tab', p.state, p.id === current ? 'active' : '', p.rest ? 'rest-day' : ''].join(' ');
      return `<button type="button" role="tab" class="${cls}" data-pass="${p.id}" aria-selected="${p.id === current}">
        <span class="chain-tab-letter">${p.id}</span><span class="chain-tab-name">${p.rest ? 'Rest' : p.name}</span></button>`;
    }).join('');
  }

  function setRow(s, i, ex) {
    const warm = s[2] === 1;
    const num = warm ? 'W' : String(i + 1 - ex.sets.filter((x, j) => j < i && x[2] === 1).length);
    if (ex.timed) {
      return `<div class="set-row"><span class="set-num">${num}</span>
        <input class="set-input wide" readonly data-demo-lock value="${s[0] || ''}" placeholder="m:ss"><span class="set-unit">min</span></div>`;
    }
    return `<div class="set-row${warm ? ' warm' : ''}"><span class="set-num">${num}</span>
      <input class="set-input${warm ? ' warmup' : ' work-set'}" readonly data-demo-lock value="${s[0]}" placeholder="kg"><span class="set-unit">${ex.tag === 'bw' ? 'kg+' : 'kg'}</span>
      <input class="set-input${warm ? ' warmup' : ' work-set'}" readonly data-demo-lock value="${s[1]}" placeholder="reps"><span class="set-unit">reps</span></div>`;
  }

  function renderPass() {
    const p = PASSES.find((x) => x.id === current);
    $('#pass-name').textContent = p.name;
    $('#pass-sub').textContent = p.sub;
    if (p.rest) {
      $('#pass-body').innerHTML = `<div class="ex-block ns-rest"><div class="ns-rest-v">V</div><p>Rest day. The chain holds.</p></div>`;
      return;
    }
    $('#pass-body').innerHTML = p.ex.map((ex, k) => `
      <div class="ex-block${ex.saved ? ' saved' : ''}" style="animation-delay:${k * 60}ms">
        <div class="ex-top">
          <div class="ex-name">${ex.n}${ex.tag ? `<span class="tag tag-${ex.tag}">${ex.tag.toUpperCase()}</span>` : ''}</div>
          ${ex.saved ? '<span class="ex-saved-badge">✓ Saved</span>' : `<button type="button" class="ex-btn" data-demo-lock>Skip</button>`}
        </div>
        <div class="ex-last">Last: ${LAST[ex.n] || '—'}</div>
        <div class="ex-sets">${ex.sets.map((s, i) => setRow(s, i, ex)).join('')}</div>
        ${ex.saved ? '' : `<div class="ex-foot"><button type="button" class="btn-ghost" data-demo-lock>+ Set</button><button type="button" class="btn-primary sm" data-demo-lock>Save</button></div>`}
        ${k === 1 && p.state === 'active' ? restTimerHTML() : ''}
      </div>`).join('');
  }

  // ---------- vilotimer: bara visuell, går i en slinga ----------
  function restTimerHTML() {
    return `<div class="ns-timer" aria-hidden="true"><svg viewBox="0 0 44 44"><circle class="trk" cx="22" cy="22" r="19"/><circle class="arc" id="timer-arc" cx="22" cy="22" r="19"/></svg>
      <span class="ns-timer-txt">REST <b id="timer-txt">1:30</b></span></div>`;
  }
  const REST = 90;
  let restLeft = 63;
  setInterval(() => {
    restLeft = restLeft <= 0 ? REST : restLeft - 1;
    const arc = $('#timer-arc'), txt = $('#timer-txt');
    if (!arc || !txt) return;
    const c = 2 * Math.PI * 19;
    arc.style.strokeDasharray = `${c}`;
    arc.style.strokeDashoffset = `${c * (1 - restLeft / REST)}`;
    txt.textContent = `${Math.floor(restLeft / 60)}:${String(restLeft % 60).padStart(2, '0')}`;
  }, 1000);

  // ---------- navigering (tillåten) ----------
  document.addEventListener('click', (e) => {
    const tab = e.target.closest('[data-pass]');
    if (tab) { current = tab.dataset.pass; renderStrip(); renderPass(); return; }
    const nav = e.target.closest('.ns-nav [data-view]');
    if (nav) {
      document.querySelectorAll('.ns-nav button').forEach((b) => b.classList.toggle('active', b === nav));
      document.querySelectorAll('.ns-view').forEach((v) => v.classList.toggle('active', v.id === 'v-' + nav.dataset.view));
      if (nav.dataset.view === 'progress') countUp();
      window.scrollTo(0, 0);
    }
  });

  // ---------- siffror som räknar upp ----------
  function countUp() {
    document.querySelectorAll('[data-count]').forEach((el) => {
      const target = +el.dataset.count;
      if (reduce) { el.textContent = target; return; }
      const t0 = performance.now();
      const step = (t) => {
        const k = Math.min(1, (t - t0) / 900);
        el.textContent = Math.round(target * (1 - Math.pow(1 - k, 3)));
        if (k < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    });
  }

  // ---------- grafer (SVG, påhittade serier) ----------
  function chart(id, pts, lo, hi) {
    const el = document.getElementById(id);
    const W = 320, H = 140, P = 10;
    const x = (i) => P + (i / (pts.length - 1)) * (W - 2 * P);
    const y = (v) => H - P - ((v - lo) / (hi - lo)) * (H - 2 * P);
    const line = pts.map((v, i) => `${i ? 'L' : 'M'}${x(i).toFixed(1)},${y(v).toFixed(1)}`).join(' ');
    const grid = [0.25, 0.5, 0.75].map((g) => `<line class="grid" x1="0" x2="${W}" y1="${H * g}" y2="${H * g}"/>`).join('');
    el.innerHTML = `${grid}<path class="area" d="${line} L${x(pts.length - 1)},${H} L${x(0)},${H} Z"/><path class="line" d="${line}"/>
      <circle class="dot" cx="${x(pts.length - 1)}" cy="${y(pts[pts.length - 1])}" r="3.5"/>`;
  }
  chart('chart-bench', [70, 72.5, 72.5, 75, 77.5, 77.5, 80, 80, 82.5, 85, 85, 87.5, 87.5, 90, 92.5], 65, 95);
  chart('chart-weight', [83.5, 83.6, 83.2, 83.4, 82.9, 83.0, 82.6, 82.8, 82.3, 82.5, 82.1, 81.9, 82.2, 81.8, 81.6, 81.9, 81.5, 81.4], 80.5, 84.5);

  renderStrip();
  renderPass();

  // ---------- Nanosuit-bakgrunden: hexvävens energivågor (port av mountNanosuitBg i /training/) ----------
  const canvas = $('#ns-hex');
  const ctx = canvas.getContext('2d');
  const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
  const SIZE = 16, BASE = 0.08, idleAmp = 0.09, intensity = 0.92, ringEvery = 80, sweepEvery = 260;
  const HH = Math.sqrt(3) * SIZE, COLX = SIZE * 1.5;
  let w = 0, h = 0, t = 0, last = 0, hexes = [], weave = null;
  const waves = [];
  const hexPath = (c, cx, cy, r) => {
    c.beginPath();
    for (let i = 0; i < 6; i++) { const a = (Math.PI / 180) * (60 * i); const px = cx + r * Math.cos(a), py = cy + r * Math.sin(a); i ? c.lineTo(px, py) : c.moveTo(px, py); }
    c.closePath();
  };
  function build() {
    w = innerWidth; h = innerHeight;
    canvas.width = w * dpr; canvas.height = h * dpr;
    canvas.style.width = w + 'px'; canvas.style.height = h + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    hexes = [];
    const cols = Math.ceil(w / COLX) + 2, rows = Math.ceil(h / HH) + 2;
    for (let cx = -1; cx < cols; cx++) for (let cy = -1; cy < rows; cy++) {
      const px = cx * COLX, py = cy * HH + (cx % 2 ? HH / 2 : 0);
      hexes.push({ x: px, y: py, p: px * 0.012 + py * 0.009 });
    }
    weave = document.createElement('canvas');
    weave.width = canvas.width; weave.height = canvas.height;
    const wc = weave.getContext('2d');
    wc.setTransform(dpr, 0, 0, dpr, 0, 0);
    wc.strokeStyle = `rgba(0,212,255,${BASE})`; wc.lineWidth = 1;
    for (const hx of hexes) { hexPath(wc, hx.x, hx.y, SIZE - 1.2); wc.stroke(); }
    ctx.clearRect(0, 0, w, h); ctx.drawImage(weave, 0, 0, w, h);
  }
  const spawnRing = () => waves.push({ type: 'ring', x: Math.random() * w, y: Math.random() * h, r: 0, maxR: Math.hypot(w, h) * (0.45 + Math.random() * 0.35), speed: 1.4 + Math.random() * 1.4, width: 26 + Math.random() * 22, strength: 0.7 + Math.random() * 0.5 });
  function spawnSweep() {
    const ang = (Math.random() < 0.5 ? 1 : -1) * (0.5 + Math.random() * 0.6);
    const dx = Math.cos(ang), dy = Math.sin(ang);
    let min = Infinity, max = -Infinity;
    for (const c of [[0, 0], [w, 0], [0, h], [w, h]]) { const pr = c[0] * dx + c[1] * dy; if (pr < min) min = pr; if (pr > max) max = pr; }
    waves.push({ type: 'sweep', dx, dy, pos: min - 60, end: max + 60, speed: 2.6 + Math.random() * 1.8, width: 40 + Math.random() * 26, strength: 0.55 + Math.random() * 0.4 });
  }
  function energyAt(px, py) {
    let e = 0;
    for (const wv of waves) {
      if (wv.type === 'ring') { const d = Math.hypot(px - wv.x, py - wv.y); e += Math.exp(-((d - wv.r) ** 2) / (2 * wv.width ** 2)) * wv.strength * (1 - wv.r / wv.maxR); }
      else { const d = (px * wv.dx + py * wv.dy) - wv.pos; e += Math.exp(-(d * d) / (2 * wv.width ** 2)) * wv.strength; }
    }
    return e;
  }
  function tick(ts) {
    requestAnimationFrame(tick);
    if (ts - last < 33) return;
    last = ts; t++;
    if (t % ringEvery === 0) spawnRing();
    if (t % sweepEvery === 0) spawnSweep();
    for (let i = waves.length - 1; i >= 0; i--) {
      const wv = waves[i];
      if (wv.type === 'ring') { wv.r += wv.speed; if (wv.r > wv.maxR) waves.splice(i, 1); }
      else { wv.pos += wv.speed; if (wv.pos > wv.end) waves.splice(i, 1); }
    }
    ctx.clearRect(0, 0, w, h);
    ctx.drawImage(weave, 0, 0, w, h);
    ctx.globalCompositeOperation = 'lighter';
    for (const hx of hexes) {
      let e = energyAt(hx.x, hx.y) * intensity + idleAmp * (0.5 + 0.5 * Math.sin(t * 0.018 - hx.p * 6));
      if (e < 0.06) continue;
      if (e > 1.25) e = 1.25;
      const k = Math.min(1, e);
      hexPath(ctx, hx.x, hx.y, SIZE - 1.2);
      ctx.fillStyle = `rgba(${Math.round(174 * k * k)},${Math.min(255, Math.round(212 + 43 * k))},255,${Math.min(0.6, e * 0.42)})`;
      ctx.fill();
      if (e > 0.6) { ctx.lineWidth = 1.2; ctx.strokeStyle = `rgba(${160 + 60 * k},255,255,${Math.min(0.9, e * 0.55)})`; ctx.stroke(); }
    }
    ctx.globalCompositeOperation = 'source-over';
  }
  build();
  addEventListener('resize', build);
  if (!reduce) { spawnRing(); spawnSweep(); requestAnimationFrame(tick); }
})();
