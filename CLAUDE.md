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
- **Före varje push:** `npm run check` (= `check_syntax.js` + `check_themes.js` +
  `npm test`) ska vara grön. Tema-checken felar hårt på rest-day-asymmetri i
  chain-strippen; dess warn-rader ska LÄSAS, inte scrollas förbi.
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
- **`!important` får låsa IDENTITET, aldrig YTA.** `background:...!important` raderar
  temats *material* (gradient, inset-skuggor), inte bara dess färg — kvar blir en
  genomskinlig film som är mörk mot en mörk botten hur mycket färg man än häller i.
  Vilodagens guld: `color` är låst, ytan går via `--rest-plate`/`--rest-name-plate`.
  Ett tema som ger `.chain-tab.active` egen kapselbakgrund MÅSTE deklarera båda
  (`check_themes.js` CHECK 5). Kostade fem fixrundor 3.81.2→3.86.0.
- **Textfärg går ALLTID via `--text-strong/-body/-muted/-faint`**, aldrig en egen grå.
  Skalan är `color-mix(--white, --black)` så polariteten följer temat automatiskt.
  Golv: datatext 7:1, etiketter 4,5:1 — `check_themes.js` CHECK 6+7 räknar, och
  CHECK 7 fångar teman som kringgår skalan (sju av elva gjorde det, 3.87.0).
- **Koda ALDRIG status och närhet i samma visuella kanal.** Status = fas/fyllning
  på bokstaven. Närhet = kapsel/kant/expansion på containern. Annars slår
  `.adjacent`-regler (0-4-1) bas-regelns `.done`-fade (0-3-0) och färdiga pass
  tänds upp som kommande.
- **Verifiera SEX kombinationer** vid varje chain-tab-ändring: `distant`,
  `adjacent`, `done`, `adjacent.done` — **och samma fyra igen med `.rest-day`**.
  `node check_themes.js` kontrollerar detta mekaniskt — kör den, lita inte på ögat.
- **Ny variant av en komponent (mörkt kort, saved-läge) = styla ALLA dess barn**,
  inte bara namnet. Tema-checkens `[variant]`-warn jämför syskonvarianter åt dig.
- **Vilodagar:** etiketten är ALLTID ett enkelt `V` (aldrig VB/VC/V1/V2) — men det
  interna id:t förblir unikt. Guldet är låst med `!important`; scopa aldrig hela
  sitt state-arbete med `:not(.rest-day)`, då ärver vilodagarna gamla buggar.
- Ljusa teman: PM22 surface-overrides är OBLIGATORISKA (annars vit text på vitt).
- **Använd ALLTID `var(--surface-X)`**, aldrig hårdkodad `background:#XXX`.
- Frostat glas = **LÅG opacitet (10–55%) + blur**. Aldrig 85–94%.
- **Ambient-lager: sätt `ambient-back` eller `ambient-front` på lagret — inget mer.**
  `.view` lyfts en gång i bas-CSS (3.85.0). Sätt ALDRIG `position:relative;z-index:1`
  på en panel, en vy, header eller nav i tema-CSS. Den gamla regeln ("varje opak
  panel behöver eget lyft") var fel diagnos och är borttagen.
- Sätt aldrig egen `font-family`/`font-size` på header-hörnet (`--ui-mono` är låst)
  eller på `.set-num`.
- **Nytt tema med rörlig ambient (canvas/SVG-animation) ⇒ `.chain-strip-outer` +
  `.pass-ex-header` MÅSTE få en yta**, samma "hylla"-material som temats
  `.ex-block`/`.panel`. Statiska teman (ingen JS-mountad bakgrund) behöver den
  inte och ska lämnas orörda. `check_themes.js` CHECK 8 varnar för ram-utan-yta
  men avgör inte AVSIKT — bedömningen "rörlig eller inte" görs manuellt per tema.

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
- **"Blir det som förra gången?" = byt KRITERIUM, inte siffror.** Har flera rundor
  av tweaks inte gett effekt är nästa tweak inte lösningen. Gör måttet mekaniskt
  (ett tal ett skript räknar) så fel upptäcks av verktyget i stället för av Niklas.
  3.87.0: kontrastgolvet avslöjade två av mina egna felbedömningar innan push.
- **Det som kan bli ett skript eller ett test slår allt som bygger på minne.**
  Statisk analys (inline-handlers mot definierade funktioner, CSS-selektorer mot
  markup) hittar på sekunder det som annars kräver att man läser 11 000 rader.

→ Detaljer: `feedback_root_cause_before_patching`, `feedback_kodrutiner`.

## 8. Vid sessionsstart

Läs `CODEMAP.md` (kod-karta, radnummer driver fort — grepa hellre än att lita på
dem) och relevanta memory-filer. `MEMORY.md` är indexet.
