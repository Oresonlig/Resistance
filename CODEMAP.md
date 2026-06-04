# Code Map — index.html

`index.html` är single-file: inline CSS + JS, ~280KB, ~7500+ rader. Radnummer är ungefärliga — använd Grep om de inte stämmer.

## Var saker bor

### State & defaults
- `~4536` — `ensureStateDefaults()` (init `drafts{}`, `prCollapsed`)
- `~4595` — `isFreshState(s)`
- `~4612` — `freshState()` — single source of truth. `appVersion:APP_VERSION`
- `~4995` — `const APP_VERSION` — **ENDA stället att bumpa version**
- `~4967` — `getEffectiveChain()` — cachad chain med order + adds/removes
- `~4981` — `invalidateChainCache()`

### Chain & rendering
- `~5169` — `newCycle()` — **TDZ-fälla:** anropas inuti `freshState()`, läser `state` via `getEffectiveChain()`. Vid `let state = freshState()` är `state` i TDZ → ReferenceError. Defensiv try/catch sedan 3.35.12. RÖR INTE utan att förstå detta.
- `~5192` — `ensureDraft(passId)` — multi-draft: `state.drafts[passId]`-slots, inte enda `state.draft`
- `~8271` — `ensureExtraSets(exId, passId)` — paddar work-sets upp till `lastSessionSetCount`. **Guard:** hoppar pad om `state.draft.setEdited[exId]` (sätts av add/removeWorkSet). Utan guarden snäppa borttagna set tillbaka.
- `~7653` — `TAG_HINTS`-map + `getExerciseDescriptionLine` + `getExerciseTip`: tag-driven rad 1 + övnings-tip rad 2
- `~8194` — `togglePRCollapse()` + PR-render: kollapsbar PR-sektion, `state.prCollapsed` default true
- `~4380` — `buildAddExRow(passId)` — "Add exercise"-knapp + dropdown (använder `groupExercisesByCategory()`)
- `~5030` — chain-strip rendering
- `~5600` — Edit Chain-vyn (reorder)
- `~5630` — `showEditExercises(passId)`
- `~5757` — `confirmAddPermEx(passId)`
- `~5921` — `buildTagEditorHTML(ex, passId)` — tags-editor
- `~6420` — `confirmAddEx(passId)`

### EXERCISE_LIBRARY & helpers
- `~5171` — `EXERCISE_LIBRARY` array (~rad 5171–5230)
- `~6172` — `groupExercisesByCategory()` — cachad gruppering, används av buildAddExRow + swap-dropdown + edit-vyn. `_groupedExCache` nollställs vid custom exercise-ändring.

### Synk-lagret
- `~4068` — `mergeLogEntries`, `mergeWeightEntries`
- `~4087` — `mergeArrayById`, `mergeKeyedMap`, `mergeArrayUnion`, `mergeMapOfArrays`, `mergeMapOfArrayById`
- `~5320` — `syncFromCloud(userId)` (mutex per SL7). Preserverar lokala `state.drafts`
- `~5512` — `pushState(opts)` — pull-before-push. Skickar `drafts` men exkluderar från cloud-merge
- `~5556` — `save()` — har isFreshState-guard + QuotaExceededError-toast
- `~7611` — `finishSession(passId)` — rensar `state.drafts[passId]`
- `~7430+` — event-handlers: focus, periodic 30s, beforeunload, visibilitychange

### Modaler & UI-utilities
- `~7221` — `askModalText(title, opts)` returnerar `{text, select}` (INTE en string)
- `~7300+` — `askModalConfirm(title, body, opts)`
- `~7500+` — Service Worker registration (`sw.js`)

### Teman
- `~7221` — `THEMES`-arrayen (tema-registry)
- `~applyTheme()` — sätter `document.body.className` + startar/stoppar ambient effects
- Temablocken i CSS: Iron `:root` (~rad 21), Night City (~530), Nanosuit (~1911), Void (~1852), Arctic (~1049 + ~2942), Crusader (~2565 + ~3229), Overgrowth/understory (~3075), Obsidian (~3670), Ember (~3680), Cosmic Horror (~4048)

## Arkitektur — viktiga val

- **State är single source of truth.** localStorage är primary store, Supabase är synk-lager.
- **CRDT-light merge:** vid `cloudHasNewerState` mergas icke-blob-fält per id/key. Cloud vinner vid konflikt. Lokala-only id:n bevaras.
- **Multi-draft (3.36.0):** `state.drafts[passId]` är per-pass-slots. `state.draft` = aktiv pekare, sätts av `ensureDraft(passId)`. Drafts är device-lokala — preserveras i sync, exkluderas från cloud-merge.
- **`lastSyncedCloudTime` är server-tid** (från upsert response). Inte klient-tid.
- **`pushState` är pull-before-push.** Säkerställer merge före write.
- **Sync-trigger-points:** visibility-change-hidden (push), -visible (flush+sync), focus (flush+sync), periodic 30s, beforeunload (keepalive-fetch). Mutex via `_syncInFlight`.
- **Rendering är string-interpolation → innerHTML.** XSS-känsligt — `escapeHTML()` används men inte överallt (PM9/PM19 öppen).

## Versionsrutin
1. `const APP_VERSION = 'x.x.x'` (~rad 4995) — **ENDA stället**
2. State-init (`appVersion:APP_VERSION`) + header läser konstanten dynamiskt
3. `CHANGELOG.md` entry överst

## Verktygsval
- Bash är förbjudet. Endast PowerShell.
- Sökning: ALLTID Grep/Read/Glob. ALDRIG Select-String/Get-Content.
- `node check_syntax.js` är Niklas verktyg — be honom köra `! node check_syntax.js` lokalt.
