/* =========================================================================
   The Chain — /demo/diet/ (3.100.0). Basketly-attrapp. Alla rätter, priser och
   besparingar är PÅHITTADE. Inget nätverk, ingen lagring.
   ========================================================================= */
(() => {
  'use strict';
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

  // dag, rätt, minuter, kostnad (kr), besparing (kr), vego, helg, färg på rätten
  const WEEK = [
    ['Mon', 'Lemon chicken with roasted potatoes', 30, 74, 31, 0, 0, '#f2b33d'],
    ['Tue', 'Creamy tomato & white bean pasta', 20, 52, 18, 1, 0, '#e0582a'],
    ['Wed', 'Salmon with dill and new potatoes', 25, 96, 42, 0, 0, '#f08a6a'],
    ['Thu', 'Red lentil curry with rice', 25, 41, 12, 1, 0, '#e8a33a'],
    ['Fri', 'Taco night, beef & black beans', 30, 88, 27, 0, 0, '#c9542a'],
    ['Sat', 'Slow-roasted pork shoulder, apple slaw', 120, 151, 39, 0, 1, '#b8743a'],
    ['Sun', 'Mushroom & barley risotto', 45, 110, 15, 1, 1, '#c9a46a'],
  ];
  const TOTAL = WEEK.reduce((s, d) => s + d[4], 0);

  // ---------- staplar ----------
  const max = Math.max(...WEEK.map((d) => d[4]));
  document.getElementById('bars').innerHTML = WEEK.map((d, i) =>
    `<a href="#day-${i}"><span>${d[4]}</span><i class="bar" style="height:${Math.round((d[4] / max) * 100)}%;animation-delay:${i * 70}ms"></i></a>`).join('');
  document.getElementById('bar-labels').innerHTML = WEEK.map((d) => `<div>${d[0]}</div>`).join('');

  // ---------- dagkort med en ritad tallrik ----------
  const plate = (c, k) => `<svg class="dish bob" viewBox="0 0 100 100" width="104" height="104" style="--bob-delay:-${k * 0.7}s" aria-hidden="true">
    <circle cx="50" cy="50" r="44" fill="var(--d-plate)"/><circle cx="50" cy="50" r="34" fill="none" stroke="rgba(0,0,0,.06)" stroke-width="2"/>
    <ellipse cx="44" cy="52" rx="20" ry="15" fill="${c}"/><circle cx="62" cy="44" r="9" fill="var(--d-green)"/>
    <circle cx="58" cy="60" r="5" fill="var(--d-accent)"/><circle cx="38" cy="44" r="3" fill="#fff" opacity=".7"/></svg>`;
  document.getElementById('cards').innerHTML = WEEK.map((d, i) => `
    <article class="card${d[6] ? ' we' : ''}" id="day-${i}">
      <div class="card-top"><span><b>${d[0]}</b>${d[6] ? ' · weekend' : ''}</span><span>${d[2]} min · ca ${d[3]} kr</span></div>
      <div class="plate${d[5] ? ' vego' : ''}${d[6] ? ' we' : ''}">${plate(d[7], i)}</div>
      ${d[4] >= 10 ? `<div class="tag"><span>Save</span><b>${d[4]}<small>kr</small></b></div>` : ''}
      <div class="card-body"><h3 class="card-title">${d[1]}</h3>
        <div class="tags">${d[5] ? '<span class="pill vego">Vego</span>' : '<span class="pill">Meat &amp; fish</span>'}${d[6] ? '<span class="pill we">Weekend</span>' : ''}</div></div>
      <div class="acts"><button type="button" data-demo-lock>Swap</button><button type="button" data-demo-lock>Lock</button></div>
    </article>`).join('');

  // ---------- besparingen räknar upp ----------
  const els = [document.getElementById('save-num'), document.getElementById('save-num-2')];
  if (reduce) els.forEach((el) => { el.textContent = TOTAL; });
  else {
    const t0 = performance.now();
    const step = (t) => {
      const k = Math.min(1, (t - t0) / 1400);
      const v = Math.round(TOTAL * (1 - Math.pow(1 - k, 3)));
      els.forEach((el) => { el.textContent = v; });
      if (k < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }

  // ---------- partiklar i hero ----------
  if (!reduce) {
    const pts = document.getElementById('pts');
    for (let i = 0; i < 9; i++) {
      const p = document.createElement('span');
      p.className = 'pt';
      const s = 4 + (i % 4) * 2;
      p.style.cssText = `left:${6 + i * 10.5}%;width:${s}px;height:${s}px;animation-duration:${11 + (i % 5)}s;animation-delay:-${(i * 1.6).toFixed(1)}s`;
      pts.appendChild(p);
    }
  }
})();
