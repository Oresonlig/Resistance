# The Chain — arbetsregler

Hårda regler som gäller varje session. Korta imperativ, ingen historik — *varför*
finns i memory-filerna som länkas per punkt. Bryter något mot detta: fråga först.

---

## 1. Leverans och push

- **Niklas sitter oftast REMOTE och kan bara verifiera det som är LIVE.** Fråga
  aldrig "ska jag pusha?" — pusha. Osparade fixar är osynliga för honom, och han
  testar då gamla versionen och rapporterar buggar du redan fixat.
- **Push-scope:** `index.html` + `CHANGELOG.md` + filer han uttryckligen namngett
  (t.ex. `src/`-speglar och tester som hör till ändringen). **Rör ALDRIG lösa
  ospårade filer** — `Bugg/`, `.claude/`, spec-`.md`, zip-arkiv, `theme/`-mappar.
- **Före varje push:** `node check_syntax.js` **och** `npm test` ska vara gröna.
- Commit-meddelanden med specialtecken: skriv till temp-fil, `git commit -F`.
  PowerShell here-strings bryts på emojis/pilar.
- Rapportera alltid vad som INTE är verifierat. Browser-verifiering görs av Niklas.

## 2. Versionsrutin

1. `const APP_VERSION = 'x.x.x'` — **ENDA stället**. Grep efter konstanten, lita
   inte på memorerade radnummer.
2. `CHANGELOG.md`: ny entry överst, format `## x.x.x — YYYY-MM-DD`.
3. Nytt tema eller borttagen/ny synlig funktion = MINOR. Buggfix = PATCH.

## 3. Verktyg

- **PowerShell only. Bash är förbjudet** (hårt `deny` i settings).
- PowerShell ENDAST för `git`/`npm`/`node`. Ett kommando i taget, inga `|` eller
  `;`-kedjor — ps-gaten nekar dem.
- **Sökning/läsning: ALLTID Grep/Read/Glob.** Aldrig `Select-String`/`Get-Content`.
- Kör INTE `claude doctor`.
- Undvik `AskUserQuestion` — har fryst remote-sessioner. Ställ flervalsfrågor i klartext.

## 4. Kommunikation

- **Fråga → svara → STOPP → invänta "kör".** Gäller även när uppgiften redan har
  övergripande grönt ljus. Att svara och koda i samma svar är fel.
- Pushback är efterfrågat — men formulera det som förslag och **vänta på svar**
  innan du avviker från direktiv. Niklas har veto.
- Teknisk vokabulär är önskad. Förenkla inte preemptivt.
- Kort feedback ("Fint!", "Ok") = medveten synk, inte småprat. Kritik = ny data,
  agera direkt.

## 5. Design och teman — Niklas har VETO

- **Rör ALDRIG teman, färger, layout eller UX utan explicit godkännande.** Under en
  buggfix: fixa bara buggen.
- **App-språk = ENGELSKA.** Inga svenska strängar i UI. Kodkommentarer får vara svenska.
- **Chain-strippen: tre tillstånd är obligatoriska** — *kvar att träna* (full
  styrka), *på glänt* (antytt, ej fullt expanderat, svagare än kvar-att-träna),
  *avklarad* (tydligt avverkad men **ALDRIG osynlig** — man ska kunna se att passet
  ligger där och gå att trycka på).
- **Koda ALDRIG status och närhet i samma visuella kanal.** Status = fas/fyllning
  på bokstaven. Närhet = kapsel/kant/expansion på containern. Annars slår
  `.adjacent`-regler (0-4-1) bas-regelns `.done`-fade (0-3-0) och färdiga pass
  tänds upp som kommande.
- **Verifiera SEX kombinationer** vid varje chain-tab-ändring: `distant`,
  `adjacent`, `done`, `adjacent.done` — **och samma fyra igen med `.rest-day`**.
- **Vilodagar:** etiketten är ALLTID ett enkelt `V` (aldrig VB/VC/V1/V2) — men det
  interna id:t förblir unikt. Guldet är låst med `!important`; scopa aldrig hela
  sitt state-arbete med `:not(.rest-day)`, då ärver vilodagarna gamla buggar.
- Ljusa teman: PM22 surface-overrides är OBLIGATORISKA (annars vit text på vitt).
- **Använd ALLTID `var(--surface-X)`**, aldrig hårdkodad `background:#XXX`.
- Frostat glas = **LÅG opacitet (10–55%) + blur**. Aldrig 85–94%.
- Canvas-teman: **varje** opak panel behöver egen `position:relative;z-index:1`.
  `.view`-lyftet ensamt räcker inte.
- Sätt aldrig egen `font-family`/`font-size` på header-hörnet (`--ui-mono` är låst)
  eller på `.set-num`.

→ Detaljer och incidenthistorik: `feedback_teman_arkitektur`, `feedback_rest_day_label`,
`feedback_light_themes`, `feedback_css_variabler`.

## 6. Arkitektur — invarianter som inte får brytas

- **Mätsätt = sluten enum som DATA per övning + EN render-switch.** ALDRIG
  per-övnings-specialkod. Nytt fält i `MEASURES` speglas i `src/measures.js`.
- **Synk:** läs-före-skriv-gate (`_cloudSeenThisSession`) + CAS på `updated_at`.
  **Blind upsert är förbjuden** — återinför den inte. Skrivning går via
  `write_app_state_cas`-RPC:n (direkt INSERT/UPDATE är indraget server-side).
- **Auto-delete av synkat fält MÅSTE skriva tombstone**, annars resurrectar
  cloud-merge värdet.
- `freshState()` och `ensureStateDefaults()` **måste hållas i synk** — nytt
  state-fält läggs till på BÅDA ställena.
- `src/*.js` speglar kod i `index.html`. Ändra båda. `index.html` är sanningen.
- **Rensa dödkod i SAMMA version som ersätter funktionen** — inte "senare". Och
  glöm inte UI:t som skrev till den (ett reglage utan läsare är en lögn).

→ Detaljer: `feedback_measure_architecture`, `feedback_sync_architecture`,
`feedback_tombstones_for_auto_delete`, `CODEMAP.md`.

## 7. Felsökningsdisciplin

- **"Hoppar/skiftar mellan X och Y"** → leta efter en storlek-beroende mekanism
  (`align-items:center`, auto-marginaler, font-metrik) **innan** du rör ett enda
  offset-tal. En tweak utan identifierad mekanism är en gissning.
- **Ljust artefakt (linje/glipa/band) som överlever upprepade fixar** = opacitets-
  eller z-index-läcka, inte en border. Fråga "vad lyser IGENOM här?".
  **En marginal är ett fönster precis som alpha är det.**
- **Göm aldrig ett element med `display:none` för att det är osynligt** — då tar du
  bort funktionen istället för att lösa färgproblemet.
- Vid en buggklass på en flik: sök igenom **alla** flikar i samma svep. Niklas
  skickar en skärmdump och förväntar sig att du generaliserar fixen.
- **Det som kan bli ett skript eller ett test slår allt som bygger på minne.**
  Statisk analys (inline-handlers mot definierade funktioner, CSS-selektorer mot
  markup) hittar på sekunder det som annars kräver att man läser 11 000 rader.

→ Detaljer: `feedback_root_cause_before_patching`, `feedback_kodrutiner`.

## 8. Vid sessionsstart

Läs `CODEMAP.md` (kod-karta, radnummer driver fort — grepa hellre än att lita på
dem) och relevanta memory-filer. `MEMORY.md` är indexet.
