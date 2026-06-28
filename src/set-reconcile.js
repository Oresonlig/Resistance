// Set-reconcile — EN symmetrisk regel för warmup- OCH work-kolumnen (3.59.0).
//
// Bakgrund: set-försvinna-buggen "löstes" fem gånger (3.39.0 stabila sid, 3.44.2
// stale-pad, 3.49.0 setEdited-guard, 3.52.1 RAMP-tre-fas, 3.55.0 _noWorkLogged) —
// men ALLA fixar paddade bara WORK sets. Warmups hade aldrig något skyddsnät, så
// en försvunnen uppvärmning (Unilateral Row, uni → 2 warmup default) var permanent
// borta. Det här ersätter lapptäcket med en enda invariant som gäller BÅDA kolumner.
//
// Ren funktion: ingen DOM, inget globalt state, inga sidoeffekter. Speglas i
// index.html (index.html är sanningen om de divergerar — single-file-app, ingen
// build). Se reference_test_setup / feedback_measure_architecture.
//
// INVARIANT (för en övning som inte är låst):
//   antal warmup-set = targetWarm  (0 om ramp)
//   antal work-set   = targetWork
// Padding lägger BARA till saknade slots upp till target. Befintliga set tas
// aldrig bort (utom ramp: ramping ogiltigförklarar warmups) → loggad data är helig.
// `locked` (setEdited || saved) fryser formen: användarens egna add/remove vinner.
//
// Varför pad-mot-target är säkert (ingen oönskad "resurrection"): den fräscha
// listan skapas redan med `targetWork`/`targetWarm` slots (defSets). Mitt i passet
// kan antalet bara SJUNKA via (a) explicit ✕ → locked, eller (b) en bugg. Pad mot
// target återställer därför bara till den form användaren först såg — aldrig fler.

export function reconcileSets(opts) {
  const {
    current,            // [{sid, warmup}] — befintlig (non-empty) draft-lista
    targetWarm = 0,
    targetWork = 0,
    isRamp = false,
    locked = false,     // setEdited || saved → reshapa inte
    mintSid,            // () => unik sid för paddade set
  } = opts || {};

  let sets = Array.isArray(current) ? current.slice() : [];
  const removed = [];
  const padded = { warm: 0, work: 0 };

  // RAMP: ingen warmup. Strip ALLA warmups (även loggade) — ramping ogiltigförklarar
  // dem. Körs FÖRE locked-checken (en swap/tag→ramp ska rensa även en låst övning).
  if (isRamp) {
    for (const s of sets) if (s && s.warmup) removed.push(s.sid);
    sets = sets.filter(s => s && !s.warmup);
  }

  // Pad båda kolumner mot target. Hoppas helt om låst (manuellt antal vinner).
  if (!locked) {
    const want = { warmup: isRamp ? 0 : targetWarm, work: targetWork };
    for (const warm of [true, false]) {
      const key = warm ? 'warmup' : 'work';
      const have = sets.filter(s => s && (!!s.warmup === warm)).length;
      for (let i = have; i < want[key]; i++) {
        sets.push({ sid: mintSid(), warmup: warm });
        if (warm) padded.warm++; else padded.work++;
      }
    }
  }

  // Defensivt: lämna aldrig en övning helt tom (t.ex. låst ramp som strippade allt).
  if (sets.length === 0) { sets.push({ sid: mintSid(), warmup: false }); padded.work++; }

  return { sets, removed, padded };
}
