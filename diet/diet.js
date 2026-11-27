/* =========================================================================
   The Chain — /diet/ (3.99.0). Basketly enligt EvoSuite-modellen (kopia av
   /evosuite/evosuite.js). Kontrakt med Basketly-projektet (Niklas "kör" 2026-11-26):
   - Privat bucket 'basketly', EN fil 'basketly.html' (fristående bundle).
     Läs: has_section_access('diet'). Skriv: bara basketly-uploader, låst till filnamnet
     (+ img/dish|bg/*.webp sedan Basketlys 04_images.sql).
   - Bundlen körs i en blob-iframe (samma origin) och använder window.parent.TC.sb
     (supabase-js v2). Den anropar ALDRIG signOut — utloggning sker i listen här.
   - Listen: [Back to main] [Log out], fasta engelska texter.
   Ändring av filnamn/bucket/TC-API = kontraktsändring → meddela Basketly-sessionen.

   3.102.0 (Niklas "kör" 2026-11-27):
   - Överlägg "Loading Basketly…" medan filen hämtas. "Coming soon" visas BARA när filen saknas.
   - Cache i IndexedDB 'tc-basketly-cache' (ägs av loadern, bundlen rör den inte; Basketlys
     bilder ligger i dess egen 'basketly-img'). Först list() → objektets eTag/updated_at;
     samma version som i cachen → cachad kopia direkt, annars signerad URL (no-store) + spara.
     INTE Cache API: sw.js raderar alla andra cachar vid activate.
   - Varje utloggning på hemsidan raderar cachen (3.102.1: site.js Auth.signOut +
     clearSiteCaches i /training/). Byter DB-namnet → uppdatera båda listorna.
   ========================================================================= */
