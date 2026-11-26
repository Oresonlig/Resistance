/* =========================================================================
   The Chain — /diet/ (3.99.0). Basketly enligt EvoSuite-modellen (kopia av
   /evosuite/evosuite.js). Kontrakt med Basketly-projektet (Niklas "kör" 2026-11-26):
   - Privat bucket 'basketly', EN fil 'basketly.html' (fristående bundle).
     Läs: has_section_access('diet'). Skriv: bara basketly-uploader, låst till filnamnet.
   - Bundlen körs i en blob-iframe (samma origin) och använder window.parent.TC.sb
     (supabase-js v2). Den anropar ALDRIG signOut — utloggning sker i listen här.
   - Listen: [Back to main] [Log out], fasta engelska texter.
   Saknas filen i bucketen ligger sidans "Coming soon" kvar (inget överlägg).
   Ändring av filnamn/bucket/TC-API = kontraktsändring → meddela Basketly-sessionen.
   ========================================================================= */
(() => {
  'use strict';
  if (!window.TC) return;
  const { sb, Auth } = window.TC;

  const BUCKET = 'basketly';
  const FILE = 'basketly.html';
  const TEXT = { home: 'Back to main', signOut: 'Log out', loadFailed: 'Basketly could not be loaded. Try reloading the page.' };

  // Signerad adress i stället för download(): Supabases cache kan annars ge en äldre version.
  // null = filen finns inte (ännu) i bucketen.
  async function fetchApp() {
    const { data, error } = await sb.storage.from(BUCKET).createSignedUrl(FILE, 60);
    if (error) {
      if (/not.?found/i.test(error.message || '')) return null;
      throw error;
    }
    const response = await fetch(data.signedUrl, { cache: 'no-store' });
    if (response.status === 404) return null;
    if (!response.ok) throw new Error('HTTP ' + response.status);
    return response.text();
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

  window.addEventListener('tc:ready', async () => {
    try {
      const html = await fetchApp();
      if (html === null) return;   // inte publicerad än → "Coming soon" står kvar
      show(html);
    } catch (e) {
      console.error('[basketly] kunde inte hämta appen:', e);
      const line = document.querySelector('.tc-line');
      if (line) line.textContent = TEXT.loadFailed;
    }
  }, { once: true });
})();
