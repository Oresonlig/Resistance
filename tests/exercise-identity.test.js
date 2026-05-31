import { describe, it, expect } from 'vitest';
import {
  slugifyExId,
  canonicalName,
  resolveExId,
  migrateExerciseIdentity,
  BASE_SLOT_DEFAULT_NAME,
} from '../src/exercise-identity.js';

describe('slugifyExId', () => {
  it('slugar namn deterministiskt', () => {
    expect(slugifyExId('Flat BB Bench Press')).toBe('ex_flat_bb_bench_press');
    expect(slugifyExId('Pull-ups (pronated)')).toBe('ex_pull_ups_pronated');
    expect(slugifyExId('Military Press - Smith')).toBe('ex_military_press_smith');
    expect(slugifyExId('Vader (seated)')).toBe('ex_vader_seated');
  });
  it('samma namn → samma id (stabilt)', () => {
    expect(slugifyExId('Deadlift')).toBe(slugifyExId('Deadlift'));
  });
  it('olika övningar → olika id', () => {
    expect(slugifyExId('External Rotator Cuff')).not.toBe(slugifyExId('Internal Rotator Cuff'));
  });
});

describe('canonicalName — alias-upplösning', () => {
  it('mappar bas-program-namn till bibliotek', () => {
    expect(canonicalName('Flat BB')).toBe('Flat BB Bench Press');
    expect(canonicalName('Flat DB')).toBe('Flat DB Press');
    expect(canonicalName('Shrugs')).toBe('DB Shrugs');
    expect(canonicalName('Military Press')).toBe('Military Press (barbell)');
    expect(canonicalName('Pull-ups')).toBe('Pull-ups (pronated)');
  });
  it('löser transitivt (gammalt → mellanled → kanoniskt)', () => {
    expect(canonicalName('Chins or Pullups')).toBe('Pull-ups (pronated)');
    expect(canonicalName('Pull-ups / Chins')).toBe('Pull-ups (pronated)');
  });
  it('slot-specifika tvetydiga legacy-namn', () => {
    expect(canonicalName('Tri-finisher', 'A4')).toBe('Tricep Pushdowns');
    expect(canonicalName('Tri-finisher', 'E4')).toBe('Overhead Tricep Extension');
  });
  it('redan kanoniskt namn lämnas orört', () => {
    expect(canonicalName('Zercher Squat')).toBe('Zercher Squat');
  });
});

describe('resolveExId', () => {
  it('custom-id bevaras (knyts inte till namn)', () => {
    expect(resolveExId('Min grej', 'D2', 'custom_123')).toBe('custom_123');
  });
  it('Flat BB och Flat BB Bench Press → samma exId (rename följer historik)', () => {
    expect(resolveExId('Flat BB')).toBe(resolveExId('Flat BB Bench Press'));
  });
});

describe('BASE_SLOT_DEFAULT_NAME — komplett A1..F4', () => {
  it('har alla 24 slots', () => {
    const slots = ['A','B','C','D','E','F'].flatMap(L=>[1,2,3,4].map(n=>L+n));
    for(const s of slots) expect(BASE_SLOT_DEFAULT_NAME[s]).toBeTruthy();
  });
});

describe('migrateExerciseIdentity — idempotent', () => {
  it('sätter exId på log-entries via namn', () => {
    const state = { log:[{ exercises:[{id:'A1', name:'Flat BB', sets:[]}] }], cycles:[], customExercises:[] };
    const r = migrateExerciseIdentity(state);
    expect(r.changed).toBe(true);
    expect(state.log[0].exercises[0].exId).toBe('ex_flat_bb_bench_press');
  });
  it('andra körningen ändrar inget (idempotent)', () => {
    const state = { log:[{ exercises:[{id:'A1', name:'Flat BB', sets:[]}] }], cycles:[], customExercises:[] };
    migrateExerciseIdentity(state);
    const r2 = migrateExerciseIdentity(state);
    expect(r2.changed).toBe(false);
  });
  it('custom-logg-rad behåller custom-id som exId', () => {
    const state = {
      log:[{ exercises:[{id:'custom_99', name:'Min grej', sets:[]}] }],
      cycles:[], customExercises:[{id:'custom_99', name:'Min grej'}]
    };
    migrateExerciseIdentity(state);
    expect(state.log[0].exercises[0].exId).toBe('custom_99');
  });
  it('Flat BB i A-pass och Flat BB-swap i E-pass delar exId (din scenario)', () => {
    const state = {
      log:[
        { exercises:[{id:'A1', name:'Flat BB', sets:[]}] },         // A-passet
        { exercises:[{id:'E1', name:'Flat BB Bench Press', sets:[]}] }, // E-pass swappad till Flat BB
      ], cycles:[], customExercises:[]
    };
    migrateExerciseIdentity(state);
    expect(state.log[0].exercises[0].exId).toBe(state.log[1].exercises[0].exId);
  });
  it('remappar slot-keyade notes → exId', () => {
    const state = {
      log:[], cycles:[], customExercises:[],
      exerciseNotes:{ 'B4':'tungt nästa gång' },
    };
    migrateExerciseIdentity(state);
    expect(state.exerciseNotes['B4']).toBeUndefined();
    expect(state.exerciseNotes['ex_lat_prayers']).toBe('tungt nästa gång');
  });
  it('perm-swappad slot → note remappas till swap-övningens exId', () => {
    const state = {
      log:[], cycles:[], customExercises:[],
      permanentSwaps:{ 'D2':'Cable Lateral Raises' },
      exerciseNotes:{ 'D2':'eldsjäl' },
    };
    migrateExerciseIdentity(state);
    expect(state.exerciseNotes['ex_cable_lateral_raises']).toBe('eldsjäl');
  });
  it('remappar tombstones (deletions.exerciseNotes)', () => {
    const state = {
      log:[], cycles:[], customExercises:[],
      deletions:{ exerciseNotes:{ 'C1': 1234 } },
    };
    migrateExerciseIdentity(state);
    expect(state.deletions.exerciseNotes['ex_zercher_squat']).toBe(1234);
    expect(state.deletions.exerciseNotes['C1']).toBeUndefined();
  });
  it('redan exId-keyade notes lämnas orörda', () => {
    const state = {
      log:[], cycles:[], customExercises:[],
      exerciseNotes:{ 'ex_deadlift':'redan migrerad' },
    };
    const r = migrateExerciseIdentity(state);
    expect(state.exerciseNotes['ex_deadlift']).toBe('redan migrerad');
    expect(r.changed).toBe(false);
  });
});
