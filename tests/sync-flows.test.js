// @vitest-environment jsdom
// Synk-lagret end-to-end (3.62.0 läs-före-skriv + CAS, 3.64.0 server-RPC) mot
// mockad fetch. Moln-mocken emulerar write_app_state_cas-RPC:ns semantik exakt
// (SYNC_CAS_SERVER_SPEC.md): expected===radens updated_at annars cas_conflict,
// null-expected = insert som konfliktar om raden redan finns.
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { bootApp, resetState } from './app-harness.js';

const T = bootApp();
const UID = 'test-user';
let realFetch;

function installCloud(initialRow = null){
  const calls = { pulls: 0, writes: [] };
  let row = initialRow;            // {data, updated_at} — "raden" i app_state
  let failPulls = false;
  let alwaysConflict = false;
  let afterPullOnce = null;        // interleaving-hook: körs EFTER nästa pull-svar
  let tick = 0;
  const ok = (body) => new Response(JSON.stringify(body), { status: 200, headers: { 'Content-Type': 'application/json' } });
  window.fetch = async (url, opts = {}) => {
    const u = String(url);
    if (u.includes('/rpc/write_app_state_cas')){
      const body = JSON.parse(opts.body);
      calls.writes.push(body);
      const expected = body.p_expected_updated_at ?? null;
      const matches = row ? expected === row.updated_at : expected === null;
      if (alwaysConflict || !matches)
        return new Response(JSON.stringify({ code: 'P0001', message: 'cas_conflict' }), { status: 400 });
      row = { data: body.p_data, updated_at: new Date(Date.now() + (++tick)).toISOString() };
      return ok([{ id: UID, data: row.data, updated_at: row.updated_at }]);
    }
    if (u.includes('/rest/v1/app_state')){
      calls.pulls++;
      if (failPulls) return new Response('boom', { status: 500 });
      const resp = ok(row ? [{ data: row.data, updated_at: row.updated_at }] : []);
      if (afterPullOnce){ const fn = afterPullOnce; afterPullOnce = null; fn(); }
      return resp;
    }
    return ok([]);
  };
  return {
    calls,
    get row(){ return row; }, set row(v){ row = v; },
    failPulls(v){ failPulls = v; },
    alwaysConflict(v){ alwaysConflict = v; },
    afterNextPull(fn){ afterPullOnce = fn; },
  };
}

// Bygg en moln-state-blob (komplett state så cloud-newer-grenens replace fungerar)
function cloudState(mut = {}){
  const s = { ...window.freshState(), appVersion: T.APP_VERSION, ...mut };
  delete s.draft; delete s.drafts; // moln-blobbar innehåller aldrig drafts (SL6)
  return s;
}
function logEntry(passId, ts){
  return { passId, passName: 'Session ' + passId, timestamp: ts, duration: null,
    exercises: [{ id: passId + '1', exId: 'ex-' + passId.toLowerCase(), name: 'Ex ' + passId,
      sets: [{ warmup: false, weight: 50, reps: 8 }] }] };
}

beforeEach(() => {
  realFetch = window.fetch;
  resetState();
  T.currentUser = { id: UID, name: 'Test' };
});
afterEach(() => {
  clearTimeout(T.pushRetryTimer); // döda ev. schemalagd backoff-retry
  window.fetch = realFetch;
});

