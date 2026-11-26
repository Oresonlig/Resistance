/* =========================================================================
   The Chain — /demo/misc/ (3.100.0). Batteriringen fylls och PARTY-knappen pulserar.
   Bara visning.
   ========================================================================= */
(() => {
  'use strict';
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const arc = document.getElementById('bc-arc');
  const pct = document.getElementById('bc-pct');
  const LEVEL = 78;
  const C = 2 * Math.PI * 26;
  arc.style.strokeDasharray = `${C}`;
  const show = (v) => { arc.style.strokeDashoffset = `${C * (1 - v / 100)}`; pct.textContent = `${v}%`; };
  if (reduce) { show(LEVEL); return; }
  const t0 = performance.now();
  const step = (t) => {
    const k = Math.min(1, (t - t0) / 1400);
    show(Math.round(LEVEL * (1 - Math.pow(1 - k, 3))));
    if (k < 1) requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
})();
