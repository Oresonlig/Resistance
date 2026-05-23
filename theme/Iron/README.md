# Iron Theme — "The Chain" training app

**Status: The original.** First theme of the project. In the app this is the
*default* theme (no body class needed) — it inherits from `:root` and is
applied via `body:not([class*="theme-"])`.

## Atmosphere

Industrial, austere. Dark on dark with a deep red accent (`#c0392b`).
Bebas Neue display type, DM Sans body, DM Mono for numbers. A barely-visible
hexagonal SVG texture pattern across the body and the weight banner — almost
imperceptible until you look for it. Pass cards have a subtle hexagon
"frame" rendered behind the next-up letter via an SVG pseudo-element.

## Files

- `IronTheme.jsx` — single-file React component (no deps beyond React)

## Setup

1. Copy `IronTheme.jsx` into your app.
2. Make sure these Google Fonts are loaded somewhere in your `<head>`:

   ```html
   <link rel="preconnect" href="https://fonts.googleapis.com">
   <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
   <link href="https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:wght@400;500;700&family=DM+Mono:wght@400;500&display=swap" rel="stylesheet">
   ```

3. Render full-bleed:

   ```jsx
   import IronTheme from './themes/iron/IronTheme';

   export default function App() {
     return (
       <div style={{ position: 'relative', width: '100vw', height: '100vh' }}>
         <IronTheme />
       </div>
     );
   }
   ```

## The hex texture — Iron's signature

The hex SVG is inline as a data-URI on `.ir-root` background. It uses
`stroke-opacity: 0.06` so it's nearly invisible — it shows up as a faint
honeycomb shadow only on careful inspection. The weight banner uses a slightly
different, even fainter hex pattern (`0.04` opacity).

The next-up pass letter has a second hex SVG behind it (`opacity 0.5`) at
larger size — this is the most visible hex element in the theme. Sized 54×60
px, centered on the letter.

## Motion inventory

Iron has very little motion — it's a quiet, anchored theme by design.

| element            | duration | what                                |
|--------------------|----------|-------------------------------------|
| sync dot (ok)      | static   | solid green (`#3a9a5a`)             |
| (no breathing animations — Iron is deliberately still)            |

The other themes inherit Iron's `@keyframes pulse` for the sync dot's
`syncing` state, but that animation is global, not theme-specific.

## Color tokens

These are the `:root` defaults in the app — every other theme starts from
these and overrides what it needs.

```css
--black:         #0a0a0a;   /* base body color */
--white:         #f5f0e8;   /* primary text */
--red:           #c0392b;   /* accent — Iron's signature */
--gold:          #b8922a;   /* PR / RAMP tag */
--green-bright:  #3a9a5a;   /* sync ok / BW tag / DONE button */
--gray-mid:      #666;
--gray-light:    #999;

/* PM22 surface variables — 3.32.0 */
--surface-base:     #0d0d0d;
--surface-elevated: #1a1a1a;
--surface-input:    #111;
--surface-saved:    #0a120a;
--surface-deep:     #050505;
--surface-overlay:  rgba(255,255,255,0.03);
--border-subtle:    #2a2a2a;
--border-strong:    #3a3a3a;
```

## Notes for porting back to single-file `index.html`

- Iron's CSS lives in two places in `index.html`:
  - `:root { ... }` at the top (~rad 21) — the base variables every theme
    inherits from
  - The `/* ── IRON THEME ── */` block (~rad 417) with the hex texture
    rules scoped to `body:not([class*="theme-"])`
- This .jsx scopes all Iron-specific rules to `.ir-root` instead. If you
  bring design changes back, port the body/hex-pattern rules into the
  `body:not(...)` block and the variable changes into `:root`.