describe('syncFromCloud (pull)', () => {
  it('tom molnrad: öppnar gaten + rensar CAS-referensen (insert-väg)', async () => {
    const cloud = installCloud(null);
    T.state.lastSyncedCloudISO = '2020-01-01T00:00:00Z'; // stale referens ska rensas
    await window.syncFromCloud(UID);
    expect(T.cloudSeen).toBe(true);
    expect(T.state.lastSyncedCloudISO).toBeNull();
    expect(cloud.calls.pulls).toBe(1);
    expect(T.lastSyncRead).toBeGreaterThan(0);
  });

  it('nyare molnrad: state ersätts, lokala log-entries mergas in, CAS-referens = radens updated_at', async () => {
    const localEntry = logEntry('A', 1000);
    T.state.log = [localEntry];
    const cloudEntry = logEntry('B', 2000);
    const iso = new Date(Date.now() + 5000).toISOString();
    installCloud({ data: cloudState({ log: [cloudEntry], onboardingDone: true }), updated_at: iso });

    await window.syncFromCloud(UID);

    const keys = T.state.log.map(e => e.passId + '|' + e.timestamp).sort();
    expect(keys).toEqual(['A|1000', 'B|2000']); // entry-nivå-merge, ingen förlust åt något håll
    expect(T.state.onboardingDone).toBe(true);  // moln-blobben vann state-nivån
    expect(T.state.lastSyncedCloudISO).toBe(iso);
    expect(T.state.lastSyncedCloudTime).toBe(new Date(iso).getTime());
  });

  it('P4-tombstone: lokalt raderad note återuppstår INTE från molnet', async () => {
    T.state.deletions = { customExercises: {}, exerciseNotes: { 'bench-press': Date.now() } };
    const iso = new Date(Date.now() + 5000).toISOString();
    installCloud({ data: cloudState({ exerciseNotes: { 'bench-press': 'öka 2.5kg' }, onboardingDone: true }), updated_at: iso });

    await window.syncFromCloud(UID);

    expect(T.state.exerciseNotes['bench-press']).toBeUndefined();
    expect(T.state.deletions.exerciseNotes['bench-press']).toBeTruthy(); // tombstonen kvar
  });

  it('device-lokala drafts överlever cloud-replace (SL6)', async () => {
    window.ensureDraft('A');
    T.state.draft.savedExercises['A1'] = { id: 'A1', name: 'x', sets: [{ weight: 1, reps: 1 }] };
    const iso = new Date(Date.now() + 5000).toISOString();
    installCloud({ data: cloudState({ onboardingDone: true }), updated_at: iso });

    await window.syncFromCloud(UID);

    expect(T.state.draft?.savedExercises?.['A1']).toBeTruthy();
    expect(T.state.drafts['A']).toBe(T.state.draft);
  });

  it('parallella anrop koalesceras till EN pull (3.62.0 SL3)', async () => {
    const cloud = installCloud(null);
    const p1 = window.syncFromCloud(UID);
    const p2 = window.syncFromCloud(UID);
    expect(p2).toBe(p1); // samma promise — ingen tyst skip, ingen dubbel pull
    await p1;
    expect(cloud.calls.pulls).toBe(1);
  });

  it('misslyckad pull: gaten förblir stängd + felet loggas', async () => {
    const cloud = installCloud(null);
    cloud.failPulls(true);
    await window.syncFromCloud(UID);
    expect(T.cloudSeen).toBe(false);
    expect(T.lastSyncError).toMatch(/^Pull failed/);
  });
});

