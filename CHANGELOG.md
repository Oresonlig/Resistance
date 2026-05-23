# Changelog

Spårbar versionslogg för The Chain. Nyaste överst. Datum från git-historik.

Format: `MAJOR.MINOR.PATCH` — patch = bugfix/små tillägg, minor = ny feature, major = stora omtag.

---

## 3.34.3 — 2026-05-23
**Förra passets full historik under "Last (Xd ago)" — expand-on-tap (FEATURE).**

Niklas: "Nu finns det utrymme (efter att det blev kollapsade övningar) att lägga in samtliga warmup och workout set från förra veckans övning. Som det är nu är det bara senaste workout."

- **`getLastSession()` returnerar nu `allSets`** (alla sets inkl. warmups) tillsammans med befintliga `sets` (bara work sets). Backward compatible — `sets` används fortfarande av PR-beräkningar.
- **History-block under "Last"-raden:** Klick på `▾ History (N)` expanderar lista över alla sets från senaste session, formatterade per set-typ:
  - W1, W2 — warmups (faded color)
  - S1, S2, S3 — work sets (accent color)
  - Format per typ: TIMED `"42s"`, BW+ `"BW + 5kg ×8r +1f"`, default `"50kg ×5r +1f"`
- **State:** In-memory `_showHistory[exId]` overlever `rerenderSession()` men inte page-reload. Per Niklas: "default kollapsat, kom ihåg per session."
- **Render-villkor:** Visas endast om `allSets.length > 1` (single-set övningar = ingen mening med expand).
- **CSS:** Använder `var(--border-subtle)` + `var(--gray-light)` så alla teman ärver semantik. Warmup-rows dimmer (color `#7a6850`, opacity 0.78).

---

## 3.34.2 — 2026-05-23
**Iron Log dunkel + Cosmic veins desktop-feedback-loop + chain-tab clarity.**

Feedback från Niklas efter morgontest av 3.34.1:

- **Iron Log:** Var "för skarp och flashig", Iron ska vara "mörk och inte så flashigt". Dunkel blodröd istället: gradient `#6a1a14 → #3a0a08` (was `#c0392b → #7a1f15`), color `#d4a098` (faded brick-pink, was `#fff`), inset highlight dämpat, drop-shadow borttaget. Hover och has-value lyser upp gradvis utan att bli flashy.
- **Cosmic Horror veins desktop:**
  - **Feedback-loop fix:** `body.scrollHeight`/`html.scrollHeight` inkluderar absolut SVG, så SVG-höjden växte med page-höjden cirkulärt. När content krympte stannade SVG kvar på gamla höjden → "Man fick scrolla väldigt långt för att nå botten." Byt till `document.getElementById('appShell').scrollHeight` (content-only, excluderar SVG). SVG krymper nu när content krymper.
  - **Width cap 800 → 720px** (CSS + JS), närmare content-area. Veins är inte "långt på kanterna" på desktop.
  - **Pulse dampening:** drop-shadow blur `3 → 2px`, stroke-opacity `0.75`. Pulser dominerar mindre vs dim base-veins.
- **Chain-tab clarity bump:** Niklas: "oklara sessions kanske ska vara något mer tydligare på samtliga teman."
  - Default distant: opacity `.7 → .82`, bg red-mix `11% → 16%`. Påverkar Iron, Nanosuit, Night City, Ember, Daylight, Crusader (alla som ärver default).
  - Default adjacent: opacity `.82 → .92`, bg red-mix `18% → 24%`.
  - **Obsidian:** distant color `#5a4a28 → #8a7340` (brighter dim gold), bg alpha `.6 → .7`. Adjacent `#c9a35a → #e0c078`, bg `.65 → .75`. Done: opacity 0.5 + saturate(0.3) tillagt så done verkligen ser avklarat ut.

---

## 3.34.1 — 2026-05-23
**Themed Log-knappar för alla 8 gamla teman + Finish Session-polish.**

Niklas: "Alla nya teman (Obsidian & Cosmic) har coola nya Log-knappar och finish session mm. De gamla teman har inte det." Designat distinkta Log-knappar för varje tema:

- **Iron (default):** Solid red metal stamp med gradient `#c0392b → #7a1f15`, Bebas Neue, inset highlight + outer red glow. Has-value bumpar saturation. Hover lyfter med stronger glow.
- **Nanosuit:** Octagonal HUD-knapp via `clip-path:polygon(...)`, cyan gradient `#00d4ff → #0088b8`, Orbitron 900. Has-value lyser upp till `#00fff0` bright cyan.
- **Night City:** Parallelogram acid yellow `#ffe600`, chromatic-aberration edges (-1px magenta, +1px cyan), neon glow. Hover bumpar offsets till -2/+2.
- **Ember:** Molten orange `#ff8c1a → #cc3300` med `embLogBreath` 3.6s pulse-animation (heat-glow breath). Has-value glödar `0 0 22px` orange.
- **Void:** Pure white `#fff` italic pill (border-radius 18px), Playfair Display 700 italic, ingen text-transform. Minimal som hela temat kräver.
- **Arctic:** Frosted glass pill med `backdrop-filter:blur(6px)`, cyan gradient, white inner highlight, soft cyan box-shadow.
- **Daylight:** Clean solid red pill (border-radius 14px), Bebas Neue, soft drop-shadow `0 1px 3px rgba(192,57,43,0.4)`. Modern matchar paper-aesthetic.
- **Crusader:** Forged stamped metal — red gradient `#a82828 → #5a1010`, dual-tone border (`#c83838` top / `#3a0808` bottom), Cinzel 700. Heavy multi-axis shadow.

**Bonus — Finish Session polish:**
- **Iron `.btn-primary`:** Solid red → gradient + outer red glow + hover lift. Matchar Obsidian/Cosmic's "cool" feel.
- **Daylight `.btn-primary`:** Solid → gradient + elevated drop-shadow + hover lift med stronger shadow. Light polish (Daylight är WIP/redesign-kandidat så minimal investering).
- Övriga teman (Nanosuit, Night City, Ember, Void, Arctic, Crusader) har redan distinkt `.btn-primary`-styling sedan tidigare versioner.

---

## 3.34.0 — 2026-05-23
**Tag-driven set defaults + tags under namnet (FEATURE).**

- **`TAG_DEFAULTS`-tabell:** Första aktiva tag (i ordningen RAMP → BW → UNI → TIMED → SINGLES) dikterar set-defaults för ny övning.
  - **RAMP:** 0 warm + 4 work
  - **BW+:** 0 warm + 3 work
  - **UNILATERAL:** 2 warm + 1 work
  - **TIMED:** 0 warm + 1 work
  - **SINGLES:** 1 warm + 5 work
  - **(ingen tag) HIT:** 2 warm + 1 work (standard)
- **`getPrimaryTag(ex)` helper:** Loopar igenom `TAG_ORDER`, returnerar första aktiva tag. Konsekvent ordning vid flera tags.
- **`getDefaultSets(ex)` refaktor:** Använder `TAG_DEFAULTS` istället för hardcoded `if(isRamp)/if(isBW)`. `lastSessionSetCount` overridar fortfarande work-count (F1 från 3.28.0).
- **Inline `defaultSets` (rad 5773) konsoliderad** till `getDefaultSets(ex)` — single source of truth för tag-driven defaults.
- **Auto-apply på tag-byte:** När primary tag ändras OCH övningen är "fresh" (inga loggade sets, ingen saved data), resettas `state.draft.extraSets[exId]` så nya defaults appliceras vid rerender. Med loggade/saved sets bibehålls struktur — användaren får +/− set manuellt. Ingen "Done"-knapp behövs (auto-apply räcker).
- **Tags ALLTID under namnet** (Niklas request). Ny `.ex-tags-row` (expanded view) + `.ex-collapsed-tags` (collapsed). Tags har egen rad direkt under övningens namn istället för inline till höger om namnet. Påverkar alla teman.

---

## 3.33.5 — 2026-05-23
**Cosmic Horror veins: dampen + randomize.**

