// Extras-model: stabila extra-id + syntetiska ex-objekt för extras-parity.
// Extraherat för testbarhet. Speglar logiken i index.html (3.54.0).
//
// VIKTIGT: speglas i index.html. Vid ändring: uppdatera båda. index.html är
// sanningen om de divergerar. (Single-file-app, ingen build — se reference_test_setup.)

import { resolveExId } from './exercise-identity.js';

// Legacy extras ({name} utan id) får sitt DÅVARANDE index-baserade id
// ('extra_'+draft.passId+'_'+index) → all keyad data matchar utan remapping.
// Idempotent. Muterar draft. No-op om draft saknas/saknar passId/extras ej array.
export function migrateExtrasIds(draft) {
  if (draft && draft.passId && Array.isArray(draft.extras))
    draft.extras.forEach((e, i) => { if (e && !e.id) e.id = 'extra_' + draft.passId + '_' + i; });
  return draft;
}

// Syntetiskt ex-objekt för en extra-post. Flaggor (bw/ramp/timed/uni/singles)
// ärvs från customExercises-defen om namnet matchar; annars false.
// customExercises skickas in som parameter (index.html läser global state).
export function makeExtraEx(entry, customExercises) {
  if (!entry || !entry.name) return null;
  const c = (customExercises || []).find(x => x.name === entry.name);
  return {
    id: entry.id, name: entry.name, extra: true,
    bw: !!c?.bw, ramp: !!c?.ramp, timed: !!c?.timed, uni: !!c?.uni, singles: !!c?.singles
  };
}

// Kanoniskt exId för en extra-övning — namn-slug (custom-id om custom).
export function extraExId(name, customExercises) {
  const c = (customExercises || []).find(x => x.name === name);
  return resolveExId(name, null, c?.id);
}