(() => {
  'use strict';
  if (!window.TC) return;
  const { sb, Auth } = window.TC;

  const BUCKET = 'basketly';
  const FILE = 'basketly.html';
  const TEXT = { home: 'Back to main', signOut: 'Log out', loading: 'Loading Basketly…',
    loadFailed: 'Basketly could not be loaded. Try reloading the page.' };

  // ---------- cache (IndexedDB) ----------
  const DB = 'tc-basketly-cache';
  const STORE = 'files';

  function openDb() {
    return new Promise((resolve, reject) => {
      const req = indexedDB.open(DB, 1);
      req.onupgradeneeded = () => req.result.createObjectStore(STORE);
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });
  }
  // Varje anrop öppnar och STÄNGER databasen, så att deleteDatabase vid utloggning inte blockeras.
  async function idb(mode, fn) {
    const db = await openDb();
    try {
      return await new Promise((resolve, reject) => {
        const tx = db.transaction(STORE, mode);
        const req = fn(tx.objectStore(STORE));
        tx.oncomplete = () => resolve(req && req.result);
        tx.onerror = () => reject(tx.error);
        tx.onabort = () => reject(tx.error);
      });
    } finally { db.close(); }
  }
  const cacheGet = () => idb('readonly', (s) => s.get(FILE)).catch((e) => { console.warn('[basketly] cache read:', e); return null; });
  const cachePut = (v) => idb('readwrite', (s) => s.put(v, FILE)).catch((e) => console.warn('[basketly] cache write:', e));

  // ---------- hämtning ----------
  /** Objektets version ur bucketen. null = filen finns inte; undefined = gick inte att avgöra. */
  async function remoteVersion() {
    const { data, error } = await sb.storage.from(BUCKET).list('', { search: FILE, limit: 100 });
    if (error) { console.warn('[basketly] list:', error.message, error.statusCode || error.status || ''); return undefined; }
    const item = (data || []).find((o) => o.name === FILE);
    if (!item) { console.warn('[basketly] list: ' + FILE + ' not in bucket (or not readable)'); return null; }
    return (item.metadata && item.metadata.eTag) || item.updated_at || undefined;
  }

  // Signerad adress i stället för download(): Supabases cache kan annars ge en äldre version.
  // null = filen finns inte (ännu) i bucketen.
  async function download() {
    const { data, error } = await sb.storage.from(BUCKET).createSignedUrl(FILE, 60);
    if (error) {
      // 3.101.1: logga alltid — "not found" kan också vara RLS som nekar (Storage skiljer inte på dem).
      console.warn('[basketly] createSignedUrl:', error.message, error.statusCode || error.status || '');
      if (/not.?found/i.test(error.message || '')) return null;
      throw error;
    }
    const response = await fetch(data.signedUrl, { cache: 'no-store' });
    if (response.status === 404) { console.warn('[basketly] signed URL gave 404'); return null; }
    if (!response.ok) throw new Error('HTTP ' + response.status);
    return response.text();
  }

  async function fetchApp() {
    const version = await remoteVersion();
    if (version === null) return null;
    if (version !== undefined) {
      const cached = await cacheGet();
      if (cached && cached.version === version && typeof cached.html === 'string') return cached.html;
    }
    const html = await download();
    // Versionen lästes FÖRE hämtningen → filen är minst så ny. Laddas en ny upp däremellan
    // sparas den under den äldre versionen och hämtas om nästa gång. Ofarligt.
    if (html !== null && version !== undefined) await cachePut({ version, html });
    return html;
  }

  // ---------- UI ----------
  function loadingOverlay() {
    const gate = document.querySelector('.tc-gate');
    if (!gate) return { remove() {} };
    const el = document.createElement('div');
    el.className = 'dl-loading';
    el.setAttribute('role', 'status');
    const ring = document.createElement('span');
    ring.className = 'dl-ring';
    ring.setAttribute('aria-hidden', 'true');
    const text = document.createElement('p');
    text.className = 'dl-text';
    text.textContent = TEXT.loading;
    el.append(ring, text);
    gate.append(el);
    return el;
  }

  function show(html) {
    if (document.getElementById('basketly-root')) return;
    const root = document.createElement('div');
    root.id = 'basketly-root';
    root.style.cssText = 'position:fixed;inset:0;z-index:2147483647;background:#111;color:#eee;font-family:sans-serif;';

    // Egen list under appen, så att knapparna inte hamnar ovanpå appens egna kontroller på mobil.
    const barButton = 'flex:1;border:0;background:#222;color:#bbb;font-size:12px;cursor:pointer;';
    const bar = document.createElement('div');
    bar.style.cssText = 'position:absolute;left:0;right:0;bottom:0;display:flex;gap:1px;height:calc(30px + env(safe-area-inset-bottom));padding-bottom:env(safe-area-inset-bottom);background:#222;';
    const mkButton = (label) => { const b = document.createElement('button'); b.type = 'button'; b.style.cssText = barButton; b.textContent = label; return b; };

    const home = mkButton(TEXT.home);
    const signOut = mkButton(TEXT.signOut);
    home.onclick = () => { location.href = '/'; };
    signOut.onclick = async () => {
      // Auth.signOut (site.js) raderar 'tc-basketly-cache' före utloggningen.
      try { await Promise.race([Auth.signOut(), new Promise((r) => setTimeout(r, 4000))]); }
      catch (e) { console.warn('[basketly] signOut:', e); }
      location.href = '/';
    };
    bar.append(home, signOut);

    const frame = document.createElement('iframe');
    frame.title = 'Basketly';
    frame.src = URL.createObjectURL(new Blob([html], { type: 'text/html' }));
    frame.style.cssText = 'position:absolute;left:0;top:0;width:100%;height:calc(100% - 30px - env(safe-area-inset-bottom));border:0;';

    root.append(frame, bar);
    document.body.appendChild(root);
  }

  // section.js tar bort data-checking och skickar tc:ready i samma takt → överlägget
  // och den dolda "Coming soon"-raden är på plats innan sidan målas.
  window.addEventListener('tc:ready', async () => {
    const line = document.querySelector('.tc-line');
    if (line) line.hidden = true;
    const overlay = loadingOverlay();
    try {
      const html = await fetchApp();
      if (html === null) { if (line) line.hidden = false; return; }   // inte publicerad → "Coming soon"
      show(html);
    } catch (e) {
      console.error('[basketly] kunde inte hämta appen:', e);
      if (line) { line.textContent = TEXT.loadFailed; line.hidden = false; }
    } finally {
      overlay.remove();
    }
  }, { once: true });
})();
