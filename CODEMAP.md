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
- `~8362` — `ensureExtraSets(exId, passId)` — paddar work-sets upp till `lastSessionSetCount`. **Guard:** hoppar pad om `state.draft.setEdited[exId]` (sätts av add/removeWorkSet). Utan guarden snäppa borttagna set tillbaka.
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

### Synk-lagret
- `~5777` — `mergeLogEntries`, `~5788` `mergeWeightEntries`
- `~5801` — `mergeArrayById`, `mergeKeyedMap`, `mergeArrayUnion`, `mergeMapOfArrays`, `mergeMapOfArrayById`
- `~5843` — `syncFromCloud(userId)` (mutex per SL7). Preserverar lokala `state.drafts`
- `~6046` — `pushState(opts)` — pull-before-push. Skickar `drafts` men exkluderar från cloud-merge
- `~6090` — `save()` — har isFreshState-guard + QuotaExceededError-toast
- `~8201` — `finishSession(passId)` — rensar `state.drafts[passId]`
- `~10253` — `__periodicSyncTimer` (30s) + `~10262` `keepaliveCloudPush()`
- `~10319` — event-handlers: `visibilitychange`, `beforeunload`, `pagehide`

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
