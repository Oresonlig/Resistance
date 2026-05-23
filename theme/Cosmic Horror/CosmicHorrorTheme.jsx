// CosmicHorrorTheme.jsx — self-contained Cosmic Horror theme for "The Chain" training app.
// Void as biological alien organism: organic vein branches across the background
// with pulses traveling along them, an eye-sigil in the header, asymmetric
// organic blob shapes throughout. No drifting particles, no breathing glows.
//
// What it ships:
//   - <CosmicHorrorTheme /> component: the full training session screen
//   - <VeinBackground /> sub-component: SVG vein system with traveling pulses
//   - <EyeSigil /> and <MiniGlyph />: organic glyph SVG components
//   - All styles scoped to .ch-* class names — no global CSS, no Tailwind
//
// Integration:
//   1. Drop this file into your app (e.g. src/themes/CosmicHorrorTheme.jsx)
//   2. Import and render <CosmicHorrorTheme /> as a full-bleed view
//   3. Replace the hard-coded session data — search for "Dead Hang",
//      "BACK HEAVY + BICEPS", etc.
//
// Fonts required (Google Fonts):
//   Cormorant Garamond (300-700, italic 300-500)
//   Cormorant SC      (400-700)
//   IBM Plex Mono     (300-500)
//
// Browser support: requires SVG with pathLength attribute (modern browsers).
// The veins use `mix-blend-mode: screen` so `.ch-root` must have
// `isolation: isolate` (it does).
//
// Performance: pure SVG + CSS animations. No canvas. No JS-driven motion.

import React from 'react';

// ------- vein background -------
// Procedurally generates a jagged branching network — short line segments
// that fork recursively into thinner capillaries. Not smooth curves; fractal,
// like real veins / lightning / tree roots.
function generateVein(startX, startY, baseAngle, seed) {
  let s = seed;
  const rand = () => { s = (s * 9301 + 49297) % 233280; return s / 233280; };

  const paths = [];

  function walk(x, y, ang, segs, depth, branchProb) {
    if (segs <= 0 || depth < 0) return;
    const points = [`M ${x.toFixed(1)} ${y.toFixed(1)}`];
    let cx = x, cy = y, ca = ang;

    for (let i = 0; i < segs; i++) {
      // longer steps for trunks, shorter for capillaries
      const stepLen = (depth > 1 ? 11 : 6) + rand() * 7;
      // angular jitter — bigger for thinner branches (more chaotic)
      ca += (rand() - 0.5) * (0.55 + (3 - depth) * 0.2);
      cx += Math.cos(ca) * stepLen;
      cy += Math.sin(ca) * stepLen;
      points.push(`L ${cx.toFixed(1)} ${cy.toFixed(1)}`);

      // branch off mid-stroke
      if (rand() < branchProb && i > 1 && i < segs - 1 && depth > 0) {
        const side = rand() < 0.5 ? -1 : 1;
        const branchAng = ca + side * (0.5 + rand() * 1.0);
        const branchSegs = Math.max(2, Math.floor(segs * (0.3 + rand() * 0.35)));
        walk(cx, cy, branchAng, branchSegs, depth - 1, branchProb * 0.7);
      }
    }

    paths.push({ d: points.join(' '), depth });
  }

  walk(startX, startY, baseAngle, 18, 3, 0.45);
  return paths;
}

function VeinBackground() {
  // Two main systems (TR + BL) + one secondary cluster each for density.
  // Memoized so paths are stable across re-renders (deterministic via seeded RNG).
  const trVeins   = React.useMemo(() => generateVein(385, -8,  2.35, 731),  []);
  const blVeins   = React.useMemo(() => generateVein(-5, 768, -0.78, 1289), []);
  const trCluster = React.useMemo(() => generateVein(340, 90,  2.5,  4421), []);
  const blCluster = React.useMemo(() => generateVein(60, 700, -0.7,  8893), []);

  const all = [...trVeins, ...blVeins, ...trCluster, ...blCluster];
  const trunkTR = trVeins.find(p => p.depth === 3);
  const trunkBL = blVeins.find(p => p.depth === 3);

  return (
    <svg className="ch-veins" viewBox="0 0 380 760" preserveAspectRatio="xMidYMid slice">
      <g fill="none" strokeLinecap="round" strokeLinejoin="round">
        {all.map((p, i) => {
          // taper thickness by depth: thick trunks → thin capillaries
          const sw = 0.35 + p.depth * 0.4;
          const op = 0.3  + p.depth * 0.15;
          return (
            <path key={i} d={p.d} stroke="#3a6a60" strokeWidth={sw} opacity={op} />
          );
        })}
      </g>

      {/* Traveling pulses along the two main trunks */}
      <g fill="none" stroke="#aee8d8" strokeLinecap="round" strokeLinejoin="round"
         style={{ filter: 'drop-shadow(0 0 5px #7fc8b4)' }}>
        {trunkTR && (
          <path d={trunkTR.d} strokeWidth="1.8" pathLength="1"
                strokeDasharray="0.04 1" className="ch-pulse"
                style={{ animationDuration: '2.6s' }} />
        )}
        {trunkBL && (
          <path d={trunkBL.d} strokeWidth="1.8" pathLength="1"
                strokeDasharray="0.04 1" className="ch-pulse"
                style={{ animationDuration: '2.8s', animationDelay: '-1.0s' }} />
        )}
      </g>
    </svg>
  );
}