describe('pushState (läs-före-skriv-gate + CAS)', () => {
  it('blockeras helt när ingen molnläsning lyckats denna session', async () => {
    const cloud = installCloud(null);
    cloud.failPulls(true);
    T.state.log = [logEntry('A', 1000)]; // icke-fresh

    await window.pushState();

    expect(cloud.calls.writes.length).toBe(0);
    expect(T.lastSyncError).toBe('Not synced yet — changes saved locally');
  });

  it('vägrar pusha fresh state (skydd mot att tom enhet skriver över molnet)', async () => {
    const cloud = installCloud(null);
    T.cloudSeen = true; // även med öppen gate
    await window.pushState();
    expect(cloud.calls.writes.length).toBe(0);
    expect(cloud.calls.pulls).toBe(0); // fresh-guarden ligger FÖRE pull
  });

  it('första push: insert-väg (expected=null), drafts exkluderade, serverns updated_at blir CAS-referens', async () => {
    const cloud = installCloud(null);
    T.state.log = [logEntry('A', 1000)];
    window.ensureDraft('A'); // device-lokalt, ska INTE följa med

    await window.pushState();

    expect(cloud.calls.writes.length).toBe(1);
    const w = cloud.calls.writes[0];
    expect(w.p_expected_updated_at).toBeNull();
    expect('draft' in w.p_data).toBe(false);
    expect('drafts' in w.p_data).toBe(false);
    expect(w.p_data.log.length).toBe(1);
    expect(w.p_data.appVersion).toBe(T.APP_VERSION);
    expect(T.state.lastSyncedCloudISO).toBe(cloud.row.updated_at);
    expect(T.lastSyncWrite).toBeGreaterThan(0);
    expect(T.lastSyncError).toBe('');
  });

  it('uppföljande push CAS:ar på senast sedda updated_at', async () => {
    const cloud = installCloud(null);
    T.state.log = [logEntry('A', 1000)];
    await window.pushState();
    const isoAfterFirst = T.state.lastSyncedCloudISO;

    T.state.log.push(logEntry('B', 2000));
    await window.pushState();

    expect(cloud.calls.writes.length).toBe(2);
    expect(cloud.calls.writes[1].p_expected_updated_at).toBe(isoAfterFirst);
    expect(cloud.row.data.log.length).toBe(2);
  });

  it('CAS-konflikt: pull+merge → retry EN gång → båda enheternas data i molnet', async () => {
    // Etablera synkat läge (vår enhet har skrivit rad v1)
    const cloud = installCloud(null);
    T.state.log = [logEntry('A', 1000)];
    await window.pushState();
    expect(cloud.calls.writes.length).toBe(1);

    // Racet CAS finns för: "annan enhet" skriver rad v2 EFTER vår pull-before-push
    // men FÖRE vår skrivning (sekventiellt går det inte att träffa på annat sätt —
    // pull-before-push löser redan fallet där v2 fanns innan vi började).
    const otherIso = new Date(Date.now() + 60000).toISOString();
    cloud.afterNextPull(() => {
      cloud.row = { data: cloudState({ log: [logEntry('A', 1000), logEntry('B', 2000)], onboardingDone: true }), updated_at: otherIso };
    });

    T.state.log.push(logEntry('C', 3000));
    await window.pushState();

    expect(cloud.calls.writes.length).toBe(3); // initial + konfliktad + lyckad retry
    expect(cloud.calls.writes[2].p_expected_updated_at).toBe(otherIso); // retry CAS:ar mot v2
    const cloudKeys = cloud.row.data.log.map(e => e.passId).sort();
    expect(cloudKeys).toEqual(['A', 'B', 'C']); // ingen enhets data förlorad
    expect(T.state.lastSyncedCloudISO).toBe(cloud.row.updated_at);
  });

  it('konflikt som består efter merge: ger upp efter EN retry, ingen oändlig loop', async () => {
    const cloud = installCloud(null);
    T.state.log = [logEntry('A', 1000)];
    await window.pushState();

    cloud.alwaysConflict(true);
    T.state.log.push(logEntry('B', 2000));
    await window.pushState();

    expect(cloud.calls.writes.length).toBe(3); // 1 lyckad + konflikt + EN retry, sen stopp
    expect(T.lastSyncError).toMatch(/^Push failed/);
    expect(T.pushRetries).toBe(1); // backoff schemalagd (städas i afterEach)
  });
});

describe('keepaliveCloudPush (pagehide-vägen)', () => {
  it('skriver INGET när gaten är stängd', async () => {
    const cloud = installCloud(null);
    T.state.log = [logEntry('A', 1000)];
    expect(T.cloudSeen).toBe(false);
    window.keepaliveCloudPush();
    await new Promise(r => setTimeout(r, 20));
    expect(cloud.calls.writes.length).toBe(0);
  });

  it('skriver via RPC:n med CAS-referens när gaten är öppen', async () => {
    const cloud = installCloud(null);
    T.state.log = [logEntry('A', 1000)];
    await window.pushState(); // öppnar gate + sätter CAS-referens
    const iso = T.state.lastSyncedCloudISO;
    window.ensureDraft('A'); // får inte läcka med i keepalive-payload heller

    T.state.log.push(logEntry('B', 2000));
    window.keepaliveCloudPush();
    await vi.waitFor(() => expect(cloud.calls.writes.length).toBe(2));

    const w = cloud.calls.writes[1];
    expect(w.p_expected_updated_at).toBe(iso);
    expect('draft' in w.p_data).toBe(false);
    expect('drafts' in w.p_data).toBe(false);
    expect(cloud.row.data.log.length).toBe(2);
  });
});
