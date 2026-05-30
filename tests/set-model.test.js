import { describe, it, expect, beforeEach } from 'vitest';
import {
  nextSid,
  _resetSidCounter,
  makeSet,
  ensureSetIds,
  sortSetsForDisplay,
  labelSets,
} from '../src/set-model.js';

beforeEach(() => _resetSidCounter());

describe('nextSid / makeSet', () => {
  it('genererar unika id:n', () => {
    const a = nextSid(), b = nextSid(), c = nextSid();
    expect(new Set([a, b, c]).size).toBe(3);
  });
  it('makeSet sätter sid + warmup-flagga', () => {
    const s = makeSet(true);
    expect(s.warmup).toBe(true);
    expect(typeof s.sid).toBe('string');
  });
});

describe('ensureSetIds', () => {
  it('tilldelar sid till legacy-sets utan id', () => {
    const out = ensureSetIds([{ warmup: true }, { warmup: false }]);
    expect(out.every(s => typeof s.sid === 'string')).toBe(true);
    expect(out.map(s => s.warmup)).toEqual([true, false]);
  });
  it('är idempotent — bevarar befintliga sid', () => {
    const first = ensureSetIds([{ warmup: true }, { warmup: false }]);
    const second = ensureSetIds(first);
    expect(second.map(s => s.sid)).toEqual(first.map(s => s.sid));
  });
  it('hanterar tom/undefined input', () => {
    expect(ensureSetIds(undefined)).toEqual([]);
    expect(ensureSetIds([])).toEqual([]);
  });
});

describe('sortSetsForDisplay — fixar #4', () => {
  it('flyttar warmups först oavsett lagrings-ordning', () => {
    // Det buggande fallet: ramp/bw-övning där warmup pushats SIST i arrayen
    const stored = [makeSet(false), makeSet(true), makeSet(true)];
    const sorted = sortSetsForDisplay(stored);
    expect(sorted.map(s => s.warmup)).toEqual([true, true, false]);
  });
  it('bevarar inbördes ordning inom work-gruppen (stabil)', () => {
    const w1 = makeSet(false), w2 = makeSet(false), w3 = makeSet(false);
    const sorted = sortSetsForDisplay([w1, w2, w3]);
    expect(sorted.map(s => s.sid)).toEqual([w1.sid, w2.sid, w3.sid]);
  });
  it('muterar inte input-arrayen', () => {
    const stored = [makeSet(false), makeSet(true)];
    const copy = [...stored];
    sortSetsForDisplay(stored);
    expect(stored).toEqual(copy);
  });
});

describe('labelSets — skärm och copy är aldrig oense', () => {
  it('numrerar W/S i display-ordning, inte lagrings-ordning', () => {
    // Lagrat [work, warm, warm] → display ska bli W1,W2,S1
    const stored = [makeSet(false), makeSet(true), makeSet(true)];
    const labels = labelSets(stored).map(s => s.label);
    expect(labels).toEqual(['W1', 'W2', 'S1']);
  });
  it('ger korrekt löpnummer för blandade set', () => {
    const stored = [makeSet(true), makeSet(false), makeSet(false)];
    const labels = labelSets(stored).map(s => s.label);
    expect(labels).toEqual(['W1', 'S1', 'S2']);
  });
});

describe('P1 — sid är stabilt under filtrering (regression)', () => {
  it('ett sets loggade värde följer sid, inte position, när warmups filtreras bort', () => {
    // Simulerar ensureExtraSets ramp-filtrering: ta bort warmups mitt i flödet.
    const sets = [makeSet(true), makeSet(false), makeSet(false)];
    const workSid = sets[1].sid;
    // Logga "Set 1" (första work-setet) — keyat på sid, inte index 1
    const logged = { [workSid]: { weight: 100, reps: 6 } };
    // Ramp-filtret tar bort warmups → arrayen reindexeras (work blir index 0)
    const filtered = sets.filter(s => !s.warmup);
    // Det loggade värdet ska fortfarande hittas via sid — INTE försvinna
    expect(logged[filtered[0].sid]).toEqual({ weight: 100, reps: 6 });
  });
});
