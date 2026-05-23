# Nanosuit Theme — "The Chain" training app

**Status: Adaptive tactical armor.** Game-engine HUD aesthetic. Hexagonal
carbon-weave background, scanning grid overlay, and pass cards that "morph"
their edge color between cyan and bright cyan — the namesake adaptive-armor
effect.

## Atmosphere

Operator interface aboard a stealth craft. Deep navy background
(`#050810`) with a hexagonal SVG carbon weave at 8% opacity, a subtle
horizontal scanning grid overlay, and electric cyan (`#00d4ff`) running
through every interactive element. Orbitron 900 for display type, JetBrains
Mono for numeric readouts. Pass cards use octagonal clip-paths (14px
chamfer on all four corners) for the assembled-from-panels look.

## Files

- `NanosuitTheme.jsx` — single-file React component (no deps beyond React)

## Setup

1. Copy `NanosuitTheme.jsx` into your app.
2. Make sure these Google Fonts are loaded somewhere in your `<head>`:

   ```html
   <link rel="preconnect" href="https://fonts.googleapis.com">
   <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
   <link href="https://fonts.googleapis.com/css2?family=Orbitron:wght@400;500;600;700;900&family=Space+Grotesk:wght@400;500;700&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">
   ```

3. Render full-bleed:

   ```jsx
   import NanosuitTheme from './themes/nanosuit/NanosuitTheme';

   export default function App() {
     return (
       <div style={{ position: 'relative', width: '100vw', height: '100vh' }}>
         <NanosuitTheme />
       </div>
     );
   }
   ```

## Hex carbon weave — signature backdrop

The body background is a tiled inline SVG (`56×100px` per tile) of
interlocking hexagons rendered as `stroke-opacity: 0.08` cyan lines on
near-black. Combined with the radial gradient (`ellipse at top` from
`#0a1828` to `#050810`), the carbon weave is most visible at the top edge
and fades into the void at the bottom.

The `.ns-grid` overlay is a single linear-gradient (1.5px horizontal lines
every 3px) at `0.015` opacity — barely visible but adds CRT-readout
texture without interfering with content.

## The morph animation — the namesake effect

`.ns-card--next` cycles its `box-shadow` between two colors every 3.2s:

```css
@keyframes ns-morph {
  0%, 100% { box-shadow: 0 0 0 1px #00d4ff, 0 0 15px rgba(0,212,255,0.25); }
  50%      { box-shadow: 0 0 0 1px #00fff0, 0 0 28px rgba(0,255,240,0.45),
                         inset 0 0 20px rgba(0,212,255,0.08); }
}
```

The inset shadow at 50% adds a brief inner-glow that the start/end don't
have, creating the impression that the armor's interior is "activating."

## Motion inventory

| element              | duration | what                                         |
|----------------------|----------|----------------------------------------------|
| sync dot ok          | 1.6s     | double heartbeat (irregular scale pulse)     |
| `.ns-card--next`     | 3.2s     | edge-color morph + inset activate glow       |
| card open transition | 0.4s     | one-shot expanding box-shadow ring           |
| chain progress fill  | static   | linear gradient cyan→teal→green (no anim)    |

## Color tokens

```css
--ns-bg-0:        #050810;   /* deep navy base */
--ns-bg-card:     #0a1420;
--ns-text:        #e0faff;   /* near-white with cyan cast */
--ns-text-mute:   #5a8899;
--ns-cyan:        #00d4ff;   /* signature — primary cyan */
--ns-cyan-bright: #00fff0;   /* "gold" mapped — morph target */
--ns-green:       #50ff88;   /* in-progress / BW tag */
--ns-amber:       #ffaa44;   /* UNI tag */
--ns-lime:        #ccff00;   /* RAMP tag */
```

Note: this theme remaps semantic vars so `var(--red)` = cyan,
`var(--gold)` = bright cyan, `var(--green-bright)` = lime green. Keep that
in mind if porting back — all `var(--red)` references stay valid.

## Notes for porting back to single-file `index.html`

- Nanosuit's CSS lives in `body.theme-nanosuit { ... }` (~rad 1880–2194 in
  `index.html`). One of the larger blocks — Nanosuit was Niklas's first
  "themed properly" theme after Iron.
- The scanning grid overlay uses `body.theme-nanosuit::before` (z-index 1).
  In this .jsx it's a child `<div className="ns-grid" />` since pseudo-on-body
  doesn't work in component scope.
- Most clip-paths use `14px` chamfers on cards / `8px` on smaller elements
  (modals, stat boxes). If you change one, recompute the others for
  consistency.
