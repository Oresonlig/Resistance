import { describe, it, expect } from 'vitest';
import {
  migrateExtrasIds,
  makeExtraEx,
  extraExId,
} from '../src/extras-model.js';

// ── migrateExtrasIds ──────────────────────────────────────────────────────────

describe('migrateExtrasIds — legacy id-tilldelning', () => {
  it('tilldelar index-baserade id på legacy-extras (utan befintligt id)', () => {
    const draft = { passId: 'B', extras: [{ name: 'X' }, { name: 'Y' }] };
    migrateExtrasIds(draft);
    expect(draft.extras[0].id).toBe('extra_B_0');
    expect(draft.extras[1].id).toBe('extra_B_1');
  });

  it('är idempotent — andra körningen ändrar inget', () => {
    const draft = { passId: 'B', extras: [{ name: 'X' }, { name: 'Y' }] };
    migrateExtrasIds(draft);
    const ids = draft.extras.map(e => e.id);
    migrateExtrasIds(draft);
    expect(draft.extras.map(e => e.id)).toEqual(ids);
  });

  it('rör inte redan satta stabila id (t.ex. extra_B_s3_abc)', () => {
    const draft = {
      passId: 'B',
      extras: [
        { id: 'extra_B_s3_abc', name: 'Already' },
        { name: 'Legacy' },
      ],
    };
    migrateExtrasIds(draft);
    expect(draft.extras[0].id).toBe('extra_B_s3_abc');
    expect(draft.extras[1].id).toBe('extra_B_1');
  });

  it('blandat: id satt på [0] men inte [1] — [1] får index-position 1, inte räknare 0', () => {
    const draft = {
      passId: 'B',
      extras: [
        { id: 'extra_B_0', name: 'X' },
        { name: 'Y' },
      ],
    };
    migrateExtrasIds(draft);
    expect(draft.extras[0].id).toBe('extra_B_0');
    expect(draft.extras[1].id).toBe('extra_B_1');
  });

  it('no-op: null draft kraschar inte', () => {
    expect(() => migrateExtrasIds(null)).not.toThrow();
  });

  it('no-op: draft utan passId kraschar inte och ändrar ingenting', () => {
    const draft = { extras: [{ name: 'X' }] };
    migrateExtrasIds(draft);
    expect(draft.extras[0].id).toBeUndefined();
  });

  it('no-op: extras=undefined kraschar inte', () => {
    const draft = { passId: 'B' };
    expect(() => migrateExtrasIds(draft)).not.toThrow();
    expect(draft.extras).toBeUndefined();
  });

  it('no-op: extras är ej array (t.ex. null) kraschar inte', () => {
    const draft = { passId: 'B', extras: null };
    expect(() => migrateExtrasIds(draft)).not.toThrow();
  });

  it('korrupt entry (null i arrayen) hoppas över utan krasch', () => {
    const draft = { passId: 'B', extras: [null, { name: 'Y' }] };
    expect(() => migrateExtrasIds(draft)).not.toThrow();
    expect(draft.extras[1].id).toBe('extra_B_1');
  });

  it('returnerar draft-objektet (för enklare kedjning)', () => {
    const draft = { passId: 'C', extras: [{ name: 'Z' }] };
    expect(migrateExtrasIds(draft)).toBe(draft);
  });
});

// ── makeExtraEx ──────────────────────────────────────────────────────────────

