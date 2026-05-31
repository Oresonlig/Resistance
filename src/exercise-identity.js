// Exercise identity — kanoniska övnings-id (Lager B, 3.40.0).
//
// VIKTIGT: speglas i index.html. Vid ändring: uppdatera båda. index.html är
// sanningen om de divergerar. (Single-file-app, ingen build — se reference_test_setup.)
//
// ── ROTORSAKS-DESIGN ──────────────────────────────────────────
// Tidigare nycklades historik/PR på NAMN och notes på SLOT-id (A1, B4…). Två problem:
//   #3 — note satt kvar på slotten vid swap (följde inte övningen).
//   #5 — swap återanvände slot-id → ärvd data mellan original och inswappad övning.
//   + rename-skräp: byt namn på en övning → historiken splittrades, vilket tvingade
//     fram en ständigt växande rename-tabell (migrateExerciseNames).
//
// Lösning: varje övning får ett stabilt kanoniskt `exId` (slug av kanoniskt namn).
// Slot A1 har ett DEFAULT-exId; "övningen i slotten" = swap-exId om swappad, annars
// default. Historik/PR/notes nycklas på exId. Namn blir bara en etikett ovanpå.
// En engångs-migration resolvar gammal namn-baserad data → exId, sen pensioneras
// rename-tabellen.

// Slug: kanoniskt namn → stabilt id. Deterministisk, ingen handskriven id-lista.
export function slugifyExId(name){
  return 'ex_' + String(name||'')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '');
}

// Legacy-namn → kanoniskt namn. Slår ihop:
//  (a) gamla split-namn från migrateExerciseNames (svenska-eran + tidiga renames)
//  (b) bas-program-namn som avvek från biblioteket (Flat BB → Flat BB Bench Press …)
// Appliceras transitivt (loop tills stabilt) så 'Chins or Pullups' → 'Pull-ups'
// → 'Pull-ups (pronated)'.
export const NAME_ALIASES = {
  // (b) bas-program → bibliotek (Niklas-godkända 2026-05-30)
  'Flat BB': 'Flat BB Bench Press',
  'Flat DB': 'Flat DB Press',
  'Seated Calf Raises': 'Seated Calf Raise',
  'Military Press': 'Military Press (barbell)',
  'Shrugs': 'DB Shrugs',
  'Pull-ups': 'Pull-ups (pronated)',
  // (a) gamla split-namn (från migrateExerciseNames)
  'Incline Smith or Incline DB': 'Incline Smith Press',
  'Pec Deck / Cable Flyes': 'Cable Flyes',
  'Chins or Pullups': 'Pull-ups',
  'Decline Smith / DB': 'Decline Smith Press',
  'Pull-ups / Chins': 'Pull-ups',
  'Tri-finisher (Pushdowns/Overhead)': 'Tricep Pushdowns',
  'Tri-finisher (Pushdowns)': 'Overhead Tricep Extension',
  'Calfs (standing + seated)': 'Seated Calf Raise',
  'Calfs': 'Seated Calf Raise',
  'Lateral Raises DB/Cable': 'Lateral Raises',
  'Helms Rear Delt Row / Face Pulls': 'Face Pulls',
};

// Slot-specifika legacy-namn (historiskt tvetydiga — samma namn, olika övning per slot).
// Kontrolleras FÖRE NAME_ALIASES när slotId är känd.
export const SLOT_NAME_ALIASES = {
  'A4|Tri-finisher': 'Tricep Pushdowns',
  'E4|Tri-finisher': 'Overhead Tricep Extension',
  'C4|Calfs': 'Seated Calf Raise',
};

// Bas-slot (A1…F4) → kanoniskt default-namn. Spegel av BASE_SESSIONS-defaults
// efter alias. Används för att resolva slot-keyade notes → exId vid migration.
export const BASE_SLOT_DEFAULT_NAME = {
  A1: 'Flat BB Bench Press', A2: 'Incline Smith Press', A3: 'Cable Flyes', A4: 'Tricep Pushdowns',
  B1: 'Dead Hang', B2: 'Deadlift', B3: 'Unilateral Cable Row', B4: 'Lat Prayers',
  C1: 'Zercher Squat', C2: 'Lying Leg Curl', C3: 'Leg Extension', C4: 'Seated Calf Raise',
  D1: 'Military Press (barbell)', D2: 'Lateral Raises', D3: 'Face Pulls', D4: 'Cable Rotator Cuff',
  E1: 'Flat DB Press', E2: 'Decline Smith Press', E3: 'Cable Flyes', E4: 'Overhead Tricep Extension',
  F1: 'Pull-ups (pronated)', F2: 'Unilateral Cable Row', F3: 'DB Shrugs', F4: 'Lat Prayers',
};

