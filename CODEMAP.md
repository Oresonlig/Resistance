# Code Map — index.html

`index.html` är single-file: inline CSS + JS, **11 518 rader** (verifierat 2026-07-25, efter kodgranskningen 3.80.0). CSS 20–3703, body-markup 3719–3848, huvud-JS 3849–11502. Radnummer driver FORT i denna fil — använd Grep om de inte stämmer, lita inte blint på siffrorna.

## Var saker bor

### State & defaults
- `~4099` — `ensureStateDefaults()` (init `drafts{}`, `prCollapsed`)
- `~4193` — `isFreshState(s)`
- `~4214` — `freshState()` — single source of truth. `appVersion:APP_VERSION`
- `~4615` — `const APP_VERSION` — **ENDA stället att bumpa version**
- `~4883` — `const SCHEMA_VERSION` + `SCHEMA_MIGRATIONS`-pipeline
- `~4587` — `getEffectiveChain()` — cachad chain med order + adds/removes
- `~4601` — `invalidateChainCache()`
- **`freshState()` och `ensureStateDefaults()` måste hållas i synk** — 3.80.0 hittade `deletions.log` (3.77.1) bara i den ena. Nytt state-fält = lägg till på BÅDA ställena, annars beror defaulten på vilken load-väg som kördes.

### Chain & rendering
- `~4869` — `newCycle()` — **TDZ-fälla:** anropas inuti `freshState()`, läser `state` via `getEffectiveChain()`. Vid `let state = freshState()` är `state` i TDZ → ReferenceError. Defensiv try/catch sedan 3.35.12. RÖR INTE utan att förstå detta.
- `~4892` — `ensureDraft(passId)` — multi-draft: `state.drafts[passId]`-slots, inte enda `state.draft`
- `~8030` — `ensureExtraSets(exId, passId)` — **3.59.0 ROTFIX:** ren `reconcileSets` (`src/set-reconcile.js`, speglad i index.html) = EN symmetrisk regel som paddar BÅDE warmup OCH work mot `getSetTargets(ex)` (self-healing mot försvinnande set), bevarar loggade set, ramp strippar warmups, `setEdited`/`saved` låser formen. Instrument: `SET_RESTORED@reconcile` loggas vid pad av befintlig draft → copy-draft `incidents[]`. `getSetTargets(ex)` = single source of truth för warmup/work-antal (delas med `getDefaultSets`).
- `~7893` — `TAG_HINTS`-map + närliggande `getExerciseDescriptionLine`/`getExerciseTip`: tag-driven rad 1 + övnings-tip rad 2 (`tip`-fält på `EXERCISE_LIBRARY`-posten, resolvas via kanoniskt namn → följer med vid swap, se 3.57.0)
- `~8742` — `togglePRCollapse()` + PR-render: kollapsbar PR-sektion, `state.prCollapsed` default true
- `~5886` — `buildAddExRow(passId)` — "Add exercise"-knapp + dropdown (använder `groupExercisesByCategory()`)
- `~5917` — `buildPassBodyHTML(pass,cycle,nextId)` — session-body HTML
- `~6264` — **`renderChain()`** — CHAIN-fliken: intro/progress-bar + chain-strip (session-tabs) + exercise-area. **OBS: chain-strippen renderas HÄR, INTE i `renderData()`** (som är Settings-hubben — lätt att blanda ihop namnen).
- `~8554` — `selectSession(passId)` — byter aktiv session. **Byter `chain-ex-area.innerHTML` direkt** → måste (som renderChain/rerenderSession) köra `captureAllDraftInputs()` först, annars tappas otippade set-inputs (fixat 3.80.0).
- **`buildReorderUI` FINNS INTE** (raderad 3.80.0) — den gamla Edit Chain-panelen (`#reorder-panel`) var oåtkomlig dödkod sedan den ersattes av `showEditSort` + `showEditAddRemove`, och dess rest-dag-knapp anropade en `toggleRestSlot()` som aldrig existerat. Återinför den inte; rest-dagar hanteras av `addRestSlot`/`removeRestSlot` i `showEditAddRemove`.
- `~6993` — `showEditExercises(passId)`
- `~7258` — `buildTagEditorHTML(ex, passId)` — tags-editor
- `~7438` — `saveExercise(passId, exId)` — measure-driven capture av alla set → `savedExercises`
- `~10376` — **`renderData()`** — Settings-HUBBEN (Training/Appearance/Data & Sync/Help/Support/Admin), INTE chain-strippen (se ovan)

