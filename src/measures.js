// Measures-model: mätsätt (measurement type) — HUR ett set loggas, separerat
// från set-schemat (HUR MÅNGA set). Sluten enum, intrinsisk default per övning,
// override-bar per användare på kanoniskt exId (3.56.0). Se MEASURE_SPEC.md.
//
// VIKTIGT: speglas i index.html. Vid ändring: uppdatera båda. index.html är
// sanningen om de divergerar. (Single-file-app, ingen build — se reference_test_setup.)

// Varje measure: vilka logiska fält som loggas + vilket fält som är PR-metrik.
// `forced` = om +f (failure-reps) är meningsfullt. `bw` = bodyweight-layout.
// För `cardiosprint` är `base` antingen secs eller dist beroende på sprintBase.
export const MEASURES = {
  weight:       { fields: ['weight', 'reps'],   pr: 'weight',  forced: true,  bw: false },
  bw:           { fields: ['extra', 'reps'],    pr: 'extra',   forced: true,  bw: true  },
  bwreps:       { fields: ['reps'],             pr: 'reps',    forced: true,  bw: false },
  timed:        { fields: ['secs'],             pr: 'secs',    forced: true,  bw: false },
  cardio:       { fields: ['secs', 'dist'],     pr: 'dist',    forced: false, bw: false },
  cardiosprint: { fields: ['base', 'sprints'],  pr: 'sprints', forced: false, bw: false },
  carry:        { fields: ['weight', 'distm'],  pr: 'weight',  forced: false, bw: false },
  inclinecardio:{ fields: ['incline', 'secs', 'dist'], pr: 'dist', forced: false, bw: false },
};

export const MEASURE_KEYS = Object.keys(MEASURES);

// Bakåtkompat: härled measure från äldre bw/timed-flaggor (för data/övningar utan
// explicit measure). Dead Hang (bw+timed) → timed per spec (1-fält sekunder).
export function measureFromFlags(ex) {
  if (!ex) return 'weight';
  if (ex.timed) return 'timed';
  if (ex.bw) return 'bw';
  return 'weight';
}

// Resolva measure: override(exId) > övningens egna measure > library-default >
// härlett från flaggor > 'weight'. `libraryMeasure` = map exId→measure (index.html
// bygger den från EXERCISE_LIBRARY); `overrides` = state.exerciseMeasureOverride.
export function resolveMeasure(exId, ex, overrides, libraryMeasure) {
  const ov = overrides && exId ? overrides[exId] : undefined;
  if (ov && MEASURES[ov]) return ov;
  const lib = libraryMeasure && exId ? libraryMeasure[exId] : undefined;
  if (lib && MEASURES[lib]) return lib;
  if (ex && ex.measure && MEASURES[ex.measure]) return ex.measure;
  return measureFromFlags(ex);
}

// Numeriskt PR-värde för ett set givet measure. null = räknas ej (fail/tomt).
// För `extra` (BW) räknas total last = extra + bodyweight-snapshot.
export function prValue(measure, set) {
  if (!set || set.fail) return null;
  const m = MEASURES[measure] || MEASURES.weight;
  switch (m.pr) {
    case 'weight':  return set.weight != null ? set.weight : null;
    case 'extra':   return set.extra != null ? (set.extra + (set.bwSnap || 0)) : null;
    case 'reps':    return set.reps != null ? set.reps : null;
    case 'secs':    return set.secs != null ? set.secs : null;
    case 'dist':    return set.dist != null ? set.dist : null;
    case 'sprints': return set.sprints != null ? set.sprints : null;
    default:        return null;
  }
}

// Sekundär tiebreak-metrik vid lika primärvärde (t.ex. samma vikt → fler reps vinner).
export function prTiebreak(measure, set) {
  if (!set) return 0;
  const m = MEASURES[measure] || MEASURES.weight;
  if (m.pr === 'weight') return set.reps || 0;
  if (m.pr === 'extra')  return set.reps || 0;
  if (m.pr === 'secs')   return (set.weight || 0) + (set.extra || 0);
  return 0;
}
