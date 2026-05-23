// DaylightTheme.jsx — self-contained Daylight theme for "The Chain" training app.
//
// STATUS: WIP. Originally one of the first themes — clean white with charcoal
// text and Bebas Neue display. Currently flagged "Daylight · WIP" in the app
// because it's dated relative to newer themes (Obsidian, Cosmic Horror,
// Arctic Terminal) and is a candidate for redesign or replacement by a more
// distinctive light theme.
//
// What it ships:
//   - <DaylightTheme /> component: the training session screen with theme
//   - All styles scoped to .dl-* class names — no global CSS, no Tailwind.
//
// Integration:
//   1. Drop this file into your app (e.g. src/themes/DaylightTheme.jsx)
//   2. Render <DaylightTheme /> as a full-bleed view
//   3. Replace the hard-coded session data with your real training model

import React from 'react';

function DaylightTheme() {
  return (
    <div className="dl-root">
      <DaylightThemeStyles />

      <div className="dl-topbar">
        <div className="dl-logo">THE <span>CHAIN</span></div>
        <div className="dl-meta">
          <div>TRAINING AS <strong>Niklas</strong></div>
          <div className="dl-meta-sync">v3.33.3 · SYNC</div>
        </div>
      </div>

      <div className="dl-scroll">
        <div className="dl-title">THE CHAIN</div>
        <div className="dl-sub">Trial I of IV · Round I</div>

        {/* Pass cards */}
        <div className="dl-card dl-card--next">
          <div className="dl-card-letter">B</div>
          <div className="dl-card-body">
            <div className="dl-card-name">BACK · BICEPS</div>
            <div className="dl-card-prev">NEXT UP · Deadlift, Pull-ups, Dead Hang</div>
          </div>
        </div>
        <div className="dl-card dl-card--ip">
          <div className="dl-card-letter">A</div>
          <div className="dl-card-body">
            <div className="dl-card-name">CHEST · TRICEPS</div>
            <div className="dl-card-prev">IN PROGRESS · 3 / 5 done</div>
          </div>
        </div>
        <div className="dl-card dl-card--done">
          <div className="dl-card-letter">V</div>
          <div className="dl-card-body">
            <div className="dl-card-name">REST</div>
            <div className="dl-card-prev">DONE</div>
          </div>
        </div>

        {/* Active exercise card */}
        <div className="dl-ex">
          <div className="dl-ex-name">
            Dead Hang
            <span className="dl-tag dl-tag--bw">BW+</span>
            <span className="dl-tag dl-tag--ramp">TIMED</span>
          </div>
          <div className="dl-ex-detail">Supinated or neutral · one set to failure</div>
          <div className="dl-ex-prev">
            <span className="dl-last">Last (3d): 42 s</span>
            <span className="dl-pr">PR 48 s</span>
          </div>

          <div className="dl-set-label">WORK SET III</div>
          <div className="dl-set-row">
            <input className="dl-set-input" defaultValue="0" />
            <input className="dl-set-input" defaultValue="0" />
            <input className="dl-set-input" defaultValue="0" />
            <div className="dl-btn-primary">LOG</div>
          </div>

          <div className="dl-ex-btns">
            <div className="dl-btn-secondary">SKIP</div>
            <div className="dl-btn-secondary">EDIT</div>
            <div className="dl-btn-done">DONE</div>
          </div>
        </div>
      </div>

      <div className="dl-tabs">
        <div className="dl-tab dl-tab--active">CHAIN</div>
        <div className="dl-tab">PROGRESS</div>
        <div className="dl-tab">WEIGHT</div>
        <div className="dl-tab">SETTINGS</div>
      </div>
    </div>
  );
}

// Fonts assumed loaded by host app:
//   <link href="https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">
function DaylightThemeStyles() {
  return <style>{DAYLIGHT_CSS}</style>;
}