### EXERCISE_LIBRARY & helpers
- `~4398` — `EXERCISE_LIBRARY` array
- `~5875` — `groupExercisesByCategory()` — cachad gruppering, används av buildAddExRow + swap-dropdown + edit-vyn. `_groupedExCache` nollställs vid custom exercise-ändring.

### Extras (3.54.0 — full parity med ordinarie övningar)
- Stabila id: `extra_<passId>_<sid>` sätts i `confirmAddEx`. Legacy index-id migreras i `ensureStateDefaults`. INGEN re-indexering vid remove.
- `~4707` — `makeExtraEx(entry)`, `~4714` `extraExId(name)`, `~4719` `getRenderExId(slotId)`. Speglas i `src/extras-model.js` (testtäckt). Vid ändring: uppdatera båda.
- `buildExtraBlock` FINNS INTE längre (pensionerad 3.54.0) — extras renderas som syntetiska ex-objekt genom samma loop som ordinarie i `buildPassBodyHTML` (`allExs`). Branch på `ex.extra` styr bara action-knapparna (Skip/Edit▾[Tags/+Program/Remove], ingen swap).
- PR/historik/notes nycklas på kanoniskt exId (namn-slug) — extras delar identitet med samma övning i program.

### Mätsätt / measure (3.56.0 — input-form + PR separerat från set-schema)
- **12 mätsätt** i `MEASURES`-registry (nära `getRenderExId` — grep `const MEASURES`): `weight/bw/bwreps/timed/bwtimed/cardio/cardiosprint/run/runsprint/carry/inclinecardio/sauna` (`run`/`runsprint` 3.84.0, `bwtimed` 3.87.1 — uppdatera denna lista + `src/measures.js` om fler läggs till). `getMeasure(exId, ex)` strax under.
- **`bwtimed`** (3.87.1) = extra vikt + tid, för Dead Hang med bälte. `measureFromFlags` testar `bw && timed` FÖRE enbart `timed` — annars vinner `timed` och vikten faller bort (så var det t.o.m. 3.87.0). PR = längst tid; `prTiebreak` för `pr:'secs'` ger weight+extra, alltså vinner mer vikt vid lika tid — den logiken fanns redan, ingen ny PR-kod behövdes.
- **`minInput:true`** (3.80.0) på cardio/inclinecardio/sauna = tiden matas in OCH visas i MINUTER (lagras alltid som `secs`). Skiljer dem från `timed`/`cardiosprint` som är råa sekunder. Läses av `formatSetLine`.
- `getMeasure`: override(`state.exerciseMeasureOverride[exId]`) > library-default (`libraryMeasureMap`, byggd från `EXERCISE_LIBRARY[].measure`) > custom.measure > ex.measure > **namn-fallback** (template I–N slots saknar BASE_SLOT_DEFAULT_NAME → exId-lookup missar) > flaggor > `weight`.
- Override nyckel = **kanoniskt exId** (följer rörelsen, per användare). (`getSprintBase`/`setSprintBase` RADERADE 3.78.7 — cardiosprint visar tid + km + antal samtidigt, ingen toggle.)
- Render: `measureCells(measure, sprintBase, ...)` bygger fält-cellerna; grid-kolumner via `.set-row.m-${measure}`-klass. `isBW`/`isTimed` härleds FRÅN measure.
- Capture/save/PR/copy/historik alla measure-drivna. `formatSetLine` + `prValue`/`prTiebreak` är shape-medvetna (läser settets egen form, ej nuvarande measure). Saved EXERCISE bär `measure` (`saveExercise` → `savedExercises[exId].measure`), inte det enskilda settet.
- `formatSetLine(set, u, measure)` (`~8364`) — tredje argumentet är VALFRITT och bryter INTE shape-principen: det används bara för att lösa upp `secs`-tvetydigheten (rå tid vs minut-cardio vars andra fält är tomt). Saknas det gäller gamla beteendet. Call-sites: historik i `buildPassBodyHTML` (via `getLastSession().measure`), `renderProgress`, `buildCopyLines`. Testat i `tests/format-set-line.test.js`.
- Set-schema: `getTagDefaults(ex, measure)` — ramp/uni/singles = tag-styrt; annars `MEASURE_SET_DEFAULTS[measure]` (cardio=1 set, ej HIT).
- UI: tag-editor har measure single-select (`setExerciseMeasure`). Ingen sprintBase-toggle längre (3.78.7).

