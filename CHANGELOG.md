# Changelog

Spårbar versionslogg för The Chain. Nyaste överst. Datum från git-historik.

Format: `MAJOR.MINOR.PATCH` — patch = bugfix/små tillägg, minor = ny feature, major = stora omtag.

---

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