const DAYLIGHT_CSS = `
.dl-root {
  position: absolute; inset: 0;
  background: #fafaf7;
  color: #0e1418;
  font-family: 'Inter', sans-serif;
  font-size: 13px;
  color-scheme: light;
  overflow: hidden;
  display: flex; flex-direction: column;
}
.dl-root, .dl-root * { box-sizing: border-box; }

/* ── Top bar ── */
.dl-topbar {
  display: flex; justify-content: space-between; align-items: center;
  padding: 12px 16px;
  background: #fff;
  border-bottom: 1px solid #e0dcd0;
  box-shadow: 0 1px 0 rgba(0,0,0,0.04);
}
.dl-logo {
  font-family: 'Bebas Neue', sans-serif; font-weight: 700;
  font-size: 1.5rem; letter-spacing: 0.16em; color: #0e1418;
}
.dl-logo span { color: #c0392b; }
.dl-meta {
  text-align: right; font-family: 'JetBrains Mono', monospace;
  font-size: 10px; color: #666; letter-spacing: 0.08em;
  text-transform: uppercase; line-height: 1.5;
}
.dl-meta strong { color: #0e1418; }
.dl-meta-sync { color: #999; font-size: 9px; }

.dl-scroll { flex: 1; overflow: auto; padding: 16px; }

/* ── Title ── */
.dl-title {
  font-family: 'Bebas Neue', sans-serif;
  color: #0e1418; font-size: 22px; letter-spacing: 0.08em;
}
.dl-sub {
  font-family: 'JetBrains Mono', monospace; font-size: 11px;
  color: #888; letter-spacing: 0.08em; text-transform: uppercase;
  margin: 4px 0 16px;
}

/* ── Pass cards ── */
.dl-card {
  display: flex; align-items: center; gap: 14px;
  padding: 14px 16px; margin-bottom: 8px;
  background: #fff;
  border: 1px solid #e0dcd0;
  box-shadow: 0 1px 3px rgba(0,0,0,0.03);
}
.dl-card-letter {
  font-family: 'Bebas Neue', sans-serif; font-weight: 700;
  color: #c0392b; font-size: 2.3rem; line-height: 1;
  width: 40px; text-align: center; flex-shrink: 0;
}
.dl-card-body { flex: 1; }
.dl-card-name {
  font-family: 'Inter', sans-serif; font-weight: 700;
  color: #0e1418; font-size: 13px; letter-spacing: 0.02em;
}
.dl-card-prev {
  font-family: 'JetBrains Mono', monospace; font-size: 10px;
  color: #888; margin-top: 2px;
}
.dl-card--next {
  border: 2px solid #c0392b;
  box-shadow: 0 2px 12px rgba(192,57,43,0.15);
}
.dl-card--ip {
  background: #fafff8; border-color: #2a7a3a;
  box-shadow: 0 2px 8px rgba(42,122,58,0.1);
}
.dl-card--ip .dl-card-letter { color: #2a7a3a; }
.dl-card--done {
  background: #f0eeea !important;
  border-color: #d8d4cc !important;
  filter: saturate(0.5);
}
.dl-card--done .dl-card-letter { color: #bbb; }
.dl-card--done .dl-card-name { color: #999; }
.dl-card--done .dl-card-prev { color: #bbb; }

/* ── Exercise card ── */
.dl-ex {
  background: #fff;
  border: 1px solid #e0dcd0;
  padding: 14px;
  margin: 14px 0 10px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.03);
}
.dl-ex-name {
  font-family: 'Inter', sans-serif; font-weight: 700;
  color: #0e1418; font-size: 1.05rem;
}
.dl-ex-detail {
  color: #666; font-size: 11px; margin-top: 4px;
}
.dl-ex-prev {
  display: flex; gap: 12px; margin-top: 6px;
  font-family: 'JetBrains Mono', monospace; font-size: 10px;
}
.dl-last { color: #2a7a3a; }
.dl-pr { color: #c0392b; font-weight: 700; }

.dl-tag {
  display: inline-block; margin-left: 6px; padding: 2px 8px;
  font-family: 'JetBrains Mono', monospace; font-size: 9px;
  letter-spacing: 0.1em; vertical-align: middle;
}
.dl-tag--ramp { background: #fff8e6; border: 1px solid #a8830a; color: #a8830a; }
.dl-tag--bw   { background: #f0f7ec; border: 1px solid #2a7a3a; color: #2a7a3a; }
.dl-tag--uni  { background: #fdf2ec; border: 1px solid #d0612b; color: #d0612b; }

.dl-set-label {
  font-family: 'Inter', sans-serif; font-weight: 600;
  color: #c0392b; font-size: 11px; letter-spacing: 0.14em;
  text-transform: uppercase; margin: 14px 0 6px;
}
.dl-set-row { display: flex; gap: 4px; }
.dl-set-input {
  flex: 1; height: 38px; text-align: center;
  background: #fff; border: 1px solid #d0ccc0;
  color: #c0392b; font-family: 'JetBrains Mono', monospace;
  font-weight: 700; font-size: 16px;
}
.dl-set-input:focus {
  outline: none; border-color: #c0392b;
  box-shadow: 0 0 0 2px rgba(192,57,43,0.15);
}

.dl-btn-primary {
  height: 38px; padding: 0 20px;
  display: flex; align-items: center; justify-content: center;
  background: #c0392b; color: #fff;
  font-family: 'Bebas Neue', sans-serif; font-size: 14px;
  letter-spacing: 0.1em; border: none;
}
.dl-btn-secondary {
  padding: 7px 12px; font-family: 'Inter', sans-serif; font-weight: 500;
  font-size: 11px; letter-spacing: 0.04em;
  background: none; border: 1px solid #aaa49a; color: #555;
}
.dl-btn-done {
  flex: 1; padding: 9px 12px;
  background: #fff; border: 1px solid #2a7a3a; color: #2a7a3a;
  font-family: 'Inter', sans-serif; font-weight: 600;
  font-size: 12px; text-align: center;
}
.dl-ex-btns { display: flex; gap: 6px; margin-top: 12px; align-items: stretch; }

/* ── Tabs ── */
.dl-tabs {
  display: flex; background: #fff;
  border-top: 1px solid #e0dcd0;
  box-shadow: 0 -1px 0 rgba(0,0,0,0.04);
}
.dl-tab {
  flex: 1; text-align: center; padding: 14px 4px;
  font-family: 'Inter', sans-serif; font-weight: 500;
  color: #888; letter-spacing: 0.06em;
  font-size: 11px;
}
.dl-tab--active {
  color: #c0392b; border-top: 2px solid #c0392b;
}
`;

export default DaylightTheme;
export { DAYLIGHT_CSS };