describe('makeExtraEx — syntetiskt ex-objekt', () => {
  it('null entry → null', () => {
    expect(makeExtraEx(null)).toBeNull();
    expect(makeExtraEx(undefined)).toBeNull();
  });

  it('namnlöst entry → null', () => {
    expect(makeExtraEx({ id: 'extra_A_0' })).toBeNull();
    expect(makeExtraEx({ id: 'extra_A_0', name: '' })).toBeNull();
  });

  it('library-övning (ingen custom-match) → alla flaggor false, extra:true, id/name bevarade', () => {
    const result = makeExtraEx({ id: 'extra_A_0', name: 'Incline Cable Flyes' }, []);
    expect(result).toEqual({
      id: 'extra_A_0',
      name: 'Incline Cable Flyes',
      extra: true,
      bw: false,
      ramp: false,
      timed: false,
      uni: false,
      singles: false,
    });
  });

  it('customExercises=undefined → alla flaggor false (inga kraschar)', () => {
    const result = makeExtraEx({ id: 'extra_B_0', name: 'MyEx' }, undefined);
    expect(result.bw).toBe(false);
    expect(result.extra).toBe(true);
  });

  it('custom-match → ärver bw/ramp/timed/uni/singles från custom-defen', () => {
    const customExercises = [
      { id: 'custom_1', name: 'Banded Pull-Apart', bw: true, ramp: false, timed: true, uni: false, singles: true },
    ];
    const result = makeExtraEx({ id: 'extra_C_0', name: 'Banded Pull-Apart' }, customExercises);
    expect(result).toEqual({
      id: 'extra_C_0',
      name: 'Banded Pull-Apart',
      extra: true,
      bw: true,
      ramp: false,
      timed: true,
      uni: false,
      singles: true,
    });
  });

  it('custom-match med partiella flaggor → saknade flaggor tolkas som false (!!undefined)', () => {
    const customExercises = [{ id: 'custom_2', name: 'Plank', timed: true }];
    const result = makeExtraEx({ id: 'extra_D_0', name: 'Plank' }, customExercises);
    expect(result.timed).toBe(true);
    expect(result.bw).toBe(false);
    expect(result.ramp).toBe(false);
    expect(result.uni).toBe(false);
    expect(result.singles).toBe(false);
  });

  it('matchning är exakt på namn — liknande namn matchar inte', () => {
    const customExercises = [{ id: 'custom_3', name: 'Cable Flyes', bw: true }];
    const result = makeExtraEx({ id: 'extra_A_1', name: 'Incline Cable Flyes' }, customExercises);
    expect(result.bw).toBe(false);
  });
});

// ── extraExId ─────────────────────────────────────────────────────────────────

describe('extraExId — kanoniskt exId för extra-övning', () => {
  it('library-övning → namn-slug via resolveExId', () => {
    // 3.68.0 — 'Incline Cable Flyes' är numera alias → 'Incline Flyes (Cable)'
    expect(extraExId('Incline Cable Flyes', [])).toBe('ex_incline_flyes_cable');
  });

  it('alias-namn → resolvar till kanoniskt slug', () => {
    // 'Flat BB' kedjar → 'Flat BB Bench Press' → 'Bench Press (BB)' (3.68.0)
    expect(extraExId('Flat BB', [])).toBe('ex_bench_press_bb');
  });

  it('custom-övning → returnerar custom-id:t (inte namn-slug)', () => {
    const customExercises = [{ id: 'custom_42', name: 'My Special Move' }];
    expect(extraExId('My Special Move', customExercises)).toBe('custom_42');
  });

  it('samma namn med/utan custom-lista → olika resultat', () => {
    const name = 'My Special Move';
    const withCustom = extraExId(name, [{ id: 'custom_7', name }]);
    const withoutCustom = extraExId(name, []);
    expect(withCustom).toBe('custom_7');
    expect(withoutCustom).toBe('ex_my_special_move');
    expect(withCustom).not.toBe(withoutCustom);
  });

  it('customExercises=undefined → namn-slug (ingen krasch)', () => {
    expect(extraExId('Dead Hang', undefined)).toBe('ex_dead_hang');
  });

  it('custom-match kräver custom_-prefix — non-prefixed id ger namn-slug', () => {
    // resolveExId ignorerar existingCustomId om det inte börjar med 'custom_'
    const customExercises = [{ id: 'libid_99', name: 'Some Exercise' }];
    expect(extraExId('Some Exercise', customExercises)).toBe('ex_some_exercise');
  });
});
