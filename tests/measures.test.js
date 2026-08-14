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
  it('har 12 mätsätt', () => {
    expect(MEASURE_KEYS).toEqual(['weight','bw','bwreps','timed','bwtimed','cardio','cardiosprint','run','runsprint','carry','inclinecardio','sauna']);
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
  // 3.87.1 — VÄNDNING mot tidigare spec. Dead Hangs slot-data har alltid burit
  // bw+timed, men `timed` vann och vikten föll bort → man kunde inte logga en
  // hängning med bälte. Kombinationen måste testas före enbart timed.
  it('bw+timed (Dead Hang) → bwtimed', () => expect(measureFromFlags({ bw: true, timed: true })).toBe('bwtimed'));
});

describe('bwtimed — viktat häng/håll (3.87.1)', () => {
  it('PR-metriken är tiden, inte vikten', () => {
    expect(prValue('bwtimed', { secs: 62, extra: 10 })).toBe(62);
  });
  it('längre häng vinner även med mindre vikt', () => {
    expect(prValue('bwtimed', { secs: 75, extra: 0 }))
      .toBeGreaterThan(prValue('bwtimed', { secs: 60, extra: 20 }));
  });
  it('lika tid → mer vikt vinner via tiebreak', () => {
    expect(prTiebreak('bwtimed', { secs: 60, extra: 20 }))
      .toBeGreaterThan(prTiebreak('bwtimed', { secs: 60, extra: 5 }));
  });
  it('fail-markerat set bär ingen PR', () => {
    expect(prValue('bwtimed', { secs: 90, extra: 10, fail: true })).toBe(null);
  });
  it('gammalt Dead Hang-set utan extra fungerar oförändrat', () => {
    expect(prValue('bwtimed', { secs: 45 })).toBe(45);
    expect(prTiebreak('bwtimed', { secs: 45 })).toBe(0);
  });
  it('bär bodyweight-layout och tar båda fälten', () => {
    expect(MEASURES.bwtimed.bw).toBe(true);
    expect(MEASURES.bwtimed.fields).toEqual(['extra', 'secs']);
  });
  it('är INTE minInput — sekunder matas in rått, som timed', () => {
    expect(MEASURES.bwtimed.minInput).toBeUndefined();
  });
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

// 3.84.0 — löpning. Pace är den enda PR-metriken där "bättre" betyder LÄGRE tid;
// den löses genom att lagra hastighet (km/h) så jämförelsen förblir "högre vinner".
describe('prValue — pace (run/runsprint)', () => {
  it('run → km/h: 10 km på 50 min = 12 km/h', () => {
    expect(prValue('run', { secs: 3000, dist: 10 })).toBeCloseTo(12, 6);
  });
  it('runsprint mäts på pace, INTE på sprintantal', () => {
    expect(prValue('runsprint', { secs: 1800, dist: 6, sprints: 8 })).toBeCloseTo(12, 6);
  });
  it('snabbare tid på samma distans ger HÖGRE värde (så PR-motorns v>cur._v håller)', () => {
    const slow = prValue('run', { secs: 3600, dist: 10 });
    const fast = prValue('run', { secs: 3000, dist: 10 });
    expect(fast).toBeGreaterThan(slow);
  });
  it('saknad distans → ingen PR', () => expect(prValue('run', { secs: 3000 })).toBe(null));
  it('saknad tid → ingen PR', () => expect(prValue('run', { dist: 10 })).toBe(null));
  it('noll-värden ger aldrig Infinity', () => {
    expect(prValue('run', { secs: 0, dist: 10 })).toBe(null);
    expect(prValue('run', { secs: 3000, dist: 0 })).toBe(null);
  });
  it('failat set räknas ej', () => expect(prValue('run', { secs: 3000, dist: 10, fail: true })).toBe(null));
});

describe('prTiebreak', () => {
  it('weight tie → reps', () => expect(prTiebreak('weight', { weight: 100, reps: 8 })).toBe(8));
  it('secs tie → last', () => expect(prTiebreak('timed', { secs: 30, weight: 10, extra: 5 })).toBe(15));
  it('sprints → ingen tiebreak (0)', () => expect(prTiebreak('cardiosprint', { sprints: 5 })).toBe(0));
  it('pace tie → längre distans vinner', () => {
    expect(prTiebreak('run', { secs: 3000, dist: 10 })).toBe(10);
    expect(prTiebreak('runsprint', { secs: 1800, dist: 6, sprints: 8 })).toBe(6);
  });
});
