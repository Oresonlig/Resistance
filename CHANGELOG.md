# Changelog

Spårbar versionslogg för The Chain. Nyaste överst. Datum från git-historik.

Format: `MAJOR.MINOR.PATCH` — patch = bugfix/små tillägg, minor = ny feature, major = stora omtag.

---

## 3.72.4 — 2026-07-08
**Login: mobil-omtag (fokuskedjan = hjälten) + hexmönstret tema-tintat & av-fyrkantat (Niklas mobil-skärmdump + hex-feedback).** **Mobil (appens primära enhet):** loginskärmen var packad — bakgrundskedjor "slice"-zoomade över hela bilden "som inte sa ett dugg", och själva fokuskedjan (den med pass-labels, hela poängen) låg urblekt (0.5) och etikettlös = utom synhåll. Omtag: (1) bakgrundsfältet skärs hårt på `≤940px` (statiska lager 5/3/1, live-kedjor 1). (2) Fokuskedjan är nu HJÄLTEN: skarpare (0.72), kortad till 5 länkar (via JS så den glödheta länken hamnar i övre hero-bandet ovanför formuläret) och BARA den glödheta länken behåller sin etikett "+ FORGE YOUR NEXT LINK", omcentrerad UNDER länken så den inte spiller över skärmkanten. (3) Serif-raden ("Pick up where the chain left off") göms på mobil — för mycket text, gav kedjan plats. **Hexmönstret:** var en hårdkodad-orange hex-BILD vars mask fortfarande läste som ett rektangulärt block ("still very square"). Omgjort till en MASK på en accent-färgad yta (`background:var(--accent)` + `mask-composite:intersect` mot en mjuk off-center fade) → hexarna följer nu temats färg OCH löses upp mjukt i bakgrunden utan hård kant. Samma teknik på hex-ringen runt formuläret (`.cl-aura-hex`). 152 tester gröna. **EJ browser-verifierat** (sandbox saknar browser) — mobil-layouten särskilt behöver Niklas ögon.

---

## 3.72.3 — 2026-07-08
**Login: teman känns äntligen distinkta + mobil-declutter (Niklas: 3.72.2 var "4 färger som roterar, inget distinkt; Cosmic ådror / Nanosuit puls syns aldrig").** **Rotorsak till platthet — temats ambient var helt gömt:** `setThemeVisual()` monterar faktiskt varje temas ambient-system (Nanosuits hex-puls, Cosmics ådror, Obsidians glöd) under rotationen, men de renderar på `z-index:0` medan `.cl`-scenen låg på `z-index:100` med en OGENOMSKINLIG bakgrund → de målades bakom en solid vägg, aldrig synliga. Fix: `.cl` background → `transparent` så det aktiva temats ambient syns IGENOM scenen (bakom kedjan). `--bg`/`--bg-2` kvar låsta (formulärets aura använder dem + body:s temafärgade `--black` är basen, `.cl-vignette` mörkar kanterna → ingen ljus-flash). **Typsnitt per tema:** wordmarken "THE CHAIN" använder nu `var(--display)` (temats font: Bebas/Orbitron/Rajdhani/Playfair/Cinzel/Cormorant SC) istället för alltid-Archivo → varje tema läser distinkt. **Glöden tema-tintad:** `.cl-heat` + `.cl-spine` (uppåtglöden) följer nu `--accent` istället för hårdkodad forge-orange ("glöden ändrades aldrig oavsett tema"). Den glödheta kedjelänken + gnistorna förblir forge-orange (Niklas tidigare val — "du forgar din nästa länk", en varm konstant mot temavärlden bakom). **Mobil-declutter:** bakgrundsfältets kedjor "slice"-zoomades på smal viewport → dränkte fokuskedjan ("kedjor över hela bilden som inte säger ett dugg"). Bakgrundstätheten skärs hårt på `≤700px` (statiska lager 26/15/5→6/4/2, live-kedjor 6→2). **KVARSTÅR mobil:** fokuskedjan (den med pass-labels) är fortfarande undanskymd på mobil — kräver layout-omtag som väntar på skärmdump från Niklas. 152 tester gröna.

---

