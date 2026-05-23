# Arctic Terminal Theme — "The Chain" training app

**Status: Polished, in production.** Ratified version (3.26.5 — "WIP" tag
removed). The first proper light theme in the app and the reference for the
PM22 semantic-variable refactor.

## Atmosphere

Frozen lake at twilight. Pale icy-blue background with hexagonal ice texture,
glassmorphic cards with `backdrop-filter: blur`, deep liquid-nitrogen cyan
accents (`#00a8d8`), and strong frost halos in all four corners. Rajdhani
display + DM Mono for numbers — a tactical/terminal feel against the cold
aesthetic.

## Files

- `ArcticTheme.jsx` — single-file React component (no deps beyond React)

## Setup

1. Copy `ArcticTheme.jsx` into your app.
2. Make sure these Google Fonts are loaded somewhere in your `<head>`:

   ```html
   <link rel="preconnect" href="https://fonts.googleapis.com">
   <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
   <link href="https://fonts.googleapis.com/css2?family=Rajdhani:wght@400;500;600;700&family=DM+Mono:wght@400;500&display=swap" rel="stylesheet">
   ```

3. Render full-bleed:

   ```jsx
   import ArcticTheme from './themes/arctic/ArcticTheme';

   export default function App() {
     return (
       <div style={{ position: 'relative', width: '100vw', height: '100vh' }}>
         <ArcticTheme />
       </div>
     );
   }
   ```

## The frost halos — signature backdrop

`<ArcticFrost />` is a single fixed-position `<div>` at `z-index: 0` with four
radial gradients (one in each corner). Top corners are `rgba(80,175,218,0.85)`
and bottom corners are `rgba(100,192,232,0.80)` — both fading at 65%. The
slightly different blues create a subtle warmer-on-top / cooler-on-bottom feel.

The frost layer shows *through* the glass cards because the cards use
`rgba(255,255,255,0.55)` with optional `backdrop-filter: blur(10px)`. Without
the frost, the cards would just look flat-white on flat-blue.

## Glassmorphism recipe

All elevated surfaces (header, nav, modals, dropdowns, active cards):

```css
background: rgba(234,244,248,0.82);
backdrop-filter: blur(14px) saturate(140%);
-webkit-backdrop-filter: blur(14px) saturate(140%);
border: 1px solid rgba(0,168,216,0.18);
```

Three key choices that make it feel right rather than cheap:

1. **`saturate(140%)`** — without this, the blurred background looks muddy.
2. **A subtle blue tint (~0.18 alpha) on the border** — not pure white. The
   border is the "edge of the ice plate."
3. **`box-shadow: 0 4px 14px rgba(0,168,216,0.08), inset 0 1px 0
   rgba(255,255,255,0.5)`** on cards — the inset highlight on top simulates
   light catching the upper edge of a frosted pane.

## Motion inventory

Arctic is mostly static. It relies on the frost halos and glass blur for
visual richness rather than animation.

| element            | what                                    |
|--------------------|-----------------------------------------|
| sync dot (ok)      | static cyan (`#00c8a0` mapped to green) |
| (no breathing/pulse animations)                              |

If iterated, candidates for subtle motion: shimmer pass across the chain
intro banner, slow frost-halo pulse, or a slow color rotation on the
active-pass `box-shadow` glow.

## Color tokens

```css
--ar-bg-0:        #eaf4f8;   /* base */
--ar-text-strong: #1a2e3a;   /* primary */
--ar-text-body:   #5a7a88;
--ar-text-mute:   #7a96a4;
--ar-cyan:        #00a8d8;   /* accent — Arctic's signature */
--ar-cyan-bright: #5ac8e8;
--ar-mint:        #00c8a0;   /* in-progress / BW tag / "green" */
--ar-frost-1:     rgba(80,175,218,0.85);   /* top frost halos */
--ar-frost-2:     rgba(100,192,232,0.80);  /* bottom frost halos */
--ar-glass:       rgba(255,255,255,0.55);  /* card base */
--ar-glass-hi:    rgba(234,244,248,0.82);  /* header/nav base */
```

## Notes for porting back to single-file `index.html`

- Arctic's CSS lives in `body.theme-arctic { ... }` (~rad 1002–1286 in
  `index.html`). It also has a small block under "ARCTIC — paritet med
  Daylight" (~rad 1156+) added in 3.30.16 to close per-fall background gaps
  that the PM22 surface refactor (3.32.0) later made redundant.
- The corner frost halos are rendered via `body.theme-arctic::before` rather
  than a dedicated element (it's just a fixed pseudo). In this .jsx version
  it's a child `<div className="ar-frost" />` since we can't put `::before`
  on a body in component scope.
- Auth-form inputs need explicit overrides (`-webkit-box-shadow` autofill
  reset) — see lines 1130–1140 in `index.html` if porting back; not
  reproduced in this mockup since auth screen isn't shown.
