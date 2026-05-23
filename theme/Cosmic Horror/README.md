# Cosmic Horror Theme — "The Chain" training app

Void as biological alien organism. Big organic vein branches grow from
top-right and bottom-left across the screen, pulses traveling along them. An
eye-sigil watches from the header, its pupil slowly dilating. Asymmetric
organic blob shapes throughout — no rectangles, no breathing glows.

Pairs italic Cormorant Garamond with Cormorant SC small caps and IBM Plex Mono
for technical data. Keeps the original Void app's copy verbatim.

## Files
- `CosmicHorrorTheme.jsx` — single-file React component (no deps beyond React).
  Exports the screen, the vein background, and the glyph SVG components.

## Setup

1. Copy `CosmicHorrorTheme.jsx` into your app (e.g. `src/themes/cosmic-horror/`).
2. Make sure these Google Fonts are loaded somewhere in your `<head>`:

   ```html
   <link rel="preconnect" href="https://fonts.googleapis.com">
   <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
   <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;0,700;1,300;1,400;1,500&family=Cormorant+SC:wght@400;500;600;700&family=IBM+Plex+Mono:wght@300;400;500&display=swap" rel="stylesheet">
   ```

3. Render full-bleed:

   ```jsx
   import CosmicHorrorTheme from './themes/cosmic-horror/CosmicHorrorTheme';

   export default function App() {
     return (
       <div style={{ position: 'relative', width: '100vw', height: '100vh' }}>
         <CosmicHorrorTheme />
       </div>
     );
   }
   ```

   The component uses `position: absolute; inset: 0`, so its parent needs to be
   positioned and sized.

## Wiring real data

`CosmicHorrorTheme.jsx` ships with hard-coded screen content. To wire it to
your training model, search for `"Dead Hang"`, `"BACK HEAVY + BICEPS"`, etc.
and replace with props or context. A clean refactor:

```
CosmicHorrorTheme
  ├── CosmicTopBar
  ├── CosmicTitle({ name, sessionsDone, totalSessions, round })
  ├── CosmicNav({ blocks, activeId })
  ├── CosmicExerciseCard({ exercise })
  ├── CosmicWorkSet({ set })
  ├── CosmicExerciseRow({ exercise, collapsed })
  └── CosmicTabBar({ active })
```

All `.ch-*` classes are stable selectors.

## Vein background

`<VeinBackground />` is a pure SVG component, no canvas. The vein paths are
**procedurally generated** — not hand-authored bezier curves. A recursive
walker (`generateVein`) draws short line segments with random angle jitter,
forking off thinner sub-branches that recurse to depth 0. The result is
fractal, jagged, vein-like — not a smooth-curving "river".

Four call sites: two main trunks (top-right corner, bottom-left corner) and
two secondary clusters for density. Each path tapers — `strokeWidth` and
`opacity` scale with depth so trunks are thick and capillaries fade out.

The two main trunks (depth=3 paths) get a traveling pulse: `pathLength="1"` +
`stroke-dasharray="0.04 1"` puts a 4%-long bright segment on the path that
loops via animated `stroke-dashoffset`.

Positioned at `z-index: 0` inside `.ch-root` with `mix-blend-mode: screen` —
brightens dark backgrounds without obscuring content.

To customize:
- **Density** — add/remove `generateVein()` calls in `VeinBackground`. Each
  call typically produces 20–30 paths after recursive branching.
- **Reach** — bump the trunk `segs` argument (currently 18) for longer
  branches that traverse more of the screen.
- **Chaos** — bump the angle jitter inside `walk` (`0.55 + (3 - depth) * 0.2`)
  for more zigzag, or lower for straighter branches.
- **Color** — base `stroke` is `#3a6a60`. Pulse stroke is `#aee8d8`. Both can
  be tuned to taste.
- **Pulse speed** — `animationDuration` on the two trunk pulse `<path>`s.
- **Determinism** — each `generateVein()` call takes a seed; same seed → same
  shape across renders (used via `useMemo`). Change seeds for different
  branching patterns.

## Glyphs

