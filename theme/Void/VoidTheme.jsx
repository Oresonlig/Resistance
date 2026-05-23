// VoidTheme.jsx — self-contained Void theme for "The Chain" training app.
//
// STATUS: Spartansk by design. Pure black + white + Playfair Display italic.
// No glow, no breathing, no texture. Niklas: "spartanskt är ju grejen" —
// keep this minimal in any future iteration.
//
// What it ships:
//   - <VoidTheme /> component: the training session screen with theme
//   - All styles scoped to .vo-* class names — no global CSS, no Tailwind.
//
// Integration:
//   1. Drop this file into your app (e.g. src/themes/VoidTheme.jsx)
//   2. Render <VoidTheme /> as a full-bleed view
//   3. Replace the hard-coded session data with your real training model

import React from 'react';

function VoidTheme() {
  return (
    <div className="vo-root">
      <VoidThemeStyles />

      <div className="vo-topbar">
        <div className="vo-logo">The <span>Chain</span></div>
        <div className="vo-meta">
          <div>Niklas</div>
          <div className="vo-meta-sub">v3.33.3</div>
        </div>
      </div>

      <div className="vo-scroll">
        <div className="vo-title">The Chain</div>
        <div className="vo-sub">Trial I of IV · Round I</div>

        <div className="vo-card vo-card--next">
          <div className="vo-card-letter">B</div>
          <div className="vo-card-body">
            <div className="vo-card-name">Back · Biceps</div>
            <div className="vo-card-prev">Next · Deadlift, Pull-ups, Dead Hang</div>
          </div>
        </div>
        <div className="vo-card">
          <div className="vo-card-letter">A</div>
          <div className="vo-card-body">
            <div className="vo-card-name">Chest · Triceps</div>
            <div className="vo-card-prev">3 / 5</div>
          </div>
        </div>
        <div className="vo-card vo-card--done">
          <div className="vo-card-letter">V</div>
          <div className="vo-card-body">
            <div className="vo-card-name">Rest</div>
            <div className="vo-card-prev">Done</div>
          </div>
        </div>

        <div className="vo-ex">
          <div className="vo-ex-name">
            Dead Hang
            <span className="vo-tag">BW+</span>
            <span className="vo-tag">timed</span>
          </div>
          <div className="vo-ex-detail">Supinated or neutral — one set to failure</div>

          <div className="vo-set-label">Work set III</div>
          <div className="vo-set-row">
            <input className="vo-set-input" defaultValue="0" />
            <input className="vo-set-input" defaultValue="0" />
            <input className="vo-set-input" defaultValue="0" />
            <div className="vo-btn-primary">Log</div>
          </div>

          <div className="vo-ex-btns">
            <div className="vo-btn-secondary">Skip</div>
            <div className="vo-btn-secondary">Edit</div>
            <div className="vo-btn-done">Done</div>
          </div>
        </div>
      </div>

      <div className="vo-tabs">
        <div className="vo-tab vo-tab--active">Chain</div>
        <div className="vo-tab">Progress</div>
        <div className="vo-tab">Weight</div>
        <div className="vo-tab">Settings</div>
      </div>
    </div>
  );
}

// Fonts assumed loaded by host app:
//   <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;1,400;1,700&family=DM+Mono:wght@400;500&display=swap" rel="stylesheet">
function VoidThemeStyles() {
  return <style>{VOID_CSS}</style>;
}

