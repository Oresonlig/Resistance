# Theme Reference — The Chain

Teknisk referens för att porta och underhålla teman i `index.html`. Läs denna fil vid allt tema-arbete.

---

## Hur teman fungerar

Teman definieras som `body.theme-X { ... }`-block i inline CSS i `index.html`. Iron är default — det bor i `:root` och `body:not([class*="theme-"])`. Alla andra teman startar från `:root`-defaults och overridar det de behöver.

Temaklass sätts via `applyTheme(themeId)` → `document.body.className = 'theme-' + themeId`.

Teman registreras i `THEMES`-arrayen (~rad 7221 i index.html) med `{id, name, cat, desc, class}`.

---

## Befintliga teman

| id | Visningsnamn | Kategori | Klass |
|----|-------------|----------|-------|
| `iron` | Iron | dark | *(default, ingen klass)* |
| `nanosuit` | Nanosuit | dark | `theme-nanosuit` |
| `nightcity` | Night City | dark | `theme-nightcity` |
| `ember` | Ember | dark | `theme-ember` |
| `void` | Void | dark | `theme-void` |
| `obsidian` | Obsidian | dark | `theme-obsidian` |
| `cosmichorror` | Cosmic Horror | dark | `theme-cosmichorror` |
| `understory` | Overgrowth | dark | `theme-understory` |
| `crusader` | Crusader | light | `theme-crusader` |
| `arctic` | Arctic | light | `theme-arctic` |
| `daylight` | Daylight | light | `theme-daylight` |

OBS: Overgrowth har internt id `understory` — visningsnamn ändrades men class-id är oförändrat.

---

## Checklista — nytt tema

- [ ] Fonts i `<head>` (dubbelkolla att inte redan finns)
- [ ] Entry i `THEMES`-arrayen (`cat:'dark'` eller `'light'`)
- [ ] `body.theme-X { --black, --white, --red, --gold, --green-bright, --gray-mid, --gray-light, --display, --sans, --mono }`
- [ ] **PM22 surface-overrides** (se nedan) — ALLTID för ljusa teman, starkt rekommenderat för mörka
- [ ] **3.34.11 tag-tokens** (se nedan)
- [ ] Bakgrund (color + ev. image/canvas/SVG)
- [ ] Header, nav, logo, header-user, sync-dot, AM-pill (3 states)
- [ ] Pass-card (next-up, in-progress, done) + pass-letter, pass-name, pass-preview
- [ ] Chain-tab (default, adjacent, active, done, rest-day) + letter, name-full/short
- [ ] Ex-block (saved-state), ex-name, ex-detail, ex-prev, ex-note-input
- [ ] Tags: ramp, bw, uni, singles, timed
- [ ] Ex-btn-done, ex-btn-skip, ex-btn-edit
- [ ] Set-input (work/warmup), set-unit, set-num, sets-group-label
- [ ] Set-log-btn (+ has-value), set-logged-indicator — **kontrollera clip-path-arv (se nedan)**
- [ ] Ex-done-primary (+ .ready) — **hollow done-state (se nedan)**
- [ ] Auth-screen: userScreen, auth-logo, auth-btn-google, auth-btn-primary/secondary, password-input
- [ ] Progress: stat-box, pr-card + ::before, hist-entry
- [ ] Toast, modal (app-modal-card, title, body, btn-varianter)
- [ ] Select, swap-select, app-modal-select
- [ ] Collapsed-row: ex-collapsed-name, ex-collapsed-status, ex-collapsed-chevron
- [ ] Scrollbar: ::-webkit-scrollbar-track/thumb
- [ ] Tema-knapp i Settings (THEMES-array tar hand om det automatiskt)

---

## PM22 — Surface-variabler (obligatoriska)

**Använd ALLTID variabler för bakgrunder, ALDRIG hardcoded `background:#XXX`.**