`<EyeSigil />` is an organic eye with a slit pupil that slowly dilates (6.2s).
The almond shell is asymmetric on purpose — top and bottom curves don't mirror.

`<MiniGlyph />` is a tiny inline elliptical "eye" for the divider center.

Both stroke with `#7fc8b4` (the brand teal-aquamarine).

## Motion inventory

| element                | duration  | what                                          |
|------------------------|-----------|-----------------------------------------------|
| vein pulses (2 trunks) | 2.6–2.8s  | bright segment travels along each trunk path  |
| eye pupil              | 6.2s      | vertical dilation                             |
| sync dot               | 3.2s      | brightness blink                              |
| divider line           | 14s       | wavy gradient slide (both directions)         |
| active tab fang        | 4.2s      | opacity pulse                                 |

The LOG, DONE, and active-section badges DO NOT pulse/breathe — they're static
organic blob shapes. The menace comes from shape language and the pulsing
veins, not from constant glowing.

## Color tokens

If you extract to a stylesheet:

```css
--ch-bg-0:        #03080a;   /* base */
--ch-bg-card:     rgba(10, 30, 28, 0.7);
--ch-text-mute:   #7a948c;
--ch-text-body:   #c8d4ce;
--ch-text-strong: #e8f7f0;
--ch-teal:        #7fc8b4;   /* primary accent */
--ch-teal-hi:     #aedcd0;
--ch-teal-lo:     #2a4a44;
--ch-blood:       #a8424c;   /* warning / important (matches original Void) */
--ch-amber:       #d8b878;   /* RAMP / BW+ tag */
--ch-blue:        #88c4e0;   /* TIMED tag */
--ch-green:       #bedab0;   /* UNILATERAL tag */
```

## Notes for porting

- `isolation: isolate` on `.ch-root` is required for `mix-blend-mode: screen`
  on the vein SVG. Don't drop it.
- The vein SVG uses `pathLength="1"` — supported in all modern browsers but
  can be polyfilled by computing real path lengths if you need IE11.
- Asymmetric `border-radius: A B C D / E F G H` syntax (one value per corner,
  X/Y separately) is what gives the organic blob shapes. Modern browsers all
  support it.
- If your app already has a scroll container, remove `.ch-scroll`'s
  `overflow: auto` and let the parent handle it.
- Bottom tab bar assumes the screen is full viewport height. Embedding inside
  a larger layout? Lift `.ch-tabs` out or drop `flex: 1` on `.ch-scroll`.

## Difference from Obsidian theme

These two themes share the underlying screen structure but couldn't be more
visually different. They should never read as variants of the same theme:

| dimension      | Obsidian (warm)                   | Cosmic Horror (cold alien)        |
|----------------|-----------------------------------|-----------------------------------|
| Bg base        | `#0a0805` warm-black              | `#03080a` blue-black              |
| Accent         | gold `#c9a35a`                    | teal `#7fc8b4`                    |
| Warning        | ember red `#a8442e`               | blood burgundy `#a8424c`          |
| Display font   | Cinzel (carved stone)             | Cormorant SC + Cormorant Garamond |
| Body font      | Cardo                             | Cormorant Garamond italic         |
| Mono           | (none)                            | IBM Plex Mono                     |
| Background fx  | rising warm ember particles       | growing organic vein branches     |
| Bg motion      | particles drift up + fade         | bright pulse travels along veins  |
| Shape language | rounded medallions, rectangles    | asymmetric organic blobs          |
| Active section | rounded medallion + diamond ends  | organic blob outline              |
| Card           | square card, corner brackets      | asymmetric blob radii             |
| Primary CTA    | gold breathing + shimmer sweep    | static teal blob, no glow         |
| Complete CTA   | gold breathing                    | static organic capsule            |
| Header sigil   | static heptagon (geometric)       | watching eye with dilating pupil  |
| Tab indicator  | glowing underline                 | downward fang/talon (pulses)      |
| Motion vibe    | constant ambient breathing        | sparse heartbeat + still shapes   |
| Vibe           | dark-fantasy compendium           | biological alien organism         |