// Övningar som finns i programmet men saknades i EXERCISE_LIBRARY — läggs till där.
export const EXTRA_CANONICAL = [
  { name: 'Cable Rotator Cuff', cat: 'Shoulders' },
];

// Kanoniskt namn för ett (namn, slotId)-par. Transitiv alias-upplösning.
export function canonicalName(name, slotId){
  if(slotId){
    const slotKey = slotId + '|' + name;
    if(SLOT_NAME_ALIASES[slotKey]) return SLOT_NAME_ALIASES[slotKey];
  }
  let cur = name;
  for(let i=0; i<8 && NAME_ALIASES[cur]; i++) cur = NAME_ALIASES[cur];
  return cur;
}

// Kanoniskt exId för ett namn (+ ev slot för tvetydiga legacy-fall).
// Custom-övningar (id custom_*) behåller sitt befintliga id — skickas in som exoticId.
export function resolveExId(name, slotId, existingCustomId){
  if(existingCustomId && /^custom_/.test(existingCustomId)) return existingCustomId;
  return slugifyExId(canonicalName(name, slotId));
}

// ── MIGRATION (idempotent) ────────────────────────────────────
// Resolvar exId på all namn-/slot-baserad data. Säker att köra flera gånger:
//  - log/cycle-entries: sätt ex.exId om saknas (via namn + slot-id-prefix)
//  - exerciseNotes / lastSessionNotes: slot-keyade (A1…) → exId-keyade
//  - deletions.exerciseNotes: remappas likadant så tombstones följer med
// Returnerar {changed:boolean} för att kalla-koden ska veta om save behövs.
//
// `customById`: map custom_id → true, så custom-logg-rader behåller sitt id.
export function migrateExerciseIdentity(state, opts={}){
  if(!state) return { changed:false };
  const customIds = opts.customIds instanceof Set ? opts.customIds
    : new Set((state.customExercises||[]).map(c=>c.id));
  let changed = false;

  const resolveForEntry = (ex) => {
    // Custom-logg-rader: behåll custom-id som exId
    if(ex.id && customIds.has(ex.id)) return ex.id;
    return resolveExId(ex.name, ex.id, ex.id);
  };

  // 1) state.log
  for(const entry of (state.log||[])){
    for(const ex of (entry.exercises||[])){
      if(!ex.exId){ ex.exId = resolveForEntry(ex); changed = true; }
    }
  }
  // 2) cycle.done-snapshots
  for(const cycle of (state.cycles||[])){
    for(const snap of Object.values(cycle.done||{})){
      if(!snap || !snap.exercises) continue;
      for(const ex of snap.exercises){
        if(!ex.exId){ ex.exId = resolveForEntry(ex); changed = true; }
      }
    }
  }
  // 3) Notes: slot-id → exId. Resolva via slot-default-namn (+ perm-swap/override
  //    om de pekar om slotten till en annan övning).
  const remapNotes = (mapName) => {
    const m = state[mapName];
    if(!m || typeof m !== 'object') return;
    for(const key of Object.keys(m)){
      if(/^ex_/.test(key) || /^custom_/.test(key)) continue; // redan migrerad
      const exId = slotKeyToExId(state, key, customIds);
      if(exId && exId !== key){
        // Slå inte ihop tyst om mål redan finns (behåll befintlig, släng dubbletten
        // till ett _migrated-suffix vore overkill — först-vinner är ok för notes)
        if(m[exId] === undefined) m[exId] = m[key];
        delete m[key];
        changed = true;
      }
    }
  };
  remapNotes('exerciseNotes');
  remapNotes('lastSessionNotes');
  // 4) deletions.exerciseNotes (tombstones) — samma remap
  if(state.deletions && state.deletions.exerciseNotes){
    const d = state.deletions.exerciseNotes;
    for(const key of Object.keys(d)){
      if(/^ex_/.test(key) || /^custom_/.test(key)) continue;
      const exId = slotKeyToExId(state, key, customIds);
      if(exId && exId !== key){
        if(d[exId] === undefined) d[exId] = d[key];
        delete d[key];
        changed = true;
      }
    }
  }
  return { changed };
}

// Resolva en slot-key (A1…F4, eller added_*/extra_*) → exId.
function slotKeyToExId(state, slotId, customIds){
  // perm-swap pekar om slotten till en annan övning (namn)
  const swapName = state.permanentSwaps && state.permanentSwaps[slotId];
  if(swapName){
    const custom = (state.customExercises||[]).find(c=>c.name===swapName);
    return resolveExId(swapName, slotId, custom?.id);
  }
  // rename = bara etikett; default-övningen är oförändrad → använd slot-default
  const baseName = BASE_SLOT_DEFAULT_NAME[slotId];
  if(baseName) return slugifyExId(baseName);
  // added_*/okänd slot: kan inte resolvas säkert → lämna (returnera null)
  return null;
}