## 3.72.2 — 2026-07-08
**Login-screen: locked background + dark-only rotation + fixed white-on-white button (Niklas live feedback, `loginbugg3.png`).** **Dark→light transitions were too harsh:** the demo now rotates ONLY the `cat:'dark'` themes (Iron/Nanosuit/Night City/Ember/Void/Obsidian/Cosmic Horror) — Arctic/Undertow/Overgrowth never appear in the login loop (still normal choices in Settings after login). **Even dark→dark felt too sharp (esp. Void, pure `#000`):** `.cl`'s `--bg`/`--bg-2`/`--panel` are no longer `var(--black)`/theme-driven — locked to one fixed near-black tone (Cosmic Horror's `#03080a`, per Niklas: "typ Cosmics, behåll den") across every theme. Only accent color, chain-label color, and font/border-tint still vary per theme; the scene itself never jumps color anymore. **Classic white-on-white bug:** Void's accent (`--red`) is pure white, and `.cl-btn--primary` hardcoded white button text → invisible text on a white button ("en vit klump man inte vet vad den gör"). Root cause was broader than Void alone — deleting the old per-theme `.auth-btn-primary` CSS in 3.72.0 silently dropped 5 themes' dark-text overrides (Night City's yellow, Nanosuit's cyan, Obsidian's gold, Cosmic Horror's teal all need dark button text too, not just Void). Fixed properly with a new `--on-accent` token (default `var(--white)`, overridden to a dark tone in those 5 themes' own var() blocks) instead of one hardcoded color. 152 tests green.

---

## 3.72.1 — 2026-07-08
**Login-screen polish (Niklas live feedback, two screenshots in `\Bugg`).** **Bug #1 — hard-edged rectangle around the form:** `.cl-hex`/`.cl-aura`/`.cl-aura-hex` used `mask-image: radial-gradient(#000 X%, transparent Y%)` to feather their edges. `mask-image` on a plain CSS gradient defaults to LUMINANCE masking (white=show, black=hide), not alpha — `#000` as the "visible" stop was backwards, so the mask failed open and rendered as a flat, hard-edged box instead of a soft feather. Fixed by swapping `#000`→`#fff` in all three masks. **Bug #2 — boxy chain-link glow:** the hot link's "ember glow" was `filter:drop-shadow(...)` on the link's rounded-RECT silhouette, which blurs into a rectangular halo, not a natural glow. Replaced with a round radial-gradient bloom (new `.cl-hot-glow` — an SVG circle behind the link, `clGlow` gradient in `chain-login.js`'s defs) for a genuinely soft, round ember light. **Pacing — "everything feels rushed":** theme-rotation interval 7s→16s (more time to actually see each theme), fade transition 0.7s→1.8s with `cubic-bezier(.4,0,.2,1)` easing instead of linear `ease`, plus a short 300ms settle-in-the-dark pause before fading back up (mirrors the old curtain's "let it breathe" beat that got lost when the curtain was removed in 3.72.0). Hot-link/ember pulse also slowed 4.4s→5.5s to match the calmer overall feel. 152 tests green.

---

## 3.72.0 — 2026-07-08
**Ny loginskärm: "basement forge"-design (Claude Design-handoff, `theme/login/`) + fade-buggen fixad.** Niklas gav feedback på 3.71.1s helskärms-ridå: formuläret försvann helt under temabytet ("va fasen"-effekten), och separat bad han att den nya designen som Claude Design levererat portas in på riktigt. Båda löstes i samma pass. **Fade-fixen:** `authThemeFadeSwap` fadar nu bara element taggade `.cl-fade-layer` (kedjor, embers, hero, hex, vinjett) — `.cl-authwrap` (email/lösenord, Google-knapp, glöm lösenord, sign up) är ALDRIG taggat och försvinner därför aldrig, oavsett vilket tema som roterar in. Ingen helskärms-ridå kvar. **Design-porten:** hela `#userScreen` bytt från den gamla platta auth-boxen till scenen från handoffen — hängande fysik-animerad stålkedja (understa länken glödhet, "+ FORGE YOUR NEXT LINK"), ett djupt bakgrundsfält av hundratals andra kedjor ("din kedja är en av tusentals", pre-blurrade lager + EN master-rAF för hela scenen), gnistregn vid hover på Log In, ember-partiklar + hex-mönster + vinjett. Portad från `theme/login/{Login.html,chain-login.css,chain-login.js,embers.js}` in i `index.html` (prototypfilerna kvar oförändrade som referens). **Tokenisering:** `.cl`-root pekar på appens befintliga per-tema-variabler (`--black/--white/--red/--surface-elevated/--border-*` + `color-mix()` för glow/muted-nyanser) så scenen reskinnas automatiskt över alla 10 teman — hela den gamla `#userScreen`/`.auth-logo`/`.auth-divider`/`.auth-btn-*`-CSS:en (default + 9 per-tema-overrides) borttagen som obsolet. Två saker är MEDVETET lämnade som fasta konstanter, inte tokeniserade (Niklas beslut): den glödheta länken/gnistorna (alltid forge-orange, aldrig temats accentfärg) och atmosfär-lagren (vinjett/heat/spine/hex-textur) — samma resonemang som kedjelänkarnas neutrala stål redan följde i originaldesignen. Ember-partikelsystemet körs enhetligt i alla teman (ingen per-tema ambient-swap denna omgång). `#auth-signup-fields`/`.auth-checkbox-row`/`.auth-disclaimer`/`#auth-message`/`#reset-message`-klasserna finns kvar (JS beror på dem för reset-password-flödet) men omstylade med de nya cl-tokens. 152 tester gröna (+1 null-guard i ember-canvasen för jsdom-testharnessen, som stubbar `getContext` till null). **EJ browser-verifierat denna session** — sandboxens PowerShell-gate tillåter bara git/npm/node, ingen väg att starta en browser och skärmdumpa. Niklas behöver testa i egen browser innan detta känns klart.

---

## 3.71.1 — 2026-07-08
**Login-tema-demon: dip-to-black-övergång (Niklas live-feedback: "PowerPoint-slide-byte").** Temabytet var ett hårt omedelbart hopp — `setThemeVisual` är byggd för Settings-byten där direkthet är rätt, inte för en ambient demo-loop. Äkta korsfade är omöjlig (body-klass byter hundratals regler + canvas-lager mount/unmount → två teman kan inte samexistera), så bytet göms nu bakom en mjuk svart ridå: fade till svart 0.7s → temabyte + 150ms måla-klart → fade upp 0.7s. Ridå-elementet städas i `stopAuthThemeDemo` (får inte ligga kvar över appen efter login); race-guard om demon stoppas mitt i en fade.

---

## 3.71.0 — 2026-07-08
**°F-stöd + Fable-granskning av onboardingen (6 fynd fixade).** **Fahrenheit:** ny `state.tempUnit` (`'c'|'f'`, whitelistad i ensureStateDefaults + importData). Temp lagras ALLTID i °C internt (samma princip som kg för vikt); `tempToDisplay`/`tempToC`/`tempUnitLabel` konverterar vid render/capture. Onboarding steg 1 har nu temp-frågan (°C/°F) på samma slide som kg/lbs (steg 3:s två-frågor+Next-mönster); lbs auto-defaultar °F tills användaren aktivt väljer. Settings → Training: ny "Temperature Unit"-toggle under Weight Unit. **Fable-granskningens fynd:** (1) KRITISK: Rebuild Chain → Skip/Import klobbrade tyst användarens unit/temp/timer till hårdkodade defaults (lbs-användare flippades till kg) — skip seedar nu från befintlig state vid rebuild, importens hårdkodning borttagen. (2) `finishOnboarding` rensar nu `permanentSwaps` (confirm-texten lovade det redan; slot-nycklade swaps från gamla kedjan applicerades annars på fel övningar i nya). (3) Dödkod bort: `generateChain`s restSlots-beräkning + `restCount`-param (ignorerad av båda call-sites sedan rest days lämnade onboardingen 3.41.0) + oläst `state.restCount`. (4) PM22: all onboarding-CSS tokeniserad (`--gray-mid/light`, `--border-strong`, `color-mix` med `--red`) — Rebuild Chain kör wizarden under aktivt tema och hardcoded hex var oläslig på ljusa teman; steg-4-previewens `var(--gray-mid)`-BAKGRUND (text-token!) → `--surface-elevated`. (5) Dubbel-confirm vid rebuild borta (`_rebuildConfirmed`-flagga). (6) Ny `_onboardingActive`-guard i `renderChain` — sync/failsafe-omritningar kunde radera wizarden mitt i ett steg; nollas vid alla wizard-exits + login. **Fable verifierade också:** rest days HELT borta ur wizard-UI:t, ingen väg lämnar tempUnit odefinierad, ingen XSS i wizarden.

---

## 3.70.1 — 2026-07-08
**Ny övning: Sauna (gymfeedback, live).** Nytt mätsätt `sauna` (`temp`/`secs`, PR=längsta tid) — samma sluten-enum-mönster som `inclinecardio`. Ny övning `Sauna` i EXERCISE_LIBRARY Cardio-sektionen (mellan Running och Sled Push). Grid delar layout med cardio/carry (2 fält: °C + min). Historik/copy visar `X°C · Ymin`. `src/measures.js` + index.html + 2 nya tester (152 totalt).

---

## 3.70.0 — 2026-07-08
**Nytt mätsätt: Incline cardio (gymfeedback, live).** Incline Walk saknade lutningsgrad — bara tid+km loggades, trots att graden är den viktigaste variabeln på ett lutningspass. Nytt `inclinecardio`-mätsätt i registret (`incline`/`secs`/`dist`, PR=dist) enligt sluten-enum-arkitekturen — ingen per-övning-specialkod. `Incline Walk` i EXERCISE_LIBRARY bytt från `cardio`→`inclinecardio`. Ny grid-layout (3 fält: %, min, km). Valbar för valfri övning via mätsätt-väljaren i tag-editorn (samma generiska override-mekanism som alla andra mätsätt). Historik/copy visar `X% · Ykm · Zmin` via `formatSetLine`. Gammal historik för Incline Walk (loggad som `cardio`, utan grad) visas oförändrad utan grad — ingen migration, per Niklas ok. `src/measures.js` + index.html + 1 nytt test (151 totalt).

---

## 3.69.0 — 2026-07-08
**Gymbugg + login-tema-demo.** **Bugg (gymfeedback, Cosmic Horror-skärmdump):** intilliggande avklarade pass ("adjacent.done") såg upplysta/olåsta ut i Obsidian och Cosmic Horror — 3.46.4:s "container bär formen"-omdesign gav `.adjacent`-blobben en egen ljus bakgrund/kant utan motsvarande `.adjacent.done`-dämpning (bara bokstavs-badgen dämpades, inte containern). Fix: `.chain-tab.adjacent.done` tillagd för båda teman. **Login-tema-demo (Niklas idé):** inloggningsskärmen startar alltid på Iron, roterar sedan slumpmässigt genom alla 10 teman var 7:e sekund (`startAuthThemeDemo`/`stopAuthThemeDemo`) — fungerar som passiv demo av temautbudet, även för vana användare. Stoppas så fort en session faktiskt loggar in. `applyTheme`/`initTheme` delar nu logik via ny `setThemeVisual()` (DRY, ingen beteendeändring). **Input-fälten är nu medvetet tema-oberoende** (fasta färger, inga `var()`) så de förblir läsbara oavsett vilket tema som roterar bakom dem — samtliga per-tema auth-input-overrides (Arctic/Undertow/Understory/Obsidian/Cosmic Horror) borttagna. **Bonus-fynd:** Undertow och Understorys auth-bakgrunder riktade sig mot `#auth-screen`, ett element som inte finns (rätt id är `#userScreen`) — död CSS sedan de lades till, bakgrunderna visades aldrig. Fixat i samma veva.

---

## 3.68.2 — 2026-07-07
**Sista svenska övningsnamnen bort: "Vader (seated/standing)" mergade in i Seated/Standing Calf Raise.** Vader = svenska för calves — låg som dubbletter i Legs bredvid de engelska posterna. Engångsmigration `vaderCalfMerge_v1` flödar ev. Vader-historik/notes/set-counts in i Calf Raise-posterna. Rename-motorn utbruten till `applyExerciseRenames()` (delad av 3.68.0-migrationen + denna, istället för kopierad). Flaggan tillagd i importens migrations-whitelist. Övriga biblioteket genomsökt: inga fler svenska namn.

## 3.68.1 — 2026-07-07
**Import-härdning (Fable-granskningsrunda #5, alla 5 fynd åtgärdade).** #1 HÖG: `sanitizeImportedState` täckte inte kedjestruktur-fälten — fil-levererade `addedExercises`/`customExercises`-id:n landade råa i onclick/id-attribut (JS-strängkontext, 3.63.2-vektorn via backup-filen istället för template). Nu samma safeId/cleanKeys-regler som `sanitizeTemplateFields` på sessionOrder/restSlots/overrides/swaps/added/removed/custom/exerciseOrder/notes/set-counts/measure-overrides/deletions. #2: importData har nu confirm-dialog + PM4-snapshot (utbruten `writePreImportSnapshot()`, delad med importTemplate) — ersätter hela staten + syncar, hade ingetdera. #3: `schemaVersion` koerceras+clampas, `migrations` whitelistas till kända numeriska flaggor — smugglade flaggor kunde tyst blockera framtida migrationer. #4: filens `lastSyncedCloudTime/ISO` nollställs — beskrev en annan enhets synkläge och kunde hoppa över cloud-merge på fel premiss. #5: fil-inputen nollställs så samma fil kan väljas igen efter fel. +3 nya tester (150 totalt). Fable verifierade samtidigt att gamla backup-filer går genom hela migrations-pipelinen (inkl. 3.68.0-renames) vid import.

## 3.68.0 — 2026-07-07
**Enhetlig namnstandard i övningsbiblioteket: "Övningsnamn (Variant)".** 29 renames (Bench Press (BB/DB), Incline/Decline Press (BB/DB/Smith/Cable), Flyes (Cable), Lateral Raises (DB/Cable), Military Press (BB/Smith), Biceps Curl (BB/Cable/DB), Shrugs (BB/DB/Trap Bar), Seated Row (Cable/Machine), m.fl.). Splittar: Lateral Raises → DB+Cable, Rear Delt Flyes → DB+Cable (DB tar historiken), Seated Row → Machine+Cable (Machine tar historiken — Johannes cable-historik på gamla namnet blir Machine-märkt, kosmetiskt). Engångsmigration `libraryUniform_v1` skriver om name+exId i logg/cykler/overrides/swaps/drafts och flyttar exId-nycklade maps (notes m. tombstones, set-counts, measure/sprint-overrides). exId skrivs aldrig om från namnet — rename-etiketter har exId ≠ slug(name) by design. UX-beslut: övningsnamn först (varianter sorterar ihop i dropdowns, rörelse-först-tänk), inte utrustning-först (dropdowns är native selects utan textsök — sökargumentet föll). Spegelfil src/exercise-identity.js synkad (inkl. försenad 3.55.0 rotator cuff-spegling).

## 3.67.3 — 2026-07-07
**Veckodag i datum överallt.** Done-badgen på pass-kort och Copy last session visade bara "Jul 7" medan History-vyn redan visade "Tue Jul 7" (`fmtDate` har `weekday:'short'`). Rotorsak: pass-done och rest-done byggde egna datumsträngar utan veckodag istället för att använda `fmtDate()`. Nu återanvänder båda `fmtDate()` — en enda datumkälla. Gäller nya loggar; redan sparade `done.date`-strängar är frysta och behåller gamla formatet.

## 3.67.2 — 2026-07-06
**Fix: Done trycktes utanför skärmen på Settings-undersidor i Obsidian.** Rotorsak: undersidorna använde `.section-title`, som har extrema tema-overrides (Obsidian: Cinzel + `.32em` letter-spacing + uppercase → "APPEARANCE" enormt bred; Cosmic Horror snarlik). Edit Program använder `.edit-title` — ärver temats font via `var(--display)` men utan tracking-explosionen, noll tema-overrides — därför funkar dess huvud i alla teman. Fix: undersidorna använder nu `.edit-title` (temafonten följer fortfarande med) + ellipsis-skyddsnät (`min-width:0`) så Done aldrig kan tryckas ut oavsett framtida tema. Genomgång av övriga `section-title`-ställen: alla står ensamma på egen rad utan knapp — ingen mer yta med samma problem.

## 3.67.1 — 2026-07-06
**Settings-undersidor: tydlig temastylad Done-knapp.** Niklas mobilfeedback på 3.66.0: "← Done" (btn-secondary) var knappt märkbar. Nu exakt samma huvud som Edit Program — titel till vänster, `btn-primary` "Done" till höger i flex-rad. btn-primary är temastylad i alla teman (3.34.1: Iron metal stamp, Nanosuit octagonal HUD, osv.) → knappen följer respektive tema gratis.

## 3.67.0 — 2026-07-06
**PM18 — In-app Help.** Ny Help-undersida i Settings-hubben: 9 ämnen som accordion (The Chain model, Logging sets, Tags, Measurement types, Swapping, Extras, Reminders, Personal records, Sync/backup/sharing). Innehållet är en `HELP_TOPICS`-datastruktur + en render-loop (measure-arkitektur-principen — ingen per-ämne-specialkod). Statiskt författad engelska; förklarar bl.a. temp-vs-permanent swap (Johannes-frågan), att failade set inte räknas som PR, och skillnaden template-delning vs backup. Temaadaptiv gratis via `.settings-panel`-tokens. jsdom-test: alla ämnen renderas, accordion öppnar/stänger. 147/147 gröna.

## 3.66.0 — 2026-07-06
**Settings → hubb med undersidor (Edit Program-mönstret).** Fliken öppnar nu en meny med stora tryckytor — Training (rest timer, weight goal, units, weight step, custom exercises), Appearance (teman, ambient effects), Data & Sync (synk-status, program-delning, backup, reset), Support (feedback, debug) — istället för dagens enda långa scroll. "← Done" tillbaka till hubben, samma navigationsvokabulär som Edit Program. Synk-hälsan + version visas som enrads-status direkt på hubben (tap → Data & Sync); header-synk-pricken deep-linkar dit. Ren omflytt av befintligt innehåll — ingen ny funktionalitet, Help-vyn kommer i 3.67.0.

**Bifynd fixade i samma svep:** (1) De tre osynliga fil-inputarna (template/backup/onboarding-import) bodde i renderData-markupen — onboardingens "import"-väg klickade på ett element som bara fanns om Settings hunnit renderas (latent död väg för färska användare). Nu statiska i body. (2) Sista svenska UI-strängarna ("Rensa logg", debug-toaster) översatta (3.54.1-regeln). Nytt jsdom-test: hubb → undersida → tillbaka + fil-inputarnas existens. 146/146 gröna.

## 3.65.1 — 2026-07-06
**isFreshState-guarden var delvis avväpnad — hittad av de nya synk-testerna.**

`hasProgress` räknade `Object.keys(cycle.done).length > 0`, men `newCycle()` förfyller `done` med `{A:null, B:null, ...}` när `getEffectiveChain()` är tillgänglig — null-slots utan ett enda avslutat pass räknades som "progress". Konsekvens: varje state vars cykel hunnit förfyllas klassades som icke-fresh, och PM6/pushState/keepalive-skyddet mot att tomma enheter skriver över molndata vilade i praktiken på 3.35.12-TDZ-catchens råkat-tomma `done` vid script-load. Fix: `Object.values(done).some(v => v)` — bara faktiskt avslutade pass räknas. Alla 9 call-sites genomgångna (pushState/save/keepalive/pagehide-persist/finishOnboarding-safety-net): skarpare fresh-detektering är rätt riktning i samtliga.

Hittad av PM5 Option B-synktesterna (samma session): testet "vägrar pusha fresh state" föll — mot riktiga koden, inte en spegel.

## 3.65.0 — 2026-07-06
**PM9/PM19 riktad granskningsrunda #4 (Fable): importData var den sista osanerade fil-gränsen.**

**Huvudfynd:** `importData` (Settings → Import) gjorde `state=d` — rå fil-JSON ersatte hela state utan validering. Templates fick gräns-sanering i 3.63.2 eftersom de delas mellan användare; backup-filer delas via exakt samma sociala vektor och gick runt hela skyddet. Gemensam rot för alla sinks: render-lagret antar att set-värden är NUMMER — garantin kommer från capture-vägen (verifierad numerisk 3.63.2), och importData kringgick den.

**Nåbara sinks (verifierade innan fix):** historik-rendern + "Last (Xd ago)"-raden (`formatSetLine`-output rå i innerHTML — `secs`/`dist`/`sprints`/`forced` m.fl. strängbara via fil), weight-loggen (`e.date` rå i både HTML-text och onclick-JS-strängkontext), done-badgens `completedData.date`, `state.unit` via `unitLabel()` (falsy-check, aldrig whitelistad — interpoleras rått på dussintals ställen), measureCells `value`-attribut (nås via done-sets → `undoSession`-restore samt drafts i filen).

**Fix i två lager (samma arkitektur som 3.63.2):**
1. **Gräns-sanering** — ny `sanitizeImportedState(d)` vid importData-gränsen: Number/isFinite-koercion av alla set-fält (log + cycle.done + importedPRs), `side` L/R-whitelist, `fail`/`warmup` booleaniseras, ex.id + sid mot `[A-Za-z0-9_-]+` (legitima id-format matchar alltid), weightLog-datum mot `YYYY-MM-DD`-regex, unit-whitelist, done-date utan HTML-metatecken. `draft`/`drafts` droppas helt — device-lokala per SL6, ska inte kunna planteras via fil.
2. **Sink-härdning (djupförsvar):** `escapeHTML` på `formatSetLine`-output (historik + Last-raden), `e.date` i båda kontexterna (JSON.stringify-mönstret för onclick, samma som prCardHTML), done-badgens date, samt unit-whitelist i `ensureStateDefaults` (ersätter falsy-checken — täcker ALLA load-vägar inkl. gamla korrupta states, inte bara import).

Verifierat oförändrat säkra i samma svep: notes/reminders (escapas), hist-entry namn/passName (escapas), `confirmDeleteCustomEx` (korrekt JSON.stringify+escapeHTML-mönster), tag-editorns optioner, `d.author` vid template-import, theme-resolvern (THEMES-lookup med fallback).

## 3.64.0 — 2026-07-06
**Server-side CAS-lås för app_state (SYNC_CAS_SERVER_SPEC.md, steg 4/5).**

3.62.0 gav klientsidig CAS (PATCH villkorad på senast sedda `updated_at`), men det villkoret var något klienten valde att skicka — en pre-3.62.0-klient kunde fortfarande göra en helt vanlig blind skrivning. Ny Postgres-funktion `write_app_state_cas(p_expected_updated_at, p_data)` (körd mot prod-DB 2026-07-06, steg 0+1 i specen) gör CAS-kontrollen atomärt server-side. Klientkod: `sbWriteStateCas()` ersätter `sbPatchStateIfMatch`/`sbInsertState`, `pushState()` och `keepaliveCloudPush()` går nu via RPC:n istället för rå PATCH/POST. Syntax OK, 118/118 tester gröna. Fable-granskad (modellbyte mitt i sessionen): parametrar/konfliktdetektering/retry-flöde/först-skrivning-race verifierade korrekta.

**Komplett samma dag:** efter mobil-verifiering av RPC-vägen (grön sync vid loggning) kördes steg 2 — `revoke insert, update on public.app_state` från både `authenticated` och `anon` (grants-inspektionen visade att anon också hade skrivgrants; RLS blockerade i praktiken, belt-and-braces). Slutverifierad med set-loggning på testanvändare EFTER revoken → grön sync. Blind-skrivnings-hålet från gamla klienter är därmed stängt server-side — en pre-3.64.0-flik som försöker en rå PATCH/POST får 403.

## 3.63.2 — 2026-07-04
**PM9/PM19 riktad granskningsrunda: 3 fynd (samma format som 3.27.0/3.51.4).**

**#1 KRITISK (cross-user) — template-import saknade id/värde-validering.** Namn escapas vid render, men fil-levererade **id:n** (`addedExercises[].id`, `customExercises[].id`, map-nycklar) landar råa i `onclick="...('${id}')"` och `id="..."`-attribut (JS-strängkontext escapas aldrig), och **importerade PR-värden** renderas råa via `toDisplay`/`fmtReps` i `prCardHTML` (kg-läge returnerar värdet orört). En preparerad template-fil — appens enda cross-user-yta, folk delar dem — kunde alltså exekvera JS hos importören. Fix: ny `sanitizeTemplateFields(d)` vid import-gränsen — id:n valideras mot `[A-Za-z0-9_-]+` (övriga entries droppas), PR-fält tvingas genom `Number()`/`isFinite`, namn måste vara strängar. Normaliserar även v1→v2 så båda import-vägarna (Settings + onboarding) delar en väg — dedup-bonus. Session-id-vektorn var redan stängd by construction (okända id:n i `sessionOrder` når aldrig rendering — bara kända `SESSION_TEMPLATES` re-pushas).

**#2 — `currentUser.name` oescapad i tag-editorn.** "Changes apply for X only"-raden i `buildTagEditorHTML` — samma klass som 3.27.0-fixen i renderData, denna missades. Fix: `escapeHTML`.

**#3 — `side` (L/R) whitelistas nu i hela kedjan** (capture, save, `formatSetLine`, set-radens knapp) — enda strängfältet i set-datat som renderades oescapat. Bonus-bugg hittad i samma rad: knappen fick `class="side-btn L"` men CSS:en definierar `.left`/`.right` → en sparad side-knapp tappade sin blå/röda färg vid varje omrendering. Nu mappas L→left, R→right.

Verifierat i övrigt: alla 3.51.4-eran-escapes intakta, alla numeriska set-fält parseFloat/parseInt vid capture, `getMeasure`/`getSprintBase` validerar mot sluten enum, tema-SVG:er statiska, `slugifyExId` säker teckenmängd, modaler/onboarding/settings rena.

## 3.63.1 — 2026-07-04
**Säkerhets-quick-wins: CSP-header + npm audit fix.**

**CSP meta-tag** (skyddsnät under PM9/PM19-arkitekturen, inte ersättning): `default-src 'self'` med explicit allowlist — script från jsdelivr (SortableJS) + esm.sh (supabase-js), style/font från Google Fonts, `connect-src` ENDAST egna Supabase-instansen, `img-src 'self' data:`, `manifest-src data:` (data-URI-manifestet), `worker-src 'self'` (sw.js), `object-src 'none'`, `frame-src 'none'`, `base-uri 'self'`, `form-action 'self'`. Effekt: ett eventuellt kvarvarande XSS-hål kan inte längre ladda externa script eller exfiltrera data till godtycklig domän — `fetch`/XHR mot allt utom Supabase blockeras av browsern.

**Ärlig begränsning:** `script-src` kräver `'unsafe-inline'` — hela appen är ett inline-script + onclick-attribut (single-file-arkitekturen). CSP:n stoppar alltså inte inline-injektion i sig, bara vad injicerad kod kan göra (ingen extern kod, ingen exfiltration). Fulla skyddet kräver PM9/PM19-migreringen.

**npm audit fix:** vite 8.0.x HIGH (launch-editor NTLMv2 + server.fs.deny-bypass, båda Windows) → 0 sårbarheter. Transitiv dev-dependency via vitest, skeppades aldrig till produktion. 118/118 tester gröna efter bump.

## 3.63.0 — 2026-07-03
**Gymfeedback (live): To Goal med riktningstecken + unilateral side i historiken.**

**#1 — To Goal räknar nu i riktningen du måste röra dig.** Var `latest − goal` (över målet → `+2.5`, kändes bakvänt vid cut). Nu `goal − latest`: över målet → `−2.5` ("gå ner 2.5"), under ett bulk-mål → `+X` ("upp X kvar"). Ren teckenflipp i `renderWeight`, plus-prefixet på positiva värden orört.

**#2 — Side (L/R) visas i historiken.** `side` sparades redan per set (samma vanliga datafält som `fail`/`forced` — inga specialregler) men `formatSetLine` ritade aldrig ut det. Nu appendas ` (L)`/` (R)` → syns i "Last (Xd ago)", fulla historiken och copy samtidigt, retroaktivt för redan loggade set. PR-funktionerna läser aldrig `side` → per-side-PR uppstår inte by construction, ingen exkluderingslogik behövdes.

**Bonus-lucka stängd:** SIDE-knappen renderas för weight/bw/bwreps-mätsätt men `saveExercise` sparade bara `side` i weight-grenen — en unilateral BW-övning (t.ex. uni-chins) tappade side vid Done. Side-läsningen hissad ovanför mätsätts-grenarna, sätts nu likt `fail` (`if(sideVal) base.side=sideVal` — inga null-fält på övriga set).

## 3.62.3 — 2026-07-02
**Gymnotes-batch (2026-07-02), de två icke-Fable-punkterna.**

**#3 — "?" i historik löst, verkligt rotfix (regression identifierad).** `formatSetLine` (och `prCardHTML`) använde `set.reps||'?'` på tre ställen — klassisk JS-falsy-fälla: `reps=0` (ett GILTIGT resultat, t.ex. forced negativ på bänk eller misslyckad stående Ab Wheel-set) föll in i `'?'`-grenen precis som `null`/`undefined` gjorde. Ny `fmtReps()`-helper skiljer korrekt `reps!=null` (0 räknas som loggat) från "aldrig loggat". Samma fix i PR-korten (`pr.reps||'?'`, `pr.secs||'?'`) för konsekvens, även om fail-set redan exkluderas ur PR-beräkning så den vägen sällan triggas i praktiken.

**#2 — Permanent swap syns nu i Edit Program.** `showEditExercises` (aktiv-listan + Removed-listan) och `buildRemovedSection` (Removed-listan i aktiv session) läste bara `exerciseOverrides` (namnbyten), aldrig `permanentSwaps` — en permanent swappad övning visade fortsatt basnamnet i alla tre listorna. Fix: samma prioritet som render-koden redan använder på andra ställen (`permanentSwaps > exerciseOverrides > bas`). Djupare logik (taggar/mätsätt/PR/historik via `getRenderExId`) var redan swap-medveten sedan tidigare — bara det VISADE namnet var fel, ordning/reorder fungerade korrekt under huven (stabila slot-id:n).

## 3.62.2 — 2026-07-02
**Returnerande enheter visar korrekt data direkt, inte gammal data som byts ut några sekunder senare.** Sista biten i dagens synk-arbete. `loadStateForUser()` renderade tidigare direkt med lokal (potentiellt stale) data när en enhet hade använt appen förut, och hämtade molnet asynkront/o-väntat i bakgrunden — bytet till korrekt data hände flera sekunder senare via en icke-väntad `syncFromCloud()` längst ner i `handleSession`. Det är exakt fönstret där en otålig gym-användare hinner logga mot fel program eller stänga appen innan bytet syns — den ursprungliga rapporterade buggen igen, fast i en annan del av koden än gate/CAS-arbetet tidigare idag.

Fix: `loadStateForUser()` väntar nu på en BUNDEN (max 5s) `syncFromCloud()`-pull innan `handleSession` ritar upp appen, istället för att rendera lokalt först. `syncFromCloud` avvisar aldrig (sväljer sina egna fel internt), så en offline/långsam pull kostar högst 5 sekunder — därefter faller vi tillbaka på lokal data precis som förut, ingen risk att fastna (gott om marginal under den befintliga 8s hard-failsafen). "Updated from cloud ✓"-toasten tystad specifikt under denna boot-merge (`isLoading===true`) — det är nu den normala inloggningsvägen, inte en överraskande bakgrundsuppdatering; toasten finns kvar för äkta bakgrundsuppdateringar (periodic sync/focus) medan användaren redan tittar på appen.

Bieffekter, båda positiva: (1) skriv-gaten (`_cloudSeenThisSession`) sätts nu betydligt tidigare i en session — mindre risk att en tidig edit blockeras av gaten. (2) Om lokal data är korrupt (`JSON.parse` failar → `freshState()`, `onboardingDone:false`) hann tidigare onboarding-guiden ibland flimra fram innan den sena cloud-synken hann rätta till det — nu hämtas riktig data (inkl. `onboardingDone:true`) innan det beslutet fattas.

**Inte löst i denna version (medvetet, separat spec):** riktigt vattentät serverside-enforcement mot gamla klienters blinda skrivningar (Postgres RPC + indragna direkta skriv-rättigheter på `app_state`) — kräver Supabase Dashboard-åtkomst hemifrån. Spec förberedd i `SYNC_CAS_SERVER_SPEC.md` för Fable.

## 3.62.1 — 2026-07-02
**Stänger residual-hålet från 3.62.0: en öppen flik kan nu inte längre köra gammal (osäker) push-logik på obestämd tid.** 3.62.0 gjorde skrivningar CAS-säkra, men bara i den nya koden — en flik som redan har GAMMAL JS laddad i minnet (öppnad innan denna deploy, aldrig omladdad) kör fortfarande sin gamla blinda push tills den faktiskt laddas om. Två delar löser detta:

**1) "Refresha två gånger"-buggen (rotorsak hittad, inte bara symptom-lappad):** Service workern körde stale-while-revalidate på HTML-shellen — vilket ALLTID serverade cachad (gammal) `index.html` direkt vid refresh #1, medan en färsk kopia hämtades i bakgrunden och skrev in i samma cache. Sidan som visades bar alltså fortfarande gammal `APP_VERSION` → SW-registreringen (`./sw.js?v=X`) blev identisk med förra → ingen ny SW upptäcktes → ingen auto-reload. Refresh #2 fick den (nu bakgrunds-uppdaterade) cachen och triggade äntligen en riktig versionsväxling via befintlig `controllerchange`-listener. Fix: `sw.js` kör nu network-first för navigations-requests (HTML-shellen) — en ny deploy vinner redan på första refreshen. SWR kvar för fonter/CDN-script/bilder där staleness är ofarligt.

**2) Öppna flikar självläker nu inom en synk-cykel, ingen refresh krävs.** Testade först periodisk `registration.update()`-polling för att tvinga öppna flikar att upptäcka nya SW-versioner — det fungerar INTE med vårt query-string-baserade versioneringsschema: en redan-registrerad flik re-kollar bara sin EGEN (gamla) URL om och om igen och kan aldrig lära sig att en ny URL finns utan att sidan laddas om först (moment 22). Istället: den befintliga men tandlösa `showOldVersionBanner()` (krävde manuellt klick, ingen deadline) ersatt med `autoReloadForNewVersion()`. Signalen finns redan — varje periodisk pull (var 30:e sekund medan fliken är synlig, `syncFromCloud`) jämför molnets `appVersion` mot lokal `APP_VERSION`; vid mismatch: säkra osparade edits till localStorage (`captureAllDraftInputs` + save, ofarligt — reload rensar bara in-memory state, ny kod läser lokal data och synkar gated+CAS på vanligt vis), visa kort toast, ladda om efter 1.5s. Bonus-effekt utan extra kod: detta kör redan på första synk efter inloggning → "hämta senaste versionen automatiskt vid login" löst gratis av samma mekanism.

