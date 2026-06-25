# Nanosuit 2.0 — Adaptive tactical armor (energised)

Design source / handoff for the **Nanosuit 2.0** theme. This is the Claude-Design
mockup that the live theme in `index.html` is ported from.

## What 2.0 adds over the original Nanosuit
The original Nanosuit was static carbon + cyan. 2.0 adds the **motion it lacked**:

1. **Energising hex carbon-weave background** (`ambient-nanosuit.js` →
   `createHexField`). A hex grid where waves of cyan light sweep across the surface
   — expanding rings + diagonal sweeps + a constant idle shimmer — so the armor
   always looks alive (Crysis-suit rippling). This is the big change.
2. **Scan line** that periodically sweeps the screen (~every 7s).
3. **Title energise-flicker** — occasional cyan flicker on the chain title.
4. **Richer active-card morph** — a travelling energy edge (sheen) + glow pulse on
   the next-up pass-card.

## Files
- `Nanosuit.html` — standalone preview harness (device frame + host backdrop).
- `ambient-nanosuit.js` — `createHexField(canvas, opts) -> { stop }`. The signature
  backdrop. Auto-attaches to `#ambient` if present.
- `variants/nanosuit.jsx` — the in-device theme mockup (`NanosuitTheme`).

## Live integration (index.html) — IMPORTANT
- **Internal id stays `nanosuit`** and CSS class stays `theme-nanosuit`. 2.0 is an
  in-place upgrade of the existing theme (no migration — existing users keep their
  selection). Only the **display name** changes to "Nanosuit 2.0".
- The hex field is ported to vanilla JS as `_startNanosuitHex(canvas)` +
  `mountNanosuitBg()` / `unmountNanosuitBg()`, wired into `applyTheme` / `initTheme`
  / `toggleAmbientEffects` — the same pattern as Undertow / Overgrowth canvas
  backdrops (viewport-fixed canvas, `setTransform(dpr,0,0,dpr,0,0)`).
- **Perf:** ~30fps cap + dpr capped at 1.5 (S23 lesson — the energising loop
  iterates every hex per frame). The static weave is pre-rendered offscreen.
- **Ambient Effects toggle** (Settings) governs the heavy canvas only. When off, the
  canvas draws a single static weave frame (not blank). The lightweight CSS
  micro-animations (scan line, card morph, sync heartbeat) always run, consistent
  with the existing theme behaviour.
- The app's chain **session selector stays the horizontal swipe strip** — the
  vertical stacked cards in this mockup are just how the design renders in
  isolation; they are NOT adopted. The strip already reads cyan via `--red`/`--gold`
  tokens.

## Palette / type (unchanged family)
- `#050810` black · `#00d4ff` cyan (`--red`) · `#00fff0` bright cyan (`--gold`) ·
  `#50ff88` green · `#e0faff` white.
- Orbitron (display) · Space Grotesk (sans) · JetBrains Mono (readouts).
