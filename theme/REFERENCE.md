# Theme Reference — The Chain

Teknisk referens för att porta och underhålla teman i `index.html`. Läs denna fil vid allt tema-arbete.

---

## Hur teman fungerar

Teman definieras som `body.theme-X { ... }`-block i inline CSS i `index.html`. Iron är default — det bor i `:root` och `body:not([class*="theme-"])`. Alla andra teman startar från `:root`-defaults och overridar det de behöver.

Temaklass sätts via `applyTheme(themeId)` → `document.body.className = 'theme-' + themeId`.

Teman registreras i `THEMES`-arrayen (`~rad 9192` i index.html, verifierat 2026-08-02 — Grep för att bekräfta, radnummer driver fort) med `{id, name, cat, desc, class}`.

---

## Befintliga teman (11 st, verifierat mot THEMES-arrayen 2026-08-02)

| id | Visningsnamn | Kategori | Klass |
|----|-------------|----------|-------|
| `iron` | Iron | dark | *(default, KLASSLÖS — `class:''`, `body.theme-iron` matchar aldrig)* |
| `nanosuit` | Nanosuit 2.0 | dark | `theme-nanosuit` |
| `nightcity` | Night City | dark | `theme-nightcity` |
| `ember` | Ember | dark | `theme-ember` |
| `void` | Void | dark | `theme-void` |
| `obsidian` | Obsidian | dark | `theme-obsidian` |
| `cosmic-horror` | Cosmic Horror | dark | `theme-cosmic-horror` |
| `arctic` | Arctic Terminal | light | `theme-arctic` |
| `undertow` | Undertow | light | `theme-undertow` |
| `understory` | Overgrowth | light | `theme-understory` |
| `fullmoon` | Full Moon | light | `theme-fullmoon` |

OBS: Overgrowth har internt id `understory` — visningsnamn ändrades men class-id är oförändrat.

OBS: `check_themes.js` rapporterar `10 teman med egna block` — det är korrekt. Iron
har inget `body.theme-iron`-block eftersom det ÄR bas-CSS:en. 11 teman, 10 block.

**⚠ BORTTAGNA 3.58.14 — finns INTE längre i appen:** `crusader` (Crusader) och `daylight` (Daylight). Tidigare fanns de listade här som aktiva — de är det inte. Ingen `body.theme-crusader`/`body.theme-daylight`-CSS finns kvar i `index.html`. Filerna i `theme/`-mappen (inkl. denna referens tidigare) ligger kvar för ett ev. framtida Claude Design-rework, men porta dem INTE tillbaka in i appen utan att lägga till en ny `THEMES`-entry + full CSS-block igen. Se `feedback_teman_arkitektur` (Claude-minne) för borttagnings-receptet + migration av befintliga användare (`migrateRemovedThemes`).

**⭐ Iron = klasslöst default-tema.** `body.theme-iron { }` matchar ALDRIG — Iron ÄR base-CSS:en (`body:not([class*="theme-"])`). Vill du styla "endast Iron": styla by default, override:a med `body[class*="theme-"] { }` för alla andra teman (matchar automatiskt framtida teman också).

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
      — **tre tillstånd är obligatoriska, se eget avsnitt nedan**
- [ ] `node check_themes.js` grön (ingår i `npm run check`) — **läs warn-raderna**
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

## Chain-strippen — tre tillstånd, två kanaler

Den enskilt mest regressionsdrabbade delen av tema-arbetet. Tre versioner i rad
(3.81.1, 3.81.2, 3.83.0) fixade samma buggklass i olika hörn.

**Tre tillstånd är OBLIGATORISKA.** Ett eget formspråk (månbrickor, hexagoner,
sigill) får aldrig kosta något av dem:

| Tillstånd | Ska läsa som | Får ALDRIG |
|-----------|--------------|------------|
| *kvar att träna* | full styrka | — |
| *på glänt* | antytt, ej fullt expanderat, **svagare än kvar-att-träna** | vara identisk med distant |
| *avklarad* | tydligt avverkad | bli osynlig — man ska se att passet ligger där och kunna trycka på det |

**Koda ALDRIG status och närhet i samma visuella kanal.**

- **Status** (klar vs kvar) bor på **bokstaven** — fas, fyllning, färg.
- **Närhet** (active/adjacent/distant) bor på **containern** — kapsel, kant, expansion.

Blandas de slår `.adjacent`-reglernas specificitet (0-4-1) bas-regelns `.done`-fade
(0-3-0), och färdiga pass tänds upp som kommande. Det var 3.81.1.

**Vilodagen är inte ett undantag från dämpningen.** Guldet är låst med `!important`
i bas-CSS och ska aldrig överridas — men scopa därför inte hela sitt state-arbete
med `:not(.rest-day)`. Färg/fas: `:not(.rest-day)`. Dämpning/kapsel: **utan scope**,
så vilodagarna följer med. Det var 3.81.2.

**Närhet får inte göra brickan ljusare.** Grannen ska vara marginellt *svagare* än
en distant bricka, inte starkare — annars äter närhets-boosten upp done-dämpningen
och en avklarad granne blir exakt lika ljus som en kvarvarande på avstånd. Det var
3.83.0, och det var mätbart identiska RGB-värden, inte en smaksak.

**Verifiera SEX kombinationer:** `distant`, `adjacent`, `done`, `adjacent.done` —
och samma fyra igen med `.rest-day`. `node check_themes.js` gör det mekaniskt.

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

