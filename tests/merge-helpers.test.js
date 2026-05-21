import { describe, it, expect } from 'vitest';
import {
  mergeLogEntries,
  mergeWeightEntries,
  mergeArrayById,
  mergeKeyedMap,
  mergeArrayUnion,
  mergeMapOfArrays,
  mergeMapOfArrayById,
} from '../src/merge-helpers.js';

// ── mergeLogEntries ──────────────────────────────────────────
describe('mergeLogEntries', () => {
  it('returns empty array for null/undefined inputs', () => {
    expect(mergeLogEntries(null, null)).toEqual([]);
    expect(mergeLogEntries(undefined, undefined)).toEqual([]);
    expect(mergeLogEntries([], [])).toEqual([]);
  });

  it('unions entries from both sides by passId|timestamp', () => {
    const local = [{passId:'A', timestamp:100, foo:'l'}];
    const cloud = [{passId:'B', timestamp:200, foo:'c'}];
    const out = mergeLogEntries(local, cloud);
    expect(out).toHaveLength(2);
    expect(out.map(e=>e.passId).sort()).toEqual(['A','B']);
  });

  it('local wins on collision (same passId+timestamp)', () => {
    const local = [{passId:'A', timestamp:100, src:'local'}];
    const cloud = [{passId:'A', timestamp:100, src:'cloud'}];
    const out = mergeLogEntries(local, cloud);
    expect(out).toHaveLength(1);
    expect(out[0].src).toBe('local');
  });

  it('sorts by timestamp ascending', () => {
    const local = [{passId:'A', timestamp:300}, {passId:'A', timestamp:100}];
    const cloud = [{passId:'A', timestamp:200}];
    const out = mergeLogEntries(local, cloud);
    expect(out.map(e=>e.timestamp)).toEqual([100, 200, 300]);
  });

  it('handles missing timestamp gracefully', () => {
    const local = [{passId:'A'}];
    const cloud = [{passId:'A', timestamp:100}];
    const out = mergeLogEntries(local, cloud);
    expect(out).toHaveLength(2);
  });
});

// ── mergeWeightEntries ───────────────────────────────────────
describe('mergeWeightEntries', () => {
  it('unions by date with local-wins on collision', () => {
    const local = [{date:'2026-05-20', kg:80}];
    const cloud = [{date:'2026-05-20', kg:99}, {date:'2026-05-21', kg:81}];
    const out = mergeWeightEntries(local, cloud);
    expect(out).toHaveLength(2);
    const may20 = out.find(e=>e.date==='2026-05-20');
    expect(may20.kg).toBe(80); // local wins
  });

  it('sorts by date ascending', () => {
    const local = [{date:'2026-05-21'}];
    const cloud = [{date:'2026-05-19'}, {date:'2026-05-20'}];
    const out = mergeWeightEntries(local, cloud);
    expect(out.map(e=>e.date)).toEqual(['2026-05-19','2026-05-20','2026-05-21']);
  });
});

