// @vitest-environment jsdom
// PM5 Option B — end-to-end-tester av stateful flöden i index.html (riktiga koden,
// inte src/-speglar). Se app-harness.js för hur appen bootas.
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
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

describe('measure följer swappad övning 3.77.0 (getEffectiveEx delad resolver)', () => {
  // Rotorsak gymnotes 2026-07-18: effEx kollade bara customExercises → inswappad
  // BIBLIOTEKS-övning föll tillbaka till slottens ex och ärvde dess bw-flagga.
  it('biblioteksövning inswappad i BW-slot får measure=weight, inte bw', async () => {
    window.ensureDraft('F');
    const f1 = window.getEffectiveChain().find(p => p.id === 'F').exercises[0]; // Pull-ups, bw:true
    expect(f1.bw).toBe(true);
    await window.doSwap(f1.id, 'Seated Row (Cable)', 'F');

    const effEx = window.getEffectiveEx(f1);
    expect(effEx.name).toBe('Seated Row (Cable)');
    expect(!!effEx.bw).toBe(false); // slottens bw-flagga ärvs INTE
    const exId = window.getRenderExId(f1.id);
    expect(window.getMeasure(exId, effEx)).toBe('weight');
  });

  it('biblioteksövning med explicit measure inswappad → dess measure vinner', async () => {
    window.ensureDraft('F');
    const f2 = window.getEffectiveChain().find(p => p.id === 'F').exercises[1]; // Unilateral Row, ej bw
    await window.doSwap(f2.id, 'Chins (supinated)', 'F'); // library: measure:'bw'

    const exId = window.getRenderExId(f2.id);
    expect(window.getMeasure(exId, window.getEffectiveEx(f2))).toBe('bw');
  });

  it('custom-övnings flaggor vinner fortfarande vid swap (regression 3.54.0)', async () => {
    window.ensureDraft('F');
    T.state.customExercises = [{ id:'c1', name:'My Timed Thing', timed:true, cat:'Other' }];
    const f3 = window.getEffectiveChain().find(p => p.id === 'F').exercises[2];
    await window.doSwap(f3.id, 'My Timed Thing', 'F');

    const exId = window.getRenderExId(f3.id);
    expect(window.getMeasure(exId, window.getEffectiveEx(f3))).toBe('timed');
  });

  it('oswappad slot behåller sin egen flagga (Pull-ups förblir bw)', () => {
    window.ensureDraft('F');
    const f1 = window.getEffectiveChain().find(p => p.id === 'F').exercises[0];
    const exId = window.getRenderExId(f1.id) || f1.id;
    expect(window.getMeasure(exId, window.getEffectiveEx(f1))).toBe('bw');
  });
});

describe('undoSession/deleteLogEntry tombstones 3.77.1 (undo-dubblett-rotfixen)', () => {
  function finishFullSession(passId){
    window.ensureDraft(passId);
    const pass = window.getEffectiveChain().find(p => p.id === passId);
    pass.exercises.forEach(ex => saveDone(ex, [ {...WORK} ]));
    window.finishSession(passId);
  }

  it('undoSession skriver tombstone för den urplockade loggposten', () => {
    finishFullSession('A');
    const ts = T.state.log[0].timestamp;

    window.undoSession('A');

    expect(T.state.log.length).toBe(0);
    expect(T.state.deletions.log[`A|${ts}`]).toBeTruthy();
    // re-finish ger EN post (draften återställdes i done-state)
    window.finishSession('A');
    expect(T.state.log.length).toBe(1);
    expect(T.state.log[0].timestamp).not.toBe(ts);
  });

  it('deleteLogEntry: bekräftad delete tar bort posten + skriver tombstone', async () => {
    finishFullSession('A');
    const ts = T.state.log[0].timestamp;
    const orig = window.askModalConfirm;
    window.askModalConfirm = async () => true;
    try { await window.deleteLogEntry(0); }
    finally { window.askModalConfirm = orig; }

    expect(T.state.log.length).toBe(0);
    expect(T.state.deletions.log[`A|${ts}`]).toBeTruthy();
  });

  it('deleteLogEntry: avböjd bekräftelse är no-op', async () => {
    finishFullSession('A');
    const orig = window.askModalConfirm;
    window.askModalConfirm = async () => false;
    try { await window.deleteLogEntry(0); }
    finally { window.askModalConfirm = orig; }

    expect(T.state.log.length).toBe(1);
    expect(Object.keys(T.state.deletions.log||{}).length).toBe(0);
  });
});