- **SVG-opacity sänkt** `0.85` → `0.55`. Niklas: "veins tar över".
- **Per-path opacity sänkt:** `0.3 + depth*0.15` → `0.22 + depth*0.10`. Depth-3 trunks max 0.52 (var 0.75), depth-0 branches 0.22 (var 0.3). Veins känns nu som bakgrund, inte foreground.
- **Pulse drop-shadow:** blur 5px → 3px. Mindre glödande pulser.
- **Pulse-randomisering** — varje pulse-path får nu:
  - `animation-duration` 4.0–7.0s (var fast 2.6–2.8s) — långsammare och varierat
  - `animation-delay` -4.0–0.0s (var fast -0.5–-1s) — pulserna är inte i fas
  - `animation-direction: reverse` på 50% av paths (ny `.ch-pulse-reverse` klass) — pulser går nu åt båda håll, inte alltid samma riktning. Niklas: "går samma väg hela tiden — lite tråkigt/förutsägbart".
- **Resultat:** Veins-bakgrunden är mer organisk och oförutsägbar utan att förlora karaktären.

---

## 3.33.4 — 2026-05-23
**Chain-strip distant/done contrast — passes "tänds upp" efter restart.**

- **Default `.chain-tab .chain-tab-letter`:** distant opacity `.5` → `.7`, bg red-mix 7% → 11%. Upcoming sessions nu tydligt synliga. Påverkar alla teman som ärver default (Iron, Nanosuit, Night City, Ember, Arctic, Daylight, Crusader, Obsidian).
- **Default `.chain-tab.done`:** opacity `.22` → `.15` + `filter:saturate(0.4)`. Avklarade pass clearly desaturated, omöjligt att förväxla med upcoming.
- **Cosmic Horror chain-tab override:** distant color `#4f6a64` → `#8aacaa`, bg alpha `.55` → `.55` (samma) men brighter teal `rgba(20,40,38)`, border `.22` → `.32`. Adjacent också bumpat: color `#aedcd0` → `#cce8de`, bg `.6` → `.65`, border `.4` → `.55`. Done: color `#2a4a44` → `#1a3a34`, bg alpha `.3` → `.45` (med darker base), opacity `0.5` + `filter:saturate(0.3)`.
- **Void chain-tab:** distant color `#555` → `#888`, bg `.04` → `.07`. Done `#333` → `#2a2a2a` + opacity `0.6`. Adjacent bumpat också för konsekvens.
- **Rotorsak (#5 från morgonpass 2026-05-23):** Efter chain-restart såg upcoming-pass nästan identiska med done-pass. Logiken var korrekt (`doNewCycle()` rad 7681 sätter `cycle.done[passId]=null` för alla). Problem var visuell distinktion — distant och done för subtilt åtskilda, särskilt i Cosmic Horror.

---

## 3.33.3 — 2026-05-22
**Obsidian-embers konsekvens + Void WIP-flagga bort.**

- **Obsidian ember-canvas capad till 800px på desktop** (samma princip som Cosmic Horror vein-fix i 3.33.2). `position:fixed; top:0; bottom:0; left:50%; transform:translateX(-50%); max-width:800px` + JS `Math.min(window.innerWidth, 800)` för partikel-koord-konsekvens. Embers koncentreras nu kring content-area istället för att spridas över hela 1920px desktop-bredden.
- **Void "WIP"-flaggan borttagen.** "Void · WIP" → "Void". Niklas: "Det får vara som det är helt enkelt. Lite spartanskt med det är ju själva grejen med Void."
- **Audit alla tema-headers:** verifierat att ingen tema över-rider `padding` — 3.33.2 header-fix (`max(24px, calc((100vw - 600px) / 2))`) gäller universellt på alla 10 teman utan konflikt.

**Inte fixat (medvetet):**
- Daylight + Crusader har också "· WIP" i tema-namnet — Niklas instruktion gällde bara Void, övriga lämnade orörda.
- Crusader cross-bg är medvetet placerat off-center höger enligt design från 3.20.x.

---

## 3.33.2 — 2026-05-22
**Desktop-fix för header + Cosmic Horror veiner.** Niklas testade på desktop första gången — två problem:

- **Header logo + LOG OUT på extrema kanter (alla teman).** Header hade `padding:14px 24px` på desktop men ingen max-width, så `justify-content:space-between` sprider innehållet till skärmkanterna på 1920px-monitor. Mitten var tom. Universal bug, syns på alla teman när desktop används. **Fix:** `header { padding: 14px max(24px, calc((100vw - 600px) / 2)); }` — auto-padding expanderar när viewport > 600px så header-content blir centrerat i samma 600px-bred area som övrig content. Bakgrund förblir full-width (sticky bar). Mobile opåverkad.
- **Cosmic Horror veiner spred sig över hela 1920px desktop-bredd.** SVG fyllde full window-bredd även när content var centrerat i 560px → veiner "all over the place" utanför content. **Fix:** `#cosmicHorrorVeins { max-width: 800px; left: 50%; transform: translateX(-50%); }` + JS `w = Math.min(window.innerWidth, 800)` för viewBox-konsekvens. Veinerna sträcker sig nu 120px utanför content på varje sida (snyggt buffert), inte över hela skärmen.

---

## 3.33.1 — 2026-05-22
**Cosmic Horror vein-fördelning fixad — veiner täcker hela page, inte bara hörn.**

- **Rotorsak:** vein-walker producerar paths ~216px långa (18 segments × ~12px stepLen). När viewBox sträcktes till verklig pixel-area (1080×{scrollHeight}) hamnade alla 4 designens vein-systems i top-right + bottom-left + närliggande clusters — mitten av page var TOM. Niklas såg veiner högst upp + längst ner, mitt-scroll utan vegetation.
- **Fix:** dynamic antal cluster-pairs baserat på scrollHeight (1 par per ~1500px). Mobile ~3000px scrollHeight → 2 pairs (4 clusters), desktop ~5000px → 4 pairs (8 clusters), lång Progress-vy ~12000px → 8 pairs (16 clusters). Alternerande höger/vänster start så de fördelas över hela höjden.
- **Bonus: mid-pulser.** Mid-cluster trunks får också traveling-pulse (med ramped durations 3.0s, 3.4s, 3.8s) — motion även i mitten av page, inte bara corner-trunks. Pulser fördelade så de inte alla peakar samtidigt.

---

## 3.33.0 — 2026-05-22
**NYTT TEMA: Cosmic Horror** — Biological alien organism. Designat i Claude Design, källa: `C:\Resistance\theme\cosmic horror\`.

- **Palette:** Blue-black `#03080a` + teal `#7fc8b4` accent + blood burgundy `#a8424c` (warning) + amber `#d8b878` (RAMP/BW+) + ochre teal varianter.
- **Typografi:** Cormorant Garamond italic (body/details) + Cormorant SC (display, caps) + IBM Plex Mono (data/tags).
- **Vein-bakgrund (SVG):** procedurellt genererad rekursiv branching-walker (4 system, ~80-120 paths). Tapered stroke (tjocka trunks → tunna kapillärer). 2 main trunks har animerade pulser (`pathLength=1` + `stroke-dasharray=0.04 1` + dashoffset-animation = bright segment travels along path). Genereras via deterministisk seeded RNG så samma vy = samma shape.
- **World-coord SVG** (samma princip som Obsidian-embers): SVG position:absolute i body, höjd = `scrollHeight`, scrollar med content (inte filterlager på skärmen). Periodisk re-mätning via setInterval för content-tillväxt.
- **Asymmetriska organiska shapes:** alla cards/inputs/buttons använder asymmetric border-radius (`border-radius: 24px 6px 28px 8px / 16px 22px 12px 24px`). Inga rektanglar, inga symmetriska shapes.
- **Aktiv chain-tab:** asymmetric organic blob med inner asymmetric letter-cirkel. INTE rektangel som Obsidian.
- **5 animationer:** vein-pulses (2.6-2.8s), sync-blink (3.2s), tab-fang-pulse (4.2s), wave-slide (14s, kvar för divider om vi lägger till). Eye-pupil-animation (6.2s) — sigil SVG skjuts till v2 om Niklas ber.
- **LOG/DONE är STATISKA** — INGEN breathing-glow (designens explicit val). Menace via shape language + vein-pulser, inte konstant glödande.
- **Settings → Ambient Effects-toggle** styr veiner ON/OFF (samma toggle som Obsidian-embers).
- **Lärdomar från Obsidian-port tillämpade:** ingen `isolation:isolate` på body (Android stacking-bug), ingen `mix-blend-mode:screen` (samma), nav-position aldrig override:ad (behåller fixed bottom), surface-variabler från PM22.
- **Övriga teman opåverkade.**

**Skjutet till v2 (om Niklas ber):**
- EyeSigil (org eye med dilaterande pupill) i header
- Divider med MiniGlyph + wavy gradient slide
- Tema-specifika texter (EDIT → ⇄ EDIT, DONE → ✓ DONE etc) — full immersion-paket

---

## 3.32.1 — 2026-05-22
**Obsidian glow-dämpning.** Niklas-feedback: när 3+ Log-knappar visas samtidigt (W1, W2, S1) blev gold-glow för intensiv och dominerande.

- **Log-button:** box-shadow peak från `0 0 28px rgba(...,0.55)` → `0 0 12px rgba(...,0.28)` (~50% mindre intensitet), cycle 2.8s → 3.4s (lugnare), shimmer-sweep alpha 0.5 → 0.22 + cycle 5.4s → 7s. Synlig men inte visuellt dominant vid flera samtidigt.
- **THE CHAIN gold-shimmer:** mid-tones dämpade (var `#f8e6b0`/`#ffe9a8` ljusast, nu `#c9a35a` ljusast → mindre dramatisk "blixt"), drop-shadow `0 0 12px rgba(...,0.18)` → `0 0 6px rgba(...,0.10)`, cycle 8s → 12s (lugnare).

Övriga animationer (sigil-breath, medal-breath, complete-button breath, tab-pulse, embers) orörda.

---

## 3.32.0 — 2026-05-22
**PM22 LÖST — Semantisk CSS-variabel-refaktor för bakgrunder.** Rotorsak till "svart blöder på ljusa teman" eliminerad.

**Problemet:**
Hela CSS-arkitekturen hade hardcoded mörka bakgrunder (`background:#0d0d0d`, `#111`, `#1a1a1a`, etc.) direkt i selectors. Varje ny komponent fick mörk default → ljusa teman (Daylight, Arctic) krävde EXPLICIT per-fall-override för varje element. Daylight hade 124 sådana overrides, Arctic 57+. Glömdes en → svart fläck på ljust tema.

**Lösningen:**
8 semantiska variabler i `:root` (default = mörka värden):
- `--surface-base` (cards, pillars, ex-blocks)
- `--surface-elevated` (modaler, dropdowns, menyer)
- `--surface-input` (alla input-fält)
- `--surface-saved` (saved-state ex-block)
- `--surface-deep` (djupare bakgrunder)
- `--surface-overlay` (hover-state)
- `--border-subtle` (diskret border)
- `--border-strong` (synligare border)

Varje tema (Arctic, Daylight, Crusader, Obsidian, Void) över-rider variablerna ETT enda ställe istället för per-fall. CSS-regler använder `var(--surface-X)` istället av hardcoded färg.

**Vad det betyder framåt:**
- Nya komponenter får automatiskt rätt färg per tema utan extra arbete
- Per-fall theme-overrides krävs INTE längre (existing overrides kvarstår men är redundanta — harmless)
- Tema-utveckling fokuserar på UNIK styling (glasmorphism, gradients, animations) — inte färgmappning

**25+ element migrerade:** AM-pill, nav, weight-banner/input, ex-block.saved, ex-collapsed.saved, ex-note-input, ex-edit-menu, set-input, swap-select, add-ex-input, app-modal-card/input/select/btn, auth-form-inputs, auth-btn-google, drag-containers, custom-ex-input, weight-step-select.

**Vad som INTE bytts:**
- Tag-bakgrunder (`.ex-tag.ramp/bw/uni` etc) — medvetet olika färg per tag-typ
- Tema-specifika unika effekter (Arctic glasmorphism, Crusader gradient, Obsidian gold-gradient) — orörda
- Redundanta theme-overrides i tema-blocken — harmless, bryt inte mot variabel-systemet

**Risk:** Mörka teman opåverkade (defaults har samma värden som tidigare hardcoded). Ljusa teman testas av Niklas live under session.

**Why:** Niklas frustration 2026-05-22 efter att ha hittat fler svarta fönster: "Varför löser vi inte det från GRUNDEN?" Per-fall-fixar var arkitektur-skuld. Nu löst på riktigt.

---

## 3.31.5 — 2026-05-22
**Obsidian nav-bar läsbarhet.** Designens preview hade `background:transparent → rgba(30,20,8,0.7)`-gradient + `color:#4a3a18` på icke-aktiv text — för dim i riktig app, embers + content skinade igenom. Bytt till opaque `rgba(15,10,4,0.96)` + backdrop-blur + ljusare text `#8a7a58` (gold-family men muted, fortfarande clearly readable). Aktiv-tab oförändrad (#f0d99c gold).

---

## 3.31.4 — 2026-05-22
**Obsidian aktiv chain-tab: rektangel med diamond-ends + RITE-prefix på session-header.** Matchar Claude Designs förslag.

- **Aktiv chain-tab är nu EN sammanhängande rounded-rektangel** (border-radius:6px, gold border) som omger BÅDE bokstaven + namnet. Default-hexagonen (`clip-path:polygon(...)`) är override:ad till `none` bara för Obsidian + aktiv.
- **Diamond-ends:** `::before` och `::after` på aktiv-cellen renderar 8×8px roterade kvadrater (45°) i gold-outline + dark fill — kapslar in rektangeln som "scroll-ends". Margin på sidorna garanterar att de inte clippas av chain-strip-overflow.
- **Letter (B) inom aktiv-rektangeln:** 32×32 gold cirkel med inner gradient, ingen egen animation (breath är på containern istället så hela kapseln "andas" som en enhet).
- **RITE-prefix på session-header.** `body.theme-obsidian .pass-ex-letter::before { content:"RITE " }` + `::after { content:" ·" }` ger "RITE B · BACK · BICEPS" istället för "B BACK · BICEPS". Pseudo-only — ingen JS-edit. Övriga teman opåverkade.
- **Icke-aktiva chain-tabs** (A, V1, C som cirklar; CHE, VB som avlånga hexagons för adjacent med name-short) — opåverkade, behåller default-styling. Bara aktiv-cellen får rektangel-form.

Niklas: "VERKLIGEN gillar hexagonens form överlag" — bekräftade att Obsidian är undantaget där rektangel passar tema-karaktären bättre.

---

## 3.31.3 — 2026-05-22
**Obsidian embers följer scroll — känns "i appen" istället för "på skärmen".** Niklas: "embers ligger som en film på min mobil. Jag vill att de ska vara i appen rent grafiskt".

- **Rotorsak:** canvas var `position:fixed` viewport-storlek, partikel-koords var viewport-relativa → vid scroll följde inte embers med content, kändes som ett filterlager utanför app:s grafik.
- **Fix:** WORLD-COORD partiklar. Canvas förblir viewport-storlek (perf), men:
  - Partiklarna spawnas över hela `document.scrollHeight` (inte bara viewport-y)
  - Varje frame sätts `ctx.setTransform(dpr, 0, 0, dpr, 0, -scrollY*dpr)` → world-coords renderas på rätt viewport-position
  - `clearRect` rensar bara den synliga viewport-arean (i world-coords)
  - Off-screen-clip: partiklar utanför viewport ± 50px ritas inte (perf)
  - Periodisk `getScrollH()`-re-mätning var 1.5s fångar content-tillväxt utan MutationObserver-overhead
- **Spawn-pattern ändrat:** alltid random y över hela världen (förut respawn vid `h+40` = längst ner). Ger continuous täckning av lång content (Progress-vy etc), inte bara längs nedre kanten.
- **Visuell effekt:** scrollar du nedåt så glider embers förbi naturligt som om de tillhör appens bakgrund, inte är pålagd på mobilskärmen.

---

## 3.31.2 — 2026-05-22
**Ember-canvas gigant-glow-bugg fixad.** Niklas såg "vit blob i mitten + UPDATED FROM CLOUD ✓" efter sync. Inte vit bakgrund — canvas-storleksbugg.

- **Rotorsak:** `canvas.getBoundingClientRect()` är opålitlig på Android Chrome när elementet just fick `display:block` (race med layout-engine). Returnerade 300x150 (canvas-element default) istället för viewport-size. Resultat: alla 32 partiklar spawnade i ett litet hörn, sedan CSS-stretched 3-15× upp till viewport → en gigantisk vit/cream glow-blob där partiklarna lade ihop.
- **Trigger:** `syncFromCloud` slutförs → renderChain anropas → DOM reflow → canvas re-mätning → falska 300x150-värden låste sig.
- **Fix:** byt till `window.innerWidth/Height` (alltid korrekt) + sätt `canvas.style.width/height` explicit + re-spawn partiklarna vid varje resize (annars hänger gamla koordinater kvar). Säkerhetsnät: en extra `requestAnimationFrame(resize)` efter första körningen för att fånga sena layout-händelser.
- **Bonus:** bytt ResizeObserver → `window.addEventListener('resize')` — enklare cleanup, ingen risk för observer som överlever theme-byten.

---

## 3.31.1 — 2026-05-22
**Obsidian-hotfix: vit bakgrund + nav-flikar på fel plats.** Två rotorsaker:

- **Nav-flikar hoppade till toppen.** Min CSS satte `position:relative; z-index:2` på `body.theme-obsidian nav` för att lyfta nav ovanför ember-canvas — men override:ade default `position:fixed; bottom:0`. Resultat: nav föll tillbaka till sin DOM-plats (efter header) istället för låst i botten. Fix: tog bort hela "lyft content"-regeln — `nav` behåller sin default `fixed; bottom:0`. Embers ligger på `z-index:0`, content render:ar default-stacking ovanpå.
- **Bakgrund blev helt vit/ljus.** `mix-blend-mode:screen` på ember-canvas + parchment-noise + `isolation:isolate` på `<body>` skapade stacking-context-konflikt på Android Chrome (Samsung Internet). Browsern misslyckades att blanda mot mörk bg-color → blendade mot vit viewport-fallback istället. Fix: tog bort `mix-blend-mode:screen` (partiklar har egen alpha, klarar sig utan), tog bort `isolation:isolate` (krävdes bara för screen-blend).

**Visuell skillnad:** Partiklarna är fortfarande gold/orange glow, bara via vanlig alpha-blending istället för screen-blend (mindre "additive bloom" — kan kännas lite mer dovt men stabilt på alla browsers).

---

## 3.31.0 — 2026-05-22
**NYTT TEMA: Obsidian** — Dark fantasy / gothic scriptorium med breathing gold embers. Designat i Claude Design (Niklas + Claude), porterat till single-file index.html.

- **Palette:** Deep warm charcoal (`#0a0805`) + gold accents (`#c9a35a` / `#f0d99c`) + ember (`#d68262`).
- **Typografi:** Cinzel (display, gold-shimmer THE CHAIN-titel) + Cardo (italic body/details). Båda från Google Fonts, laddade via befintlig `<link>` i `<head>` (Cinzel fanns redan via Crusader, Cardo lades till).
- **Chain-strip:** runda gold medaljer ersätter hexagon-formen för detta tema (Niklas godkände specifikt formavvikelse — temat är så distinkt att det får lov).
- **Ember canvas:** vanilla JS-port av designens `<ObsidianEmbers>` React-komponent. 32 partiklar med per-partikel fysik (position, vy, sway, livslängd), radial gradients per frame, `mix-blend-mode:screen`. Mount/demount via `applyTheme` + nytt `Settings → Ambient Effects`-toggle (default ON). Stopp-funktion cancellar rAF + ResizeObserver + clearar canvas.
- **8 breathing-animationer:** sync-dot blink (2.6s), THE CHAIN gold shimmer (8s), active-medallion breath (4.6s), Log-button gold breath (2.8s) + shimmer-sweep (5.4s), COMPLETE button breath (5.2s), active-tab underline pulse (3.2s), embers (rAF). Desynced så skärmen "andas" istället för att ticka.
- **Symbol-prefixes:** `✦` på COMPLETE (ex-done-primary.ready), `✚` på add-buttons. Full text-immersion (EDIT → ⊕ AMEND, etc.) skjuts till v2 — kräver tema-aware text-rendering, gör inkrementellt.
- **Mappning:** alla `.ob-*` selectors från designens JSX porterade till `body.theme-obsidian` + befintliga klasser (`.pass-card`, `.ex-block`, `.set-input`, `.set-log-btn`, `.chain-tab`, `nav button`, modaler, auth, progress, hist, etc.). ~290 rader CSS.
- **Övriga teman opåverkade.** Void kvar för Johannes.

---

## 3.30.18 — 2026-05-22
**Void: vit-på-vitt-buggar fixade.** Rot: Void har `--red:#ffffff` (medvetet minimalistiskt) men flera Settings-element använde `color:var(--white)` på selected-state → vit text på vit bakgrund = osynlig.

- **Settings — selected-state nu synlig.** Weight-unit (KG/LBS), Rest-duration-presets (1/2/3/4/5 min) och tema-kort använder en `isVoid`-check som mappar selected `bg/fg/border` till `#fff/#000/#888` på Void istället för `var(--red)/var(--white)/var(--red)`. Övriga teman opåverkade.
- **Modal-confirm-knappen (Log Out, m.fl.) synlig på Void.** Default `.app-modal-btn-primary { color:#fff }` + Void's `--red:#fff` gav vit-på-vitt. Lade in `body.theme-void` override som tvingar svart text på vit bakgrund. Också `.app-modal-btn-danger` får synlig styling.
- **Inverkan på framtida arbete:** PM22 (CSS-variabel-refaktor) blir lättare när dessa selectable-element flyttas från inline-styles till klasser med `--accent-bg`/`--accent-fg`-variabler.
**AM-pillen: BW-text bort, viktsymbolen kvar.** ⚖-ikonen identifierar redan att det är morning weight — "BW"-prefixet var redundant och låg inne i pillen ("input-fönstret"). Loggat: `⚖ 97 kg` (förut `⚖ BW 97 kg`). Missing: `⚖ +` (förut `⚖ + BW`).

---

## 3.30.16 — 2026-05-22
**Iterations-paket: labels sänkta, BW som tag bredvid namnet, Arctic-paritet med Daylight.**

- **Set-row labels sänkta 18%.** `1rem → .82rem` desktop, `.88rem → .72rem` mobil. Var på gränsen till för stora i 3.30.15.
- **BW flyttad ut ur input-fönstret.** Tidigare `BW {snap} + KG` i set-unit (under input). Nu: BW-tagen bredvid övningsnamnet visar `BW 97 kg` (dagens vikt från AM-pillen). Set-unit blir bara `+ KG`. Logik: BW är ens vikt, inte en addition — ska stå som identifierare, inte i input-labeln.
- **Arctic-paritet med Daylight.** Niklas frustration: "Varför löser vi inte det från GRUNDEN?" Audit visade Arctic hade 57 overrides, Daylight 124 — gapet på ~67 element var anledningen till att svarta fönster fortsatte dyka upp. Lagt till Arctic-overrides för: AM-pill (alla 3 states), pass-card.done, ex-btn-skip/edit, set-input variants, set-unit/num, sets-group-label, ex-name/detail/prev, ex-tag.ramp/bw/uni/singles, ex-collapsed-name/status/saved, ex-note-input, ex-edit-menu, userScreen, auth-logo/tagline/divider/disclaimer/btn-google/btn-secondary/footer, weight-banner-label/today, section-sub, chain-intro-sub, stat-box/num/desc, pr-card + ::before, pr-value, hist-entry/date/pass/ex/set, toast, scrollbar, app-modal-card/title/body/input/btn (alla varianter), select/swap-select/app-modal-select + option/optgroup, add-ex-input, header-user/logout.
- **PM22 dokumenterat (kvarstår).** Rot-fix: CSS-variabel-refaktor (`--bg-surface`, `--bg-input`, `--bg-menu`, etc) så default sätter mörka värden och ljusa teman bara override:ar variabeln. Eliminerar paritets-arbete för framtida teman och nya komponenter. Estimat ~1-2h, gör i nästa session.

---

## 3.30.15 — 2026-05-22
**UI-polish: tydligare set-row labels, större kollapsade rader, BW-format omvänt, ljus-tema password-fix.** Live-feedback från gymmet.

- **Set-row labels (`KG` / `REPS` / `+F`) större och fetare.** `.set-unit` `.65rem → 1rem` + `font-weight:600`, mobil `.55rem → .88rem`. Var nästan oläsligt på mindre skärmar.
- **Kollapsade övningar tydligare.** `.ex-collapsed-name` `.72rem → .95rem` (+`font-weight:500`). `.ex-collapsed-status` `.56rem → .78rem`. Sessionsöversikten är primärt scan-vy — fonten måste tåla snabbläsning.
- **BW-format vänt om: BW först, vikt efter.** "BW är ens vikt" — det är primär-värdet, inte en addition. Input-label: `+KG (BW:?)` → `BW {snap} + KG`. Last-display, clipboard, history, PR-card: `BW+20kg ×4r` → `BW + 20kg ×4r`. Konsekvent med AM-pillen (`BW 97 kg` från 3.30.9).
- **Arctic password-input bugfix.** Email-fältet fick autofill-styling från browsern (vit bakgrund) medan password föll tillbaka till default `#0a0a0a` — gav asymmetri på ljust tema. Lade till Arctic-override (analog till Daylight) + `:-webkit-autofill`-regler för båda ljusa teman som tvingar konsekvent vit bakgrund.

---

## 3.30.14 — 2026-05-21
**Data-säkerhetspaket: PM20 + PM17 + PM9 + delete-tombstones + PM10-verifiering.** Sista buntningen av premortem-tail.

- **Delete-tombstones för icke-blob-fält.** Trade-offen från SL2 (3.30.11) där deletes kunde återuppstå om en enhet hade gamla data. Ny `state.deletions = { customExercises: {id: timestamp}, exerciseNotes: {id: timestamp} }` (TTL 30 dagar). `deleteCustomExercise()` och `saveNote()` (clear-path) registrerar tombstones. `mergeArrayById` och `mergeKeyedMap` accepterar optional `tombstones`-param och filtrerar bort items. `syncFromCloud` mergar deletions-maps själva (cloud-wins per id) och skickar relevanta sets till merge-helpers. TTL-cleanup i `ensureStateDefaults` (gamla tombstones rensas → eventuell resurrection accepteras efter 30 dagar offline). `src/merge-helpers.js` + tests synkade: 27/27 nu (+4 tombstone-tests).
- **PM20 — Schema-versioning.** `state.schemaVersion` + `SCHEMA_VERSION`-konstant (= 1, baseline post-tombstones) + `SCHEMA_MIGRATIONS`-pipeline-objekt + `runSchemaMigrations()` med safety-cap. Anropas efter `ensureStateDefaults` i alla load-paths (loadStateForUser lokal + cloud + syncFromCloud cloudHasNewerState). Framtida breaking state-format-ändringar: bumpa SCHEMA_VERSION + registrera migration N → N+1.
- **PM17 — Sync-dot tooltip.** `setSyncDot()` uppdaterar dynamiskt `title`-attribute med "Pull: Xm ago · Push: Ym ago · Last error: Z". `_lastSyncError` lagras vid catch i `syncFromCloud`/`pushState`, rensas vid lyckad sync. Mest värde på desktop (mobil-browsers visar inte title-attribute vid touch — där är klicka-till-Settings den primära affordans:en).
- **PM9 — `safeHTML` template-tag (begränsad scope).** Ny utility-funktion som auto-escapar interpolerade `${expr}`. Användning: `safeHTML\`<div>${userInput}</div>\``. För framtida render-kod som rör user-data. Existing import-paths är redan escapade (audit visade att 3.6.0 + 3.27.0 stängde de uppenbara hålen). Full arkitektur-refaktor av `innerHTML`-paths är PM19 (kvarstår).
- **PM10 — Password-reset-verifiering (manuell).** *Kräver Niklas: logga ut → trigga reset-mail från auth-skärmen → följ länken → verifiera att `inPasswordRecovery`-flaggan från 3.17.1 inte loggar in dig automatiskt utan visar reset-form. Inget koda ändras här — bara verifiering att existing fix fortfarande fungerar.*

## 3.30.13 — 2026-05-21
**PM11 + PM12 — iOS Safari background tab purge och Private Mode.** Två iOS-specifika dataförlust-vägar som tidigare var tysta.

- **PM12 — Private Browsing-varning.** iOS Safari Private Mode sätter `localStorage`-quota till 0 (`setItem` kastar `QuotaExceededError` omedelbart). Användaren förlorade all sin data vid tab-stängning utan att veta om det. Ny `detectStorageQuotaIssue()` (quota-probe via `localStorage.setItem('__quota_probe__', '1')` i try/catch) körs i `handleSession` efter `showAppShell`. Om probe failar visas permanent röd banner: *"Private Browsing detected — your training data WILL NOT be saved between sessions. Open thechain.training in a regular tab to keep your data."* PM8-fixen (toast vid quota-fel) finns kvar som backup.
- **PM11 — Background tab purge.** iOS Safari kan kill background-tabbar för att frigöra minne. Halvloggade kg/reps/forced i DOM-inputs som inte hunnit synkas till `state.draft.inputBuffer` försvinner. Ny `captureAllDraftInputs()` itererar alla aktiva exercises i `state.draft` och anropar `captureInputsToSetsBuffer(exId, passId)` för varje. Hookat in i tre paths:
  - Ny `pagehide`-handler (mer reliabel än `beforeunload` på iOS-purge) → capture + lokal save + `keepaliveCloudPush()`
  - `beforeunload` uppdaterad med samma capture + lokal save innan keepalive-push
  - `visibilitychange` hidden uppdaterad att capture innan `pushState()`
- **Refaktor:** beforeunload-handlerns inline payload-bygge + fetch extraherad till `keepaliveCloudPush()`-helper. Återanvänds av nya pagehide-handler. Inga funktionella ändringar i beforeunload utöver capture-tillägg.

## 3.30.12 — 2026-05-21
**PM6/PM7/PM8 — slutför premortem-tail som var samma kategori som SL-fynden.** Niklas påpekade att jag missade att bunche dessa med 3.30.11 trots att de hör hemma i samma audit.

- **PM6 — `save()` saknar `isFreshState`-guard.** `pushState` vägrade redan pusha fresh state till cloud, men `save()` kunde fortfarande skriva freshState till localStorage. Race kunde permanent korrumpera localStorage med tom data. Analog guard tillagd: `if(currentUser && isFreshState(state)) return;` innan localStorage-write.
- **PM7 — `BASE_SESSIONS`-mutering borttagen (rotorsak).** Tidigare muterades `BASE_SESSIONS[i].name` vid load + syncFromCloud till `state.sessionNameOverrides[id]`. Global mutable är race-känslig och svår att resonera om. Ny helper `getSessionName(passId)` resolve:ar overrides vid läsning. Mutering borttagen från `loadUserData` och `syncFromCloud`. Direkt-läsningar (`pass.name`) i renderChain (pass-header + chain-strip), reorder-list (rad ~5013) och finishSession (log-entry `passName`) uppdaterade till `getSessionName(pass.id)`. `_BASE_SESSION_NAMES`-cachen borttagen (dead code efter). SL7-mutexen från 3.30.11 är fortfarande på plats som extra skydd.
- **PM8 — localStorage quota-fel inte längre tyst.** `save()`-catch:en visar nu `showToast('Local storage full — recent changes may not be saved offline', 5000)` vid `QuotaExceededError`/code 22/quota-message. Detekterar via `e.name`, `e.code` eller regex på `e.message` (cross-browser varianter).

## 3.30.11 — 2026-05-21
**Synk-audit — täpper SL1–SL9.** Niklas bad om proaktiv audit av synk-funktionen efter LT:s "desktop-modding försvinner på mobilen". Audit hittade 9 luckor i `syncFromCloud`/`pushState`/event-handlers. Alla fixade i denna release. Trade-off accepterad: deletes från andra enheten kan återuppstå om denna enhet hade gamla data — bättre än att tappa creates (vilket var nuvarande beteende).

- **SL2 — Merge per-id istället för `state=cloud`-overwrite.** Tidigare ersattes hela state med cloud när `cloudHasNewerState`, vilket utraderade lokala icke-loggade ändringar (custom, swaps, notes, tags). Nya merge-helpers (`mergeArrayById`, `mergeKeyedMap`, `mergeArrayUnion`, `mergeMapOfArrays`, `mergeMapOfArrayById`) mergar union per id/key med cloud-wins-vid-konflikt. Skyddar `customExercises`, `addedExercises`, `removedExercises`, `hiddenRemoved`, `exerciseOverrides`, `sessionNameOverrides`, `exerciseNotes`, `exerciseTagOverrides`, `permanentSwaps`, `exerciseOrder`, `ignoredPRs`, `importedPRs`, `lastSessionSetCount`, `lastSessionNotes`.
- **SL1 + SL9 — Flush-before-sync.** `flushAndSync(userId)` flushar pending debounced push INNAN sync körs. Visibility-change-visible, window-focus och periodic 30s-sync använder den nu. Tidigare kunde 200ms-gamla lokala ändringar (inom 800ms-debounce-fönster) bli överskrivna av sync.
- **SL3 — Pull-before-push i `pushState`.** Innan upsert: kör `syncFromCloud` så lokal state mergas med cloud's nya entries. Skyddar mot last-write-wins-overwrite när andra enheten just pushade. Skippas vid retry (vi har redan failed state att skicka) och om sync redan pågår.
- **SL4 — `state.hiddenRemoved` defaults.** 3.30.7 introducerade fältet men glömde init i `ensureStateDefaults` och `freshState`. Krasch-risk vid cold load eller efter `state=cloud` med gammal cloud-data. Defaults tillagda.
- **SL5 — Server-timestamp från upsert response.** `sbUpsert` använder nu `Prefer: return=representation` och returnerar `updated_at` från servern. `pushState` sätter `lastSyncedCloudTime` till server-tid istället för `Date.now()`. Eliminerar clock-skew-bug där klient med klockan framåt ignorerade legitima cloud-uppdateringar.
- **SL6 — Exclude `draft` från cloud.** Drafts är device-lokala (pågående session med inputBuffer/loggedSets hör inte hemma i delad state). `pushState` klonar state utan draft, `syncFromCloud` bevarar lokal draft vid `state=cloud`. Beforeunload-fetch också uppdaterad.
- **SL7 — Mutex på `syncFromCloud`.** `_syncInFlight`-flagga förhindrar två parallella sync-anrop som kunde lämna `BASE_SESSIONS` i halvuppdaterat tillstånd (PM7).
- **SL8 — Retry vid push-fel.** Exponential backoff (2s, 4s, 8s × 3 retries) via `_pushRetryTimer`. Tidigare tystnade fel — om appen stängdes innan nästa save var cloud out-of-sync.

## 3.30.10 — 2026-05-21
**Custom exercise add-bugg (LT), Tags-klick + engelska, Arctic textfärg, kollapsade rader polish.** Lawrence Thompson rapporterade två buggar; Niklas tre punkter från dagen:

- **Custom exercise add fungerade inte (kritisk regression — LT).** Rotorsak: `confirmAddEx` använde browser-`prompt()` som blockeras av Android Chrome (och desktop Chrome om sajten visat "för många" dialogs). Bytt till `askModalText`-modal med category-selector, samma mönster som `doSwap`. Plus en latent crash-bug i `confirmAddPermEx` (rad 5762) där `result.trim()` anropades på ett object — fixad i samma svep. Båda flöden skapar nu även en permanent custom exercise via `addCustomExercise()` så den faktiskt syns i Custom Exercises-listan (LT's "doesn't show up in my list").
- **Tags-klick fungerade inte (Niklas).** `buildTagEditorHTML` använde `JSON.stringify(eid)` för att bygga `onclick`-strängen — det genererar `"foo"` med dubbla quotes som krockar med `onclick="..."`-attributets egna quotes och bryter HTML-parsningen. Bytt till manuell single-quote-bygge.
- **Tags-legenda på engelska (Niklas).** Desc-strängar i TAGS-arrayen översatta (Öka vikten → Increase weight, etc.).
- **Arctic textfärg för ljus (Niklas).** `--gray-light` i Arctic-temat: `#5a7a88` → `#2a4a58`. Secondary text via `var(--gray-light)` (`+ note`, `Ramping → ...`, status, m.fl. — 56 användningar totalt) får nu tydlig kontrast mot den ljusa cyan-vita bakgrunden. WCAG AA-kompatibelt.
- **Kollapsade rader — tydligare distinktion (Niklas).** Chevron `▸` upplevdes som "minus-tecken på andra sidan". Bytt till `▼` (solid down-triangle, font-size .78rem, opacity 1, tema-färg). Text `.62rem` → `.72rem`, padding `11px 10px` → `13px 12px`, separator-border `#232323` → `#303030`. Status `.5rem` → `.56rem`.

## 3.30.9 — 2026-05-20
**AM-pill label + chevron-affordans på kollapsade övningar.** Två kvälls-fynd från Niklas + polare:

- **AM-pill säger inte vad det är.** `97 kg` → `BW 97 kg` när loggat, `+ AM` → `+ BW` när saknas. Konsekvent med befintliga BW+-taggen, självbeskrivande utan att man måste klicka.
- **Kollapsade övningar — chevron på vänster kant.** "—" på höger sida förklarade inte att raden var expanderbar. Ny `▸`-glyf (font-size .65rem, opacity .7) först i `.ex-collapsed-summary`-grid:en på alla expandera-bara rader. Done-rader (read-only, inget att expandera) saknar chevron. Default "ej börjat"-status ändrad från `'—'` → `''` så raden ser ren ut — chevron är nu enda affordans.

## 3.30.8 — 2026-05-20
**AM-header — morning weight som pill i headern.** Tog bort hela `weight-banner`-raden från Chain-vyn och flyttade morning weight till en kompakt pill i headern (bredvid version/sync-spannet). Stängd: `[⚖ 78.5 kg]` (grön när loggat idag, röd-tonad `+ AM` när saknas). Klick → expand till inline-input + Log-knapp. Enter loggar, Escape kollapsar, klick utanför kollapsar. Hooks: `refreshAmPill()` körs vid login, vid Chain-render och efter lyckad `logWeight()`. Auto-anpassad för unit (kg/lbs) — step/min/max + label uppdateras dynamiskt. Sparar ~50px vertikalt utrymme på mobil → chain-strip + sessions får mer plats. **Notera:** på smal mobil kan headern bli trång eftersom "Training as Niklas" + Log out + pill + version + sync alla samexisterar. Variant B (avatar-meny) finns redo att tas om det blir trångt.

## 3.30.7 — 2026-05-20
**UX-polish-paket: gym-feedback #2, #3, #5, #6.**

- **#5 — Remove via övningens edit-knapp fungerar nu för added-övningar.** `removeExerciseFromSession` detekterar `added_*`-id och dirigerar till `removeAddedExercise` (removedExercises är bara för base-övningar — added stannade kvar trots Remove-klick).
- **#6 — Permanent delete av removed exercises.** Ny `state.hiddenRemoved[passId]` + `permanentlyDeleteRemoved()`. `✕ Delete`-knapp (röd) bredvid `+ Restore` (neutral) i Removed-sektionen. Confirm-dialog förklarar att övningen fortfarande finns i Add Exercise-biblioteket.
- **#3 — Tag-förklaringar.** `buildTagEditorHTML` har nu `desc:` per tag och visar en legenda under tag-knapparna: "Ramp — Öka vikten på varje set", "BW+ — Kroppsvikt + extra last", "Unilateral — En sida i taget", "Timed — Tidsbaserat i sekunder", "Singles — 1-rep sets med tung vikt". Tidigare beskrivning på övningarnas detail-text ("1 set failure" för Ramp) var missvisande.
- **#2 — Separator mellan kollapsade rader.** Lade till `.ex-block.collapsed + .ex-block.collapsed { border-top:1px solid #232323; }` så grupper av kollapsade övningar får tydlig vertikal gruppering. Plus ökade padding från `9px 8px` → `11px 10px` för bättre andningsrum.

## 3.30.6 — 2026-05-20
**Punkt #7 — Done-övningar och avslutade sessioner är nu kollapsade.** V1 Collapse stängde av sig själv när allt var Done eller sessionen avslutades. Två fall lagade: (1) **Pågående session där alla övningar är saved/skipped** → `activeExId` blir null (resolution-loopen hittar ingen öppen), och `isCollapsed = !isDone && activeExId && ...` blev `false` → allt expanderades. Ny logik: `const allClosed = pass.exercises.every(e=>savedExs[e.id]); isCollapsed = isDone || (activeExId ? activeExId !== ex.id : allClosed);`. (2) **Avslutad session (isDone)** → `activeExId`-resolution kördes inte alls (det är inom `if(!isDone)`). Nu collapsed by default. `collapsedStatus` har ny gren för isDone som läser från `completedData`/`savedData` (visar `✓ X sets` eller `Skipped`). Done-rader har `cursor:default` och inget onclick — read-only. För att redigera en avslutad session: använd Undo Session (oförändrat).

## 3.30.5 — 2026-05-20
**Punkt #4 — "Extra" + "+ Program" skapade dubbletter.** `saveExtraToProgram` la till övningen permanent i `state.addedExercises[passId]` men tog inte bort den från `state.draft.extras` → övningen renderades både som ny base-exercise (via `getEffectiveChain`) och som "Extra" (via `buildExtraBlock`). Bonus-bug: alla redan loggade sets på extran tappades eftersom permanent-id (`added_*`) skiljer sig från extra-id (`extra_*`). Fix: migrera in-progress draft-state (savedExercises, extraSets, loggedSets, inputBuffer) från `extra_${passId}_${idx}` → nya `added_*`-id, sedan kalla `removeExtra` som städar extras-listan och re-indexerar resten.

## 3.30.4 — 2026-05-20
**Punkt #1 — Tag-menyn (Ramp m.fl.) gick ej att klicka.** Rotorsak: två `<div id="tagwrap-${ex.id}">` med samma ID renderades inom session-vyn — en från `buildTagEditorHTML()` och en inline-duplikat som hängt kvar från tidigare iteration. ID-kollision → `getElementById` träffade bara den första, oklart om båda elementens display-state hölls synkade efter rerender. Tog bort inline-duplikaten (rad 4527–4539). `buildTagEditorHTML()` används nu konsekvent på alla tre platser (session-vy, edit-program, V1 Collapse).

## 3.30.3 — 2026-05-20
**Set-row UX-polish.** Två småfix från gym-feedback (Niklas + polare): (1) **LOG-knappens höjd** matchade inte input-fältens — `.set-log-btn` font-size `.5rem` → `.7rem` så den får samma höjd som `.set-input` (och samma som `.set-logged-indicator` som redan var korrekt). Visuellt en jämn rad nu. (2) **KG/REPS/+F-labels** under inputs var för små: desktop `.55rem` → `.65rem`, mobil ≤360px `.38rem` → `.55rem`. Mobilstorleken var nästan oläslig.

## 3.30.2 — 2026-05-19
**V1 Collapse — två buggar fixade.** (1) `isCollapsed`-checken krävde fortfarande att `draft` fanns, så 3.30.1:s resolve-fix gjorde inget — NEXT UP-pass visade alla övningar expanderade. Bytt `draft &&` mot `activeExId &&`. (2) Auto-resolve hade en `curIsOpen`-check som ansåg Done/Skipped-övningar inte var öppna → om användaren tappade på en Done-rad för att se den, bytte systemet omedelbart tillbaka till nästa öppna övning. Done-rader var i praktiken låsta. Bytt till `curExists`-check som tillåter explicit Done/Skipped som aktiv när användaren medvetet valde det.

## 3.30.1 — 2026-05-19
**V1 Collapse — fix för NEXT UP-pass.** 3.30.0 triggade collapse bara när draft fanns (passet var "in progress"). NEXT UP-pass (inte startat) saknar draft → alla övningar var fortfarande expanderade. Nu: collapse fungerar oavsett pass-state. Default vid preview = första övningen aktiv, övriga kollapsade. Klick på annan kollapsad rad skapar draft + sätter den som aktiv. Draft skapas alltså vid medvetet val av aktiv övning, men passet visar fortfarande "Next up" tills första `LOG`/`Save` sker.

## 3.30.0 — 2026-05-19
**V1 Collapse — aktiv övning expanderas, andra kollapsar.** Density-fix baserad på Claude Designs V1-mockup. En övning åt gången är fullt expanderad (set-rader, edit-knappar etc), övriga visas som en kompakt rad med namn + tags + status (`✓ 3 sets`, `Skipped`, `—`). Tap på kollapsad rad → expanderar den + kollapsar förra (radio-stil). Done/Skip av aktiv övning auto-promotar nästa öppna övning. Done:ade övningar kollapsas automatiskt men kan tappas för att öppnas igen om man behöver kolla över något. Nytt fält `draft.activeExerciseId` håller aktiv övning per session, persistar över reload/visibility-change. Ingen state-migration behövs (default null → lazy-resolve i `buildPassBodyHTML`).

## 3.29.2 — 2026-05-19
**P6 — iOS dropdowns i Daylight (Johannes-bug).** Lagt till `color-scheme: dark` på body (default, eftersom Iron är mörk) och `color-scheme: light` på de två ljusa temana (Daylight, Arctic). Detta instruerar iOS Safari att rendera native `<select>`-popups med rätt tema oavsett systemets dark/light mode — fixar "svart text på svart bakgrund" som Johannes rapporterade vid övningsbyte i Daylight på iOS med dark mode aktivt. Stöds av iOS Safari 15.4+, dvs. praktiskt taget alla iPhones idag. Bonus: mörka teman (Iron, Crusader, Ember, Void, Nightcity, Nanosuit) får konsekvent mörk popup oavsett system-tema.

## 3.29.1 — 2026-05-19
**PM3 — Service Worker.** Skapat `sw.js` med stale-while-revalidate-strategi för statiska resurser (index.html, fonts, CDN-script, bilder). Supabase-anrop passas igenom som network-only — synk/auth får aldrig serveras från cache. Cache-key är versionerad (`thechain-cache-v${APP_VERSION}`) så ny version automatiskt rensar gammal cache vid activate. SW registreras med `./sw.js?v=${APP_VERSION}` så browsern ser ny URL per version → installerar ny SW utan manuell sync mellan filer. Konsekvens: PWA-installerade användare får offline-stöd + snabbare laddningstid. Ny version når användare omedelbart vid nästa visit (skipWaiting + clients.claim).

## 3.29.0 — 2026-05-19
**PM1 — Multi-device synk-race löst.** `syncFromCloud` använder nu Supabase server-timestamp (`updated_at`) som auktoritativ tid istället för klient-clock, vilket eliminerar dataförlust från klock-skew mellan enheter. Dessutom mergas `log` och `weightLog` på entry-nivå (dedup via `passId|timestamp` resp. `date`) istället för `state=cloud` replace — split-brain (två enheter loggar parallellt offline) leder inte längre till att en sida tappar entries. Ny tracking-fält `state.lastSyncedCloudTime` håller koll på var i tiden vi senast var i synk. `pushState` flyttar fram fältet efter lyckad push så att vår egen skrivning inte tolkas som någon annans.

## 3.28.3 — 2026-05-19
**PM4 — Pre-import state snapshot.** `importTemplate` sparar nu `state_before_import_${Date.now()}` i localStorage innan state ersätts. 7-dagars retention via cleanup-loop i samma try-block. Tyst `console.warn` vid quota-fel (snapshot är safety-net, inte gating). Rollback möjlig från devtools.

## 3.28.2 — 2026-05-19
Lagt till **Power Clean** och **Power Clean + Shoulder Press** i `EXERCISE_LIBRARY` Back-sektionen (alfabetiskt mellan Neutral Grip Pull-ups och Pull-ups).

## 3.28.1 — 2026-05-18
**Johannes-bugg + fel support-mail.** `saveExercise`/`skipExercise` lade till `permanentSwaps` i namn-fallback (perm-swappad övning föll tillbaka till BASE_SESSIONS-namn vid Save/Done → blandad historik). Prioritet matchar nu render-koden: `draft.swaps > permanentSwaps > exerciseOverrides > base`. Support-mail bytt från `oresonlig@gmail.com` (existerade ej, mails studsade) till `niklgron@gmail.com`.

## 3.28.0 — 2026-05-12
**QoL-paket: 4 features + import safety-net.**
- F1: Work sets propageras mellan sessioner (`lastSessionSetCount`)
- F2: Notes carry-forward (`lastSessionNotes` + fryses i log-entry)
- F3: Weight ✕ → "Delete"-knapp
- F4: PR delete (`ignoredPRs`-filter + `ignorePR` med confirm)
- Safety-net: `finishOnboarding` kollar `isFreshState` innan överskrivning

## 3.27.1 — 2026-05-12
**Import-bugfix.** `importTemplate` sätter `state.onboardingDone=true` så onboarding inte triggas vid nästa load (vilket Skip:ade och överskrev importerad kedja med standard A-F).

## 3.27.0 — 2026-05-12
**Full kodgranskning: 19 fynd åtgärdade.**
- **Säkerhet:** 5 XSS-hål stängda (`askModalConfirm` body på 4 call-sites, `renderProgress` pr.name+ex.name+passName, `renderData` currentUser.name, `buildReorderUI` pass.name)
- **Krasch-fix:** `ensureDraft` initialiserar `inputBuffer`+`loggedSets`
- **Buggar:** flera vilodagar visas som V/V2/V3 (inte alla "V"), `finishSession` har pass-guard, `syncFromCloud` anropar `ensureStateDefaults` istället för duplicerad defaults-lista, Supabase config avduplicerad (`window.SB_CFG`)
- **Städ:** orphan `weightStep` borttagen, `location.reload(true)` → cache-bust query, `getEffectiveChain` cache inkluderar `exerciseOrder`, `ALL_EXERCISES` borttagen, `unsaveExercise` else-gren borttagen

## 3.26.5 — 2026-05-11
**Arctic approved + chain done-tab fix.** Arctic Terminal-temat godkänt, WIP-label borttagen.

## 3.26.4 — 2026-05-11
Arctic chain-intro: riktig cracked-ice photo background. Watermark-free version.

## 3.26.3 — 2026-05-11
Arctic: animation fix + dark-field purge + cracked-ice SVG fix.

## 3.26.2 — 2026-05-11
Arctic Terminal v3: honeycomb hex, mist animation, cracked ice banner, frost blend.

## 3.26.1 — 2026-05-11
Arctic Terminal v2: synligt hex-monster, starkare frost, nitrogen uppifrån.

## 3.26.0 — 2026-05-11
Arctic Terminal: konverterat till ljust tema med glassmorfism.

## 3.25.0 — 2026-05-11
Finish Session: X/Y-tracker + disabled-fix i 4 teman + Void chain strip + WIP-labels.

## 3.24.4 — 2026-05-10
Chain strip polish: hexagoner +10% (44px desktop / 40px mobil), active-accent 36%→52% red-mix, granntext (CHE/BAC etc.) återställd på mobil.

## 3.24.3 — 2026-05-10
**Android keyboard scroll-jump fix.** `interactive-widget=resizes-visual` i viewport-meta — tangentbordet overlay:ar istället för att krympa layouten, eliminerar scroll-hopp vid input-focus.

## 3.24.2 — 2026-05-10
Chain strip: tema-adaptiva färger (`color-mix`) + guldig vilodag + mobil-fix.

## 3.24.1 — 2026-05-10
Chain strip: avlånga hexagoner (clip-path) med två-tonad bakgrund.

## 3.24.0 — 2026-05-10
**Chain strip spotlight redesign.** Active/adjacent/distant-states, ingen studs vid sessionsbyte.

## 3.23.2 — 2026-05-10
Chain strip: komprimerade inaktiva flikar passar utan scroll.

## 3.23.1 — 2026-05-10
Chain strip polish: fading, sizing, expansion, rest-day grey.

## 3.23.0 — 2026-05-10
**P3 — Horisontell kedjenavigation.** `chain-strip-outer` med `chain-tab` per session, `selectSession()` med fade-animation, `buildPassBodyHTML()` extraherad.

## 3.22.1 — 2026-05-10
**P4 root cause fix.** `doSwap()` rensade inte `savedExercises`/`loggedSets`/`inputBuffer` för bytt övning.

## 3.22.0 — 2026-05-10
**Live-test fixes.** P2 swap-preview rätt historik, P6 0-reps→"0r" i clipboard, P1 defensivt `rawSets`-fallback, P4 dubbel-validering i `finishSession`, P5 Military Press Smith tillagd.

## 3.21.0 — 2026-05-07
**Crusader pass cards: forged weathered metal.** Rust radial gradients i 4 hörn, edge-vignette, diagonal skrapning, metallisk gradient lit from upper-left, multi-axis shadows för vikt, skarpa hörn.

## 3.20.2 — 2026-05-07
Crusader korspos-fix: kapad bredd (65vh + max-width 75vw + transform translate 18%). Pulse via separat `#crusader-cross-glow` med screen blend.

## 3.20.1 — 2026-05-07
Crusader nav-fix: ta bort `position:relative;z-index:2` på header/nav som krockade med base `position:sticky/fixed`.

## 3.20.0 — 2026-05-07
**Crusader v2.** Byt ut SVG mot `crusader2.jpg` + multiply blend, mörk warm-charcoal bakgrund, kors off-center höger, separat glow-layer för pulse.

## 3.19.0 — 2026-05-07
Crusader theme rebuild v1: inline SVG-kors, parchment-ljus bakgrund. **Ratad** — för ljust, fel kors, ingen synlig animation.

## 3.18.1 — 2026-05-07
Fix: Finish Session enabled before all exercises are done.

## 3.18.0 — 2026-05-07
**Data → Settings rename**, Rebuild Chain-kort i Edit Program, Finish Session-bug fix.

## 3.17.1 — 2026-05-07
**Lösenordsåterställning-fix.** `inPasswordRecovery`-flagga förhindrar att `getSession()` loggar in användaren direkt istället för att visa reset-form.

## 3.17.0 — 2026-05-07
**Kodgranskning.** B1 `addExerciseToSession`-skuggning, B2 `setSyncDot`-param, B3 saknad `.set-logged` CSS, B4 dubbel `visibilitychange`. Rensning av ~100 rader dead CSS + `stepWeight()`.

## 3.16.0 — 2026-05-06
**P22 state-migration.** `migratePassKeysToSession()` i 3 load-punkter, bracket notation för säkerhet.

## 3.15.0 — 2026-05-06
**P22 rename.** `passOrder`→`sessionOrder`, `passNameOverrides`→`sessionNameOverrides`, `BASE_PASSES`→`BASE_SESSIONS`, m.fl.

## 3.14.1 — 2026-05-06
Polish Add/Remove card buttons + Exercises page header.

## 3.14.0 — 2026-05-06
**Drag-to-reorder övningar inom pass.** SortableJS, `state.exerciseOrder[passId]`.

## 3.13.1 — 2026-05-06
P17 Log Out confirm-dialog, P23 Rename+Exercises→ knapp-styling.

## 3.13.0 — 2026-05-06
**Onboarding-redesign.** Step 0 path-val (questions/import/skip) + Step 2 experience level (sätter rest+timer-defaults).

## 3.12.1 — 2026-05-06
PR-badge svart kloss på Daylight + Crusader (`pr-card::before` override).

## 3.12.0 — 2026-05-06
**P19 Tema-audit.** 15 kontrastbuggar fixade i alla 8 teman (`auth-btn-primary`, `ex-done-primary`, `pass-card::before`, `ex-block.saved`, `btn-primary:disabled`).

## 3.11.4 — 2026-05-06
Ta bort redundant Done-knapp från Sort + Add/Remove (Save är enda exit).

## 3.11.3 — 2026-05-06
**P20+P21.** "← Done" i Edit-flödet, tappable exercise cards med inline tag-editor.

## 3.11.2 — 2026-05-06
Swap-namn visas korrekt i preview + done-vy (temp + perm swap).

## 3.11.1 — 2026-05-06
Finish Session disabled tills ALLA övningar är done/skipped.

## 3.11.0 — 2026-05-06
**P18.** Extra övningar synliga i avslutad session + fixat i copy.

## 3.10.0 — 2026-05-06
**P9 Edit-sida.** Save uppe bredvid titel, Forced Rest inbyggt i Add/Remove, multipla viladagar.

## 3.9.0 — 2026-05-06
**P15+P16 Template v2-format.** Import/export redesign, blank template, UI-text.

## 3.8.0 — 2026-05-06
**P12.** Undo efter avslutad session återställer redigerbart draft.

## 3.7.1 — 2026-05-06
Copy-bugg: Dead Hang (BW+timed) visade `?r` istället för sekunder.

## 3.7.0 — 2026-05-06
**P13 lösenordsåterställning, P14 copy-knapp förstorad.**

## 3.6.0 — 2026-05-06
**XSS-fix.** `escapeHTML()` + systematisk `innerHTML`-audit (14 injektionspunkter täppta).

## 3.5.0 — 2026-05-06
`renderChain`-refaktor: `buildExtraBlock`, `buildRemovedSection`, `buildAddExRow`, `buildPassFooter`.

## 3.4.0 — 2026-05-05
**P10 Import/export template v1.** `exportTemplate`/`importTemplate`, `importedPRs`.

## 3.3.1 — 2026-05-05
Dynamic header version + Crusader fix (text color, cross, animations, theme buttons).

## 3.3.0 — 2026-05-05
**Crusader theme** + copy från historiska pass (⎘-knapp i hist-entry via `copyLogEntryToClipboard`).

## 3.2.0 — 2026-05-05
**P2 iOS zoom** (CSS 16px fix), **P8+P11** permanenta extra övningar (`addedExercises`, `showEditExercises`).

## 3.1.0 — 2026-05-04
**P3.** Extra övningar hela flödet (unified rendering, stabila IDs, Log/Note/Skip/Done).

## 3.0.0 — 2026-05-04
**P1 synk-bugg, P4 scroll Add exercise, P5 Daylight-knappar, P7 Back Extension, PWA manifest, Copy session.**
