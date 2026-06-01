# Understory — The Chain light theme

**Status: In production.**

## Atmosphere

Rainforest floor looking up. Warm green gradient, dappled canopy sunlight
drifting as soft flecks, and vines that climb slowly upward unfurling leaves
and tendrils — the chain as living growth. Deep sap-green (`#1f4226`) is
commitment; LOG/DONE root you to the forest floor.

Sibling to Undertow (same "light you reach for" tension, opposite palette:
warm green vs cold blue). Organic humanist typography.

## Design tokens

```
--us-surface:  #e9f2db  /* warm pale green */
--us-deep:     #a6c690  /* deeper canopy */
--us-text:     #234a2b  /* body text */
--us-strong:   #143018  /* headings */
--us-mute:     #6f8a69  /* secondary */
--us-forest:   #1f4226  /* DEEP FOREST — primary action */
--us-sap:      #2f5e37  /* LOG/DONE gradient top */
--us-rust:     #c05a33  /* LOG OUT / WARM-UP (sparing) */
--us-line:     rgba(31,66,38,0.14)
--us-glass:    rgba(252,255,247,0.5)
```

Body background:
```css
radial-gradient(ellipse 120% 58% at 50% -8%, #f8fcef 0%, rgba(248,252,239,0) 48%),
linear-gradient(180deg, #e9f2db 0%, #d3e4c3 40%, #bcd6a9 74%, #a6c690 100%)
```

Forest gradient (LOG / DONE / active): `linear-gradient(180deg, #2f5e37, #1c3c22)`

Tag accent colors:
- TIMED (fern): `#2f7a4a`
- BW+ / RAMP (ochre): `#8a6a26`
- UNILATERAL (moss): `#4a7a3f`
- SINGLES (deep): `#2f5e37`

## Typography
- **Bricolage Grotesque** (Google) — display + UI. 800 for title, 700 for names.
  Organic humanist grotesque, tight negative tracking.
- **Spline Sans Mono** (Google) — all technical text: meta, tags, set numbers.
  Tracking 0.1–0.18em, uppercase.

## Background layers

Three stacked layers inside `#understory-bg` (position:fixed, isolation:isolate):

1. **CanopyDapple** — static SVG with `feTurbulence` leaf-shadow (multiply blend,
   fades with depth) + five CSS `.us-fleck` spans that drift with keyframe
   animations (screen blend). STATIC SVG — keep it that way.

2. **VineField** — canvas particle system. Up to 5 vines grow from the bottom,
   meandering upward with sinusoidal sway, unfurling leaves at intervals and a
   tendril curl at the tip. Each vine: growing → mature (hold) → fading.
   **World-coordinates** (scroll with content) — same pattern as Undertow 3.44.4.
   Ambient Effects toggle controls vines. Canopy + flecks always on.

## LOG button

Organic leaf shape: `border-radius: 3px 50% 3px 50%` (sharp TL/BR, round TR/BL).
Diagonal midrib highlight via `::after`. Requires `clip-path:none` to override
Iron's hexagon. `position:relative; overflow:hidden` for the ::after.

## Header tendril

`body.theme-understory header::after` — a 1.5px vine that hangs from the header
bottom-right and sways. Requires `overflow:visible` on header.

## Known pitfalls

**Do not add `position:relative` to `body.theme-understory header`** — kills sticky.
Header already set with `overflow:visible` for the hanging tendril ::after.

**selFg must be `#f3f8ea`** — `--red = #1f4226` (dark forest) and `--white = #143018`
(near black) are BOTH dark. All selected states in renderData() use `selFg` variable
which is explicitly set to `#f3f8ea` for understory.

**toast + add-ex-confirm** need `color:#f3f8ea` CSS override (same pattern as Undertow).

## In-app implementation

CSS: `body.theme-understory` block in `index.html` (after Undertow, before Crusader).
JS: `mountUnderstoryBg()` / `unmountUnderstoryBg()` / `_startUnderstoryVines()`.
Hook: `applyTheme()` + `initTheme()` + `toggleAmbientEffects()` + `isUnderstory` in selFg.