### Synk-lagret (3.62.0 läs-före-skriv+CAS, 3.64.0 server-enforced CAS)
- **Två invarianter sedan 3.62.0 — bryt dem ALDRIG:** (1) `_cloudSeenThisSession`-gate: ingen skrivning mot molnet (pushState/keepalive) förrän en lyckad molnläsning skett denna session. (2) CAS: alla skrivningar villkoras på senast sedda `updated_at` (`state.lastSyncedCloudISO`); konflikt → pull+merge → retry en gång. Blind upsert (`sbUpsert`) FINNS INTE längre — återinför den inte.
- **Sedan 3.64.0: CAS är server-enforced, inte bara klient-konvention.** Direkt `INSERT`/`UPDATE` på `app_state` är indraget för rollen `authenticated` (Supabase Dashboard, se `SYNC_CAS_SERVER_SPEC.md`) — all skrivning MÅSTE gå genom Postgres-funktionen `write_app_state_cas(p_expected_updated_at, p_data)`. En gammal pre-3.64.0-klient som försöker en rå PATCH/POST får `403`.
- `~5328` — `mergeLogEntries`, `mergeWeightEntries`, `mergeArrayById`, `mergeKeyedMap`, `mergeArrayUnion`, `mergeMapOfArrays`, `mergeMapOfArrayById`
- `~5404` — `syncFromCloud(userId)` — koalescerad (`_syncPromise` delas; parallella anrop AWAITAR pågående pull, no-op:ar inte). Preserverar lokala `state.drafts`. Sätter gate + `lastSyncedCloudISO` i alla branches; tom molnrad rensar ISO (→ insert-väg).
- `~5565` — `sbGet` (12s abort-timeout), `~5585` `sbWriteStateCas(expectedISO, data)` (POST mot `/rest/v1/rpc/write_app_state_cas`, `'conflict'` vid `cas_conflict`-fel eller tomt svar).
- `~5662` — `pushState(opts)` — pull-before-push (alltid awaitad) → gate-check → CAS-skrivning (`sbWriteStateCas`) → konflikt = pull+merge+retry(`_casRetry`). Backoff-retry kör fullt flöde (aldrig skipPull). Drafts exkluderas ur payload.
- `~5729` — `save()` — isFreshState-guard + QuotaExceededError-toast
- `finishSession(passId)` — rensar `state.drafts[passId]`
- `~11411` — `keepaliveCloudPush()` — gate-check + `sbWriteStateCas` via RPC (fire-and-forget; konflikt/403 = tyst no-op, datat kvar i localStorage).
- Forensik: `PUSH_BLOCKED@gate` + `PUSH_CONFLICT@cas` i `_dbgPush`-ringbufferten
- **`autoReloadForNewVersion(cloudVersion)` (3.62.1)** — triggas i `syncFromCloud` när `cloud.appVersion > APP_VERSION`. Säkrar lokal data → toast → `location.reload()` efter 1.5s. **OBS:** `registration.update()`-polling för SW FUNGERAR INTE med query-string-versionering (`./sw.js?v=X`) — försök inte den vägen igen.
- `sw.js`: network-first för navigations-requests (HTML-shell) sedan 3.62.1 — SWR kvar för fonter/CDN/bilder.
- `~4020` — **`loadStateForUser()` (3.62.2)** — returnerande enhet väntar nu på en BUNDEN (5s) `syncFromCloud()`-pull INNAN `handleSession` ritar upp appen, istället för att rendera stale lokal data. `syncFromCloud` avvisar aldrig internt → Promise.race kan bara timeouta, aldrig hänga.

### Modaler & UI-utilities
- `~11187` — `askModalText(title, opts)` returnerar `{text, select}` (INTE en string)
- `~11268` — `askModalConfirm(title, body, opts)`
- `~11491` — Service Worker registration (`navigator.serviceWorker.register('./sw.js?v='+APP_VERSION)`)

### Teman
- `~9020` — `THEMES`-arrayen (tema-registry). **11 aktiva teman** (Full Moon tillkom 3.79.0, flaggat `· WIP`). **Iron är det KLASSLÖSA default-temat** (`class:''`) — `body.theme-iron` matchar ALDRIG något; Iron = base-CSS:en (`body:not([class*="theme-"])`). Vill du styla "endast Iron": styla by default, override:a på `body[class*="theme-"]` för alla andra. Se [[feedback_teman_arkitektur]].
- `~9057` — `applyTheme()` — sätter `document.body.className` + startar/stoppar ambient effects (`setThemeVisual`)
- Temablocken i CSS: Iron `body:not([class*="theme-"])` (~460), Night City (~495), Arctic (~871), Ember, Void, Nanosuit, Undertow, Overgrowth/understory, Obsidian, Cosmic Horror, Full Moon (`body.theme-fullmoon`). Grep `body.theme-X{` för exakt position. **Crusader + Daylight BORTTAGNA ur appen 3.58.14** — inga `body.theme-crusader`/`body.theme-daylight`-block finns längre i index.html (kvar bara i `theme/`-mappen för ev. framtida rework).

