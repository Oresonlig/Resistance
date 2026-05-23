// IronTheme.jsx — self-contained Iron theme for "The Chain" training app.
//
// STATUS: The original. Default theme — has no body.theme-* class in the app;
// instead it inherits from the base :root variables and is selected via the
// `body:not([class*="theme-"])` selector. Bebas Neue display, dark red accent,
// subtle hexagonal texture across body + weight banner + pass-letter beacon.
//
// What it ships:
//   - <IronTheme /> component: the training session screen with theme
//   - All styles scoped to .ir-* class names — no global CSS, no Tailwind.
//   - Hex pattern is inline SVG data-URI (no external assets needed).
//
// Integration:
//   1. Drop this file into your app (e.g. src/themes/IronTheme.jsx)
//   2. Render <IronTheme /> as a full-bleed view
//   3. Replace the hard-coded session data with your real training model

import React from 'react';

function IronTheme() {
  return (
    <div className="ir-root">
      <IronThemeStyles />

      {/* Top bar */}
      <div className="ir-topbar">
        <div className="ir-logo">THE <span>CHAIN</span></div>
        <div className="ir-meta">
          <div>TRAINING AS <strong>Niklas</strong></div>
          <div className="ir-meta-sync">
            <span className="ir-sync-dot" /> V3.33.3 · SYNC
          </div>
        </div>
      </div>

      <div className="ir-scroll">
        <div className="ir-title">THE CHAIN</div>
        <div className="ir-sub">Trial I of IV · Round I</div>

        {/* Pass cards */}
        <div className="ir-card ir-card--next">
          <div className="ir-card-letter">B</div>
          <div className="ir-card-body">
            <div className="ir-card-name">BACK · BICEPS</div>
            <div className="ir-card-prev">NEXT UP · Deadlift, Pull-ups, Dead Hang</div>
          </div>
        </div>
        <div className="ir-card ir-card--ip">
          <div className="ir-card-letter">A</div>
          <div className="ir-card-body">
            <div className="ir-card-name">CHEST · TRICEPS</div>
            <div className="ir-card-prev">IN PROGRESS · 3 / 5 done</div>
          </div>
        </div>
        <div className="ir-card ir-card--done">
          <div className="ir-card-letter">V</div>
          <div className="ir-card-body">
            <div className="ir-card-name">REST</div>
            <div className="ir-card-prev">DONE</div>
          </div>
        </div>

        {/* Active exercise card */}
        <div className="ir-ex">
          <div className="ir-ex-name">
            Dead Hang
            <span className="ir-tag ir-tag--bw">BW+</span>
            <span className="ir-tag ir-tag--ramp">TIMED</span>
          </div>
          <div className="ir-ex-detail">Supinated or neutral · one set to failure</div>
          <div className="ir-ex-prev">
            <span className="ir-last">Last (3d): 42 s</span>
            <span className="ir-pr">PR 48 s</span>
          </div>

          <div className="ir-set-label">WORK SET III</div>
          <div className="ir-set-row">
            <input className="ir-set-input" defaultValue="0" />
            <input className="ir-set-input" defaultValue="0" />
            <input className="ir-set-input" defaultValue="0" />
            <div className="ir-btn-primary">LOG</div>
          </div>

          <div className="ir-ex-btns">
            <div className="ir-btn-secondary">SKIP</div>
            <div className="ir-btn-secondary">EDIT</div>
            <div className="ir-btn-done">DONE</div>
          </div>
        </div>

        {/* Weight banner — characteristic hex-textured strip */}
        <div className="ir-weight">
          <span className="ir-weight-label">BODY WEIGHT</span>
          <span className="ir-weight-val">97.2 kg</span>
        </div>
      </div>

      <div className="ir-tabs">
        <div className="ir-tab ir-tab--active">CHAIN</div>
        <div className="ir-tab">PROGRESS</div>
        <div className="ir-tab">WEIGHT</div>
        <div className="ir-tab">SETTINGS</div>
      </div>
    </div>
  );
}

// Inlined styles. Fonts assumed loaded by host app:
//   <link href="https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:wght@400;500;700&family=DM+Mono:wght@400;500&display=swap" rel="stylesheet">
function IronThemeStyles() {
  return <style>{IRON_CSS}</style>;
}