// ------- eye-sigil (header) -------
function EyeSigil({ size = 26 }) {
  return (
    <svg viewBox="0 0 32 20" width={size} height={size * 20 / 32} fill="none">
      {/* Outer almond shell (asymmetric top/bottom curve) */}
      <path d="M1.5 10 Q10 1, 16 1.2 Q22 1, 30.5 10 Q22 19, 16 18.8 Q10 19, 1.5 10 Z"
            fill="rgba(8, 28, 26, 0.75)" stroke="#7fc8b4" strokeWidth="0.8" />
      {/* Iris ring */}
      <circle cx="16" cy="10" r="5.5" fill="none" stroke="#7fc8b4" strokeWidth="0.5" strokeOpacity="0.7" />
      {/* Vertical slit pupil that dilates */}
      <ellipse cx="16" cy="10" rx="1.2" ry="5"
               fill="#aee8d8" style={{ animation: 'ch-pupil 6.2s ease-in-out infinite' }} />
      {/* Bright center */}
      <circle cx="16" cy="10" r="0.8" fill="#e8f7f0" />
      {/* Horn on top */}
      <path d="M16 1.2 L17 -1 L15 -1 Z" fill="#7fc8b4" />
    </svg>
  );
}

function MiniGlyph() {
  return (
    <svg viewBox="0 0 16 16" width="14" height="14" fill="none">
      <ellipse cx="8" cy="8" rx="7" ry="4.5" stroke="#7fc8b4" strokeWidth="0.6" />
      <ellipse cx="8" cy="8" rx="1" ry="3.5" fill="#7fc8b4" />
    </svg>
  );
}

