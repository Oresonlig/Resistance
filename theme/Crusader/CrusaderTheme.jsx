// CrusaderTheme.jsx — self-contained Crusader theme for "The Chain" training app.
//
// STATUS: WIP (markerad i app som "Crusader · WIP")
// Niklas är inte nöjd med temat i nuvarande form. Kandidat för redesign eller
// utbyte. Denna fil är en trogen port av nuvarande CSS i index.html så att
// vidare iteration kan ske i Claude Design.
//
// What it ships:
//   - <CrusaderTheme /> component: the training session screen with theme
//   - <CrusaderCross /> sub-component: off-center templar cross backdrop
//     (mix-blend multiply against dark charcoal so cross white drops out)
//     + separate red glow layer with screen blend for pulse heartbeat
//   - All styles scoped to .cr-* class names — no global CSS, no Tailwind.
//
// Integration:
//   1. Drop this file into your app (e.g. src/themes/CrusaderTheme.jsx)
//   2. Provide crusader2.jpg (or any cross PNG/JPG with white background)
//      at the path passed via the `crossSrc` prop (defaults to ./crusader2.jpg)
//   3. Render <CrusaderTheme /> as a full-bleed view
//   4. Replace the hard-coded session data with your real training model
//
// Browser support: mix-blend-mode 'multiply' and 'screen' are required for the
// cross + glow effect. Falls back gracefully (cross visible on white bg) in
// browsers that don't support blend modes.

import React from 'react';

// ------- cross backdrop -------
function CrusaderCross({ crossSrc = './crusader2.jpg' }) {
  return (
    <>
      <div className="cr-cross-bg">
        <img className="cr-cross-img" src={crossSrc} alt="" />
      </div>
      <div className="cr-cross-glow" />
    </>
  );
}

// ------- the screen -------
function CrusaderTheme({ crossSrc }) {
  return (
    <div className="cr-root">
      <CrusaderThemeStyles />
      <CrusaderCross crossSrc={crossSrc} />

      {/* Top bar */}
      <div className="cr-topbar">
        <div className="cr-brand">
          <div className="cr-logo">THE <span>CHAIN</span></div>
        </div>
        <div className="cr-meta">
          <div>TRAINING AS <strong>Niklas</strong></div>
          <div className="cr-meta-v">LOG OUT</div>
        </div>
      </div>

      <div className="cr-scroll">
        {/* Title */}
        <div className="cr-title">THE CHAIN</div>
        <div className="cr-sub">Trial I of IV · Round I</div>

        {/* Pass cards */}
        <div className="cr-card cr-card--next">
          <div className="cr-card-letter">B</div>
          <div className="cr-card-name">BACK · BICEPS</div>
          <div className="cr-card-prev">NEXT UP · Deadlift, Pull-ups, Dead Hang</div>
        </div>
        <div className="cr-card cr-card--ip">
          <div className="cr-card-letter">A</div>
          <div className="cr-card-name">CHEST · TRICEPS</div>
          <div className="cr-card-prev">IN PROGRESS · 3 / 5 done</div>
        </div>
        <div className="cr-card cr-card--done">
          <div className="cr-card-letter">V</div>
          <div className="cr-card-name">REST</div>
          <div className="cr-card-prev">DONE</div>
        </div>

        {/* Active exercise card */}
        <div className="cr-ex">
          <div className="cr-ex-name">
            Dead Hang
            <span className="cr-tag cr-tag--bw">BW+</span>
            <span className="cr-tag cr-tag--ramp">TIMED</span>
          </div>
          <div className="cr-ex-detail">Supinated or neutral · one set to failure</div>
          <div className="cr-ex-prev">
            <span className="cr-last">Last (3d): 42 s</span>
            <span className="cr-pr">PR 48 s</span>
          </div>

          {/* Work set row */}
          <div className="cr-set-label">WORK SET III</div>
          <div className="cr-set-row">
            <input className="cr-set-input cr-set-work" defaultValue="0" />
            <input className="cr-set-input cr-set-work" defaultValue="0" />
            <input className="cr-set-input cr-set-work" defaultValue="0" />
            <div className="cr-btn-primary">LOG</div>
          </div>

          <div className="cr-ex-btns">
            <div className="cr-btn-secondary cr-btn-skip">SKIP</div>
            <div className="cr-btn-secondary cr-btn-edit">EDIT</div>
            <div className="cr-btn-done">DONE</div>
          </div>
        </div>

        {/* Collapsed exercises */}
        <div className="cr-ex cr-ex-collapsed">
          <span className="cr-ex-name">Deadlift</span>
          <span className="cr-tag cr-tag--ramp">RAMP</span>
        </div>
        <div className="cr-ex cr-ex-collapsed">
          <span className="cr-ex-name">Unilateral Cable Row</span>
          <span className="cr-tag cr-tag--uni">UNILATERAL</span>
        </div>
      </div>

      {/* Tab bar */}
      <div className="cr-tabs">
        <div className="cr-tab cr-tab--active">CHAIN</div>
        <div className="cr-tab">PROGRESS</div>
        <div className="cr-tab">WEIGHT</div>
        <div className="cr-tab">SETTINGS</div>
      </div>
    </div>
  );
}