// ── mergeArrayById ───────────────────────────────────────────
describe('mergeArrayById', () => {
  it('unions arrays of objects on id', () => {
    const local = [{id:'a', name:'A-local'}, {id:'b', name:'B-local'}];
    const cloud = [{id:'b', name:'B-cloud'}, {id:'c', name:'C-cloud'}];
    const out = mergeArrayById(local, cloud);
    expect(out).toHaveLength(3);
    const ids = out.map(o=>o.id).sort();
    expect(ids).toEqual(['a','b','c']);
  });

  it('cloud wins per id on conflict', () => {
    const local = [{id:'x', name:'local'}];
    const cloud = [{id:'x', name:'cloud'}];
    const out = mergeArrayById(local, cloud);
    expect(out).toHaveLength(1);
    expect(out[0].name).toBe('cloud');
  });

  it('preserves local-only ids (pending creates skyddade)', () => {
    const local = [{id:'pending', name:'new'}];
    const cloud = [];
    const out = mergeArrayById(local, cloud);
    expect(out).toHaveLength(1);
    expect(out[0].id).toBe('pending');
  });

  it('skips items without id', () => {
    const local = [{id:'a'}, {name:'orphan'}];
    const cloud = [{id:'b'}];
    const out = mergeArrayById(local, cloud);
    expect(out).toHaveLength(2);
  });

  it('handles null/undefined inputs', () => {
    expect(mergeArrayById(null, null)).toEqual([]);
    expect(mergeArrayById(undefined, [{id:'a'}])).toEqual([{id:'a'}]);
  });

  it('supports custom idKey', () => {
    const local = [{passId:'A', val:1}];
    const cloud = [{passId:'A', val:2}];
    const out = mergeArrayById(local, cloud, 'passId');
    expect(out).toHaveLength(1);
    expect(out[0].val).toBe(2); // cloud wins
  });

  // Trade-off-test: dokumenterar att deletes kan återuppstå
  it('TRADE-OFF: delete from other device återuppstår om lokal har gamla data', () => {
    const local = [{id:'will-be-deleted', name:'X'}, {id:'keep', name:'Y'}];
    const cloud = [{id:'keep', name:'Y'}]; // andra enheten har raderat X
    const out = mergeArrayById(local, cloud);
    expect(out).toHaveLength(2); // X återuppstår — accepterad trade-off
  });
});

// ── mergeKeyedMap ────────────────────────────────────────────
describe('mergeKeyedMap', () => {
  it('merges two objects, cloud overrides per key', () => {
    const local = {a:1, b:2};
    const cloud = {b:99, c:3};
    expect(mergeKeyedMap(local, cloud)).toEqual({a:1, b:99, c:3});
  });

  it('handles null inputs', () => {
    expect(mergeKeyedMap(null, {a:1})).toEqual({a:1});
    expect(mergeKeyedMap({a:1}, null)).toEqual({a:1});
    expect(mergeKeyedMap(null, null)).toEqual({});
  });
});

// ── mergeArrayUnion ──────────────────────────────────────────
describe('mergeArrayUnion', () => {
  it('unions primitives without duplicates', () => {
    expect(mergeArrayUnion(['a','b'], ['b','c']).sort()).toEqual(['a','b','c']);
  });

  it('preserves both sides for non-overlapping', () => {
    expect(mergeArrayUnion([1,2], [3,4]).sort()).toEqual([1,2,3,4]);
  });

  it('handles null inputs', () => {
    expect(mergeArrayUnion(null, ['a'])).toEqual(['a']);
    expect(mergeArrayUnion(null, null)).toEqual([]);
  });
});

// ── mergeMapOfArrays ─────────────────────────────────────────
describe('mergeMapOfArrays', () => {
  it('unions arrays per key', () => {
    const local = {pass1:['a','b'], pass2:['x']};
    const cloud = {pass1:['b','c'], pass3:['y']};
    const out = mergeMapOfArrays(local, cloud);
    expect(out.pass1.sort()).toEqual(['a','b','c']);
    expect(out.pass2).toEqual(['x']);
    expect(out.pass3).toEqual(['y']);
  });

  it('handles null inputs', () => {
    expect(mergeMapOfArrays(null, {a:[1]})).toEqual({a:[1]});
    expect(mergeMapOfArrays({}, {})).toEqual({});
  });
});

// ── mergeMapOfArrayById ──────────────────────────────────────
describe('mergeMapOfArrayById', () => {
  it('unions per-key with id-dedup inside arrays', () => {
    const local = {pass1:[{id:'e1', name:'L'}, {id:'e2', name:'L2'}]};
    const cloud = {pass1:[{id:'e2', name:'C2'}, {id:'e3', name:'C3'}]};
    const out = mergeMapOfArrayById(local, cloud);
    expect(out.pass1).toHaveLength(3);
    const e2 = out.pass1.find(x=>x.id==='e2');
    expect(e2.name).toBe('C2'); // cloud wins per id
  });

  it('preserves local-only key (pending pass creates)', () => {
    const local = {newPass:[{id:'a'}]};
    const cloud = {};
    const out = mergeMapOfArrayById(local, cloud);
    expect(out.newPass).toHaveLength(1);
  });
});
