/* =========================================================================
   The Chain — /evosuite/ (3.98.0). Flyttad från /training/ (showEvoSuite),
   där den var en nödlösning kopplad till spelgruppens konto.
   section.js kollar inloggning + åtkomst och skickar 'tc:ready'. Först då hämtas
   appen ur den privata bucketen 'evosuite' (policy: has_section_access('evosuite'))
   och visas i helskärm. Listen under appen: [Download for Windows] [Back to main] [Log out].
   ========================================================================= */
(() => {
  'use strict';
  if (!window.TC) return;
  const { sb, Auth } = window.TC;

  // Nedladdningen visas bara i en Windows-webbläsare. Filen måste finnas i bucketen
  // (EvoSuite.exe). Stäng = sätt false.
  const DOWNLOAD_OPEN = true;

  // Signerad adress i stället för download(): Supabases cache kan annars ge en äldre version.
  async function fetchFile(name) {
    const { data, error } = await sb.storage.from('evosuite').createSignedUrl(name, 60);
    if (error) throw error;
    const response = await fetch(data.signedUrl, { cache: 'no-store' });
    if (!response.ok) throw new Error('HTTP ' + response.status);
    return response.blob();
  }

  // Listans språk följer appens egen inställning; storage-händelsen kommer när det byts i iframen.
  const TEXTS = {
    sv: { download: 'Ladda ner för Windows', fetching: 'Hämtar…', failed: 'Kunde inte hämta filen', home: 'Back to main', signOut: 'Logga ut', loading: 'Laddar EvoSuite…', loadFailed: 'EvoSuite kunde inte laddas. Prova att ladda om sidan.' },
    en: { download: 'Download for Windows', fetching: 'Downloading…', failed: 'Could not get the file', home: 'Back to main', signOut: 'Log out', loading: 'Loading EvoSuite…', loadFailed: 'EvoSuite could not be loaded. Try reloading the page.' },
  };
  const text = () => TEXTS[localStorage.getItem('evosuite-lang') === 'en' ? 'en' : 'sv'];

  function show() {
    if (document.getElementById('evosuite-root')) return;
    const root = document.createElement('div');
    root.id = 'evosuite-root';
    root.style.cssText = 'position:fixed;inset:0;z-index:2147483647;background:#111;color:#eee;font-family:sans-serif;';

    // Egen list under appen, så att knapparna inte hamnar ovanpå EvoSuites slagknapp på mobil.
    const barButton = 'flex:1;border:0;background:#222;color:#bbb;font-size:12px;cursor:pointer;';
    const bar = document.createElement('div');
    bar.style.cssText = 'position:absolute;left:0;right:0;bottom:0;display:flex;gap:1px;height:calc(30px + env(safe-area-inset-bottom));padding-bottom:env(safe-area-inset-bottom);background:#222;';
    const mkButton = () => { const b = document.createElement('button'); b.type = 'button'; b.style.cssText = barButton; return b; };

    const status = document.createElement('div');
    status.style.cssText = 'padding:24px;';
    let statusState = 'loading';
    let download = null;
    let downloadState = 'download';
    const home = mkButton();
    const signOut = mkButton();
    const paint = () => {
      const t = text();
      home.textContent = t.home;
      signOut.textContent = t.signOut;
      if (download) download.textContent = t[downloadState];
      status.textContent = t[statusState];
    };
    window.addEventListener('storage', (e) => { if (e.key === 'evosuite-lang') paint(); });

    if (DOWNLOAD_OPEN && /Windows NT/.test(navigator.userAgent)) {
      download = mkButton();
      download.onclick = async () => {
        download.disabled = true;
        downloadState = 'fetching'; paint();
        try {
          const data = await fetchFile('EvoSuite.exe');
          const link = document.createElement('a');
          link.href = URL.createObjectURL(new Blob([data], { type: 'application/octet-stream' }));
          link.download = 'EvoSuite.exe';
          link.click();
          setTimeout(() => URL.revokeObjectURL(link.href), 60000);
          downloadState = 'download';
        } catch (e) {
          console.error('[evosuite] kunde inte hämta exe-filen:', e);
          downloadState = 'failed';
        } finally {
          download.disabled = false;
          paint();
        }
      };
      bar.append(download);
    }
    home.onclick = () => { location.href = '/'; };
    signOut.onclick = async () => {
      try { await Promise.race([Auth.signOut(), new Promise((r) => setTimeout(r, 4000))]); }
      catch (e) { console.warn('[evosuite] signOut:', e); }
      location.href = '/';
    };
    bar.append(home, signOut);
    paint();
    root.append(status, bar);
    document.body.appendChild(root);

    (async () => {
      try {
        const data = await fetchFile('evosuite.html');
        const html = new Blob([await data.text()], { type: 'text/html' });
        const frame = document.createElement('iframe');
        frame.title = 'EvoSuite';
        frame.src = URL.createObjectURL(html);
        frame.style.cssText = 'position:absolute;left:0;top:0;width:100%;height:calc(100% - 30px - env(safe-area-inset-bottom));border:0;';
        status.remove();
        root.prepend(frame);
      } catch (e) {
        console.error('[evosuite] kunde inte hämta appen:', e);
        statusState = 'loadFailed'; paint();
      }
    })();
  }

  window.addEventListener('tc:ready', show, { once: true });
})();