**Kvarstående, medvetet ej åtgärdat:** CAS-disciplinen är 100% klientsida (en `WHERE updated_at=eq.X`-filter i request:en). En enhet som ändå hinner pusha EN gång innan sin nästa periodiska pull (upp till 30s-fönster) skickar fortfarande en blind skrivning som Postgres/PostgREST inte känner till någon konvention för. Fullständigt vattentätt kräver server-side enforcement (Postgres RPC + återkallade direkt-skrivrättigheter på `app_state`-tabellen) — större separat arbete, inte gjort nu.

## 3.62.0 — 2026-07-02
**SYNK-ROTFIX: en enhet kan aldrig mer skriva över molnet utan att först ha läst det.** Rapporterat scenario (ny användare): bygger program på datorn → öppnar mobilen på gymmet → bara gamla grundprogrammet, och desktop-programmet borta även i molnet. 3.29.0 (PM1) fixade merge-semantiken *när pull väl sker* — men inget hindrade en enhet från att pusha FÖRE sin första pull. Fem konkreta hål, alla stängda med två arkitekturregler:

**Hålen:** (1) `pushState` skippade pull-before-push om en sync var i flykt (`_syncInFlight`-mutexen no-op:ade tyst) → stale push vann på långsamt gymnät; (2) `keepaliveCloudPush` (pagehide/beforeunload) pushade hela lokala state ovillkorligt — app-växling innan första pull = deterministisk överskrivning; (3) offline-boot utan lokal data → freshState → onboarding → `onboardingDone=true` avväpnade isFreshState-guarden → default-program skrev över molnet ("gamla grundprogrammet" kan bokstavligen vara ett nygenererat default-chain); (4) `sbGet` utan timeout → hängd fetch låste mutexen resten av sessionen (inga pulls, alla pushes utan pull); (5) push-retry körde `skipPull:true` = blind push.

**Regel 1 — läs-före-skriv, mekaniskt tvingad:** sessionsgate `_cloudSeenThisSession` sätts först efter lyckad molnläsning (rad finns ELLER bekräftat tom). `pushState` och `keepaliveCloudPush` vägrar skriva innan dess; ändringar ligger kvar i localStorage och pushas när pull lyckats. **Regel 2 — villkorliga skrivningar (CAS):** blind upsert ersatt med `PATCH ...&updated_at=eq.<senast sedda>` (`sbPatchStateIfMatch`); tomt svar = molnet ändrat → pull+merge → retry EN gång. Första skrivningen = POST insert (`sbInsertState`, 409 → konfliktväg). Även keepalive skriver villkorat. **Stödfixar:** syncFromCloud koalescerar (delad promise — väntare väntar istället för att no-op:a), 12s abort-timeout i sbGet, cloud-restore i loadStateForUser sätter CAS-referens + gate (timeout 4s→7s), retry kör fullt flöde, tom molnrad rensar CAS-referens (insert-väg). **Forensik:** `PUSH_BLOCKED@gate` + `PUSH_CONFLICT@cas` i debug-ringbufferten (Settings → Debug → copy), `_lastSyncError='Not synced yet — changes saved locally'` syns i Sync Status. Nya state-fält: `lastSyncedCloudISO` (CAS-referens, i freshState+ensureStateDefaults).

**Efter code-reviewer-granskning (4 fixar till):** (a) 12s abort-timeout även på skrivvägen (`sbPatchStateIfMatch`/`sbInsertState`) — hängd PATCH/POST kunde annars frysa pushState permanent; (b) `_pushRetries` nollställs vid varje nytt topnivå-anrop (backoff-retry flaggas `_backoffRetry`) — förr fastnade räknaren på 3 efter ihållande fel och inga retries schemalades mer; (c) XSS: `escapeHTML` på cloud-`appVersion` i uppdaterings-bannern + Settings Cloud version (användarkontrollerad DB-blob i innerHTML); (d) `TOKEN_REFRESHED` för samma användare kör inte längre om hela `handleSession`/`loadStateForUser` — den ersatte levande in-memory-state med localStorage-snapshot mitt under pass (kunde tappa osparade edits mellan debounces + ge "gammalt state dyker upp"-symptom). Gate-reset sker vid logout/user-byte. Verifierat av reviewern: ingen ogated skrivväg kvar, CAS-rekursionen bounded, `_syncPromise` kan inte fastna, TDZ-säkert.

## 3.61.2 — 2026-07-01
**Settings: gruppera alla toggles.** Rest Timer, Weight Goal och Ambient Effects (animationer/partiklar) flyttade till samma sammanhängande block (i den ordningen), direkt efter Debug. Weight Unit + Custom Exercises följer efter. Ren omflyttning av befintliga sektioner, ingen ny logik. "To Goal" (6:e boxen på Weight Curve) fanns redan i 3.61.0 — syns så fort Weight Goal är ON + ett mål är satt.

## 3.61.1 — 2026-07-01
**Weight Curve: två nya sifferboxar** (gymfeedback — "trendlinjen är bra, men tydliga siffror är tydligare"). **Trend (14d avg)** = trendlinjens senaste värde som konkret tal. **Weekly Rate** = snitt senaste 7 kalenderdagarna minus snittet 7 dagarna innan — svarar på "går det åt rätt håll just nu och hur fort", till skillnad från Change som är hela resan sedan dag 1. Tomt/inget värde om för lite historik i något fönster (visas bara när beräkningsbart).

## 3.61.0 — 2026-07-01
**Weight Goal + rullande trendlinje på Weight Curve.** Settings: ny opt-in "Weight Goal"-toggle (mirror:ar Rest Timer-mönstret) med målvikt-fält. Aktiverad: ny "To Goal"-stat-box (signed diff mot mål) + streckad mållinje (`--green-bright`) på grafen. Ny 14-dagars rullande medelvärdeslinje (`--gold`) ovanpå rådata på ALLTID (oavsett mål) — jämnar ut dagsbrus (vatten/mat-svängningar) utan att dölja punkterna. Fönstret är kalenderdagar, inte antal loggningar (matchar oregelbunden loggningstakt). "Change"-statistiken (all-time, dag 1 → idag) lämnad orörd på Niklas begäran — han vill se hela resan sedan start.

## 3.60.0 — 2026-07-01
**Gymfeedback: cardio-tid i minuter + nya cardio-övningar.** Steady-state cardio (`measure:'cardio'` — Walk, Bike Cardio, ny Running/Incline Walk) loggas nu i minuter istf sekunder (decimal, t.ex. `32.5`). Internt lagras fortfarande `secs` (ingen migration/PR/historik-kod rörd — de visade redan minuter härlett från secs, bara input-cellen bytte enhet). Konvertering min→sec vid båda capture-punkterna (draft→sets, sets→buffer). Dead Hang (`timed`) och Assault Bike (`cardiosprint`, sekunder+sprintantal) opåverkade — redan korrekta per Niklas. Nya biblioteksrader: `Incline Walk` + `Running`, båda `cat:'Cardio', measure:'cardio'` — ren data, ingen ny logik. Ab Wheel dubbelkollad: redan `bwreps` (PR=reps, inget viktfält) — ingen åtgärd.

## 3.59.7 — 2026-06-28
**Obsidian Edit-knapp: FAKTISK rotorsak (radbrytning, inte font).** 3.59.4-6 jagade fel axel (font/storlek). Den verkliga buggen: Obsidians Edit-knapp var *kvadratisk* för att ikonen (SVG) staplades ÖVANPÅ texten "Edit" — en radbrytning. `.btn-chain-edit` är ett flex-barn i `.header-bottom-row` utan `white-space:nowrap`; när raden trängs ihop (Obsidians högra kluster bredare) krymper knappen till sin min-content och bryter ikon/text på två rader = kvadrat. Övriga teman trängdes inte tillräckligt. Fix: `white-space:nowrap` + `flex-shrink:0` på `.btn-chain-edit` → ikon+label kan aldrig brytas, knappen förblir avlång i ALLA teman (recurrence-proof). Font-låsen från 3.59.4-6 behålls (de var korrekta för font-konsistens, bara inte rätt diagnos för formen).

## 3.59.6 — 2026-06-28
**Header-hörnet hårt låst (recurrence-proof).** Obsidians Edit-knapp var fortf. större/serif trots 3.59.4 — `.btn-chain-edit` har ingen Obsidian-override (ska vara IBM Plex Mono .7rem), så orsaken var antingen en ospårbar kaskad-läcka eller stale SW-cache. Istället för att jaga spöket: hårt lås på hela hörnet med `!important` så **inget** tema (nu eller framtida) kan läcka in sin display/mono-font eller egen storlek på kontrollerna (`header .header-user/.header-sync/.header-version/.header-logout/.btn-chain-edit/.am-pill`+barn → `font-family:var(--ui-mono)!important` + låst font-size på header-user/.btn-chain-edit/.am-pill). FÄRG/border/letter-spacing förblir temats skin. Versionsbumpen bustar även SW-cachen (versionerad cache-key) → garanterad färsk CSS. Detta är svaret på "lös så det inte återkommer med nya teman".

## 3.59.5 — 2026-06-28
**Obsidian header-hörn fix.** Efter 3.59.4 såg hörnet bra ut på alla teman utom Obsidian: det hade kvar sin Cinzel-tunade typografi (`letter-spacing:.2em` + `font-weight:600`) på `.header-user`/`.header-logout` som nu satt på IBM Plex Mono → bredspärrat + fetare än övriga (som kör bas-typografin). Strippat till bara färg (guld kvar), matchar nu standarden. Plus: `.am-pill-log` (Log-knappen i vikt-pillen) använde fortf. `var(--mono)` → bytt till `var(--ui-mono)` så även den ärver hörn-standarden (var Cinzel på Obsidian när vikt-loggning expanderas).

## 3.59.4 — 2026-06-28
**Högra hörnet frikopplat från titeln + låst till Cosmic-standard.** Niklas insikt: titel-fonten (`--display`) och hörn-fonten ("logged in as"/sync/Edit/vikt) är separata variabler, inte kopplade — det bara *blev* så att Obsidian satte sin `--mono` till Cinzel (serif) och därför fick titel-känsla i hörnet. **Beslut:** titlar förblir per tema (avsiktligt olika fonter/storlekar), men hela högra hörnet låses till EN font + Cosmic-storlekar, **färg kvar per tema**. Ny token `--ui-mono:'IBM Plex Mono'` (= Cosmics) på `.header-user`/`.header-sync`/`.header-logout`/`.btn-chain-edit`/`.am-pill`(+input) — ersätter `var(--mono)` så temats egna mono (DM/JetBrains/Spline/Cinzel) inte läcker in. `.header-user` storlek låst .58→.5rem (Cosmic-värdet) överallt. Strippade per-tema font-overrides på hörnet i Night City/Obsidian/Cosmic (behöll färg/border/letter-spacing). Titel-geometri-standardiseringen (3.59.1-3.59.3 Iron-preview) förkastad — Iron-override borttagen. Teman ska aldrig sätta egen font-family/font-size på hörn-elementen (ny regel, analogt `.set-num` 3.50.1).

## 3.59.3 — 2026-06-28
**Header-preview: matcha Embers storlek (fortf. endast Iron).** Niklas tror Embers titelstorlek är närmare önskad standard. Ember sätter ingen egen `font-size` → ärver bas-`.logo` = 1.5rem. Iron-previewn satt därför till 1.5rem (= app-original). Trolig standard = 1.5rem (bas), Cosmic behåller sin 1rem-override, breda teman (Obsidian/Night City) trimmar letter-spacing för enradighet.

## 3.59.2 — 2026-06-28
**Header-preview justerad (fortf. endast Iron): 1rem→1.3rem.** Niklas: titeln blev minimal på Iron vid 1rem. Fynd: Cosmics närvaro kommer från dess breda letter-spacing (.38em), inte font-size — Iron (Bebas Neue, kondenserat, .08em) blir därför mycket mindre footprint vid samma rem. Literal Cosmic-rem är fel standard-modell. 1.3rem = lugnare/konsekventare än original 1.5 men behåller närvaro. Utrullningsplan: bas `.logo`→1.3rem, Cosmic behåller sin 1rem-override (referensen orörd), breda teman (Obsidian/Night City) trimmar letter-spacing för enradighet, lås font-size per tema. Fortf. bara Iron i denna preview.

## 3.59.1 — 2026-06-28
**Header-geometri PREVIEW (endast Iron).** Niklas vill att header-element (titel + Edit) får en låst geometri-standard efter Cosmic — teman ska bara skinna (font/färg/effekt), aldrig sätta egen `font-size` (analogt `.set-num`-regeln 3.50.1). Rotorsak till spretet: bas `.logo` = 1.5rem ärvs av nästan alla teman → wrappar till två rader med breda typsnitt; Cosmic är enda temat som pinnar 1rem. Detta är en isolerad preview på **bara Iron** (`body:not([class*="theme-"]) .logo{font-size:1rem}`) så han kan godkänna Cosmic-skalan innan utrullning till samtliga. Irons skin (Bebas Neue, .08em, röd/vit) orörd — bara storleken. Inget annat tema påverkat.

## 3.59.0 — 2026-06-28
**Set-försvinna-buggen löst i grunden — slut på lapptäcket.** Niklas tappade en uppvärmning på Unilateral Cable Row (uni → 2 warmup default) live på gymmet. Rotorsak via copy-draft: `ensureExtraSets` hade "lösts" fem gånger (3.39.0 stabila sid, 3.44.2 stale-pad, 3.49.0 setEdited-guard, 3.52.1 RAMP-tre-fas, 3.55.0 `_noWorkLogged`) — men ALLA fixar paddade bara WORK sets. **Warmups hade aldrig något skyddsnät** → en försvunnen uppvärmning var permanent borta. Den underliggande skörheten: set-listan räknades om via lager av heuristiska gates istället för en invariant.

**Rotfix:** ny ren modul `src/set-reconcile.js` (`reconcileSets`) med EN symmetrisk regel för båda kolumnerna — warmup OCH work paddas mot target (självläkande mot försvinnande set), loggade set bevaras alltid, ramp strippar warmups, `setEdited`/`saved` låser formen. Ersätter RAMP-filtret (Phase 2) + work-only-stale-paddet (Phase 3). `getSetTargets()` extraherad som single source of truth för set-antal (delas av `getDefaultSets` + reconcile). 14 nya matris-tester (measure × tag × logg × locked × ramp), totalt 118 gröna.

**Instrument:** `ensureExtraSets` loggar nu `SET_RESTORED@reconcile` när en befintlig draft måste paddas (= ett set hade tappats) → copy-draftens `incidents[]` visar mekanismen. Copy-draften utbyggd med `setEdited`, `swaps`, `tagOverrides`, `measureOverrides`, `permanentSwaps` — så vi kan skilja "bugg tappade set" från "user tog bort".

## 3.58.14 — 2026-06-26
**Crusader + Daylight borttagna ur appen.** Båda var WIP/förlegade (Daylight = appens första ljusa tema, utdaterat; Crusader = aldrig nöjd, ska omarbetas av Claude Design senare). Borttaget ur `index.html`: 183 CSS-regler + 6 `@keyframes crusader-*` + Templar-cross-markupen (`#crusader-cross-bg`/`-img`/`-glow`) + båda `THEMES`-posterna (12→10 teman), ~26 KB. **`theme/`-mapparna i repot är ORÖRDA** (Claude Design ska titta på dem senare; `crusader2.jpg`-assetet lämnas också kvar, nu oanvänt). Migrering: befintliga användare på dessa teman remappas till närmaste kvarvarande (`daylight→arctic`, `crusader→obsidian`) via `migrateRemovedThemes()` i `runSchemaMigrations` — ingen hamnar på Iron-fallback. Delad Arctic+Daylight `-webkit-autofill`-regel trimmad (Arctic behållen). Städade stale-kommentarer som refererade borttagen Crusader/Daylight/weight-banner. Verifierat: brace-balans 0, 104/104 tester gröna.

