import { describe, it, expect } from 'vitest';
import { reconcileSets } from '../src/set-reconcile.js';

// Deterministisk sid-mintare för testbarhet
function mkMint() {
  let n = 0;
  return () => 'p' + (n++);
}
// Bygg en lista snabbt: 'w'=warmup, 'k'=work. Stabila sid wu0.. / wk0..
function list(spec) {
  let w = 0, k = 0;
  return spec.split('').map(c =>
    c === 'w' ? { sid: 'wu' + (w++), warmup: true } : { sid: 'wk' + (k++), warmup: false }
  );
}
const counts = sets => ({
  warm: sets.filter(s => s.warmup).length,
  work: sets.filter(s => !s.warmup).length,
});

describe('reconcileSets — vanish/restore (rotfixens kärna)', () => {
  it('uni-buggen: warmup försvann (wu1) → paddas tillbaka', () => {
    // F2 Unilateral Row: ska vara 2 warm + 1 work, men wu1 borta → [wu0, wk0]
    const { sets, padded } = reconcileSets({
      current: list('wk'), targetWarm: 2, targetWork: 1, mintSid: mkMint(),
    });
    expect(counts(sets)).toEqual({ warm: 2, work: 1 });
    expect(padded).toEqual({ warm: 1, work: 0 });
  });

  it('redan på target → ingen padding (idempotent)', () => {
    const cur = list('wwk');
    const { sets, padded } = reconcileSets({
      current: cur, targetWarm: 2, targetWork: 1, mintSid: mkMint(),
    });
    expect(counts(sets)).toEqual({ warm: 2, work: 1 });
    expect(padded).toEqual({ warm: 0, work: 0 });
    expect(sets.map(s => s.sid)).toEqual(cur.map(s => s.sid)); // inga nya sid
  });

  it('work-set tappat → paddas tillbaka', () => {
    const { sets, padded } = reconcileSets({
      current: list('k'), targetWarm: 0, targetWork: 3, mintSid: mkMint(),
    });
    expect(counts(sets)).toEqual({ warm: 0, work: 3 });
    expect(padded.work).toBe(2);
  });

  it('båda kolumner under target → båda paddas', () => {
    const { padded } = reconcileSets({
      current: list('wk'), targetWarm: 3, targetWork: 4, mintSid: mkMint(),
    });
    expect(padded).toEqual({ warm: 2, work: 3 });
  });
});

describe('reconcileSets — locked respekteras (manuellt antal vinner)', () => {
  it('locked → ingen padding ens under target', () => {
    const cur = list('wk');
    const { sets, padded } = reconcileSets({
      current: cur, targetWarm: 2, targetWork: 1, locked: true, mintSid: mkMint(),
    });
    expect(counts(sets)).toEqual({ warm: 1, work: 1 });
    expect(padded).toEqual({ warm: 0, work: 0 });
  });

  it('locked + över target → rörs inte (ingen trim)', () => {
    const { sets } = reconcileSets({
      current: list('wwwkk'), targetWarm: 1, targetWork: 1, locked: true, mintSid: mkMint(),
    });
    expect(counts(sets)).toEqual({ warm: 3, work: 2 });
  });
});

describe('reconcileSets — RAMP strippar warmups', () => {
  it('ramp tar bort alla warmups + rapporterar removed sids', () => {
    const { sets, removed } = reconcileSets({
      current: list('wwk'), targetWarm: 0, targetWork: 4, isRamp: true, mintSid: mkMint(),
    });
    expect(counts(sets).warm).toBe(0);
    expect(removed.sort()).toEqual(['wu0', 'wu1']);
    expect(counts(sets).work).toBe(4); // wk0 + 3 paddade
  });

  it('ramp körs även när locked (swap→ramp ska rensa låst övning)', () => {
    const { sets, removed } = reconcileSets({
      current: list('wk'), targetWork: 4, isRamp: true, locked: true, mintSid: mkMint(),
    });
    expect(removed).toEqual(['wu0']);
    expect(counts(sets)).toEqual({ warm: 0, work: 1 }); // locked → ingen work-pad
  });

  it('ramp som strippar allt + !locked → paddas till targetWork', () => {
    const { sets } = reconcileSets({
      current: list('w'), targetWork: 4, isRamp: true, mintSid: mkMint(),
    });
    expect(counts(sets)).toEqual({ warm: 0, work: 4 });
  });

  it('defensiv: ramp strippar allt + locked → aldrig tom lista', () => {
    const { sets } = reconcileSets({
      current: list('w'), targetWork: 4, isRamp: true, locked: true, mintSid: mkMint(),
    });
    expect(sets.length).toBeGreaterThanOrEqual(1);
    expect(sets.every(s => !s.warmup)).toBe(true);
  });
});

describe('reconcileSets — data-integritet', () => {
  it('befintliga (loggade) set bevaras alltid vid icke-ramp', () => {
    const cur = list('wk');
    const { sets } = reconcileSets({
      current: cur, targetWarm: 2, targetWork: 3, mintSid: mkMint(),
    });
    for (const s of cur) expect(sets.some(x => x.sid === s.sid)).toBe(true);
  });

  it('paddade sid är unika', () => {
    const { sets } = reconcileSets({
      current: list('k'), targetWarm: 3, targetWork: 5, mintSid: mkMint(),
    });
    const sids = sets.map(s => s.sid);
    expect(new Set(sids).size).toBe(sids.length);
  });

  it('targetWarm=0 (bw/bwreps) → inga warmups skapas', () => {
    const { sets } = reconcileSets({
      current: list('kkk'), targetWarm: 0, targetWork: 3, mintSid: mkMint(),
    });
    expect(counts(sets)).toEqual({ warm: 0, work: 3 });
  });

  it('tom/ogiltig current → defensiv work-set (aldrig krasch)', () => {
    expect(reconcileSets({ current: undefined, mintSid: mkMint() }).sets.length).toBeGreaterThanOrEqual(1);
    expect(reconcileSets({ current: [], targetWork: 2, mintSid: mkMint() }).sets.length).toBe(2);
  });
});
