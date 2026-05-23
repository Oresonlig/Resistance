// NightCityTheme.jsx — self-contained Night City theme for "The Chain"
// training app.
//
// STATUS: Full cyberpunk treatment. Asymmetric clip-path geometry, RGB
// chromatic aberration, CRT scanlines, triple-tone neon palette (acid yellow
// + magenta + cyan), pulsing glow, glitch animations.
//
// What it ships:
//   - <NightCityTheme /> component: the training session screen with theme
//   - <NightCityCRT /> sub-component: full-screen CRT flicker overlay
//     at z-index 9999 (sits above everything for the broken-monitor feel)
//   - All styles scoped to .nc-* class names — no global CSS, no Tailwind.
//
// Integration:
//   1. Drop this file into your app (e.g. src/themes/NightCityTheme.jsx)
//   2. Render <NightCityTheme /> as a full-bleed view
//   3. Replace the hard-coded session data with your real training model
//
// Browser support: clip-path polygon and backdrop-filter blur are required.
// All modern browsers OK; old browsers degrade to rectangular elements.

import React from 'react';

function NightCityCRT() {
  return <div className="nc-crt" />;
}

function NightCityTheme() {
  return (
    <div className="nc-root">
      <NightCityThemeStyles />
      <NightCityCRT />

      <div className="nc-topbar">
        <div className="nc-logo">THE <span>CHAIN</span></div>
        <div className="nc-meta">
          <div>TRAINING AS <strong>NIKLAS</strong></div>
          <div className="nc-meta-sync">
            <span className="nc-sync-dot" /> V3.33.3 // SYNC
          </div>
        </div>
      </div>

      <div className="nc-scroll">
        <div className="nc-title">THE CHAIN</div>
        <div className="nc-sub">TRIAL I OF IV // ROUND I</div>

        {/* Pass cards */}
        <div className="nc-card nc-card--next">
          <div className="nc-card-letter">B</div>
          <div className="nc-card-body">
            <div className="nc-card-name">BACK // BICEPS</div>
            <div className="nc-card-prev">// DEADLIFT, PULL-UPS, DEAD HANG</div>
          </div>
        </div>
        <div className="nc-card nc-card--ip">
          <div className="nc-card-letter">A</div>
          <div className="nc-card-body">
            <div className="nc-card-name">CHEST // TRICEPS</div>
            <div className="nc-card-prev">// IN PROGRESS · 3 / 5</div>
          </div>
        </div>
        <div className="nc-card nc-card--done">
          <div className="nc-card-letter">V</div>
          <div className="nc-card-body">
            <div className="nc-card-name">REST</div>
            <div className="nc-card-prev">// DONE</div>
          </div>
        </div>

        {/* Active exercise card */}
        <div className="nc-ex">
          <div className="nc-ex-name">
            Dead Hang
            <span className="nc-tag nc-tag--bw">BW+</span>
            <span className="nc-tag nc-tag--ramp">TIMED</span>
          </div>
          <div className="nc-ex-detail">// SUPINATED OR NEUTRAL · ONE SET TO FAILURE</div>
          <div className="nc-ex-prev">
            <span className="nc-last">LAST/3D: 42s</span>
            <span className="nc-pr">PR/48s</span>
          </div>

          <div className="nc-set-label">// WORK SET III</div>
          <div className="nc-set-row">
            <input className="nc-set-input" defaultValue="0" />
            <input className="nc-set-input" defaultValue="0" />
            <input className="nc-set-input" defaultValue="0" />
            <div className="nc-btn-primary">LOG</div>
          </div>

          <div className="nc-ex-btns">
            <div className="nc-btn-secondary nc-btn-skip">SKIP</div>
            <div className="nc-btn-secondary nc-btn-edit">EDIT</div>
            <div className="nc-btn-done">DONE</div>
          </div>
        </div>
      </div>

      <div className="nc-tabs">
        <div className="nc-tab nc-tab--active">CHAIN</div>
        <div className="nc-tab">PROGRESS</div>
        <div className="nc-tab">WEIGHT</div>
        <div className="nc-tab">SETTINGS</div>
      </div>
    </div>
  );
}