Definierade i `:root` (default = Iron's mörka), overridas per tema:

```css
--surface-base:     #0d0d0d;   /* cards, ex-blocks */
--surface-elevated: #1a1a1a;   /* modaler, dropdowns, tag-editor */
--surface-input:    #111;      /* input-fält */
--surface-saved:    #0a120a;   /* saved-state ex-block */
--surface-deep:     #050505;   /* djupare bakgrund, banners */
--surface-overlay:  rgba(255,255,255,0.03); /* hover */
--border-subtle:    #2a2a2a;   /* diskret border */
--border-strong:    #3a3a3a;   /* stark border */
```

För nytt tema: overrida de 8 variablerna i `body.theme-X { ... }` — alla komponenter ärver. Ljusa teman MÅSTE overrida (annars vit text på vit bakgrund).

---

## Tag-tokens (3.34.11)

15 tokens i `:root`, overridas per tema:

```css
--tag-base-bg / --tag-base-border / --tag-base-color
--tag-ramp-bg / --tag-ramp-border / --tag-ramp-color
--tag-bw-bg   / --tag-bw-border   / --tag-bw-color
--tag-uni-bg  / --tag-uni-border  / --tag-uni-color
--tag-singles-bg / --tag-singles-border / --tag-singles-color
```

Standardvärden i `:root` är Iron-kompatibla. Overrida bara de som avviker.

---

## Mappningstabell — Claude Design → app-klasser

| Designens klass | App-klass |
|----------------|-----------|
| `.xx-root` | `body.theme-X` |
| `.xx-topbar` | `body.theme-X header` |
| `.xx-brand-name` | `body.theme-X .logo` |
| `.xx-sync-dot` | `body.theme-X .sync-dot.ok` |
| `.xx-h1` | `body.theme-X .chain-intro-title` |
| `.xx-card` | `body.theme-X .pass-card` + `.ex-block` |
| `.xx-medal` | `body.theme-X .chain-tab .chain-tab-letter` |
| `.xx-medal--active` | `body.theme-X .chain-tab.active` |
| `.xx-tag` | `body.theme-X .ex-tag` (+ varianter `.ramp/.bw/.uni`) |
| `.xx-btn` | `body.theme-X .ex-btn-skip` + `.ex-btn-edit` |
| `.xx-input` | `body.theme-X .set-input` |
| `.xx-log` | `body.theme-X .set-log-btn` |
| `.xx-action--done` | `body.theme-X .ex-done-primary.ready` |
| `.xx-row` (collapsed) | `body.theme-X .ex-block.collapsed .ex-collapsed-summary` |
| `.xx-tabs` | `body.theme-X nav` — **ALDRIG override position!** |

---

## Fallgropar

### clip-path-arv på Log/Done-knappar
Default `.set-log-btn { clip-path: polygon(hexagon) }`. Tema-block som bara overridar `background`/`border-radius` men INTE `clip-path` visar Iron's hexagon-form oavsett tema. **Fix:** `body.theme-X .set-log-btn { clip-path: none }` för alla teman som vill ha annan form.

### Hollow done-state
Done-knappen behåller temats form men renderas ihålig: transparent bg + accent-konturlinje + matchande checkfärg. Lägg done-state i samma tema-block som Log-knappen så de hålls i synk.

### nav — rör aldrig position
Default `nav { position:fixed; bottom:0 }` är hela appens layout. Sätt aldrig `position:relative` på nav i tema-CSS — nav hoppar till toppen och layout kraschar.

### Canvas/SVG: Android mix-blend + isolation
`mix-blend-mode:screen` på fixed canvas + `isolation:isolate` på body → stacking-context-konflikt → Android Chrome blendarar mot vit viewport → hela appen blir vit. **Fix:** skippa mix-blend-mode, använd egna hsla()-alphas. Skippa isolation:isolate.

### Canvas: getBoundingClientRect vid display:block
Returnerar 300×150 (canvas-default) istället för viewport. **Fix:** använd `window.innerWidth/innerHeight` + sätt `canvas.style.width/height` explicit.

### scrollHeight feedback-loop
Canvas/SVG med `position:absolute` i body + `body.scrollHeight` som höjdmätning = cirkulär dep (SVG-höjden inkluderas i body.scrollHeight → SVG krymper aldrig). **Fix:** mät `document.getElementById('appShell').scrollHeight` istället.

### Canvas-perf: per-segment stroke
En konstant-animerande canvas med ett `ctx.stroke()` per linjesegment (~11 000 anrop/frame) mättar huvudtråden → scroll-lagg. **Fix:**
1. EN `stroke()` per form (bygg hela banan, stroka en gång)
2. Ingen array-allokering per frame
3. Platt `fillStyle` per form, ingen gradient per partikel per frame
4. Förrendera partiklar till sprite + `drawImage`
5. ~30fps-tak: rita bara om `now - _last >= 33`
6. dpr-tak 1.5 för mjuka effekter

### Desktop-buggar
- Header sprider sig till skärmkanter på desktop: fix med `@media(min-width:600px){ header{padding:14px max(24px, calc((100vw - 600px) / 2));} }`
- Bakgrunds-effekter täcker hela 1920px: cap med `max-width:720px; left:50%; transform:translateX(-50%)`
- JS-bredd: `Math.min(window.innerWidth, 720)` istället för `window.innerWidth`

---

## Versionsbump-rutin

- **Nytt tema** → MINOR bump (3.X.Y → 3.X+1.0)
- **Tweaks/hotfixes** → PATCH bump
- CHANGELOG-entry per bump

---

## Fas-uppdelning vid port från Claude Design

**Fas 1 — Infrastructure:**
1. Fonts i `<head>`
2. Entry i `THEMES`-arrayen
3. `body.theme-X { ... }` CSS-block
4. Mappa `.xx-*` → befintliga klasser (se mappningstabell)

**Fas 2 — Special effects (canvas/SVG/animations):**
1. Canvas/SVG-element i HTML body efter `</script>`
2. Start/stop-funktioner i JS
3. Hook i `applyTheme()` + `initTheme()`
4. `state.ambientEffects`-flagga för Settings-toggle

**Fas 3 — Text-immersion (om temat har egna texter):**
- Symbol-prefix via CSS pseudo: `body.theme-X .add-ex-btn::before { content:'...' }` (snabbt)
- Full text-byten kräver `themeText(key, fallback)` + `THEME_TEXTS[themeId]`-mappning — stor refaktor, gör inkrementellt
