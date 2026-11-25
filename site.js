/* =========================================================================
   The Chain — delad kod för landningssidan (/) och sektionssidorna (/diet/, /misc/).
   3.97.0. Träningsappen (/training/) har sin egen klient men SAMMA Supabase-projekt
   och samma localStorage-nyckel (supabase-js default) → en inloggning gäller alla.

   Laddas EFTER /vendor/supabase.js och FÖRE landing.js / sektionssidans kod.
   ========================================================================= */
(() => {
  'use strict';

  // ---------- 1. Vidarebefordran från roten (körs innan klienten skapas) ----------
  // Mejllänkar (bekräfta konto, återställ lösenord) från MK2-appen och äldre
  // hemsideversioner har redirect till ROTEN. Träningsappen äger det flödet
  // (PASSWORD_RECOVERY-UI:t) → skicka länken vidare med hash + query intakta.
  // MK1-appens skal (TheChainShell) laddar roten → rakt till träningsappen,
  // där bryggan till MK2-appen bor.
  if (location.pathname === '/') {
    const h = location.hash, s = location.search;
    const authLink = /(^|[#&])(access_token|error|error_description|type)=/.test(h) || /[?&](code|token_hash)=/.test(s);
    if (authLink || /TheChainShell\//.test(navigator.userAgent)) {
      location.replace('/training/' + s + h);
      window.TC_REDIRECTING = true;
      return;
    }
  }

  // ---------- 2. Supabase ----------
  // Anon-nyckeln är publik (samma som i /training/), skyddet är RLS.
  const SB_URL = 'https://qjmjqideqrgozexudaqr.supabase.co';
  const SB_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFqbWpxaWRlcXJnb3pleHVkYXFyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzYwOTIwODQsImV4cCI6MjA5MTY2ODA4NH0.byRwDswpbfMWDoln4n7Opp0ntrNis_du4EnLVMFuIp8';
  const sb = window.supabase.createClient(SB_URL, SB_KEY, {
    auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true },
  });

  // Mottagare för "Request access"-mejlet. TOM = mejlprogrammet öppnas med ämne och
  // text ifyllda men utan mottagare. Niklas fyller i adressen själv.
  const ACCESS_REQUEST_TO = '';

  const SECTIONS = {
    training: { name: 'Training', kicker: '01 · Void', href: '/training/', signup: true,
      desc: 'Log sets and rounds, run rest timers, and build your chain of exercises one session at a time.' },
    diet:     { name: 'Diet', kicker: '02 · Understory', href: '/diet/', signup: true,
      desc: 'Shop good groceries at good prices, and find recipes to cook with them.' },
    misc:     { name: 'Misc', kicker: '03 · Undertow', href: '/misc/', signup: false,
      desc: 'Hobby projects from the workshop, starting with a controller for the home audio system.' },
  };

  /** Fel → 'invalid_credentials' | 'email_not_confirmed' | 'network' | 'other' */
  function classify(err) {
    if (!err) return 'other';
    if (err.code === 'invalid_credentials') return 'invalid_credentials';
    if (err.code === 'email_not_confirmed') return 'email_not_confirmed';
    if (err.name === 'AuthRetryableFetchError' || err.status === 0 || err instanceof TypeError) return 'network';
    if (err.status === 400 && /invalid login/i.test(err.message || '')) return 'invalid_credentials';
    return 'other';
  }
  const fail = (err) => {
    const e = err instanceof Error ? err : new Error(String((err && err.message) || err));
    e.kind = classify(err);
    throw e;
  };

  const Auth = {
    /** @returns {Promise<{email:string}|null>} */
    async getUser() {
      const { data } = await sb.auth.getSession();
      const u = data && data.session && data.session.user;
      return u ? { email: u.email } : null;
    },

    async signInWithPassword(email, password) {
      let res;
      try { res = await sb.auth.signInWithPassword({ email, password }); } catch (e) { fail(e); }
      if (res.error) fail(res.error);
      return { email: res.data.user.email };
    },

    /** Display name blank → e-postadressen (Niklas 2026-11-25). */
    async signUp(email, password, displayName, returnTo) {
      let res;
      try {
        res = await sb.auth.signUp({ email, password, options: {
          emailRedirectTo: location.origin + returnTo,
          data: { display_name: displayName || email },
        } });
      } catch (e) { fail(e); }
      if (res.error) fail(res.error);
    },

    async signInWithGoogle(returnTo) {
      const { error } = await sb.auth.signInWithOAuth({ provider: 'google',
        options: { redirectTo: location.origin + returnTo } });
      if (error) fail(error);
    },

    async signOut() { await sb.auth.signOut(); },

    /** Sektioner användaren får gå in i. Server-side: my_sections() (security definer,
     *  läser sections.open_to_all + section_access). Fel/saknad funktion → bara Training,
     *  som är öppen för alla konton. Spärren för sektionens DATA är RLS, inte detta. */
    async getAccess() {
      try {
        const { data, error } = await sb.rpc('my_sections');
        if (error || !Array.isArray(data)) return ['training'];
        return Object.keys(SECTIONS).filter((k) => data.includes(k));
      } catch (e) { return ['training']; }
    },

    /** Öppnar användarens mejlprogram med en färdig förfrågan. */
    requestAccess(section, account) {
      const name = SECTIONS[section].name;
      const subject = encodeURIComponent(`Access request: ${name}`);
      const body = encodeURIComponent(`Hi!\n\nI'd like access to ${name}.\nMy account: ${account || ''}\n`);
      location.href = `mailto:${ACCESS_REQUEST_TO}?subject=${subject}&body=${body}`;
    },

    /** Återställningslänken landar i träningsappen, som har UI:t för nytt lösenord. */
    async resetPassword(email) {
      let res;
      try { res = await sb.auth.resetPasswordForEmail(email, { redirectTo: location.origin + '/training/' }); } catch (e) { fail(e); }
      if (res.error) fail(res.error);
    },
  };

  // ---------- 3. Partiklar (panelerna, inloggningen och sektionssidorna) ----------
  const PARTICLES = { desktop: 7, mobile: 5 };
  const mqMobile = matchMedia('(max-width: 760px)');
  const reduce = matchMedia('(prefers-reduced-motion: reduce)');
  function seedParticles() {
    const n = mqMobile.matches ? PARTICLES.mobile : PARTICLES.desktop;
    document.querySelectorAll('.tc-fx').forEach((fx) => {
      fx.textContent = '';
      if (reduce.matches) return;
      const kind = fx.closest('[data-section]').dataset.section;
      for (let i = 0; i < n; i++) {
        const p = document.createElement('span');
        p.className = 'tc-p';
        const size = kind === 'training' ? 2 + (i % 3) : kind === 'diet' ? 3 + (i % 4) : 5 + (i * 3) % 10;
        const base = kind === 'training' ? 8 : kind === 'diet' ? 13 : 11;   // sekunder att stiga
        p.style.setProperty('--x', `${8 + (84 / n) * i + ((i * 7) % 9)}%`);
        p.style.setProperty('--s', `${size}px`);
        p.style.setProperty('--d', `${base + (i % 5)}s`);
        p.style.setProperty('--dl', `-${(i * 1.7).toFixed(1)}s`);
        fx.appendChild(p);
      }
    });
  }
  mqMobile.addEventListener('change', seedParticles);
  reduce.addEventListener('change', seedParticles);

  window.TC = { sb, Auth, SECTIONS, seedParticles, mqMobile };
})();
