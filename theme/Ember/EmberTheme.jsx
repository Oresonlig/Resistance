// EmberTheme.jsx — self-contained Ember theme for "The Chain" training app.
//
// STATUS: Reference dark theme with breathing animations. Industrial forge —
// molten orange + brass yellow + cooling-lava green on charcoal black,
// Rajdhani heavy display, with floating ember particles drifting upward as
// a CSS-only backdrop (no canvas needed).
//
// What it ships:
//   - <EmberTheme /> component: the training session screen with theme
//   - <EmberParticles /> sub-component: pure-CSS drifting ember particles
//     (radial-gradient sprites animated via background-position)
//   - All styles scoped to .em-* class names — no global CSS, no Tailwind.
//
// Integration:
//   1. Drop this file into your app (e.g. src/themes/EmberTheme.jsx)
//   2. Render <EmberTheme /> as a full-bleed view
//   3. Replace the hard-coded session data with your real training model

import React from 'react';

function EmberParticles() {
  return <div className="em-particles" />;
}

function EmberTheme() {
  return (
    <div className="em-root">
      <EmberThemeStyles />
      <EmberParticles />

      <div className="em-topbar">
        <div className="em-logo">THE <span>CHAIN</span></div>
        <div className="em-meta">
          <div>TRAINING AS <strong>Niklas</strong></div>
          <div className="em-meta-sync">
            <span className="em-sync-dot" /> V3.33.3 · SYNC
          </div>
        </div>
      </div>

      <div className="em-scroll">
        <div className="em-title">THE CHAIN</div>
        <div className="em-sub">TRIAL I OF IV · ROUND I</div>

        {/* Pass cards */}
        <div className="em-card em-card--next">
          <div className="em-card-letter">B</div>
          <div className="em-card-body">
            <div className="em-card-name">BACK · BICEPS</div>
            <div className="em-card-prev">NEXT UP · Deadlift, Pull-ups, Dead Hang</div>
          </div>
        </div>
        <div className="em-card em-card--ip">
          <div className="em-card-letter">A</div>
          <div className="em-card-body">
            <div className="em-card-name">CHEST · TRICEPS</div>
            <div className="em-card-prev">IN PROGRESS · 3 / 5 done</div>
          </div>
        </div>
        <div className="em-card em-card--done">
          <div className="em-card-letter">V</div>
          <div className="em-card-body">
            <div className="em-card-name">REST</div>
            <div className="em-card-prev">DONE</div>
          </div>
        </div>

        {/* Active exercise card */}
        <div className="em-ex">
          <div className="em-ex-name">
            Dead Hang
            <span className="em-tag em-tag--bw">BW+</span>
            <span className="em-tag em-tag--ramp">TIMED</span>
          </div>
          <div className="em-ex-detail">Supinated or neutral · one set to failure</div>
          <div className="em-ex-prev">
            <span className="em-last">Last (3d): 42 s</span>
            <span className="em-pr">PR 48 s</span>
          </div>

          <div className="em-set-label">WORK SET III</div>
          <div className="em-set-row">
            <input className="em-set-input" defaultValue="0" />
            <input className="em-set-input" defaultValue="0" />
            <input className="em-set-input" defaultValue="0" />
            <div className="em-btn-primary">LOG</div>
          </div>

          <div className="em-ex-btns">
            <div className="em-btn-secondary em-btn-skip">SKIP</div>
            <div className="em-btn-secondary em-btn-edit">EDIT</div>
            <div className="em-btn-done">DONE</div>
          </div>
        </div>
      </div>

      <div className="em-tabs">
        <div className="em-tab em-tab--active">CHAIN</div>
        <div className="em-tab">PROGRESS</div>
        <div className="em-tab">WEIGHT</div>
        <div className="em-tab">SETTINGS</div>
      </div>
    </div>
  );
}

// Fonts assumed loaded by host app:
//   <link href="https://fonts.googleapis.com/css2?family=Rajdhani:wght@400;500;600;700;900&family=Space+Grotesk:wght@400;500;700&family=DM+Mono:wght@400;500&display=swap" rel="stylesheet">
function EmberThemeStyles() {
  return <style>{EMBER_CSS}</style>;
}

