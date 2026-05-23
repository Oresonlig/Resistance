// ArcticTheme.jsx — self-contained Arctic Terminal theme for "The Chain"
// training app.
//
// STATUS: Polished light theme. Glassmorphism with frozen-lake atmosphere,
// liquid-nitrogen cyan accents, hexagonal ice texture, and corner frost halos.
//
// What it ships:
//   - <ArcticTheme /> component: the training session screen with theme
//   - <ArcticFrost /> sub-component: 4-corner frost-halo backdrop layer
//   - All styles scoped to .ar-* class names — no global CSS, no Tailwind.
//
// Integration:
//   1. Drop this file into your app (e.g. src/themes/ArcticTheme.jsx)
//   2. Render <ArcticTheme /> as a full-bleed view
//   3. Replace the hard-coded session data with your real training model
//
// Browser support: backdrop-filter is required for the frosted glass look.
// Safari, Chrome, Firefox all modern OK. Old browsers degrade to flat
// translucent surfaces (still legible).

import React from 'react';

function ArcticFrost() {
  return <div className="ar-frost" />;
}

function ArcticTheme() {
  return (
    <div className="ar-root">
      <ArcticThemeStyles />
      <ArcticFrost />

      {/* Top bar */}
      <div className="ar-topbar">
        <div className="ar-logo">THE <span>CHAIN</span></div>
        <div className="ar-meta">
          <div>TRAINING AS <strong>Niklas</strong></div>
          <div className="ar-meta-sync">v3.33.3 · SYNC</div>
        </div>
      </div>

      <div className="ar-scroll">
        {/* Chain intro — cracked ice banner */}
        <div className="ar-intro">
          <div className="ar-intro-title">THE CHAIN</div>
          <div className="ar-intro-sub">Trial I of IV · Round I</div>
        </div>

        {/* Pass cards */}
        <div className="ar-card ar-card--next">
          <div className="ar-card-letter">B</div>
          <div className="ar-card-body">
            <div className="ar-card-name">BACK · BICEPS</div>
            <div className="ar-card-prev">NEXT UP · Deadlift, Pull-ups, Dead Hang</div>
          </div>
        </div>
        <div className="ar-card ar-card--ip">
          <div className="ar-card-letter">A</div>
          <div className="ar-card-body">
            <div className="ar-card-name">CHEST · TRICEPS</div>
            <div className="ar-card-prev">IN PROGRESS · 3 / 5 done</div>
          </div>
        </div>
        <div className="ar-card ar-card--done">
          <div className="ar-card-letter">V</div>
          <div className="ar-card-body">
            <div className="ar-card-name">REST</div>
            <div className="ar-card-prev">DONE</div>
          </div>
        </div>

        {/* Active exercise card */}
        <div className="ar-ex">
          <div className="ar-ex-name">
            Dead Hang
            <span className="ar-tag ar-tag--bw">BW+</span>
            <span className="ar-tag ar-tag--ramp">TIMED</span>
          </div>
          <div className="ar-ex-detail">Supinated or neutral · one set to failure</div>
          <div className="ar-ex-prev">
            <span className="ar-last">Last (3d): 42 s</span>
            <span className="ar-pr">PR 48 s</span>
          </div>

          <div className="ar-set-label">WORK SET III</div>
          <div className="ar-set-row">
            <input className="ar-set-input" defaultValue="0" />
            <input className="ar-set-input" defaultValue="0" />
            <input className="ar-set-input" defaultValue="0" />
            <div className="ar-btn-primary">LOG</div>
          </div>

          <div className="ar-ex-btns">
            <div className="ar-btn-secondary">SKIP</div>
            <div className="ar-btn-secondary">EDIT</div>
            <div className="ar-btn-done">DONE</div>
          </div>
        </div>
      </div>

      <div className="ar-tabs">
        <div className="ar-tab ar-tab--active">CHAIN</div>
        <div className="ar-tab">PROGRESS</div>
        <div className="ar-tab">WEIGHT</div>
        <div className="ar-tab">SETTINGS</div>
      </div>
    </div>
  );
}

// Fonts assumed loaded by host app:
//   <link href="https://fonts.googleapis.com/css2?family=Rajdhani:wght@400;500;600;700&family=DM+Mono:wght@400;500&display=swap" rel="stylesheet">
function ArcticThemeStyles() {
  return <style>{ARCTIC_CSS}</style>;
}