## 3.58.13 — 2026-06-26
**Tema-audit steg 1 — Settings/Progress/Weight-box-lagret tokeniserat till ALLA teman.** Theme-audit (`THEME_AUDIT.md`) visade att de bespoke "box"-behandlade panelerna i Settings/Progress/Weight (`.pr-groups`, `.pr-group-head`, `.settings-panel`, `.data-btn`, `.weight-chart-wrap`, `.wlog-list`) bara fanns i Nanosuit — alla andra teman (inkl. Iron/Cosmic) lämnade dem `background:none`/bara outline. Det var roten till "de flesta teman saknar box för PR-subgrupper". Fix: pekade om bas-reglerna på de befintliga semantiska tokens (`var(--surface-base)` + `var(--border-subtle)`) precis som `.stat-box`/`.pr-card`/`.hist-entry` redan gör → varje tema ärver nu sin egen box-färg automatiskt.
- **Inga nya tokens** — återanvänder PM22-ytvariablerna (per design-token-tröskeln: lägg inte till tokens som kostar mer kod än de sparar).
- **Nanosuits frostade glas vinner fortfarande** (mer specifik `body.theme-nanosuit .X`-selektor) — orörd.
- **Void förblir spartansk gratis:** dess `--surface-base:#000` = samma som bakgrunden, så "box" = osynlig fyllning + tunn `#222`-outline, exakt dess befintliga stat-box-look. Ingen opt-out behövdes.
- **Crusader** behåller sin egen `.data-btn`-outline (egen override vinner) — orörd inför sin kommande rework.
- Tokeniserade samtidigt kvarvarande hardcoded färger i samma regler (`#bbb`→`var(--gray-light)` på pr-group-head för läsbarhet på ljusa teman, `#444`/`#222`/`#2c2c2c`→surface/border-tokens). Verifierat: brace-balans 0, 104/104 tester gröna.

## 3.58.12 — 2026-06-26
**Dödkods-städning — rensat skräp som låg kvar, inkl. en stor mängd död tema-CSS.** Genomgång av hela `index.html`.

**JS-dödkod:**
- **`obPickRest()` borttagen** — onboarding-rest-day-steget togs bort i 3.41.0 (`state.restSlots=[]`) men setter-funktionen blev kvar och anropades aldrig (enda funktionen i hela filen med noll referenser).
- **14 happy-path `console.log` borttagna** — diagnostik-breadcrumbs (`[auth]`/`[loadState]`/`[login]`) som behölls medvetet i 3.36.0 under TDZ-login-saban. Login är stabilt sedan ~22 versioner; de fyrade vid varje lyckad inloggning och läckte e-post + session-info till konsolen. ALLA `console.warn`/`console.error` (felhantering, safety-guards, 8s/10s-failsafes) behölls orörda.

**Tema-CSS-dödkod (242 regler borttagna, 15 grupp-selektorer trimmade, ~39 KB):** När gamla UI-element ersattes blev deras tema-styling kvar som dödkod i alla 12 temablock. Allt verifierat: noll förekomster i markup/JS, renderas aldrig. Klusterna:
- **Gamla vertikala pass-korten** (`.pass-card` + `.pass-letter/name/preview/top/body/info/done-info`, `.chain-list`) — ersatta av den horisontella chain-stripen i **3.23.0**, DOM:en har inte funnits sedan dess (dokumenterat i kommentar vid `toggleSide`).
- **Andra "THE CHAIN"-headern** (`.chain-intro-title`) — den dubblerade titeln som togs bort.
- **Gamla morgonvikts-raden** (`.weight-banner/-label`, `.weight-input/-unit/-log-btn/-today`) — ersatt av am-pillen i 3.30.8.
- **Gamla knappar/grids** (`.ex-btn-done` → numera `.ex-done-primary`, `.ex-mini-btn`/`.save-btn`, `.bw-snap`, `.ex-prev .pr-val`, pre-3.56.0 set-grids `.normal-set`/`.bw-set`).
- **Gammal auth/edit-chrome** (`.auth-stay` + input, `.edit-back`, `.edit-save-bar`, `.edit-section-title`).

Grupperade regler där bara EN selektor var död trimmades kirurgiskt (live-selektorer som `.section-title`, `.ex-block`, `.chain-intro`, `.chain-bar`, `.auth-checkbox-row`, `.ns-scanline`, `.sync-dot`, `.uni-set`, `.ex-btn-skip/edit` orörda). Verifierat efteråt: brace-balans 0, alla live-selektorer kvar, 104/104 tester gröna. Inga visuella ändringar — bara borttagen styling för element som inte renderas.

## 3.58.11 — 2026-06-25
**Nanosuit — Progress-fliken missades helt i 3.58.9/10. Historik + PR-kort + PR-kategorirubriker fixade.** Niklas pekade ut att jag glömt Progress-fliken: history-korten ("tidigare session") använde fortfarande den gamla platta opaka recepten (ingen blur, ingen glas-känsla) istället för 3.58.10:s frostade-glas-standard, och PR-kategorirubrikerna (CHEST/BACK/SHOULDERS/...) hade INGEN bakgrund alls — bara textfärg, ren "vilda västern" mot väven ("PR har ingen box eller opaque. Även subpr"). Fix: `.hist-entry` + `.pr-card` uppgraderade till samma `.ex-block`-recept (`rgba(12,24,40,0.66→0.5)` + `blur(16px)` + cyan-kant). Ny `.pr-groups`-panel (samma frostade recept) wrappar hela kategori-listan, samma mönster som `.wlog-list` runt `.wlog-row`.
- **Defensiv stacking-fix på alla opaka paneler:** la till explicit `position:relative;z-index:1` på `.stat-box`, `.pr-card`, `.hist-entry`, `.pr-groups`, `.weight-banner`, `.settings-panel`, `.data-btn`, `.weight-chart-wrap`, `.wlog-list` — INGEN av dessa hade sin egen lyft, bara ärvt `.view`-lyften. Per tidigare lärdom (3.58.3-5) är `.view`-lyften ensam empiriskt opålitlig för djupare barn — gör alla opaka paneler "belt and suspenders"-lyfta en gång för alla istället för att jaga en i taget per buggrapport.

## 3.58.10 — 2026-06-25
**Nanosuit — Settings/Weight-boxarna (3.58.9) uppgraderade till samma frostat-glas-recept som övningar/header.** 3.58.9 gav `.settings-panel`/`.data-btn`/`.weight-chart-wrap`/`.wlog-list` en helt SOLID mörk gradient (samma som `.stat-box`/`.pr-card`, ingen alpha, ingen blur) — tekniskt opak men kändes platt och avvek från resten av temats genomgående frostade-glas-känsla. Bytt till exakt `.ex-block`-receptet: `rgba(12,24,40,0.66→0.5)` + `backdrop-filter:blur(16px)` + `border:1px solid rgba(0,212,255,0.16)`, så hela temat — header, nav, övningar OCH settings/weight-boxarna — delar samma mörka frostade känsla istället för en blandning av platta block och frostat glas.

## 3.58.9 — 2026-06-25
**Nanosuit — "vilda västern" på Weight/Settings/Progress: massor av lådor saknade bakgrund helt.** Header/nav/övningar var redan frostade (3.58.6-8) men resten av appen är byggd av rå inline-`style`-kod i `renderData()`/`renderWeight()` som aldrig haft någon bakgrund alls — bara `border:1px solid var(--gray-mid)` eller `background:none`. Harmlöst på alla andra teman (lugn, statisk bakgrund lyser igenom utan problem) men den energiserade hex-väven syns rakt igenom helt oblockerat. Drabbade: Rest Timer-boxen, vilo-tid-knapparna, viktenhets-knapparna, Custom Exercises-rader, temavalsgrid (mörk + ljus), Ambient Effects-boxen, Sync Status-kortet, samt `.data-btn` (Debug/Feedback/Program/Backup/Reset-knappar), `.weight-chart-wrap` (viktdiagrammet) och `.wlog-list` (viktloggens rader). Fix: ny generisk hook-klass `.settings-panel` (`background:none` i basen — noll-regression för andra teman) som fylls med samma solida HUD-panel-gradient som redan används av `.stat-box`/`.pr-card`/`.hist-entry` (`#0a1420→#050810` + `#1a3040`-kant) ENDAST för Nanosuit. Klassen sätter bara bakgrund/kant/padding där elementet inte redan deklarerar det inline (inline vinner alltid) — fyller bara i tomrummet, rör inget annat. `.pr-group-head` (PR-gruppernas rubriker) fick även en `color`-justering (`#5a8899`) för bättre kontrast.

## 3.58.8 — 2026-06-25
**Nanosuit — bottennaven (The Chain/Progress/Weight/Settings) får samma frostat-glas-behandling som headern.** Hade fortfarande den platta `rgba(5,8,16,0.92)`-bakgrunden — exakt samma för-höga-opacitet-fel som headern hade innan 3.58.6. Bytt till samma korrigerade recept (gradient + `backdrop-filter:blur(18px)`), riktningen speglad jämfört med headern (låg→hög istället för hög→låg) eftersom naven ankrar mot skärmens underkant — samma riktning Overgrowth/Undertow redan kör på sin nav (`rgba(255,255,255,0.25→0.62)`). Värt att notera: Overgrowth och Undertow hade redan frostat glas på sin nav sedan tidigare — Nanosuit är inte först med detta, men är nu först bland de "energiserade" mörka temana.

## 3.58.7 — 2026-06-25
**Nanosuit — header ljusare, övningar frostade, header-layout omstrukturerad.** Niklas bekräftade headern äntligen är opak-men-genomskinlig (3.58.6 löste det) men ville ha 5-10% till genomskinlighet — sänkt till `rgba(8,22,36,0.42→0.18)` (från 0.5→0.26). `.ex-block` (övningskorten) använde fortfarande 3.58.2:s helt solida `var(--surface-elevated)`/`var(--surface-saved)` utan alpha — bytt till samma frostat-glas-recept som header/chain-intro, men hållet i den högre änden (0.5-0.68) av det fungerande 10-55%-spannet eftersom korten har betydligt tätare text (set-nummer, taggar) än headerns korta rader.
- **Header-layout omstrukturerad** efter skiss: viktloggen (am-pill) flyttad ner i linje med Edit-knappen (samma rad, `.header-bottom-row`) istället för i linje med sync-raden. Version och Sync+prick var tidigare EN textsträng (`v3.58.6 · Sync ●`) som kunde radbryta så pricken hamnade ensam på egen rad — nu uppdelat i `.header-version` (egen rad) + `.header-sync-row` (Sync + prick, `white-space:nowrap` + flex så de garanterat aldrig separeras).
- Delad markup (`header`) → gäller automatiskt alla teman, inte bara Nanosuit.

## 3.58.6 — 2026-06-25
**Nanosuit — faktiska rotorsaken till "helt svart header" hittad (matematisk, inte gissad).** 3.58.5:s frostat-glas-gradient hade rätt MEKANISM (gradient + `backdrop-filter:blur`, exakt samma recept som Overgrowth/Undertow) men fel VÄRDEN: 82-94% tint-opacitet. Jämfört med de redan körda, fungerande recepten i samma fil — Overgrowth `rgba(248,252,239,0.55→0.1)`, Undertow `rgba(255,255,255,0.5→0.12)` — låg nanosuits opacitet 4-9x högre. Räkneexempel: `rgba(6,12,24,0.94)` ovanpå en ljus cyan-pixel lämnar bara 6% av bakgrunden synlig — resultatet är matematiskt nästan identiskt med ren svart, oavsett blur. Det här var alltså INTE en stacking-/override-bugg (grep bekräftade: ingen annan regel skriver över `body.theme-nanosuit header`/`.chain-intro`, ingen `!important`, inget z-index-konflikt — headerns `z-index:100` ligger redan korrekt över canvasens `z-index:0`) utan en kalibreringsmiss kvar sedan 3.58.2:s "gör allt helt opakt"-fix, som aldrig sänktes igen när receptet bytte till frostat glas. Fix: tint sänkt till 26-56% och färgen lättad något (från nästan-svart `#060c18` till en lite ljusare cyan-navy `#081626`) så glaset har en synlig frostad ton även mellan pulserna, inte bara när en sweep råkar passera. Blur höjt 14→18px för extra diffusion av starka pulser.

## 3.58.5 — 2026-06-25
**Nanosuit — frostat glas istället för platt block, + chain-intro fortfarande inte opak.** Skärmdump visade att 3.58.3:s `.view`-lyft inte räckte för `.chain-intro` (vävmönstret syntes fortfarande bakom "X/Y sessions done"), trots att `.ex-block` löstes av samma fix. Crusader-temat löser exakt samma typ av problem genom att INTE bara lyfta `.view`, utan ge varje opak panel sin egen explicita `position:relative;z-index:1` (se `.chain-intro`/`.chain-bar`/`.weight-banner` rad ~3416/~3707) — samma mönster applicerat här på `.chain-intro`, `.chain-bar` och `.ex-block`. Samtidigt: header och chain-intro bytt från platt solid färg till frostat-glas (gradient 72-94% opacitet + `backdrop-filter:blur(14px)`) — samma recept som Overgrowth redan använder på sin header (badrumsfönster-känsla: väven diffuseras till ett mjukt sken, syns aldrig som skarpa linjer mot texten).

## 3.58.4 — 2026-06-25
**Dubblerad "The Chain"-titel borttagen, Edit flyttad till headern.** `.chain-intro` (under chain-strippen) hade en egen "The Chain"-titel — ren kvarleva, ren dubblering av loggan i den övre sticky headern. Borttagen (alla teman, delad markup). `.chain-intro` visar nu bara `X/Y sessions done · Round Z` + %. Edit-knappen (öppnar Configure chain) flyttad in i headern, ny rad under v-nr/Sync-raden i `.header-right` — headern växer automatiskt i höjd (flex, ingen hårdkodad height). Ingen ny CSS behövdes — `.btn-chain-edit` har redan per-tema-styling för alla teman.

## 3.58.3 — 2026-06-25
**Nanosuit 2.0 — läsbarhetsfix #3 (hittade rotorsaken).** 3.58.1/3.58.2:s opacitets-höjningar på `.ex-block` hade noll synlig effekt, trots korrekt, helt solid CSS — för att `#view-chain` (`.view`) är ett vanligt `position:static`-element. Det fasta hex-canvas-backdroppet (`#nanosuit-bg`, `position:fixed;z-index:0`) staplas (paintas) ALLTID ovanpå icke-positionerade element, oavsett DOM-ordning eller hur opak deras egen bakgrund är — väven låg alltså bokstavligen *framför* övningskorten, inte bakom dem, så `.ex-block`s egen bakgrund kunde aldrig blockera den. Samma mönster fanns redan löst för Crusader-temat (`body.theme-crusader .view{position:relative;z-index:1;}`, rad ~3407) men hade inte applicerats på Nanosuit. Fix: `body.theme-nanosuit .view{position:relative;z-index:1;}` lyfter hela vyn (inkl. `.ex-block` och `.chain-intro`) ovanför canvasen — nu blockerar de opaka bakgrunderna från 3.58.2 faktiskt väven, som avsett.

## 3.58.2 — 2026-06-25
**Nanosuit 2.0 — läsbarhetsfix #2 (helt opakt).** 3.58.1:s ~85-97%-opacitet räckte inte i praktiken på mobil — vävens ljusa toppar punchade fortfarande igenom. Bytt strategi: header, `.chain-intro` (titel/Edit-raden) och `.ex-block` (övningarna) är nu helt opaka (solid `var(--surface-X)`, ingen alpha/color-mix), samma princip som `.pass-card` redan följde. Väven är chrome och får synas i de tomma ytorna — inte tävla med funktionell text.

## 3.58.1 — 2026-06-25
**Nanosuit 2.0 — läsbarhetsfix.** Energi-väven var så stark att övningarna knappt syntes mot den (ingen opacitet på `.ex-block` i nanosuit-temat — föll tillbaka på basreglens transparenta default, till skillnad från Obsidian/Cosmic Horror/Undertow/Overgrowth som alla redan hade en opak panel-bakgrund för sina canvas-backdrops). Fix:
- `body.theme-nanosuit .ex-block` får nu en opak panel (`color-mix(var(--surface-elevated) 88%, transparent)` + tunn cyan-kant; `.saved` → `var(--surface-saved)` 90%) — väven syns fortfarande som en svag glöd genom panelen, men texten är läsbar.
- Header-bakgrunden höjd från 85% till 97% opacitet (`color-mix(var(--surface-deep) 97%, transparent)`) — eliminerar spöktext-genomblödning av "The Chain"-introtiteln när den scrollar in under den sticky headern.

## 3.58.0 — 2026-06-25
**Nanosuit 2.0 — energised tactical armor.** Nanosuit-temat omarbetat med den rörelse originalet saknade. Internt id (`nanosuit`) + CSS-klass (`theme-nanosuit`) oförändrade → ingen migration, befintliga val intakta; bara visningsnamnet blir "Nanosuit 2.0".
- **Energising hex-väv-bakgrund (det stora):** ny viewport-fast canvas-backdrop (`mountNanosuitBg`/`_startNanosuitHex`, portad från Claude Designs `createHexField`) — ett hex-rutnät där cyan-ljusvågor sveper över ytan (expanderande ringar + diagonala sweeps + konstant idle-shimmer), som Crysis-dräkten som rippler. Följer canvas-tema-mönstret (Undertow/Overgrowth): `setTransform(dpr,0,0,dpr,0,0)`, monteras/avmonteras i `applyTheme`/`initTheme`. Perf (S23): ~30fps-tak + dpr-cap 1.5 + offscreen-förrenderad statisk väv. Den statiska SVG-väven i CSS-bakgrunden borttagen (canvasen ritar väven nu — annars dubblering/moiré).
- **Ambient Effects-toggeln** styr den tunga canvasen: av → en enda statisk väv-frame ritas (ej blank). Lätta CSS-mikroanimationer (scan-line, kort-morph, sync-heartbeat) körs alltid, som tidigare.
- **Full energising:** scan-line sveper nedför viewporten (~var 7:e s), travelling energy-edge (sheen) + glow-puls på next-up-passkortet, enstaka cyan-flicker på chain-titeln. `prefers-reduced-motion` stänger av allt.
- **Session-väljaren oförändrad** — kvar som den horisontella swipe-strippen (läser redan cyan via `--red`/`--gold`-tokens); 2.0 lägger bara en aktiv-glow. Mockupens vertikala kortlista adopterades INTE.
- Referens/handoff: `theme/Nanosuit 2.0/` (Nanosuit.html, ambient-nanosuit.js, variants/nanosuit.jsx, README).

## 3.57.1 — 2026-06-24
**#5 följdfix — Log-knappens höjd på mobil.** 3.57.0:s `align-self:stretch` sträckte knappen över hela grid-radens höjd = `.set-input` + dess `.set-unit`-label under → uppblåst på mobil (dolde sig på desktop pga större input-padding). Fix: Log-knappen wrappas nu i `.set-logcell` (flex-kolumn) med knappen (`flex:1`) + en osynlig `.set-unit`-spacer — speglar input-cellens struktur så knappen blir exakt lika hög som input-BOXen på alla breakpoints, oberoende av tema.