const IRON_CSS = `
.ir-root {
  position: absolute; inset: 0;
  background-color: #0a0a0a;
  background-image:
    url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='60' height='34' viewBox='0 0 60 34'%3E%3Cg fill='none' stroke='%23a02020' stroke-width='1' stroke-opacity='0.06'%3E%3Cpath d='M10 17L0 11L0 -1L10 -7L20 -1L20 11L10 17L10 35'/%3E%3Cpath d='M40 17L30 11L30 -1L40 -7L50 -1L50 11L40 17L40 35'/%3E%3Cpath d='M25 25L15 19L15 7L25 1L35 7L35 19L25 25'/%3E%3C/g%3E%3C/svg%3E"),
    radial-gradient(ellipse 100% 70% at 50% 0%, rgba(160,32,32,0.08) 0%, transparent 70%),
    linear-gradient(180deg, #0a0606 0%, #070303 100%);
  background-attachment: fixed;
  color: #f5f0e8;
  font-family: 'DM Sans', sans-serif;
  font-size: 13px;
  overflow: hidden;
  display: flex; flex-direction: column;
}
.ir-root, .ir-root * { box-sizing: border-box; }

/* ── Top bar ── subtle hex underline ── */
.ir-topbar {
  position: relative;
  display: flex; justify-content: space-between; align-items: center;
  padding: 11px 14px;
  background: #0a0a0a;
  border-bottom: 1px solid #1e1e1e;
}
.ir-topbar::after {
  content: ''; position: absolute; left: 0; right: 0; bottom: -1px; height: 1px;
  background: linear-gradient(90deg,
    transparent 0%,
    rgba(160,32,32,0.4) 30%,
    rgba(160,32,32,0.6) 50%,
    rgba(160,32,32,0.4) 70%,
    transparent 100%);
}
.ir-logo {
  font-family: 'Bebas Neue', sans-serif;
  font-size: 1.5rem; letter-spacing: 0.08em; color: #f5f0e8;
}
.ir-logo span { color: #c0392b; }
.ir-meta {
  text-align: right; font-family: 'DM Mono', monospace;
  font-size: 0.58rem; color: #aaa; letter-spacing: 0.1em; text-transform: uppercase;
  line-height: 1.6;
}
.ir-meta strong { color: #f5f0e8; }
.ir-meta-sync { color: #666; font-size: 0.5rem; margin-top: 2px; }
.ir-sync-dot {
  display: inline-block; width: 6px; height: 6px; border-radius: 50%;
  background: #3a9a5a; margin-right: 4px; vertical-align: middle;
}

.ir-scroll { flex: 1; overflow: auto; padding: 14px; }

/* ── Title ── */
.ir-title {
  font-family: 'Bebas Neue', sans-serif;
  color: #f5f0e8; font-size: 22px; letter-spacing: 0.08em;
}
.ir-sub {
  font-family: 'DM Mono', monospace; font-size: 11px;
  color: #999; letter-spacing: 0.1em; text-transform: uppercase;
  margin-bottom: 16px;
}

/* ── Pass cards ── */
.ir-card {
  display: flex; align-items: center; gap: 14px;
  padding: 12px 14px; margin-bottom: 8px;
  background: #0d0d0d;
  border: 1px solid #2c2c2c;
  position: relative; overflow: hidden;
}
.ir-card-letter {
  font-family: 'Bebas Neue', sans-serif;
  color: #f5f0e8; font-size: 2.3rem; line-height: 1;
  width: 48px; text-align: center; flex-shrink: 0;
}
.ir-card-body { flex: 1; }
.ir-card-name {
  font-family: 'Bebas Neue', sans-serif;
  color: #f5f0e8; font-size: 14px; letter-spacing: 0.06em;
}
.ir-card-prev {
  font-family: 'DM Mono', monospace; font-size: 10px;
  color: #999; letter-spacing: 0.04em; margin-top: 2px;
}

/* Next-up — characteristic Iron hexagon frame around the big letter */
.ir-card--next {
  border-color: #c0392b;
  box-shadow: 0 0 16px rgba(192,57,43,0.18), inset 0 0 0 1px rgba(192,57,43,0.15);
}
.ir-card--next .ir-card-letter {
  position: relative;
  color: #c0392b;
  display: inline-flex; align-items: center; justify-content: center;
  width: 48px; height: 54px;
}
.ir-card--next .ir-card-letter::before {
  content: ''; position: absolute;
  top: 50%; left: 50%; width: 54px; height: 60px;
  transform: translate(-50%, -50%);
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='54' height='60' viewBox='0 0 54 60'%3E%3Cpath d='M27 3L48 15L48 45L27 57L6 45L6 15Z' fill='none' stroke='%23a02020' stroke-width='1' stroke-opacity='0.5'/%3E%3C/svg%3E");
  background-size: contain; background-repeat: no-repeat;
  z-index: -1; pointer-events: none;
}

.ir-card--ip { border-color: #3a9a5a; }
.ir-card--ip .ir-card-letter { color: #3a9a5a; }

.ir-card--done { opacity: 0.6; }
.ir-card--done .ir-card-letter { color: #555; }
.ir-card--done .ir-card-name { color: #777; }

/* ── Exercise card ── */
.ir-ex {
  background: #0d0d0d;
  border: 1px solid #2c2c2c;
  padding: 14px;
  margin: 14px 0 10px;
}
.ir-ex-name {
  font-family: 'Bebas Neue', sans-serif;
  color: #f5f0e8; font-size: 1.1rem; letter-spacing: 0.04em;
}
.ir-ex-detail {
  color: #999; font-size: 11px; margin-top: 4px;
}
.ir-ex-prev {
  display: flex; gap: 12px; margin-top: 6px;
  font-family: 'DM Mono', monospace; font-size: 10px;
}
.ir-last { color: #3a9a5a; }
.ir-pr { color: #b8922a; font-weight: 700; }

.ir-tag {
  display: inline-block; margin-left: 6px; padding: 2px 8px;
  font-family: 'DM Mono', monospace; font-size: 9px;
  letter-spacing: 0.12em; vertical-align: middle;
}
.ir-tag--ramp { background: #1a1208; border: 1px solid #b8922a; color: #b8922a; }
.ir-tag--bw   { background: #0a1208; border: 1px solid #3a9a5a; color: #3a9a5a; }
.ir-tag--uni  { background: #1a0a08; border: 1px solid #c0392b; color: #c0392b; }

.ir-set-label {
  font-family: 'DM Mono', monospace; font-size: 10px;
  color: #c0392b; letter-spacing: 0.16em; text-transform: uppercase;
  margin: 14px 0 6px;
}
.ir-set-row { display: flex; gap: 4px; }
.ir-set-input {
  flex: 1; height: 38px; text-align: center;
  background: #111; border: 1px solid #2a2a2a;
  color: #c0392b; font-family: 'DM Mono', monospace;
  font-weight: 700; font-size: 16px;
}
.ir-set-input:focus {
  outline: none; border-color: #c0392b;
  box-shadow: 0 0 0 1px rgba(160,32,32,0.3), 0 0 8px rgba(160,32,32,0.2);
}

.ir-btn-primary {
  height: 38px; padding: 0 18px;
  display: flex; align-items: center; justify-content: center;
  background: #c0392b; color: #f5f0e8;
  font-family: 'Bebas Neue', sans-serif; font-size: 14px;
  letter-spacing: 0.12em; border: none;
}
.ir-btn-secondary {
  padding: 7px 12px; font-family: 'DM Mono', monospace; font-size: 10px;
  background: none; border: 1px solid #2c2c2c; color: #999;
  letter-spacing: 0.1em; text-transform: uppercase;
}
.ir-btn-done {
  flex: 1; padding: 9px 12px;
  background: #0a120a; border: 1px solid #3a9a5a; color: #3a9a5a;
  font-family: 'Bebas Neue', sans-serif; font-size: 14px;
  letter-spacing: 0.1em; text-align: center;
}
.ir-ex-btns { display: flex; gap: 6px; margin-top: 12px; align-items: stretch; }

/* ── Weight banner ── subtler hex pattern ── */
.ir-weight {
  display: flex; align-items: center; justify-content: space-between;
  padding: 10px 14px; margin-top: 12px;
  background-color: #0a0505;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='40' height='23' viewBox='0 0 40 23'%3E%3Cg fill='none' stroke='%23a02020' stroke-width='1' stroke-opacity='0.04'%3E%3Cpath d='M7 11L0 7L0 0L7 -3L14 0L14 7L7 11'/%3E%3Cpath d='M27 11L20 7L20 0L27 -3L34 0L34 7L27 11'/%3E%3C/g%3E%3C/svg%3E");
  border-top: 1px solid #1e1e1e; border-bottom: 1px solid #1e1e1e;
}
.ir-weight-label {
  font-family: 'DM Mono', monospace; font-size: 10px;
  color: #999; letter-spacing: 0.12em; text-transform: uppercase;
}
.ir-weight-val {
  font-family: 'Bebas Neue', sans-serif; color: #c0392b; font-size: 18px;
}

/* ── Tabs ── */
.ir-tabs {
  display: flex; background: #0a0a0a;
  border-top: 1px solid #2a2a2a;
}
.ir-tab {
  flex: 1; text-align: center; padding: 14px 4px;
  font-family: 'DM Mono', monospace; font-size: 10px;
  color: #666; letter-spacing: 0.14em; text-transform: uppercase;
}
.ir-tab--active {
  color: #c0392b; border-top: 2px solid #c0392b;
  background: linear-gradient(180deg, rgba(192,57,43,0.1) 0%, transparent 60%);
}
`;

export default IronTheme;
export { IRON_CSS };
