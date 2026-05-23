// ObsidianTheme.jsx — self-contained Obsidian theme for "The Chain" training app.
//
// What it ships:
//   - <ObsidianTheme /> component: the entire training session screen with theme
//   - <ObsidianEmbers /> sub-component: canvas of rising glowing embers (the
//     ambient backdrop layer). Sits at z-index 0 inside the theme root.
//   - All styles scoped to .ob-* class names — no global CSS, no Tailwind.
//
// Integration:
//   1. Drop this file into your app (e.g. src/themes/ObsidianTheme.jsx)
//   2. Import and render <ObsidianTheme /> as a full-bleed view
//   3. Replace the hard-coded session data (props or context) with your real
//      training session model. All the static strings — "THE CHAIN", "Dead Hang",
//      tag labels, exercise list — are co-located near the bottom of the file.
//
// Browser support: requires CSS background-clip: text (chrome/safari/firefox
// modern) and Canvas 2D. The ember mix-blend-mode 'screen' needs the .ob-root
// container to have `isolation: isolate` (it does).
//
// Performance: 32 ember particles @ ~60fps. On mobile you can lower NUM to ~16.

import React from 'react';

// ------- ember canvas -------
function ObsidianEmbers({ count = 32 }) {
  const canvasRef = React.useRef(null);
  React.useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let w = 0, h = 0, raf = 0;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    function resize() {
      const r = canvas.getBoundingClientRect();
      w = r.width; h = r.height;
      canvas.width = w * dpr; canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    resize();
    const ro = new ResizeObserver(resize); ro.observe(canvas);

    const rand = (a, b) => a + Math.random() * (b - a);
    function spawn(initial) {
      return {
        x: rand(0, w),
        y: initial ? rand(0, h) : h + rand(0, 40),
        r: rand(0.5, 1.8),
        vy: rand(0.1, 0.32),
        vx: rand(-0.06, 0.06),
        sp: rand(0, Math.PI * 2),
        ss: rand(0.004, 0.014),
        sa: rand(0.1, 0.35),
        life: 0,
        maxLife: rand(700, 1600),
        hue: rand(22, 38),
        baseAlpha: rand(0.35, 0.9),
      };
    }
    const arr = [];
    for (let i = 0; i < count; i++) arr.push(spawn(true));

    let t = 0;
    function tick() {
      t++;
      ctx.clearRect(0, 0, w, h);
      for (let i = 0; i < arr.length; i++) {
        const e = arr[i];
        e.life++;
        e.sp += e.ss;
        e.x += e.vx + Math.sin(e.sp) * e.sa;
        e.y -= e.vy;
        const lt = e.life / e.maxLife;
        let a =
          lt < 0.15 ? lt / 0.15 :
          lt > 0.7  ? Math.max(0, 1 - (lt - 0.7) / 0.3) :
          1;
        a *= e.baseAlpha * (0.7 + 0.3 * Math.sin(t * 0.04 + e.sp));
        if (e.y < -10 || e.life > e.maxLife) { arr[i] = spawn(false); continue; }
        const g = ctx.createRadialGradient(e.x, e.y, 0, e.x, e.y, e.r * 5);
        g.addColorStop(0,   `hsla(${e.hue},      90%, 62%, ${a})`);
        g.addColorStop(0.5, `hsla(${e.hue},      90%, 42%, ${a * 0.4})`);
        g.addColorStop(1,   `hsla(${e.hue},      90%, 32%, 0)`);
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(e.x, e.y, e.r * 5, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = `hsla(${e.hue + 8}, 100%, 82%, ${a * 0.9})`;
        ctx.beginPath();
        ctx.arc(e.x, e.y, e.r * 0.5, 0, Math.PI * 2);
        ctx.fill();
      }
      raf = requestAnimationFrame(tick);
    }
    tick();

    return () => { cancelAnimationFrame(raf); ro.disconnect(); };
  }, [count]);

  return <canvas ref={canvasRef} className="ob-embers" />;
}