// ------- the screen -------
function CosmicHorrorTheme() {
  return (
    <div className="ch-root">
      <CosmicHorrorThemeStyles />
      <VeinBackground />

      {/* Top bar */}
      <div className="ch-topbar">
        <div className="ch-brand">
          <EyeSigil size={26} />
          <div className="ch-brand-name">THE CHAIN</div>
        </div>
        <div className="ch-meta">
          <div>TRAINING&nbsp;AS</div>
          <div className="ch-meta-v">LOG&nbsp;OUT</div>
          <div style={{ marginTop: 4 }}><span className="ch-sync-dot" />V3.30.14 · SYNC</div>
        </div>
      </div>

      <div className="ch-scroll">
        {/* Title */}
        <div className="ch-title">
          <div className="ch-h1">The Chain</div>
          <div className="ch-edit">⇄ EDIT</div>
        </div>
        <div className="ch-meta-row">1/4 sessions done · Round 1</div>
        <div className="ch-rule">
          <div className="ch-rule-line" />
          <div className="ch-rule-center"><MiniGlyph /></div>
          <div className="ch-rule-line ch-rule-line--rev" />
        </div>

        {/* Section navigator */}
        <div className="ch-nav">
          <div className="ch-sig">A</div>
          <div className="ch-sig ch-sig--active">
            <span className="ch-sig-l">B</span>
            <span className="ch-sig-t">BACK HEAVY + BIC</span>
          </div>
          <div className="ch-sig">V1</div>
          <div className="ch-sig">C</div>
        </div>

        <div className="ch-section-h"><span className="ch-section-h-l">B</span>BACK HEAVY + BICEPS</div>

        {/* Active exercise card */}
        <div className="ch-card">
          <div className="ch-card-head">
            <div className="ch-card-info">
              <div className="ch-ex-name">
                Dead Hang
                <span className="ch-tag ch-tag--amber">BW+</span>
                <span className="ch-tag ch-tag--blue">TIMED</span>
              </div>
              <div className="ch-ex-desc">Supinated or neutral · 1 set failure</div>
              <div className="ch-ex-note">+ note</div>
            </div>
            <div className="ch-btns">
              <div className="ch-btn">SKIP</div>
              <div className="ch-btn">⇄ EDIT</div>
            </div>
          </div>
        </div>

        {/* Work set */}
        <div className="ch-worklabel"><span className="ch-worklabel-s">WORK</span>S3</div>
        <div className="ch-workrow">
          <div className="ch-input">0</div>
          <div className="ch-input ch-input--dim">—</div>
          <div className="ch-input">0</div>
          <div className="ch-log">LOG</div>
        </div>
        <div className="ch-sublabels">
          <div>+KG (BW:?)</div><div>SEC</div><div>+F</div><div />
        </div>

        <div className="ch-action">+ WORK SET</div>
        <div className="ch-action ch-action--warm">+ WARM-UP</div>
        <div className="ch-action ch-action--done">✓ DONE</div>

        {/* Collapsed exercises */}
        <div className="ch-row">
          <span className="ch-row-chev">▾</span>
          <span className="ch-row-name">Deadlift</span>
          <span className="ch-tag ch-tag--amber">RAMP</span>
        </div>
        <div className="ch-row">
          <span className="ch-row-chev">▾</span>
          <span className="ch-row-name">Unilateral Cable Row</span>
          <span className="ch-tag ch-tag--green">UNILATERAL</span>
        </div>
        <div className="ch-add">+ ADD EXERCISE</div>
      </div>

      {/* Tab bar */}
      <div className="ch-tabs">
        <div className="ch-tab ch-tab--active">THE CHAIN</div>
        <div className="ch-tab">PROGRESS</div>
        <div className="ch-tab">WEIGHT</div>
        <div className="ch-tab">SETTINGS</div>
      </div>
    </div>
  );
}

// ------- styles -------
function CosmicHorrorThemeStyles() {
  return <style>{COSMIC_HORROR_CSS}</style>;
}

