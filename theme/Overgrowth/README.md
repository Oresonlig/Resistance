# Overgrowth — The Chain light theme

**Status: In production** (shipped as *Understory* 3.47.0, renamed to **Overgrowth** 3.48.0).

> **Naming:** the user-facing theme name is **Overgrowth**. The internal theme id and
> CSS class are still `understory` / `theme-understory`, and the JS keeps the
> `understory` prefix (`mountUnderstoryBg`, `_startUnderstoryVines`, `#understory-bg`).
> This was deliberate — changing the id would need a migration for existing users'
> saved theme choice. Search the code for `understory`; show it to people as Overgrowth.

## Atmosphere

You lie on your back, bound, and the canopy closes IN over your eyes. Vines creep in
from every edge of the field of view toward the centre and stop in a ring around it —
the periphery overgrows while the middle stays readable. Warm green, dappled canopy
sunlight, pollen drifting up through the light. Deep sap-green (`#1f4226`) is
commitment; LOG/DONE root you to the forest floor.

Sibling to Undertow (same "light you reach for" tension, opposite palette: warm green
vs cold blue). Organic humanist typography.

## Design tokens

```
--us-surface:  #e9f2db  /* warm pale green */
--us-text:     #234a2b  /* body text */
--us-strong:   #143018  /* headings */
--us-mute:     #6f8a69  /* secondary */
--us-forest:   #1f4226  /* DEEP FOREST — primary action */
--us-sap:      #2f5e37  /* LOG/DONE gradient top */
--us-rust:     #c05a33  /* LOG OUT / WARM-UP (sparing) */
--us-bark:     layered repeating-linear-gradients — woody vertical grain on cards
```

Body background (the pale "look up at the sky" gradient — kept light):
```css
radial-gradient(ellipse 120% 58% at 50% -8%, #f8fcef 0%, rgba(248,252,239,0) 48%),
linear-gradient(180deg, #e9f2db 0%, #d3e4c3 40%, #bcd6a9 74%, #a6c690 100%)
```

Forest gradient (LOG / DONE / active): `linear-gradient(180deg, #2f5e37, #1c3c22)`

## Typography
- **Bricolage Grotesque** — display + UI. Organic humanist grotesque.
- **Spline Sans Mono** — all technical text: meta, tags, set numbers. Uppercase.

## Background — `mountUnderstoryBg()` / `_startUnderstoryVines()`

Inside `#understory-bg` (position:fixed, isolation:isolate, NOT on body):

1. **CanopyDapple** — static SVG `feTurbulence` leaf-shadow (multiply) + five CSS
   `.us-fleck` sun-flecks that drift (screen blend). Always on.
2. **VineField (canvas) — VIEWPORT-FIXED.** Vines creep in from every edge toward a
   ring around centre. Edge-weighted density so the middle stays readable. **MAX 25**
   (3.48.0), 15 pre-grown at mount. Plus warm pollen motes drifting up. Gated by the
   Ambient Effects toggle.

   ⚠️ **This overrides the usual world-coordinate rule** (effects normally scroll with
   content). Deliberate: the "vines over your eyes" concept wants to be fixed to the
   screen. On trial — revert to world-coords if it ever feels like a screen overlay.

### Canvas performance (CRITICAL — learned 3.47.2)
The first cut drew every vine *segment* as its own `stroke()` (~11k calls/frame @60fps)
and lagged scrolling on a Samsung S23. The fixed engine is ~10× cheaper:
- **One `stroke()` per vine** (whole path), sway computed inline (no per-frame array).
- **Flat leaf fill** (fillStyle once per vine, no gradient per leaf).
- **Pollen via a pre-rendered sprite + `drawImage`** (not a radial gradient per mote).
- **~30fps cap** + **dpr capped at 1.5** + coarser growth step.

Any future canvas theme should start from this pattern.

## Cards — bark/wood

`.ex-block` / `.pass-card` carry `var(--us-bark)`: layered `repeating-linear-gradient`
vertical fibres over a warm base. Pure gradients (no SVG filter / no blend) so it's
mobile-safe and cheap, and survives the 2-class shorthand overrides on
`.pass-card.open` / `.ex-block.saved`. The app body keeps its pale green sky; only the
cards turn to bark.

## LOG button
Organic leaf shape: `border-radius: 3px 50% 3px 50%`, diagonal midrib via `::after`,
`clip-path:none` to override Iron's hexagon. DONE + Finish mirror the same shape.

## Header tendril
`body.theme-understory header::after` — a vine that hangs from the header and sways.
Needs `overflow:visible` on header. **Never** add `position:relative` to the header
(kills sticky).

## Known pitfalls
- **selFg must be `#f3f8ea`** — `--red` and `--white` are both dark, so all selected
  states in `renderData()` need the explicit light fg.
- **toast + add-ex-confirm** need `color:#f3f8ea` (same dark-on-dark trap).

## Not yet ported (deliberate, deferred for risk/perf)
The gnarled vine-wordmark (`VineTitle`), the fiddlehead logo sigil, and the per-card
climbing-vine — all heavy SVG filters (feTurbulence/feDisplacementMap), want real
mobile perf testing first. See `redesign/` for the Claude Design reference.

## In-app implementation
CSS: `body.theme-understory` block in `index.html` (after Undertow, before Crusader).
JS: `mountUnderstoryBg()` / `unmountUnderstoryBg()` / `_startUnderstoryVines()`.
Hook: `applyTheme()` + `initTheme()` + `toggleAmbientEffects()` + `isUnderstory` selFg.
THEMES entry: `{id:'understory', name:'Overgrowth', cat:'light', class:'theme-understory'}`.
