# Night City Theme — "The Chain" training app

**Status: Full cyberpunk treatment.** The most aggressive theme in the project
— maxes out chromatic aberration, asymmetric clip-paths, CRT scanlines, and
triple-tone neon palette. Either you love it or you switch back to Iron.

## Atmosphere

Late-night arcade meets terminal-overlay UI. Deep void-purple background
(`#08010f`) with horizontal scanlines, vertical RGB noise, and double radial
neon glows (magenta from top, cyan from bottom-right). Every text element
has either chromatic-aberration RGB-shift or neon text-shadow. Orbitron
display in 900 weight, JetBrains Mono for numbers.

## Files

- `NightCityTheme.jsx` — single-file React component (no deps beyond React)

## Setup

1. Copy `NightCityTheme.jsx` into your app.
2. Make sure these Google Fonts are loaded somewhere in your `<head>`:

   ```html
   <link rel="preconnect" href="https://fonts.googleapis.com">
   <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
   <link href="https://fonts.googleapis.com/css2?family=Orbitron:wght@400;500;600;700;900&family=Space+Grotesk:wght@400;500;700&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">
   ```

3. Render full-bleed:

   ```jsx
   import NightCityTheme from './themes/nightcity/NightCityTheme';

   export default function App() {
     return (
       <div style={{ position: 'relative', width: '100vw', height: '100vh' }}>
         <NightCityTheme />
       </div>
     );
   }
   ```

## The clip-path geometry — Night City's signature

Almost every container uses an asymmetric `clip-path: polygon(...)` cut. The
recurring patterns:

- **Top bar** — bottom edge slopes diagonally (60px chamfer on each end)
- **Bottom nav** — mirror of the top bar (chamfer on top edge)
- **Pass card** — 8-point polygon with corner cuts of different sizes (24px
  top-right, 60px bottom-right, 8px on others) — deliberately asymmetric
- **Primary button** — parallelogram (12px diagonal cuts on both vertical
  edges)
- **Tags** — small parallelograms (6px diagonal cuts)
- **PR card** — 6-point polygon with mitered top-left + bottom-right

Each polygon is intentionally hand-tuned, not symmetric. If you change one,
recompute the others to keep the asymmetric language consistent.

## RGB chromatic aberration

The `.nc-logo` and `.nc-title` use a three-stack text-shadow to simulate the
print-misregistration look:

```css
text-shadow:
  -2px 0 0 rgba(255,45,120,0.7),   /* magenta offset left */
   2px 0 0 rgba(0,255,240,0.7),    /* cyan offset right */
   0 0 12px rgba(255,230,0,0.4);   /* yellow glow */
```

The logo's RGB-offset directions swap every 6 seconds (`nc-chromatic-shift`
animation) which creates a subtle "screen interference" pulse.

## CRT flicker overlay

`<NightCityCRT />` is a full-viewport `<div>` at `z-index: 9999` (above
everything, including modals) with a linear-gradient and step-flicker
animation:

```css
animation: nc-crt-flicker 4s steps(2) infinite;
```

The `steps(2)` makes the opacity jump rather than fade — that's the
critical detail that sells the broken-CRT feel. The flicker frame pattern
is asymmetric (3% drop at frame 3, then quick recover; 30% drop at frame
93) so it never feels regular.

## Motion inventory

| element              | duration | what                                          |
|----------------------|----------|-----------------------------------------------|
| `.nc-crt`            | 4s       | CRT flicker (stepped, irregular)              |
| `.nc-logo`           | 6s       | RGB chromatic shift                           |
| sync dot ok          | 2s       | scale + cyan triple-pulse                     |
| `.nc-card--next`     | 2.4s     | magenta + cyan box-shadow glow alternation    |
| chain progress fill  | 3s       | rainbow gradient sweep (not shown in mockup)  |

## Color tokens

```css
--nc-bg-0:        #08010f;   /* near-black with purple cast */
--nc-bg-card:     rgba(20,5,40,0.6);
--nc-text:        #f5f0ff;
--nc-text-mute:   #7a55a0;
--nc-yellow:      #ffe600;   /* primary "red" mapped — acid yellow */
--nc-magenta:     #ff2d78;   /* "gold" mapped — magenta accent */
--nc-cyan:        #00fff0;   /* "green-bright" mapped — cyan tertiary */
```

Note: this theme deliberately remaps the semantic vars so `var(--red)` =
yellow, `var(--gold)` = magenta, `var(--green-bright)` = cyan. Keep that
in mind if porting back — the role/color mapping is preserved.

## Notes for porting back to single-file `index.html`

- Night City's CSS lives in `body.theme-nightcity { ... }` (~rad 487–996 in
  `index.html`).
- The CRT overlay uses `body.theme-nightcity::before` at `z-index: 9999`.
  In this .jsx it's a child element. Make sure modals etc. have higher
  z-index if they need to render above the flicker.
- The semantic-var remap (yellow as "red", etc.) means you don't need to
  rewrite all the `var(--red)` references — they just take on the new
  meaning. Same trick used by Void and Daylight in different ways.
