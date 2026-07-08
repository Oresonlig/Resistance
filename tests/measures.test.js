import { describe, it, expect } from 'vitest';
import {
  MEASURES,
  MEASURE_KEYS,
  measureFromFlags,
  resolveMeasure,
  prValue,
  prTiebreak,
} from '../src/measures.js';

describe('MEASURES registry', () => {
  it('har 9 mätsätt', () => {
    expect(MEASURE_KEYS).toEqual(['weight','bw','bwreps','timed','cardio','cardiosprint','carry','inclinecardio','sauna']);
  });
  it('varje measure har fields + pr', () => {
    for (const k of MEASURE_KEYS) {
      expect(Array.isArray(MEASURES[k].fields)).toBe(true);
      expect(typeof MEASURES[k].pr).toBe('string');
    }
  });
});

describe('measureFromFlags — bakåtkompat', () => {
  it('default = weight', () => expect(measureFromFlags({})).toBe('weight'));
  it('null → weight', () => expect(measureFromFlags(null)).toBe('weight'));
  it('bw-flagga → bw', () => expect(measureFromFlags({ bw: true })).toBe('bw'));
  it('timed-flagga → timed', () => expect(measureFromFlags({ timed: true })).toBe('timed'));
  it('bw+timed (Dead Hang) → timed (spec)', () => expect(measureFromFlags({ bw: true, timed: true })).toBe('timed'));
});

describe('resolveMeasure — prioritet', () => {
  const lib = { ex_bike_cardio: 'cardio', ex_ab_wheel: 'bwreps' };
  it('override vinner över allt', () => {
    expect(resolveMeasure('ex_bike_cardio', { measure: 'weight' }, { ex_bike_cardio: 'cardiosprint' }, lib)).toBe('cardiosprint');
  });
  it('library-default när ingen override', () => {
    expect(resolveMeasure('ex_bike_cardio', null, {}, lib)).toBe('cardio');
  });
  it('ex.measure när ej i library', () => {
    expect(resolveMeasure('ex_x', { measure: 'carry' }, {}, lib)).toBe('carry');
  });
  it('faller till flaggor → weight', () => {
    expect(resolveMeasure('ex_unknown', {}, {}, lib)).toBe('weight');
  });
  it('ignorerar ogiltig override', () => {
    expect(resolveMeasure('ex_ab_wheel', null, { ex_ab_wheel: 'nonsense' }, lib)).toBe('bwreps');
  });
});

describe('prValue — PR-metrik per measure', () => {
  it('weight → vikt', () => expect(prValue('weight', { weight: 100, reps: 5 })).toBe(100));
  it('bw → extra + bodyweight', () => expect(prValue('bw', { extra: 15, bwSnap: 98, reps: 5 })).toBe(113));
  it('bwreps → reps', () => expect(prValue('bwreps', { reps: 20 })).toBe(20));
  it('timed → secs', () => expect(prValue('timed', { secs: 45 })).toBe(45));
  it('cardio → dist', () => expect(prValue('cardio', { secs: 1200, dist: 8 })).toBe(8));
  it('cardiosprint → sprints', () => expect(prValue('cardiosprint', { secs: 600, sprints: 12 })).toBe(12));
  it('carry → vikt', () => expect(prValue('carry', { weight: 80, distm: 40 })).toBe(80));
  it('inclinecardio → dist', () => expect(prValue('inclinecardio', { incline: 12, secs: 1800, dist: 3.2 })).toBe(3.2));
  it('sauna → secs', () => expect(prValue('sauna', { temp: 90, secs: 900 })).toBe(900));
  it('fail räknas ej', () => expect(prValue('weight', { weight: 100, fail: true })).toBe(null));
  it('tomt fält → null', () => expect(prValue('bwreps', {})).toBe(null));
});

describe('prTiebreak', () => {
  it('weight tie → reps', () => expect(prTiebreak('weight', { weight: 100, reps: 8 })).toBe(8));
  it('secs tie → last', () => expect(prTiebreak('timed', { secs: 30, weight: 10, extra: 5 })).toBe(15));
  it('sprints → ingen tiebreak (0)', () => expect(prTiebreak('cardiosprint', { sprints: 5 })).toBe(0));
});
