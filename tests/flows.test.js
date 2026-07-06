// @vitest-environment jsdom
// PM5 Option B — end-to-end-tester av stateful flöden i index.html (riktiga koden,
// inte src/-speglar). Se app-harness.js för hur appen bootas.
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { bootApp, resetState } from './app-harness.js';

const T = bootApp();

beforeEach(() => { resetState(); });

// Hjälpare: markera en övning som klar i aktiv draft (formen finishSession läser)
function saveDone(ex, sets){
  T.state.draft.savedExercises[ex.id] = { id: ex.id, name: ex.name, sets };
}
const WORK = { warmup:false, weight:60, reps:8 };
const WARM = { warmup:true, weight:40, reps:10 };

describe('finishSession (draft → log + cycle.done)', () => {
  it('flyttar komplett draft till log + cycle.done och rensar draft-slotten', () => {
    window.ensureDraft('A');
    const pass = window.getEffectiveChain().find(p => p.id === 'A');
    pass.exercises.forEach(ex => saveDone(ex, [ {...WARM}, {...WORK} ]));
    T.state.draft.sessionStartTime = Date.now() - 60000;

    window.finishSession('A');

    expect(T.state.log.length).toBe(1);
    const entry = T.state.log[0];
    expect(entry.passId).toBe('A');
    expect(entry.exercises.length).toBe(pass.exercises.length);
    expect(entry.duration).toBeGreaterThanOrEqual(60000);
    const done = window.curCycle().done['A'];
    expect(done).toBeTruthy();
    expect(done.timestamp).toBe(entry.timestamp);
    expect(done.exercises.length).toBe(pass.exercises.length);
    expect(T.state.draft).toBeNull();
    expect(T.state.drafts['A']).toBeUndefined();
  });

  it('vägrar avsluta när en övning varken är done eller skippad', () => {
    window.ensureDraft('A');
    const pass = window.getEffectiveChain().find(p => p.id === 'A');
    saveDone(pass.exercises[0], [ {...WORK} ]); // bara första — resten oresolvade

    window.finishSession('A');

    expect(T.state.log.length).toBe(0);
    expect(T.state.draft).not.toBeNull();
    // done-slotten är null-förfylld (3.35.12), inte undefined — poängen är "inte avslutad"
    expect(window.curCycle().done['A'] ?? null).toBeNull();
  });

  it('skippade övningar räknas som resolved', () => {
    window.ensureDraft('A');
    const pass = window.getEffectiveChain().find(p => p.id === 'A');
    const [first, ...rest] = pass.exercises;
    saveDone(first, [ {...WORK} ]);
    rest.forEach(ex => { T.state.draft.savedExercises[ex.id] = { id: ex.id, name: ex.name, skipped: true }; });

    window.finishSession('A');

    expect(T.state.log.length).toBe(1);
    const logged = T.state.log[0].exercises;
    expect(logged.filter(e => e.skipped).length).toBe(rest.length);
  });

  it('propagerar work/warmup-antal på kanoniskt exId (3.28.0/3.57.0)', () => {
    window.ensureDraft('A');
    const pass = window.getEffectiveChain().find(p => p.id === 'A');
    const first = pass.exercises[0];
    saveDone(first, [ {...WARM}, {...WORK}, {...WORK}, {...WORK} ]);
    pass.exercises.slice(1).forEach(ex => { T.state.draft.savedExercises[ex.id] = { id: ex.id, name: ex.name, skipped: true }; });

    window.finishSession('A');

    const exId = T.state.log[0].exercises[0].exId;
    expect(exId).toBeTruthy();
    expect(exId).not.toBe(first.id); // kanoniskt namn-slug, inte slot-id
    expect(T.state.lastSessionSetCount[exId]).toBe(3);
    expect(T.state.lastSessionWarmupCount[exId]).toBe(1);
  });

  it('fryser exerciseNotes-kopia i log-raden men behåller noten (3.40.0)', () => {
    window.ensureDraft('A');
    const pass = window.getEffectiveChain().find(p => p.id === 'A');
    const first = pass.exercises[0];
    saveDone(first, [ {...WORK} ]);
    pass.exercises.slice(1).forEach(ex => { T.state.draft.savedExercises[ex.id] = { id: ex.id, name: ex.name, skipped: true }; });
    const exId = window.getRenderExId(first.id) || first.id;
    T.state.exerciseNotes[exId] = 'öka 2.5kg nästa gång';

    window.finishSession('A');

    expect(T.state.log[0].exercises[0].note).toBe('öka 2.5kg nästa gång');
    expect(T.state.exerciseNotes[exId]).toBe('öka 2.5kg nästa gång'); // ingen auto-drop
  });
});