// ------- styles -------
// Inlined so this single file is drop-in. Cinzel and Crimson Pro assumed loaded
// by the host app:
//   <link href="https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600;700&family=Crimson+Pro:ital,wght@0,400;0,700;1,400&display=swap" rel="stylesheet">
function CrusaderThemeStyles() {
  return <style>{CRUSADER_CSS}</style>;
}

const CRUSADER_CSS = `
.cr-root {
  position: absolute; inset: 0;
  background-color: #1a1612;
  background-image:
    radial-gradient(ellipse 110% 70% at 50% 100%, rgba(0,0,0,0.45) 0%, transparent 70%),
    radial-gradient(ellipse 90% 50% at 50% 0%, rgba(0,0,0,0.30) 0%, transparent 65%),
    radial-gradient(ellipse 60% 40% at 70% 50%, rgba(168,40,40,0.06) 0%, transparent 70%),
    linear-gradient(180deg, #211c16 0%, #1a1612 50%, #13100c 100%);
  background-attachment: fixed;
  color: #d8c8a8;
  font-family: 'Crimson Pro', serif;
  font-size: 13px;
  overflow: hidden;
  display: flex; flex-direction: column;
}
.cr-root, .cr-root * { box-sizing: border-box; }

/* ── Cross backdrop ── */
.cr-cross-bg {
  position: absolute;
  top: 50%; right: 0;
  width: 65vh; max-width: 75vw; height: auto;
  transform: translate(18%, -50%);
  z-index: 0;
  pointer-events: none;
  opacity: 0.9;
  mix-blend-mode: multiply;
}
.cr-cross-img {
  width: 100%; height: auto; display: block;
  user-select: none; -webkit-user-drag: none;
}
.cr-cross-glow {
  position: absolute;
  top: 50%; right: 0;
  width: 65vh; max-width: 75vw; aspect-ratio: 1;
  transform: translate(18%, -50%);
  z-index: 0;
  pointer-events: none;
  background: radial-gradient(ellipse 45% 55% at 50% 50%,
    rgba(232,64,64,0.55) 0%,
    rgba(168,40,40,0.22) 38%,
    transparent 72%);
  mix-blend-mode: screen;
  animation: cr-cross-pulse 3s ease-in-out infinite;
}
@keyframes cr-cross-pulse {
  0%, 100% { opacity: 0.22; transform: translate(18%, -50%) scale(0.9); }
  50%      { opacity: 0.95; transform: translate(18%, -50%) scale(1.08); }
}

/* ── Top bar ── */
.cr-topbar {
  display: flex; justify-content: space-between; align-items: center;
  padding: 14px 18px;
  position: relative; z-index: 3;
  background: linear-gradient(180deg, #221d17 0%, #181410 100%);
  box-shadow: 0 1px 0 rgba(138,112,72,0.35), 0 3px 16px rgba(0,0,0,0.4);
}
.cr-topbar::after {
  content: ''; position: absolute; left: 0; right: 0; bottom: -1px; height: 1px;
  background: linear-gradient(90deg, transparent 0%, #8a7048 20%, #a82828 50%, #8a7048 80%, transparent 100%);
  animation: cr-line 7s ease-in-out infinite;
}
@keyframes cr-line {
  0%, 100% { opacity: 0.55; height: 1px; }
  50%      { opacity: 1;    height: 2px; filter: blur(0.5px); }
}
.cr-logo {
  font-family: 'Cinzel', serif; font-weight: 700;
  color: #d8c8a8; letter-spacing: 0.2em; text-transform: uppercase;
  font-size: 14px;
}
.cr-logo span {
  color: #c83838;
  animation: cr-logo 5s ease-in-out infinite;
}
@keyframes cr-logo {
  0%, 100% { text-shadow: 0 0 6px rgba(200,56,56,0.35); }
  50%      { text-shadow: 0 0 16px rgba(200,56,56,0.7), 0 0 28px rgba(138,112,72,0.35); }
}
.cr-meta {
  text-align: right; font-size: 9px; color: #9a8e72;
  font-family: 'Cinzel', serif; letter-spacing: 0.12em; line-height: 1.7;
}
.cr-meta strong { color: #d8c8a8; }
.cr-meta-v { color: #c83838; }

.cr-scroll { flex: 1; overflow: auto; position: relative; z-index: 1; padding: 16px; }

/* ── Title ── */
.cr-title {
  font-family: 'Cinzel', serif; font-weight: 700;
  color: #d8c8a8; font-size: 22px; letter-spacing: 0.06em;
  margin-bottom: 4px;
}
.cr-sub {
  font-family: 'Crimson Pro', serif; font-style: italic;
  color: #7a6e58; font-size: 12px; margin-bottom: 18px;
}

/* ── Pass cards ── forged weathered metal plates with rust corners ── */
.cr-card {
  position: relative; margin-bottom: 10px;
  padding: 14px 16px 14px 22px;
  background:
    radial-gradient(ellipse 32% 28% at 6% 8%, rgba(120,40,20,0.38) 0%, rgba(90,30,15,0.18) 35%, transparent 70%),
    radial-gradient(ellipse 30% 26% at 94% 92%, rgba(120,40,20,0.34) 0%, rgba(90,30,15,0.16) 40%, transparent 72%),
    radial-gradient(ellipse 22% 18% at 92% 6%, rgba(140,60,30,0.26) 0%, transparent 75%),
    radial-gradient(ellipse 20% 16% at 8% 94%, rgba(100,30,15,0.30) 0%, transparent 75%),
    radial-gradient(ellipse 110% 110% at 50% 50%, transparent 45%, rgba(0,0,0,0.32) 100%),
    repeating-linear-gradient(112deg, transparent 0px, transparent 3px, rgba(0,0,0,0.06) 3px, rgba(0,0,0,0.06) 4px),
    linear-gradient(155deg, rgba(62,52,40,0.94) 0%, rgba(46,38,28,0.95) 35%, rgba(34,28,20,0.96) 65%, rgba(24,20,14,0.97) 100%);
  border: 1px solid rgba(78,64,48,0.85);
  box-shadow:
    inset 0 1px 0 rgba(232,200,140,0.14),
    inset 1px 0 0 rgba(140,116,80,0.10),
    inset 0 -2px 0 rgba(0,0,0,0.55),
    inset -1px 0 0 rgba(0,0,0,0.45),
    0 5px 16px rgba(0,0,0,0.65),
    0 2px 4px rgba(0,0,0,0.5),
    0 1px 0 rgba(168,40,40,0.10);
}
.cr-card::after {
  content: ''; position: absolute; left: 0; top: 0; bottom: 0; width: 3px;
  background: linear-gradient(180deg,
    rgba(168,40,40,0) 0%,
    rgba(168,40,40,0.55) 35%,
    rgba(232,180,80,0.4) 50%,
    rgba(168,40,40,0.55) 65%,
    rgba(168,40,40,0) 100%);
  box-shadow: 1px 0 2px rgba(0,0,0,0.4);
  pointer-events: none;
}
.cr-card--next {
  background:
    radial-gradient(ellipse 36% 30% at 6% 8%, rgba(180,60,30,0.45) 0%, rgba(140,40,20,0.22) 38%, transparent 72%),
    radial-gradient(ellipse 32% 28% at 94% 92%, rgba(180,60,30,0.40) 0%, rgba(140,40,20,0.20) 40%, transparent 74%),
    radial-gradient(ellipse 22% 18% at 92% 6%, rgba(200,80,40,0.32) 0%, transparent 75%),
    radial-gradient(ellipse 20% 16% at 8% 94%, rgba(160,50,25,0.36) 0%, transparent 75%),
    radial-gradient(ellipse 110% 110% at 50% 50%, transparent 40%, rgba(40,8,8,0.4) 100%),
    repeating-linear-gradient(112deg, transparent 0px, transparent 3px, rgba(0,0,0,0.06) 3px, rgba(0,0,0,0.06) 4px),
    linear-gradient(155deg, rgba(82,52,38,0.95) 0%, rgba(64,40,28,0.96) 35%, rgba(48,28,20,0.97) 65%, rgba(36,20,14,0.97) 100%);
  border: 2px solid rgba(168,80,48,0.9);
  animation: cr-beacon 4s ease-in-out infinite;
}
@keyframes cr-beacon {
  0%, 100% { box-shadow:
    inset 0 1px 0 rgba(232,180,100,0.18),
    inset 0 -2px 0 rgba(0,0,0,0.55),
    0 5px 18px rgba(0,0,0,0.65),
    0 0 22px rgba(168,40,40,0.22); }
  50%      { box-shadow:
    inset 0 1px 0 rgba(255,200,120,0.28),
    inset 0 -2px 0 rgba(0,0,0,0.55),
    0 5px 24px rgba(0,0,0,0.7),
    0 0 42px rgba(232,64,64,0.45); }
}
.cr-card--ip {
  background:
    radial-gradient(ellipse 32% 28% at 6% 8%, rgba(80,100,40,0.34) 0%, transparent 70%),
    radial-gradient(ellipse 30% 26% at 94% 92%, rgba(80,100,40,0.30) 0%, transparent 72%),
    radial-gradient(ellipse 110% 110% at 50% 50%, transparent 45%, rgba(0,0,0,0.32) 100%),
    linear-gradient(155deg, rgba(48,56,32,0.94) 0%, rgba(36,42,24,0.95) 50%, rgba(24,30,16,0.96) 100%);
  border-color: rgba(106,138,58,0.85);
  box-shadow:
    inset 0 1px 0 rgba(180,210,120,0.14),
    inset 0 -2px 0 rgba(0,0,0,0.55),
    0 5px 16px rgba(0,0,0,0.55),
    0 0 18px rgba(106,138,58,0.18);
}
.cr-card--done {
  background:
    radial-gradient(ellipse 100% 100% at 50% 50%, transparent 40%, rgba(0,0,0,0.45) 100%),
    linear-gradient(155deg, rgba(36,30,24,0.85) 0%, rgba(24,20,14,0.88) 100%);
  border-color: rgba(58,46,34,0.7);
  filter: saturate(0.35); opacity: 0.78;
}
.cr-card-letter {
  font-family: 'Cinzel', serif; font-weight: 700;
  color: #c83838; font-size: 2.2rem; line-height: 1;
  text-shadow: 0 0 8px rgba(200,56,56,0.25);
  margin-bottom: 4px;
}
.cr-card--next .cr-card-letter { animation: cr-letter 4s ease-in-out infinite; }
@keyframes cr-letter {
  0%, 100% { color: #a82828; text-shadow: 0 0 6px rgba(168,40,40,0.35); }
  50%      { color: #e84040; text-shadow: 0 0 14px rgba(232,64,64,0.7); }
}
.cr-card--done .cr-card-letter { color: #5a4e3a; }
.cr-card-name {
  color: #d8c8a8; font-family: 'Cinzel', serif; font-weight: 600;
  font-size: 13px; letter-spacing: 0.05em;
}
.cr-card--done .cr-card-name { color: #6a5e48; }
.cr-card-prev {
  color: #9a8e72; font-family: 'DM Mono', monospace; font-size: 10px;
  margin-top: 4px;
}
.cr-card--done .cr-card-prev { color: #5a4e3a; }

/* ── Active exercise card ── */
.cr-ex {
  background: rgba(34,29,23,0.92);
  border: 1px solid #4a3e30;
  padding: 14px;
  margin-top: 14px;
  margin-bottom: 8px;
}
.cr-ex-name {
  color: #d8c8a8; font-family: 'Cinzel', serif; font-weight: 600;
  font-size: 0.88rem; letter-spacing: 0.03em;
}
.cr-ex-detail {
  color: #9a8e72; font-size: 11px; margin-top: 4px;
  font-style: italic; font-family: 'Crimson Pro', serif;
}
.cr-ex-prev {
  display: flex; gap: 14px; margin-top: 8px; font-size: 10px;
  font-family: 'DM Mono', monospace;
}
.cr-last { color: #9ab06a; }
.cr-pr { color: #e84040; font-weight: 700; }

.cr-ex-collapsed {
  display: flex; align-items: center; gap: 10px;
  padding: 11px 12px;
  background: rgba(34,29,23,0.7);
}

/* ── Tags ── */
.cr-tag {
  display: inline-block; padding: 2px 8px; margin-left: 6px;
  font-size: 9px; letter-spacing: 0.18em; font-weight: 600;
  font-family: 'Cinzel', serif; vertical-align: middle;
}
.cr-tag--ramp { background: #2a241c; border: 1px solid #8a7048; color: #a89668; }
.cr-tag--bw   { background: #1f2a18; border: 1px solid #6a8a3a; color: #9ab06a; }
.cr-tag--uni  { background: #2a1c18; border: 1px solid #c05030; color: #d86a48; }

/* ── Set row ── */
.cr-set-label {
  font-family: 'Cinzel', serif; font-weight: 600; color: #c83838;
  font-size: 10px; letter-spacing: 0.2em; margin: 14px 0 6px;
}
.cr-set-row { display: flex; gap: 4px; }
.cr-set-input {
  flex: 1; height: 38px; text-align: center;
  background: #2a241c; border: 1px solid #4a3e30;
  color: #e84040; font-family: 'DM Mono', monospace; font-weight: 700; font-size: 16px;
}
.cr-set-input.cr-set-work { border-color: #5a4a36; }
.cr-set-input:focus { outline: none; border-color: #a82828; box-shadow: 0 0 0 2px rgba(168,40,40,0.25); }

/* ── Buttons ── */
.cr-btn-primary {
  height: 38px; padding: 0 18px; display: flex; align-items: center; justify-content: center;
  background: linear-gradient(180deg, #a82828 0%, #7a1515 100%);
  color: #f5eed8; font-family: 'Cinzel', serif; font-weight: 700;
  letter-spacing: 0.14em; text-transform: uppercase; border: none; font-size: 12px;
  box-shadow: 0 2px 10px rgba(168,40,40,0.35), inset 0 1px 0 rgba(255,200,100,0.15);
}
.cr-btn-secondary {
  padding: 7px 12px; font-size: 10px; font-family: 'Cinzel', serif; font-weight: 600;
  background: none; border: 1px solid #4a3e30; color: #9a8e72;
  letter-spacing: 0.1em;
}
.cr-btn-skip { border-color: #8a7048; color: #a89668; }
.cr-btn-done {
  flex: 1; padding: 9px 12px; font-family: 'Cinzel', serif; font-weight: 700;
  background: linear-gradient(180deg, #2a3622 0%, #1f2a18 100%);
  border: 1px solid #6a8a3a; color: #9ab06a;
  letter-spacing: 0.08em; text-align: center; font-size: 11px;
}
.cr-ex-btns { display: flex; gap: 6px; margin-top: 12px; align-items: stretch; }

/* ── Tabs ── */
.cr-tabs {
  display: flex; position: relative; z-index: 3;
  background: linear-gradient(0deg, #181410 0%, #221d17 100%);
  box-shadow: 0 -1px 0 rgba(138,112,72,0.3), 0 -4px 12px rgba(0,0,0,0.4);
}
.cr-tabs::before {
  content: ''; position: absolute; left: 0; right: 0; top: -1px; height: 1px;
  background: linear-gradient(90deg, transparent 0%, #8a7048 30%, #a82828 50%, #8a7048 70%, transparent 100%);
  opacity: 0.55;
}
.cr-tab {
  flex: 1; text-align: center; padding: 16px 4px;
  font-family: 'Cinzel', serif; font-weight: 600;
  color: #7a6e58; text-transform: uppercase; letter-spacing: 0.1em; font-size: 10px;
}
.cr-tab--active {
  color: #c83838; border-top: 2px solid #a82828;
  background: linear-gradient(180deg, rgba(168,40,40,0.12) 0%, transparent 60%);
}
`;

export default CrusaderTheme;
export { CrusaderCross, CRUSADER_CSS };