## 3.57.0 — 2026-06-24
Gym-feedback-batch (5 punkter).
- **#1 — PR-listan grupperad per muskelgrupp.** Personal Records är nu ett single-open accordion: expandera PR-sektionen → se muskelgrupperna (alla kollapsade), klicka en grupp → den expanderar och den förra kollapsar (samma mönster som övningarna). Inom en grupp sorteras PR alfabetiskt. Muskelgruppen re-deriveras ur `EXERCISE_LIBRARY[].cat` via kanoniskt namn (`libraryCatMap`/`prCategoryOf`); omappade/importerade PR hamnar i `Other`. Ny state `prOpenGroup` (device-lokal). Kort-renderingen utbruten till `prCardHTML`.
- **#2 — ny ryggövning `Jefferson Deadlift`** i `EXERCISE_LIBRARY` (Back, weight-default). Tag-fri enligt library-konventionen — ramp/HIT sätts per-instans i tag-editorn och persisterar som override.
- **#3 — uppvärmningsantalet följer med mellan pass.** Work-set-antalet persisterades redan (`lastSessionSetCount`); warmups nollställdes till default varje gång — asymmetrin gjorde att det "bara funkade med Ramp" (0 warmups i default). Ny parallell `lastSessionWarmupCount`-map (samma freshState/defaults/sync/merge-väg). Skrivs i `finishSession`, läses i `getDefaultSets`. Ramp opåverkad (warmups filtreras bort av RAMP-filtret oavsett).
- **#4 — teknik-tips är nu DATA på övningen, inte slotten.** Rotorsak till "Full ROM - Deep stretch" som satt kvar efter swap: tipset (rad 2) lästes ur slottens `detail`-fält, som är template-bundet → en inswappad övning ärvde den GAMLA övningens tip. Fix: nytt `tip`-fält i `EXERCISE_LIBRARY` (Cable Flyes, Dead Hang, Bike Cardio), ny `libraryTipMap`, och `getExerciseTip` resolvar på kanoniskt namn (ex.tip > library-tip > custom.tip). Slot-`detail`-fallbacken borttagen → tipset följer rörelsen vid swap. Legacy set-count-hints i `detail` ("2 sets" etc.) visas inte längre (redundanta mot set-count-systemet).
- **#5 — Log-knappen matchar input-fältens höjd.** Rotorsak: `.set-row` är `align-items:start` → grid-cellerna stretchar inte, och `.set-log-btn` var content-höjd (`padding:6px`). Fix: `align-self:stretch` + flex-centrerad label på enbart Log-knappen (rör inte radens default, så ✕/+F sitter kvar som förut).

## 3.56.0 — 2026-06-20
**Mätsätt (measurement type) — Nivå 2.** Bröt isär HUR ett set loggas (input-form + PR) från set-schemat (antal set). 7 mätsätt i sluten enum: `weight` (kg×reps), `bw` (BW+last), `bwreps` (bara reps), `timed` (sek), `cardio` (tid+km), `cardiosprint` (bas+sprintar), `carry` (kg+m). Intrinsisk default per övning (data, ej kod) + override per användare på kanoniskt exId (single-select i tag-editorn). Fixar: Bike Cardio loggar inte kg, Ab Wheel har inget meningslöst viktfält, Chins behåller BW vid swap (library-default). Ny: Assault Bike (`cardiosprint`, tid-bas), Farmers Walk/Sled Push (`carry`). PR-metrik per mätsätt (max kg/reps/sek/km/sprintar). `src/measures.js` + 24 tester (totalt 104). Render/capture/save/PR/copy/historik alla measure-drivna; `formatSetLine` shape-medveten. Set-schema får measure-baserade default-antal (cykling = 1 set, ej 2 warmup+1 work).

## 3.55.0 — 2026-06-19
Gym-feedback-batch.
- **#5 (kritisk dataförlust):** arbetsset försvann vid loggning. Rotorsak: Phase 3-vakten i `ensureExtraSets` gatade på avsaknad av ALLA loggade set (`_noLogged`) → en loggad uppvärmning stängde av work-set-paddningen permanent. Drabbade därför bara work sets, aldrig warmups. Fix: gate nu på avsaknad av loggade *work*-set (`_noWorkLogged`). Plus: `renderChain`/`rerenderSession` fångar otippade DOM-inputs innan omritning (synk/timer kunde annars wipea data).
- **#4:** historik-raden ("Last (Xd ago)") renderar varje sparat set efter sin egen form (BW/timed/vikt) oberoende av nuvarande tagg/swap-state — en BW-övning som swappats visade "—kg" istället för "BW + X". Plus W-före-S-sortering (lagrad ordning hade work först).
- **#1:** ny övning `Face Pulls (external rotation)` (AthleanX-variant); överflödiga `Light Face Pulls` borttagen.
- **#2:** `Cable Rotator Cuff` borttagen (dublett) — D4 pekar nu på befintliga `External Rotator Cuff`. Engångsmigrering slår ihop gammal Cable-historik (namn + exId + lastSessionSetCount).

## 3.54.1 — 2026-06-19
4 Swedish strings replaced with English: delete-permanently modal body, finish-session toast, reminder placeholder example, ambient effects description.

## 3.54.0 — 2026-06-12
**Extras-parity: extra övningar är nu förstklassiga övningar.** Niklas princip: "det ska inte vara någon specialfunktion kring det" — en extra övning är bara en övning som inte ingår i standardprogrammet. Strukturell refaktor:
- **Stabila id:n.** Extras identifierades av ARRAY-POSITION (`extra_B_2` = index 2) — samma anti-pattern som sid-modellen (3.39.0) och exId (3.40.0) utrotade för set och ordinarie övningar. Nu får varje extra ett stabilt id vid skapande (`extra_<passId>_<sid>`); `removeExtra` re-indexerar inte längre. Legacy-drafts migreras i `ensureStateDefaults` (extras utan id får sitt dåvarande index-id → all keyad data matchar utan remapping; speglas + testas i `src/extras-model.js`).
- **`buildExtraBlock` raderad (~85 rader).** Extras renderas genom SAMMA loop som ordinarie övningar via syntetiska ex-objekt (`makeExtraEx`: id/name/flaggor från customExercises). Därmed får extras automatiskt: V1 Collapse (aktiv/kollapsad/done), tags-rad, BW/timed/uni-set-rendering, historik, notes/reminders, fail-knapp, korrekt done-state.
- **PR-tracking inkluderar extras** (`ex.extra`-exkluderingen borttagen i `getAllPRs` + `buildPRMap`). Gamla extra-set räknas retroaktivt — datan fanns redan i loggen. History-räknaren ("X ex") räknar också extras nu.
- **Tags fungerar på extras.** Tag-editorn nås via Edit▾; overrides keyas på extra-id:t och städas vid finish/remove; flyttas till permanenta id:t vid "+ Program". Custom-övningars flaggor (BW/timed/...) ärvs automatiskt.
- **`saveExercise`/`captureInputsToSetsBuffer` flagg-fix:** extras sparades ALLTID som `isBW=false, isTimed=false` (fel data för BW-extras). Nu samma resolution som renderingen. Bonus-fix för ordinarie: inswappad custom-övnings flaggor respekteras nu även vid capture/save (`effEx`-prioritet — samma diskrepansklass som 3.52.3).
- **`ensureExtraSets` unifierad:** extras får tag-drivna defaults (`getDefaultSets`), RAMP-filter och stale-pad — inklusive arv av förra passets set-antal via kanoniskt exId.
- **V1 Collapse-rotation:** `findNextOpenExercise` + activeExerciseId-resolution inkluderar extras. Ny extra blir automatiskt aktiv övning (man lägger till den för att göra den nu).
- **UX:** extras-knappar harmoniserade — Skip + Edit▾(🏷 Tags / + Program / Remove), samma formspråk som ordinarie. Ingen swap på extras (man valde övningen fritt). `undoSession` återbygger extras via id (ingen index-parsning).
- **Tester:** ny `src/extras-model.js` + 23 tester (migration/syntetiska ex/exId-resolution). Totalt 80 gröna.

## 3.53.3 — 2026-06-12
**Extra-övningar kollapsar nu i done-state + id-bevakning.**
- **Extra kollapsade inte efter Finish Session:** `buildExtraBlock` lade aldrig till `.collapsed`/`.done` på ex-block-diven, och renderade aldrig `<div class="ex-collapsed-summary">`. Alla reguljärer kollapsade (CSS-driven), extras stod expanderade. Fix: beräkna `_wkCountEx` och `_colStatusEx` (✓ X sets / Skipped), lägg `.collapsed.done` på blocket, rendera summary-div precis som reguljärer. `.ex-block.collapsed.done` = `cursor:default`, ingen hover — read-only.
- **Done-state extras tappade `id`-fältet:** `completedExs.map(e=>({name:e.name}))` bevarade inte `e.id`. Ändrat till `({id:e.id, name:e.name})` för konsistens med övrig extras-logik och som grund för framtida paritet.

## 3.53.2 — 2026-06-12
**Tre gymfeedback-buggar: Fail-indikator, copy, extra-historik.**
- **Fail-markering försvann efter Done:** Set-cellen renderade `<div></div>` när `isSaved=true`, utan att kolla `savedSet?.fail`. Nu visas `✗` på sparade set som är markerade Fail (alla tre set-typer: extras, BW-set, normala set).
- **Copy saknade ✗ på failade set:** `buildCopyLines` appendade aldrig `set.fail`. Nu: `S5: 225 kg × 1r ✗` för ett failat set.
- **Extra-övningar visade ingen historik:** `buildExtraBlock` anropade aldrig `getLastSession`. Dessutom lagrade `finishSession` `exId='extra_B_2'` (runtime-slot, index-baserat) på extras istf kanoniskt namn-slug → historiken matchade aldrig. Fix: `finishSession` resolvar extras via `resolveExId(ex.name, null, null)` (namn-slug); `buildExtraBlock` visar "Last (Xd ago)"-raden med set-historik, samma format som ordinarie övningar. Gäller nya sessions framåt — gamla log-rader med runtime-slot-id hittas ej (acceptabelt).

## 3.53.1 — 2026-06-11
**Lågprio-städ: de tre flaggade fynden från 3.53.0-granskningen.**
- **`migrateExerciseNames` re-skannade hela loggen vid varje load** för användare utan legacy-namn (flaggan sattes bara om något ändrades). Nu sätts `migrations.exerciseSplit_v2` alltid efter körning — engångsmigration per design.
- **`askModalConfirm` läckte en document-`keydown`-lyssnare** vid varje stängning via knapp eller backdrop (togs bara bort på tangent-vägarna). Nu städas lyssnaren i alla stängningsvägar + guard mot att lyssnaren läggs till efter att modalen redan stängts (50ms-fönstret).
- **`lastSessionNotes` pensionerat.** 3.40.0 gjorde notes persistenta i `exerciseNotes` — inget skrev nya entries, men stale pre-3.40-reminders renderades som ⏰-banner för evigt (gamla auto-droppen fanns inte längre). Borttaget: fält-init (freshState), sync-merge, ⏰-render-grenen, clearReminder-grenen, exId-remappen (index.html + src-spegeln), `reminder-prev`-CSS (bas + 4 tema-overrides). `ensureStateDefaults` städar bort fältet ur befintliga states (merge-raden borta → ingen cloud-resurrect).

## 3.53.0 — 2026-06-11
**Full kodgranskning: 9 buggar fixade + dödkod rensad.**
- **Template-sessioner försvann efter reload (KRITISK, latent):** `BASE_SESSIONS.push(tmpl)` skedde bara i sessionen där passet lades till (Add session / Rebuild Chain / onboarding-import). Efter reload saknades G–N i `BASE_SESSIONS` → `buildEffectiveChain` droppade passet tyst ur kedjan. Fix: `ensureStateDefaults` re-pushar saknade template-pass från `sessionOrder` vid varje load/cloud-merge (+`invalidateChainCache`). Täcker även `importTemplate` som aldrig pushade.
- **`deleteCustomExercise` kraschade vid perm-swap:** koden antog gammalt objektformat (`list.filter(s=>s.toId!==id)`) men `permanentSwaps[slotId]` är en namn-sträng → TypeError, `save()` nåddes aldrig (ingen tombstone, ingen rerender). Fix: ta bort swap-poster vars värde matchar den raderade övningens namn.
- **PR-vyn — 3.40.0-exId-migrationen var inkomplett:** `getAllPRs` nycklade på slot-id → samma övning i två pass (A3+E3 Cable Flyes) gav två PR-kort; `isBW` lästes från BAS-slottens def istället för log-radens egen `bw`-flagga → fel PR-beräkning efter swap/tag-override. Fix: nyckla på kanoniskt exId + `ex.bw` med def-fallback. Samma bw-fix i `buildPRMap` (export).
- **Historik-etiketter i Progress:** `W0, W1, S3` (rått array-index) → korrekt `W1, W2, S1` (samma räkning som copy/skärm sedan 3.39.0).
- **`copySessionToClipboard` ignorerade rename:** använde `pass.name` (basnamn) istället för `getSessionName()` (PM7-miss).
- **`keepaliveCloudPush` läckte `drafts` till cloud:** bara `draft` exkluderades → stale device-lokala drafts kunde följa med "Restored from cloud" på ny enhet. Fix: exkludera båda (paritet med `pushState`).
- **`importData` (JSON-backup) hoppade över migrations:** körde bara ad-hoc unit/overrides-defaults. Nu samma pipeline som `loadStateForUser` (passKeys→session, ensureStateDefaults, schema-migrations).
- **Fail-knapp saknades på extras-set** (3.52.2-inkonsekvens) — nu samma ✓/Fail-markup som ordinarie övningar.
- **`getRenderExId` för tillagda custom-övningar:** fick `ex_slug` medan samma övning inswappad fick `custom_<id>` → splittrad historik/notes. Nu samma custom-id-lookup som swap-grenen.
- **CSS:** `.ex-note-clear` dubbeldefinierad (banner-✕ vs editor-knapp delade klass → ✕:et fick border/grå/.44rem) — scopade till `.ex-note-banner` resp `.ex-note-actions`. `body.theme-iron .set-logged-indicator` matchade aldrig (Iron har ingen body-klass) → Irons hexagon-kontur för loggade set var död sedan 3.36.0; nu `body:not([class*="theme-"])`.
- **Dödkod rensad:** `toggleCard()`, global `timerDefault`, toggleSides döda buffer-block (`card-${id}`-DOM borta sedan 3.23.0). `confirmAddEx`-scroll lagad (pekade på samma döda DOM). `isLoading` deklarerad (var implicit global).

## 3.52.4 — 2026-06-08
**UX: Fail-knapp → "Fail" (text), subtil röd karaktär.**
Fail-knappen byter label från `F` till `Fail` för att skilja sig tydligt från `+f` (forced reps). Inaktiv: subtil röd border + text via `rgba`. Aktiv: tydligare röd. Semi-transparent bakgrunder fungerar på alla teman utan per-tema-override.

## 3.52.3 — 2026-06-06
**Bugg: tagOvr.bw=false + swap → LOG fångar alltid null vikt.**
Rotorsak: `captureInputsToSetsBuffer` och `saveExercise` använde `!!ex.bw` för `isBW`-flaggan, ignorerade `exerciseTagOverrides[exId].bw`. Renderingen läser `tagOvr.bw !== undefined ? tagOvr.bw : !!effEx.bw`. Diskrepansen: rendering visar normal-vikt-input `id="w-F1-sid"`, men capture läste BW-input `id="bw-F1-sid"` (null) → vikt aldrig fångad, loggad som null.
Scenariot: F1 (Pull-ups, bw:true) swappad till Power Clean + Shoulder Press + RAMP + BW-tag stängd av. Fix: båda funktionerna konsulterar nu `exerciseTagOverrides[exId].bw` med samma prioriteringlogik som renderingen.

## 3.52.2 — 2026-06-06
**Feature: Fail-flagga per set.**
Nytt "F"-knappar visas inline under ✓-indikatorn när ett set är loggart. Tryck för att markera settet som failat — knappen lyser röd, ✗-marker syns i ✓-bubblan. Failade set räknas INTE som PR (uteslutna i `getAllPRs` och `buildPRMap` via `if(s.fail) continue`). ✗-marker visas i "Last (Xd ago)"-historiken under övningen samt i Progress-vyn historik. `fail`-flaggan persisteras i `loggedSets[exId][sid].fail` och kopieras in i saved sets via `saveExercise`. Toggle via `toggleSetFail(exId, sid, passId)`.

## 3.52.1 — 2026-06-06
**Bugg: swap + RAMP-tag → ✓ på work sets utan loggad data, kunde ej logga vikter.**
Rotorsak: RAMP-filtret i `ensureExtraSets` körde EFTER stale-pad. Loggade warmup-sids (t.ex. W1/W2 med reps men inget kg) levde kvar i `loggedSets[exId]` efter att filtret tagit bort dem ur `extraSets`. Det gav `_noLogged=false` och blockerade stale-pad, trots att inga work sets var loggade. I kantfall matchade orphan-sidsen deterministiska `wk`-sids och visades som ✓ utan data.
Fix: tre-fasig omstrukturering av `ensureExtraSets`: (1) init/sid-ensure, (2) RAMP-filter + explicit rensning av orphan-sids ur `loggedSets`/`inputBuffer`, (3) stale-pad — nu körandes EFTER filtret med korrekt `_noLogged`. Resultat: swap + RAMP ger alltid korrekta work sets med LOG-knappar.

## 3.52.0 — 2026-06-05
**UX/design-audit (9 fynd åtgärdade + knappordning):**
1. **Knappordning** — "+ Warm-up" visas nu FÖRE "+ Work Set" i övningskortet (i utförandeordning). Globalt (2 ställen i renderingen). RAMP-villkor (ingen warm-up) bevarat.
2. **Reminder-banner kontrast** — `.ex-note-banner` + `.reminder-prev` fick per-tema overrides för Daylight, Arctic, Undertow, Overgrowth: mörk amber `#7a5200` + semi-opak bakgrund mot ljusa ytor (var ~2.4:1, nu ~7:1). Notes och reminders är läsbara i gymljus.
3. **Draft-notice synlighet** — bas `color:#4a7a4a` (mörkgrön, försvann på mörka teman) → `#60aa60` (ljusare) + `border-color:#3a7a3a`. Daylight/Undertow/Overgrowth fick egna ljust-tema-overrides.
4. **Ember nav-knappar** — inaktiv `color:#664422` (under AA på svart) → `#aa7744`. Aktiv state oförändrad.
5. **ex-note-save + ex-mini-btn ljusa teman** — Dark-tema-defaults (`background:#2a1a00`, `border:#333`) läckte in på Daylight/Arctic/Undertow/Overgrowth. Fick per-tema overrides: ljus bakgrund, tematonsatt border + text.
6. **add-set-btn Overgrowth** — saknade override (Undertow fick fix i 3.48.0, Overgrowth missades). Nu: `color:#3d5e3a; border-color:rgba(50,90,45,0.4)`.
7. **Daylight — Inter font** — `--sans:'Inter'` men Inter saknades i Google Fonts-anropet → systemfont. Lagt till `family=Inter:wght@300;400;500;600;700`.
8. **Nanosuit surface-tokens** — `--surface-base/input/saved` ärvdes från Iron (svart). Lagt till: `#0a1628`/`#0d1e30`/`#0a1a28` (djup navy).
9. **Obsidian + Crusader set-input** — Cinzel (display serif) som `--mono` ger ojämna sifferbredder i set-rader. `.set-num` fick global `font-variant-numeric:tabular-nums`. `.set-input` på Obsidian/Crusader explicit IBM Plex Mono.