describe('doSwap (temp/perm)', () => {
  it('temp-swap: sätter draft.swaps och rensar sparad data — INTE permanentSwaps', async () => {
    window.ensureDraft('A');
    const ex = window.getEffectiveChain().find(p => p.id === 'A').exercises[0];
    saveDone(ex, [ {...WORK} ]);
    T.state.draft.loggedSets[ex.id] = { s0:{ weight:60 } };
    T.state.draft.inputBuffer[ex.id] = { s0:{ weight:'60' } };
    T.state.draft.extraSets = { [ex.id]: [{ sid:'s0' }] };

    await window.doSwap(ex.id, 'Incline Dumbbell Press', 'A');

    expect(T.state.draft.swaps[ex.id]).toBe('Incline Dumbbell Press');
    expect(T.state.draft.savedExercises[ex.id]).toBeUndefined();
    expect(T.state.draft.loggedSets[ex.id]).toBeUndefined();
    expect(T.state.draft.inputBuffer[ex.id]).toBeUndefined();
    expect(T.state.draft.extraSets[ex.id]).toBeUndefined();
    expect(T.state.permanentSwaps?.[ex.id]).toBeUndefined();
  });

  it('perm-swap: skriver permanentSwaps när swapwrap har data-mode="perm"', async () => {
    window.ensureDraft('A');
    const ex = window.getEffectiveChain().find(p => p.id === 'A').exercises[0];
    const wrap = document.createElement('div');
    wrap.id = 'swapwrap-' + ex.id;
    wrap.dataset.mode = 'perm';
    document.body.appendChild(wrap);
    try {
      await window.doSwap(ex.id, 'Machine Chest Press', 'A');
      expect(T.state.permanentSwaps[ex.id]).toBe('Machine Chest Press');
      expect(T.state.draft.swaps[ex.id]).toBe('Machine Chest Press');
    } finally {
      wrap.remove();
    }
  });

  it('tomt värde är no-op', async () => {
    window.ensureDraft('A');
    const ex = window.getEffectiveChain().find(p => p.id === 'A').exercises[0];
    await window.doSwap(ex.id, '', 'A');
    expect(T.state.draft.swaps[ex.id]).toBeUndefined();
  });
});

describe('importData (backup-fil, 3.65.0-saneringen på riktiga flödet)', () => {
  function importFile(obj){
    const file = new File([JSON.stringify(obj)], 'backup.json', { type:'application/json' });
    window.importData({ target: { files:[file], value:'' } });
  }

  it('sanerar en fientlig fil vid gränsen', async () => {
    importFile({
      cycles: [{ done: { A: {
        date: '6 <img src=x onerror=alert(1)>', timestamp: 'evil', duration: {},
        exercises: [
          { id: 'bad<svg/onload=alert(1)>', name: 'x', sets: [{ reps: 1 }] },
          { id: 'A1', name: 'ok', sets: [{ reps: '<img onerror=1>', weight: '50', side: 'X', fail: 'yes' }] },
        ],
      } } }],
      log: [{ passId: 'A', passName: 'Chest', timestamp: 'nope', duration: 'x',
        exercises: [{ id: 'A1', name: 'Bench', sets: [{ weight: '"><script>', reps: 5, warmup: 0 }] }] }],
      weightLog: [
        { date: '<img src=x>', weight: 80 },      // fel datumformat → droppas
        { date: '2026-07-06', weight: '82.5' },   // ok → weight koerceras till Number
        { date: '2026-7-6', weight: 81 },         // fel format → droppas
      ],
      unit: '<img onerror=1>',
      draft: { passId: 'A' }, drafts: { A: { inputBuffer: { A1: { s0: { weight: '"><img>' } } } } },
      importedPRs: [ { name: 'Bench', weight: 'x60' }, { weight: 100 } ],
    });
    await vi.waitFor(() => expect(T.state.log.length).toBe(1));

    expect(T.state.unit).toBe('kg');
    expect(T.state.draft ?? null).toBeNull();
    expect(T.state.drafts?.A).toBeUndefined();
    expect(T.state.weightLog).toEqual([{ date: '2026-07-06', weight: 82.5 }]);

    const s = T.state.log[0].exercises[0].sets[0];
    expect(s.weight).toBeNull();      // strängen koercerad bort
    expect(s.reps).toBe(5);           // legitimt värde intakt
    expect(s.warmup).toBe(false);     // booleaniserad
    expect(T.state.log[0].timestamp).toBeNull();

    const done = T.state.cycles[0].done.A;
    expect(done.date).toBeUndefined();                       // HTML-metatecken → borta
    expect(done.timestamp).toBeNull();
    expect(done.exercises.map(e => e.id)).toEqual(['A1']);   // fientligt ex-id droppat
    const ds = done.exercises[0].sets[0];
    expect(ds.reps).toBeNull();
    expect(ds.weight).toBe(50);
    expect(ds.side).toBeUndefined();  // 'X' utanför L/R-whitelist
    expect(ds.fail).toBe(true);

    expect(T.state.importedPRs).toEqual([{ name: 'Bench', weight: null }]);
  });

  it('en legitim exportfil round-trippar med data intakt', async () => {
    const legit = window.freshState();
    legit.log = [{ passId: 'A', passName: 'Chest + Biceps', timestamp: 1750000000000, duration: 2880000,
      exercises: [{ id: 'A1', exId: 'bench-press', name: 'Bench Press',
        sets: [{ warmup: true, weight: 40, reps: 10 }, { warmup: false, weight: 80, reps: 5, fail: true }, { warmup: false, weight: 75, reps: 6, side: 'L' }] }] }];
    legit.weightLog = [{ date: '2026-07-01', weight: 97.2 }];
    legit.unit = 'lbs';
    importFile(legit);
    await vi.waitFor(() => expect(T.state.log.length).toBe(1));

    const ex = T.state.log[0].exercises[0];
    expect(ex.sets).toEqual([
      { warmup: true, weight: 40, reps: 10 },
      { warmup: false, weight: 80, reps: 5, fail: true },
      { warmup: false, weight: 75, reps: 6, side: 'L' },
    ]);
    expect(T.state.weightLog).toEqual([{ date: '2026-07-01', weight: 97.2 }]);
    expect(T.state.unit).toBe('lbs');
    expect(T.state.log[0].duration).toBe(2880000);
  });

  it('avvisar fil utan cycles/log utan att röra state', async () => {
    const before = T.state;
    importFile({ hello: 'world' });
    // felgrenen är synkron efter FileReader-load — vänta en tick och verifiera oförändrat
    await new Promise(r => setTimeout(r, 50));
    expect(T.state).toBe(before);
  });
});