### Kommentarsbalans — en stängd kommentar dödar nästa regel
Ett `*/` utan öppnande `/*` gör att prosan därefter blir **levande CSS**.
Webbläsaren läser den som en selektor, och kastar tyst hela regeln som följer.
Inget syns i konsolen; symptomet är att "fixen inte tog". Det inträffade i
3.82.0 och upptäcktes först i 3.84.1 — Full Moons done-regel för chain-tab hade
aldrig körts, och **fyra** omgångar "fixa vilodagsgrafiken" justerade färgvärden
i en regel ingen läste.

Två vanor som förebygger det:
1. Skriv aldrig `{...}` i löptext inuti en kommentar utan att kontrollera att
   kommentaren är hel — ett citat som `` `.x{opacity:1}` `` blir annars den
   deklarationsblock som avslutar skräpselektorn.
2. `node check_themes.js` felar hårt på obalans (CHECK 0). Kör den.

### clip-path-arv på Log/Done-knappar
Default `.set-log-btn { clip-path: polygon(hexagon) }`. Tema-block som bara overridar `background`/`border-radius` men INTE `clip-path` visar Iron's hexagon-form oavsett tema. **Fix:** `body.theme-X .set-log-btn { clip-path: none }` för alla teman som vill ha annan form.

### Hollow done-state
Done-knappen behåller temats form men renderas ihålig: transparent bg + accent-konturlinje + matchande checkfärg. Lägg done-state i samma tema-block som Log-knappen så de hålls i synk.

### nav — rör aldrig position
Default `nav { position:fixed; bottom:0 }` är hela appens layout. Sätt aldrig `position:relative` på nav i tema-CSS — nav hoppar till toppen och layout kraschar.

### Stacking — löst en gång, rör den inte per tema
Fram till 3.85.0 fick varje tema räkna upp sina opaka paneler med
`position:relative;z-index:1`. Det var fel nivå: ett positionerat element med
`z-index:0` målas alltid över opositionerat innehåll, så varje panel som inte
stod med i listan hamnade under bakgrunden — och listan blev fel varje gång en
ny vy lades till.

`.view` lyfts nu **en gång** i bas-CSS och skapar en stacking-kontext. Hela dess
subträd ligger därmed över bakgrundslagret, i alla teman, för alltid.

| z | Klass / element | |
|---|---|---|
| 0 | `.ambient-back` | canvas/SVG/pseudo-bakgrund |
| 1 | `.view` | allt appinnehåll |
| 2 | `.ambient-front` | vinjett, scanlines, partiklar — medvetet **över** innehållet |
| 99 | `.rest-timer` | |
| 100 | `header`, `nav` | ligger utanför `.view` → alltid över båda ambient-lagren |
| 999 | `.toast` | |
| 1000 | app-modal | |

**Vad ett nytt tema ska göra:** sätt klassen `ambient-back` på sitt bakgrundslager
(eller `z-index:var(--z-ambient-back)` om lagret har egen geometri, som Obsidians
centrerade ember-canvas). Lager som ska ligga över innehållet: `ambient-front`.
Det är allt.

**Vad ett tema ALDRIG ska göra:** sätta `z-index` på en panel, en vy, `header`
eller `nav`. Full Moon satte `z-index:2` på headern och *sänkte* den därmed från
bas-CSS:ens 100 — borttaget i 3.85.0.

⚠ Tro inte på påståendet att ".view-lyftet ensamt är opålitligt för descendants".
Det stod i tema-CSS:en i två år. En stacking-kontext lyfter hela subträdet,
garanterat. Observationen bakom påståendet kom av att lyftet var scopat till
`body.theme-nanosuit` medan buggrapporterna kom från teman som inte hade det.

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
7. **Pausa loopen under scroll** (`scroll` → `paused=true`, återuppta ~160 ms
   efter sista eventet, `capture:true` eftersom scroll inte bubblar). Ingen
   tittar på ambient-effekten medan de scrollar, och det är exakt då den kostar
   mest.

### backdrop-filter över en animerad canvas (iOS-specifikt)
`backdrop-filter: blur()` tvingar kompositorn att omsampla panelens bakgrund.
Är bakgrunden en canvas som ritar om varje frame måste **varje** suddad panel
blurras om varje frame — samtidigt som scrollen komposieras, ur samma budget.
WebKit/iOS drabbas betydligt hårdare än Android Chrome; rapporterat som "hackar
när han scrollar" på iPhone medan samma bygge flyter på Android (Full Moon,
3.84.1). Undvik `backdrop-filter` på paneler som **upprepas per rad**
(`hist-entry`, `pr-card`) i teman med animerad bakgrund — de multipliceras med
antalet rader. En instans per vy är oftast oproblematiskt.

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
0. Klassen `ambient-back` (eller `ambient-front`) på lagret — se stacking-avsnittet.
   Inga panel-lyft, inga z-index i temablocket.
1. Canvas/SVG-element i HTML body efter `</script>`
2. Start/stop-funktioner i JS
3. Hook i `applyTheme()` + `initTheme()`
4. `state.ambientEffects`-flagga för Settings-toggle

**Fas 3 — Text-immersion (om temat har egna texter):**
- Symbol-prefix via CSS pseudo: `body.theme-X .add-ex-btn::before { content:'...' }` (snabbt)
- Full text-byten kräver `themeText(key, fallback)` + `THEME_TEXTS[themeId]`-mappning — stor refaktor, gör inkrementellt
