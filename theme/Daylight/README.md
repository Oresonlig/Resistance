# Daylight Theme — "The Chain" training app

**Status: WIP — candidate for replacement.**

Currently shipped as "Daylight · WIP" in the app's theme picker. This is one
of the project's earliest themes — clean and functional but dated relative
to newer work (Arctic Terminal, Obsidian, Cosmic Horror). Niklas: *"OG basic
tema från projektets början, mer eller mindre utdaterat, ska ersättas i
framtiden av ett bättre ljust tema."*

This .jsx exists primarily to support iteration in Claude Design on what a
replacement light theme could look like.

## Atmosphere

Paper-white. Charcoal text on near-white background, deep brand red accent,
clean Inter body type, Bebas Neue display, JetBrains Mono for numbers.
Subtle drop shadows on cards, no textures, no gradients beyond the chain
progress bar.

## Files

- `DaylightTheme.jsx` — single-file React component (no deps beyond React)

## Setup

1. Copy `DaylightTheme.jsx` into your app.
2. Make sure these Google Fonts are loaded somewhere in your `<head>`:

   ```html
   <link rel="preconnect" href="https://fonts.googleapis.com">
   <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
   <link href="https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">
   ```

3. Render full-bleed:

   ```jsx
   import DaylightTheme from './themes/daylight/DaylightTheme';

   export default function App() {
     return (
       <div style={{ position: 'relative', width: '100vw', height: '100vh' }}>
         <DaylightTheme />
       </div>
     );
   }
   ```

## Motion inventory

None. Daylight is fully static. If iterated, candidates: subtle pulse on
the next-up card border-glow, or a slow shimmer on the chain progress fill.

## Color tokens

```css
--dl-bg-0:      #fafaf7;   /* paper white */
--dl-bg-card:   #ffffff;   /* card surfaces */
--dl-bg-saved:  #f0f7ec;   /* saved-state ex-block, completed pass-card-ip */
--dl-bg-done:   #f0eeea;   /* done-state pass card */
--dl-text:      #0e1418;   /* primary */
--dl-text-mid:  #666;
--dl-text-mute: #888;
--dl-red:       #c0392b;   /* brand red */
--dl-green:     #2a7a3a;   /* in-progress, BW tag, DONE button */
--dl-gold:      #a8830a;   /* PR / RAMP tag */
--dl-border:    #e0dcd0;
--dl-border-hi: #d0ccc0;
```

## What's "not quite right" (open feedback)

Reasons Daylight is flagged WIP and a candidate for replacement:

- **Feels generic.** Pure white + black + red is the safe choice — there's no
  identity beyond "light mode of Iron." Arctic Terminal proves a light theme
  can have its own atmosphere; Daylight currently doesn't.
- **The display type is heavy on white.** Bebas Neue works on dark
  backgrounds where it reads as raw industrial type, but on white it looks
  like an old gym poster.
- **No texture or depth.** Everything is the same plane — no shadows beyond
  a 1px subtle shadow on cards, no background interest.
- **JetBrains Mono is a curious choice for body data.** Heavier than DM Mono
  and reads almost as a display type in small sizes.

Possible directions for a replacement (just notes — Niklas decides):

- A "morning" theme — warm white with subtle paper grain, sepia accents,
  serif display (think: pre-WW2 athletic almanac)
- A "minimalist editorial" theme — large headlines, narrow body, lots of
  whitespace, single brand accent (think: New Yorker workout)
- Keep the cool/clinical direction but with a distinctive color (cobalt
  blue? deep forest green?) instead of the borrowed brand red

## Notes for porting back to single-file `index.html`

- Daylight's CSS lives in `body.theme-daylight { ... }` (~rad 2522–2910 in
  `index.html`). Includes two separate trailing sections (`DAYLIGHT SELECT
  FIX`, `DAYLIGHT DONE CARD`) that handle iOS dropdown and done-card
  overrides — those are scoped into the main rule set in this .jsx via
  `.dl-card--done`.
- The light-theme inversion pattern (`--black: paper`, `--white: dark text`)
  is documented in `feedback_light_themes.md` — preserve it in any
  replacement light theme to avoid the "white-on-white text" trap.