### Login-skärmen (`#userScreen`, "basement forge"-design, 3.72.0→3.74.3)
- Markup + CSS runt `~1800-2160` (`.cl-*`-klasser), JS-motor (kedje-SVG, embers, tema-demo) i slutet av filen (`bootChainLogin`, `authThemeFadeSwap` m.fl., sök `AUTH SCREEN THEME DEMO`/`LOGIN CHAIN SYSTEM`).
- Forge-atmosfären (uppstigande glöd/hex/embers) är Iron-only via `body[class*="theme-"]{display:none}`-hide (samma klasslös-Iron-mönster som ovan).
- Mobil-layout (`@media(max-width:940px)`) använder `align-items:flex-start` på `.cl-grid` (INTE `center`) — annars återintroduceras ett "hoppar mellan teman"-fel pga font-metrik-beroende centrering. Se [[feedback_root_cause_before_patching]].

## Arkitektur — viktiga val

- **State är single source of truth.** localStorage är primary store, Supabase är synk-lager.
- **CRDT-light merge:** vid `cloudHasNewerState` mergas icke-blob-fält per id/key. Cloud vinner vid konflikt. Lokala-only id:n bevaras.
- **Multi-draft (3.36.0):** `state.drafts[passId]` är per-pass-slots. `state.draft` = aktiv pekare, sätts av `ensureDraft(passId)`. Drafts är device-lokala — preserveras i sync, exkluderas från cloud-merge.
- **`lastSyncedCloudTime` är server-tid** (från upsert response). Inte klient-tid.
- **`pushState` är pull-before-push.** Säkerställer merge före write.
- **Sync-trigger-points:** visibility-change-hidden (push), -visible (flush+sync), focus (flush+sync), periodic 30s, beforeunload (keepalive-fetch). Mutex via `_syncInFlight`.
- **Rendering är string-interpolation → innerHTML.** XSS-känsligt — `escapeHTML()` används men inte överallt (PM9/PM19 öppen).

## Versionsrutin
1. `const APP_VERSION = 'x.x.x'` (`~4615`) — **ENDA stället**
2. State-init (`appVersion:APP_VERSION`) + header läser konstanten dynamiskt
3. `CHANGELOG.md` entry överst

## Android / Capacitor (3.88.9, START på Play Store-projektet)
- **`index.html` i repo-roten är FORTFARANDE sanningen** — `www/` är en ren
  spegling (gitignored, aldrig redigerad direkt) via `scripts/cap-sync.js`.
  Kör `npm run cap:sync` efter varje `index.html`-ändring som ska in i appen:
  kopierar index.html/sw.js/manifest.webmanifest/icons/ → `www/` → native
  Android-projektet (`npx cap copy android`, körs internt av scriptet).
- `capacitor.config.json` — `appId:'com.oresonlig.thechain'`, `webDir:'www'`.
- `android/` — genererat native-projekt (Capacitor-mall). **RÖR INTE manuellt**
  om det går att undvika; regenereras med `npm exec cap add android` vid behov.
  `android/.gitignore` exkluderar `*.jks`/`*.keystore` explicit (avkommenterat
  från Capacitor-mallens default — signeringsnyckeln får ALDRIG in i git).
- `manifest.webmanifest` — riktig fil, ersätter den gamla `data:`-URI:n i
  `<head>`. Ikonerna pekar fortfarande på inline-SVG:n "TC" tills riktiga
  PNG:er finns (Play/Capacitor-ikon väntar på källbild från Niklas).
- **`npx` funkar INTE direkt i ps-gaten** (bara git/npm/node whitelistat) —
  men `npx ...` fungerar när det körs INIFRÅN ett `npm run`-script (se
  `cap:sync` i `package.json`). Wrappa alla Capacitor-CLI-anrop så.
- Scope-beslut 2026-08-20: Android FÖRST (sideload, inte Play Store initialt —
  Niklas har inte 20 testare), iOS som fas 2. Se `project_appstore.md`-minnet.

## Verktygsval
- Bash är förbjudet. Endast PowerShell.
- Sökning: ALLTID Grep/Read/Glob. ALDRIG Select-String/Get-Content.
- `node check_syntax.js` är Niklas verktyg — be honom köra `! node check_syntax.js` lokalt.