const ARCTIC_CSS = `
.ar-root {
  position: absolute; inset: 0;
  background-color: #eaf4f8;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='60' height='70'%3E%3Cpolygon points='0,17.5 10,0 30,0 40,17.5 30,35 10,35' fill='none' stroke='rgb(0,168,216)' stroke-width='1.5' opacity='.18'/%3E%3Cpolygon points='20,52.5 30,35 50,35 60,52.5 50,70 30,70' fill='none' stroke='rgb(0,168,216)' stroke-width='1.5' opacity='.18'/%3E%3C/svg%3E");
  background-size: 60px 70px;
  color: #1a2e3a;
  font-family: 'Rajdhani', sans-serif;
  font-size: 13px;
  color-scheme: light;
  overflow: hidden;
  display: flex; flex-direction: column;
}
.ar-root, .ar-root * { box-sizing: border-box; }

/* ── Frost halos in 4 corners ── */
.ar-frost {
  position: absolute; inset: 0;
  pointer-events: none; z-index: 0;
  background:
    radial-gradient(ellipse 70% 70% at 0%   0%,   rgba(80,175,218,0.85)  0%, transparent 65%),
    radial-gradient(ellipse 70% 70% at 100% 0%,   rgba(80,175,218,0.85)  0%, transparent 65%),
    radial-gradient(ellipse 65% 65% at 0%   100%, rgba(100,192,232,0.80) 0%, transparent 65%),
    radial-gradient(ellipse 65% 65% at 100% 100%, rgba(100,192,232,0.80) 0%, transparent 65%);
}

/* ── Top bar ── frosted glass ── */
.ar-topbar {
  position: relative; z-index: 2;
  display: flex; justify-content: space-between; align-items: center;
  padding: 12px 16px;
  background: rgba(234,244,248,0.82);
  backdrop-filter: blur(14px) saturate(140%);
  -webkit-backdrop-filter: blur(14px) saturate(140%);
  border-bottom: 1px solid rgba(0,168,216,0.35);
  box-shadow: 0 1px 14px rgba(0,168,216,0.10);
}
.ar-logo {
  font-family: 'Rajdhani', sans-serif; font-weight: 700;
  color: #1a2e3a; font-size: 1.4rem; letter-spacing: 0.2em;
}
.ar-logo span { color: #00a8d8; }
.ar-meta {
  text-align: right; font-family: 'DM Mono', monospace;
  font-size: 9px; color: #5a7a88; letter-spacing: 0.1em;
  text-transform: uppercase; line-height: 1.6;
}
.ar-meta strong { color: #1a2e3a; }
.ar-meta-sync { color: #7a96a4; font-size: 8px; }

.ar-scroll {
  flex: 1; overflow: auto;
  position: relative; z-index: 1;
  padding: 16px;
}

/* ── Chain intro — cracked ice banner ── */
.ar-intro {
  padding: 16px;
  background:
    linear-gradient(to bottom, rgba(10,50,80,0.28) 0%, rgba(0,30,60,0.18) 100%),
    linear-gradient(135deg, #1a4e78 0%, #0e3260 100%);
  border: 1px solid rgba(0,168,216,0.30);
  box-shadow: 0 2px 16px rgba(0,168,216,0.15);
  margin-bottom: 14px;
}
.ar-intro-title {
  font-family: 'Rajdhani', sans-serif; font-weight: 700;
  color: #fff; font-size: 1.6rem; letter-spacing: 0.1em;
  text-shadow: 0 1px 10px rgba(0,80,140,0.70);
}
.ar-intro-sub {
  color: rgba(200,232,255,0.90); font-size: 11px;
  font-family: 'DM Mono', monospace; letter-spacing: 0.08em;
  margin-top: 4px;
}

/* ── Pass cards — glassmorphic ── */
.ar-card {
  display: flex; align-items: center; gap: 14px;
  padding: 14px 16px; margin-bottom: 8px;
  background: rgba(255,255,255,0.55);
  border: 1px solid rgba(0,168,216,0.18);
  box-shadow: 0 4px 14px rgba(0,168,216,0.08), inset 0 1px 0 rgba(255,255,255,0.5);
}
.ar-card-letter {
  font-family: 'Rajdhani', sans-serif; font-weight: 700;
  color: #00a8d8; font-size: 2.2rem; line-height: 1;
  width: 40px; text-align: center; flex-shrink: 0;
}
.ar-card-body { flex: 1; }
.ar-card-name {
  font-family: 'Rajdhani', sans-serif; font-weight: 700;
  color: #1a2e3a; font-size: 14px; letter-spacing: 0.1em;
}
.ar-card-prev {
  font-family: 'DM Mono', monospace; font-size: 10px;
  color: #7a96a4; margin-top: 2px;
}
.ar-card--next {
  border: 1px solid rgba(0,168,216,0.55);
  box-shadow: 0 0 18px rgba(0,168,216,0.22), 0 4px 14px rgba(0,168,216,0.1);
}
.ar-card--ip {
  border-color: rgba(0,200,160,0.55);
  box-shadow: 0 0 14px rgba(0,200,160,0.16), 0 4px 14px rgba(0,168,216,0.08);
}
.ar-card--ip .ar-card-letter { color: #00c8a0; }
.ar-card--done {
  background: rgba(255,255,255,0.4);
  border-color: rgba(0,168,216,0.1);
  filter: saturate(0.5); opacity: 0.85;
}
.ar-card--done .ar-card-letter { color: #a8c2cc; }
.ar-card--done .ar-card-name { color: #7a96a4; }
.ar-card--done .ar-card-prev { color: #a8c2cc; }

/* ── Active exercise card ── */
.ar-ex {
  background: rgba(255,255,255,0.55);
  border: 1px solid rgba(0,168,216,0.1);
  padding: 14px;
  margin: 14px 0 10px;
}
.ar-ex-name {
  font-family: 'Rajdhani', sans-serif; font-weight: 700;
  color: #1a2e3a; font-size: 1.05rem; letter-spacing: 0.04em;
}
.ar-ex-detail {
  color: #5a7a88; font-size: 11px; margin-top: 4px;
}
.ar-ex-prev {
  display: flex; gap: 12px; margin-top: 6px;
  font-family: 'DM Mono', monospace; font-size: 10px;
}
.ar-last { color: #00c8a0; }
.ar-pr { color: #00a8d8; font-weight: 700; }

.ar-tag {
  display: inline-block; margin-left: 6px; padding: 2px 8px;
  font-family: 'Rajdhani', sans-serif; font-weight: 600;
  font-size: 10px; letter-spacing: 0.1em;
  vertical-align: middle;
}
.ar-tag--ramp { background: rgba(255,245,220,0.85); border: 1px solid #c89030; color: #8a6020; }
.ar-tag--bw   { background: rgba(220,240,235,0.85); border: 1px solid #00c8a0; color: #1a8a6a; }
.ar-tag--uni  { background: rgba(255,235,220,0.85); border: 1px solid #d0612b; color: #a04020; }

.ar-set-label {
  font-family: 'Rajdhani', sans-serif; font-weight: 600;
  color: #00a8d8; font-size: 11px; letter-spacing: 0.16em;
  text-transform: uppercase; margin: 14px 0 6px;
}
.ar-set-row { display: flex; gap: 4px; }
.ar-set-input {
  flex: 1; height: 38px; text-align: center;
  background: rgba(255,255,255,0.75);
  border: 1px solid rgba(0,168,216,0.22);
  color: #1a2e3a; font-family: 'DM Mono', monospace;
  font-weight: 700; font-size: 16px;
}
.ar-set-input:focus {
  outline: none; border-color: #00a8d8;
  box-shadow: 0 0 8px rgba(0,168,216,0.32);
}

.ar-btn-primary {
  height: 38px; padding: 0 20px;
  display: flex; align-items: center; justify-content: center;
  background: linear-gradient(135deg, #00a8d8 0%, #0088b8 100%);
  color: #fff; font-family: 'Rajdhani', sans-serif; font-weight: 700;
  font-size: 14px; letter-spacing: 0.15em; border: none;
  box-shadow: 0 2px 10px rgba(0,168,216,0.32);
}
.ar-btn-secondary {
  padding: 7px 12px; font-family: 'Rajdhani', sans-serif; font-weight: 600;
  font-size: 11px; letter-spacing: 0.1em;
  background: none; border: 1px solid rgba(0,168,216,0.3); color: #5a7a88;
}
.ar-btn-done {
  flex: 1; padding: 9px 12px;
  background: rgba(255,255,255,0.45); border: 1px solid #00a8d8; color: #00a8d8;
  font-family: 'Rajdhani', sans-serif; font-weight: 700;
  font-size: 12px; letter-spacing: 0.12em; text-align: center;
}
.ar-ex-btns { display: flex; gap: 6px; margin-top: 12px; align-items: stretch; }

/* ── Tabs — frosted glass ── */
.ar-tabs {
  display: flex; position: relative; z-index: 2;
  background: rgba(234,244,248,0.92);
  backdrop-filter: blur(14px) saturate(140%);
  -webkit-backdrop-filter: blur(14px) saturate(140%);
  border-top: 1px solid rgba(0,168,216,0.3);
}
.ar-tab {
  flex: 1; text-align: center; padding: 14px 4px;
  font-family: 'Rajdhani', sans-serif; font-weight: 600;
  color: #5a7a88; letter-spacing: 0.12em;
  font-size: 11px; text-transform: uppercase;
}
.ar-tab--active {
  background: rgba(0,168,216,0.14); color: #00a8d8;
  border-top: 2px solid #00a8d8;
}
`;

export default ArcticTheme;
export { ArcticFrost, ARCTIC_CSS };