## 3.51.5 — 2026-06-04
Nanosuit + Night City fick PM22 surface-tokens (`--surface-elevated/deep/border-subtle`) — tag-editorn visade Iron's generiska grå istället för temats marina/lila färger. Nanosuit: `#0c1828/#060c18/#1a2a40`. Night City: `rgba(18,4,36,0.95)/#060110/rgba(122,85,160,0.25)`. Samma tokens dokumenterade i respektive `theme/*/README.md`.

## 3.51.4 — 2026-06-04
**Code review fixes (7 fynd):** (1) Arctic-tema CSS-ref till borttagen designice.png rensad → gradient-only. (2) EXERCISE_LIBRARY-grupperingslogik extraherad till `groupExercisesByCategory()` med cache — eliminerar 3 duplicat + onödig iteration vid varje render. (3) `ensureDraft()` garanterar nu `extras:[]` och `setEdited:{}` på gamla drafts → fixar potentiell TypeError vid add/remove extra exercise. (4) `askModalText` escapar `placeholder`/`defaultValue`/`confirmLabel` via `escapeHTML()`. (5) `checkCloudVersion()` throttlad till 1 anrop/30s i `renderData()` → eliminerar Supabase-spam vid varje Settings-render. (6) `buildTagEditorHTML` hardkodade `#080e18`/`#050a12`/`#1a2a3a`/`#14202c` → `var(--surface-elevated)`/`var(--surface-deep)`/`var(--border-subtle)` (PM22-fix, fungerar i alla teman).

## 3.51.3 — 2026-06-04
Standing Cable Front Raise tillagd i EXERCISE_LIBRARY (Shoulders, alfabetisk ordning mellan Rear Delt Flyes och Upright Row).

## 3.51.2 — 2026-06-03
**Overgrowth-rankor fryser inte längre mitt i — relentless creep.** Niklas: rankorna slutade röra sig mot mitten (stannade halvvägs). Rotorsak: vid `maxLen`/target gick rankan till `mature` och bara HÖLL (frös, swayade på stället) tills den fadeade. Nu fortsätter mature-rankor att krypa långsamt inåt (~30% fart) med lätt vobbel → de stannar aldrig, bara saktar ner, kryper djupare och löses sedan upp medan en ny startar från kanten. Matchar "konsumeras av växten"-känslan utan att täcka centrum (de fadear innan de når mitten). Kortare hold (280–640→160–340 frames) så omsättningen känns levande.

## 3.51.1 — 2026-06-03
**Overgrowth-buggar: mörk-på-mörk i Settings + ambient-toggle + rankvariation.** Tre fixar:
1. **Mörk-på-mörk vald-state.** Settings (KG, 2 min, vald tema-kort) blev oläslig: `renderData()` selFg special-case:ade Void + Undertow men INTE Overgrowth (id `understory`) → föll till `var(--white)` #143018 (nära svart) på `var(--red)` #1f4226 (mörk skog) = mörk-på-mörk. Lade till `isUnderstory → selFg #f3f8ea`. Fixar unit-knappar, rest-duration OCH tema-korten (de använder selFg).
2. **Ambient-toggle stängde inte av rankorna.** `toggleAmbientEffects` stoppade rAF-loopen men rensade aldrig canvasen → sista framen frös kvar på skärmen (såg ut som att de var kvar). Nu rensas canvasen vid avstängning (samma fix för Undertows bubblor).
3. **Rankor "slutar halvvägs".** Var avsiktligt (öppet centrum) men läste som en uniform häck vid mittlinjen. Varierad reach nu — de flesta stannar i sidobandet, några kryper djupare (ibland förbi mitten) → organisk övervältning istället för en vägg.

## 3.51.0 — 2026-06-03
**Overgrowth-rankor: viewport-fast + bara från sidorna → slut på scroll-hack.** Världs-koord-versionen (3.50.0) hackade vid scroll — rotorsak: canvasen måste ritas om varje scroll-frame för att hålla rankorna i linje med sidan (redraw↔scroll-koppling på main-thread). Lösning efter bollplank med Niklas: **viewport-fast canvas** (pixlar oberoende av scroll → kompositorn scrollar slätt, ingen redraw krävs vid scroll) **men rankorna kommer BARA från vänster/höger kant** och växer inåt, stannar före mitten (kant-tung). Då hålls centrum (träningsinnehållet) öppet → ramar in istället för att täcka → ingen "film på skärmen"-känsla (det var det "alla kanter → mitten"-trialen led av). Matchar narrativet: äventyraren ligger på rygg, växten kryper in över synfältet från periferin. Antal i övre spannet (MAX 20, 14 förodlade), vertikal sway, pollen viewport. Perf-vinsterna behålls (en stroke()/rank, sprite-pollen, 30fps, dpr 1.5).

## 3.50.1 — 2026-06-02
**Set-label-storlek = en standard över alla teman.** Niklas: S1/S2 ska ha EN tydlig standardstorlek som korsar alla teman, inte drifta per tema iteration efter iteration. Audit visade att inget tema över-rider `font-size` på `.set-num` (bara color/font/weight) → bas-regeln ÄR den gemensamma standarden. Låst till **`.82rem`/`.72rem` (mobil)** = samma som KG/REPS-etiketterna (`.set-unit`), så set-nummer och enhets-etiketter är visuellt lika stora. Kommentar i CSS + minne markerar att teman aldrig får sätta egen `font-size` på `.set-num`. (Forna ministorleken `.44rem`/`.38rem` är death.)

