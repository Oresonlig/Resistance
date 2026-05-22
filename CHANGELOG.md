# Changelog

Spårbar versionslogg för The Chain. Nyaste överst. Datum från git-historik.

Format: `MAJOR.MINOR.PATCH` — patch = bugfix/små tillägg, minor = ny feature, major = stora omtag.

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
