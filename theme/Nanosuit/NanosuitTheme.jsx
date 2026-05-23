// NanosuitTheme.jsx — self-contained Nanosuit theme for "The Chain"
// training app.
//
// STATUS: Adaptive tactical armor. Hexagonal carbon-weave background,
// scanning grid overlay, deep navy + electric cyan palette, octagonal
// clip-path cards, Orbitron display + JetBrains Mono. The pass-card "morph"
// animation cycles edge color between cyan and bright cyan — the namesake
// "adaptive" feel.
//
// What it ships:
//   - <NanosuitTheme /> component: the training session screen with theme
//   - <NanosuitGrid /> sub-component: subtle horizontal scanning grid overlay
//   - All styles scoped to .ns-* class names — no global CSS, no Tailwind.
//
// Integration:
//   1. Drop this file into your app (e.g. src/themes/NanosuitTheme.jsx)
//   2. Render <NanosuitTheme /> as a full-bleed view
//   3. Replace the hard-coded session data with your real training model

import React from 'react';

function NanosuitGrid() {
  return <div className="ns-grid" />;
}

function NanosuitTheme() {
  return (
    <div className="ns-root">
      <NanosuitThemeStyles />
      <NanosuitGrid />

      <div className="ns-topbar">
        <div className="ns-logo">THE <span>CHAIN</span></div>
        <div className="ns-meta">
          <div>OPERATOR: <strong>NIKLAS</strong></div>
          <div className="ns-meta-sync">
            <span className="ns-sync-dot" /> V3.33.3 · LINK
          </div>
        </div>
      </div>

      <div className="ns-scroll">
        <div className="ns-title">THE CHAIN</div>
        <div className="ns-sub">TRIAL I · ROUND I</div>

        {/* Pass cards */}
        <div className="ns-card ns-card--next">
          <div className="ns-card-letter">B</div>
          <div className="ns-card-body">
            <div className="ns-card-name">BACK · BICEPS</div>
            <div className="ns-card-prev">QUEUED · Deadlift, Pull-ups, Dead Hang</div>
          </div>
        </div>
        <div className="ns-card ns-card--ip">
          <div className="ns-card-letter">A</div>
          <div className="ns-card-body">
            <div className="ns-card-name">CHEST · TRICEPS</div>
            <div className="ns-card-prev">ACTIVE · 3 / 5 confirmed</div>
          </div>
        </div>
        <div className="ns-card ns-card--done">
          <div className="ns-card-letter">V</div>
          <div className="ns-card-body">
            <div className="ns-card-name">REST</div>
            <div className="ns-card-prev">COMPLETE</div>
          </div>
        </div>

        {/* Active exercise card */}
        <div className="ns-ex">
          <div className="ns-ex-name">
            Dead Hang
            <span className="ns-tag ns-tag--bw">BW+</span>
            <span className="ns-tag ns-tag--ramp">TIMED</span>
          </div>
          <div className="ns-ex-detail">Supinated or neutral · one set to failure</div>
          <div className="ns-ex-prev">
            <span className="ns-last">LAST/3D: 42 s</span>
            <span className="ns-pr">PR: 48 s</span>
          </div>

          <div className="ns-set-label">SET III · WORK</div>
          <div className="ns-set-row">
            <input className="ns-set-input" defaultValue="0" />
            <input className="ns-set-input" defaultValue="0" />
            <input className="ns-set-input" defaultValue="0" />
            <div className="ns-btn-primary">LOG</div>
          </div>

          <div className="ns-ex-btns">
            <div className="ns-btn-secondary ns-btn-skip">SKIP</div>
            <div className="ns-btn-secondary ns-btn-edit">EDIT</div>
            <div className="ns-btn-done">CONFIRM</div>
          </div>
        </div>
      </div>

      <div className="ns-tabs">
        <div className="ns-tab ns-tab--active">CHAIN</div>
        <div className="ns-tab">PROGRESS</div>
        <div className="ns-tab">WEIGHT</div>
        <div className="ns-tab">SETTINGS</div>
      </div>
    </div>
  );
}

// Fonts assumed loaded by host app:
//   <link href="https://fonts.googleapis.com/css2?family=Orbitron:wght@400;500;600;700;900&family=Space+Grotesk:wght@400;500;700&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">
function NanosuitThemeStyles() {
  return <style>{NANOSUIT_CSS}</style>;
}

