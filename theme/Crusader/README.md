# Crusader Theme — "The Chain" training app

**Status: WIP — candidate for redesign or replacement.**
Currently shipped as "Crusader · WIP" in the app's theme picker. Niklas is not
satisfied with the result and this folder exists primarily to support iteration
in Claude Design before a possible rebuild.

## Atmosphere

Templar warrior, battle-worn. Dark warm charcoal background with an off-center
templar cross looming in the shadow, blood-red accents, aged bronze, weathered
ash, and forged-metal pass cards with rust-stained corners.

## Files

- `CrusaderTheme.jsx` — single-file React component (no deps beyond React)
- `crusader2.jpg` — the cross image used as backdrop (white-background source
  is required; mix-blend-mode multiply drops the white against the dark theme)
- Other PNGs in this folder are alternate cross artwork from prior iterations
  (crusader1, crusaderold, crusadershield, crusaderarms) — kept as material if
  the theme is revisited.

## Setup

1. Copy `CrusaderTheme.jsx` into your app (e.g. `src/themes/crusader/`).
2. Copy `crusader2.jpg` next to it (or pass a different cross src via the
   `crossSrc` prop — must be a white-background image so multiply blend works).
3. Make sure these Google Fonts are loaded somewhere in your `<head>`:

   ```html
   <link rel="preconnect" href="https://fonts.googleapis.com">
   <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
   <link href="https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600;700&family=Crimson+Pro:ital,wght@0,400;0,700;1,400&family=DM+Mono:wght@400;500&display=swap" rel="stylesheet">
   ```

4. Render it full-bleed:

   ```jsx
   import CrusaderTheme from './themes/crusader/CrusaderTheme';

   export default function App() {
     return (
       <div style={{ position: 'relative', width: '100vw', height: '100vh' }}>
         <CrusaderTheme crossSrc="./crusader2.jpg" />
       </div>
     );
   }
   ```

## Cross backdrop — why two layers

The cross uses **two** stacked elements:

- `.cr-cross-bg` — the actual `<img>` with `mix-blend-mode: multiply`. The
  source image has a white background; multiply blend against the dark
  charcoal body color makes that white drop out, leaving only the cross.
- `.cr-cross-glow` — a separate radial-gradient div with `mix-blend-mode:
  screen` and a pulse animation. Screen blend lets red **add** brightness
  against the dark background. Putting the pulse on the cross itself (with
  multiply) would mute the brightness delta and not be visible.

The cross is intentionally **off-center right** (transform translateX 18% past
the right edge) so the cross center sits on the right ~75% of the viewport,
with content reading over the left side. Sized at `65vh / max-width 75vw` so
it doesn't overflow on mobile and visually shift to the wrong side.

## Pass card recipe — forged weathered metal

This is the most distinctive part of the theme. Each `.cr-card` layers:

1. **Rust spots** — four radial gradients in the corners (warm browns +
   asymmetric sizes for organic feel)
2. **Edge wear vignette** — darker radial at 50% 50% darkening the rim
3. **Scratched diagonal grain** — repeating-linear-gradient at 112deg with
   thin dark stripes
4. **Base metal** — linear-gradient at 155deg (lit from upper-left) with four
   stops from rgba(62,52,40) to rgba(24,20,14)
5. **Multi-axis shadows** for weight: top edge highlight + bottom recess +
   outer drop + faint red blood-rim
6. **Sharp corners** — `border-radius: 0`

States change the rust palette and animations:
- `.cr-card--next` adds a red-tinted beacon pulse (`cr-beacon`)
- `.cr-card--ip` (in-progress) swaps to green-olive rust + green border
- `.cr-card--done` desaturates 65%, drops opacity to 78%

## Motion inventory

All CSS animations, desynced so the screen "breathes":

| element                     | duration | what                                      |
|-----------------------------|----------|-------------------------------------------|
| `.cr-cross-glow`            | 3.0s     | red heartbeat pulse + scale 0.9 → 1.08    |
| header underline gradient   | 7.0s     | opacity + height blur sweep               |
| `.cr-logo span` "CHAIN"     | 5.0s     | red text-shadow glow                      |
| `.cr-card--next`            | 4.0s     | rust-red beacon box-shadow breath         |
| `.cr-card--next .letter`    | 4.0s     | letter color + text-shadow pulse          |

## Color tokens

If you extract to a stylesheet:

```css
--cr-bg-0:        #1a1612;   /* dark warm charcoal */
--cr-bg-card:     #221d17;
--cr-bg-input:    #2a241c;
--cr-text-strong: #d8c8a8;   /* warm parchment */
--cr-text-body:   #9a8e72;
--cr-text-mute:   #7a6e58;
--cr-red:         #a82828;
--cr-red-hi:      #c83838;
--cr-red-bright:  #e84040;
--cr-bronze:      #8a7048;
--cr-bronze-hi:   #a89668;
--cr-green:       #6a8a3a;
--cr-green-hi:    #9ab06a;
```

## What's "not quite right" (open feedback)

Areas the theme has felt off and would be revisited in a redesign:

- **Cross feels separate from the design** — sits behind everything but doesn't
  visually integrate with the rust-metal cards. Could be tied together via
  shared color cast or by having the cross interact with the cards (shadow
  on cards from cross direction, etc.).
- **Red-on-red** can read as alarming rather than martial. Maybe a temperate
  shift to more muted oxblood + brighter gold accents.
- **Cinzel everywhere** is heavy. Maybe Cardo or Crimson Pro for body, Cinzel
  reserved for titles only.
- **Pass cards already feel finished** (3.21.0) — they're the strongest part
  of the current implementation and worth keeping in any redesign.

## Notes for porting back to single-file `index.html`

- The CSS in this file is roughly 1:1 with the `body.theme-crusader { ... }`
  block in `index.html` (~rad 2913–3356). If the design changes here, port
  back by replacing that block.
- The `#crusader-cross-bg`, `#crusader-cross-img`, and `#crusader-cross-glow`
  elements are global in `index.html` (display:none by default) and only
  shown when `body.theme-crusader` is active. In the .jsx version they're
  scoped to `.cr-root` so no global elements are required.
