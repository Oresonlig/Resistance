# Obsidian Theme — "The Chain" training app

Dark-fantasy theme for the training session screen. Drop-in React component with
a self-contained ember canvas backdrop, breathing gold accents, and a gothic
serif type system.

## Files
- `ObsidianTheme.jsx` — single-file React component (no deps beyond React). Exports the screen and the ember canvas.

## Setup

1. Copy `ObsidianTheme.jsx` into your app (e.g. `src/themes/obsidian/`).
2. Make sure these Google Fonts are loaded somewhere in your `<head>`:

   ```html
   <link rel="preconnect" href="https://fonts.googleapis.com">
   <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
   <link href="https://fonts.googleapis.com/css2?family=Cinzel:wght@400;500;600;700&family=Cardo:ital,wght@0,400;0,700;1,400&display=swap" rel="stylesheet">
   ```

3. Render it full-bleed:

   ```jsx
   import ObsidianTheme from './themes/obsidian/ObsidianTheme';

   export default function App() {
     return (
       <div style={{ position: 'relative', width: '100vw', height: '100vh' }}>
         <ObsidianTheme />
       </div>
     );
   }
   ```

   The component uses `position: absolute; inset: 0`, so its parent needs to be
   positioned and sized.

## Wiring real data

`ObsidianTheme.jsx` ships with the screenshot's content hard-coded. To wire it
up to your training model, replace the static strings/markup near the bottom of
the component. Search for `"Dead Hang"`, `"BACK · BICEPS"`, etc.

A clean refactor would split it into smaller components:

```
ObsidianTheme
  ├── ObsidianTopBar
  ├── ObsidianTitle({ name, trial, round })
  ├── ObsidianNav({ blocks, activeId })
  ├── ObsidianExerciseCard({ exercise })
  ├── ObsidianWorkSet({ set })
  ├── ObsidianExerciseRow({ exercise, collapsed })
  └── ObsidianTabBar({ active })
```

All `.ob-*` classes are stable selectors — feel free to compose against them.

## Ember canvas

`<ObsidianEmbers count={32} />` is a separate canvas component placed at
`z-index: 0` inside the theme root with `mix-blend-mode: screen`. Tune density
via the `count` prop:

- Desktop: 32 (default)
- Mobile / battery-conscious: 16
- Off entirely: don't render it

The canvas auto-sizes via `ResizeObserver` and respects `devicePixelRatio` (capped at 2).

## Motion inventory

All animations are CSS, desynced so the screen "breathes" rather than ticks:

| element                | duration | what                                          |
|------------------------|----------|-----------------------------------------------|
| sigil SVG (header)     | 4.2s     | opacity + drop-shadow pulse                   |
| sync dot               | 2.6s     | brightness blink                              |
| THE CHAIN h1 gradient  | 8.0s     | gold shimmer sweep                            |
| section divider ✦      | 3.4s     | scale + glow pulse                            |
| active medallion       | 4.6s     | box-shadow breath                             |
| LOG button             | 2.8s     | gold glow breath + 5.4s shimmer sweep         |
| COMPLETE button        | 5.2s     | gold glow breath                              |
| active tab underline   | 3.2s     | glow pulse                                    |
| ember particles        | rAF      | rising + sway + fade-in/fade-out (32 sprites) |

## Color tokens

If you extract to a stylesheet:

```css
--ob-bg-0:        #0a0805;   /* base */
--ob-bg-card:     rgba(40, 28, 12, 0.55);
--ob-text-mute:   #8a7a58;
--ob-text-body:   #c0b39a;
--ob-text-strong: #f0d99c;
--ob-gold:        #c9a35a;
--ob-gold-hi:     #f8e6b0;
--ob-gold-lo:     #4a3a18;
--ob-ember:       #d68262;
--ob-ember-deep:  #a8442e;
--ob-green:       #9ab57a;
```

## Notes for porting

- `isolation: isolate` on `.ob-root` is required for `mix-blend-mode: screen` on the ember canvas. Don't drop it.
- The gold-gradient title uses `background-clip: text` — supported everywhere modern but degrades to a flat color in old browsers.
- If your app already has a scroll container, remove `.ob-scroll`'s `overflow: auto` and let the parent scroll instead.
- The bottom tab bar assumes the screen is the full viewport height; if you embed inside a larger layout, you'll want to lift `.ob-tabs` out or stop using `flex: 1` on `.ob-scroll`.
