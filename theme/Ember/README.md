# Ember Theme — "The Chain" training app

**Status: Reference dark theme with breathing animation.** Industrial forge
aesthetic. The first theme in the project to introduce the "breathing pulse"
pattern that newer themes (Obsidian, Cosmic Horror, Crusader) all reuse.

## Atmosphere

Hot metal, glowing forges, dim industrial spaces. Charcoal-black background
warmed by molten-orange radial glow rising from the bottom edge. Brass yellow
PR accents, cooling-lava green for "done" affordances, and floating ember
particles drifting upward across the entire viewport.

Heavy Rajdhani display type (weight 900) for the steel-stamp feel, Space
Grotesk for body, DM Mono for numbers.

## Files

- `EmberTheme.jsx` — single-file React component (no deps beyond React)

## Setup

1. Copy `EmberTheme.jsx` into your app.
2. Make sure these Google Fonts are loaded somewhere in your `<head>`:

   ```html
   <link rel="preconnect" href="https://fonts.googleapis.com">
   <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
   <link href="https://fonts.googleapis.com/css2?family=Rajdhani:wght@400;500;600;700;900&family=Space+Grotesk:wght@400;500;700&family=DM+Mono:wght@400;500&display=swap" rel="stylesheet">
   ```

3. Render full-bleed:

   ```jsx
   import EmberTheme from './themes/ember/EmberTheme';

   export default function App() {
     return (
       <div style={{ position: 'relative', width: '100vw', height: '100vh' }}>
         <EmberTheme />
       </div>
     );
   }
   ```

## Drifting embers — pure CSS, no canvas

The ember particles are NOT a canvas — they're five radial-gradient sprites
on a single `<div className="em-particles" />` element. The trick:

```css
background-size: 100% 200%;
animation: em-drift 18s linear infinite;

@keyframes em-drift {
  0%   { background-position: 0% 100%; }
  100% { background-position: 0% -100%; }
}
```

The background is sized 2× viewport-tall, then `background-position` slides
from `0% 100%` (sprites at the bottom of the doubled canvas) to `0% -100%`
(off the top). 18 seconds for a full sweep — slow enough to feel ambient,
fast enough to register as motion.

Trade-offs vs canvas (Obsidian's approach):
- ✅ Zero JS, zero rAF, zero ResizeObserver, no DPI handling
- ✅ Trivially toggleable (just don't render the element)
- ❌ Sprites are at fixed positions — no random spawn, no per-particle physics
- ❌ Only 5 visible "particles" at any time vs Obsidian's 32

For a richer feel, port Obsidian's `<ObsidianEmbers />` canvas component
into Ember and use that instead.

## Motion inventory

All CSS animations:

| element             | duration | what                                          |
|---------------------|----------|-----------------------------------------------|
| `.em-particles`     | 18s      | embers drift upward (linear)                  |
| header underline    | 4s       | opacity + blur sweep (`em-pulse`)             |
| `.em-logo span`     | 5s       | red text-shadow heat-glow                     |
| `.em-card--next`    | 3s       | molten box-shadow breath (`em-next-forge`)    |
| `.em-card--next` letter | 3s   | letter color + shadow heat-shimmer            |
| chain progress fill | 4s       | molten-flow sweep (not shown in mockup)       |
| sync dot syncing    | 1s       | red ember pulse (uses shared `em-pulse`)      |

## Color tokens

```css
--em-bg-0:        #0c0600;   /* base — near-black with warm hint */
--em-bg-card:     #150a02;   /* card surfaces */
--em-bg-card-hot: #1f0c02;   /* next-up card (warmer) */
--em-text:        #ffe8cc;   /* primary — warm cream */
--em-text-body:   #aa7040;   /* secondary text — tarnished bronze */
--em-text-mute:   #664422;
--em-orange:      #ff6a00;   /* signature — molten ember */
--em-orange-hi:   #ff8c1a;
--em-orange-deep: #cc3300;
--em-brass:       #ffcc00;   /* PR / UNI tag — brass yellow */
--em-green:       #a0cc40;   /* in-progress / BW tag — cooling lava green */
```

## Notes for porting back to single-file `index.html`

- Ember's CSS lives in `body.theme-ember { ... }` (~rad 1293–1806 in
  `index.html`). It's one of the largest theme blocks — Ember was the most
  thoroughly-styled theme before the newer ports (Obsidian/Cosmic Horror).
- The ember particles in `index.html` use `body.theme-ember::before` —
  fixed-position, animated background-position. In this .jsx they're a
  child element since `::before` on body doesn't work in component scope.
- The sync dot's `syncing` animation reuses `@keyframes em-pulse` (the
  header underline animation), keeping the keyframe count low.