const EMBER_CSS = `
.em-root {
  position: absolute; inset: 0;
  background-color: #0c0600;
  background-image:
    radial-gradient(ellipse 90% 50% at 50% 100%, rgba(255,106,0,0.18) 0%, transparent 60%),
    radial-gradient(ellipse 50% 40% at 0% 30%, rgba(204,51,0,0.08) 0%, transparent 70%),
    linear-gradient(180deg, #0c0600 0%, #0a0400 70%, #100800 100%);
  color: #ffe8cc;
  font-family: 'Space Grotesk', sans-serif;
  font-size: 13px;
  overflow: hidden;
  display: flex; flex-direction: column;
}
.em-root, .em-root * { box-sizing: border-box; }

/* ── Drifting ember particles ── pure CSS, no canvas ── */
.em-particles {
  position: absolute; inset: 0;
  pointer-events: none; z-index: 1;
  background-image:
    radial-gradient(2px 2px at 12% 80%, rgba(255,106,0,0.4)  50%, transparent 100%),
    radial-gradient(1px 1px at 28% 65%, rgba(255,200,80,0.3) 50%, transparent 100%),
    radial-gradient(2px 1px at 67% 75%, rgba(255,80,20,0.35) 50%, transparent 100%),
    radial-gradient(1px 2px at 88% 55%, rgba(255,180,60,0.3) 50%, transparent 100%),
    radial-gradient(1px 1px at 45% 90%, rgba(255,140,40,0.4) 50%, transparent 100%);
  background-size: 100% 200%;
  animation: em-drift 18s linear infinite;
  opacity: 0.7;
}
@keyframes em-drift {
  0%   { background-position: 0% 100%; }
  100% { background-position: 0% -100%; }
}

/* ── Top bar — burnished steel with ember underline ── */
.em-topbar {
  position: relative; z-index: 3;
  display: flex; justify-content: space-between; align-items: center;
  padding: 12px 16px;
  background: linear-gradient(180deg, #150900 0%, #0c0600 100%);
  box-shadow: 0 2px 0 rgba(255,106,0,0.6), 0 4px 24px rgba(255,106,0,0.15);
}
.em-topbar::after {
  content: ''; position: absolute; left: 0; right: 0; bottom: -2px; height: 1px;
  background: linear-gradient(90deg, transparent 0%, #ff6a00 30%, #ffcc00 50%, #ff6a00 70%, transparent 100%);
  filter: blur(0.5px);
  animation: em-pulse 4s ease-in-out infinite;
}
@keyframes em-pulse {
  0%, 100% { opacity: 0.7; }
  50%      { opacity: 1; filter: blur(1px); }
}
.em-logo {
  font-family: 'Rajdhani', sans-serif; font-weight: 900;
  font-size: 1.5rem; letter-spacing: 0.15em; color: #ffe8cc;
  text-shadow: 0 0 12px rgba(255,232,204,0.3);
}
.em-logo span {
  color: #ff6a00;
  text-shadow: 0 0 8px rgba(255,106,0,0.8), 0 0 16px rgba(255,106,0,0.5), 0 0 24px rgba(255,106,0,0.3);
  animation: em-logo-heat 5s ease-in-out infinite;
}
@keyframes em-logo-heat {
  0%, 100% { text-shadow: 0 0 8px rgba(255,106,0,0.8), 0 0 16px rgba(255,106,0,0.5), 0 0 24px rgba(255,106,0,0.3); }
  50%      { text-shadow: 0 0 10px rgba(255,140,30,0.9), 0 0 20px rgba(255,140,30,0.6), 0 0 32px rgba(255,200,80,0.4); }
}
.em-meta {
  text-align: right; font-family: 'DM Mono', monospace;
  font-size: 10px; color: #aa7040; letter-spacing: 0.12em;
  text-transform: uppercase; line-height: 1.6;
}
.em-meta strong { color: #ffcc00; text-shadow: 0 0 6px rgba(255,204,0,0.4); }
.em-meta-sync { color: #664422; font-size: 9px; }
.em-sync-dot {
  display: inline-block; width: 6px; height: 6px; border-radius: 50%;
  background: #a0cc40;
  box-shadow: 0 0 8px #a0cc40, 0 0 16px rgba(160,204,64,0.4);
  margin-right: 4px; vertical-align: middle;
}

.em-scroll { flex: 1; overflow: auto; position: relative; z-index: 2; padding: 16px; }

/* ── Title ── */
.em-title {
  font-family: 'Rajdhani', sans-serif; font-weight: 900;
  color: #ffe8cc; font-size: 24px; letter-spacing: 0.12em;
  text-transform: uppercase;
  text-shadow: 0 0 8px rgba(255,106,0,0.2);
}
.em-sub {
  font-family: 'Rajdhani', sans-serif; font-weight: 600;
  color: #aa7040; font-size: 11px; letter-spacing: 0.18em;
  text-transform: uppercase; margin: 4px 0 16px;
}

/* ── Pass cards — dark steel plates ── */
.em-card {
  display: flex; align-items: center; gap: 14px;
  padding: 14px 16px 14px 22px; margin-bottom: 14px;
  background: linear-gradient(135deg, #150a02 0%, #0c0600 100%);
  border: 1px solid #2a1800;
  position: relative;
}
.em-card::after {
  content: ''; position: absolute; left: 0; top: 0; bottom: 0; width: 3px;
  background: linear-gradient(180deg, transparent 0%, rgba(255,106,0,0.15) 50%, transparent 100%);
  pointer-events: none;
}
.em-card-letter {
  font-family: 'Rajdhani', sans-serif; font-weight: 900;
  color: #ff6a00; font-size: 2.4rem; line-height: 1;
  text-shadow: 0 0 4px rgba(255,106,0,1), 0 0 12px rgba(255,106,0,0.6), 0 0 24px rgba(255,140,30,0.3);
  width: 44px; text-align: center; flex-shrink: 0;
}
.em-card-body { flex: 1; }
.em-card-name {
  font-family: 'Rajdhani', sans-serif; font-weight: 700;
  color: #ffe8cc; font-size: 14px; letter-spacing: 0.08em;
  text-transform: uppercase;
}
.em-card-prev {
  font-family: 'DM Mono', monospace; font-size: 10px;
  color: #aa7040; margin-top: 2px;
}

.em-card--next {
  background: linear-gradient(135deg, #1f0c02 0%, #150700 100%);
  border-color: #ff6a00;
  animation: em-next-forge 3s ease-in-out infinite;
}
@keyframes em-next-forge {
  0%, 100% { box-shadow:
    0 0 16px rgba(255,106,0,0.3),
    0 0 32px rgba(255,106,0,0.15),
    inset 0 0 24px rgba(255,106,0,0.06); }
  50%      { box-shadow:
    0 0 24px rgba(255,140,30,0.45),
    0 0 48px rgba(255,140,30,0.2),
    inset 0 0 32px rgba(255,140,30,0.1); }
}
.em-card--next .em-card-letter { animation: em-letter-heat 3s ease-in-out infinite; }
@keyframes em-letter-heat {
  0%, 100% { text-shadow: 0 0 4px rgba(255,106,0,1), 0 0 12px rgba(255,106,0,0.6), 0 0 24px rgba(255,140,30,0.3); color: #ff6a00; }
  50%      { text-shadow: 0 0 6px rgba(255,180,60,1), 0 0 16px rgba(255,180,60,0.7), 0 0 32px rgba(255,200,80,0.4); color: #ff8c1a; }
}

.em-card--ip {
  border-color: #a0cc40;
  box-shadow: 0 0 16px rgba(160,204,64,0.2), inset 0 0 24px rgba(160,204,64,0.04);
}
.em-card--ip .em-card-letter {
  color: #a0cc40;
  text-shadow: 0 0 4px rgba(160,204,64,0.7), 0 0 12px rgba(160,204,64,0.4);
}

.em-card--done { opacity: 0.45; filter: saturate(0.5); }

/* ── Exercise card ── */
.em-ex {
  background: linear-gradient(135deg, #150a02 0%, #0c0600 100%);
  border: 1px solid #2a1800;
  padding: 14px;
  margin: 14px 0 10px;
}
.em-ex-name {
  font-family: 'Rajdhani', sans-serif; font-weight: 700;
  color: #ffe8cc; font-size: 1.1rem; letter-spacing: 0.04em;
}
.em-ex-detail {
  font-family: 'DM Mono', monospace; color: #aa7040;
  font-size: 11px; margin-top: 4px;
}
.em-ex-prev {
  display: flex; gap: 12px; margin-top: 6px;
  font-family: 'DM Mono', monospace; font-size: 10px;
}
.em-last { color: #a0cc40; text-shadow: 0 0 4px rgba(160,204,64,0.4); }
.em-pr { color: #ffcc00; text-shadow: 0 0 6px rgba(255,204,0,0.5); font-weight: 700; }

.em-tag {
  display: inline-block; margin-left: 6px; padding: 2px 8px;
  font-family: 'Rajdhani', sans-serif; font-weight: 700;
  font-size: 10px; letter-spacing: 0.15em;
  text-transform: uppercase; vertical-align: middle;
}
.em-tag--ramp {
  border: 1px solid #aa4400;
  background: linear-gradient(90deg, rgba(255,106,0,0.15), rgba(255,106,0,0.04));
  color: #ff8844; text-shadow: 0 0 4px rgba(255,106,0,0.4);
}
.em-tag--bw {
  border: 1px solid #a0cc40;
  background: linear-gradient(90deg, rgba(160,204,64,0.15), rgba(160,204,64,0.04));
  color: #a0cc40; text-shadow: 0 0 4px rgba(160,204,64,0.4);
}
.em-tag--uni {
  border: 1px solid #ffcc00;
  background: linear-gradient(90deg, rgba(255,204,0,0.15), rgba(255,204,0,0.04));
  color: #ffcc00; text-shadow: 0 0 4px rgba(255,204,0,0.4);
}

.em-set-label {
  font-family: 'Rajdhani', sans-serif; font-weight: 700;
  color: #ff6a00; font-size: 11px; letter-spacing: 0.18em;
  text-transform: uppercase; margin: 14px 0 6px;
  text-shadow: 0 0 6px rgba(255,106,0,0.4);
}
.em-set-row { display: flex; gap: 4px; }
.em-set-input {
  flex: 1; height: 38px; text-align: center;
  background: #080400; border: 1px solid #2a1800;
  color: #ff6a00; font-family: 'DM Mono', monospace;
  font-weight: 700; font-size: 16px;
  text-shadow: 0 0 4px rgba(255,106,0,0.4);
}
.em-set-input:focus {
  outline: none; border-color: #ff6a00;
  box-shadow:
    inset 0 0 8px rgba(255,106,0,0.15),
    0 0 12px rgba(255,106,0,0.5),
    0 0 24px rgba(255,140,30,0.2);
}

.em-btn-primary {
  height: 38px; padding: 0 20px;
  display: flex; align-items: center; justify-content: center;
  background: linear-gradient(180deg, #ff8c1a 0%, #cc3300 100%);
  color: #0c0600; font-family: 'Rajdhani', sans-serif; font-weight: 900;
  font-size: 14px; letter-spacing: 0.15em; text-transform: uppercase; border: none;
  text-shadow: 0 1px 0 rgba(255,255,255,0.2);
  box-shadow: 0 0 12px rgba(255,106,0,0.4), inset 0 1px 0 rgba(255,200,100,0.4);
}
.em-btn-secondary {
  padding: 7px 12px; font-family: 'Rajdhani', sans-serif; font-weight: 700;
  font-size: 11px; letter-spacing: 0.1em; text-transform: uppercase;
  background: none; border: 1px solid #2a1800; color: #aa7040;
}
.em-btn-skip { border-color: #cc3300; color: #ff6a00; text-shadow: 0 0 6px rgba(255,106,0,0.4); }
.em-btn-edit { border-color: #3a1800; color: #aa7040; }
.em-btn-done {
  flex: 1; padding: 9px 12px;
  background: linear-gradient(180deg, #1a0e00 0%, #0c0600 100%);
  border: 1px solid #a0cc40; color: #a0cc40;
  font-family: 'Rajdhani', sans-serif; font-weight: 700;
  font-size: 12px; letter-spacing: 0.1em; text-transform: uppercase;
  text-align: center;
  text-shadow: 0 0 6px rgba(160,204,64,0.5);
  box-shadow: inset 0 0 8px rgba(160,204,64,0.08);
}
.em-ex-btns { display: flex; gap: 6px; margin-top: 12px; align-items: stretch; }

/* ── Tabs ── */
.em-tabs {
  display: flex; position: relative; z-index: 3;
  background: linear-gradient(0deg, #0c0600 0%, #150900 100%);
  box-shadow: 0 -2px 0 rgba(255,106,0,0.4);
}
.em-tabs::before {
  content: ''; position: absolute; left: 0; right: 0; top: -1px; height: 1px;
  background: linear-gradient(90deg, transparent 0%, #ff6a00 50%, transparent 100%);
  filter: blur(0.5px); opacity: 0.6;
}
.em-tab {
  flex: 1; text-align: center; padding: 14px 4px;
  font-family: 'Rajdhani', sans-serif; font-weight: 600;
  color: #664422; letter-spacing: 0.18em;
  font-size: 11px; text-transform: uppercase;
}
.em-tab--active {
  color: #ff6a00; border-top: 2px solid #ff6a00;
  background: linear-gradient(180deg, rgba(255,106,0,0.15) 0%, transparent 70%);
  text-shadow: 0 0 8px rgba(255,106,0,0.6);
}
`;

export default EmberTheme;
export { EmberParticles, EMBER_CSS };