describe('importData (backup-fil, 3.65.0-saneringen på riktiga flödet)', () => {
  // 3.68.1 — importData kräver numera bekräftelse (Fable-fynd #2); stubba som doSwap-testerna
  let origConfirm;
  beforeEach(() => { origConfirm = window.askModalConfirm; window.askModalConfirm = async () => true; });
  afterEach(() => { window.askModalConfirm = origConfirm; });

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

  it('avbruten confirm lämnar state orört (3.68.1 fynd #2)', async () => {
    window.askModalConfirm = async () => false;
    const before = T.state;
    importFile({ ...window.freshState(), log: [{ passId:'A', exercises: [] }] });
    await new Promise(r => setTimeout(r, 50));
    expect(T.state).toBe(before);
  });

  it('sanerar kedjestruktur-fälten — 3.63.2-vektorn via backup (3.68.1 fynd #1)', async () => {
    const evil = window.freshState();
    evil.log = [{ passId:'A', exercises: [] }];
    evil.addedExercises = {
      A: [ { id: "added_1", name: 'Legit' }, { id: "x'),alert(1),('", name: 'Evil' } ],
      "B'><img>": [ { id: 'added_2', name: 'DroppasMedNyckeln' } ],
    };
    evil.customExercises = [
      { id: 'custom_9', name: 'Legit Custom' },
      { id: "custom_'),alert(1),('", name: 'Evil Custom' },
    ];
    evil.permanentSwaps = { A1: 'Bench Press (DB)', "D2'><svg>": 'x' };
    evil.exerciseOrder = { A: ['A1', "bad'id"], "C<svg>": ['C1'] };
    evil.exerciseNotes = { ex_deadlift: 'ok', "ex_')</textarea><script>": 'evil' };
    importFile(evil);
    await vi.waitFor(() => expect(T.state.addedExercises.A?.length).toBe(1));

    expect(T.state.addedExercises.A[0].id).toBe('added_1');
    expect(Object.keys(T.state.addedExercises)).toEqual(['A']);
    expect(T.state.customExercises.map(c => c.id)).toEqual(['custom_9']);
    expect(Object.keys(T.state.permanentSwaps)).toEqual(['A1']);
    expect(T.state.exerciseOrder.A).toEqual(['A1']);
    expect(Object.keys(T.state.exerciseOrder)).toEqual(['A']);
    expect(Object.keys(T.state.exerciseNotes)).toEqual(['ex_deadlift']);
  });

  it('smugglade migrations-flaggor och schemaVersion neutraliseras (3.68.1 fynd #3)', async () => {
    const f = window.freshState();
    f.log = [{ passId:'A', exercises: [] }];
    f.schemaVersion = 99;
    f.migrations = { framtida_flagga_v9: Date.now(), exerciseSplit_v2: 'inte-ett-nummer', libraryUniform_v1: 1234 };
    f.lastSyncedCloudTime = Date.now() + 999999;
    f.lastSyncedCloudISO = '2099-01-01T00:00:00Z';
    importFile(f);
    await vi.waitFor(() => expect(T.state.log.length).toBe(1));

    expect(T.state.schemaVersion).toBe(2);                       // clampat till SCHEMA_VERSION
    expect(T.state.migrations.framtida_flagga_v9).toBeUndefined(); // okänd flagga droppad
    expect(T.state.migrations.libraryUniform_v1).toBe(1234);      // känd numerisk flagga behålls
    // exerciseSplit_v2 var icke-numerisk → droppad → migrationen kördes om och satte den själv
    expect(typeof T.state.migrations.exerciseSplit_v2).toBe('number');
    // 3.68.1 fynd #4: filens synk-tidsstämplar nollställda → nästa sync gör riktig merge
    expect(T.state.lastSyncedCloudTime).toBe(0);
    expect(T.state.lastSyncedCloudISO ?? null).toBeNull();
  });
});