// ------- the screen -------
function ObsidianTheme() {
  return (
    <div className="ob-root">
      <ObsidianThemeStyles />
      <ObsidianEmbers />

      {/* Top bar */}
      <div className="ob-topbar">
        <div className="ob-brand">
          <svg viewBox="0 0 32 32" fill="none" stroke="#c9a35a" strokeWidth="1.2">
            <path d="M16 3 L29 10 L29 22 L16 29 L3 22 L3 10 Z" />
            <path d="M16 9 L23 13 L23 19 L16 23 L9 19 L9 13 Z" />
            <circle cx="16" cy="16" r="2" fill="#c9a35a" stroke="none" />
          </svg>
          <div className="ob-brand-name">THE CHAIN</div>
        </div>
        <div className="ob-meta">
          <div>TRAINING AS</div>
          <div className="ob-meta-v">LOG OUT</div>
          <div style={{ marginTop: 4 }}>
            <span className="ob-sync-dot" />V3.30.14 · SYNC
          </div>
        </div>
      </div>

      <div className="ob-scroll">
        {/* Title */}
        <div className="ob-title">
          <div className="ob-h1">THE CHAIN</div>
          <div className="ob-edit">⌖ EDIT</div>
        </div>
        <div className="ob-meta-row">Trial I of IV · Round I</div>
        <div className="ob-rule">
          <div className="ob-rule-line" />
          <div className="ob-rule-center">✦</div>
          <div className="ob-rule-line" />
        </div>

        {/* Section navigator */}
        <div className="ob-nav">
          <div className="ob-medal">A</div>
          <div className="ob-medal ob-medal--active">
            <span className="ob-medal-l">B</span>
            <span className="ob-medal-t">BACK · BICEPS</span>
          </div>
          <div className="ob-medal">V1</div>
          <div className="ob-medal">C</div>
        </div>

        <div className="ob-section-h">RITE B · BACK · BICEPS</div>

        {/* Active exercise card */}
        <div className="ob-card">
          <div className="ob-ex-name">
            Dead Hang
            <span className="ob-tag">BW+</span>
            <span className="ob-tag ob-tag--ember">TIMED</span>
          </div>
          <div className="ob-ex-desc">Supinated or neutral · one set to failure</div>
          <div className="ob-ex-note">inscribe note</div>
          <div className="ob-btns">
            <div className="ob-btn">SKIP</div>
            <div className="ob-btn">⌖ AMEND</div>
          </div>
        </div>

        {/* Work set */}
        <div className="ob-worklabel"><span className="ob-worklabel-s">WORK</span>SET III</div>
        <div className="ob-workrow">
          <div className="ob-input">0</div>
          <div className="ob-input ob-input--dim">—</div>
          <div className="ob-input">0</div>
          <div className="ob-log">LOG</div>
        </div>
        <div className="ob-sublabels">
          <div>+KG (BW:?)</div><div>SEC</div><div>+F</div><div />
        </div>

        <div className="ob-action">+ ADD SET</div>
        <div className="ob-action ob-action--warm">+ WARM-UP</div>
        <div className="ob-action ob-action--done">✦ COMPLETE</div>

        {/* Collapsed exercises */}
        <div className="ob-row">
          <span className="ob-row-chev">▾</span>
          <span className="ob-row-name">Deadlift</span>
          <span className="ob-tag">RAMP</span>
        </div>
        <div className="ob-row">
          <span className="ob-row-chev">▾</span>
          <span className="ob-row-name">Unilateral Cable Row</span>
          <span className="ob-tag ob-tag--green">UNILATERAL</span>
        </div>
        <div className="ob-add">ADD EXERCISE</div>
      </div>

      {/* Tab bar */}
      <div className="ob-tabs">
        <div className="ob-tab ob-tab--active">CHAIN</div>
        <div className="ob-tab">PROGRESS</div>
        <div className="ob-tab">WEIGHT</div>
        <div className="ob-tab">SETTINGS</div>
      </div>
    </div>
  );
}

// ------- styles -------
// Inlined so this single file is drop-in. In a real app you'd extract to a
// stylesheet (obsidian-theme.css) and import it. The font stack assumes
// 'Cinzel' and 'Cardo' from Google Fonts are loaded by the host app:
//   <link href="https://fonts.googleapis.com/css2?family=Cinzel:wght@400;500;600;700&family=Cardo:ital,wght@0,400;0,700;1,400&display=swap" rel="stylesheet">
function ObsidianThemeStyles() {
  return <style>{OBSIDIAN_CSS}</style>;
}

