// nanosuit.jsx — Nanosuit 2.0 for "The Chain". Adaptive tactical armor.
// v2 adds the motion the original lacked: the hex carbon-weave now ENERGISES —
// cyan waves sweep across the surface (in-app HexField canvas), a scan line
// periodically sweeps the screen, and the active pass-card morph is richer.
// Deep navy + electric cyan, Orbitron display, JetBrains Mono readouts,
// octagonal clip-path cards.

// in-app energising hex weave (uses window.createHexField from ambient-nanosuit.js)
function HexField() {
  const ref = React.useRef(null);
  React.useEffect(() => {
    if (!ref.current || !window.createHexField) return;
    const field = window.createHexField(ref.current, {
      size: 15, baseAlpha: 0.09, idleAmp: 0.09, intensity: 0.92,
      ringEvery: 80, sweepEvery: 260,
    });
    return () => field.stop();
  }, []);
  return <canvas ref={ref} className="ns-hex" aria-hidden="true" />;
}

function NanosuitTheme() {
  return (
    <div className="ns-root">
      <NanosuitThemeStyles />
      <HexField />
      <div className="ns-grid" />
      <div className="ns-scan" />

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
        <div className="ns-title" data-text="THE CHAIN">THE CHAIN</div>
        <div className="ns-sub">TRIAL I · ROUND I</div>

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

function NanosuitThemeStyles() {
  return <style>{NANOSUIT_CSS}</style>;
}

const NANOSUIT_CSS = `
.ns-root {
  position: absolute; inset: 0;
  background-color: #050810;
  background-image: radial-gradient(ellipse at top, #0a1828 0%, #050810 62%);
  color: #e0faff;
  font-family: 'Space Grotesk', sans-serif;
  font-size: 13px; overflow: hidden;
  display: flex; flex-direction: column; isolation: isolate;
}
.ns-root, .ns-root * { box-sizing: border-box; }

/* energising hex weave canvas */
.ns-hex { position: absolute; inset: 0; width: 100%; height: 100%; z-index: 0; pointer-events: none; }

/* scanning grid overlay */
.ns-grid {
  position: absolute; inset: 0; pointer-events: none; z-index: 1;
  background-image: linear-gradient(0deg, rgba(0,212,255,0.02) 50%, transparent 50%);
  background-size: 100% 3px;
}
/* a brighter scan line that periodically sweeps the screen */
.ns-scan {
  position: absolute; left: 0; right: 0; top: 0; height: 140px; z-index: 1; pointer-events: none;
  background: linear-gradient(180deg, transparent 0%, rgba(0,212,255,0.05) 45%, rgba(0,255,240,0.11) 50%, rgba(0,212,255,0.05) 55%, transparent 100%);
  animation: ns-scansweep 7s linear infinite;
}
@keyframes ns-scansweep {
  0%   { transform: translateY(-160px); opacity: 0; }
  8%   { opacity: 1; }
  92%  { opacity: 1; }
  100% { transform: translateY(820px); opacity: 0; }
}

.ns-topbar {
  position: relative; z-index: 3;
  display: flex; justify-content: space-between; align-items: center;
  padding: 12px 16px;
  background: rgba(5,8,16,0.88);
  border-bottom: 1px solid #00d4ff;
  box-shadow: 0 0 24px rgba(0,212,255,0.15), inset 0 -1px 0 rgba(0,255,240,0.3);
}
.ns-logo {
  font-family: 'Orbitron', sans-serif; font-weight: 900;
  font-size: 1.4rem; letter-spacing: 0.25em; color: #e0faff;
  text-shadow: 0 0 10px rgba(0,212,255,0.5);
}
.ns-logo span { color: #00d4ff; text-shadow: 0 0 15px rgba(0,212,255,0.8); }
.ns-meta { text-align: right; font-family: 'JetBrains Mono', monospace;
  font-size: 9px; color: #5a8899; letter-spacing: 0.08em; line-height: 1.6; }
.ns-meta strong { color: #00d4ff; }
.ns-meta-sync { font-size: 8px; }
.ns-sync-dot { display: inline-block; width: 6px; height: 6px; border-radius: 50%;
  background: #50ff88; box-shadow: 0 0 6px #50ff88; margin-right: 4px; vertical-align: middle;
  animation: ns-heartbeat 1.6s ease-in-out infinite; }
@keyframes ns-heartbeat {
  0%, 100% { transform: scale(1); opacity: 1; }
  15% { transform: scale(1.4); opacity: 0.7; }
  30% { transform: scale(1); opacity: 1; }
  45% { transform: scale(1.25); opacity: 0.8; }
}

.ns-scroll { flex: 1; overflow: auto; position: relative; z-index: 2; padding: 16px; }
.ns-scroll::-webkit-scrollbar { width: 0; }
/* dark scrim behind the title block so text stays legible when waves pass */
.ns-scroll::before {
  content: ''; position: absolute; top: 0; left: 0; right: 0; height: 110px; z-index: -1;
  background: linear-gradient(180deg, rgba(5,8,16,0.92) 0%, rgba(5,8,16,0.6) 55%, transparent 100%);
  pointer-events: none;
}

.ns-title {
  font-family: 'Orbitron', sans-serif; font-weight: 900;
  color: #e0faff; font-size: 22px; letter-spacing: 0.1em; position: relative;
  text-shadow: 0 0 10px rgba(0,212,255,0.25), 0 1px 6px rgba(3,6,16,0.95), 0 0 2px rgba(3,6,16,0.9);
}
/* occasional energise-flicker on the title */
.ns-title::after {
  content: attr(data-text); position: absolute; left: 0; top: 0;
  color: #00fff0; opacity: 0; mix-blend-mode: screen;
  animation: ns-titleflick 6s steps(1) infinite;
}
@keyframes ns-titleflick {
  0%, 96%, 100% { opacity: 0; transform: translateX(0); }
  97% { opacity: 0.7; transform: translateX(1px); }
  98% { opacity: 0; transform: translateX(-1px); }
  99% { opacity: 0.5; transform: translateX(1px); }
}
.ns-sub { font-family: 'Orbitron', sans-serif; font-weight: 600;
  color: #4a7a99; font-size: 11px; letter-spacing: 0.15em; margin: 4px 0 16px;
  text-shadow: 0 1px 5px rgba(3,6,16,0.9); }

.ns-card {
  display: flex; align-items: center; gap: 14px;
  padding: 16px 18px; margin-bottom: 10px; position: relative;
  background: linear-gradient(135deg, rgba(10,20,32,0.82) 0%, rgba(5,8,16,0.82) 100%);
  clip-path: polygon(14px 0, calc(100% - 14px) 0, 100% 14px, 100% calc(100% - 14px), calc(100% - 14px) 100%, 14px 100%, 0 calc(100% - 14px), 0 14px);
}
.ns-card::after {
  content: ''; position: absolute; inset: 0; pointer-events: none;
  background: linear-gradient(135deg, transparent 0, transparent 40%, rgba(0,212,255,0.04) 50%, transparent 60%);
}
.ns-card-letter {
  font-family: 'Orbitron', sans-serif; font-weight: 900;
  color: #00d4ff; font-size: 2.1rem; line-height: 1;
  text-shadow: 0 0 12px rgba(0,212,255,0.6);
  width: 44px; text-align: center; flex-shrink: 0;
}
.ns-card-body { flex: 1; }
.ns-card-name { font-family: 'Orbitron', sans-serif; font-weight: 700;
  color: #e0faff; font-size: 13px; letter-spacing: 0.08em; text-transform: uppercase; }
.ns-card-prev { font-family: 'JetBrains Mono', monospace; font-size: 10px; color: #4a7a99; margin-top: 2px; }

/* the namesake morph — now an energy edge that travels + inner activate glow */
.ns-card--next {
  background: linear-gradient(135deg, rgba(10,32,48,0.85) 0%, rgba(5,16,32,0.85) 100%);
  animation: ns-morph 3.2s ease-in-out infinite;
}
.ns-card--next::before {
  content: ''; position: absolute; inset: 0; pointer-events: none; z-index: 1;
  background: linear-gradient(115deg, transparent 0%, transparent 38%, rgba(0,255,240,0.5) 48%, rgba(174,249,255,0.8) 50%, rgba(0,255,240,0.5) 52%, transparent 62%, transparent 100%);
  background-size: 280% 100%;
  clip-path: polygon(14px 0, calc(100% - 14px) 0, 100% 14px, 100% calc(100% - 14px), calc(100% - 14px) 100%, 14px 100%, 0 calc(100% - 14px), 0 14px);
  mix-blend-mode: screen; opacity: 0.7;
  animation: ns-sheen 3.2s linear infinite;
}
@keyframes ns-sheen { 0% { background-position: 180% 0; } 100% { background-position: -120% 0; } }
@keyframes ns-morph {
  0%, 100% { box-shadow: 0 0 0 1px #00d4ff, 0 0 15px rgba(0,212,255,0.25); }
  50% { box-shadow: 0 0 0 1px #00fff0, 0 0 30px rgba(0,255,240,0.5), inset 0 0 22px rgba(0,212,255,0.1); }
}

.ns-card--ip {
  background: linear-gradient(135deg, rgba(10,32,32,0.85) 0%, rgba(5,16,16,0.85) 100%);
  box-shadow: 0 0 0 1px #50ff88, 0 0 12px rgba(80,255,136,0.18);
}
.ns-card--ip .ns-card-letter { color: #50ff88; text-shadow: 0 0 10px rgba(80,255,136,0.5); }
.ns-card--done { opacity: 0.35; }

.ns-ex {
  background: linear-gradient(135deg, rgba(10,20,32,0.85) 0%, rgba(5,8,16,0.85) 100%);
  border: 1px solid #102030; padding: 14px; margin: 14px 0 10px; position: relative;
  clip-path: polygon(0 0, calc(100% - 8px) 0, 100% 8px, 100% 100%, 8px 100%, 0 calc(100% - 8px));
}
.ns-ex-name { font-family: 'Orbitron', sans-serif; font-weight: 700;
  color: #e0faff; font-size: 1.05rem; letter-spacing: 0.04em; }
.ns-ex-detail { font-family: 'JetBrains Mono', monospace; color: #5a8899; font-size: 11px; margin-top: 4px; }
.ns-ex-prev { display: flex; gap: 12px; margin-top: 6px; font-family: 'JetBrains Mono', monospace; font-size: 10px; }
.ns-last { color: #00b8a0; }
.ns-pr { color: #00d4ff; text-shadow: 0 0 4px rgba(0,212,255,0.3); font-weight: 700; }

.ns-tag { display: inline-block; margin-left: 6px; padding: 3px 10px;
  font-family: 'Orbitron', sans-serif; font-weight: 700; font-size: 9px; letter-spacing: 0.12em;
  clip-path: polygon(4px 0, 100% 0, calc(100% - 4px) 100%, 0 100%); vertical-align: middle; }
.ns-tag--ramp { background: #1a2a00; border: 1px solid #88aa00; color: #ccff00; }
.ns-tag--bw { background: #002a1a; border: 1px solid #00aa66; color: #50ff88; }

.ns-set-label { font-family: 'Orbitron', sans-serif; font-weight: 700;
  color: #00d4ff; font-size: 10px; letter-spacing: 0.16em; text-transform: uppercase; margin: 14px 0 6px; }
.ns-set-row { display: flex; gap: 4px; }
.ns-set-input { flex: 1; height: 38px; text-align: center;
  background: rgba(3,6,16,0.7); border: 1px solid #102030; color: #00d4ff;
  font-family: 'JetBrains Mono', monospace; font-weight: 500; font-size: 16px; }
.ns-set-input:focus { outline: none; border-color: #00d4ff;
  box-shadow: 0 0 8px rgba(0,212,255,0.35), inset 0 0 4px rgba(0,212,255,0.1); }

.ns-btn-primary { height: 38px; padding: 0 22px;
  display: flex; align-items: center; justify-content: center;
  background: linear-gradient(135deg, #00d4ff 0%, #0099cc 100%);
  color: #050810; font-family: 'Orbitron', sans-serif; font-weight: 900;
  font-size: 13px; letter-spacing: 0.18em; border: none;
  clip-path: polygon(8px 0, 100% 0, calc(100% - 8px) 100%, 0 100%);
  text-shadow: 0 1px 0 rgba(255,255,255,0.3); }
.ns-btn-secondary { padding: 7px 14px; font-family: 'Orbitron', sans-serif; font-weight: 700;
  font-size: 10px; letter-spacing: 0.12em; text-transform: uppercase;
  background: none; border: 1px solid #2a3a4a; color: #5a8899; }
.ns-btn-skip { border-color: #554400; color: #aa8800; }
.ns-btn-done { flex: 1; padding: 9px 12px;
  background: linear-gradient(180deg, #0a2040 0%, #051020 100%);
  border: 1px solid #00d4ff; color: #00d4ff;
  font-family: 'Orbitron', sans-serif; font-weight: 700;
  font-size: 11px; letter-spacing: 0.12em; text-transform: uppercase; text-align: center;
  box-shadow: inset 0 0 8px rgba(0,212,255,0.15); }
.ns-ex-btns { display: flex; gap: 6px; margin-top: 12px; align-items: stretch; }

.ns-tabs { display: flex; position: relative; z-index: 3;
  background: rgba(5,8,16,0.85);
  backdrop-filter: blur(10px); -webkit-backdrop-filter: blur(10px);
  border-top: 1px solid #00d4ff; }
.ns-tab { flex: 1; text-align: center; padding: 14px 4px;
  font-family: 'Orbitron', sans-serif; font-weight: 700;
  color: #4a7a99; letter-spacing: 0.15em; font-size: 10px; text-transform: uppercase; }
.ns-tab--active { color: #00d4ff; border-top: 2px solid #00d4ff;
  background: linear-gradient(180deg, rgba(0,212,255,0.12) 0%, transparent 60%);
  text-shadow: 0 0 8px rgba(0,212,255,0.6); }

@media (prefers-reduced-motion: reduce) {
  .ns-scan, .ns-card--next, .ns-card--next::before, .ns-sync-dot, .ns-title::after { animation: none; }
}
`;

Object.assign(window, { NanosuitTheme, HexField, NanosuitThemeStyles, NANOSUIT_CSS });