describe('importTemplate (template-fil, 3.63.2-saneringen på riktiga flödet)', () => {
  it('applicerar kedjestruktur, droppar fientliga id:n, sätter onboardingDone', async () => {
    const origConfirm = window.askModalConfirm;
    window.askModalConfirm = async () => true; // modal-UI ersatt — testet gäller flödet efter OK
    try {
      const tpl = {
        format: 'thechain-template', version: 2,
        sessionOrder: ['A', 'B'],
        sessionNames: { A: 'Push Day', 'bad<img>': 'x' },
        restAfterSessions: [], removedExercises: {}, exerciseSwaps: {}, exerciseRenames: {}, exerciseTags: {},
        addedExercises: { A: [ { id: 'evil<svg>', name: 'Evil' }, { id: 'added_1', name: 'Legit Extra' } ] },
        customExercises: [ { id: 'custom_1', name: 'My Machine Row' }, { id: 'x"y', name: 'Bad' } ],
        personalRecords: [ { name: 'Bench Press', weight: '60', reps: '5' } ],
      };
      const file = new File([JSON.stringify(tpl)], 'template.json', { type: 'application/json' });
      window.importTemplate({ target: { files: [file], value: '' } });
      await vi.waitFor(() => expect(T.state.onboardingDone).toBe(true));

      expect(T.state.sessionOrder).toEqual(['A', 'B']);
      expect(T.state.sessionNameOverrides.A).toBe('Push Day');
      expect(T.state.sessionNameOverrides['bad<img>']).toBeUndefined();
      expect((T.state.addedExercises.A || []).map(e => e.id)).toEqual(['added_1']);
      expect(T.state.customExercises.map(c => c.id)).toEqual(['custom_1']);
      expect(T.state.importedPRs).toEqual([expect.objectContaining({ name: 'Bench Press', weight: 60, reps: 5 })]);
      expect(T.state.cycles.length).toBe(1); // ny cykel startad
    } finally {
      window.askModalConfirm = origConfirm;
    }
  });

  it('avböjd modal lämnar state orört', async () => {
    const origConfirm = window.askModalConfirm;
    window.askModalConfirm = async () => false;
    try {
      // färsk pre-onboarding-state saknar sessionOrder — jämför värdet som det är
      const orderBefore = T.state.sessionOrder;
      const tpl = { format: 'thechain-template', version: 2, sessionOrder: ['A'], sessionNames: {}, restAfterSessions: [], removedExercises: {}, exerciseSwaps: {}, exerciseRenames: {}, exerciseTags: {}, addedExercises: {}, customExercises: [], personalRecords: [] };
      const file = new File([JSON.stringify(tpl)], 'template.json', { type: 'application/json' });
      window.importTemplate({ target: { files: [file], value: '' } });
      await new Promise(r => setTimeout(r, 50));
      expect(T.state.sessionOrder).toEqual(orderBefore);
      expect(T.state.onboardingDone).not.toBe(true);
    } finally {
      window.askModalConfirm = origConfirm;
    }
  });
});