// Fonts assumed loaded by host app:
//   <link href="https://fonts.googleapis.com/css2?family=Orbitron:wght@400;500;600;700;900&family=Space+Grotesk:wght@400;500;700&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">
function NightCityThemeStyles() {
  return <style>{NIGHTCITY_CSS}</style>;
}

const NIGHTCITY_CSS = `
.nc-root {
  position: absolute; inset: 0;
  background-color: #08010f;
  background-image:
    repeating-linear-gradient(0deg,  rgba(255,230,0,0.025) 0px, rgba(255,230,0,0.025) 1px, transparent 1px, transparent 4px),
    repeating-linear-gradient(90deg, rgba(255,45,120,0.015) 0px, transparent 1px, transparent 3px),
    radial-gradient(ellipse 80% 50% at 50% 0%,   rgba(255,45,120,0.12) 0%, transparent 70%),
    radial-gradient(ellipse 60% 40% at 100% 100%, rgba(0,255,240,0.08) 0%, transparent 70%),
    linear-gradient(180deg, #0a0218 0%, #08010f 100%);
  color: #f5f0ff;
  font-family: 'Space Grotesk', sans-serif;
  font-size: 13px;
  overflow: hidden;
  display: flex; flex-direction: column;
}
.nc-root, .nc-root * { box-sizing: border-box; }

/* ── CRT flicker overlay — broken monitor feel ── */
.nc-crt {
  position: absolute; inset: 0;
  pointer-events: none; z-index: 9999;
  background: linear-gradient(180deg,
    rgba(255,230,0,0.02) 0%,
    transparent 0.5%,
    transparent 99.5%,
    rgba(255,45,120,0.02) 100%);
  animation: nc-crt-flicker 4s steps(2) infinite;
}
@keyframes nc-crt-flicker {
  0%, 100% { opacity: 1; }
  3%       { opacity: 0.85; }
  6%       { opacity: 1; }
  91%      { opacity: 0.95; }
  93%      { opacity: 0.7; }
  95%      { opacity: 1; }
}

/* ── Top bar — angled clip-path, glow strip ── */
.nc-topbar {
  position: relative; z-index: 3;
  display: flex; justify-content: space-between; align-items: center;
  padding: 12px 16px 16px;
  background: linear-gradient(180deg, rgba(8,1,15,0.95) 0%, rgba(8,1,15,0.85) 100%);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  clip-path: polygon(0 0, 100% 0, 100% calc(100% - 8px), calc(100% - 60px) 100%, 60px 100%, 0 calc(100% - 8px));
  box-shadow: 0 0 30px rgba(255,230,0,0.15), 0 4px 0 rgba(255,45,120,0.4);
}
.nc-topbar::after {
  content: ''; position: absolute; left: 0; right: 0; bottom: 8px; height: 1px;
  background: linear-gradient(90deg, transparent 0%, #ffe600 20%, #ff2d78 50%, #00fff0 80%, transparent 100%);
  box-shadow: 0 0 10px #ffe600;
}
.nc-logo {
  font-family: 'Orbitron', sans-serif; font-weight: 900;
  font-size: 1.5rem; letter-spacing: 0.18em; color: #f5f0ff;
  text-shadow:
    -2px 0 0 rgba(255,45,120,0.7),
    2px 0 0 rgba(0,255,240,0.7),
    0 0 12px rgba(255,230,0,0.4);
  animation: nc-chromatic-shift 6s ease-in-out infinite;
}
@keyframes nc-chromatic-shift {
  0%, 100% { text-shadow: -2px 0 0 rgba(255,45,120,0.7),  2px 0 0 rgba(0,255,240,0.7), 0 0 12px rgba(255,230,0,0.4); }
  50%      { text-shadow:  2px 0 0 rgba(255,45,120,0.7), -2px 0 0 rgba(0,255,240,0.7), 0 0 16px rgba(255,230,0,0.6); }
}
.nc-logo span {
  color: #ffe600;
  text-shadow: 0 0 20px rgba(255,230,0,0.8), 0 0 40px rgba(255,230,0,0.4);
}
.nc-meta {
  text-align: right; font-family: 'JetBrains Mono', monospace;
  font-size: 9px; color: #7a55a0; letter-spacing: 0.08em;
  line-height: 1.6;
}
.nc-meta strong { color: #00fff0; text-shadow: 0 0 8px rgba(0,255,240,0.6); }
.nc-meta-sync { font-size: 8px; }
.nc-sync-dot {
  display: inline-block; width: 6px; height: 6px; border-radius: 50%;
  background: #00fff0;
  box-shadow: 0 0 8px #00fff0, 0 0 16px #00fff0;
  animation: nc-sync-pulse 2s ease-in-out infinite;
  margin-right: 4px; vertical-align: middle;
}
@keyframes nc-sync-pulse {
  0%, 100% { transform: scale(1);   box-shadow: 0 0 8px #00fff0, 0 0 16px #00fff0; }
  50%      { transform: scale(1.3); box-shadow: 0 0 14px #00fff0, 0 0 28px #00fff0, 0 0 42px rgba(0,255,240,0.4); }
}

.nc-scroll { flex: 1; overflow: auto; position: relative; z-index: 2; padding: 16px; }

/* ── Title ── */
.nc-title {
  font-family: 'Orbitron', sans-serif; font-weight: 900;
  color: #f5f0ff; font-size: 22px; letter-spacing: 0.15em;
  text-transform: uppercase;
  text-shadow:
    -1px 0 0 rgba(255,45,120,0.5),
    1px 0 0 rgba(0,255,240,0.5),
    0 0 12px rgba(255,230,0,0.3);
}
.nc-sub {
  font-family: 'Orbitron', sans-serif; font-weight: 600;
  color: #7a55a0; font-size: 11px; letter-spacing: 0.2em;
  text-transform: uppercase; margin: 4px 0 16px;
}

/* ── Pass cards — asymmetric clip-path ── */
.nc-card {
  display: flex; align-items: center; gap: 14px;
  padding: 16px 18px; margin-bottom: 14px;
  background: linear-gradient(135deg, rgba(20,5,40,0.6) 0%, rgba(8,1,15,0.8) 100%);
  position: relative;
  clip-path: polygon(0 0, calc(100% - 24px) 0, 100% 24px, 100% calc(100% - 8px), calc(100% - 60px) 100%, 8px 100%, 0 calc(100% - 8px), 0 8px);
  box-shadow: 0 1px 0 rgba(255,45,120,0.1);
}
.nc-card-letter {
  font-family: 'Orbitron', sans-serif; font-weight: 900;
  color: #ffe600; font-size: 2.4rem; line-height: 1;
  letter-spacing: -0.02em;
  text-shadow:
    0 0 4px rgba(255,230,0,1),
    0 0 12px rgba(255,230,0,0.6),
    0 0 24px rgba(255,45,120,0.4);
  width: 48px; text-align: center; flex-shrink: 0;
}
.nc-card-body { flex: 1; }
.nc-card-name {
  font-family: 'Orbitron', sans-serif; font-weight: 700;
  color: #f5f0ff; font-size: 13px; letter-spacing: 0.12em;
  text-transform: uppercase;
}
.nc-card-prev {
  font-family: 'JetBrains Mono', monospace; font-size: 10px;
  color: #7a55a0; letter-spacing: 0.04em; margin-top: 2px;
}

.nc-card--next {
  background: linear-gradient(135deg, rgba(40,8,60,0.7) 0%, rgba(15,3,30,0.85) 100%);
  animation: nc-pulse 2.4s ease-in-out infinite;
}
@keyframes nc-pulse {
  0%, 100% { box-shadow:
    0 0 24px rgba(255,230,0,0.3),
    0 0 48px rgba(255,45,120,0.15); }
  50%      { box-shadow:
    0 0 36px rgba(255,45,120,0.5),
    0 0 64px rgba(0,255,240,0.2); }
}
.nc-card--next::after {
  content: 'NEXT';
  position: absolute; top: 0; right: 0;
  background: #ffe600; color: #08010f;
  font-family: 'Orbitron', sans-serif; font-weight: 900;
  letter-spacing: 0.25em; font-size: 9px;
  padding: 4px 18px 4px 14px;
  clip-path: polygon(0 0, 100% 0, calc(100% - 12px) 100%, 0 100%);
}

.nc-card--ip {
  background: linear-gradient(135deg, rgba(8,30,40,0.7) 0%, rgba(5,15,25,0.85) 100%);
  box-shadow: 0 0 20px rgba(0,255,240,0.2);
}
.nc-card--ip .nc-card-letter {
  color: #00fff0;
  text-shadow: 0 0 4px rgba(0,255,240,1), 0 0 12px rgba(0,255,240,0.6);
}

.nc-card--done { opacity: 0.4; filter: saturate(0.6); }

/* ── Exercise card ── */
.nc-ex {
  background: linear-gradient(135deg, rgba(20,5,40,0.6) 0%, rgba(8,1,15,0.8) 100%);
  border: 1px solid rgba(255,45,120,0.25);
  padding: 14px;
  margin: 14px 0 10px;
  clip-path: polygon(0 0, calc(100% - 12px) 0, 100% 12px, 100% 100%, 12px 100%, 0 calc(100% - 12px));
}
.nc-ex-name {
  font-family: 'Orbitron', sans-serif; font-weight: 700;
  color: #f5f0ff; font-size: 1.05rem; letter-spacing: 0.05em;
}
.nc-ex-detail {
  font-family: 'JetBrains Mono', monospace; color: #7a55a0;
  font-size: 10px; margin-top: 4px;
}
.nc-ex-prev {
  display: flex; gap: 12px; margin-top: 6px;
  font-family: 'JetBrains Mono', monospace; font-size: 10px;
}
.nc-last { color: #00fff0; text-shadow: 0 0 4px rgba(0,255,240,0.4); }
.nc-pr { color: #ffe600; text-shadow: 0 0 6px rgba(255,230,0,0.6); font-weight: 700; }

.nc-tag {
  display: inline-block; margin-left: 6px; padding: 3px 10px;
  font-family: 'Orbitron', sans-serif; font-weight: 700;
  font-size: 8px; letter-spacing: 0.15em;
  clip-path: polygon(6px 0, 100% 0, calc(100% - 6px) 100%, 0 100%);
  vertical-align: middle;
}
.nc-tag--ramp {
  background: linear-gradient(90deg, rgba(255,230,0,0.15), rgba(255,230,0,0.05));
  color: #ffe600; text-shadow: 0 0 4px rgba(255,230,0,0.5);
}
.nc-tag--bw {
  background: linear-gradient(90deg, rgba(0,255,240,0.15), rgba(0,255,240,0.05));
  color: #00fff0; text-shadow: 0 0 4px rgba(0,255,240,0.5);
}
.nc-tag--uni {
  background: linear-gradient(90deg, rgba(255,45,120,0.15), rgba(255,45,120,0.05));
  color: #ff2d78; text-shadow: 0 0 4px rgba(255,45,120,0.5);
}

.nc-set-label {
  font-family: 'Orbitron', sans-serif; font-weight: 700;
  color: #ffe600; font-size: 10px; letter-spacing: 0.2em;
  text-transform: uppercase; margin: 14px 0 6px;
  text-shadow: 0 0 8px rgba(255,230,0,0.5);
}
.nc-set-row { display: flex; gap: 4px; }
.nc-set-input {
  flex: 1; height: 38px; text-align: center;
  background: rgba(8,1,15,0.8); border: 1px solid rgba(255,45,120,0.3);
  color: #ffe600; font-family: 'JetBrains Mono', monospace;
  font-weight: 700; font-size: 16px;
  text-shadow: 0 0 6px rgba(255,230,0,0.5);
}
.nc-set-input:focus {
  outline: none; border-color: #ffe600;
  box-shadow:
    inset 0 0 8px rgba(255,230,0,0.15),
    0 0 12px rgba(255,230,0,0.5),
    0 0 24px rgba(255,45,120,0.2);
}

.nc-btn-primary {
  height: 38px; padding: 0 24px;
  display: flex; align-items: center; justify-content: center;
  background: linear-gradient(135deg, #ffe600 0%, #e6cf00 100%);
  color: #08010f; font-family: 'Orbitron', sans-serif; font-weight: 900;
  font-size: 13px; letter-spacing: 0.2em; text-transform: uppercase; border: none;
  clip-path: polygon(12px 0, 100% 0, calc(100% - 12px) 100%, 0 100%);
  text-shadow: 0 1px 0 rgba(255,255,255,0.3);
  box-shadow: 0 0 16px rgba(255,230,0,0.4);
}
.nc-btn-secondary {
  padding: 7px 14px; font-family: 'Orbitron', sans-serif; font-weight: 700;
  font-size: 10px; letter-spacing: 0.12em; text-transform: uppercase;
  background: linear-gradient(180deg, rgba(40,8,60,0.6) 0%, rgba(15,3,30,0.8) 100%);
  border: 1px solid #3a2050; color: #7a55a0;
}
.nc-btn-skip { border-color: #ff2d78; color: #ff2d78; text-shadow: 0 0 6px rgba(255,45,120,0.5); }
.nc-btn-edit { border-color: #3a2050; color: #7a55a0; }
.nc-btn-done {
  flex: 1; padding: 9px 12px;
  background: linear-gradient(180deg, rgba(40,8,60,0.6) 0%, rgba(15,3,30,0.8) 100%);
  border: 1px solid #ffe600; color: #ffe600;
  font-family: 'Orbitron', sans-serif; font-weight: 700;
  font-size: 11px; letter-spacing: 0.12em; text-transform: uppercase;
  text-align: center;
  text-shadow: 0 0 6px rgba(255,230,0,0.6);
  box-shadow: inset 0 0 10px rgba(255,230,0,0.1);
}
.nc-ex-btns { display: flex; gap: 6px; margin-top: 12px; align-items: stretch; }

/* ── Tabs ── */
.nc-tabs {
  display: flex; position: relative; z-index: 3;
  background: linear-gradient(0deg, rgba(8,1,15,0.98) 0%, rgba(8,1,15,0.9) 100%);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  clip-path: polygon(0 8px, 60px 0, calc(100% - 60px) 0, 100% 8px, 100% 100%, 0 100%);
  box-shadow: 0 -4px 0 rgba(255,230,0,0.4);
  padding-top: 8px;
}
.nc-tabs::before {
  content: ''; position: absolute; left: 0; right: 0; top: 8px; height: 1px;
  background: linear-gradient(90deg, transparent 0%, #00fff0 20%, #ff2d78 50%, #ffe600 80%, transparent 100%);
  box-shadow: 0 0 10px #ff2d78;
}
.nc-tab {
  flex: 1; text-align: center; padding: 14px 4px;
  font-family: 'Orbitron', sans-serif; font-weight: 700;
  color: #5a3a80; letter-spacing: 0.2em;
  font-size: 10px; text-transform: uppercase;
}
.nc-tab--active {
  color: #ffe600; border-top: 2px solid #ffe600;
  background: linear-gradient(180deg, rgba(255,230,0,0.15) 0%, transparent 70%);
  text-shadow: 0 0 10px rgba(255,230,0,0.8);
}
`;

export default NightCityTheme;
export { NightCityCRT, NIGHTCITY_CSS };