const NANOSUIT_CSS = `
.ns-root {
  position: absolute; inset: 0;
  background-color: #050810;
  background-image:
    url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='56' height='100' viewBox='0 0 56 100'%3E%3Cg fill='none' stroke='%2300d4ff' stroke-width='0.5' stroke-opacity='0.08'%3E%3Cpath d='M28 66L0 50L0 16L28 0L56 16L56 50L28 66L28 100'/%3E%3Cpath d='M28 0L28 34L0 50L0 84L28 100L56 84L56 50L28 34'/%3E%3C/g%3E%3C/svg%3E"),
    radial-gradient(ellipse at top, #0a1828 0%, #050810 60%);
  color: #e0faff;
  font-family: 'Space Grotesk', sans-serif;
  font-size: 13px;
  overflow: hidden;
  display: flex; flex-direction: column;
}
.ns-root, .ns-root * { box-sizing: border-box; }

/* ── Scanning grid overlay ── */
.ns-grid {
  position: absolute; inset: 0;
  pointer-events: none; z-index: 1;
  background-image: linear-gradient(0deg, rgba(0,212,255,0.015) 50%, transparent 50%);
  background-size: 100% 3px;
}

/* ── Top bar ── */
.ns-topbar {
  position: relative; z-index: 3;
  display: flex; justify-content: space-between; align-items: center;
  padding: 12px 16px;
  background: rgba(5,8,16,0.85);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  border-bottom: 1px solid #00d4ff;
  box-shadow: 0 0 24px rgba(0,212,255,0.15), inset 0 -1px 0 rgba(0,255,240,0.3);
}
.ns-logo {
  font-family: 'Orbitron', sans-serif; font-weight: 900;
  font-size: 1.4rem; letter-spacing: 0.25em; color: #e0faff;
  text-shadow: 0 0 10px rgba(0,212,255,0.5);
}
.ns-logo span {
  color: #00d4ff;
  text-shadow: 0 0 15px rgba(0,212,255,0.8);
}
.ns-meta {
  text-align: right; font-family: 'JetBrains Mono', monospace;
  font-size: 9px; color: #5a8899; letter-spacing: 0.08em;
  line-height: 1.6;
}
.ns-meta strong { color: #00d4ff; }
.ns-meta-sync { font-size: 8px; }
.ns-sync-dot {
  display: inline-block; width: 6px; height: 6px; border-radius: 50%;
  background: #50ff88;
  box-shadow: 0 0 6px #50ff88;
  margin-right: 4px; vertical-align: middle;
  animation: ns-heartbeat 1.6s ease-in-out infinite;
}
@keyframes ns-heartbeat {
  0%, 100% { transform: scale(1);   opacity: 1; }
  15%      { transform: scale(1.4); opacity: 0.7; }
  30%      { transform: scale(1);   opacity: 1; }
  45%      { transform: scale(1.25); opacity: 0.8; }
}

.ns-scroll { flex: 1; overflow: auto; position: relative; z-index: 2; padding: 16px; }

/* ── Title ── */
.ns-title {
  font-family: 'Orbitron', sans-serif; font-weight: 900;
  color: #e0faff; font-size: 22px; letter-spacing: 0.1em;
  text-shadow: 0 0 10px rgba(0,212,255,0.2);
}
.ns-sub {
  font-family: 'Orbitron', sans-serif; font-weight: 600;
  color: #4a7a99; font-size: 11px; letter-spacing: 0.15em;
  margin: 4px 0 16px;
}

/* ── Pass cards — octagonal clip-path ── */
.ns-card {
  display: flex; align-items: center; gap: 14px;
  padding: 16px 18px; margin-bottom: 10px;
  background: linear-gradient(135deg, #0a1420 0%, #050810 100%);
  position: relative;
  clip-path: polygon(14px 0, calc(100% - 14px) 0, 100% 14px, 100% calc(100% - 14px), calc(100% - 14px) 100%, 14px 100%, 0 calc(100% - 14px), 0 14px);
}
.ns-card::after {
  content: ''; position: absolute; inset: 0;
  background: linear-gradient(135deg, transparent 0, transparent 40%, rgba(0,212,255,0.04) 50%, transparent 60%);
  pointer-events: none;
}
.ns-card-letter {
  font-family: 'Orbitron', sans-serif; font-weight: 900;
  color: #00d4ff; font-size: 2.1rem; line-height: 1;
  text-shadow: 0 0 12px rgba(0,212,255,0.6);
  width: 44px; text-align: center; flex-shrink: 0;
}
.ns-card-body { flex: 1; }
.ns-card-name {
  font-family: 'Orbitron', sans-serif; font-weight: 700;
  color: #e0faff; font-size: 13px; letter-spacing: 0.08em;
  text-transform: uppercase;
}
.ns-card-prev {
  font-family: 'JetBrains Mono', monospace; font-size: 10px;
  color: #4a7a99; margin-top: 2px;
}

.ns-card--next {
  background: linear-gradient(135deg, #0a2030 0%, #051020 100%);
  animation: ns-morph 3.2s ease-in-out infinite;
}
@keyframes ns-morph {
  0%, 100% { box-shadow: 0 0 0 1px #00d4ff, 0 0 15px rgba(0,212,255,0.25); }
  50%      { box-shadow: 0 0 0 1px #00fff0, 0 0 28px rgba(0,255,240,0.45), inset 0 0 20px rgba(0,212,255,0.08); }
}

.ns-card--ip {
  background: linear-gradient(135deg, #0a2020 0%, #051010 100%);
  box-shadow: 0 0 0 1px #50ff88, 0 0 12px rgba(80,255,136,0.18);
}
.ns-card--ip .ns-card-letter {
  color: #50ff88; text-shadow: 0 0 10px rgba(80,255,136,0.5);
}

.ns-card--done { opacity: 0.35; }

/* ── Exercise card ── */
.ns-ex {
  background: linear-gradient(135deg, #0a1420 0%, #050810 100%);
  border: 1px solid #102030;
  padding: 14px;
  margin: 14px 0 10px;
  clip-path: polygon(0 0, calc(100% - 8px) 0, 100% 8px, 100% 100%, 8px 100%, 0 calc(100% - 8px));
}
.ns-ex-name {
  font-family: 'Orbitron', sans-serif; font-weight: 700;
  color: #e0faff; font-size: 1.05rem; letter-spacing: 0.04em;
}
.ns-ex-detail {
  font-family: 'JetBrains Mono', monospace; color: #5a8899;
  font-size: 11px; margin-top: 4px;
}
.ns-ex-prev {
  display: flex; gap: 12px; margin-top: 6px;
  font-family: 'JetBrains Mono', monospace; font-size: 10px;
}
.ns-last { color: #00b8a0; }
.ns-pr { color: #00d4ff; text-shadow: 0 0 4px rgba(0,212,255,0.3); font-weight: 700; }

.ns-tag {
  display: inline-block; margin-left: 6px; padding: 3px 10px;
  font-family: 'Orbitron', sans-serif; font-weight: 700;
  font-size: 9px; letter-spacing: 0.12em;
  clip-path: polygon(4px 0, 100% 0, calc(100% - 4px) 100%, 0 100%);
  vertical-align: middle;
}
.ns-tag--ramp { background: #1a2a00; border: 1px solid #88aa00; color: #ccff00; }
.ns-tag--bw   { background: #002a1a; border: 1px solid #00aa66; color: #50ff88; }
.ns-tag--uni  { background: #2a1500; border: 1px solid #cc8800; color: #ffaa44; }

.ns-set-label {
  font-family: 'Orbitron', sans-serif; font-weight: 700;
  color: #00d4ff; font-size: 10px; letter-spacing: 0.16em;
  text-transform: uppercase; margin: 14px 0 6px;
}
.ns-set-row { display: flex; gap: 4px; }
.ns-set-input {
  flex: 1; height: 38px; text-align: center;
  background: #030610; border: 1px solid #102030;
  color: #00d4ff; font-family: 'JetBrains Mono', monospace;
  font-weight: 500; font-size: 16px;
}
.ns-set-input:focus {
  outline: none; border-color: #00d4ff;
  box-shadow: 0 0 8px rgba(0,212,255,0.35), inset 0 0 4px rgba(0,212,255,0.1);
}

.ns-btn-primary {
  height: 38px; padding: 0 22px;
  display: flex; align-items: center; justify-content: center;
  background: linear-gradient(135deg, #00d4ff 0%, #0099cc 100%);
  color: #050810; font-family: 'Orbitron', sans-serif; font-weight: 900;
  font-size: 13px; letter-spacing: 0.18em; border: none;
  clip-path: polygon(8px 0, 100% 0, calc(100% - 8px) 100%, 0 100%);
  text-shadow: 0 1px 0 rgba(255,255,255,0.3);
}
.ns-btn-secondary {
  padding: 7px 14px; font-family: 'Orbitron', sans-serif; font-weight: 700;
  font-size: 10px; letter-spacing: 0.12em; text-transform: uppercase;
  background: none; border: 1px solid #2a3a4a; color: #5a8899;
}
.ns-btn-skip { border-color: #554400; color: #aa8800; }
.ns-btn-edit { border-color: #2a3a4a; color: #5a8899; }
.ns-btn-done {
  flex: 1; padding: 9px 12px;
  background: linear-gradient(180deg, #0a2040 0%, #051020 100%);
  border: 1px solid #00d4ff; color: #00d4ff;
  font-family: 'Orbitron', sans-serif; font-weight: 700;
  font-size: 11px; letter-spacing: 0.12em; text-transform: uppercase;
  text-align: center;
  box-shadow: inset 0 0 8px rgba(0,212,255,0.15);
}
.ns-ex-btns { display: flex; gap: 6px; margin-top: 12px; align-items: stretch; }

/* ── Tabs ── */
.ns-tabs {
  display: flex; position: relative; z-index: 3;
  background: rgba(5,8,16,0.92);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border-top: 1px solid #00d4ff;
}
.ns-tab {
  flex: 1; text-align: center; padding: 14px 4px;
  font-family: 'Orbitron', sans-serif; font-weight: 700;
  color: #4a7a99; letter-spacing: 0.15em;
  font-size: 10px; text-transform: uppercase;
}
.ns-tab--active {
  color: #00d4ff; border-top: 2px solid #00d4ff;
  background: linear-gradient(180deg, rgba(0,212,255,0.12) 0%, transparent 60%);
  text-shadow: 0 0 8px rgba(0,212,255,0.6);
}
`;

export default NanosuitTheme;
export { NanosuitGrid, NANOSUIT_CSS };