## 3.50.0 — 2026-06-02
**Rensa reminders + större/tydligare set-text + Overgrowth tillbaka till världs-koord.** Fyra saker:
1. **NYTT: rensa notes/reminders.** ⏰-reminder från förra passet (`lastSessionNotes`) kunde inte tas bort — den låg kvar tills man skrev en ny note ("kvar tills du uppdaterar den"). Niklas: "poppar upp och jag kan inte ta clear". Nu har både 📝-note- och ⏰-reminder-bannern en **✕-knapp** (`clearReminder`) som rensar både aktuell note och inkommande reminder + skriver tombstone (`deletions.exerciseNotes`, samma namespace som `lastSessionNotes`-mergen läser → inget cloud-resurrect).
2. **Set-nummer (S1/S2…) ännu större.** `.set-num` `.6rem`→`.72rem` (`.54`→`.64` mobil). Närmar sig KG/REPS.
3. **Historiken tydligare.** Förra passets set (`.ex-prev-history-set`) var `.65rem`/`#aaa` (ljusgrå, ingen tema-override). Höjt till `.72rem` + mörkare per tema (Undertow #395260, Overgrowth #46663f, set-etikett ännu mörkare). Gäller alla teman som ärver basen.
4. **Overgrowth: tillbaka till världs-koord.** Niklas ogillade "film på skärmen"-känslan av viewport-fasta rankor. Vin-motorn (+ pollen) lever nu i sid-space igen och scrollar MED innehållet (klättrar uppåt) — min standardregel. Perf-vinsterna (en stroke()/rank, sprite-pollen, 30fps, dpr 1.5) + täthet 25 behålls.

## 3.49.0 — 2026-06-02
**Set-lås-bugg fixad + läsbarhet (set-nummer, Undertow mörkare).** Tre saker:
1. **BUGG: kunde inte ta bort set (kändes "låst").** `ensureExtraSets` pad:ar work-set-antalet upp till förra passets antal (eller tag-default) när inget loggats än — men `removeExtraSet`/render kör den, så borttagna set snäppte direkt tillbaka. Niklas: Flat DB Press låst på 6 set. Fix: explicit add/remove sätter `state.draft.setEdited[exId]` → pad:en hoppas över för den övningen resten av passet. Auto-förifyllning vid passstart är kvar för orörda övningar.
2. **Set-nummer (S1/S2/…) var minimala.** Base `.set-num` var `.44rem` (`.38rem` mobil) ≈ hälften av KG/REPS (`.82rem`). Höjt till `.6rem`/`.54rem` + `font-weight:600` (globalt, alla teman). `.ex-prev` (förra passets set) `.65rem`→`.72rem`.
3. **Undertow mörkare (omgång 2).** 3.48.0 räckte inte — Niklas såg fortfarande dåligt. Muted-paletten ytterligare mörkad (`--gray-light` #46606c→#33505c m.fl.), set-historik (`.ex-prev`) #4d6671→#2c4651, KG/REPS #46606c→#2f4b57, Finish-disabled läsbar. Overgrowth: `.ex-prev` ljusoliv #8aa47e→#52704a + grön `.set-num`.

## 3.48.0 — 2026-06-02
**Undertow läsbarhet + Understory→Overgrowth + tätare rankor.** Tre saker:
1. **Undertow kontrast-pass.** Niklas (mobil): "ser väldigt dåligt på den". Temat var tonat mot en ljusare preview → sekundärtext drunknade mot den nästan vita bakgrunden. Mörkare slate-palett: `--gray-light` #6f8c98→#46606c, `--gray-mid` #8aa4ae→#5d7682, plus explicit mörkare ex-detail/ex-prev (set-historik), pass-preview, section-sub, hist, header-user, nav-flikar. Default `.set-unit` (KG/REPS/+F) föll tillbaka till #888 och `.add-set-btn`/`.add-ex-btn` till #888/#666 — fick Undertow-overrides. Input-fält fick starkare kant (0.18→0.34) + mer opak bg så de syns. **Finish Session** (disabled, 0/4) hade nästan osynlig text → läsbar mörk. Samma "höj kontrast ~25%"-lärdom som tidigare ljusa teman.
2. **Understory heter nu Overgrowth.** Visningsnamnet bytt i tema-väljaren (Niklas val efter "Creeping Death"). Internt id/CSS-klass förblir `understory`/`theme-understory` — inget id-byte = ingen migration, befintliga användares temaval påverkas inte. Dev-mappen + filerna döptes om `theme/Understory/` → `theme/Overgrowth/` (README, *Theme.jsx, redesign/, handoff/) så namnet inte blandas ihop framöver; koden söks fortfarande på `understory`.
3. **Overgrowth-rankor: 14→25.** Niklas: fortfarande för luftigt. Tätare nu när motorn är ~10x billigare (3.47.2). 15 förodlade vid mount för lush första frame.

## 3.47.2 — 2026-06-02
**Understory-rankor: ~10x billigare → slut på scroll-lagg.** Rapport från Niklas (S23): scrollen laggade. Rotorsak: rit-loopen ritade varje rank-segment som ett eget `stroke()`-anrop (~11 000 anrop/frame @ 60fps) + ny radial-gradient per pollen-mote per frame + per-frame array-allokering — huvudtråden mättades, scroll hackade. Fixar (ingen visuell förändring att tala om): (1) **en `stroke()` per rank** istället för per segment (sway beräknas inline, ingen array-alloc), (2) **platt löv-fyllning** (fillStyle 1 gång/rank, ingen gradient/mittnerv per löv), (3) **pollen via förrenderad sprite + `drawImage`** istället för radial-gradient per mote, (4) **~30fps-tak** (ambient-växt behöver inte 60 → halverar last), (5) **dpr-tak 1.5** + grövre växtsteg (färre punkter). Antalet rankor oförändrat (14) men har nu gott om headroom — kan ökas vid behov. Rör inte funktionen, bara ritningen.

## 3.47.1 — 2026-06-02
**Gym-session-tid bort ur copy/paste.** Den delade övnings-kopian (`buildCopyLines`, ⎘ Copy på avslutat pass + history) tog automatiskt med `⏱ <varaktighet>`. Vid mycket app-testande blir pass liggande öppna i timmar → "6h gym session time" följde med kopian per automatik. Nu utelämnas tiden ur kopian; folk får hålla koll på sin egen tid. **Funktionen är kvar** — varaktigheten beräknas, sparas i loggen och visas fortfarande i Done-badgen (`Done · datum · tid`).

## 3.47.0 — 2026-06-02
**Understory redesign — the canopy closes in.** Omarbetning av rank-bakgrunden efter Claude Design-underlag + Niklas-vision: man ligger på rygg och rankorna klättrar in över synfältet. (1) **Vin-motorn vänd** från "växer uppåt med innehållet" (världs-koord) till **viewport-fast**: rankor kryper in från ALLA kanter mot mitten och stannar i en ring runt centrum — kant-tung densitet så periferin känns övervuxen men mitten förblir läsbar för träningsinnehållet. (2) **Betydligt fler rankor** (MAX 5 → 14, 9 förodlade vid mount) + lägre per-rank-alpha så det blir frodigt utan att bli grötigt. (3) **Pollen** som driver uppåt genom ljuset (24 motes på vin-canvasen). (4) **Övningskort = bark/skog**: vertikal trä-ådring (lager av repeating-linear-gradient, ingen SVG-filter/blend → mobil-säkert) på `.ex-block`/`.pass-card`, varmare bas — medan appens bakgrund behåller sin ljusgröna "titta-upp-mot-skyn"-gradient. Ambient Effects-toggle styr rankor + pollen; canopy-flecks alltid på. **OBS scroll-beteende:** detta överrider den vanliga världs-koord-regeln (effekter ska normalt scrolla med innehållet) — medvetet val för "rankor över ögonen"-konceptet, på prov.

## 3.46.4 — 2026-06-01
**Chain-strip "på glänt" = EN komprimerad form (Cosmic + Obsidian).** Niklas-princip: Iron briljerar genom att adjacent-fliken är en HEL hexagon som komprimerats (bokstav + "CHE"), inte två lösa bitar. Cosmic/Obsidian visade istället cirkel-blob + separat namn = två blobar. Fix: containern (`.chain-tab.adjacent`) bär nu EN blob/scroll-form; bokstav + kortnamn är transparenta så de läser som en hel hoptryckt form. Plus: Obsidian aktiv medaljong smälter in i scrollen (ingen separat guldcirkel) — samma behandling som Cosmic fick i 3.46.3. Aktiv + adjacent läser nu som sammanhållna enheter på båda teman.

## 3.46.3 — 2026-06-01
**Cosmic aktiv chain-tab: "på glänt"-look fixad.** Niklas-observation: aktiv session såg halv-expanderad ut — bokstaven låg i en separat cirkel med egen kant (identisk med kollapsade D/F-cirklar) inuti stadium-formen → såg ut som en kollapsad flik mitt i expansion. Plus namnet kapades hårt ("TR" istället för "TRAPS"). Fix: aktiv bokstav har nu ingen egen kant/bg — den smälter in i kapseln som en del av formen (som Iron). Namnets max-width 130→175px + mindre letter-spacing → "SHOULDERS + TRAPS" får plats. Aktiv tab läser nu som EN fullt öppen enhet.

## 3.46.2 — 2026-06-01
**Knappform-enhetlighet (steg 2) — fixar 5 temans latenta hexagon-LOG + unifierar.** Ember, Void, Arctic, Daylight, Crusader LOG-knappar ärvde base-hexagonen (saknade `clip-path:none`) trots designintention. Nu: `clip-path:none` återställer avsedd form — Void/Arctic/Daylight blir pills (18/14/14px), Ember/Crusader blir rektanglar (forged stamp / molten). DONE + Finish unifierade: pill-temana får matchande border-radius, Ember/Crusader var redan rektangulära. **ALLA 12 teman har nu enhetligt formspråk på LOG/DONE/Finish** (Cosmic-guldstandarden uppnådd för knappformer). Återstår av guldstandard-paketet: kursiv text på kommande övningar + unika chain-strip-symboler för fler teman.

## 3.46.1 — 2026-06-01
**Chain-strip: adjacent/distant följer temats form, inte Iron-hexagonen.** Niklas-observation: på Cosmic (och Obsidian) hade aktiv session unik form (blob/medaljong) men "på glänt"-sessionerna behöll base-hexagonen. Rotorsak: `.chain-tab`-containern har base hexagon `clip-path`; Cosmic/Obsidian satte `clip-path:none` på bokstaven + `.active` men inte på containern → adjacent/distant klipptes till Iron-form. Fix: `clip-path:none` på containern + organisk `border-radius` på adjacent name-short (Cosmic blob, Obsidian liten radie). Nu talar hela chain-stripen temats formspråk.

## 3.46.0 — 2026-06-01
**Knappform-enhetlighet (steg 1) — Cosmic-guldstandarden.** DONE + Finish Session ärver nu LOG-knappens form per tema, så de tre knapparna talar samma formspråk. Klart: Iron + Nanosuit (hexagon clip-path), Night City (parallelogram). Tillsammans med Undertow (pill) + Understory (blad) från 3.45.2 och Cosmic (referensen) har nu 6 teman enhetliga knappformer. **Upptäckt latent bugg (dokumenterad, ej fixad än):** Ember/Void/Arctic/Daylight/Crusader LOG-knappar ärver base-hexagonen (saknar `clip-path:none`) → ser ut som Iron trots designintention (pill/rektangel). Förklarar varför de känns mindre crafted. Fix per tema kommer.

## 3.45.2 — 2026-06-01
**Understory vin-pop fix + Undertow/Understory knappform-enhetlighet.** (1) Viner poppade bort vid scroll — skip-villkoret var bakvänt: rankan växer uppåt (tip=topp/liten y, base=botten/stor y), men koden skippade hela rankan så fort basen var under viewporten trots att kroppen syntes. Nu skippas bara rankor helt utanför vyn. (2) DONE + Finish Session delar nu LOG-knappens form per tema (Undertow pill 11px, Understory blad). (3) Latent bugg fixad: `.ex-done-primary.ready` ärvde `color:var(--white)` på `background:var(--red)` → mörk-på-mörk text på Undertow/Understory så fort alla set loggats. Båda får nu explicit ljus text + tema-gradient + hover.

## 3.45.1 — 2026-06-01
**Fix: Service Worker cachade stale version vid install.** Rotorsak: `cache.addAll` under SW-install gick via den gamla SW:n och kunde få gammal cached version. Fix: `fetch(url, {cache:'no-store'})` under install — hämtar alltid färskt från nätverket. Plus: `controllerchange`-lyssnare i index.html som reladdar sidan automatiskt när ny SW tar över → uppdateringar syns direkt utan manuell cache-rensning.

## 3.45.0 — 2026-06-01
**NYTT TEMA: Understory** — Rainforest floor light theme. Varm grön gradient (#e9f2db→#a6c690), dappled canopy-ljus via CSS sun-fleck-spans (screen blend) + statisk SVG leaf-shadow (multiply blend). Klättrande viner på canvas (world-coord från start — Undertow-lärdomen). LOG-knapp som organiskt blad (`border-radius:3px 50% 3px 50%` + diagonal midrib-highlight via ::after). Tendril som hänger från headern (CSS ::after, kräver `overflow:visible`). Bricolage Grotesque (display) + Spline Sans Mono (mono). Alla checklistepunkter applicerade: sticky header ej brutit, btn-chain-edit override, selFg=#f3f8ea, toast+add-ex-confirm override.

## 3.44.5 — 2026-06-01
**Undertow: systematisk fix av aktiva/valda element.** Rotorsak: flera ställen i koden använde hardkodad `#000`/`#555` text (tema-kort) eller `color:var(--white)` (toast, add-ex-confirm) på `background:var(--red)` — i Undertow är båda mörknavy → svart-på-svart. Fix: (1) Tema-korten i Settings använde `#000` hårdkodat, borde ha använt `selFg` — bytt till `selFg` i alla tre ställen (knapp, namn, beskrivning, bock). (2) `.toast` och `.add-ex-confirm` fick `color:#eaf2fb` override i Undertow CSS. `selFg` var redan korrekt satt till `#eaf2fb` för Undertow sedan 3.44.1 — gäller nu konsekvent för rest-timer, unit-knappar OCH tema-kort.

## 3.44.4 — 2026-06-01
**Undertow bubblor: world-coordinates (film-känsla fix).** Samma fix som Obsidian fick i 3.31.3. Bubblorna spawnade i viewport-koords → scrollade inte med content → kändes som ett filter lagt på skärmen. Nu: spawnar längs hela `document.scrollHeight`, `ctx.setTransform` shiftas med `-scrollY*dpr` varje frame → bubblor rör sig naturligt med appen. Canvas förblir viewport-stor för perf. Periodisk `scrollHeight`-remätning för dynamiskt content.

## 3.44.3 — 2026-06-01
**Fix: Undertow view-container bakgrund borttagen.** `rgba(255,255,255,0.38)` på `#view-*`-containrarna syntes som en vit rektangel på desktop (ingen scroll = ingen naturlig kantavstängning). Korten har `0.78` opacity och ger tillräcklig textläsbarhet utan extra backing.

## 3.44.2 — 2026-06-01
**Fix P1 (ny väg): stale draft spökar work sets in i ny cykel.** Rotorsak: `doNewCycle()` rensade inte `state.drafts` → en gammal draft för session C (skapad när `lastSessionSetCount` var 0) överlevde in i ny cykel med bara 1 work set. `ensureExtraSets` såg `length > 0` och anropade aldrig `getDefaultSets` → Zercher fick 1 work set istället för 2. Användaren såg ett set "försvinna" direkt (det saknades redan från start). Tvåstegs-fix: (1) `doNewCycle` rensar `state.drafts = {}` + `state.draft = null` (säkert — körs bara när alla sessions är klara); (2) `ensureExtraSets` lägger till saknade work sets när stale draft har färre än `lastSessionSetCount` + ingen loggning påbörjad + ej sparad.

## 3.44.1 — 2026-06-01
**Undertow live-feedback.** Waterline borttagen (for subtilt, syns knappt). Blå KG-ruta fix: `selFg` för Undertow sätts till `#eaf2fb` (ljus text på navy) istället för `var(--white)=#102430` (svart-på-svart). Blur-artefakter: `backdrop-filter:blur(6px)` borttagen från pass-card + ex-block (Android renderar text sämre med blur); bakgrund höjd `0.52→0.78` opacity för frostat utseende utan blur. Semi-opak backing `rgba(255,255,255,0.38)` på view-containers så section-labels är läsbara mot kaustiket.

## 3.44.0 — 2026-06-01
**NYTT TEMA: Undertow** — Cold water light theme. Du är upphängd mitt i vattnet, sjunker, tittar upp mot en ljus yta du inte kan nå. Cool vit-blå gradient mot djupnavy, frostglas-kort, kaustiksljus och bubbelexplosioner. Tre bakgrundslager: CausticLayer (statisk SVG med feTurbulence fractal-noise + ljusschakt, mix-blend-mode:screen), Waterline (CSS 44s krypanimation), BubbleField (canvas gaspar: 2–4 pulsar bursts → stilla vatten 2.6–5.2s). Fonte: Archivo (display) + DM Mono (teknisk). Abyss navy (#163763) = primärfärg. Bubblor styrs av Settings → Ambient Effects, kaustiket visas alltid. Timed-tagg migrerad från inline-stil till `.ex-tag.timed` CSS-klass med `--tag-timed-*` token i `:root`.

## 3.43.2 — 2026-06-01
**Fix: Arctic sticky header + Edit-knapp synlighet.** Sticky: `body.theme-arctic header` fick `position:relative` via z-index-regel — tog bort `header` från den regeln så base `position:sticky` gäller igen. Edit-knapp: konverterad från inline-stilar + onmouseover/onmouseout till CSS-klass `.btn-chain-edit` med Arctic-override (`color:#1a2e3a`, tydlig blå border).

## 3.43.1 — 2026-06-01
**Fix: AM-pill blob-form efter loggning.** Rotorsak: `valEl.textContent = "99.1 kg"` i ett span utan `white-space:nowrap` — texten bröt på mellanslaget → kvadratisk pill. Fix: siffran och enheten är nu separata flex-barn även i kollapsad visning (som i input-läget). `white-space:nowrap` på `.am-pill-value` som extra skydd.

## 3.43.0 — 2026-06-01
**Timed PR-tracking.** Övningar med Timed-taggen (Dead Hang, plankor m.fl.) spårar nu längsta tid som PR istället för att ignoreras. `getAllPRs` + `buildPRMap` fick ny `secs!=null`-gren: BW timed jämförs på sekunder (extra-vikt som tiebreaker), weighted timed jämförs på sekunder (vikt som tiebreaker). PR-kortet visar `30s` som rubrik + `BW 80kg` som undertext. History-vyn visar nu `30s` istället för `?r` för timed-sets. `saveExercise` sparar `timed:true` på log-entryn.

## 3.42.2 — 2026-05-31
**Fix: refresh loggade ut efter lösenordsbyte.** Rotorsak: `#access_token=...&type=recovery`-hashen låg kvar i URL:en efter lösenordsåterställning. Vid refresh läste Supabase den igen → `PASSWORD_RECOVERY`-event → `inPasswordRecovery=true` → alla auth-events blockerades → `handleSession` anropades aldrig → login-skärm. Fix: `window.history.replaceState` rensar URL-hash direkt när `PASSWORD_RECOVERY` detekteras.

## 3.42.1 — 2026-05-31
**AM pill mer rektangulär.** Padding `5px→3px` vertikalt, `border-radius 12→8px`. Mindre blob, mer avlång form.

## 3.42.0 — 2026-05-31
**Session time.** Start vid första LOG (`state.draft.sessionStartTime`), slut vid Finish (`finishTs`). Sparas som `duration` (ms) i `cycle.done[passId]` och `state.log`-entry. Ny `formatDuration(ms)` → `"48m"` / `"1h 12m"`. Visas i done-badge (`Done · 31 May · 48 min`) och i copy-to-clipboard (`⏱ 48m` efter klocktids-raden). Historiska sessioner utan duration visar ingenting — bakåtkompatibelt.

## 3.41.0 — 2026-05-31
**Gym-feedback-paket #2 (4 punkter).**
- **BW pill storlek**: `font-size:.55→.7rem`, padding `3px 9px→5px 13px`, input-width `44→56px`, LOG-knapp `font-size:.46→.6rem`. Mer läsbar på mobil.
- **Notes auto-save vid blur**: `autoSaveNote()` sparar till state (utan toast/save()) när textarea tappar fokus. Notes överlever nu övningsbyte utan att "Save Reminder" behöver klickas. Explicit Save-knapp kvar för confirmation + localStorage-commit.
- **Onboarding: rest days borttagna**: Step 4 är nu bara timer-val. `state.restSlots=[]` i `finishOnboarding` — nya användare startar utan vilodagar (kan läggas till via Edit Program). Skip-sökvägen uppdaterad. Preview i step 4 visar ej längre V-rader.
- **Header sticky**: `body.theme-ember header` och `body.theme-nightcity header` hade `position:relative` som bröt sticky-beteendet. Ändrat till `position:sticky;top:0`. `body:not([class*="theme-"])` också fixat. Cosmic Horror var korrekt sedan tidigare (ingen position-override).

## 3.40.1 — 2026-05-31
**Debug-instrumentering för försvinnande set (P1 lever kvar trots 3.39.0).** Live-test 2026-05-31: ett set försvann på en HIT-övning (W2 borta, bara W1+S1 kvar) — alltså en ANNAN väg än positions-buggen Lager A fixade.

- **Auto-fångst:** ny ring-buffer (`thechain_dbglog` i localStorage, max 50 events). `logSet` jämför set-antal före/efter rerender och loggar `SET_VANISHED@logSet` om en rad försvann. `syncFromCloud` jämför draftens set-antal före/efter merge → `SET_VANISHED@sync`. Ingen beteendeändring, skriver bara debug-logg.
- **Debug-knapp (Settings → Debug):** "🐛 Copy draft state" kopierar incidenter + nuvarande draft (extraSets/loggedSets/inputBuffer) till urklipp. "Rensa logg" nollställer. Användaren behöver aldrig öppna konsolen eller racea en knapp — incidenten fångas automatiskt, kopieras i lugn och ro efteråt.
- Syfte: få exakt data på vilken kodväg som tappar set innan nästa fix-försök. Ingen blind tredje gissning.

## 3.40.0 — 2026-05-31
**Lager B av set/övnings-refaktorn — kanoniska övnings-id (exId).** Rotorsaksfix för #3 + #5 + det gamla rename-skräpet.

- **Rotorsak:** historik/PR nycklades på NAMN (splittrades vid rename → tvingade fram en ständigt växande `migrateExerciseNames`-tabell) och notes på SLOT-id (A1, B4… → läckte vid swap). Nu får varje övning ett stabilt kanoniskt `exId` (slug av kanoniskt namn). Historik, PR, notes och set-antal nycklas på exId. Namn blir bara en etikett.
- **#3 — note följer inte övningen vid swap:** löst. Notes nycklas på exId; en swap ändrar slottens resolvade exId → originalets note visas inte på den inswappade övningen, och återkommer vid swap tillbaka.
- **#5 — samma id / data-bleed vid swap:** löst. `doSwap` rensar nu även `extraSets` för slotten så inswappad övning får fräscha defaults istället för att ärva original-övningens set-struktur.
- **Delad identitet:** samma övning i två pass (Cable Flyes A3+E3, Unilateral Cable Row B3+F2, Lat Prayers B4+F4) delar nu historik, PR **och** notes. Tidigare var PR slot-keyat → B4/F4 var separata PR-rader.
- **Notes persisterar:** den gamla ephemeral-modellen (note visades en gång, droppades efter nästa session) är borttagen. Niklas: "oavsett när nästa pass kommer vill jag ha infon kvar." Noten stannar på övningen tills du ändrar/rensar den; en kopia fryses i log-raden för historik.
- **Swap ärver rätt historik:** swappa t.ex. Flat DB → Flat BB och passet visar din riktiga Flat BB-historik/PR (samma exId).
- **Migration:** schema v1→v2 resolvar exId på all logg/cykel-historik + remappar slot-keyade notes/tombstones → exId. Idempotent. PM4-snapshot (`state_before_exId_*`) tas före. `migrateExerciseNames`-eran kan pensioneras framåt.
- **Bibliotek:** "Cable Rotator Cuff" tillagd i EXERCISE_LIBRARY (D4 saknade biblioteksmatch). Kanoniska val (Niklas 2026-05-30): D1 Military Press=barbell, F3 Shrugs=DB, F1 Pull-ups=pronated; Internal/External Rotator Cuff förblir separata övningar.
- **Test:** ny `src/exercise-identity.js` + `tests/exercise-identity.test.js` (18 tester). Totalt 57 gröna.

## 3.39.0 — 2026-05-30
**Lager A av set/övnings-refaktorn — stabila set-id.** Rotorsaksfix för två live-test-buggar.

- **P1 — Set 1 försvinner vid loggning (KRITISK, äntligen löst):** rotorsaken var att varje set identifierades av sin array-POSITION (`origIdx`). När `ensureExtraSets` filtrerade bort warmups på en ramp-övning mitt i Log-flödet reindexerades arrayen → positionen från DOM matchade inte längre buffern → Set 1 läste fel cell och såg ut att försvinna. Nu har varje set ett stabilt `sid`; `inputBuffer`/`loggedSets`/DOM-id nycklas på sid och överlever filtrering och omordning.
- **#4 — Warmup/work-ordning spretade mellan skärm och copy:** renderingen sorterade warmups-först men `buildCopyLines` läste lagrings-ordning rått → copy kunde skriva S1 före W1. Nu driver EN delad `sortSetsForDisplay` både skärm och copy; sets sparas dessutom i display-ordning vid `saveExercise`.
- **#6 — Copy-etiketter:** "Cock's Crow" → "First Light", "Two O'Clock" → "Post Refeed", "Drive Time" → "Commuter Hours".
- **Test:** ny `src/set-model.js` + `tests/set-model.test.js` (16 tester inkl. explicit P1-regressionstest). Totalt 39 gröna. Idempotent draft-migration (positionell → sid) vid load remappar buffer/loggedSets utan dataförlust.

> Lager B (övnings-id + brygga för #3 + #5 + rename-skräpet) kommer separat.

## 3.38.0 — 2026-05-29
**Gym-feedback paket: copy-format, RAMP-hint, Decline Cable Press, notes-tombstones.**

**Copy-format (P3):** Finish-card + history-copy får klockslag + auto-genererad session-label + hashtags. Klockslag på egen rad under datum (`🕒 19:56 — Prime Time`). Label slumpas från 7 alternativ per tidsspann (Morning Session / High Noon / Afternoon Delight / Crowd Work / Prime Time / Evening Session / Night Owl + 6 syskon per spann inkl. gaming-references). 49 strängar totalt. Hashtags `#thechain` `#gymlife` läggs sist. Warmups (W1, W2) behålls — Niklas testade Instagram-paste, ville inte droppa dem. `finishSession` sparar nu `timestamp` i `cycle.done[passId]` (förut bara i `state.log`). Två copy-funktioner avduplicerade via ny `buildCopyLines()` + `writeClipboard()`.

**RAMP-hint (P5):** `TAG_HINTS.ramp` ändrad från `'Ramping → 1 set failure'` (fel — det är inte ETT set utan stegvis ökning) till `'Increase weight each set'` (kort version av picker-texten på rad 7278).

**Decline Cable Press (P2):** Tillagd i `EXERCISE_LIBRARY` mellan `Decline Cable Flyes` och `Decline DB Press`. Decline Smith Press + Decline DB Press fanns redan.

**Notes-tombstones (P4):** `finishSession` skrev `delete state.exerciseNotes[ex.id]` + `delete state.lastSessionNotes[ex.id]` UTAN tombstone — cloud-merge i `syncFromCloud` kunde resurrecta noten från en annan device eller äldre cloud-state. Niklas såg detta som "Chins-noten överlevde 3 cykler" trots att `finishSession`-cleanup ser korrekt ut vid läsning. Fix: skriv `state.deletions.exerciseNotes[ex.id]=Date.now()` vid båda auto-deletes (samma mönster som `saveNote` redan använde för manuell radering). Plus `mergeKeyedMap(_local.lastSessionNotes, state.lastSessionNotes, state.deletions.exerciseNotes)` — `lastSessionNotes` mergades förut utan tombstone-check (rad 5396), samma deletion-set används för båda eftersom samma id.

## 3.37.0 — 2026-05-25
**PM17 + PM13: Synk-status som förklarar sig + keep-alive mot Supabase.**

**PM17 — Sync-dot är inte längre opaq:** Sync Status-kortet i Settings hade bara read/write-tider. Nu visas överst en hälso-rad (`✓ All changes synced` grön / `⚠ <felmeddelande>` röd från `_lastSyncError`) plus en lugnande data-säkerhets-rad: "Your data is saved on this device first. Sync errors never lose data — pushes retry automatically...". Felmeddelandet escapas (escapeHTML). Headerns sync-area navigerar redan hit vid tap (mobil-vänligt). Desktop-`title`-tooltipen på pricken fanns redan sedan tidigare.

**PM13 — Supabase keep-alive:** Ny `.github/workflows/keep-supabase-alive.yml`. GitHub Actions-cron pingar `app_state` REST-endpoint dagligen (06:00 UTC) så free-tier-projektet inte pausas efter 7 dagars inaktivitet. Anon-nyckeln i workflowen är samma publika nyckel som redan ligger i index.html (skyddad av RLS). `workflow_dispatch` för manuell test. Caveat: GitHub stänger av schemalagda workflows efter 60 dagar utan commits — inget problem vid normal aktivitet.

---

## 3.36.1 — 2026-05-24
**Obsidian + Cosmic Horror Log-knappar: clip-path inheritance fix.**

Niklas-observation: Obsidian och Cosmic Horror Log-knappar visade Iron's hexagon-form istället för sin egen unika form (Obsidian rectangle med gold gradient, Cosmic blob).

**Rotorsak:** Default `.set-log-btn{clip-path:polygon(hexagon)}` ärvdes av Obsidian/Cosmic, vilkas tema-blocks endast överrider `background`/`border-radius` men inte `clip-path`. Clip-path vinner visuellt → bara hexagon syns. Latent bug sedan 3.34.1 (themed Log-knappar) men inte uppmärksammat förrän nu.

**Fix:** Lade till `clip-path:none` på `body.theme-obsidian .set-log-btn` + `body.theme-cosmic-horror .set-log-btn`.

---

## 3.36.0 — 2026-05-24
**RE-APPLY: P8/P1/P6/P3/P2/P5/P9 + ny P7 hollow done-state.**

Efter TDZ-buggen i 3.35.7 var alla mina 6 commits (3.35.0-3.35.6) reverted. Nu re-applicerade när root cause är fixad i 3.35.12. Plus omarbetad P7 enligt Niklas-feedback.

**P8 — Multi-draft (state reset vid pass-byte):** Identisk implementation som 3.35.0. `ensureDraft` använder `state.drafts[passId]`-slots. `finishSession` rensar slot. `syncFromCloud` preserverar lokala drafts (SL6). `pushState` exkluderar drafts från payload. `undoSession` skriver till rätt slot.

**P1 — Övningsnamn-typografi:** `.ex-name` `.82rem → .95rem` + letter-spacing. Matchar `.ex-collapsed-name`.

**P6 — Historik upp:** `.ex-prev` + `.ex-prev-history-set` `.48rem → .65rem`, ljusare färger.

**P3 — Chain-strip distant:** opacity `.82 → .92`, bg `red-mix 16% → 26%`. Per tema bumpar (Arctic, Void, Obsidian, Cosmic Horror).

**P2 — Input borders starkare:** Iron `#3a1a1a → #5a2828`. Cosmic Horror `0.14 → 0.34`. Arctic `0.22 → 0.45`. Obsidian `#2a2010 → #4a3818`. Void `#1a1a1a → #3a3a3a`.

**P5 — Tag-hint separerad:** `TAG_HINTS`-map + `getExerciseDescriptionLine` + `getExerciseTip`. Ny `.ex-tip` CSS. Rendering visar tag-driven rad 1 + övning-tip rad 2.

**P9 — Kollapsbar PR:** Default `state.prCollapsed = true`. Section-sub klickbar med chevron.

**P7 (ny implementation, hollow) — Done-state är "ihålig" version av temats Log-form:**
- Iron: hexagon outline via `box-shadow:inset 0 0 0 1px rgba(192,57,43,0.55)`, transparent bg
- Nanosuit: octagonal outline cyan
- Night City: parallelogram outline yellow
- Ember: rectangle outline orange
- Void: pill outline white
- Arctic: frosted pill outline cyan (subtle bg + backdrop-filter)
- Daylight: pill outline red
- Crusader: rectangle outline red
- Obsidian: rectangle outline gold + subtle glow
- Cosmic Horror: asymmetric blob outline teal

Behåller temats unika form (clip-path eller border-radius). Transparent bg + accent-color konturlinje. ✓-färg matchar temat.

**Behåller från 3.35.x-diagnostik:** TDZ-fix i `newCycle()`, 8s failsafe i `handleSession`, 10s failsafe på login-knappen, console.logs i hela auth-flödet, version-label på auth-screen, 3s timeout på `profiles`-fetch.

---

## 3.35.12 — 2026-05-24
**ROOT CAUSE LÖST: TDZ-bug i `newCycle()` → `getEffectiveChain()`.**

**Bug:** `newCycle()` på rad ~5094 anropar `getEffectiveChain()` som läser `state.sessionOrder`. Men `newCycle()` kallas INNE i `freshState()` som returnerar `{cycles:[newCycle()], ...}`. Och `freshState()` körs i RHS av `let state = freshState()`. Vid det laget är `state` i TDZ → `ReferenceError: Cannot access 'state' before initialization`.

**Varför funkade det i morse:** Niklas's localStorage var giltig → `JSON.parse(raw)` lyckades → `state = freshState()`-fallbacken i catch-blocket triggades aldrig. Bugen var latent.

**Vad triggade idag:** Något fick `JSON.parse` att fail (eller localStorage var tom) → catch-block kör `state = freshState()` → newCycle → getEffectiveChain → state TDZ → kraschar. Felmeddelandet i handleSession's catch konsumerade error utan att visa, så Niklas såg "Logging in..." för evigt.

**Fix:** Defensiv `try/catch` runt `getEffectiveChain()` i `newCycle()`. Vid init-tid (state TDZ): skapa tom `done:{}`, fylls lazy vid första render. Annars (state defined): fylls direkt som tidigare.

**Trace från Niklas's console:**
```
[auth] handleSession threw: ReferenceError: Cannot access 'state' before initialization
    at getEffectiveChain (4893:14)
    at newCycle (5096:3)
    at freshState (4539:13)
    at loadStateForUser (4451:15)
    at async handleSession (4363:5)
```

---

## 3.35.8–3.35.11 — 2026-05-24
**Login-diagnostik (kondenserat).** Fyra stegvisa insatser för att isolera login-hänget efter 3.35.7-reverten: 3s timeout på profiles-fetch, version synlig på auth-screen, 8s hard failsafe i handleSession, 10s failsafe på login-knappens click + console-trace genom hela auth-flödet. Root cause löst i 3.35.12.

---

## 3.35.7 — 2026-05-24
**REVERT — backat 3.35.0 → 3.35.6 (login-bug).**

Mobil-login hängde på "Logging in…" efter 3.35.6-deploy. Syntaxen var ren men något kraschade runtime mellan `buildCurrentUser` och `showAppShell` (sannolikt i `loadStateForUser` eller direkt efter). Utan DevTools-access på mobil gick det inte att diagnosa snabbt.

**Åtgärd:** Återställde `index.html` och `CHANGELOG.md` till tillståndet vid commit `1a24021` (3.34.11). Bumpade version till **3.35.7** så Service Worker hämtar färsk version och tömmer cache. Original-commits (`0e24c94` → `7a52339`) finns kvar i git-historiken för framtida diagnos och re-apply.

**Åter-implementeras inkrementellt** efter root-cause-analys: en punkt per version, testad i isolation. Sannolik misstänkt: P5 (TAG_HINTS/getExerciseTip) eller P8 (multi-draft + ensureStateDefaults migration).

---

## 3.34.11 — 2026-05-23
**Komplett tag design-tokenization (PM22-style steg 2).**

Niklas: "kör allt i ett svep. Som vi brukade säga i norrland — ingen minns en fegis!"

**Strategi:** Lägga till 15 design-tokens för tag-färger i `:root`. Default = Iron-värden. Teman över-rider bara variablerna de avviker från, inte hela selektor-rules.

**Tokens i `:root` (15 st):**
- `--tag-base-{bg/border/color}` — när ingen variant matchar
- `--tag-ramp-{bg/border/color}`
- `--tag-bw-{bg/border/color}`
- `--tag-uni-{bg/border/color}`
- `--tag-singles-{bg/border/color}`

**Component rules uppdaterade** att använda `var(--tag-X-Y)` istället för hardcoded hex.

**Per-tema tokenization:**
- **Daylight, Arctic, Crusader, Nanosuit** — full color-tokenization (deleted 3-4 rader per tema, ersatt med token-overrides i `body.theme-X{}`)
- **Void** — tokeniserade ALLA varianter till neutral gray (alltid var meningen — Void vill att alla tags ser likadana ut). Bugfix bonus.
- **Obsidian** — full token-set inkl. `--tag-base-*` (eftersom Obsidian överrider base-tag-styling)
- **Cosmic Horror** — full token-set + behållit asymmetric `border-radius` rules (token-systemet hanterar inte shape)
- **Ember** — tokenized inkl. gradient bgs (variabler tillåter gradient values!). Behållit text-shadow per variant.
- **Night City** — tokenized inkl. neon gradient bgs. Behållit text-shadow + clip-path.

**Tekniska detaljer:**
- CSS-variabler hanterar **alla värden** inkl. gradients, rgba, transparent. Inga begränsningar.
- Theme-specifika non-color properties (typography, text-shadow, clip-path, border-radius) behöll sina egna rules.
- **Visuellt resultat: 100% identiska teman.** Pure rename — samma färger, bara annan kodstruktur.

**Net effect:**
- ~30-50% mindre kod per tema-block för tag-styling
- Nya teman behöver bara override:a tag-tokens (inte skriva 4-5 separata `.ex-tag.{variant}` rules)
- Konsistent vokabulär — alla teman talar samma "tag-token-språk"

---

## 3.34.10 — 2026-05-23
**PM22 completion: default-CSS semantic vars + theme override-cleanup.**

PM22 (3.32.0) etablerade 8 semantic CSS-variabler men lämnade existerande per-fall theme-overrides oroade. Den här versionen completar refaktorn genom att:

**Default-CSS uppdaterad till semantic vars (5 selectors):**
- `.pass-card`: hardcoded `border:#2c2c2c` → `var(--border-subtle)` + ny `background:var(--surface-base)`. (Iron pass-card nu subtilt ljusare än body — visuell förbättring.)
- `.weight-banner`: hardcoded `border-bottom:#1a1a1a` → `var(--border-subtle)`. Bg redan semantic.
- `.stat-box`: hardcoded `border:#2c2c2c` → `var(--border-subtle)` + ny `background:var(--surface-base)`.
- `.pr-card`: samma som stat-box.
- `.hist-entry`: hardcoded `border:#2a2a2a` → `var(--border-subtle)` + ny `background:var(--surface-base)`.

**Theme override-cleanup (där default semantic var nu räcker):**
- **Daylight:** rensade redundant `background:#ffffff` på `.pass-card`, `.weight-banner`, `.weight-input`, `.stat-box`, `.pr-card`, `.hist-entry`, `.app-modal-card`. Tog bort `.ex-block.saved` override (matchade `--surface-saved` exakt). ~12 rader rensade.
- **Arctic:** rensade `.pass-card` bg + border, `.ex-block.saved`, `.ex-block.collapsed.saved .ex-collapsed-summary`. ~5 rader.
- **Crusader:** rensade `.stat-box`/`.pr-card`/`.hist-entry` background (matchade `--surface-base`), behöll `--border-strong` overrides (heavier warrior-feel). ~3 simplifications.
- **Mörka teman (Iron/Nanosuit/Night City/Ember/Void/Obsidian/Cosmic Horror):** ingen rensning behövdes — deras stat-box/pr-card/hist-entry har INTENTIONAL custom gradients/backgrounds som inte är redundanta med `--surface-base`.

**Inte så dramatisk reduktion som initialt hypat** (~25-40 rader totalt) — många "redundant looking" rules visade sig vara intentional aesthetic overrides (Arctic uses 0.65 alpha vs base 0.55 etc).

**Konsekvens framåt:**
- Nya komponenter ärver default semantic vars som SOM TIDIGARE — men nu också `.pass-card`, `.weight-banner`, `.stat-box`, `.pr-card`, `.hist-entry`.
- Mindre risk för "svart fönster"-bug på dessa surfaces.
- Daylight + Arctic + Crusader marginellt mindre kod att underhålla.

---

## 3.34.9 — 2026-05-23
**Code review Batch 3: migrations-städning (guards).**

Del 3 av 3-batch städ-runda. Båda one-time migrations körde varje load:

- **`cleanLegacyLocalStorage()` guarded:** Nu med `localStorage.getItem('__legacyCleanDone')`-check. Skippas efter första körningen per device. Tidigare anropade `removeItem` på 4 nycklar varje page-load även för users som aldrig haft dessa nycklar. (Nyttjar localStorage flag, inte state.migrations, eftersom det är device-globalt cleanup som körs INNAN current-user state är laddat.)
- **`migratePassKeysToSession()` guarded:** Nu med `state.migrations.passKeysToSession_v1`-flag. Tidigare kollade `passOrder` in state varje load även för users som aldrig haft den (alla post-3.15.0). Sätter flag efter körning så subsequent loads skippar instant.
- **`migrateExerciseNames()`** är redan guardad via `state.migrations.exerciseSplit_v2` (etablerad 3.17.x). Inget byte.

**Konsekvens:** Snabbare load för existerande users (sparar 2-3 funktion-anrop + property-lookups per session-start). Migrations-pipeline är konsekvent guardad nu.

**Skippat (M1):** Migrering INTO `SCHEMA_MIGRATIONS`-pipelinen (kräver schema-version-shift, mer risk än värde just nu). Ad-hoc migrations + schema-pipeline lever parallellt — bägge guardade, fungerar.

---

## 3.34.8 — 2026-05-23
**Code review Batch 2: state-init konsolidering.**

Del 2 av 3-batch städ-runda. State-init var fragmenterat över 4 platser:
- `let state={...}` inline (var rad 4882) — 26 fält
- `freshState()` (rad 4518) — 28 fält
- `ensureStateDefaults()` (rad 4452) — 30+ fält (definitiv)
- `resetAll()` inline (rad 8716) — **11 fält** (bug — tappade theme/customExercises/etc)

**Refactor:**
- **`freshState()` är nu single source of truth** med ALLA fält listade (added: `importedPRs, exerciseOrder, ignoredPRs, lastSessionSetCount, lastSessionNotes, migrations`). Comment-block ovan funktionen förklarar roll-uppdelningen.
- **Inline `let state={...}`** ersatt med `let state = freshState()`. Borttagen post-init `state.cycles=[newCycle()]` (freshState gör det redan).
- **`resetAll()`** använder nu `{ ...freshState(), ...preserved }` istället för minimal inline-init. Preservar `sessionOrder/restSlots/unit/theme` explicit. **Bug fix:** användarens valda tema försvann tidigare vid reset.
- **`SCHEMA_VERSION` + `SCHEMA_MIGRATIONS` flyttade upp** till före `let state` (var rad 5016, nu rad ~4880). Krävdes för att `freshState()` ska kunna anropas vid script-load utan TDZ-fel. `runSchemaMigrations()` funktion ligger kvar där den var.
- `ensureStateDefaults()` rör vi INTE — den är backup-net för gamla loaded users som saknar nyare fält.

**Konsekvens:** Vid framtida nya state-fält behöver bara `freshState()` + `ensureStateDefaults()` uppdateras (2 platser istället för 4).

---

## 3.34.7 — 2026-05-23
**Code review Batch 1: dead code removal.**

Del 1 av 3-batch städ-runda från full code review.

- **`safeHTML()` borttagen** (var rad 5068-5084, 17 rader): PM9-prep från tidigare som ALDRIG anropades. Template-tagg som skulle auto-escape interpolation. Aldrig adopterad i koden.
- **`getWeightStep()` borttagen** (var rad 7398-7404, 7 rader): Tunn wrapper runt `parseFloat(state.weightStep) || 2.5`. Aldrig anropad.
- **Orphan TODO-kommentar borttagen**: "Tap-and-hold eventually supported via press timer" — feature som aldrig byggdes. Inte i backlog.

Net: −24 rader.

---

## 3.34.6 — 2026-05-23
**Notes → Reminders: tydligare ephemeral semantik (1+2).**

Niklas: "Min initiala tanke var ju att ha notes inför nästa övning av samma slag." Systemet var redan ephemeral (single-use carry-forward via `finishSession()` rad 7466 — flyttar exerciseNotes → lastSessionNotes, dropp:ar nästa session om inte refreshad), men UI:t signalerade det inte tillräckligt.

**1. Tydligare visuell signal på reminder från förra sessionen:**
- Ny CSS-klass `.ex-note-banner.reminder-prev` — amber-orange `#e89a40` (var gold `#c8a84a`), dashed border-left istället av solid, italic text. Distinct från en just sparad note.
- **Dagar-räkning:** "Reminder från 3d sen: ..." istället för bara "From last session:". Använder `lastSession.timestamp` (redan tillgänglig i samma scope). 0d = "idag", 1d = "1d sen", N = "Nd sen".
- **Ikon-byte:** ⏰ för reminder-from-last (förstärker tidsdimensionen), 📝 förblir för just sparad/edited note.
- Tooltip uppdaterad: "Tap to edit (försvinner efter denna session om inte refreshad)".

**2. Namnändring — "note" → "reminder" där det matchar semantiken:**
- Add-button: "+ note" → "+ Reminder for next time"
- Textarea placeholder: "Note for next time..." → "Reminder for next time (e.g. 'för lätt vikt, gå upp')..."
- Save-button: "Save Note" → "Save Reminder"
- Toast-text: "Note saved" → "Reminder saved" (likadant för cleared)
- Tooltip på existing note: "Tap to edit" → "Tap to edit reminder"

**3. saveNote() DOM-update fix:**
- Tidigare: efter clear av note kvar bara borttagen banner — ingen "+ Reminder"-knapp dök upp utan full rerender. Nu renderas add-knappen tillbaka direkt så användaren kan skapa ny reminder utan att vänta.
- Också: rensar både `.ex-note-banner` OCH `.ex-note-add` innan ny element, så ingen dubbel-rendering vid edge cases.

**Modellen oförändrad** — notes är fortfarande ephemeral via finishSession-logiken. Bara UI:t talar nu tydligt om vad som händer.

---

## 3.34.5 — 2026-05-23
**Städning: borttaget oanvänd `toggleHistory()` + `_showHistory`-state.**

Niklas: "Inte en fan av att 'history' ligger kvar i koden. Blir mycket skräp tids nog om flera features jag inte vill ha kvar ligger kvar där." Tagit bort:
- `const _showHistory = {}` (modul-state, oanvänd efter 3.34.4)
- `function toggleHistory(exId)` (toggle-funktion, oanvänd efter 3.34.4)

Etablerar princip: rensa dead code direkt i samma version som ersätter funktionen — inte vänta till "senare".

---

## 3.34.4 — 2026-05-23
**Iron Log avlång hexagon + History alltid expanderad.**

Niklas test-feedback från 3.34.3:

- **Iron Log:** Var fortfarande "för skrikande röd". Total redesign:
  - **Avlång hexagon** via `clip-path:polygon(7px 0, calc(100% - 7px) 0, 100% 50%, calc(100% - 7px) 100%, 7px 100%, 0 50%)` — samma vokabulär som chain-tab session-swipen, mindre skala.
  - **MYCKET mörkare:** gradient `#180404 → #0a0202` (nästan svart med svag rödbrun hint).
  - **Färre kontrast-element:** ingen border, ingen text-shadow, ingen box-shadow.
  - **Text dim:** `#7a2820` (dunkel blodröd) istället för `#d4a098`. Hover lyser till `#a03828`, has-value `#c0392b`.
  - Knappen "ligger låg" i Iron's dunkla estetik nu istället för att skrika.
- **History:** Borttagen toggle-mekanik (`▾ History (N)` + click-to-expand). Alltid expanderad direkt under "Last"-raden:
  ```
  Last (2d ago):
  W1: 40kg ×8r
  W2: 45kg ×6r
  S1: 50kg ×5r +1f
  ```
  - Tog bort `_showHistory` state + `toggleHistory()` helper (deklarerad men oanvänd nu — kan rensas senare).
  - Font size matchad till `.ex-prev` (`.48rem` istället för `.55rem`), färger toned down för att smälta in (grays #555-#888 istället för accent-färger).
  - Endast 1 set → fallback till inline "Last (today): 42s" (singles/timed har inget värde av list-format).

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
