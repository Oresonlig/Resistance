# Code Map — index.html

`index.html` är single-file: inline CSS + JS, ~290KB, ~10 350 rader. Radnummer är ungefärliga — använd Grep om de inte stämmer.

## Var saker bor

### State & defaults
- `~4911` — `ensureStateDefaults()` (init `drafts{}`, `prCollapsed`)
- `~4986` — `isFreshState(s)`
- `~5003` — `freshState()` — single source of truth. `appVersion:APP_VERSION`
- `~5391` — `const APP_VERSION` — **ENDA stället att bumpa version**
- `~5521` — `const SCHEMA_VERSION` + `SCHEMA_MIGRATIONS`-pipeline
- `~5363` — `getEffectiveChain()` — cachad chain med order + adds/removes
- `~5377` — `invalidateChainCache()`

### Chain & rendering
- `~5690` — `newCycle()` — **TDZ-fälla:** anropas inuti `freshState()`, läser `state` via `getEffectiveChain()`. Vid `let state = freshState()` är `state` i TDZ → ReferenceError. Defensiv try/catch sedan 3.35.12. RÖR INTE utan att förstå detta.
- `~5713` — `ensureDraft(passId)` — multi-draft: `state.drafts[passId]`-slots, inte enda `state.draft`
- `ensureExtraSets(exId, passId)` — **3.59.0 ROTFIX:** ren `reconcileSets` (`src/set-reconcile.js`, speglad i index.html) = EN symmetrisk regel som paddar BÅDE warmup OCH work mot `getSetTargets(ex)` (self-healing mot försvinnande set), bevarar loggade set, ramp strippar warmups, `setEdited`/`saved` låser formen. Ersatte work-only-paddet + RAMP-filtret (slut på 3.39/3.44/3.49/3.52/3.55-lapptäcket där warmups saknade skyddsnät → Unilateral Row tappade en uppvärmning permanent). Instrument: `SET_RESTORED@reconcile` loggas vid pad av befintlig draft → copy-draft `incidents[]`. `getSetTargets(ex)` = single source of truth för warmup/work-antal (delas med `getDefaultSets`).
- `~8306` — `TAG_HINTS`-map + `~8314` `getExerciseDescriptionLine` + `getExerciseTip`: tag-driven rad 1 + övnings-tip rad 2
- `~8931` — `togglePRCollapse()` + PR-render: kollapsbar PR-sektion, `state.prCollapsed` default true
- `~6246` — `buildAddExRow(passId)` — "Add exercise"-knapp + dropdown (använder `groupExercisesByCategory()`)
- `~6337` — `buildPassBodyHTML(pass,cycle,nextId)` — session-body HTML
- `~6717` — chain-strip rendering (i renderData)
- `~7286` — Edit Chain-vyn (reorder)
- `~7494` — `showEditExercises(passId)`
- `~7615` — `confirmAddPermEx(passId)`
- `~7774` — `buildTagEditorHTML(ex, passId)` — tags-editor
- `~8573` — `confirmAddEx(passId)`
- `~8810` — `selectSession(passId)` — byter aktiv session + fade-animation

### EXERCISE_LIBRARY & helpers
- `~5183` — `EXERCISE_LIBRARY` array
- `~6235` — `groupExercisesByCategory()` — cachad gruppering, används av buildAddExRow + swap-dropdown + edit-vyn. `_groupedExCache` nollställs vid custom exercise-ändring.

### Extras (3.54.0 — full parity med ordinarie övningar)
- Stabila id: `extra_<passId>_<sid>` sätts i `confirmAddEx`. Legacy index-id migreras i `ensureStateDefaults`. INGEN re-indexering vid remove.
- `makeExtraEx(entry)` + `extraExId(name)` — nära `getRenderExId` (~5475). Speglas i `src/extras-model.js` (testtäckt). Vid ändring: uppdatera båda.
- `buildExtraBlock` FINNS INTE längre — extras renderas som syntetiska ex-objekt genom samma loop som ordinarie i `buildPassBodyHTML` (`allExs`). Branch på `ex.extra` styr bara action-knapparna (Skip/Edit▾[Tags/+Program/Remove], ingen swap).
- PR/historik/notes nycklas på kanoniskt exId (namn-slug) — extras delar identitet med samma övning i program.
- Tag-overrides på extra-id är efemära: städas i `finishSession` + `removeExtra`, flyttas till nya id:t i `saveExtraToProgram`.

### Mätsätt / measure (3.56.0 — input-form + PR separerat från set-schema)
- 7 mätsätt i `MEASURES`-registry (nära `getRenderExId`): `weight/bw/bwreps/timed/cardio/cardiosprint/carry`. Speglas i `src/measures.js` (testtäckt). Vid ändring: uppdatera BÅDA.
- `getMeasure(exId, ex)`: override(`state.exerciseMeasureOverride[exId]`) > library-default (`libraryMeasureMap`, byggd från `EXERCISE_LIBRARY[].measure`) > custom.measure > ex.measure > **namn-fallback** (template I–N slots saknar BASE_SLOT_DEFAULT_NAME → exId-lookup missar) > flaggor > `weight`.
- Override nyckel = **kanoniskt exId** (följer rörelsen, per användare). `getSprintBase` = `time`/`dist` för cardiosprint.
- Render: `measureCells(measure, sprintBase, ...)` bygger fält-cellerna; grid-kolumner via `.set-row.m-${measure}`-klass. Ersatte `if(isBW){}else{}`. `isBW`/`isTimed` härleds nu FRÅN measure.
- Capture/save/PR/copy/historik alla measure-drivna. `formatSetLine` + `prValue`/`prTiebreak` är shape-medvetna (läser settets egen form, ej nuvarande measure). Saved set bär `measure`.
- Set-schema: `getTagDefaults(ex, measure)` — ramp/uni/singles = tag-styrt; annars `MEASURE_SET_DEFAULTS[measure]` (cardio=1 set, ej HIT).
- UI: tag-editor har measure single-select (`setExerciseMeasure`) + sprintBase-toggle (`setSprintBase`).
- Library-data: bw=Chins/Pull-ups/Dips/Back Ext, bwreps=Ab Wheel/core, timed=Plank/Dead Hang, cardio=Bike/Walk, cardiosprint=Assault Bike, carry=Farmers/Sled.