describe('Settings-hubben (3.66.0)', () => {
  it('hubb → undersida → tillbaka, och fil-inputarna finns statiskt', () => {
    T.currentUser = { id: 'u1', name: 'Test' };
    window.renderData();
    const view = document.getElementById('view-data');
    expect(view.innerHTML).toContain("openSettingsPage('training')");
    expect(view.innerHTML).toContain("openSettingsPage('data')");

    window.openSettingsPage('training');
    expect(view.innerHTML).toContain('Rest Timer');
    expect(view.innerHTML).toContain('Custom Exercises');
    expect(view.innerHTML).toContain('closeSettingsPage()');
    expect(view.innerHTML).not.toContain("openSettingsPage('appearance')"); // inte hubben längre

    window.openSettingsPage('data');
    expect(view.innerHTML).toContain('Sync Status');
    expect(view.innerHTML).toContain('Reset all data');

    window.closeSettingsPage();
    expect(view.innerHTML).toContain("openSettingsPage('appearance')"); // hubben igen

    // Fil-inputarna är statiska i body (onboarding-import var latent död utan detta)
    expect(document.getElementById('obImportFile')).toBeTruthy();
    expect(document.getElementById('importTemplateFile')).toBeTruthy();
    expect(document.getElementById('importFile')).toBeTruthy();
    T.currentUser = null;
  });

  it('Help-vyn (3.67.0): alla ämnen renderas, accordion öppnar/stänger', () => {
    T.currentUser = { id: 'u1', name: 'Test' };
    window.openSettingsPage('help');
    const view = document.getElementById('view-data');
    // innerHTML serialiserar & som &amp; — normalisera titeln likadant
    T.HELP_TOPICS.forEach(t => expect(view.innerHTML).toContain(t.title.replace(/&/g, '&amp;')));
    expect(view.innerHTML).not.toContain('help-body'); // allt stängt initialt

    window.toggleHelpTopic('swap');
    expect(view.innerHTML).toContain('your program is unchanged'); // temp-swap-förklaringen synlig
    window.toggleHelpTopic('swap');
    expect(view.innerHTML).not.toContain('help-body'); // stängd igen

    window.closeSettingsPage();
    T.currentUser = null;
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

describe('ramp-vanish-incidenten 2026-07-12/13 (3.75.0)', () => {
  // B3 = Unilateral Row (Cable). Med ramp-override + warmup-carry-forward föddes
  // övningen med warmups som nästa ensureExtraSets åt upp (inkl. buffer/loggat).

  it('rotfix: ramp-taggad övning föds UTAN warmups trots warmup-carry-forward', () => {
    const exId = window.getRenderExId('B3') || 'B3';
    T.state.exerciseTagOverrides = { [exId]: { uni: false, ramp: true } }; // 3.76.0: kanoniskt nycklad
    T.state.lastSessionSetCount = { [exId]: 1 };
    T.state.lastSessionWarmupCount = { [exId]: 1 }; // exakt incident-datat

    window.ensureExtraSets('B3', 'B');

    const sets = T.state.draft.extraSets['B3'];
    expect(sets.some(s => s.warmup)).toBe(false); // ingen warmup född
    expect(sets.filter(s => !s.warmup).length).toBe(1);
    // Andra anropet (= "+ Work Set"-ögonblicket) ändrar ingenting — ingen strip kvar att göra
    const before = sets.map(s => s.sid);
    window.ensureExtraSets('B3', 'B');
    expect(T.state.draft.extraSets['B3'].map(s => s.sid)).toEqual(before);
  });

  it('skyddsnät: loggad warmup överlever ramp-strippen, ologgad strippas', () => {
    const exId = window.getRenderExId('B3') || 'B3';
    T.state.exerciseTagOverrides = { [exId]: { uni: false, ramp: true } }; // 3.76.0: kanoniskt nycklad
    window.ensureDraft('B');
    // Pre-fix-draft: warmups födda före fixen, wu0 hann loggas
    T.state.draft.extraSets['B3'] = [
      { sid: 'wu0', warmup: true }, { sid: 'wu1', warmup: true }, { sid: 'wk0', warmup: false },
    ];
    T.state.draft.loggedSets = { B3: { wu0: { weight: 40, reps: 10 } } };
    T.state.draft.inputBuffer = { B3: { wu0: { weight: 40 }, wu1: { weight: 35 } } };

    window.ensureExtraSets('B3', 'B');

    const sids = T.state.draft.extraSets['B3'].map(s => s.sid);
    expect(sids).toContain('wu0');       // loggad → helig
    expect(sids).not.toContain('wu1');   // ologgad → strippad (självläkning)
    expect(sids).toContain('wk0');
    expect(T.state.draft.loggedSets.B3.wu0).toEqual({ weight: 40, reps: 10 }); // data intakt
    expect(T.state.draft.inputBuffer.B3.wu1).toBeUndefined(); // strippad sid städad
  });

  it('toggleExTag wipear INTE en manuellt formad (setEdited) set-lista', () => {
    window.ensureDraft('B');
    window.ensureExtraSets('B3', 'B');
    // Användaren lägger till ett set manuellt → setEdited (addWorkSet-formen)
    T.state.draft.extraSets['B3'].push({ sid: 's_manual', warmup: false });
    T.state.draft.setEdited = { B3: true };
    const before = T.state.draft.extraSets['B3'].map(s => s.sid);

    window.toggleExTag('B3', 'B', 'bw'); // primary ändras (uni → bw) — förr: extraSets raderades

    expect(T.state.draft.extraSets['B3']).toBeDefined();
    expect(T.state.draft.extraSets['B3'].map(s => s.sid)).toEqual(before);
  });
});

describe('tagg-arkitekturen 3.76.0 — taggar följer övningen, inte slotten', () => {
  it('inswappad bibliotek-övning ärver INTE slottens ramp/bw-flaggor', () => {
    // A1 bas = Bench Press (BB) med ramp:true i programmet. Perm-swap till
    // Cable Crossover (bibliotek, inga flaggor) → ramp ska INTE ärvas.
    T.state.permanentSwaps = { A1: 'Cable Crossover' };
    const ex = window.getEffectiveChain().find(p => p.id === 'A').exercises.find(e => e.id === 'A1');
    expect(!!ex.ramp).toBe(true);                     // slotten HAR flaggan...
    expect(window.getTagActive(ex, 'ramp')).toBe(false); // ...men den tränade övningen ärver inte
    expect(window.getPrimaryTag(ex)).toBe(null);
  });

  it('utan swap gäller slottens flaggor precis som förut', () => {
    const ex = window.getEffectiveChain().find(p => p.id === 'A').exercises.find(e => e.id === 'A1');
    expect(window.getTagActive(ex, 'ramp')).toBe(true);
    expect(window.getPrimaryTag(ex)).toBe('ramp');
  });

  it('toggleExTag skriver på kanoniskt exId — overriden följer övningen', () => {
    T.state.permanentSwaps = { A1: 'Cable Crossover' };
    window.ensureDraft('A');
    window.toggleExTag('A1', 'A', 'uni');
    expect(T.state.exerciseTagOverrides.A1).toBeUndefined();      // INTE slot-nycklad
    const canon = window.getRenderExId('A1');
    expect(T.state.exerciseTagOverrides[canon]?.uni).toBe(true);  // kanoniskt nycklad
    // Samma övning inswappad i ANNAN slot ser samma override
    T.state.permanentSwaps.E1 = 'Cable Crossover';
    const exE1 = window.getEffectiveChain().find(p => p.id === 'E').exercises.find(e => e.id === 'E1');
    expect(window.getTagActive(exE1, 'uni')).toBe(true);
  });

  it('rekeyTagOverridesToExId: slot-nycklar migreras till kanoniskt exId, extra_ lämnas', () => {
    T.state.permanentSwaps = { A1: 'Cable Crossover' };
    T.state.exerciseTagOverrides = {
      A1: { ramp: false, bw: true },        // slot med swap → ex_cable_crossover
      B3: { uni: false },                    // slot utan swap → ex_unilateral_row_cable
      extra_A_0: { timed: true },            // session-scope → orörd
      ex_deadlift: { singles: true },        // redan kanonisk → orörd
    };
    window.rekeyTagOverridesToExId();
    const m = T.state.exerciseTagOverrides;
    expect(m.A1).toBeUndefined();
    expect(m.B3).toBeUndefined();
    expect(m.ex_cable_crossover).toEqual({ ramp: false, bw: true });
    expect(m.ex_unilateral_row_cable).toEqual({ uni: false });
    expect(m.extra_A_0).toEqual({ timed: true });
    expect(m.ex_deadlift).toEqual({ singles: true });
  });
});
