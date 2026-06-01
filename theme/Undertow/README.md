# Undertow — The Chain light theme

**Status: In production.**

## Atmosphere

Suspended mid-water, sinking, looking *up* at a bright dappled surface you
can't reach. Cold "sun-from-below" palette, static caustic light + light
shafts, and bubbles that erupt in cinematic "gasps" (a drowning exhale) then
settle. Clinical and severe, like a dive computer.

## Files

- `UndertowTheme.jsx` — reference React component (design origin, not
  shipped). Contains `CausticLayer`, `Waterline`, `BubbleField`, `GaugeSigil`,
  `DropGlyph`.

## Design tokens

```
--ut-surface:  #e9f3f7   /* cool white-blue — water near the surface  */
--ut-deep:     #a3bcc7   /* steel blue — the water below              */
--ut-text:     #2b4450   /* body text                                 */
--ut-strong:   #102430   /* headings (near-black navy)                */
--ut-mute:     #6f8c98   /* secondary labels                         */
--ut-navy:     #163763   /* ABYSS NAVY — primary action / accent     */
--ut-navy-hi:  #214b86   /* lighter navy (top of gradients)          */
--ut-rust:     #9e4a45   /* LOG OUT, WARM-UP (sparing use)           */
--ut-line:     rgba(18,48,90,0.16)
--ut-glass:    rgba(255,255,255,0.52)
```

Body background:
```css
radial-gradient(ellipse 120% 60% at 50% -8%, #f6fbfd 0%, rgba(246,251,253,0) 46%),
linear-gradient(180deg, #e9f3f7 0%, #d4e4ea 42%, #b7ccd5 78%, #a3bcc7 100%)
```

Navy gradient (LOG / DONE / active pill): `linear-gradient(180deg, #214b86, #163763)`

Tag accent colors:
- TIMED: `#0d6b7a` (teal)
- BW+ / RAMP: `#97702a` (ochre)
- UNILATERAL: `#3f7a5c` (kelp)
- SINGLES: `#214b86` (deep navy)

## Typography
- **Archivo** (Google) — display + UI. 800 for title, 700 for names, 400–600 body.
  Tight tracking (−0.02em to −0.025em).
- **DM Mono** (Google) — all technical text: meta, tags, set numbers, labels.
  Tracking 0.1–0.2em, uppercase.

## Background motion

Three stacked layers inside `#undertow-bg` (position:fixed, isolation:isolate):

1. **CausticLayer** — static SVG with `feTurbulence` filter + surface bloom radial
   gradient + three light-shaft polygons. Uses `mix-blend-mode:screen` on `<g>`
   elements inside the SVG. **KEEP STATIC** — animation of `baseFrequency`
   stutters badly (filter re-rasterizes every frame).

2. **Waterline** — CSS `::before`/`::after` on `.ut-waterline`, 44s animation
   creeping from 92% → 6% top, then reset.

3. **BubbleField** — canvas particle system. Gasps of 16–28 bubbles from one
   point near the bottom, fast upward rush → deceleration → slow terminal rise.
   2–4 pulse struggle then 2.6–5.2s still water. Each bubble: faint white body +
   dark navy refractive rim `rgba(24,56,92,a*0.5)` + bright specular highlight.
   **Dark rim is essential** — white rim is invisible on light water.

Ambient Effects toggle (Settings) controls bubbles. Caustics + waterline always on.

## Known pitfalls

**`isolation:isolate` must stay on `#undertow-bg`**, not on `body` — Android
Chrome stacks `mix-blend-mode:screen` against the white viewport if isolation is
on the body element (gives a white/washed-out screen). The fix used here (scoped
to the bg wrapper div) avoids this.

**Do not add `position:relative` to `body.theme-undertow header`** — kills sticky.
The header's z-index is already set via the base sticky rules.

**`btn-chain-edit` override required** — hardcoded dark colors `#888`/`var(--white)`
are invisible on the light water background. Override exists at
`body.theme-undertow .btn-chain-edit`.

## In-app implementation

CSS: `body.theme-undertow` block in `index.html` (~line 2907, before Crusader).
JS: `mountUndertowBg()` / `unmountUndertowBg()` / `_startUndertowBubbles()`.
Hook: `applyTheme()` + `initTheme()` + `toggleAmbientEffects()`.