const COSMIC_HORROR_CSS = `
.ch-root {
  position: absolute; inset: 0;
  background:
    radial-gradient(ellipse 70% 30% at 50% 0%,   rgba(60, 130, 120, 0.16), transparent 70%),
    radial-gradient(ellipse 90% 50% at 50% 110%, rgba(40, 80, 90, 0.20),   transparent 60%),
    #03080a;
  color: #c8d4ce;
  font-family: 'Cormorant Garamond', serif;
  font-size: 14px;
  overflow: hidden;
  display: flex; flex-direction: column;
  isolation: isolate;
}
.ch-root, .ch-root * { box-sizing: border-box; }

.ch-veins {
  position: absolute; inset: 0; pointer-events: none; z-index: 0;
  mix-blend-mode: screen;
  width: 100%; height: 100%;
}
.ch-pulse {
  animation-name: ch-pulseFlow;
  animation-timing-function: linear;
  animation-iteration-count: infinite;
}
@keyframes ch-pulseFlow { from { stroke-dashoffset: 0; } to { stroke-dashoffset: -1; } }

.ch-root::before {
  content: ''; position: absolute; inset: 0; pointer-events: none; z-index: 1;
  background-image:
    radial-gradient(circle at 30% 40%, rgba(120, 200, 180, 0.04) 0 1px, transparent 1px),
    radial-gradient(circle at 70% 60%, rgba(80, 160, 150, 0.05)  0 1px, transparent 1px),
    radial-gradient(circle at 20% 80%, rgba(100, 180, 170, 0.03) 0 1px, transparent 1px);
  background-size: 23px 19px, 31px 27px, 17px 13px;
  mix-blend-mode: screen;
}
.ch-root::after {
  content: ''; position: absolute; inset: 0; pointer-events: none; z-index: 1;
  background: radial-gradient(ellipse at center, transparent 50%, rgba(0,2,4,0.65) 100%);
}

@keyframes ch-syncBlink {
  0%, 100% { opacity: 0.45; box-shadow: 0 0 4px  #7fc8b4; }
  50%      { opacity: 1;    box-shadow: 0 0 12px #aee8d8; }
}
@keyframes ch-pupil {
  0%, 100% { transform: scaleY(1);   transform-origin: 16px 10px; }
  50%      { transform: scaleY(0.7); transform-origin: 16px 10px; }
}
@keyframes ch-tabPulse {
  0%, 100% { opacity: 0.7; }
  50%      { opacity: 1; }
}
@keyframes ch-waveSlide { from { background-position: 0 50%; } to { background-position: 200% 50%; } }

.ch-topbar {
  display: flex; justify-content: space-between; align-items: center;
  padding: 16px 18px 12px;
  position: relative; z-index: 3;
  border-bottom: 1px solid rgba(127,200,180,0.10);
}
.ch-brand { display: flex; align-items: center; gap: 12px; }
.ch-brand-name {
  font-family: 'Cormorant SC', serif; font-size: 13px; letter-spacing: 0.38em;
  color: #aedcd0; font-weight: 500;
}
.ch-meta {
  text-align: right; font-family: 'IBM Plex Mono', monospace; font-size: 9px;
  letter-spacing: 0.16em; color: #4f6a64; line-height: 1.65;
  text-transform: uppercase;
}
.ch-meta-v { color: #a8424c; }
.ch-sync-dot {
  display: inline-block; width: 6px; height: 6px; border-radius: 50%;
  background: #7fc8b4; box-shadow: 0 0 6px #7fc8b4;
  animation: ch-syncBlink 3.2s ease-in-out infinite;
  margin-right: 4px; vertical-align: middle;
}

.ch-scroll { flex: 1; overflow: auto; position: relative; z-index: 2; }

.ch-title {
  padding: 24px 22px 4px;
  display: flex; justify-content: space-between; align-items: flex-start;
}
.ch-h1 {
  font-family: 'Cormorant Garamond', serif;
  font-size: 42px; font-weight: 500; font-style: italic; line-height: 0.95;
  letter-spacing: -0.01em;
  white-space: nowrap;
  color: #e8f7f0;
  text-shadow: 0 0 18px rgba(127,200,180,0.22);
}
.ch-edit {
  font-family: 'IBM Plex Mono', monospace; font-size: 10px; letter-spacing: 0.18em;
  color: #aedcd0; padding: 7px 12px;
  border: 1px solid rgba(127,200,180,0.25);
  background: linear-gradient(180deg, rgba(20,50,46,0.45), rgba(8,18,22,0.45));
  border-radius: 2px 14px 2px 14px;
  text-transform: uppercase;
}
.ch-meta-row {
  padding: 4px 22px 14px; font-family: 'IBM Plex Mono', monospace;
  color: #6a8480; font-size: 10px; letter-spacing: 0.14em;
  text-transform: uppercase;
}

.ch-rule { margin: 0 22px 18px; height: 14px; display: flex; align-items: center; gap: 10px; }
.ch-rule-line {
  flex: 1; height: 1px;
  background: linear-gradient(90deg,
      transparent 0%, rgba(127,200,180,0.0) 8%,
      rgba(127,200,180,0.45) 38%, rgba(180,230,220,0.85) 50%,
      rgba(127,200,180,0.45) 62%, rgba(127,200,180,0.0) 92%,
      transparent 100%);
  background-size: 200% 100%;
  animation: ch-waveSlide 14s linear infinite;
}
.ch-rule-line--rev { animation-direction: reverse; }
.ch-rule-center {
  display: flex; align-items: center; justify-content: center;
  opacity: 0.85;
}

.ch-nav { display: flex; padding: 0 18px 4px; gap: 8px; align-items: center; }
.ch-sig {
  width: 38px; height: 38px; flex-shrink: 0;
  border: 1px solid rgba(127,200,180,0.22);
  background: rgba(8,18,22,0.55);
  display: flex; align-items: center; justify-content: center;
  color: #4f6a64; font-family: 'Cormorant SC', serif; font-size: 13px; font-weight: 500;
  position: relative;
  border-radius: 50% 38% 60% 42% / 42% 60% 38% 58%;
}
.ch-sig:nth-child(3) { border-radius: 60% 40% 38% 62% / 38% 58% 42% 60%; }
.ch-sig:nth-child(4) { border-radius: 38% 62% 50% 50% / 60% 42% 58% 40%; }
.ch-sig--active {
  flex: 1; padding: 0 18px;
  color: #e0f2eb;
  gap: 12px; justify-content: flex-start;
  min-width: 0; height: 44px;
  border-radius: 20px 28px 18px 26px / 22px 20px 24px 18px;
  background: linear-gradient(180deg, rgba(60,120,110,0.55) 0%, rgba(20,50,46,0.85) 50%, rgba(8,22,26,0.85) 100%);
  border: 1px solid #7fc8b4;
  box-shadow: 0 0 0 2px rgba(127,200,180,0.08), inset 0 0 16px rgba(127,200,180,0.18);
}
.ch-sig-l {
  font-family: 'Cormorant SC', serif; font-size: 18px; font-weight: 600;
  color: #e0f2eb; letter-spacing: 0.02em;
}
.ch-sig-t {
  font-family: 'Cormorant SC', serif; font-size: 10px; letter-spacing: 0.2em;
  color: #aedcd0; font-weight: 500;
  white-space: nowrap; overflow: hidden; text-overflow: ellipsis; min-width: 0;
}

.ch-section-h {
  padding: 22px 22px 4px;
  font-family: 'IBM Plex Mono', monospace; font-size: 11px; letter-spacing: 0.22em;
  color: #aedcd0; font-weight: 500;
  display: flex; align-items: center; gap: 8px;
  white-space: nowrap; text-transform: uppercase;
}
.ch-section-h-l { color: #7fc8b4; margin-right: 4px; }

.ch-card {
  margin: 8px 18px;
  padding: 18px 16px 16px;
  background:
    radial-gradient(ellipse 80% 60% at 70% 0%, rgba(60,120,110,0.15), transparent 70%),
    linear-gradient(180deg, rgba(10,30,28,0.7), rgba(4,14,16,0.7));
  border: 1px solid rgba(127,200,180,0.22);
  border-radius: 24px 6px 28px 8px / 16px 22px 12px 24px;
  position: relative;
}
.ch-card-head {
  display: flex; justify-content: space-between; align-items: flex-start; gap: 10px;
}
.ch-card-info { min-width: 0; flex: 1; }

.ch-ex-name {
  font-family: 'Cormorant Garamond', serif; font-size: 24px; font-weight: 600;
  color: #e8f7f0; letter-spacing: -0.005em; line-height: 1.1;
}
.ch-ex-desc {
  color: #7a948c; font-size: 12px; margin-top: 4px;
  font-family: 'IBM Plex Mono', monospace;
}
.ch-ex-note {
  color: #aedcd0; font-size: 11px; margin-top: 6px; letter-spacing: 0.1em;
  font-family: 'IBM Plex Mono', monospace;
  text-decoration: underline; text-decoration-style: dotted;
  text-underline-offset: 3px;
}

.ch-tag {
  display: inline-block; padding: 2px 8px; font-size: 9px; letter-spacing: 0.18em;
  font-family: 'IBM Plex Mono', monospace; color: #aedcd0;
  border: 1px solid rgba(127,200,180,0.3);
  background: rgba(20,50,46,0.4);
  margin-left: 4px; vertical-align: middle; font-weight: 500;
  text-transform: uppercase;
  border-radius: 6px 2px 6px 2px;
}
.ch-tag--blue  { color: #88c4e0; border-color: rgba(120,180,220,0.3); }
.ch-tag--amber { color: #d8b878; border-color: rgba(180,140,70,0.35); border-radius: 2px 6px 2px 6px; }
.ch-tag--green { color: #bedab0; border-color: rgba(150,200,130,0.3); border-radius: 6px 2px 6px 2px; }

.ch-btns { display: flex; gap: 6px; flex-shrink: 0; }
.ch-btn {
  font-family: 'IBM Plex Mono', monospace; font-size: 9px; letter-spacing: 0.16em;
  padding: 7px 11px; border: 1px solid rgba(127,200,180,0.22);
  color: #aedcd0;
  background: linear-gradient(180deg, rgba(20,50,46,0.5), rgba(8,18,22,0.5));
  text-transform: uppercase; font-weight: 400;
  border-radius: 4px 10px 4px 10px;
}

.ch-worklabel {
  padding: 14px 22px 6px;
  font-family: 'IBM Plex Mono', monospace; font-size: 9px; letter-spacing: 0.2em;
  color: #4f6a64; text-transform: uppercase;
}
.ch-worklabel-s { color: #a8424c; margin-right: 8px; }
.ch-workrow { display: flex; padding: 0 18px 4px; gap: 4px; }
.ch-input {
  flex: 1; height: 42px; border: 1px solid rgba(127,200,180,0.14);
  background: rgba(4,14,16,0.65);
  color: #e6f0ea; font-family: 'IBM Plex Mono', monospace; font-size: 14px;
  font-weight: 400; text-align: center;
  display: flex; align-items: center; justify-content: center;
  border-radius: 8px 2px 8px 2px;
}
.ch-input:nth-child(2) { border-radius: 2px 8px 2px 8px; }
.ch-input:nth-child(3) { border-radius: 8px 2px 8px 2px; }
.ch-input--dim { color: #2a3a36; }
.ch-log {
  height: 42px; padding: 0 18px;
  background: linear-gradient(180deg, #7fc8b4 0%, #3a7068 100%);
  color: #02151a; font-family: 'IBM Plex Mono', monospace; font-size: 12px; letter-spacing: 0.18em;
  font-weight: 500;
  box-shadow: inset 0 1px 0 rgba(220,245,240,0.45), inset 0 -1px 0 rgba(0,20,18,0.35);
  display: flex; align-items: center; justify-content: center;
  border-radius: 16px 4px 18px 4px / 14px 6px 16px 4px;
  text-transform: uppercase;
}
.ch-sublabels {
  display: flex; padding: 4px 18px 0; gap: 4px; font-size: 8px;
  color: #2a4a44; letter-spacing: 0.18em; font-family: 'IBM Plex Mono', monospace;
  text-transform: uppercase;
}
.ch-sublabels > div { flex: 1; text-align: center; }
.ch-sublabels > div:last-child { flex: 0 0 64px; }

.ch-action {
  margin: 8px 18px 0; height: 38px;
  display: flex; align-items: center; justify-content: center;
  border: 1px dashed rgba(127,200,180,0.18);
  color: #6a8480;
  font-family: 'IBM Plex Mono', monospace; font-size: 10px; letter-spacing: 0.2em; font-weight: 400;
  background: linear-gradient(180deg, rgba(12,28,26,0.55), rgba(4,14,16,0.55));
  text-transform: uppercase;
  border-radius: 8px 18px 8px 18px;
}
.ch-action--warm { color: #c46878; border-color: rgba(168,66,76,0.3); border-radius: 18px 8px 18px 8px; }
.ch-action--done {
  color: #e0f2eb;
  background: linear-gradient(180deg, rgba(30,70,64,0.6), rgba(8,22,26,0.6));
  border: 1px solid #7fc8b4;
  font-size: 12px; letter-spacing: 0.24em; font-weight: 500;
  display: flex; align-items: center; justify-content: center; gap: 10px;
  border-radius: 20px 6px 20px 6px;
  box-shadow: inset 0 0 14px rgba(127,200,180,0.18);
}

.ch-row {
  display: flex; align-items: center; gap: 12px; padding: 16px 22px;
  border-top: 1px solid rgba(127,200,180,0.06);
}
.ch-row-chev { color: #2a4a44; font-size: 9px; }
.ch-row-name {
  font-family: 'Cormorant Garamond', serif; font-style: italic; font-size: 20px;
  color: #c8d4ce;
}
.ch-row:first-of-type { margin-top: 18px; }

.ch-add {
  padding: 18px; text-align: center;
  font-family: 'IBM Plex Mono', monospace; font-size: 10px; letter-spacing: 0.22em;
  color: #4f6a64; font-weight: 400;
  border-top: 1px solid rgba(127,200,180,0.06);
  text-transform: uppercase;
}

.ch-tabs {
  display: flex; border-top: 1px solid rgba(127,200,180,0.18);
  background: linear-gradient(180deg, transparent, rgba(8,20,22,0.75));
  position: relative; z-index: 3;
}
.ch-tab {
  flex: 1; text-align: center; padding: 14px 4px 18px;
  font-family: 'IBM Plex Mono', monospace; font-size: 10px; letter-spacing: 0.18em;
  color: #4f6a64; font-weight: 400;
  text-transform: uppercase;
}
.ch-tab--active { color: #e6f0ea; position: relative; }
.ch-tab--active::before {
  content: ''; position: absolute; top: -1px; left: 50%; transform: translateX(-50%);
  width: 0; height: 0;
  border-left: 7px solid transparent;
  border-right: 7px solid transparent;
  border-top: 9px solid #7fc8b4;
  filter: drop-shadow(0 0 6px rgba(127,200,180,0.55));
  animation: ch-tabPulse 4.2s ease-in-out infinite;
}
`;

export default CosmicHorrorTheme;
export { VeinBackground, EyeSigil, MiniGlyph, COSMIC_HORROR_CSS };