const VOID_CSS = `
.vo-root {
  position: absolute; inset: 0;
  background: #000;
  color: #fff;
  font-family: 'DM Mono', monospace;
  font-size: 13px;
  overflow: hidden;
  display: flex; flex-direction: column;
}
.vo-root, .vo-root * { box-sizing: border-box; }

/* ── Top bar ── */
.vo-topbar {
  display: flex; justify-content: space-between; align-items: center;
  padding: 14px 18px;
  background: #000;
  border-bottom: 1px solid #222;
}
.vo-logo {
  font-family: 'Playfair Display', serif; font-style: italic;
  font-size: 1.4rem; letter-spacing: 0.03em; color: #fff;
}
.vo-logo span { color: #888; }
.vo-meta {
  text-align: right; font-size: 10px; color: #aaa;
  letter-spacing: 0.08em; line-height: 1.5;
}
.vo-meta-sub { color: #555; font-size: 9px; }

.vo-scroll { flex: 1; overflow: auto; padding: 16px; }

/* ── Title ── */
.vo-title {
  font-family: 'Playfair Display', serif; font-style: italic;
  font-weight: 700; color: #fff; font-size: 28px;
  letter-spacing: 0.01em;
}
.vo-sub {
  font-family: 'Playfair Display', serif; font-style: italic;
  color: #666; font-size: 12px; margin: 4px 0 20px;
}

/* ── Pass cards ── */
.vo-card {
  display: flex; align-items: center; gap: 16px;
  padding: 14px 16px; margin-bottom: 8px;
  background: #000;
  border: 1px solid #111;
}
.vo-card-letter {
  font-family: 'Playfair Display', serif; font-style: italic;
  color: #888; font-size: 2.2rem; line-height: 1;
  width: 40px; text-align: center; flex-shrink: 0;
}
.vo-card-body { flex: 1; }
.vo-card-name {
  font-family: 'Playfair Display', serif; font-weight: 700;
  color: #fff; font-size: 14px; letter-spacing: 0.01em;
}
.vo-card-prev {
  font-family: 'DM Mono', monospace; font-size: 10px;
  color: #666; margin-top: 2px;
}
.vo-card--next { border-color: #444; }
.vo-card--next .vo-card-letter { color: #fff; }
.vo-card--done { opacity: 0.4; }

/* ── Exercise card ── */
.vo-ex {
  background: #000;
  border: 1px solid #222;
  padding: 14px;
  margin: 14px 0 10px;
}
.vo-ex-name {
  font-family: 'Playfair Display', serif; font-weight: 700;
  color: #fff; font-size: 1.1rem;
}
.vo-ex-detail {
  color: #666; font-size: 11px; margin-top: 4px;
  font-family: 'Playfair Display', serif; font-style: italic;
}

.vo-tag {
  display: inline-block; margin-left: 6px; padding: 1px 8px;
  font-family: 'DM Mono', monospace; font-size: 9px;
  border: 1px solid #222; color: #444; letter-spacing: 0.08em;
  vertical-align: middle;
}

.vo-set-label {
  font-family: 'Playfair Display', serif; font-style: italic;
  color: #888; font-size: 12px; margin: 14px 0 6px;
}
.vo-set-row { display: flex; gap: 4px; }
.vo-set-input {
  flex: 1; height: 38px; text-align: center;
  background: #050505; border: 1px solid #1a1a1a;
  color: #fff; font-family: 'DM Mono', monospace;
  font-weight: 500; font-size: 16px;
}
.vo-set-input:focus { outline: none; border-color: #fff; }

.vo-btn-primary {
  height: 38px; padding: 0 20px;
  display: flex; align-items: center; justify-content: center;
  background: #fff; color: #000;
  font-family: 'Playfair Display', serif; font-style: italic;
  font-weight: 700; font-size: 14px; border: none;
}
.vo-btn-secondary {
  padding: 7px 14px; font-family: 'DM Mono', monospace; font-size: 10px;
  background: none; border: 1px solid #444; color: #666;
  letter-spacing: 0.08em;
}
.vo-btn-done {
  flex: 1; padding: 9px 12px;
  background: none; border: 1px solid #fff; color: #fff;
  font-family: 'Playfair Display', serif; font-style: italic;
  font-weight: 700; font-size: 14px; text-align: center;
}
.vo-ex-btns { display: flex; gap: 6px; margin-top: 12px; align-items: stretch; }

/* ── Tabs ── */
.vo-tabs {
  display: flex; background: #000;
  border-top: 1px solid #222;
}
.vo-tab {
  flex: 1; text-align: center; padding: 14px 4px;
  font-family: 'DM Mono', monospace; font-size: 10px;
  color: #444; letter-spacing: 0.14em;
}
.vo-tab--active {
  color: #fff; border-top: 1px solid #fff;
}
`;

export default VoidTheme;
export { VOID_CSS };
