/* =========================================================================
   The Chain — /demo/ (3.100.0). Visningsläge för intervjuer (Niklas 2026-11-26).
   Delad kod för demons startsida och undersidor. INGEN Supabase, ingen inloggning,
   inget sparas: sidorna laddar bara skript ur /demo/ (aldrig Supabase-klienten eller
   sajtens delade kod), och CSP:n har connect-src 'none' (testat i tests/demo.test.js).
   All data är påhittad.
   ========================================================================= */
(() => {
  'use strict';

  // ---------- partiklar (kopia av site.js seedParticles, utan Supabase-beroendet) ----------
  const mqMobile = matchMedia('(max-width: 760px)');
  const reduce = matchMedia('(prefers-reduced-motion: reduce)');
  function seedParticles() {
    const n = mqMobile.matches ? 5 : 7;
    document.querySelectorAll('.tc-fx').forEach((fx) => {
      fx.textContent = '';
      if (reduce.matches) return;
      const kind = fx.closest('[data-section]').dataset.section;
      for (let i = 0; i < n; i++) {
        const p = document.createElement('span');
        p.className = 'tc-p';
        const size = kind === 'training' ? 2 + (i % 3) : kind === 'diet' ? 3 + (i % 4) : kind === 'evosuite' ? 2 + (i % 2) : 5 + (i * 3) % 10;
        const base = kind === 'training' ? 8 : kind === 'diet' ? 13 : kind === 'evosuite' ? 15 : 11;
        p.style.setProperty('--x', `${8 + (84 / n) * i + ((i * 7) % 9)}%`);
        p.style.setProperty('--s', `${size}px`);
        p.style.setProperty('--d', `${base + (i % 5)}s`);
        p.style.setProperty('--dl', `-${(i * 1.7).toFixed(1)}s`);
        fx.appendChild(p);
      }
    });
  }
  mqMobile.addEventListener('change', seedParticles);
  reduce.addEventListener('change', seedParticles);
  seedParticles();

  // ---------- demons startsida: panelerna öppnas som på riktiga startsidan ----------
  const root = document.getElementById('tc');
  const panels = [...document.querySelectorAll('.tc-panel')];
  if (root && panels.length) {
    let open = mqMobile.matches ? 'training' : null;
    const render = () => panels.forEach((p) => {
      const key = p.dataset.section;
      const st = open === null ? 'equal' : (open === key ? 'open' : 'collapsed');
      p.dataset.state = st;
      p.querySelector('.tc-strip').setAttribute('aria-expanded', String(st === 'open'));
    });
    root.addEventListener('click', (e) => {
      const strip = e.target.closest('[data-action="open"]');
      if (!strip) return;
      open = strip.closest('.tc-panel').dataset.section;
      render();
    });
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && open !== null) { open = null; render(); } });
    render();
  }

  // ---------- undersidorna: "låst" — knappar och fält gör ingenting ----------
  // Allt med data-demo-lock visar en kort skylt i stället för att göra något.
  let toastTimer = 0;
  document.addEventListener('click', (e) => {
    const el = e.target.closest('[data-demo-lock]');
    if (!el) return;
    e.preventDefault();
    let toast = document.getElementById('demo-toast');
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'demo-toast';
      toast.setAttribute('role', 'status');
      document.body.appendChild(toast);
    }
    toast.textContent = 'Demo mode: view only';
    toast.dataset.on = '';
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => { delete toast.dataset.on; }, 1400);
  });
})();