const OBSIDIAN_CSS = `
.ob-root {
  position: absolute; inset: 0;
  background:
    radial-gradient(ellipse 70% 30% at 50% 0%,   rgba(220, 150, 70, 0.18), transparent 70%),
    radial-gradient(ellipse 90% 60% at 50% 110%, rgba(140, 50, 30, 0.22),  transparent 60%),
    radial-gradient(ellipse 60% 40% at 80% 50%,  rgba(120, 40, 20, 0.06),  transparent 70%),
    #0a0805;
  color: #c0b39a;
  font-family: 'Cardo', 'EB Garamond', serif;
  font-size: 13px;
  overflow: hidden;
  display: flex; flex-direction: column;
  isolation: isolate;
}
.ob-root, .ob-root * { box-sizing: border-box; }
.ob-embers {
  position: absolute; inset: 0; pointer-events: none; z-index: 0;
  mix-blend-mode: screen;
}
.ob-root::before {
  content: ''; position: absolute; inset: 0; pointer-events: none; z-index: 1;
  background-image:
    radial-gradient(circle at 30% 40%, rgba(180, 130, 60, 0.04) 0 1px, transparent 1px),
    radial-gradient(circle at 70% 60%, rgba(160, 80, 40, 0.05)  0 1px, transparent 1px);
  background-size: 19px 23px, 31px 27px;
  mix-blend-mode: screen;
}
.ob-root::after {
  content: ''; position: absolute; inset: 0; pointer-events: none; z-index: 1;
  background: radial-gradient(ellipse at center, transparent 45%, rgba(0,0,0,0.55) 100%);
}

.ob-topbar {
  display: flex; justify-content: space-between; align-items: center;
  padding: 16px 18px 10px;
  position: relative; z-index: 3;
  border-bottom: 1px solid rgba(200, 160, 90, 0.12);
}
.ob-brand { display: flex; align-items: center; gap: 10px; }
.ob-brand svg { width: 22px; height: 22px; animation: ob-sigilBreath 4.2s ease-in-out infinite; }
.ob-brand svg path, .ob-brand svg circle { filter: drop-shadow(0 0 3px rgba(220, 160, 70, 0.5)); }
@keyframes ob-sigilBreath {
  0%, 100% { opacity: 0.85; filter: drop-shadow(0 0 2px rgba(200,140,50,0.4)); }
  50%      { opacity: 1;    filter: drop-shadow(0 0 8px rgba(240,180,80,0.7)); }
}
.ob-brand-name {
  font-family: 'Cinzel', serif; font-size: 12px; letter-spacing: 0.34em;
  color: #c9a35a; font-weight: 600;
}
.ob-meta {
  text-align: right; font-family: 'Cinzel', serif; font-size: 8px;
  letter-spacing: 0.2em; color: #6a5a3a; line-height: 1.7; font-weight: 600;
}
.ob-meta-v { color: #a8442e; }
.ob-sync-dot {
  display: inline-block; width: 6px; height: 6px; border-radius: 50%;
  background: #c9a35a; box-shadow: 0 0 6px #c9a35a;
  animation: ob-syncBlink 2.6s ease-in-out infinite;
  margin-right: 4px; vertical-align: middle;
}
@keyframes ob-syncBlink {
  0%, 100% { opacity: 0.5; box-shadow: 0 0 4px  #c9a35a; }
  50%      { opacity: 1;   box-shadow: 0 0 10px #f0d99c; }
}

.ob-scroll { flex: 1; overflow: auto; position: relative; z-index: 2; }

.ob-title {
  padding: 22px 22px 4px;
  display: flex; justify-content: space-between; align-items: flex-start;
}
.ob-h1 {
  font-family: 'Cinzel', serif;
  font-size: 32px; font-weight: 700; line-height: 1;
  letter-spacing: 0.04em;
  background: linear-gradient(110deg,
    #8a6d30 0%, #c9a35a 25%, #f8e6b0 45%, #ffe9a8 50%,
    #f8e6b0 55%, #c9a35a 75%, #8a6d30 100%);
  background-size: 250% 100%;
  background-position: 0% 50%;
  -webkit-background-clip: text; background-clip: text;
  -webkit-text-fill-color: transparent;
  animation: ob-shimmer 8s ease-in-out infinite;
  filter: drop-shadow(0 0 12px rgba(200, 150, 70, 0.18));
}
@keyframes ob-shimmer {
  0%, 100% { background-position: 0% 50%; }
  50%      { background-position: 100% 50%; }
}
.ob-edit {
  font-family: 'Cinzel', serif; font-size: 9px; letter-spacing: 0.22em; font-weight: 600;
  color: #c9a35a; padding: 7px 12px;
  border: 1px solid #4a3a18;
  background: linear-gradient(180deg, rgba(50,35,14,0.5), rgba(20,14,6,0.5));
}
.ob-meta-row {
  padding: 0 22px 14px; font-family: 'Cardo', serif; font-style: italic;
  color: #7a6a48; font-size: 12px; letter-spacing: 0.04em;
}
.ob-rule { margin: 0 22px 18px; height: 14px; display: flex; align-items: center; gap: 10px; color: #4a3a18; }
.ob-rule-line { flex: 1; height: 1px; background: linear-gradient(90deg, transparent, #4a3a18 25%, #c9a35a 50%, #4a3a18 75%, transparent); }
.ob-rule-center { color: #c9a35a; font-size: 13px; animation: ob-pulseGlow 3.4s ease-in-out infinite; }
@keyframes ob-pulseGlow {
  0%, 100% { opacity: 0.55; text-shadow: 0 0 2px  #c9a35a; transform: scale(1); }
  50%      { opacity: 1;    text-shadow: 0 0 12px #c9a35a, 0 0 24px rgba(200,150,70,0.4); transform: scale(1.08); }
}

.ob-nav { display: flex; padding: 0 18px 4px; gap: 6px; align-items: center; }
.ob-medal {
  width: 36px; height: 36px; flex-shrink: 0; border-radius: 50%;
  border: 1px solid #3a2e14; background: rgba(20,14,6,0.6);
  display: flex; align-items: center; justify-content: center;
  color: #5a4a28; font-family: 'Cinzel', serif; font-size: 11px; font-weight: 600;
  position: relative;
}
.ob-medal--active {
  flex: 1; border-radius: 6px;
  border: 1px solid #c9a35a;
  background: linear-gradient(180deg, rgba(70,50,20,0.7), rgba(30,20,8,0.7));
  color: #f0d99c;
  gap: 12px; padding: 0 16px; justify-content: flex-start;
  box-shadow:
    inset 0 1px 0 rgba(240,200,130,0.18),
    inset 0 -1px 0 rgba(0,0,0,0.5),
    0 0 16px rgba(200,150,70,0.18);
  animation: ob-medalBreath 4.6s ease-in-out infinite;
}
@keyframes ob-medalBreath {
  0%, 100% { box-shadow: inset 0 1px 0 rgba(240,200,130,0.18), inset 0 -1px 0 rgba(0,0,0,0.5), 0 0 12px rgba(200,150,70,0.14); }
  50%      { box-shadow: inset 0 1px 0 rgba(240,200,130,0.24), inset 0 -1px 0 rgba(0,0,0,0.5), 0 0 24px rgba(220,160,80,0.32); }
}
.ob-medal--active::before, .ob-medal--active::after {
  content: ''; position: absolute; top: 50%; width: 8px; height: 8px;
  border: 1px solid #c9a35a; transform: translateY(-50%) rotate(45deg);
  background: #0a0805;
}
.ob-medal--active::before { left: -5px; }
.ob-medal--active::after  { right: -5px; }
.ob-medal-l {
  font-family: 'Cinzel', serif; font-size: 16px; font-weight: 700; color: #f0d99c;
}
.ob-medal-t {
  font-family: 'Cinzel', serif; font-size: 10px; letter-spacing: 0.2em; color: #d4b878; font-weight: 600;
}

.ob-section-h {
  padding: 22px 22px 4px;
  font-family: 'Cinzel', serif; font-size: 11px; letter-spacing: 0.32em; color: #c9a35a;
  font-weight: 600;
  display: flex; align-items: center; gap: 10px;
}
.ob-section-h::before {
  content: ''; display: inline-block; width: 4px; height: 12px;
  background: linear-gradient(180deg, #c9a35a, #4a3a18);
}

.ob-card {
  margin: 8px 18px; padding: 16px 16px 14px;
  background:
    radial-gradient(ellipse 80% 60% at 20% 0%, rgba(120,60,20,0.18), transparent 70%),
    linear-gradient(180deg, rgba(40,28,12,0.55), rgba(15,10,4,0.55));
  border: 1px solid #2a2010;
  border-radius: 2px;
  box-shadow: inset 0 1px 0 rgba(240,200,130,0.06), 0 0 0 1px #0a0805, 0 0 1px 2px #2a2010;
  position: relative;
}
.ob-ex-name {
  font-family: 'Cinzel', serif; font-size: 22px; font-weight: 600; color: #f0d99c;
  letter-spacing: 0.02em; line-height: 1.05;
}
.ob-ex-desc { color: #8a7a58; font-size: 12px; margin-top: 6px; font-style: italic; font-family: 'Cardo', serif; }
.ob-ex-note {
  color: #a8442e; font-size: 11px; margin-top: 10px; letter-spacing: 0.06em;
  font-family: 'Cinzel', serif; font-weight: 600;
}
.ob-ex-note::before { content: '✚ '; }

.ob-tag {
  display: inline-block; padding: 2px 8px; font-size: 8px; letter-spacing: 0.22em;
  font-family: 'Cinzel', serif; color: #c9a35a; border: 1px solid #4a3a18;
  background: rgba(40,28,12,0.5);
  margin-left: 6px; vertical-align: middle; font-weight: 600;
}
.ob-tag--ember { color: #d68262; border-color: #5a2018; }
.ob-tag--green { color: #9ab57a; border-color: #2a3a18; }

.ob-btns { display: flex; gap: 8px; margin-top: 14px; }
.ob-btn {
  font-family: 'Cinzel', serif; font-size: 9px; letter-spacing: 0.22em; font-weight: 600;
  padding: 8px 14px; border: 1px solid #4a3a18; color: #c9a35a;
  background: linear-gradient(180deg, rgba(50,35,14,0.4), rgba(20,14,6,0.4));
}

.ob-worklabel { padding: 14px 22px 6px; font-family: 'Cinzel', serif; font-size: 10px; letter-spacing: 0.32em; color: #5a4a28; font-weight: 600; }
.ob-worklabel-s { color: #a8442e; margin-right: 10px; }
.ob-workrow { display: flex; padding: 0 18px 4px; gap: 4px; }
.ob-input {
  flex: 1; height: 42px; border: 1px solid #2a2010; background: rgba(15,10,4,0.6);
  color: #f0d99c; font-family: 'Cinzel', serif; font-size: 18px; text-align: center;
  font-weight: 600;
  display: flex; align-items: center; justify-content: center;
  box-shadow: inset 0 1px 0 rgba(240,200,130,0.04);
}
.ob-input--dim { color: #3a2e14; }
.ob-log {
  position: relative; overflow: hidden;
  height: 42px; padding: 0 18px;
  background: linear-gradient(180deg, #c9a35a 0%, #8a6d30 100%);
  border: 1px solid #f0d99c; border-bottom-color: #4a3a18;
  color: #1a0e04; font-family: 'Cinzel', serif; font-size: 12px; letter-spacing: 0.24em; font-weight: 700;
  box-shadow: 0 0 18px rgba(200,150,70,0.25), inset 0 1px 0 rgba(255,230,180,0.5);
  animation: ob-logBreath 2.8s ease-in-out infinite;
  display: flex; align-items: center; justify-content: center;
}
@keyframes ob-logBreath {
  0%, 100% { box-shadow: 0 0 14px rgba(200,150,70,0.22), inset 0 1px 0 rgba(255,230,180,0.5); }
  50%      { box-shadow: 0 0 28px rgba(240,180,90,0.55), 0 0 4px rgba(240,200,130,0.5), inset 0 1px 0 rgba(255,240,200,0.7); }
}
.ob-log::after {
  content: ''; position: absolute; top: 0; left: -60%; width: 50%; height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255,240,200,0.5), transparent);
  animation: ob-logShimmer 5.4s ease-in-out infinite;
  pointer-events: none;
}
@keyframes ob-logShimmer {
  0%       { left: -60%; }
  60%, 100% { left: 120%; }
}
.ob-sublabels { display: flex; padding: 4px 18px 0; gap: 4px; font-size: 9px; color: #4a3a18; letter-spacing: 0.18em; font-family: 'Cinzel', serif; font-weight: 600; }
.ob-sublabels > div { flex: 1; text-align: center; }
.ob-sublabels > div:last-child { flex: 0 0 60px; }

.ob-action {
  margin: 10px 18px 0; height: 38px; display: flex; align-items: center; justify-content: center;
  border: 1px solid #2a2010;
  color: #6a5a38;
  font-family: 'Cinzel', serif; font-size: 10px; letter-spacing: 0.28em; font-weight: 600;
  background: linear-gradient(180deg, rgba(30,22,10,0.5), rgba(15,10,4,0.5));
}
.ob-action--warm { color: #a8442e; }
.ob-action--done {
  color: #f0d99c; border-color: #c9a35a;
  background: linear-gradient(180deg, rgba(70,50,20,0.7), rgba(30,20,8,0.7));
  font-size: 13px; letter-spacing: 0.34em;
  box-shadow: inset 0 1px 0 rgba(240,200,130,0.15), 0 0 14px rgba(200,150,70,0.15);
  animation: ob-doneBreath 5.2s ease-in-out infinite;
}
@keyframes ob-doneBreath {
  0%, 100% { box-shadow: inset 0 1px 0 rgba(240,200,130,0.15), 0 0 10px rgba(200,150,70,0.12); }
  50%      { box-shadow: inset 0 1px 0 rgba(240,200,130,0.22), 0 0 22px rgba(220,160,80,0.28); }
}

.ob-row {
  display: flex; align-items: center; gap: 12px; padding: 16px 22px;
  border-top: 1px solid rgba(200,160,90,0.08);
}
.ob-row-chev { color: #4a3a18; font-size: 9px; }
.ob-row-name { font-family: 'Cinzel', serif; font-size: 16px; font-weight: 600; color: #c9a35a; letter-spacing: 0.04em; }
.ob-row:first-of-type { margin-top: 18px; }
.ob-add {
  padding: 18px; text-align: center;
  font-family: 'Cinzel', serif; font-size: 9px; letter-spacing: 0.32em; color: #5a4a28; font-weight: 600;
  border-top: 1px solid rgba(200,160,90,0.08);
}
.ob-add::before { content: '✚ '; color: #c9a35a; }

.ob-tabs {
  display: flex; border-top: 1px solid rgba(200,160,90,0.18);
  background: linear-gradient(180deg, transparent, rgba(30,20,8,0.7));
  position: relative; z-index: 3;
}
.ob-tab {
  flex: 1; text-align: center; padding: 14px 4px 18px;
  font-family: 'Cinzel', serif; font-size: 9px; letter-spacing: 0.28em; color: #4a3a18; font-weight: 600;
}
.ob-tab--active { color: #f0d99c; position: relative; }
.ob-tab--active::before {
  content: ''; position: absolute; top: -1px; left: 50%; transform: translateX(-50%);
  width: 36px; height: 2px;
  background: linear-gradient(90deg, transparent, #c9a35a, transparent);
  box-shadow: 0 0 12px #c9a35a;
  animation: ob-tabPulse 3.2s ease-in-out infinite;
}
@keyframes ob-tabPulse {
  0%, 100% { box-shadow: 0 0 8px  #c9a35a; opacity: 0.85; }
  50%      { box-shadow: 0 0 18px #f0d99c, 0 0 2px #fff5d0; opacity: 1; }
}
`;

export default ObsidianTheme;
export { ObsidianEmbers, OBSIDIAN_CSS };