### Synk-lagret (3.62.0 — läs-före-skriv + CAS)
- **Två invarianter sedan 3.62.0 — bryt dem ALDRIG:** (1) `_cloudSeenThisSession`-gate: ingen skrivning mot molnet (pushState/keepalive) förrän en lyckad molnläsning skett denna session. (2) CAS: alla skrivningar villkoras på senast sedda `updated_at` (`state.lastSyncedCloudISO`); konflikt → pull+merge → retry en gång. Blind upsert (`sbUpsert`) FINNS INTE längre — återinför den inte.
- `~4646` — `mergeLogEntries`, `mergeWeightEntries`, `mergeArrayById`, `mergeKeyedMap`, `mergeArrayUnion`, `mergeMapOfArrays`, `mergeMapOfArrayById`
- `~4720` — `syncFromCloud(userId)` — koalescerad (`_syncPromise` delas; parallella anrop AWAITAR pågående pull, no-op:ar inte). Preserverar lokala `state.drafts`. Sätter gate + `lastSyncedCloudISO` i alla branches; tom molnrad rensar ISO (→ insert-väg).
- `~4880` — `sbGet` (12s abort-timeout), `sbPatchStateIfMatch` (CAS-PATCH, `'conflict'` vid tomt svar), `sbInsertState` (första raden, 409 → `'conflict'`)
- `~4990` — `pushState(opts)` — pull-before-push (alltid awaitad) → gate-check → CAS-skrivning → konflikt = pull+merge+retry(`_casRetry`). Backoff-retry kör fullt flöde (aldrig skipPull). Drafts exkluderas ur payload.
- `~5050` — `save()` — isFreshState-guard + QuotaExceededError-toast
- `finishSession(passId)` — rensar `state.drafts[passId]`
- `~9540` — `keepaliveCloudPush()` — gate-check + CAS-PATCH (villkorad, fire-and-forget; konflikt = tyst no-op, datat kvar i localStorage). `__periodicSyncTimer` (30s) strax ovan.
- `~9600` — event-handlers: `visibilitychange`, `beforeunload`, `pagehide`
- Forensik: `PUSH_BLOCKED@gate` + `PUSH_CONFLICT@cas` i `_dbgPush`-ringbufferten

### Modaler & UI-utilities
- `~10052` — `askModalText(title, opts)` returnerar `{text, select}` (INTE en string)
- `~10133` — `askModalConfirm(title, body, opts)`
- `~10336` — Service Worker registration (`sw.js`)

### Teman
- `~8987` — `THEMES`-arrayen (tema-registry)
- `~9004` — `applyTheme()` — sätter `document.body.className` + startar/stoppar ambient effects
- Temablocken i CSS: Iron `body:not([class*="theme-"])` (~460), Night City (~529), Arctic (~1039), Ember (~1334), Void (~1846), Nanosuit (~1917), Undertow (~2954), Overgrowth/understory (~3091), Crusader (~3246), Obsidian (~3697), Cosmic Horror (~4066)

## Arkitektur — viktiga val

- **State är single source of truth.** localStorage är primary store, Supabase är synk-lager.
- **CRDT-light merge:** vid `cloudHasNewerState` mergas icke-blob-fält per id/key. Cloud vinner vid konflikt. Lokala-only id:n bevaras.
- **Multi-draft (3.36.0):** `state.drafts[passId]` är per-pass-slots. `state.draft` = aktiv pekare, sätts av `ensureDraft(passId)`. Drafts är device-lokala — preserveras i sync, exkluderas från cloud-merge.
- **`lastSyncedCloudTime` är server-tid** (från upsert response). Inte klient-tid.
- **`pushState` är pull-before-push.** Säkerställer merge före write.
- **Sync-trigger-points:** visibility-change-hidden (push), -visible (flush+sync), focus (flush+sync), periodic 30s, beforeunload (keepalive-fetch). Mutex via `_syncInFlight`.
- **Rendering är string-interpolation → innerHTML.** XSS-känsligt — `escapeHTML()` används men inte överallt (PM9/PM19 öppen).

## Versionsrutin
1. `const APP_VERSION = 'x.x.x'` (~rad 5391) — **ENDA stället**
2. State-init (`appVersion:APP_VERSION`) + header läser konstanten dynamiskt
3. `CHANGELOG.md` entry överst

## Verktygsval
- Bash är förbjudet. Endast PowerShell.
- Sökning: ALLTID Grep/Read/Glob. ALDRIG Select-String/Get-Content.
- `node check_syntax.js` är Niklas verktyg — be honom köra `! node check_syntax.js` lokalt.
