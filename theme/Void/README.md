# Void Theme — "The Chain" training app

**Status: Intentionally minimal. Spartan is the point.**

Niklas, on whether to expand Void: *"Det får vara som det är, lite spartanskt
är ju grejen."* If Void is iterated in the future, keep it pure. Adding glow,
texture, or color would defeat the theme.

## Atmosphere

Luxury minimalism. Pure black background, white text, gray accents. Playfair
Display italic for display + headings, DM Mono for body and numbers. No
animations. No backgrounds. No textures. The only "color" is the contrast
between paper-white and absolute black.

## Files

- `VoidTheme.jsx` — single-file React component (no deps beyond React)

## Setup

1. Copy `VoidTheme.jsx` into your app.
2. Make sure these Google Fonts are loaded somewhere in your `<head>`:

   ```html
   <link rel="preconnect" href="https://fonts.googleapis.com">
   <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
   <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;1,400;1,700&family=DM+Mono:wght@400;500&display=swap" rel="stylesheet">
   ```

3. Render full-bleed:

   ```jsx
   import VoidTheme from './themes/void/VoidTheme';

   export default function App() {
     return (
       <div style={{ position: 'relative', width: '100vw', height: '100vh' }}>
         <VoidTheme />
       </div>
     );
   }
   ```

## Motion inventory

None. Void has no animations. This is deliberate.

## Color tokens

Void redefines the standard variables in a deliberately blunt way:

```css
--vo-black:   #000;         /* base, header, nav, cards */
--vo-white:   #fff;         /* text, primary buttons, active accent */
--vo-gold:    #aaa;         /* "gold" is just a mid gray */
--vo-green:   #ccc;         /* "green" is a brighter gray */
--vo-gray-1:  #111;         /* card borders */
--vo-gray-2:  #222;         /* nav/topbar borders */
--vo-gray-3:  #444;         /* skip/edit borders */
--vo-gray-4:  #666;         /* secondary text */
--vo-gray-5:  #888;         /* logo accent / pass-letter */
```

The "red" variable in the app is mapped to `#fff` for this theme, which means
modal/danger affordances need to explicitly re-color to `#000` for legibility
(white-on-white otherwise). Watch this in any redesign.

## Tag treatment

All tags (`ramp`, `bw`, `uni`, `timed`) share the same neutral border + muted
gray text. No semantic color differentiation — by design. The tag content is
the signal; the chrome is just rule lines.

## What to NOT add

- Glow effects, drop-shadows, blurs
- Background gradients or textures
- Color accents (red, green, gold — keep them gray)
- Breathing/pulse animations
- Decorative SVG icons

If you find yourself wanting to add any of the above, you're probably building
Iron or Obsidian by mistake.

## Notes for porting back to single-file `index.html`

- Void's CSS lives in `body.theme-void { ... }` (~rad 1815 in `index.html`)
  and is roughly 50 lines — by far the smallest theme block.
- All other base styling (cards, inputs, buttons) is shared with Iron and
  inherits through CSS variables. Void only overrides what differs.
