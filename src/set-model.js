// Set-model: stabila set-id:n + delad sorterings-/etikett-logik.
// Lager A av set/övnings-refaktorn (3.39.0). Fixar P1 (Set 1 försvinner) och
// #4 (warmup/work-ordning spretar mellan skärm och copy).
//
// VIKTIGT: DUPLICERAD logik mot index.html (set-hanteringen ~rad 5730/6040/7717).
// Vid ändring i en — uppdatera båda. Index.html är sanningen om de divergerar.
// Se [[reference_test_setup]] för varför duplicering (single-file, ingen build).
//
// Rotorsaks-design:
//  - Tidigare identifierades varje set av sin ARRAY-POSITION (origIdx). När
//    `ensureExtraSets` filtrerade bort warmups (ramp) mitt i Log-flödet
//    reindexerades arrayen → origIdx från DOM matchade inte längre buffern →
//    Set 1 läste fel cell och såg ut att försvinna. Stabilt `sid` per set gör
//    att filtrering/omordning aldrig flyttar ett sets identitet.
//  - Tidigare sorterade renderingen warmups-först men `buildCopyLines` läste
//    array-ordning rått → copy kunde skriva S1 före W1. EN delad
//    `sortSetsForDisplay` + spara i display-ordning → skärm och copy är aldrig oense.

let _sidCounter = 0;

// Monotont stigande, kollisionsfritt inom en session. Lagras i set-objektet och
// återberäknas ALDRIG från position — det är hela poängen.
export function nextSid(){
  return 's' + (++_sidCounter);
}

// Testhook: nollställ räknaren för deterministiska tester.
export function _resetSidCounter(){ _sidCounter = 0; }

export function makeSet(warmup){
  return { sid: nextSid(), warmup: !!warmup };
}

// Migrera legacy-sets (positionella {warmup}) → {sid,warmup}. Idempotent:
// sets som redan har sid lämnas orörda så identiteten bevaras över re-render.
export function ensureSetIds(sets){
  return (sets || []).map(s => {
    if (s && s.sid) return s;
    return { ...(s || {}), sid: nextSid(), warmup: !!(s && s.warmup) };
  });
}

// Stabil warmups-först-sortering. Array.filter bevarar inbördes ordning, så
// två work-set behåller sin relativa följd. Returnerar nya array, muterar ej.
export function sortSetsForDisplay(sets){
  const arr = sets || [];
  const warm = arr.filter(s => s && s.warmup);
  const work = arr.filter(s => s && !s.warmup);
  return [...warm, ...work];
}

// Tilldela W1/W2…/S1/S2… i DISPLAY-ordning. Samma funktion driver både skärm
// och copy så numreringen alltid stämmer överens.
export function labelSets(sets){
  let w = 0, k = 0;
  return sortSetsForDisplay(sets).map(s =>
    s.warmup ? { ...s, label: 'W' + (++w) } : { ...s, label: 'S' + (++k) }
  );
}
